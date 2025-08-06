import { Role } from '@prisma/client';
export interface JwtPayload {
  sub: string;
  email: string;
  companyId?: string | undefined;
  role: Role;
}
