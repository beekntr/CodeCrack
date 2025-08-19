import "dotenv/config";
import express from "express";
import cors from "cors";
import passport from "passport";
import { connectDB } from "./config/database";
import { handleDemo } from "./routes/demo";

// Middleware imports
import { 
  apiLimiter, 
  authLimiter, 
  submissionLimiter, 
  errorHandler, 
  requestLogger, 
  validateInput 
} from "./middleware/security";
import { authenticateToken, requireAdmin, optionalAuth } from "./middleware/auth";

// Route imports
import { register, login, getProfile, updateProfile } from "./routes/auth";
import { googleAuth, googleCallback, googleAuthSuccess, exchangeTempCode } from "./routes/google-auth";
import { 
  createProblem, 
  getProblems, 
  getProblemById, 
  updateProblem, 
  deleteProblem, 
  getProblemStats 
} from "./routes/problems";
import { 
  submitCode, 
  runCode,
  getSubmissions, 
  getSubmissionById, 
  getSubmissionStats, 
  getAllSubmissions,
  getQueueStatus,
  getSubmissionStatus 
} from "./routes/submissions";
import { 
  getLeaderboard, 
  getTopUsers, 
  getLeaderboardStats 
} from "./routes/leaderboard";
import { 
  getDashboardStats, 
  getAllUsers, 
  updateUserRole, 
  deleteUser, 
  getSystemStats 
} from "./routes/admin";

export function createServer() {
  const app = express();

  // Initialize Passport
  app.use(passport.initialize());

  // Connect to database
  connectDB();

  // Global middleware
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://codecrack.netlify.app', 'https://your-domain.com']
      : ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:8081'],
    credentials: true
  }));
  
  app.use(requestLogger);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(validateInput);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime() 
    });
  });

  // Example API routes (keep for backward compatibility)
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/register", authLimiter, register);
  app.post("/api/auth/login", authLimiter, login);
  app.get("/api/auth/profile", authenticateToken, getProfile);
  app.put("/api/auth/profile", authenticateToken, updateProfile);
  
  // User stats route
  app.get("/api/users/stats", authenticateToken, async (req, res) => {
    try {
      const { User } = await import("./models/User");
      const { Problem } = await import("./models/Problem");
      const { Submission } = await import("./models/Submission");
      const user = req.user as any;
      
      // Get current user document
      const currentUser = await User.findById(user.id);
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Get user's submissions
      const submissions = await Submission.find({ userId: user.id });
      const acceptedSubmissions = submissions.filter(s => s.result.verdict === 'ACCEPTED');
      
      // Get all problems for total count
      const allProblems = await Problem.find();
      const totalProblems = allProblems.length;
      
      // Get solved problems count
      const problemsSolved = currentUser.solvedProblems.length;
      
      // Get user's current score
      const score = currentUser.score;
      
      // Get rank
      const userRank = await User.countDocuments({ 
        role: 'user', 
        score: { $gt: score } 
      }) + 1;
      
      // Get difficulty stats
      const difficultyStats = {
        easy: { solved: 0, total: allProblems.filter(p => p.difficulty === 'easy').length },
        medium: { solved: 0, total: allProblems.filter(p => p.difficulty === 'medium').length },
        hard: { solved: 0, total: allProblems.filter(p => p.difficulty === 'hard').length }
      };
      
      // Count solved problems by difficulty
      const solvedProblems = await Problem.find({ 
        _id: { $in: currentUser.solvedProblems } 
      }).select('difficulty');
      
      solvedProblems.forEach(problem => {
        if (problem.difficulty in difficultyStats) {
          difficultyStats[problem.difficulty as keyof typeof difficultyStats].solved++;
        }
      });
      
      // Get recent submissions with problem titles
      const recentSubmissions = await Submission.find({ userId: user.id })
        .sort({ submittedAt: -1 })
        .limit(10)
        .populate('problemId', 'title difficulty');
      
      const recentSubmissionsWithTitles = recentSubmissions.map(sub => {
        const problem = sub.problemId as any;
        // Calculate score based on problem difficulty
        const difficultyPoints = { easy: 10, medium: 20, hard: 30 };
        const submissionScore = sub.result.verdict === 'ACCEPTED' 
          ? difficultyPoints[problem.difficulty as keyof typeof difficultyPoints] || 0 
          : 0;
          
        return {
          _id: sub._id,
          problemTitle: problem.title,
          status: sub.result.verdict,
          score: submissionScore,
          submittedAt: sub.submittedAt,
          language: sub.language
        };
      });
      
      const stats = {
        totalSubmissions: submissions.length,
        acceptedSubmissions: acceptedSubmissions.length,
        problemsSolved,
        totalProblems,
        score,
        rank: userRank,
        recentSubmissions: recentSubmissionsWithTitles,
        difficultyStats
      };
      
      res.json({ stats });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ error: 'Failed to fetch user stats' });
    }
  });
  
  // Google OAuth routes
  app.get("/api/auth/google", googleAuth);
  app.get("/api/auth/google/callback", googleCallback);
  app.get("/api/auth/google/success", authenticateToken, googleAuthSuccess);
  app.get("/api/auth/google/exchange", exchangeTempCode);

  // Problems routes
  app.get("/api/problems", apiLimiter, optionalAuth, getProblems);
  app.get("/api/problems/stats", apiLimiter, getProblemStats);
  app.get("/api/problems/:id", apiLimiter, optionalAuth, getProblemById);
  app.post("/api/problems", apiLimiter, authenticateToken, requireAdmin, createProblem);
  app.put("/api/problems/:id", apiLimiter, authenticateToken, updateProblem);
  app.delete("/api/problems/:id", apiLimiter, authenticateToken, deleteProblem);

  // Submissions routes
  app.post("/api/submissions", submissionLimiter, authenticateToken, submitCode);
  app.post("/api/submissions/run", submissionLimiter, authenticateToken, runCode);
  app.get("/api/submissions", apiLimiter, authenticateToken, getSubmissions);
  app.get("/api/submissions/stats", apiLimiter, authenticateToken, getSubmissionStats);
  app.get("/api/submissions/:id", apiLimiter, authenticateToken, getSubmissionById);
  app.get("/api/submissions/:id/status", apiLimiter, authenticateToken, getSubmissionStatus);

  // Leaderboard routes
  app.get("/api/leaderboard", apiLimiter, optionalAuth, getLeaderboard);
  app.get("/api/leaderboard/top", apiLimiter, getTopUsers);
  app.get("/api/leaderboard/stats", apiLimiter, getLeaderboardStats);

  // Admin routes
  app.get("/api/admin/dashboard", apiLimiter, authenticateToken, requireAdmin, getDashboardStats);
  app.get("/api/admin/users", apiLimiter, authenticateToken, requireAdmin, getAllUsers);
  app.get("/api/admin/submissions", apiLimiter, authenticateToken, requireAdmin, getAllSubmissions);
  app.get("/api/admin/stats", apiLimiter, authenticateToken, requireAdmin, getSystemStats);
  app.get("/api/admin/queue", apiLimiter, authenticateToken, requireAdmin, getQueueStatus);
  app.put("/api/admin/users/:userId/role", apiLimiter, authenticateToken, requireAdmin, updateUserRole);
  app.delete("/api/admin/users/:userId", apiLimiter, authenticateToken, requireAdmin, deleteUser);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}
