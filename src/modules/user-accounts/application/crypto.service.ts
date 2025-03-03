import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  async generateHash(password: string) {
    if (!password) {
      throw new Error('Password is required');
    }
    return bcrypt.hash(password, 10);
  }

  async checkPassword(password: string, hash: string) {
    if (!password || !hash) {
      throw new Error('Password and hash are required');
    }
    return bcrypt.compare(password, hash);
  }
}
