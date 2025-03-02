import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersRepo } from '../infrastructure/usersRepo';
import { CryptoService } from './crypto.service';
import { CustomBadRequestException } from '../../../common/exception/bad-request';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private usersRepository: UsersRepo,
    private readonly cryptoService: CryptoService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<string> {
    const userWithSuchLogin = await this.usersRepository.getUserByFilter({ login: dto.login });
    if (userWithSuchLogin) {
      throw new CustomBadRequestException({ field: 'login', message: 'User with such login already exists' });
    }

    const userWithSuchEmail = await this.usersRepository.getUserByFilter({ email: dto.email });
    if (userWithSuchEmail) {
      throw new CustomBadRequestException({ field: 'email', message: 'User with such email already exists' });
    }

    const passwordHash = await this.cryptoService.generateHash(dto.password);

    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      password: passwordHash,
    });

    await this.usersRepository.save(user);
    return user._id.toString();
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOrNotFoundFail(id);
    user.makeDeleted();
    await this.usersRepository.save(user);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.usersRepository.findById(id);
  }
}
