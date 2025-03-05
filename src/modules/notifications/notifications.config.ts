import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEmail, IsNotEmpty, ValidateIf } from 'class-validator';
import { Environments } from '../../core/core.config';
import { validateConfig } from '../../core/utils/config-validation';

@Injectable()
export class NotificationsConfig {
  @ValidateIf(() => process.env.NODE_ENV !== Environments.TESTING)
  @IsNotEmpty({ message: 'Set Env variable EMAIL_SERVICE_HOST, example: smtp.mail.ru' })
  emailServiceHost: string = this.configService.get('EMAIL_SERVICE_HOST');

  @ValidateIf(() => process.env.NODE_ENV !== Environments.TESTING)
  @IsEmail({}, { message: 'Set Env variable EMAIL_SERVICE_EMAIL, should be correct email' })
  emailServiceEmail: string = this.configService.get('EMAIL_SERVICE_EMAIL');

  @ValidateIf(() => process.env.NODE_ENV !== Environments.TESTING)
  @IsNotEmpty({ message: 'Set Env variable EMAIL_SERVICE_PASSWORD, should not be empty in non-testing environments' })
  emailServicePassword: string = this.configService.get('EMAIL_SERVICE_PASSWORD');

  constructor(private configService: ConfigService<any, true>) {
    validateConfig(this);
  }
}
