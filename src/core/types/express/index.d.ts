import 'express';

export interface UserContext {
  id: string;
  deviceId?: string;
  // TODO: iat надо отсюда убрать - это временное решение для того, чтобы определять актуальность refresh токена
  // эти данные используются только в SessionsRepo.getSession
  // Надо подумать, как зарефакторить
  iat?: number; // когда был создан refresh токен
}

declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}
