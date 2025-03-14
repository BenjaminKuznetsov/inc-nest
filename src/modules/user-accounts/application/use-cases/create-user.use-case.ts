import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../domain/user.entity';
import { CreateUserDto, CreateUserOptions } from '../../dto/create-user.dto';
import { UsersRepo } from '../../infrastructure/usersRepo';
import { CryptoService } from '../crypto.service';
import { CustomBadRequestException } from '../../../../core/exception/bad-request';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateUserCommand {
  constructor(
    public dto: CreateUserDto,
    public options: CreateUserOptions = new CreateUserOptions(),
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand, string> {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private usersRepository: UsersRepo,
    private readonly cryptoService: CryptoService,
  ) {}

  async execute({ dto, options }: CreateUserCommand): Promise<string> {
    const userWithSuchLogin = await this.usersRepository.getUserByFilter({ login: dto.login });
    if (userWithSuchLogin) {
      throw new CustomBadRequestException({ field: 'login', message: 'User with such login already exists' });
    }

    const userWithSuchEmail = await this.usersRepository.getUserByFilter({ email: dto.email });
    if (userWithSuchEmail) {
      throw new CustomBadRequestException({ field: 'email', message: 'User with such email already exists' });
    }

    const passwordHash = await this.cryptoService.generateHash(dto.password);

    const user = this.UserModel.createInstance(
      {
        email: dto.email,
        login: dto.login,
        password: passwordHash,
      },
      options,
    );

    await this.usersRepository.save(user);
    return user._id.toString();
  }
}
