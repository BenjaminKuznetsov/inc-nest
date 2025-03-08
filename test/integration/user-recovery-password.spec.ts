import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/modules/user-accounts/application/users.service';
import { AuthService } from '../../src/modules/user-accounts/application/auth.service';
import { EmailService } from '../../src/modules/notifications/email.service';
import { EmailServiceMock } from '../mocks/email-service.mock';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../../src/modules/user-accounts/dto/create-user.dto';
import { CustomBadRequestException } from '../../src/common/exception/bad-request';
import { delay } from '../helpers/utils';
import { AppModule } from '../../src/app.module';

describe('user password recovery', () => {
  let dbConnection: any;
  let authService: AuthService;
  let userService: UsersService;
  let emailService: EmailService;
  let sendMailMock: jest.Mock;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useClass(EmailServiceMock)
      .compile();

    dbConnection = moduleRef.get('DatabaseConnection');
    await dbConnection.dropDatabase();

    authService = moduleRef.get(AuthService);
    emailService = moduleRef.get(EmailService);
    userService = moduleRef.get(UsersService);
    sendMailMock = emailService.userRecoveryPassword as jest.Mock;
  });

  afterEach(async () => {
    await dbConnection.dropDatabase();
  });

  it('shouldn`t send email if user isn`t registered', async () => {
    await expect(authService.passwordRecovery('user1@user1.com')).rejects.toThrow(NotFoundException);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('should send email and change password', async () => {
    const user: CreateUserDto = {
      login: 'JohnDoe',
      email: 'johnan@john.com',
      password: 'johnjohn',
    };

    await userService.createUser(user);

    const newPassword = 'newPassword';

    // send email
    await expect(authService.passwordRecovery(user.email)).resolves.not.toThrow();
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const recoveryCode = sendMailMock.mock.lastCall![0].passwordRecovery!.recoveryCode;

    // change password
    await expect(authService.newPassword({ recoveryCode, newPassword })).resolves.not.toThrow();

    // shouldn`t login with old password
    await expect(
      authService.loginUser({ loginOrEmail: user.email, password: user.password, userAgent: '', ip: '' }),
    ).rejects.toThrow(UnauthorizedException);

    // should login with new password
    await expect(
      authService.loginUser({ loginOrEmail: user.email, password: newPassword, userAgent: '', ip: '' }),
    ).resolves.not.toThrow();

    // shouldn`t change password with same recovery code twice
    await expect(authService.newPassword({ recoveryCode, newPassword })).rejects.toThrow(CustomBadRequestException);
  });

  it.skip('shouldn`t change password with expired recovery code', async () => {
    // TODO: implement time mocking
    const user: CreateUserDto = {
      login: 'JohnDoe',
      email: 'johnan@john.com',
      password: 'johnjohn',
    };
    await userService.createUser(user);
    await authService.passwordRecovery(user.email);
    const recoveryCode = sendMailMock.mock.lastCall![0].passwordRecovery!.recoveryCode;
    await delay(5000);
    await expect(authService.newPassword({ recoveryCode, newPassword: user.password })).rejects.toThrow(
      new CustomBadRequestException({ field: 'recoveryCode', message: 'Recovery code is expired' }),
    );
  }, 10000);
});
