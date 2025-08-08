import { ApiProperty } from '@nestjs/swagger';
import { Company } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CompanyEntity {
  constructor(init?: Partial<Company>) {
    if (init) {
      const clean = Object.fromEntries(
        Object.entries(init).map(([key, value]) => [key, value ?? undefined]),
      );
      Object.assign(this, clean);
    }
  }

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}