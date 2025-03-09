import { UsersRepo } from '../../infrastructure/usersRepo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private usersRepository: UsersRepo) {}

  async execute({ id }: DeleteUserCommand): Promise<void> {
    const user = await this.usersRepository.findOrNotFoundFail(id);
    user.makeDeleted();
    await this.usersRepository.save(user);
  }
}
