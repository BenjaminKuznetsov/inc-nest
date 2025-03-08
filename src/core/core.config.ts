import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateConfig } from './utils/config-validation';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { getEnumValues } from './utils/get-enum-values';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

@Injectable()
export class CoreConfig {
  @IsNumber({}, { message: 'Set Env variable PORT, example: 3000' })
  port: number = parseInt(this.configService.get('PORT'));

  @IsNotEmpty({ message: 'Set Env variable MONGO_URI, example: mongodb://localhost:27017/my-app-local-db' })
  mongoURI: string = this.configService.get('MONGO_URI');

  @IsEnum(Environments, {
    message: 'Ser correct NODE_ENV value, available values: ' + getEnumValues(Environments).join(', '),
  })
  env: string = this.configService.get('NODE_ENV');

  @IsNotEmpty({ message: 'Set Env variable ADMIN_AUTH, should match the format: login:password' })
  adminAuth: string = this.configService.get('ADMIN_AUTH');

  constructor(private configService: ConfigService<any, true>) {
    validateConfig(this);
  }
}
