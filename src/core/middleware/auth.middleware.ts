import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../modules/user-accounts/application/jwt.service';
import { UsersRepo } from '../../modules/user-accounts/infrastructure/usersRepo';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepo,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      return next();
    }

    try {
      const payload = await this.jwtService.verifyAccessToken(token);
      const user = await this.usersRepository.findById(payload.userId);

      if (user) {
        req.user = { id: payload.userId };
      }
    } catch (error) {
      // Не бросаем ошибку, просто идем дальше без пользователя
    }

    next();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
