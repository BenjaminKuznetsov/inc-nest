import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../../modules/user-accounts/application/jwt.service';
import { UserAccountsConfig } from '../../modules/user-accounts/config/user-accounts.config';

@Injectable()
export class RefreshTokenAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: UserAccountsConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const cookieName = this.config.refreshTokenCookieName;

    const cookies = request.cookies;
    if (!cookies) {
      throw new UnauthorizedException();
    }

    const refreshToken = cookies[cookieName];

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const payload = await this.jwtService.verifyRefreshToken(refreshToken);

    request.user = { id: payload.userId, deviceId: payload.deviceId, iat: payload.iat };

    return true;
  }
}
