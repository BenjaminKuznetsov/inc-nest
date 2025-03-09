import { LoginUserDto } from '../../dto/login-user.dto';
import { JwtService } from '../jwt.service';
import { randomUUID } from 'node:crypto';
import { SessionsRepo } from '../../infrastructure/sessions-repo';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionModelType } from '../../domain/session.entity';
import { TokenPairDto } from '../../dto/token-pair.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../users.service';

export class LoginUserCommand {
  constructor(public dto: LoginUserDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand, TokenPairDto> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionsRepo: SessionsRepo,
    @InjectModel(Session.name) private SessionModel: SessionModelType,
    private readonly authService: UsersService,
  ) {}

  async execute({ dto }: LoginUserCommand): Promise<TokenPairDto> {
    const user = await this.authService.checkCredentials(dto.loginOrEmail, dto.password);

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
}
