import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SaleItem } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SaleItemEntity {
  constructor(init?: Partial<SaleItem>) {
    if (init) {
      const clean = Object.fromEntries(
        Object.entries(init).map(([key, value]) => [key, value ?? undefined]),
      );
      Object.assign(this, {
        ...clean,
        unitPrice: clean.unitPrice ? Number(clean.unitPrice) : undefined,
        discount: clean.discount ? Number(clean.discount) : undefined,
        total: clean.total ? Number(clean.total) : undefined,
      });
    }
  }

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  saleId: string;

  @Expose()
  @ApiProperty()
  productVariantId: string;

  @Expose()
  @ApiPropertyOptional()
  stockItemId?: string;

  @Expose()
  @ApiProperty()
  quantity: number;

  @Expose()
  @ApiProperty()
  unitPrice: number;

  @Expose()
  @ApiProperty()
  discount: number;

  @Expose()
  @ApiProperty()
  total: number;

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