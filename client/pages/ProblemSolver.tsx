import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Send, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  FileText,
  Code,
  TestTube,
  GripVertical,
  RotateCcw
} from 'lucide-react';

interface Problem {
  _id: string;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  testCases: TestCase[];
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdBy: {
    name: string;
  };
}

interface TestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime: number;
}

interface SubmissionResult {
  success: boolean;
  verdict: string;
  message: string;
  testResults: TestResult[];
  totalTests: number;
  passedTests: number;
  totalExecutionTime: number;
  totalMemoryUsage: number;
}

const difficultyColors = {
  easy: "border-green-500 text-green-700 bg-green-50",
  medium: "border-yellow-500 text-yellow-700 bg-yellow-50", 
  hard: "border-red-500 text-red-700 bg-red-50"
};

const difficultyIcons = {
  easy: CheckCircle,
  medium: Clock,
  hard: AlertCircle
};

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' }
];

const defaultCode = {
  javascript: `function solution() {
    // Write your solution here
    
}`,
  python: `def solution():
    # Write your solution here
    pass`,
  java: `public class Solution {
    public static void main(String[] args) {
        // Write your solution here
        
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // Write your solution here
    
    return 0;
}`
};

export default function ProblemSolver() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { toast } = useToast();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState(defaultCode.javascript);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage
  const [rightPanelSplit, setRightPanelSplit] = useState(60); // Percentage for code editor vs test results
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Generate unique storage key for code persistence
  const getStorageKey = (problemId: string, language: string) => {
    const userId = user?._id || 'anonymous';
    return `codecrack_code_${userId}_${problemId}_${language}`;
  };

  // Save code to localStorage
  const saveCodeToStorage = (problemId: string, language: string, codeContent: string) => {
    try {
      const key = getStorageKey(problemId, language);
      localStorage.setItem(key, codeContent);
    } catch (error) {
      console.error('Failed to save code to localStorage:', error);
    }
  };

  // Load code from localStorage
  const loadCodeFromStorage = (problemId: string, language: string): string | null => {
    try {
      const key = getStorageKey(problemId, language);
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to load code from localStorage:', error);
      return null;
    }
  };

  // Enhanced setCode function that saves to localStorage
  const updateCode = (newCode: string) => {
    setCode(newCode);
    if (id) {
      saveCodeToStorage(id, selectedLanguage, newCode);
      setLastSaved(new Date());
    }
  };

  // Reset code to default template
  const resetCode = () => {
    const defaultTemplate = defaultCode[selectedLanguage as keyof typeof defaultCode];
    setCode(defaultTemplate);
    if (id) {
      // Clear saved code from localStorage
      try {
        const key = getStorageKey(id, selectedLanguage);
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Failed to clear saved code:', error);
      }
    }
    toast({
      title: "Code Reset",
      description: "Code has been reset to the default template.",
    });
  };

  const handleHorizontalResize = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = leftPanelWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const containerWidth = window.innerWidth - 32; // Account for padding
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newWidth = Math.min(Math.max(startWidth + deltaPercent, 20), 80);
      setLeftPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleVerticalResize = (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startSplit = rightPanelSplit;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const containerHeight = window.innerHeight - 120; // Account for header
      const deltaPercent = (deltaY / containerHeight) * 100;
      const newSplit = Math.min(Math.max(startSplit + deltaPercent, 30), 80);
      setRightPanelSplit(newSplit);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (id) {
      fetchProblem(id);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      // Try to load saved code first
      const savedCode = loadCodeFromStorage(id, selectedLanguage);
      if (savedCode) {
        setCode(savedCode);
      } else {
        // Fall back to default template
        setCode(defaultCode[selectedLanguage as keyof typeof defaultCode]);
      }
    } else {
      // No problem ID yet, use default
      setCode(defaultCode[selectedLanguage as keyof typeof defaultCode]);
    }
  }, [selectedLanguage, id]);

  const fetchProblem = async (problemId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/problems/${problemId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch problem');
      }

      const data = await response.json();
      if (data.success) {
        setProblem(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch problem');
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
      toast({
        title: "Error",
        description: "Failed to load problem. Please try again.",
        variant: "destructive"
      });
      navigate('/problems');
    } finally {
      setLoading(false);
    }
  };

  const runCode = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run code.",
        variant: "destructive"
      });
      return;
    }

    if (!code.trim()) {
      toast({
        title: "No Code",
        description: "Please write some code before running.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsRunning(true);
      setTestResults([]);

      const response = await fetch('/api/submissions/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: id,
          code,
          language: selectedLanguage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to run code');
      }

      const data = await response.json();
      if (data.success) {
        setTestResults(data.data.testResults || []);
        toast({
          title: "Code Executed",
          description: `Passed ${data.data.passedTests}/${data.data.totalTests} test cases`,
          variant: data.data.passedTests === data.data.totalTests ? "default" : "destructive"
        });
      } else {
        throw new Error(data.message || 'Failed to run code');
      }
    } catch (error) {
      console.error('Error running code:', error);
      toast({
        title: "Execution Error",
        description: "Failed to run code. Please check your solution.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit code.",
        variant: "destructive"
      });
      return;
    }

    if (!code.trim()) {
      toast({
        title: "No Code",
        description: "Please write some code before submitting.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionResult(null);

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: id,
          code,
          language: selectedLanguage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit code');
      }

      const data = await response.json();
      if (data.success) {
        setSubmissionResult(data.data.result);
        const verdict = data.data.result.verdict;
        toast({
          title: verdict === 'ACCEPTED' ? "Accepted!" : `${verdict}`,
          description: verdict === 'ACCEPTED' 
            ? "Congratulations! Your solution is correct." 
            : `Passed ${data.data.result.passedTests}/${data.data.result.totalTests} test cases`,
          variant: verdict === 'ACCEPTED' ? "default" : "destructive"
        });
      } else {
        throw new Error(data.message || 'Failed to submit code');
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDescription = (description: string) => {
    return description.split('\n').map((line, index) => (
      <div key={index} className={line.trim() ? 'mb-2' : 'mb-4'}>
        {line || <br />}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Problem Not Found</h1>
          <Button onClick={() => navigate('/problems')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Problems
          </Button>
        </div>
      </div>
    );
  }

  const DifficultyIcon = difficultyIcons[problem.difficulty];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-card flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/problems')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Problems
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold">{problem.title}</h1>
                <Badge 
                  variant="outline" 
                  className={difficultyColors[problem.difficulty]}
                >
                  <DifficultyIcon className="h-3 w-3 mr-1" />
                  {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">
                  {user ? '✓ Saved to your account' : '✓ Saved locally'}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetCode}
                title="Reset to default template"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={runCode} 
                disabled={isRunning || isSubmitting}
              >
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? 'Running...' : 'Run'}
              </Button>
              <Button 
                onClick={submitCode} 
                disabled={isRunning || isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Resizable Layout */}
      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 72px)' }}>
        {/* Left Panel - Problem Details */}
        <div 
          className="overflow-hidden border-r bg-card"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div className="h-full overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(100vh - 72px)' }}>
            <div className="bg-background rounded-lg border p-4">
              <div className="flex items-center mb-3">
                <FileText className="h-4 w-4 mr-2" />
                <h3 className="font-semibold text-sm">Problem Description</h3>
              </div>
              <div className="text-sm leading-relaxed mb-3">
                {formatDescription(problem.description)}
              </div>
              {problem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t">
                  <span className="text-xs font-medium">Topics:</span>
                  {problem.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-background rounded-lg border p-4">
              <h3 className="font-semibold text-sm mb-3">Input/Output Format</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-xs mb-1">Input:</h4>
                  <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap">
                    {problem.inputFormat}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium text-xs mb-1">Output:</h4>
                  <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap">
                    {problem.outputFormat}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-lg border p-4">
              <h3 className="font-semibold text-sm mb-3">Constraints</h3>
              <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap">
                {problem.constraints}
              </pre>
            </div>

            <div className="bg-background rounded-lg border p-4">
              <h3 className="font-semibold text-sm mb-3">Examples</h3>
              <div className="space-y-3">
                {problem.testCases
                  .filter(tc => tc.isPublic)
                  .map((testCase, index) => (
                    <div key={index} className="bg-muted rounded-lg p-3">
                      <h4 className="font-medium text-xs mb-2">Example {index + 1}</h4>
                      <div className="space-y-2">
                        <div>
                          <h5 className="font-medium text-xs mb-1">Input:</h5>
                          <pre className="text-xs bg-background p-2 rounded">
                            {testCase.input}
                          </pre>
                        </div>
                        <div>
                          <h5 className="font-medium text-xs mb-1">Output:</h5>
                          <pre className="text-xs bg-background p-2 rounded">
                            {testCase.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Resize Handle */}
        <div 
          className="w-1 bg-border cursor-col-resize hover:bg-blue-500 flex items-center justify-center group"
          onMouseDown={handleHorizontalResize}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 rotate-90" />
        </div>

        {/* Right Panel - Code Editor and Test Sections */}
        <div 
          className="flex flex-col overflow-hidden bg-card"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          {/* Code Editor */}
          <div 
            className="overflow-hidden border-b"
            style={{ height: `${rightPanelSplit}%` }}
          >
            <div className="h-full flex flex-col m-4 mb-2">
              <div className="bg-background rounded-lg border flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg">
                  <div className="flex items-center">
                    <Code className="h-4 w-4 mr-2" />
                    <h3 className="font-semibold text-sm">Code Editor</h3>
                  </div>
                  {lastSaved && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Auto-saved {lastSaved.toLocaleTimeString()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-h-0 p-2">
                  <div className="h-full rounded-md overflow-hidden">
                    <Editor
                      height="100%"
                      language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
                      value={code}
                      onChange={(value) => updateCode(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 12, bottom: 12 },
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        wordWrap: 'on',
                        wrappingIndent: 'indent',
                        tabSize: 2,
                        insertSpaces: true,
                        formatOnPaste: true,
                        formatOnType: true,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Resize Handle */}
          <div 
            className="h-1 bg-border cursor-row-resize hover:bg-blue-500 flex items-center justify-center group"
            onMouseDown={handleVerticalResize}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-blue-500" />
          </div>

          {/* Bottom Panel - Test Cases and Results */}
          <div 
            className="overflow-hidden flex"
            style={{ height: `${100 - rightPanelSplit}%` }}
          >
            {/* Test Cases Section */}
            <div className="w-1/2 border-r overflow-hidden">
              <div className="h-full flex flex-col m-4 mr-2">
                <div className="bg-background rounded-lg border flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center p-3 border-b bg-muted/50 rounded-t-lg">
                    <FileText className="h-4 w-4 mr-2" />
                    <h3 className="font-semibold text-sm">Test Cases</h3>
                  </div>
                  <div className="flex-1 min-h-0 p-3 overflow-y-auto">
                    <div className="space-y-3">
                      {problem.testCases
                        .filter(tc => tc.isPublic)
                        .map((testCase, index) => (
                          <div key={index} className="bg-muted rounded-lg p-3">
                            <h4 className="font-medium text-sm mb-2">Test Case {index + 1}</h4>
                            <div className="space-y-2">
                              <div>
                                <h5 className="font-medium text-xs mb-1">Input:</h5>
                                <pre className="text-xs bg-background p-2 rounded whitespace-pre-wrap">
                                  {testCase.input}
                                </pre>
                              </div>
                              <div>
                                <h5 className="font-medium text-xs mb-1">Expected Output:</h5>
                                <pre className="text-xs bg-background p-2 rounded whitespace-pre-wrap">
                                  {testCase.expectedOutput}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      {problem.testCases.filter(tc => tc.isPublic).length === 0 && (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <FileText className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">No public test cases available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Results Section */}
            <div className="w-1/2 overflow-hidden">
              <div className="h-full flex flex-col m-4 ml-2">
                <div className="bg-background rounded-lg border flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center p-3 border-b bg-muted/50 rounded-t-lg">
                    <TestTube className="h-4 w-4 mr-2" />
                    <h3 className="font-semibold text-sm">Test Results</h3>
                  </div>
                  <div className="flex-1 min-h-0 p-3">
                    {(testResults.length > 0 || submissionResult) ? (
                      <div className="h-full flex flex-col">
                        {submissionResult && (
                          <div className="mb-3 p-3 border rounded-lg flex-shrink-0 bg-muted/50">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-sm">Submission Result</h3>
                              <Badge 
                                variant={submissionResult.verdict === 'ACCEPTED' ? 'default' : 'destructive'}
                              >
                                {submissionResult.verdict}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Passed {submissionResult.passedTests}/{submissionResult.totalTests} test cases
                              • Execution time: {submissionResult.totalExecutionTime}ms
                            </p>
                          </div>
                        )}

                        <div className="space-y-3 overflow-y-auto flex-1">
                          {(submissionResult?.testResults || testResults).map((result, index) => (
                            <div key={index} className="bg-muted rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm">Result {index + 1}</h4>
                                <div className="flex items-center space-x-2">
                                  {result.passed ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {result.executionTime}ms
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <h5 className="font-medium text-xs mb-1">Your Output:</h5>
                                  <pre className={`text-xs p-2 rounded whitespace-pre-wrap overflow-x-auto ${
                                    result.passed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                                  }`}>
                                    {result.actualOutput}
                                  </pre>
                                </div>
                                {!result.passed && (
                                  <div>
                                    <h5 className="font-medium text-xs mb-1">Expected:</h5>
                                    <pre className="text-xs bg-background p-2 rounded whitespace-pre-wrap overflow-x-auto">
                                      {result.expectedOutput}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <TestTube className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Run your code to see results here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
