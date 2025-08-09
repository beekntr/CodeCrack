import mongoose, { Schema, Document } from 'mongoose';

export interface ITestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTime: number;
  memoryUsage: number;
  error?: string;
}

export interface ISubmissionResult {
  success: boolean;
  verdict: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
  message: string;
  testResults: ITestResult[];
  totalExecutionTime: number;
  totalMemoryUsage: number;
  passedTests: number;
  totalTests: number;
}

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  code: string;
  language: 'python' | 'cpp' | 'javascript' | 'java';
  result: ISubmissionResult;
  submittedAt: Date;
}

const TestResultSchema = new Schema<ITestResult>({
  passed: {
    type: Boolean,
    required: true
  },
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  actualOutput: {
    type: String,
    required: true
  },
  executionTime: {
    type: Number,
    required: true,
    min: 0
  },
  memoryUsage: {
    type: Number,
    required: true,
    min: 0
  },
  error: {
    type: String
  }
}, { _id: false });

const SubmissionResultSchema = new Schema<ISubmissionResult>({
  success: {
    type: Boolean,
    required: true
  },
  verdict: {
    type: String,
    enum: ['ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  testResults: {
    type: [TestResultSchema],
    required: true
  },
  totalExecutionTime: {
    type: Number,
    required: true,
    min: 0
  },
  totalMemoryUsage: {
    type: Number,
    required: true,
    min: 0
  },
  passedTests: {
    type: Number,
    required: true,
    min: 0
  },
  totalTests: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const SubmissionSchema = new Schema<ISubmission>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: true,
    maxlength: 50000
  },
  language: {
    type: String,
    enum: ['python', 'cpp', 'javascript', 'java'],
    required: true
  },
  result: {
    type: SubmissionResultSchema,
    required: true
  }
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: false }
});

// Indexes for faster queries
SubmissionSchema.index({ userId: 1, submittedAt: -1 });
SubmissionSchema.index({ problemId: 1, submittedAt: -1 });
SubmissionSchema.index({ 'result.verdict': 1 });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
