import { INestApplication } from '@nestjs/common';
import { prefixSetup } from './prefix-setup';
import { pipeSetup } from './pipe-setup';
import { swaggerSetup } from './swagger-setup';

export function appSetup(app: INestApplication) {
  app.enableCors();
  pipeSetup(app);
  prefixSetup(app);
  swaggerSetup(app);
}
