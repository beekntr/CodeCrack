import mongoose, { Schema, Document } from 'mongoose';

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

export interface IProblem extends Document {
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  testCases: ITestCase[];
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TestCaseSchema = new Schema<ITestCase>({
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const ProblemSchema = new Schema<IProblem>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    unique: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 10000
  },
  inputFormat: {
    type: String,
    required: true,
    maxlength: 2000
  },
  outputFormat: {
    type: String,
    required: true,
    maxlength: 2000
  },
  constraints: {
    type: String,
    required: true,
    maxlength: 2000
  },
  testCases: {
    type: [TestCaseSchema],
    required: true,
    validate: {
      validator: function(testCases: ITestCase[]) {
        return testCases.length >= 1;
      },
      message: 'At least one test case is required'
    }
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
ProblemSchema.index({ difficulty: 1 });
ProblemSchema.index({ tags: 1 });
ProblemSchema.index({ title: 'text', description: 'text' });
ProblemSchema.index({ createdAt: -1 });

export const Problem = mongoose.model<IProblem>('Problem', ProblemSchema);
