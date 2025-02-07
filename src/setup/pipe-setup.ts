import { INestApplication, ValidationPipe } from '@nestjs/common';

export function pipeSetup(app: INestApplication) {
  return new ValidationPipe({
    //class-transformer создает экземпляр dto
    //соответственно применятся значения по-умолчанию
    //сработает наследование
    //и методы классов dto
    transform: true,
  });
}
