import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { NotificationsConfig } from './notifications.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [NotificationsModule],
      inject: [NotificationsConfig],
      useFactory: (notificationsConfig: NotificationsConfig) => ({
        transport: {
          service: notificationsConfig.emailServiceHost,
          auth: {
            user: notificationsConfig.emailServiceEmail,
            pass: notificationsConfig.emailServicePassword,
          },
        },
        defaults: {
          from: `Benjamin <${notificationsConfig.emailServiceEmail}>`,
        },
      }),
    }),
  ],
  providers: [NotificationsConfig, EmailService],
  exports: [EmailService, NotificationsConfig],
})
export class NotificationsModule {}
