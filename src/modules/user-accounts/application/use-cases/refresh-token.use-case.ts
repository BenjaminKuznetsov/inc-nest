import { JwtService } from '../jwt.service';
import { SessionsRepo } from '../../infrastructure/sessions-repo';
import { TokenPairDto } from '../../dto/token-pair.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

export class RefreshTokenCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public iat: number,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand, TokenPairDto> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionsRepo: SessionsRepo,
  ) {}

  async execute({ userId, deviceId, iat }: RefreshTokenCommand): Promise<TokenPairDto> {
    const session = await this.sessionsRepo.getSession(userId, deviceId, iat);
    if (!session) {
      throw new UnauthorizedException();
    }

    const newAccessToken = await this.jwtService.createAccessToken(userId);
    const newRefreshToken = await this.jwtService.createRefreshToken(userId, deviceId);

    const decodedRefreshToken = await this.jwtService.decodeRefreshToken(newRefreshToken);

    session.iat = decodedRefreshToken.iat;
    session.exp = decodedRefreshToken.exp;

    await this.sessionsRepo.save(session);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
