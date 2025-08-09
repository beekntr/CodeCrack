// Production configuration for frontend
export const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.orbittrails.com' 
    : 'http://localhost:8080',
  
  APP_NAME: 'CodeCrack',
  VERSION: '1.0.0',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID || '610259698749-qoohs1d72ph2cqqgms8pktg1mqgbhedp.apps.googleusercontent.com',
  
  // Other configurations
  MAX_FILE_SIZE: 1024 * 1024, // 1MB
  SUPPORTED_LANGUAGES: ['python', 'cpp', 'javascript', 'java'] as const,
  
  // Frontend routes
  ROUTES: {
    HOME: '/',
    PROBLEMS: '/problems',
    LEADERBOARD: '/leaderboard',
    DASHBOARD: '/dashboard',
    AUTH: '/auth',
    PROBLEM_SOLVER: '/problems/:id'
  }
};

export default config;
