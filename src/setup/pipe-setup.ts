import { INestApplication, ValidationPipe } from '@nestjs/common';

export function pipeSetup(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      //class-transformer создает экземпляр dto
      //соответственно применятся значения по-умолчанию
      //и методы классов dto
      transform: true,
      // удаляет поля, которых нет в dto
      whitelist: true,
    }),
  );
}
