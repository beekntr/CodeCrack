import { Request, Response } from 'express';
import { User } from '../models/User';
import { Submission } from '../models/Submission';
import { ApiResponse, LeaderboardResponse } from '@shared/api';

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '50',
      timeframe = 'all'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Calculate date filter based on timeframe
    let dateFilter = {};
    const now = new Date();
    if (timeframe === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: oneWeekAgo } };
    } else if (timeframe === 'month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: oneMonthAgo } };
    }

    // Build user filter
    const userFilter = { role: 'user', ...dateFilter };

    // Get users sorted by score and solved problems
    const users = await User.find(userFilter)
      .select('name score solvedProblems createdAt')
      .sort({ score: -1, solvedProblems: -1, createdAt: 1 })
      .skip(skip)
      .limit(limitNum);

    // Build leaderboard with ranks
    const leaderboard = users.map((user, index) => ({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: '', // Don't expose email in leaderboard
        role: user.role,
        score: user.score,
        solvedProblems: user.solvedProblems.map(id => id.toString()),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      rank: skip + index + 1,
      score: user.score,
      solvedCount: user.solvedProblems.length
    }));

    // Get current user's rank if authenticated
    let userRank: number | undefined;
    if (req.user) {
      const userPosition = await User.countDocuments({
        role: 'user',
        $or: [
          { score: { $gt: req.user.score } },
          { 
            score: req.user.score, 
            solvedProblems: { $gt: req.user.solvedProblems.length } 
          },
          { 
            score: req.user.score, 
            solvedProblems: req.user.solvedProblems.length,
            createdAt: { $lt: req.user.createdAt }
          }
        ]
      });
      userRank = userPosition + 1;
    }

    const response: ApiResponse<LeaderboardResponse> = {
      success: true,
      message: 'Leaderboard retrieved successfully',
      data: {
        leaderboard,
        userRank
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getTopUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = '10' } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));

    const topUsers = await User.find({ role: 'user' })
      .select('name score solvedProblems')
      .sort({ score: -1, solvedProblems: -1 })
      .limit(limitNum);

    const response: ApiResponse = {
      success: true,
      message: 'Top users retrieved successfully',
      data: topUsers.map((user, index) => ({
        rank: index + 1,
        name: user.name,
        score: user.score,
        solvedCount: user.solvedProblems.length
      }))
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get top users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getLeaderboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { timeframe = 'all' } = req.query;

    // Calculate date filter based on timeframe  
    let dateFilter = {};
    const now = new Date();
    if (timeframe === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: oneWeekAgo } };
    } else if (timeframe === 'month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: oneMonthAgo } };
    }

    // Get overall statistics
    const totalUsers = await User.countDocuments({ role: 'user', ...dateFilter });
    const activeUsers = await User.countDocuments({ 
      role: 'user', 
      solvedProblems: { $not: { $size: 0 } },
      ...dateFilter
    });

    // Get top score
    const topScorer = await User.findOne({ role: 'user', ...dateFilter })
      .select('name score')
      .sort({ score: -1 });

    // Calculate average score
    const scoreStats = await User.aggregate([
      { $match: { role: 'user', ...dateFilter } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$score' },
          totalScore: { $sum: '$score' },
          maxScore: { $max: '$score' }
        }
      }
    ]);

    // Get submission statistics with date filter
    let submissionDateFilter = {};
    if (timeframe === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      submissionDateFilter = { submittedAt: { $gte: oneWeekAgo } };
    } else if (timeframe === 'month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      submissionDateFilter = { submittedAt: { $gte: oneMonthAgo } };
    }

    const submissionStats = await Submission.aggregate([
      { $match: submissionDateFilter },
      {
        $group: {
          _id: '$result.verdict',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSubmissions = await Submission.countDocuments(submissionDateFilter);

    // Get daily active users (users who submitted in the timeframe)
    const activeSubmitters = await Submission.distinct('userId', submissionDateFilter);

    const verdictStats = {
      ACCEPTED: 0,
      WRONG_ANSWER: 0,
      TIME_LIMIT_EXCEEDED: 0,
      MEMORY_LIMIT_EXCEEDED: 0,
      RUNTIME_ERROR: 0,
      COMPILATION_ERROR: 0
    };

    submissionStats.forEach(stat => {
      verdictStats[stat._id as keyof typeof verdictStats] = stat.count;
    });

    const avgScore = scoreStats.length > 0 ? Math.round(scoreStats[0].avgScore || 0) : 0;
    const maxScore = scoreStats.length > 0 ? scoreStats[0].maxScore || 0 : 0;

    const response: ApiResponse = {
      success: true,
      message: 'Leaderboard statistics retrieved successfully',
      data: {
        totalUsers,
        activeUsers,
        activeSubmitters: activeSubmitters.length,
        totalSubmissions,
        averageScore: avgScore,
        topScore: maxScore,
        topScorer: topScorer ? {
          name: topScorer.name,
          score: topScorer.score
        } : null,
        submissionsByVerdict: verdictStats,
        timeframe
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get leaderboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
