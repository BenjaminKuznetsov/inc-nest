import { INestApplication, ValidationPipe } from '@nestjs/common';

export function appSetup(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      //class-transformer создает экземпляр dto
      //соответственно применятся значения по-умолчанию
      //сработает наследование
      //и методы классов dto
      transform: true,
    }),
  );
}

// function swaggerSetup(app: INestApplication) {
//   const config = new DocumentBuilder()
//     .setTitle('BLOGGER API')
//     .addBearerAuth()
//     .setVersion('1.0')
//     .build();
//
//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup(GLOBAL_PREFIX, app, document, {
//     customSiteTitle: 'Blogger Swagger',
//   });
// }
