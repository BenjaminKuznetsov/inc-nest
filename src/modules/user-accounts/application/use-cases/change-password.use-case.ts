import { UsersRepo } from '../../infrastructure/usersRepo';
import { CryptoService } from '../crypto.service';
import { CustomBadRequestException } from '../../../../core/exception/bad-request';
import { ChangePasswordInputDto } from '../../api/input-dto/change-password.input-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ChangePasswordCommand {
  constructor(public dto: ChangePasswordInputDto) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordUseCase implements ICommandHandler<ChangePasswordCommand> {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly cryptoService: CryptoService,
  ) {}

  async execute({ dto: { recoveryCode, newPassword } }: ChangePasswordCommand) {
    const user = await this.usersRepo.getUserByRecoveryCode(recoveryCode);
    if (!user) {
      throw new CustomBadRequestException({ field: 'recoveryCode', message: 'Recovery code is not correct' });
    }

    if (user.passwordRecovery!.expirationDate! < new Date()) {
      throw new CustomBadRequestException({ field: 'recoveryCode', message: 'Recovery code is expired' });
    }

    user.passwordHash = await this.cryptoService.generateHash(newPassword);
    user.passwordRecovery = null;
    await this.usersRepo.save(user);
  }
}
