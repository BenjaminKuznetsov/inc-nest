import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../src/modules/user-accounts/domain/user.entity';
import { Session, SessionSchema } from '../../src/modules/user-accounts/domain/session.entity';
import { JwtModule } from '@nestjs/jwt';
import { appConfig } from '../../src/common/config/config';
import { NotificationsModule } from '../../src/modules/notifications/notifications.module';
import { UsersController } from '../../src/modules/user-accounts/api/users.controller';
import { AuthController } from '../../src/modules/user-accounts/api/auth.controller';
import { UsersService } from '../../src/modules/user-accounts/application/users.service';
import { UsersRepo } from '../../src/modules/user-accounts/infrastructure/usersRepo';
import { UsersQueryRepo } from '../../src/modules/user-accounts/infrastructure/users-query.repo';
import { AuthService } from '../../src/modules/user-accounts/application/auth.service';
import { JwtService } from '../../src/modules/user-accounts/application/jwt.service';
import { CryptoService } from '../../src/modules/user-accounts/application/crypto.service';
import { SessionsRepo } from '../../src/modules/user-accounts/infrastructure/sessions-repo';
import { EmailService } from '../../src/modules/notifications/email.service';
import { EmailServiceMock } from '../mocks/email-service.mock';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../../src/modules/user-accounts/dto/create-user.dto';
import { CustomBadRequestException } from '../../src/common/exception/bad-request';
import { delay } from '../helpers/utils';

describe('user password recovery', () => {
  let dbConnection;
  let authService: AuthService;
  let userService: UsersService;
  let emailService: EmailService;
  let sendMailMock: jest.Mock;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost/nest-blogger-platform'),
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: Session.name, schema: SessionSchema },
        ]),
        JwtModule.register({ secret: appConfig.jwtSecret }),
        NotificationsModule,
      ],
      controllers: [UsersController, AuthController],
      providers: [UsersService, UsersRepo, UsersQueryRepo, AuthService, JwtService, CryptoService, SessionsRepo],
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
