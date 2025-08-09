/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  score: number;
  solvedProblems: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Problem types
export interface TestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

export interface Problem {
  _id: string;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  testCases: TestCase[];
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProblemRequest {
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  testCases: TestCase[];
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

// Submission types
export interface SubmissionRequest {
  problemId: string;
  code: string;
  language: 'python' | 'cpp' | 'javascript' | 'java';
}

export interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTime: number;
  memoryUsage: number;
  error?: string;
}

export interface SubmissionResult {
  success: boolean;
  verdict: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
  message: string;
  testResults: TestResult[];
  totalExecutionTime: number;
  totalMemoryUsage: number;
  passedTests: number;
  totalTests: number;
}

export interface Submission {
  _id: string;
  userId: string;
  problemId: string;
  code: string;
  language: 'python' | 'cpp' | 'javascript' | 'java';
  result: SubmissionResult;
  submittedAt: Date;
}

// Leaderboard types
export interface LeaderboardEntry {
  user: User;
  rank: number;
  score: number;
  solvedCount: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userRank?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
