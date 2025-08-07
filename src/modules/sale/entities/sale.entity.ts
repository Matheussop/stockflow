import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, Sale, SaleStatus } from '@prisma/client';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class SaleEntity {
  constructor(init?: Partial<Sale>) {
    if (init) {
      const clean = Object.fromEntries(
        Object.entries(init).map(([key, value]) => [key, value ?? undefined]),
      );
      Object.assign(this, {
        ...clean,
        total: clean.total ? Number(clean.total) : undefined,
        discount: clean.discount ? Number(clean.discount) : undefined,
      });
    }
  }

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  saleDate: Date;

  @Expose()
  @ApiProperty({ enum: SaleStatus })
  status: SaleStatus;

  @Expose()
  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @Expose()
  @ApiPropertyOptional()
  paymentMethod?: string;

  @Expose()
  @ApiProperty()
  total: number;

  @Expose()
  @ApiProperty()
  discount: number;

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