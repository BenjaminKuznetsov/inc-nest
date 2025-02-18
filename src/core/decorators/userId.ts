import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

// TODO: переписать как в документации nest (https://docs.nestjs.com/custom-decorators#passing-data)
export const UserId = createParamDecorator((data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest();

  const userId = request.userCtx?.userId;

  if (!userId) {
    throw new UnauthorizedException();
  }

  return userId;
});
