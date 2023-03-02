import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Owner } from '../types';

export const SessionOwner = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Owner => {
    const request = ctx.switchToHttp().getRequest();
    const owner: Owner = request.user;
    return owner;
  },
);
