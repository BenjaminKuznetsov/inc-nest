import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { appConfig } from '../../../common/config/config';
import { AccessTokenPayload, RefreshTokenPayload } from '../dto/token-payload';

@Injectable()
export class JwtService {
  constructor(private readonly jwt: NestJwtService) {}

  async createAccessToken(userId: string): Promise<string> {
    return this.jwt.signAsync({ userId }, { expiresIn: appConfig.accessTokenExp });
  }

  async createRefreshToken(userId: string, deviceId: string): Promise<string> {
    return this.jwt.signAsync({ userId, deviceId }, { expiresIn: appConfig.refreshTokenExp });
  }

  async decodeRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwt.decode(token);
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      return this.jwt.verifyAsync<AccessTokenPayload>(token);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      return this.jwt.verifyAsync<RefreshTokenPayload>(token);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
