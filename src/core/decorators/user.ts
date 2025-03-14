import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserContext } from '../types/express';

export const User = createParamDecorator<keyof UserContext | undefined>((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const user = request.user;

  return data ? user?.[data] : user;
});
