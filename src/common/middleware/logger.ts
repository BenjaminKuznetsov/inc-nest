import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;

    res.send = function (responseBody) {
      console.log(
        `Request: ${req.method} ${req.originalUrl} ${req.body ? JSON.stringify(req.body) : ''}`,
        `\nResponse: ${res.statusCode} ${responseBody ? JSON.stringify(responseBody) : ''}`,
      );
      return originalSend.call(this, responseBody);
    };

    next();
  }
}
