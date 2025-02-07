import { INestApplication } from '@nestjs/common';

export const GLOBAL_PREFIX = 'api';

export function prefixSetup(app: INestApplication) {
  app.setGlobalPrefix(GLOBAL_PREFIX);
}
