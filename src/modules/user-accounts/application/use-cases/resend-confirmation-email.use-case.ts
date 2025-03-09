import { ConfirmationStatus, UserDocument } from '../../domain/user.entity';
import { UsersRepo } from '../../infrastructure/usersRepo';
import { CustomBadRequestException } from '../../../../common/exception/bad-request';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { EmailService } from '../../../notifications/email.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ResendConfirmationEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailUseCase implements ICommandHandler<ResendConfirmationEmailCommand> {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly emailService: EmailService,
  ) {}

  async execute({ email }: ResendConfirmationEmailCommand) {
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
}
