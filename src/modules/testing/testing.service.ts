import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class TestingService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async dropDatabase(): Promise<void> {
    if (!this.connection || !this.connection.db) {
      throw new Error('Подключение к базе данных отсутствует');
    }

    try {
      await this.connection.db.dropDatabase();
      // console.log('База данных успешно удалена');
    } catch (error) {
      console.error('Ошибка при удалении базы данных:', error);
      throw error;
    }
  }
}
