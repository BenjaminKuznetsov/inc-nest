import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserDocument } from '../domain/user.entity';
import { UsersRepo } from '../infrastructure/usersRepo';
import { CryptoService } from './crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly cryptoService: CryptoService,
  ) {}

  async checkCredentials(loginOrEmail: string, password: string): Promise<UserDocument> {
    const user = await this.usersRepo.getByLoginOrEmail(loginOrEmail);
    if (!user) {
      // TODO: replace with domain exception
      throw new NotFoundException();
    }

    const isPasswordCorrect = await this.cryptoService.checkPassword(password, user.passwordHash);

    if (!isPasswordCorrect) {
      // TODO: replace with domain exception
      throw new UnauthorizedException();
    }

    return user;
  }

  async loginUser() {
    const result = await this.checkCredentials(loginOrEmail, password);

    if (!resultHelpers.isSuccess(result)) {
      return resultHelpers.unauthorized();
    }

    const userId = result.data.id;

    const deviceId = uuidv4();

    const accessToken = await jwtService.createAccessToken(userId);
    const refreshToken = await jwtService.createRefreshToken(userId, deviceId);

    const decodedRefreshToken = (await jwtService.decodeToken(refreshToken)) as RefreshTokenPayload;
    // console.log("decodedRefreshToken", decodedRefreshToken)

    const newSession: Session = {
      user_id: userId,
      device_id: deviceId,
      user_agent: userAgent,
      ip: ip,
      iat: decodedRefreshToken.iat,
      exp: decodedRefreshToken.exp,
    };

    await sessionsRepo.createSession(newSession);

    return resultHelpers.success({ accessToken, refreshToken });
  }
}
