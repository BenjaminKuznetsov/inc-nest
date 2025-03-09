import { UsersRepo } from '../../infrastructure/usersRepo';
import { CreateUserInputDto } from '../../api/input-dto/users.input-dto';
import { EmailService } from '../../../notifications/email.service';
import { CreateUserCommand, CreateUserUseCase } from './create-user.use-case';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

export class RegisterUserCommand {
  constructor(public dto: CreateUserInputDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(CreateUserUseCase)
    private commandBus: CommandBus,
    private readonly usersRepo: UsersRepo,
    private readonly emailService: EmailService,
  ) {}

  async execute({ dto }: RegisterUserCommand) {
    const createdUserId = await this.commandBus.execute(new CreateUserCommand(dto));
    const createdUser = await this.usersRepo.findById(createdUserId);
    this.emailService.userRegistrationConfirmation(createdUser!);
  }
}
