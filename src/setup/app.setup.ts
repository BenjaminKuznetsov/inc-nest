import { INestApplication } from '@nestjs/common';
import { prefixSetup } from './prefix-setup';
import { pipeSetup } from './pipe-setup';
import { swaggerSetup } from './swagger-setup';
import { cookieSetup } from './cookie-setup';

export function appSetup(app: INestApplication) {
  app.enableCors();
  cookieSetup(app);
  pipeSetup(app);
  prefixSetup(app);
  swaggerSetup(app);
}
