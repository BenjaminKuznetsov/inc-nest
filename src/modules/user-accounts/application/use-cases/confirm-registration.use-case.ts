import { ConfirmationStatus } from '../../domain/user.entity';
import { UsersRepo } from '../../infrastructure/usersRepo';
import { CustomBadRequestException } from '../../../../core/exception/bad-request';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ConfirmRegistrationCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase implements ICommandHandler<ConfirmRegistrationCommand> {
  constructor(private readonly usersRepo: UsersRepo) {}

  async execute({ code }: ConfirmRegistrationCommand) {
    const user = await this.usersRepo.getUserByConfirmationCode(code);

    if (!user) {
      throw new CustomBadRequestException({ field: 'code', message: 'Confirmation code is invalid' });
    }

    if (user.emailConfirmation.confirmationStatus !== ConfirmationStatus.NOT_CONFIRMED) {
      throw new CustomBadRequestException({ field: 'code', message: 'Confirmation code is already applied' });
    }

    if (user.emailConfirmation.expirationDate! < new Date()) {
      throw new CustomBadRequestException({ field: 'code', message: 'Confirmation code is expired' });
    }

    await this.usersRepo.setUserAsConfirmed(user.id);
  }
}
