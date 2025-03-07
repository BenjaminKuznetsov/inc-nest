import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateConfig } from '../../../core/utils/config-validation';
import { IsNotEmpty, Matches } from 'class-validator';

@Injectable()
export class UserAccountsConfig {
  @IsNotEmpty({ message: 'Set Env variable ACCESS_TOKEN_SECRET, should be not empty' })
  accessTokenSecret: string = this.configService.get('ACCESS_TOKEN_SECRET');

  @IsNotEmpty({ message: 'Set Env variable REFRESH_TOKEN_SECRET, should be not empty' })
  refreshTokenSecret: string = this.configService.get('REFRESH_TOKEN_SECRET');

  @IsNotEmpty({ message: 'Set Env variable ADMIN_AUTH, should match the format: login:password' })
  adminAuth: string = this.configService.get('ADMIN_AUTH');

  @Matches(/^\d+[smhd]$/, {
    message: 'Set Env variable ACCESS_TOKEN_EXPIRES_IN, should match format like "60s", "10m", "1h", "1d"',
  })
  accessTokenExpiresIn: string = this.configService.get('ACCESS_TOKEN_EXPIRES_IN');

  @Matches(/^\d+[smhd]$/, {
    message: 'Set Env variable REFRESH_TOKEN_EXPIRES_IN, should match format like "60s", "10m", "1h", "1d"',
  })
  refreshTokenExpiresIn: string = this.configService.get('REFRESH_TOKEN_EXPIRES_IN');

  @IsNotEmpty({ message: 'Set Env variable REFRESH_TOKEN_COOKIE_NAME, should be not empty' })
  refreshTokenCookieName: string = this.configService.get('REFRESH_TOKEN_COOKIE_NAME');

  constructor(private configService: ConfigService<any, true>) {
    validateConfig(this);
  }
}
