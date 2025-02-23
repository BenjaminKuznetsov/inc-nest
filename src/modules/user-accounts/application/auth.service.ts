import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfirmationStatus, UserDocument } from '../domain/user.entity';
import { UsersRepo } from '../infrastructure/usersRepo';
import { CryptoService } from './crypto.service';
import { LoginUserDto } from '../dto/login-user.dto';
import { JwtService } from './jwt.service';
import { LoginViewDto } from '../api/view-dto/login.view-dto';
import { CreateUserInputDto } from '../api/input-dto/users.input-dto';
import { UsersService } from './users.service';
import { CustomBadRequestException } from '../../../common/exception/bad-request';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { ChangePasswordInputDto } from '../api/input-dto/change-password.input-dto';
import { SessionsRepo } from '../infrastructure/sessions-repo';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionModelType } from '../domain/session.entity';
import { LoginResultDto } from '../dto/login-result.dto';
import { EmailService } from '../../notifications/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepo: UsersRepo,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly sessionsRepo: SessionsRepo,
    @InjectModel(Session.name) private SessionModel: SessionModelType,
    private readonly emailService: EmailService,
  ) {}

  async checkCredentials(loginOrEmail: string, password: string): Promise<UserDocument> {
    const user = await this.usersRepo.getByLoginOrEmail(loginOrEmail);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordCorrect = await this.cryptoService.checkPassword(password, user.passwordHash);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async userRegistration(input: CreateUserInputDto) {
    const createdUserId = await this.usersService.createUser(input);
    const createdUser = await this.usersRepo.findById(createdUserId);
    this.emailService.userRegistrationConfirmation(createdUser!);
  }

  async confirmUserRegistration(code: string) {
    const user = await this.usersRepo.getUserByConfirmationCode(code);

    if (!user) {
      throw new CustomBadRequestException({ field: 'code', message: 'Confirmation code is invalid' });
    }

    if (user.emailConfirmation.confirmationStatus !== ConfirmationStatus.NOT_CONFIRMED) {
      throw new CustomBadRequestException({ field: 'code', message: 'Confirmation code is already applied' });
    }

    if (user.emailConfirmation.expirationDate! < new Date()) {
      throw new CustomBadRequestException({ field: 'code', message: 'Confirmation code is expired' });
    }

    await this.usersRepo.setUserAsConfirmed(user.id);
  }

  async resendUserConfirmationEmail(email: string) {
    const user: UserDocument | null = await this.usersRepo.getUserByFilter({ email });

    if (!user) {
      throw new CustomBadRequestException({ field: 'email', message: 'User with such email doesn`t exist' });
    }

    if (user.emailConfirmation.confirmationStatus !== ConfirmationStatus.NOT_CONFIRMED) {
      throw new CustomBadRequestException({ field: 'email', message: 'User with this email is already confirmed' });
    }

    user.emailConfirmation.confirmationCode = randomUUID();
    user.emailConfirmation.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });

    await this.usersRepo.save(user);

    this.emailService.userRegistrationConfirmation(user);
  }

  async passwordRecovery(email: string) {
    const user: UserDocument | null = await this.usersRepo.getUserByFilter({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.passwordRecovery = {
      recoveryCode: randomUUID(),
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 30,
      }),
    };
    await this.usersRepo.save(user);

    this.emailService.userRecoveryPassword(user);
  }

  async newPassword({ recoveryCode, newPassword }: ChangePasswordInputDto) {
    const user = await this.usersRepo.getUserByRecoveryCode(recoveryCode);
    if (!user) {
      throw new CustomBadRequestException({ field: 'recoveryCode', message: 'Recovery code is not correct' });
    }

    if (user.passwordRecovery!.expirationDate! < new Date()) {
      throw new CustomBadRequestException({ field: 'recoveryCode', message: 'Recovery code is expired' });
    }

    user.passwordHash = await this.cryptoService.generateHash(newPassword);
    user.passwordRecovery = null;
    await this.usersRepo.save(user);
  }

  async loginUser(dto: LoginUserDto): Promise<LoginResultDto> {
    const user = await this.checkCredentials(dto.loginOrEmail, dto.password);

    const accessToken = await this.jwtService.createAccessToken(user.id);

    const deviceId = randomUUID();
    const refreshToken = await this.jwtService.createRefreshToken(user.id, deviceId);

    const decodedRefreshToken = await this.jwtService.decodeRefreshToken(refreshToken);

    const session = this.SessionModel.createInstance({
      userId: user.id,
      deviceId,
      userAgent: dto.userAgent,
      ip: dto.ip,
      iat: decodedRefreshToken.iat,
      exp: decodedRefreshToken.exp,
    });

    await this.sessionsRepo.save(session);

    return { accessToken, refreshToken };
  }

  async logOutUser(token: string) {
    const payload = await this.jwtService.verifyRefreshToken(token);

    const session = await this.sessionsRepo.getSessionByTokenPayload(payload);
    if (!session) {
      throw new UnauthorizedException();
    }

    session.makeDeleted();

    await this.sessionsRepo.save(session);
  }
}
