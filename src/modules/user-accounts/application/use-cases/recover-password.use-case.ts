import { NotFoundException } from '@nestjs/common';
import { UserDocument } from '../../domain/user.entity';
import { UsersRepo } from '../../infrastructure/usersRepo';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { EmailService } from '../../../notifications/email.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RecoverPasswordCommand {
  constructor(public email: string) {}
}

@CommandHandler(RecoverPasswordCommand)
export class RecoverPasswordUseCase implements ICommandHandler<RecoverPasswordCommand> {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly emailService: EmailService,
  ) {}

  async execute({ email }: RecoverPasswordCommand) {
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
}
