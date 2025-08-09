import { Request, Response } from 'express';
import { z } from 'zod';
import { Problem } from '../models/Problem';
import { User } from '../models/User';
import { CreateProblemRequest, ApiResponse } from '@shared/api';

// Validation schemas
const createProblemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(10000, 'Description too long'),
  inputFormat: z.string().min(1, 'Input format is required').max(2000, 'Input format too long'),
  outputFormat: z.string().min(1, 'Output format is required').max(2000, 'Output format too long'),
  constraints: z.string().min(1, 'Constraints are required').max(2000, 'Constraints too long'),
  testCases: z.array(z.object({
    input: z.string().min(1, 'Test case input is required'),
    expectedOutput: z.string().min(1, 'Test case expected output is required'),
    isPublic: z.boolean().default(true)
  })).min(1, 'At least one test case is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string().max(50, 'Tag too long')).default([])
});

const updateProblemSchema = createProblemSchema.partial();

export const createProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const validation = createProblemSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.errors.map(err => err.message)
      });
      return;
    }

    const problemData = validation.data as CreateProblemRequest;

    // Check if problem with same title exists
    const existingProblem = await Problem.findOne({ title: problemData.title });
    if (existingProblem) {
      res.status(400).json({
        success: false,
        message: 'Problem with this title already exists'
      });
      return;
    }

    const problem = new Problem({
      ...problemData,
      createdBy: req.user._id
    });

    await problem.save();

    const response: ApiResponse = {
      success: true,
      message: 'Problem created successfully',
      data: problem
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProblems = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      difficulty,
      tags,
      search
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};
    
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty as string)) {
      filter.difficulty = difficulty;
    }

    if (tags && typeof tags === 'string') {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      if (tagArray.length > 0) {
        filter.tags = { $in: tagArray };
      }
    }

    if (search && typeof search === 'string') {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get problems (exclude private test cases for non-admin users)
    const problems = await Problem.find(filter)
      .select('-testCases.expectedOutput') // Hide expected outputs
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Problem.countDocuments(filter);

    // For non-admin users, only show public test cases
    const sanitizedProblems = problems.map(problem => {
      const problemObj = problem.toObject();
      if (!req.user || req.user.role !== 'admin') {
        problemObj.testCases = problemObj.testCases
          .filter(tc => tc.isPublic)
          .map(tc => ({
            input: tc.input,
            expectedOutput: '', // Hide expected output
            isPublic: tc.isPublic
          }));
      }
      return problemObj;
    });

    const response: ApiResponse = {
      success: true,
      message: 'Problems retrieved successfully',
      data: {
        problems: sanitizedProblems,
        pagination: {
          current: pageNum,
          total: Math.ceil(total / limitNum),
          count: problems.length,
          totalCount: total
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProblemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id)
      .populate('createdBy', 'name');

    if (!problem) {
      res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
      return;
    }

    const problemObj = problem.toObject();

    // For non-admin users, only show public test cases and hide expected outputs
    if (!req.user || req.user.role !== 'admin') {
      problemObj.testCases = problemObj.testCases
        .filter(tc => tc.isPublic)
        .map(tc => ({
          input: tc.input,
          expectedOutput: '', // Hide expected output
          isPublic: tc.isPublic
        }));
    }

    const response: ApiResponse = {
      success: true,
      message: 'Problem retrieved successfully',
      data: problemObj
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    const validation = updateProblemSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.errors.map(err => err.message)
      });
      return;
    }

    const updateData = validation.data;

    // Find the problem
    const problem = await Problem.findById(id);
    if (!problem) {
      res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
      return;
    }

    // Check permissions (only admin or creator can update)
    if (req.user.role !== 'admin' && problem.createdBy.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this problem'
      });
      return;
    }

    // Check if title already exists (if updating title)
    if (updateData.title && updateData.title !== problem.title) {
      const existingProblem = await Problem.findOne({ title: updateData.title });
      if (existingProblem) {
        res.status(400).json({
          success: false,
          message: 'Problem with this title already exists'
        });
        return;
      }
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    const response: ApiResponse = {
      success: true,
      message: 'Problem updated successfully',
      data: updatedProblem
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    const problem = await Problem.findById(id);
    if (!problem) {
      res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
      return;
    }

    // Check permissions (only admin or creator can delete)
    if (req.user.role !== 'admin' && problem.createdBy.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this problem'
      });
      return;
    }

    await Problem.findByIdAndDelete(id);

    // Remove this problem from all users' solved problems
    await User.updateMany(
      { solvedProblems: id },
      { $pull: { solvedProblems: id } }
    );

    const response: ApiResponse = {
      success: true,
      message: 'Problem deleted successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProblemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Problem.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Problem.countDocuments();
    
    const difficultyStats = {
      easy: 0,
      medium: 0,
      hard: 0
    };

    stats.forEach(stat => {
      difficultyStats[stat._id as keyof typeof difficultyStats] = stat.count;
    });

    const response: ApiResponse = {
      success: true,
      message: 'Problem statistics retrieved successfully',
      data: {
        total,
        byDifficulty: difficultyStats
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get problem stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
