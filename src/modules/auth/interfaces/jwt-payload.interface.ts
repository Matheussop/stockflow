import { Role } from '@prisma/client';

export type UserWithCompany = JwtPayload & { companyId: string };
export interface JwtPayload {
  sub: string;
  email: string;
  companyId?: string | undefined;
  role: Role;
}
