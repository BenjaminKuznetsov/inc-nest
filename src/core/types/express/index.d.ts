import 'express';

export interface UserContext {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}
