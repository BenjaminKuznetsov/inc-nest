import { UnauthorizedException } from '@nestjs/common';
import { SessionsRepo } from '../../infrastructure/sessions-repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class LogoutUserCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public iat: number,
  ) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(private readonly sessionsRepo: SessionsRepo) {}

  async execute({ userId, deviceId, iat }: LogoutUserCommand) {
    const session = await this.sessionsRepo.getSession(userId, deviceId, iat);
    if (!session) {
      throw new UnauthorizedException();
    }

    session.makeDeleted();

    await this.sessionsRepo.save(session);
  }
}
