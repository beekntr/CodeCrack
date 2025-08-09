import Docker from 'dockerode';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ITestCase } from '../models/Problem';
import { ITestResult, ISubmissionResult } from '../models/Submission';

export interface ExecutionConfig {
  timeLimit: number; // milliseconds
  memoryLimit: number; // MB
  language: 'python' | 'cpp' | 'javascript' | 'java';
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  memoryUsage: number;
  timedOut: boolean;
}

class CodeExecutionService {
  private docker: Docker;
  private tempDir: string;

  constructor() {
    this.docker = new Docker();
    this.tempDir = path.join(process.cwd(), 'temp');
    this.ensureTempDir();
  }

  private async ensureTempDir(): Promise<void> {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  private getLanguageConfig(language: string): {
    image: string;
    fileExtension: string;
    compileCommand?: string;
    runCommand: string;
  } {
    const configs = {
      python: {
        image: 'codecrack/python-executor:latest',
        fileExtension: '.py',
        runCommand: 'python /code/solution.py'
      },
      javascript: {
        image: 'codecrack/javascript-executor:latest',
        fileExtension: '.js',
        runCommand: 'node /code/solution.js'
      },
      cpp: {
        image: 'codecrack/cpp-executor:latest',
        fileExtension: '.cpp',
        compileCommand: 'g++ -o /code/solution /code/solution.cpp -std=c++17',
        runCommand: '/code/solution'
      },
      java: {
        image: 'codecrack/java-executor:latest',
        fileExtension: '.java',
        compileCommand: 'javac -d /code /code/Solution.java',
        runCommand: 'java -cp /code Solution'
      }
    };

    return configs[language as keyof typeof configs];
  }

  private async writeCodeToFile(code: string, language: string, sessionId: string): Promise<string> {
    const config = this.getLanguageConfig(language);
    const sessionDir = path.join(this.tempDir, sessionId);
    await fs.mkdir(sessionDir, { recursive: true });

    let filename = `solution${config.fileExtension}`;
    if (language === 'java') {
      // Java requires the filename to match the public class name
      filename = 'Solution.java';
      // Ensure the code has the correct class name
      code = code.replace(/public\s+class\s+\w+/g, 'public class Solution');
    }

    const filePath = path.join(sessionDir, filename);
    await fs.writeFile(filePath, code);
    
    return sessionDir;
  }

  private async executeInContainer(
    sessionDir: string,
    language: string,
    input: string,
    config: ExecutionConfig
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const langConfig = this.getLanguageConfig(language);
    
    try {
      const container = await this.docker.createContainer({
        Image: langConfig.image,
        Cmd: ['/bin/sh', '-c', `
          cd /code && 
          ${langConfig.compileCommand ? `${langConfig.compileCommand} && ` : ''}
          echo '${input.replace(/'/g, "'\\''")}' | timeout ${Math.ceil(config.timeLimit / 1000)} ${langConfig.runCommand}
        `],
        WorkingDir: '/code',
        HostConfig: {
          AutoRemove: true,
          Memory: config.memoryLimit * 1024 * 1024, // Convert MB to bytes
          CpuQuota: 50000, // Limit CPU usage
          NetworkMode: 'none', // No network access
          Binds: [`${sessionDir.replace(/\\/g, '/')}:/code`],
          Tmpfs: {
            '/tmp': 'rw,noexec,nosuid,size=100m'
          }
        },
        AttachStdout: true,
        AttachStderr: true
      });

      await container.start();

      const stream = await container.attach({
        stream: true,
        stdout: true,
        stderr: true
      });

      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      const result = await container.wait();
      const endTime = Date.now();
      
      const output = Buffer.concat(chunks).toString();
      const [stdout, stderr] = this.parseDockerOutput(output);

      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: result.StatusCode,
        executionTime: endTime - startTime,
        memoryUsage: 0, // Docker doesn't provide real-time memory usage easily
        timedOut: result.StatusCode === 124 // timeout exit code
      };

    } catch (error) {
      const endTime = Date.now();
      console.error('Container execution error:', error);
      
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Unknown execution error',
        exitCode: 1,
        executionTime: endTime - startTime,
        memoryUsage: 0,
        timedOut: false
      };
    }
  }

  private parseDockerOutput(output: string): [string, string] {
    // Docker multiplexes stdout and stderr with 8-byte headers
    // Format: [stream_type, 0, 0, 0, size_byte1, size_byte2, size_byte3, size_byte4, payload...]
    // stream_type: 1=stdout, 2=stderr
    
    let stdout = '';
    let stderr = '';
    let i = 0;
    
    while (i < output.length) {
      if (i + 8 > output.length) break;
      
      const streamType = output.charCodeAt(i);
      const size = (output.charCodeAt(i + 4) << 24) + 
                   (output.charCodeAt(i + 5) << 16) + 
                   (output.charCodeAt(i + 6) << 8) + 
                   output.charCodeAt(i + 7);
      
      if (i + 8 + size > output.length) break;
      
      const payload = output.substr(i + 8, size);
      
      if (streamType === 1) {
        stdout += payload;
      } else if (streamType === 2) {
        stderr += payload;
      }
      
      i += 8 + size;
    }
    
    // Fallback: if parsing fails, try simple approach
    if (!stdout && !stderr) {
      // Remove common Docker control characters and extract actual content
      const cleaned = output.replace(/[\u0001\u0002][\u0000]{3}[\u0000-\u00FF]{4}/g, '');
      return [cleaned, ''];
    }
    
    return [stdout, stderr];
  }

  private async cleanup(sessionDir: string): Promise<void> {
    try {
      await fs.rm(sessionDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  public async runTestCase(
    code: string,
    language: string,
    testCase: ITestCase,
    config: ExecutionConfig
  ): Promise<ITestResult> {
    const sessionId = uuidv4();
    let sessionDir = '';

    try {
      sessionDir = await this.writeCodeToFile(code, language, sessionId);
      
      const result = await this.executeInContainer(
        sessionDir,
        language,
        testCase.input,
        config
      );

      // Determine if test passed
      const actualOutput = result.stdout.trim();
      const expectedOutput = testCase.expectedOutput.trim();
      
      // More robust comparison - normalize whitespace and array formatting
      const normalizeOutput = (str: string) => {
        // Handle empty outputs - treat both "" and "[]" as equivalent
        const trimmed = str.trim();
        if (!trimmed || trimmed === '' || trimmed === '[]') {
          return '[]';
        }
        
        // Normalize array formatting: remove all spaces around brackets and commas
        let normalized = trimmed
          .replace(/\[\s*/g, '[')      // Remove spaces after [
          .replace(/\s*\]/g, ']')      // Remove spaces before ]
          .replace(/\s*,\s*/g, ',')    // Remove spaces around commas
          .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
          .trim()
          .toLowerCase();
        
        return normalized;
      };

      // Smart comparison that handles different valid orderings
      const smartCompare = (actual: string, expected: string): boolean => {
        const normalizedActual = normalizeOutput(actual);
        const normalizedExpected = normalizeOutput(expected);
        
        // First try exact match
        if (normalizedActual === normalizedExpected) {
          return true;
        }
        
        // Try parsing as JSON and comparing content
        try {
          const actualParsed = JSON.parse(normalizedActual);
          const expectedParsed = JSON.parse(normalizedExpected);
          
          // Handle arrays that can have different orderings
          if (Array.isArray(actualParsed) && Array.isArray(expectedParsed)) {
            return compareArraysFlexibly(actualParsed, expectedParsed);
          }
          
          // For other data types, use deep comparison
          return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
          
        } catch (e) {
          // If JSON parsing fails, fall back to string comparison
          return normalizedActual === normalizedExpected;
        }
      };

      // Flexible array comparison that handles different orderings
      const compareArraysFlexibly = (actual: any[], expected: any[]): boolean => {
        if (actual.length !== expected.length) {
          return false;
        }
        
        // Handle array of arrays (like group anagrams result)
        if (actual.every(item => Array.isArray(item)) && expected.every(item => Array.isArray(item))) {
          // Sort both arrays of arrays by their sorted content for comparison
          const sortArrayOfArrays = (arr: any[][]) => {
            return arr.map(subArr => [...subArr].sort()).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
          };
          
          const sortedActual = sortArrayOfArrays(actual);
          const sortedExpected = sortArrayOfArrays(expected);
          
          return JSON.stringify(sortedActual) === JSON.stringify(sortedExpected);
        }
        
        // Handle simple arrays - sort and compare
        if (actual.every(item => typeof item !== 'object') && expected.every(item => typeof item !== 'object')) {
          const sortedActual = [...actual].sort();
          const sortedExpected = [...expected].sort();
          return JSON.stringify(sortedActual) === JSON.stringify(sortedExpected);
        }
        
        // For complex objects, try to match each item
        const actualCopy = [...actual];
        const expectedCopy = [...expected];
        
        for (const expectedItem of expectedCopy) {
          const matchIndex = actualCopy.findIndex(actualItem => 
            JSON.stringify(actualItem) === JSON.stringify(expectedItem)
          );
          if (matchIndex === -1) {
            return false;
          }
          actualCopy.splice(matchIndex, 1);
        }
        
        return actualCopy.length === 0;
      };
      
      const passed = smartCompare(actualOutput, testCase.expectedOutput) && result.exitCode === 0 && !result.timedOut;
      
      console.log('Normalized actual:', JSON.stringify(normalizeOutput(actualOutput)));
      console.log('Normalized expected:', JSON.stringify(normalizeOutput(testCase.expectedOutput)));
      console.log('Smart comparison result:', passed);
      console.log('Final passed result:', passed);

      return {
        passed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: actualOutput,
        executionTime: result.executionTime,
        memoryUsage: result.memoryUsage,
        error: result.stderr || (result.timedOut ? 'Time limit exceeded' : undefined)
      };

    } catch (error) {
      console.error('Test case execution error:', error);
      return {
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: '',
        executionTime: 0,
        memoryUsage: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      if (sessionDir) {
        await this.cleanup(sessionDir);
      }
    }
  }

  public async runSubmission(
    code: string,
    language: string,
    testCases: ITestCase[]
  ): Promise<ISubmissionResult> {
    const config: ExecutionConfig = {
      timeLimit: 5000, // 5 seconds
      memoryLimit: 128, // 128 MB
      language: language as any
    };

    const testResults: ITestResult[] = [];
    let totalExecutionTime = 0;
    let totalMemoryUsage = 0;
    let passedTests = 0;

    // First, try to compile/run a simple test to check for compilation errors
    const simpleTest: ITestCase = {
      input: '',
      expectedOutput: '',
      isPublic: true
    };

    const compileTest = await this.runTestCase(code, language, simpleTest, {
      ...config,
      timeLimit: 10000 // Give more time for compilation
    });

    if (compileTest.error && compileTest.error.includes('error:')) {
      return {
        success: false,
        verdict: 'COMPILATION_ERROR',
        message: 'Code compilation failed',
        testResults: [compileTest],
        totalExecutionTime: compileTest.executionTime,
        totalMemoryUsage: compileTest.memoryUsage,
        passedTests: 0,
        totalTests: testCases.length
      };
    }

    // Run all test cases
    for (const testCase of testCases) {
      const result = await this.runTestCase(code, language, testCase, config);
      testResults.push(result);
      
      totalExecutionTime += result.executionTime;
      totalMemoryUsage = Math.max(totalMemoryUsage, result.memoryUsage);
      
      if (result.passed) {
        passedTests++;
      }

      // Stop on first failure for efficiency (optional)
      // if (!result.passed) break;
    }

    // Determine verdict
    let verdict: ISubmissionResult['verdict'] = 'ACCEPTED';
    let message = 'All test cases passed';

    if (passedTests === 0) {
      const firstResult = testResults[0];
      if (firstResult.error?.includes('Time limit exceeded') || 
          testResults.some(r => r.executionTime > config.timeLimit)) {
        verdict = 'TIME_LIMIT_EXCEEDED';
        message = 'Time limit exceeded';
      } else if (firstResult.error?.includes('Memory') ||
                 totalMemoryUsage > config.memoryLimit) {
        verdict = 'MEMORY_LIMIT_EXCEEDED';
        message = 'Memory limit exceeded';
      } else if (firstResult.error) {
        verdict = 'RUNTIME_ERROR';
        message = 'Runtime error occurred';
      } else {
        verdict = 'WRONG_ANSWER';
        message = 'Wrong answer';
      }
    } else if (passedTests < testCases.length) {
      verdict = 'WRONG_ANSWER';
      message = `${passedTests} out of ${testCases.length} test cases passed`;
    }

    return {
      success: verdict === 'ACCEPTED',
      verdict,
      message,
      testResults,
      totalExecutionTime,
      totalMemoryUsage,
      passedTests,
      totalTests: testCases.length
    };
  }

  public async runCode(
    code: string,
    language: string,
    input: string
  ): Promise<{ output: string; executionTime: number; memoryUsage: number }> {
    const sessionId = uuidv4();
    let sessionDir = '';

    try {
      sessionDir = await this.writeCodeToFile(code, language, sessionId);
      
      const config: ExecutionConfig = {
        timeLimit: 5000, // 5 seconds
        memoryLimit: 256, // 256 MB
        language: language as any
      };

      const result = await this.executeInContainer(
        sessionDir,
        language,
        input,
        config
      );

      return {
        output: result.stdout || result.stderr,
        executionTime: result.executionTime,
        memoryUsage: result.memoryUsage
      };
    } catch (error) {
      console.error('Code execution error:', error);
      throw new Error('Code execution failed');
    } finally {
      if (sessionDir) {
        await this.cleanup(sessionDir);
      }
    }
  }
}

export const codeExecutionService = new CodeExecutionService();
