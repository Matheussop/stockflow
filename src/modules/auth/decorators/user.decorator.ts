import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

type UserDecoratorOptions = keyof JwtPayload | { requireCompanyId?: boolean };

export const User = createParamDecorator(
  (data: UserDecoratorOptions | undefined, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    if (
      typeof data === 'object' &&
      data?.requireCompanyId &&
      !user?.companyId
    ) {
      throw new ForbiddenException('User does not belong to any company.');
    }

    if (typeof data === 'string') {
      return user?.[data];
    }

    return user;
  },
);
