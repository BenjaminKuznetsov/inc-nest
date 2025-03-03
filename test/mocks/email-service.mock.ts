import { EmailService } from '../../src/modules/notifications/email.service';
import { UserDocument } from '../../src/modules/user-accounts/domain/user.entity';

export class EmailServiceMock extends EmailService {
  userRegistrationConfirmation(user: UserDocument) {
    console.log('Call mock method userRegistrationConfirmation / EmailServiceMock');
  }

  userRecoveryPassword(user: UserDocument) {
    console.log('Call mock method userRecoveryPassword / EmailServiceMock');
  }
}
