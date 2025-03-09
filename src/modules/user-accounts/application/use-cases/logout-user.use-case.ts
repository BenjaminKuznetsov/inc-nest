import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '../jwt.service';
import { SessionsRepo } from '../../infrastructure/sessions-repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class LogoutUserCommand {
  constructor(public token: string) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionsRepo: SessionsRepo,
  ) {}

  async execute({ token }: LogoutUserCommand) {
    const payload = await this.jwtService.verifyRefreshToken(token);

    const session = await this.sessionsRepo.getSessionByTokenPayload(payload);
    if (!session) {
      throw new UnauthorizedException();
    }

    session.makeDeleted();

    await this.sessionsRepo.save(session);
  }
}
