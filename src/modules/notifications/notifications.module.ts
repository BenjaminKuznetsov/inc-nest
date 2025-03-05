import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { appConfig } from '../../common/config/config';
import { EmailService } from './email.service';
import { NotificationsConfig } from './notifications.config';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: appConfig.mailService,
        auth: {
          user: appConfig.mailRuAddress,
          pass: appConfig.mailRuPass,
        },
      },
      defaults: {
        from: `Benjamin <${appConfig.mailRuAddress}>`,
      },
    }),
  ],
  providers: [NotificationsConfig, EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
