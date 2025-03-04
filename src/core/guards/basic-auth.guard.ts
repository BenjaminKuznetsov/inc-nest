import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { encodeToBase64 } from '../utils/base-64';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/isPublic';
import { appConfig } from '../../common/config/config';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): true {
    //https://docs.nestjs.com/security/authentication#enable-authentication-globally
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const receivedToken = request.headers.authorization;
    if (!receivedToken) {
      throw new UnauthorizedException();
    }

    const etalonToken = 'Basic ' + encodeToBase64(appConfig.adminAuth);

    if (receivedToken !== etalonToken) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
