import { Request, Response } from 'express';
import { z } from 'zod';
import { Problem } from '../models/Problem';
import { Submission } from '../models/Submission';
import { User } from '../models/User';
import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { codeExecutionService } from '../services/codeExecution';

const router = express.Router();
// import { addSubmissionToQueue, getQueueStats } from '../services/submissionQueue'; // Disabled for now
import { SubmissionRequest, ApiResponse } from '@shared/api';

// Validation schema
const submitCodeSchema = z.object({
  problemId: z.string().min(1, 'Problem ID is required'),
  code: z.string().min(1, 'Code is required').max(50000, 'Code too long'),
  language: z.enum(['python', 'cpp', 'javascript', 'java'])
});

export const submitCode = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const validation = submitCodeSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.errors.map(err => err.message)
      });
      return;
    }

    const { problemId, code, language } = validation.data as SubmissionRequest;

    // Find the problem
    const problem = await Problem.findById(problemId);
    if (!problem) {
      res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
      return;
    }

    // For development, execute code in Docker containers
    console.log(`🔄 Running submission for user ${req.user._id} on problem ${problemId}`);
    const submissionResult = await codeExecutionService.runSubmission(
      code,
      language,
      problem.testCases
    );
    
    const testResults = submissionResult.testResults;

    // Calculate verdict based on test results
    const passedCount = testResults.filter(tr => tr.passed).length;
    const totalCount = testResults.length;
    const verdict = passedCount === totalCount ? 'ACCEPTED' : 'WRONG_ANSWER';

    // Calculate totals for database schema
    const totalExecutionTime = testResults.reduce((sum, tr) => sum + (tr.executionTime || 0), 0);
    const totalMemoryUsage = testResults.reduce((sum, tr) => sum + (tr.memoryUsage || 0), 0);

    const result = {
      success: verdict === 'ACCEPTED',
      verdict,
      testResults,
      passedTests: passedCount,
      totalTests: totalCount,
      totalExecutionTime,
      totalMemoryUsage,
      message: verdict === 'ACCEPTED' ? 'All test cases passed!' : `${passedCount}/${totalCount} test cases passed`
    };

    // Create submission record
    const submission = new Submission({
      userId: req.user._id,
      problemId: problemId,
      code,
      language,
      result
    });

    await submission.save();

    // If submission is accepted, update user's solved problems and score
    if (result.verdict === 'ACCEPTED') {
      const user = await User.findById(req.user._id);
      if (user && !user.solvedProblems.includes(problem._id)) {
        // Calculate score based on difficulty
        const difficultyPoints = {
          easy: 10,
          medium: 20,
          hard: 30
        };

        user.solvedProblems.push(problem._id);
        user.score += difficultyPoints[problem.difficulty];
        await user.save();

        console.log(`✅ User ${req.user._id} solved problem ${problemId} (+${difficultyPoints[problem.difficulty]} points)`);
      }
    }

    const response: ApiResponse = {
      success: true,
      message: 'Code submitted successfully',
      data: {
        submissionId: submission._id,
        result: {
          ...result,
          // Don't send back expected outputs in test results for security
          testResults: result.testResults.map(tr => ({
            ...tr,
            expectedOutput: problem.testCases.find(tc => tc.input === tr.input)?.isPublic ? tr.expectedOutput : '[Hidden]'
          }))
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during code execution'
    });
  }
};

export const getSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const {
      page = '1',
      limit = '10',
      problemId,
      verdict
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = { userId: req.user._id };
    
    if (problemId) {
      filter.problemId = problemId;
    }

    if (verdict) {
      filter['result.verdict'] = verdict;
    }

    // Get submissions
    const submissions = await Submission.find(filter)
      .populate('problemId', 'title difficulty')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-code'); // Don't return code for privacy

    const total = await Submission.countDocuments(filter);

    const response: ApiResponse = {
      success: true,
      message: 'Submissions retrieved successfully',
      data: {
        submissions,
        pagination: {
          current: pageNum,
          total: Math.ceil(total / limitNum),
          count: submissions.length,
          totalCount: total
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getSubmissionById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    const submission = await Submission.findById(id)
      .populate('problemId', 'title difficulty')
      .populate('userId', 'name');

    if (!submission) {
      res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
      return;
    }

    // Check if user owns this submission or is admin
    if (submission.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this submission'
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Submission retrieved successfully',
      data: submission
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getSubmissionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const stats = await Submission.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$result.verdict',
          count: { $sum: 1 }
        }
      }
    ]);

    const verdictStats = {
      ACCEPTED: 0,
      WRONG_ANSWER: 0,
      TIME_LIMIT_EXCEEDED: 0,
      MEMORY_LIMIT_EXCEEDED: 0,
      RUNTIME_ERROR: 0,
      COMPILATION_ERROR: 0
    };

    stats.forEach(stat => {
      verdictStats[stat._id as keyof typeof verdictStats] = stat.count;
    });

    const totalSubmissions = await Submission.countDocuments({ userId: req.user._id });
    const solvedProblems = req.user.solvedProblems.length;

    const response: ApiResponse = {
      success: true,
      message: 'Submission statistics retrieved successfully',
      data: {
        totalSubmissions,
        solvedProblems,
        byVerdict: verdictStats,
        score: req.user.score
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get submission stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin only - get all submissions
export const getAllSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    const {
      page = '1',
      limit = '20',
      problemId,
      userId,
      verdict
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};
    
    if (problemId) {
      filter.problemId = problemId;
    }

    if (userId) {
      filter.userId = userId;
    }

    if (verdict) {
      filter['result.verdict'] = verdict;
    }

    const submissions = await Submission.find(filter)
      .populate('problemId', 'title difficulty')
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Submission.countDocuments(filter);

    const response: ApiResponse = {
      success: true,
      message: 'All submissions retrieved successfully',
      data: {
        submissions,
        pagination: {
          current: pageNum,
          total: Math.ceil(total / limitNum),
          count: submissions.length,
          totalCount: total
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get queue statistics (Admin only) - Disabled for development
export const getQueueStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    // const queueStats = await getQueueStats(); // Disabled for now
    const queueStats = {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0
    };

    const response: ApiResponse = {
      success: true,
      message: 'Queue statistics retrieved successfully (mock data)',
      data: queueStats
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get queue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Check if submission is processing or get latest status
export const getSubmissionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    const submission = await Submission.findById(id)
      .populate('problemId', 'title difficulty');

    if (!submission) {
      res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
      return;
    }

    // Check if user owns this submission
    if (submission.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this submission'
      });
      return;
    }

    // Determine status
    let status = 'COMPLETED';
    if (submission.result.message === 'Submission is being processed...') {
      status = 'PROCESSING';
    }

    const response: ApiResponse = {
      success: true,
      message: 'Submission status retrieved successfully',
      data: {
        submissionId: submission._id,
        status,
        result: submission.result,
        submittedAt: submission.submittedAt
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get submission status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const runCode = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const validation = submitCodeSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.errors.map(err => err.message)
      });
      return;
    }

    const { problemId, code, language } = validation.data as SubmissionRequest;

    // Find the problem
    const problem = await Problem.findById(problemId);
    if (!problem) {
      res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
      return;
    }

    // Run code on sample test cases only (public test cases)
    console.log(`🔄 Running code for user ${req.user._id} on problem ${problemId}`);
    
    const publicTestCases = problem.testCases.filter(tc => tc.isPublic);
    const submissionResult = await codeExecutionService.runSubmission(
      code,
      language,
      publicTestCases
    );
    
    const testResults = submissionResult.testResults;

    const passedTests = testResults.filter(tr => tr.passed).length;

    const response: ApiResponse = {
      success: true,
      message: 'Code executed successfully',
      data: {
        testResults,
        totalTests: publicTestCases.length,
        passedTests,
        executionTime: testResults.reduce((sum, result) => sum + (result.executionTime || 0), 0)
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Route definitions
router.post('/submit', authenticateToken, submitCode);
router.post('/run', authenticateToken, runCode);
router.get('/', authenticateToken, getSubmissions);
router.get('/stats', authenticateToken, getSubmissionStats);
router.get('/all', authenticateToken, getAllSubmissions);
router.get('/queue', authenticateToken, getQueueStatus);
router.get('/:id', authenticateToken, getSubmissionById);
router.get('/:id/status', authenticateToken, getSubmissionStatus);

export default router;
