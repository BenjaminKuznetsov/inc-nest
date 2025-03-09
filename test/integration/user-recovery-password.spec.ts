import { Test } from '@nestjs/testing';
import { EmailService } from '../../src/modules/notifications/email.service';
import { EmailServiceMock } from '../mocks/email-service.mock';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../../src/modules/user-accounts/dto/create-user.dto';
import { CustomBadRequestException } from '../../src/common/exception/bad-request';
import { delay } from '../helpers/utils';
import { AppModule } from '../../src/app.module';
import {
  RecoverPasswordCommand,
  RecoverPasswordUseCase,
} from '../../src/modules/user-accounts/application/use-cases/recover-password.use-case';
import {
  CreateUserCommand,
  CreateUserUseCase,
} from '../../src/modules/user-accounts/application/use-cases/create-user.use-case';
import {
  ChangePasswordCommand,
  ChangePasswordUseCase,
} from '../../src/modules/user-accounts/application/use-cases/change-password.use-case';
import {
  LoginUserCommand,
  LoginUserUseCase,
} from '../../src/modules/user-accounts/application/use-cases/login-user.use-case';

describe('user password recovery', () => {
  let dbConnection: any;
  let emailService: EmailService;
  let sendMailMock: jest.Mock;
  let passwordRecoveryUseCase: RecoverPasswordUseCase;
  let createUserUseCase: CreateUserUseCase;
  let changePasswordUseCase: ChangePasswordUseCase;
  let loginUserUseCase: LoginUserUseCase;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useClass(EmailServiceMock)
      .compile();

    dbConnection = moduleRef.get('DatabaseConnection');
    await dbConnection.dropDatabase();

    emailService = moduleRef.get(EmailService);
    passwordRecoveryUseCase = moduleRef.get(RecoverPasswordUseCase);
    createUserUseCase = moduleRef.get(CreateUserUseCase);
    changePasswordUseCase = moduleRef.get(ChangePasswordUseCase);
    loginUserUseCase = moduleRef.get(LoginUserUseCase);

    sendMailMock = emailService.userRecoveryPassword as jest.Mock;
  });

  afterEach(async () => {
    await dbConnection.dropDatabase();
  });

  it('shouldn`t send email if user isn`t registered', async () => {
    await expect(passwordRecoveryUseCase.execute(new RecoverPasswordCommand('user1@user1.com'))).rejects.toThrow(
      NotFoundException,
    );
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('should send email and change password', async () => {
    const user: CreateUserDto = {
      login: 'JohnDoe',
      email: 'johnan@john.com',
      password: 'johnjohn',
    };

    await createUserUseCase.execute(new CreateUserCommand(user));

    const newPassword = 'newPassword';

    // send email
    await expect(passwordRecoveryUseCase.execute(new RecoverPasswordCommand(user.email))).resolves.not.toThrow();
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const recoveryCode = sendMailMock.mock.lastCall![0].passwordRecovery!.recoveryCode;

    // change password
    await expect(
      changePasswordUseCase.execute(new ChangePasswordCommand({ recoveryCode, newPassword })),
    ).resolves.not.toThrow();

    // shouldn`t login with old password
    await expect(
      loginUserUseCase.execute(
        new LoginUserCommand({ loginOrEmail: user.email, password: user.password, userAgent: '', ip: '' }),
      ),
    ).rejects.toThrow(UnauthorizedException);

    // should login with new password
    await expect(
      loginUserUseCase.execute(
        new LoginUserCommand({ loginOrEmail: user.email, password: newPassword, userAgent: '', ip: '' }),
      ),
    ).resolves.not.toThrow();

    // shouldn`t change password with same recovery code twice
    await expect(
      changePasswordUseCase.execute(new ChangePasswordCommand({ recoveryCode, newPassword })),
    ).rejects.toThrow(CustomBadRequestException);
  });

  it.skip('shouldn`t change password with expired recovery code', async () => {
    // TODO: implement time mocking
    const user: CreateUserDto = {
      login: 'JohnDoe',
      email: 'johnan@john.com',
      password: 'johnjohn',
    };
    await createUserUseCase.execute(new CreateUserCommand(user));
    await passwordRecoveryUseCase.execute(new RecoverPasswordCommand(user.email));
    const recoveryCode = sendMailMock.mock.lastCall![0].passwordRecovery!.recoveryCode;
    await delay(5000);
    await expect(
      changePasswordUseCase.execute(new ChangePasswordCommand({ recoveryCode, newPassword: user.password })),
    ).rejects.toThrow(new CustomBadRequestException({ field: 'recoveryCode', message: 'Recovery code is expired' }));
  }, 10000);
});
