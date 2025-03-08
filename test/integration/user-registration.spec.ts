import { mockUsers } from '../helpers/mock-data';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfirmationStatus, User, UserDocument } from '../../src/modules/user-accounts/domain/user.entity';
import { AuthService } from '../../src/modules/user-accounts/application/auth.service';
import { EmailService } from '../../src/modules/notifications/email.service';
import { EmailServiceMock } from '../mocks/email-service.mock';
import { CustomBadRequestException } from '../../src/common/exception/bad-request';
import { BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { AppModule } from '../../src/app.module';

describe('user registration', () => {
  let authService: AuthService;
  let emailService: EmailService;
  let sendMailMock: jest.Mock;
  let user: UserDocument;
  let UserModel;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useClass(EmailServiceMock)
      .compile();

    const connection = moduleRef.get('DatabaseConnection');
    await connection.dropDatabase();

    authService = moduleRef.get(AuthService);
    emailService = moduleRef.get(EmailService);
    sendMailMock = emailService.userRegistrationConfirmation as jest.Mock;

    UserModel = moduleRef.get<Model<User>>(getModelToken(User.name));
  });

  it('should register user', async () => {
    await expect(authService.userRegistration(mockUsers[0])).resolves.not.toThrow();
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    user = sendMailMock.mock.calls[0][0];
    expect(user.email).toBe(mockUsers[0].email);
  });

  it('should not register user twice', async () => {
    await expect(authService.userRegistration(mockUsers[0])).rejects.toThrow(CustomBadRequestException);
  });

  it('shouldn`t confirm user registration without confirmation code', async () => {
    await expect(authService.confirmUserRegistration('')).rejects.toThrow(BadRequestException);
  });

  it('shouldn`t confirm user registration with wrong confirmation code', async () => {
    await expect(authService.confirmUserRegistration('wrong confirmation code')).rejects.toThrow(
      CustomBadRequestException,
    );
  });

  it('should confirm user registration', async () => {
    await expect(authService.confirmUserRegistration(user.emailConfirmation.confirmationCode!)).resolves.not.toThrow();
  });

  it('shouldn`t confirm user registration twice', async () => {
    await expect(authService.confirmUserRegistration(user.emailConfirmation.confirmationCode!)).rejects.toThrow(
      new CustomBadRequestException({ field: 'code', message: 'Confirmation code is already applied' }),
    );
  });

  it('shouldn`t confirm user registration with expired confirmation code', async () => {
    await UserModel.findById(user.id).then((user: UserDocument) => {
      // @ts-ignore
      user.emailConfirmation = {
        confirmationStatus: ConfirmationStatus.NOT_CONFIRMED,
        confirmationCode: user.emailConfirmation.confirmationCode,
        expirationDate: new Date(),
      };
    });

    await expect(authService.confirmUserRegistration(user.emailConfirmation.confirmationCode!)).rejects.toThrow(
      new CustomBadRequestException({ field: 'code', message: 'Confirmation code is expired' }),
    );
  });

  it('shouldn`t resend user confirmation email if user is already confirmed ', async () => {
    await UserModel.findByIdAndUpdate(user.id, {
      'emailConfirmation.confirmationStatus': ConfirmationStatus.CONFIRMED,
    });
    await expect(authService.resendUserConfirmationEmail(user.email)).rejects.toThrow(
      new CustomBadRequestException({ field: 'email', message: 'User with this email is already confirmed' }),
    );
  });

  it('shouldn`t resend user confirmation email if user with such email doesn`t exist', async () => {
    await expect(authService.resendUserConfirmationEmail(user.email)).rejects.toThrow(
      new CustomBadRequestException({ field: 'email', message: 'User with such email doesn`t exist' }),
    );
  });

  it('should resend user confirmation email', async () => {
    await expect(authService.userRegistration(mockUsers[1])).resolves.not.toThrow();
    const newUser = sendMailMock.mock.calls[1][0];
    await expect(authService.resendUserConfirmationEmail(newUser.email)).resolves.not.toThrow();
  });
});
