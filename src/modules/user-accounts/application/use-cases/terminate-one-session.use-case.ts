import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepo } from '../../infrastructure/sessions-repo';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class TerminateOneSessionCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(TerminateOneSessionCommand)
export class TerminateOneSessionUseCase implements ICommandHandler<TerminateOneSessionCommand> {
  constructor(private readonly sessionsRepo: SessionsRepo) {}

  async execute({ userId, deviceId }: TerminateOneSessionCommand) {
    const sessions = await this.sessionsRepo.getSessionsByDeviceId(deviceId);
    if (sessions.length === 0) {
      throw new NotFoundException();
    }

    const sessionToBeTerminated = sessions.find((session) => session.userId === userId);
    if (!sessionToBeTerminated) {
      throw new ForbiddenException();
    }

    sessionToBeTerminated.makeDeleted();
    await this.sessionsRepo.save(sessionToBeTerminated);
  }
}
