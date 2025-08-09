import { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthResponse } from '@shared/api';

// Temporary token storage (in production, use Redis or similar)
const tempTokens = new Map<string, { token: string, user: any, expires: number }>();

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [code, data] of tempTokens.entries()) {
    if (data.expires < now) {
      tempTokens.delete(code);
    }
  }
}, 5 * 60 * 1000);

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails?.[0]?.value });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      await user.save();
      return done(null, user);
    }

    // Create new user
    const newUser = new User({
      name: profile.displayName || profile.name?.givenName || 'Google User',
      email: profile.emails?.[0]?.value,
      googleId: profile.id,
      role: 'user'
    });

    await newUser.save();
    return done(null, newUser);

  } catch (error) {
    return done(error, null);
  }
}));

const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' });
};

const generateTempCode = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

export const googleCallback = (req: Request, res: Response): void => {
  passport.authenticate('google', { session: false }, (err: any, user: any) => {
    if (err) {
      console.error('Google auth error:', err);
      res.redirect(`${process.env.CLIENT_URL}/auth?error=google_auth_failed`);
      return;
    }

    if (!user) {
      res.redirect(`${process.env.CLIENT_URL}/auth?error=google_auth_cancelled`);
      return;
    }

    try {
      const token = generateToken(user._id.toString());
      const tempCode = generateTempCode();
      
      // Store token temporarily (expires in 5 minutes)
      tempTokens.set(tempCode, {
        token,
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          score: user.score,
          solvedProblems: user.solvedProblems.map((id: any) => id.toString()),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
      });
      
      // Debug logging
      console.log('OAuth callback - generated temp code:', tempCode);
      console.log('OAuth callback - redirecting to success page');
      
      // Redirect to client with temporary code
      res.redirect(`${process.env.CLIENT_URL}/auth/success?code=${tempCode}`);
    } catch (error) {
      console.error('Token generation error:', error);
      res.redirect(`${process.env.CLIENT_URL}/auth?error=token_generation_failed`);
    }
  })(req, res);
};

// New endpoint to exchange temporary code for token
export const exchangeTempCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Temporary code is required'
      });
      return;
    }

    const tempData = tempTokens.get(code);
    if (!tempData || tempData.expires < Date.now()) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired temporary code'
      });
      return;
    }

    // Delete the temporary code (one-time use)
    tempTokens.delete(code);

    const response: AuthResponse = {
      success: true,
      message: 'Google authentication successful',
      user: tempData.user,
      token: tempData.token
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token exchange'
    });
  }
};

export const googleAuthSuccess = async (req: Request, res: Response): Promise<void> => {
  try {
    // This endpoint is deprecated - using temporary code exchange instead
    res.status(410).json({
      success: false,
      message: 'This endpoint is deprecated. Use the new OAuth flow.'
    });
  } catch (error) {
    console.error('Google auth success error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};
