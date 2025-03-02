import { mockUsers } from '../helpers/mock-data';
import { ResultStatus } from '../../src/common/result/result.type';
import { emailAdapter } from '../../src/common/adapters/email.adapter';
import { emailManager } from '../../src/common/managers/email.manager';
import { UserDocument } from '../../src/features/user/domain/userModels';
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

describe('user registration', () => {
  let authService: AuthService;
  let emailService: EmailService;

  let user: UserDocument;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: Session.name, schema: SessionSchema },
        ]),
        JwtModule.register({ secret: appConfig.jwtSecret }),
        NotificationsModule,
      ],
      controllers: [UsersController, AuthController],
      providers: [UsersService, UsersRepo, UsersQueryRepo, AuthService, JwtService, CryptoService, SessionsRepo],
    }).compile();

    authService = moduleRef.get(AuthService);
    emailService = moduleRef.get(EmailService);
  });

  // afterEach(() => {
  //     // restore the spy created with spyOn
  //     // console.log("spy.mock.calls", spy.mock.calls)
  //     // jest.restoreAllMocks()
  //     // console.log("spy.mock.calls", spy.mock.calls)
  // })

  emailAdapter.sendEmail = jest.fn().mockImplementation(() => Promise.resolve(true));
  const sendEmailMock = emailAdapter.sendEmail as jest.Mock;

  const registerUserUseCase = authService.registerUser;
  // const confirmUserUseCase = authService.confirmUserRegistration
  // const resenCodeUseCase = authService.resendUserConfirmationEmail

  const spy = jest.spyOn(emailManager, 'userRegistrationConfirmation');

  it('should register user', async () => {
    await authService.userRegistration(mockUsers[0]);
    expect(emailService.userRegistrationConfirmation).toBeCalledTimes(1);
    expect(spy).toBeCalledTimes(1);
    user = spy.mock.calls[0][0];
  });

  // it("should not register user twice", async () => {
  //   const result = await registerUserUseCase(mockUsers[0])
  //   expect(result.status).toBe(ResultStatus.BadRequest)
  // })
  //
  // it("shouldn`t confirm user registration without confirmation code", async () => {
  //   const result = await confirmUserUseCase("")
  //   expect(result.status).toBe(ResultStatus.BadRequest)
  // })
  //
  // it("shouldn`t confirm user registration with wrong confirmation code", async () => {
  //   const result = await confirmUserUseCase("wrong confirmation code")
  //   expect(result.status).toBe(ResultStatus.BadRequest)
  // })
  //
  // it("should confirm user registration", async () => {
  //   const result = await confirmUserUseCase(user.emailConfirmation.confirmationCode!)
  //   expect(result.status).toBe(ResultStatus.Success)
  // })
  //
  // it("shouldn`t confirm user registration twice", async () => {
  //   const result = await confirmUserUseCase(user.emailConfirmation.confirmationCode!)
  //   expect(result.status).toBe(ResultStatus.BadRequest)
  //   expect(result.extensions[0].message).toBe("Confirmation code is already applied")
  // })
  //
  // it("shouldn`t confirm user registration with expired confirmation code", async () => {
  //   const result = await registerUserUseCase(mockUsers[1])
  //   expect(result.status).toBe(ResultStatus.Success)
  //   const newUser = spy.mock.calls[0][0]
  //   await UserModel.updateOne({ _id: new ObjectId(newUser.id) }, { $set: { "emailConfirmation.expirationDate": new Date() } })
  //   const result2 = await confirmUserUseCase(newUser.emailConfirmation.confirmationCode!)
  //   expect(result2.status).toBe(ResultStatus.BadRequest)
  // })
  //
  // it("shouldn`t resend user confirmation email if user is already confirmed ", async () => {
  //   const result = await resenCodeUseCase(user.email)
  //   expect(result.status).toBe(ResultStatus.BadRequest)
  // })
  //
  // it("shouldn`t resend user confirmation email if user with such email doesn`t exist", async () => {
  //   const result = await resenCodeUseCase("user1@user1.com")
  //   expect(result.status).toBe(ResultStatus.BadRequest)
  // })
  //
  // it("should resend user confirmation email", async () => {
  //   const result = await registerUserUseCase(mockUsers[2])
  //   expect(result.status).toBe(ResultStatus.Success)
  //   const newUser = spy.mock.calls[2][0]
  //   const emailSenderCallsCount = sendEmailMock.mock.calls.length
  //   const result2 = await resenCodeUseCase(newUser.email)
  //   expect(result2.status).toBe(ResultStatus.Success)
  //   expect(emailAdapter.sendEmail).toBeCalledTimes(emailSenderCallsCount + 1)
  // })
});
