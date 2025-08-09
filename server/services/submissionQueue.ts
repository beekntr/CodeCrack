import Queue from 'bullmq';
import Redis from 'ioredis';
import { codeExecutionService } from './codeExecution';
import { Submission } from '../models/Submission';
import { Problem } from '../models/Problem';
import { User } from '../models/User';

// Redis connection for BullMQ
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  lazyConnect: true
});

// Create submission queue
export const submissionQueue = new Queue.Queue('code-submission', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,      // Keep last 50 failed jobs
    attempts: 3,           // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

// Queue processor
const worker = new Queue.Worker('code-submission', async (job) => {
  const { submissionId, code, language, problemId, userId } = job.data;
  
  try {
    console.log(`Processing submission ${submissionId} for user ${userId}`);
    
    // Get problem with test cases
    const problem = await Problem.findById(problemId);
    if (!problem) {
      throw new Error('Problem not found');
    }

    // Execute code with all test cases
    const result = await codeExecutionService.runSubmission(
      code,
      language,
      problem.testCases
    );

    // Update submission with result
    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      { result },
      { new: true }
    );

    if (!updatedSubmission) {
      throw new Error('Submission not found');
    }

    // Update user score if submission was accepted
    if (result.verdict === 'ACCEPTED') {
      const user = await User.findById(userId);
      if (user && !user.solvedProblems.includes(problemId)) {
        // Calculate score based on difficulty
        const scoreMap = { easy: 10, medium: 20, hard: 30 };
        const points = scoreMap[problem.difficulty];
        
        await User.findByIdAndUpdate(userId, {
          $inc: { score: points },
          $addToSet: { solvedProblems: problemId }
        });
        
        console.log(`User ${userId} earned ${points} points for solving ${problem.title}`);
      }
    }

    console.log(`Submission ${submissionId} processed: ${result.verdict}`);
    return { success: true, submissionId, verdict: result.verdict };

  } catch (error) {
    console.error(`Error processing submission ${submissionId}:`, error);
    
    // Update submission with error
    await Submission.findByIdAndUpdate(submissionId, {
      result: {
        success: false,
        verdict: 'RUNTIME_ERROR',
        message: 'Internal error during code execution',
        testResults: [],
        totalExecutionTime: 0,
        totalMemoryUsage: 0,
        passedTests: 0,
        totalTests: 0
      }
    });
    
    throw error;
  }
}, {
  connection: redis,
  concurrency: 5 // Process up to 5 submissions concurrently
});

// Queue event handlers
worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on('stalled', (jobId) => {
  console.warn(`⚠️  Job ${jobId} stalled`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down submission queue...');
  await worker.close();
  await submissionQueue.close();
  await redis.quit();
  process.exit(0);
});

export interface SubmissionJobData {
  submissionId: string;
  code: string;
  language: string;
  problemId: string;
  userId: string;
}

export const addSubmissionToQueue = async (data: SubmissionJobData): Promise<void> => {
  await submissionQueue.add('process-submission', data, {
    priority: 1,
    delay: 0
  });
};

export const getQueueStats = async () => {
  const waiting = await submissionQueue.getWaiting();
  const active = await submissionQueue.getActive();
  const completed = await submissionQueue.getCompleted();
  const failed = await submissionQueue.getFailed();

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length
  };
};
