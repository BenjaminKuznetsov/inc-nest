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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    // TODO: подключить конфиг
    JwtModule.registerAsync({
      imports: [UserAccountsModule],
      inject: [UserAccountsConfig],
      useFactory: (config: UserAccountsConfig) => ({
        secret: config.jwtTokenSecret,
      }),
    }),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController],
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
    SessionsRepo,
    UserAccountsConfig,
    UsersQueryRepo,
    UsersRepo,
    UsersService,
  ],
  exports: [MongooseModule, UserAccountsConfig, UsersRepo, JwtService],
})
export class UserAccountsModule {}
