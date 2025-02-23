import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { UserDocument } from '../user-accounts/domain/user.entity';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  userRegistrationConfirmation(user: UserDocument) {
    const emailContent = `<h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
                <a href='https://somesite.com/confirm-email?code=${user.emailConfirmation.confirmationCode}'>complete registration</a> 
            </p>`;

    this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Registration confirmation',
        html: emailContent,
      })
      .catch(console.error);
  }

  userRecoveryPassword(user: UserDocument) {
    const emailContent = `<h1>Password recovery</h1>
            <p>To recover password please follow the link below:
                <a href='https://somesite.com/recovery-password?recoveryCode=${user.passwordRecovery!.recoveryCode}'>complete password recovery</a> 
            </p>`;

    this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Password recovery',
        html: emailContent,
      })
      .catch(console.error);
  }
}
