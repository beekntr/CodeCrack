import { Request, Response } from 'express';
import { User } from '../models/User';
import { Problem } from '../models/Problem';
import { Submission } from '../models/Submission';
import { ApiResponse } from '@shared/api';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    // Get basic counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProblems = await Problem.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ 
      role: 'user',
      createdAt: { $gte: sevenDaysAgo } 
    });
    const recentSubmissions = await Submission.countDocuments({ 
      submittedAt: { $gte: sevenDaysAgo } 
    });

    // Get problem difficulty distribution
    const problemsByDifficulty = await Problem.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get submission verdicts distribution
    const submissionsByVerdict = await Submission.aggregate([
      {
        $group: {
          _id: '$result.verdict',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get language popularity
    const languageStats = await Submission.aggregate([
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get top users
    const topUsers = await User.find({ role: 'user' })
      .select('name email score solvedProblems createdAt')
      .sort({ score: -1 })
      .limit(10);

    // Get recent submissions
    const recentSubmissionsList = await Submission.find()
      .populate('userId', 'name email')
      .populate('problemId', 'title difficulty')
      .sort({ submittedAt: -1 })
      .limit(10)
      .select('-code');

    const response: ApiResponse = {
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        overview: {
          totalUsers,
          totalProblems,
          totalSubmissions,
          recentUsers,
          recentSubmissions
        },
        charts: {
          problemsByDifficulty: problemsByDifficulty.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {} as Record<string, number>),
          submissionsByVerdict: submissionsByVerdict.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {} as Record<string, number>),
          languageStats
        },
        lists: {
          topUsers,
          recentSubmissions: recentSubmissionsList
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
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
      search,
      role
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};
    
    if (role && ['user', 'admin'].includes(role as string)) {
      filter.role = role;
    }

    if (search && typeof search === 'string') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('solvedProblems', 'title difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(filter);

    const response: ApiResponse = {
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          current: pageNum,
          total: Math.ceil(total / limitNum),
          count: users.length,
          totalCount: total
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
      return;
    }

    // Prevent admins from demoting themselves
    if (userId === req.user._id.toString() && role === 'user') {
      res.status(400).json({
        success: false,
        message: 'Cannot demote yourself'
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: `User role updated to ${role}`,
      data: user
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    const { userId } = req.params;

    // Prevent admins from deleting themselves
    if (userId === req.user._id.toString()) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete yourself'
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Delete user's submissions
    await Submission.deleteMany({ userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    // Get daily activity for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const dailySubmissions = await Submission.aggregate([
      {
        $match: {
          submittedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$submittedAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dailyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          role: 'user'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get performance metrics
    const avgSubmissionsPerUser = await User.aggregate([
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'userId',
          as: 'submissions'
        }
      },
      {
        $group: {
          _id: null,
          avgSubmissions: { $avg: { $size: '$submissions' } }
        }
      }
    ]);

    const avgSolvedPerUser = await User.aggregate([
      {
        $match: { role: 'user' }
      },
      {
        $group: {
          _id: null,
          avgSolved: { $avg: { $size: '$solvedProblems' } }
        }
      }
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'System statistics retrieved successfully',
      data: {
        activity: {
          dailySubmissions,
          dailyRegistrations
        },
        performance: {
          avgSubmissionsPerUser: avgSubmissionsPerUser[0]?.avgSubmissions || 0,
          avgSolvedPerUser: avgSolvedPerUser[0]?.avgSolved || 0
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
