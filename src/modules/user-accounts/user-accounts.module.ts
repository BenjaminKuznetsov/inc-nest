import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepo } from './infrastructure/usersRepo';
import { UsersQueryRepo } from './infrastructure/users-query.repo';
import { AuthController } from './api/auth.controller';
import { UsersService } from './application/users.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from './application/jwt.service';
import { CryptoService } from './application/crypto.service';
import { Session, SessionSchema } from './domain/session.entity';
import { SessionsRepo } from './infrastructure/sessions-repo';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserAccountsConfig } from './config/user-accounts.config';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { ConfirmRegistrationUseCase } from './application/use-cases/confirm-registration.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { LogoutUserUseCase } from './application/use-cases/logout-user.use-case';
import { RecoverPasswordUseCase } from './application/use-cases/recover-password.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { ResendConfirmationEmailUseCase } from './application/use-cases/resend-confirmation-email.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { SessionsController } from './api/sessions.controller';
import { GetUserSessionsQueryHandler } from './application/queries/get-user-sessions.query-handler';
import { TerminateAllOtherSessionsUseCase } from './application/use-cases/terminate-all-other-sessions.use-case';
import { TerminateOneSessionUseCase } from './application/use-cases/terminate-one-session.use-case';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    JwtModule.registerAsync({
      imports: [UserAccountsModule],
      inject: [UserAccountsConfig],
      useFactory: (config: UserAccountsConfig) => ({
        secret: config.jwtTokenSecret,
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [UserAccountsModule],
      inject: [UserAccountsConfig],
      useFactory: (config: UserAccountsConfig) => [
        {
          ttl: config.tooManyRequestsTimeInSeconds * 1000,
          limit: config.tooManyRequestsCount,
        },
      ],
    }),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController, SessionsController],
  providers: [
    ChangePasswordUseCase,
    ConfirmRegistrationUseCase,
    CreateUserUseCase,
    CryptoService,
    DeleteUserUseCase,
    JwtService,
    LoginUserUseCase,
    LogoutUserUseCase,
    RecoverPasswordUseCase,
    RegisterUserUseCase,
    ResendConfirmationEmailUseCase,
    RefreshTokenUseCase,
    SessionsRepo,
    UserAccountsConfig,
    UsersQueryRepo,
    UsersRepo,
    UsersService,
    GetUserSessionsQueryHandler,
    TerminateAllOtherSessionsUseCase,
    TerminateOneSessionUseCase,
  ],
  exports: [MongooseModule, UserAccountsConfig, UsersRepo, JwtService],
})
export class UserAccountsModule {}
