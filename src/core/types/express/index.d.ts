import 'express';

export interface UserContext {
  id: string;
  deviceId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}
