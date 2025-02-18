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
import { appConfig } from '../../common/config/config';
import { JwtService } from './application/jwt.service';
import { CryptoService } from './application/crypto.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({ secret: appConfig.jwtSecret }),
  ],
  controllers: [UsersController, AuthController],
  providers: [UsersService, UsersRepo, UsersQueryRepo, AuthService, JwtService, CryptoService],
})
export class UserAccountsModule {}
