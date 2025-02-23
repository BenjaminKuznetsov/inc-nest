import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { encodeToBase64 } from '../../../../core/utils/base-64';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  private readonly validUsername = 'admin';
  private readonly validPassword = 'qwerty';

  canActivate(context: ExecutionContext): true {
    const request = context.switchToHttp().getRequest();

    const receivedToken = request.headers.authorization;
    if (!receivedToken) {
      throw new UnauthorizedException();
    }

    const etalonToken = 'Basic ' + encodeToBase64(`${this.validUsername}:${this.validPassword}`);

    if (receivedToken !== etalonToken) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
