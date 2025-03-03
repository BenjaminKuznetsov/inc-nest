import { mockUsers } from '../helpers/mock-data';
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

describe('user registration', () => {
  let authService: AuthService;
  let emailService: EmailService;

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
    })
      .overrideProvider(EmailService)
      .useClass(EmailServiceMock)
      .compile();

    authService = moduleRef.get(AuthService);
    emailService = moduleRef.get(EmailService);
  });

  it('should register user', async () => {
    await authService.userRegistration(mockUsers[0]);
    expect(emailService.userRegistrationConfirmation).toHaveBeenCalledTimes(1);
  });
});
