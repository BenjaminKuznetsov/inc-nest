import { JwtService } from '../jwt.service';
import { SessionsRepo } from '../../infrastructure/sessions-repo';
import { TokenPairDto } from '../../dto/token-pair.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

export class RefreshTokenCommand {
  constructor(public token: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand, TokenPairDto> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionsRepo: SessionsRepo,
  ) {}

  async execute({ token }: RefreshTokenCommand): Promise<TokenPairDto> {
    const payload = await this.jwtService.verifyRefreshToken(token);

    const session = await this.sessionsRepo.getSessionByTokenPayload(payload);
    if (!session) {
      throw new UnauthorizedException();
    }

    const userId = payload.userId;
    const deviceId = payload.deviceId;

    const newAccessToken = await this.jwtService.createAccessToken(userId);
    const newRefreshToken = await this.jwtService.createRefreshToken(userId, deviceId);

    const decodedRefreshToken = await this.jwtService.decodeRefreshToken(newRefreshToken);

    session.iat = decodedRefreshToken.iat;
    session.exp = decodedRefreshToken.exp;

    await this.sessionsRepo.save(session);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
