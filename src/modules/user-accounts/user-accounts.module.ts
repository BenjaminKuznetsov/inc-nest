import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepo } from './infrastructure/usersRepo';
import { UsersQueryRepo } from './infrastructure/users-query.repo';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from './application/jwt.service';
import { CryptoService } from './application/crypto.service';
import { Session, SessionSchema } from './domain/session.entity';
import { SessionsRepo } from './infrastructure/sessions-repo';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserAccountsConfig } from './config/user-accounts.config';

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
    UserAccountsConfig,
    UsersService,
    UsersRepo,
    UsersQueryRepo,
    AuthService,
    JwtService,
    CryptoService,
    SessionsRepo,
  ],
  exports: [UserAccountsConfig],
})
export class UserAccountsModule {}
