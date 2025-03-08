import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { AccessTokenPayload, RefreshTokenPayload } from '../dto/token-payload';
import { UserAccountsConfig } from '../config/user-accounts.config';

@Injectable()
export class JwtService {
  constructor(
    private readonly config: UserAccountsConfig,
    private readonly jwt: NestJwtService,
  ) {}

  async createAccessToken(userId: string): Promise<string> {
    return this.jwt.signAsync(
      { userId },
      { expiresIn: this.config.accessTokenExpiresIn /*secret: this.config.jwtTokenSecret */ },
    );
  }

  async createRefreshToken(userId: string, deviceId: string): Promise<string> {
    return this.jwt.signAsync(
      { userId, deviceId },
      { expiresIn: this.config.refreshTokenExpiresIn /*secret: this.config.jwtTokenSecret*/ },
    );
  }

  async decodeRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwt.decode(token);
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      return await this.jwt.verifyAsync<AccessTokenPayload>(token);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      return await this.jwt.verifyAsync<RefreshTokenPayload>(token);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
