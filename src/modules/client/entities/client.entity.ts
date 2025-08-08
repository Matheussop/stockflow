import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Client } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ClientEntity {
  constructor(init?: Partial<Client>) {
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
  @ApiPropertyOptional()
  document?: string;

  @Expose()
  @ApiPropertyOptional()
  email?: string;

  @Expose()
  @ApiPropertyOptional()
  phone?: string;

  @Expose()
  @ApiPropertyOptional()
  address?: string;

  @Expose()
  @ApiPropertyOptional()
  note?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}