import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '../../application/jwt.service';
import { UsersService } from '../../application/users.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../../core/decorators/isPublic';
import { Request } from 'express';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private reflector: Reflector,
  ) {}

  // TODO: move token parsing to middleware
  async canActivate(context: ExecutionContext): Promise<true> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      // TODO: replace with domain exception
      throw new UnauthorizedException();
    }

    const payload = await this.jwtService.verifyAccessToken(token);
    const user = await this.usersService.findById(payload.userId);
    if (!user) {
      // TODO: replace with domain exception
      throw new UnauthorizedException();
    }

    req.user = {
      userId: payload.userId,
    };

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
