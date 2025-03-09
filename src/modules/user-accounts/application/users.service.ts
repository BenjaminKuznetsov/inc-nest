import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDocument } from '../domain/user.entity';
import { UsersRepo } from '../infrastructure/usersRepo';
import { CryptoService } from './crypto.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly cryptoService: CryptoService,
  ) {}

  async checkCredentials(loginOrEmail: string, password: string): Promise<UserDocument> {
    const user = await this.usersRepo.getByLoginOrEmail(loginOrEmail);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordCorrect = await this.cryptoService.checkPassword(password, user.passwordHash);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
