import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

export interface ExecutionResult {
  output: string;
  error: string;
  exitCode: number;
  executionTime: number;
  timedOut: boolean;
}

class SimpleCodeExecutionService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'codecrack');
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
    fileExtension: string;
    command: string;
    args: (filePath: string) => string[];
    requiresCompilation?: boolean;
    compileCommand?: string;
    compileArgs?: (sourceFile: string, outputFile: string) => string[];
  } {
    const isWindows = process.platform === 'win32';
    
    const configs = {
      javascript: {
        fileExtension: '.js',
        command: 'node',
        args: (filePath: string) => [filePath]
      },
      python: {
        fileExtension: '.py',
        command: 'python',
        args: (filePath: string) => [filePath]
      },
      java: {
        fileExtension: '.java',
        command: 'java',
        args: (filePath: string) => ['-cp', path.dirname(filePath), 'Solution'],
        requiresCompilation: true,
        compileCommand: 'javac',
        compileArgs: (sourceFile: string) => [sourceFile]
      },
      cpp: {
        fileExtension: '.cpp',
        command: isWindows ? 'cl.exe' : 'g++',
        args: (filePath: string) => {
          const outputFile = filePath.replace('.cpp', isWindows ? '.exe' : '');
          return isWindows 
            ? ['/EHsc', filePath, '/Fe:' + outputFile]
            : [filePath, '-o', outputFile];
        },
        requiresCompilation: true,
        compileCommand: isWindows ? 'cl.exe' : 'g++',
        compileArgs: (sourceFile: string, outputFile: string) => 
          isWindows 
            ? ['/EHsc', sourceFile, '/Fe:' + outputFile]
            : [sourceFile, '-o', outputFile]
      },
      c: {
        fileExtension: '.c',
        command: isWindows ? 'cl.exe' : 'gcc',
        args: (filePath: string) => {
          const outputFile = filePath.replace('.c', isWindows ? '.exe' : '');
          return isWindows
            ? [filePath, '/Fe:' + outputFile]
            : [filePath, '-o', outputFile];
        },
        requiresCompilation: true,
        compileCommand: isWindows ? 'cl.exe' : 'gcc',
        compileArgs: (sourceFile: string, outputFile: string) => 
          isWindows
            ? [sourceFile, '/Fe:' + outputFile]
            : [sourceFile, '-o', outputFile]
      }
    };

    return configs[language as keyof typeof configs] || configs.javascript;
  }

  private async writeCodeToFile(code: string, language: string, sessionId: string): Promise<string> {
    const config = this.getLanguageConfig(language);
    const sessionDir = path.join(this.tempDir, sessionId);
    await fs.mkdir(sessionDir, { recursive: true });

    let fileName = 'solution' + config.fileExtension;
    if (language === 'java') {
      // Java requires the class name to match the filename
      fileName = 'Solution.java';
    }

    const filePath = path.join(sessionDir, fileName);
    await fs.writeFile(filePath, code, 'utf8');
    return filePath;
  }

  private async executeCommand(
    command: string,
    args: string[],
    input: string,
    timeoutMs: number = 5000,
    cwd?: string
  ): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let timedOut = false;
      let output = '';
      let error = '';

      const child: ChildProcess = spawn(command, args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        windowsHide: true
      });

      // Set timeout
      const timeout = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, timeoutMs);

      // Handle stdout
      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      // Handle stderr
      child.stderr?.on('data', (data) => {
        error += data.toString();
      });

      // Handle process completion
      child.on('close', (exitCode) => {
        clearTimeout(timeout);
        const executionTime = Date.now() - startTime;

        resolve({
          output: output.trim(),
          error: error.trim(),
          exitCode: exitCode || 0,
          executionTime,
          timedOut
        });
      });

      // Handle process error
      child.on('error', (err) => {
        clearTimeout(timeout);
        const executionTime = Date.now() - startTime;

        resolve({
          output: '',
          error: err.message,
          exitCode: 1,
          executionTime,
          timedOut
        });
      });

      // Send input to the process
      if (input && child.stdin) {
        child.stdin.write(input);
        child.stdin.end();
      }
    });
  }

  public async runCode(
    code: string,
    language: string,
    input: string = ''
  ): Promise<{ output: string; executionTime: number; error?: string }> {
    const sessionId = uuidv4();
    let sessionDir = '';

    try {
      const filePath = await this.writeCodeToFile(code, language, sessionId);
      sessionDir = path.dirname(filePath);
      const config = this.getLanguageConfig(language);

      let result: ExecutionResult;

      if (config.requiresCompilation) {
        // Compile first
        const outputFile = filePath.replace(config.fileExtension, process.platform === 'win32' ? '.exe' : '');
        const compileResult = await this.executeCommand(
          config.compileCommand!,
          config.compileArgs!(filePath, outputFile),
          '',
          10000, // 10 seconds for compilation
          sessionDir
        );

        if (compileResult.exitCode !== 0) {
          return {
            output: '',
            executionTime: compileResult.executionTime,
            error: `Compilation Error: ${compileResult.error || compileResult.output}`
          };
        }

        // Run the compiled program
        result = await this.executeCommand(
          outputFile,
          [],
          input,
          5000, // 5 seconds for execution
          sessionDir
        );
      } else {
        // Direct execution for interpreted languages
        result = await this.executeCommand(
          config.command,
          config.args(filePath),
          input,
          5000, // 5 seconds for execution
          sessionDir
        );
      }

      if (result.timedOut) {
        return {
          output: '',
          executionTime: result.executionTime,
          error: 'Time Limit Exceeded'
        };
      }

      if (result.exitCode !== 0 && result.error) {
        return {
          output: result.output,
          executionTime: result.executionTime,
          error: `Runtime Error: ${result.error}`
        };
      }

      return {
        output: result.output || result.error,
        executionTime: result.executionTime
      };

    } catch (error) {
      console.error('Code execution error:', error);
      return {
        output: '',
        executionTime: 0,
        error: `Execution Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      // Cleanup
      if (sessionDir) {
        try {
          await fs.rm(sessionDir, { recursive: true, force: true });
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }
    }
  }

  public async runTestCases(
    code: string,
    language: string,
    testCases: Array<{ input: string; expectedOutput: string }>
  ): Promise<Array<{
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    executionTime: number;
    error?: string;
  }>> {
    const results = [];

    for (const testCase of testCases) {
      const result = await this.runCode(code, language, testCase.input);
      
      const actualOutput = result.error ? `Error: ${result.error}` : result.output;
      const passed = !result.error && actualOutput.trim() === testCase.expectedOutput.trim();

      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput,
        passed,
        executionTime: result.executionTime,
        error: result.error
      });
    }

    return results;
  }
}

export const simpleCodeExecutionService = new SimpleCodeExecutionService();
