// Type declarations for CodeCrack backend
import { IUser } from '../server/models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
