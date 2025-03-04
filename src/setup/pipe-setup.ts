import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';

export function pipeSetup(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      //class-transformer создает экземпляр dto
      //соответственно применятся значения по-умолчанию
      //и методы классов dto
      transform: true,
      // удаляет поля, которых нет в dto
      // whitelist: true,

      // форматирование ошибок в нужный тип
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((err) => ({
          field: err.property,
          message: Object.values(err.constraints || {})[0],
        }));

        return new BadRequestException({
          errorsMessages: formattedErrors,
        });
      },
    }),
  );
}
