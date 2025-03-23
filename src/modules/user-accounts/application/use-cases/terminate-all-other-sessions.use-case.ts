import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepo } from '../../infrastructure/sessions-repo';

export class TerminateAllOtherSessionsCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(TerminateAllOtherSessionsCommand)
export class TerminateAllOtherSessionsUseCase implements ICommandHandler<TerminateAllOtherSessionsCommand> {
  constructor(private readonly sessionsRepo: SessionsRepo) {}

  async execute({ userId, deviceId }: TerminateAllOtherSessionsCommand) {
    const sessions = await this.sessionsRepo.getSessionsByUserId(userId);

    await Promise.all(
      sessions.map((session) => {
        if (session.deviceId !== deviceId) {
          session.makeDeleted();
          return this.sessionsRepo.save(session);
        }
        return Promise.resolve();
      }),
    );
  }
}
