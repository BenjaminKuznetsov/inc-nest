import { EmailService } from '../../src/modules/notifications/email.service';
import { UserDocument } from '../../src/modules/user-accounts/domain/user.entity';

export class EmailServiceMock extends EmailService {
  userRegistrationConfirmation = jest.fn((user: UserDocument) => {
    // console.log('Call mock method userRegistrationConfirmation / EmailServiceMock');
    // console.log(user);
  });

  userRecoveryPassword = jest.fn((user: UserDocument) => {
    // console.log('Call mock method userRecoveryPassword / EmailServiceMock');
    // console.log(user);
  });
}
