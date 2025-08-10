import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StockItem } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class StockItemEntity {
  constructor(init?: Partial<StockItem>) {
    if (init) {
      const clean = Object.fromEntries(
        Object.entries(init).map(([key, value]) => [key, value ?? undefined]),
      );
      Object.assign(this, {
        ...clean,
        unitPrice: clean.unitPrice ? Number(clean.unitPrice) : undefined,
      });
    }
  }

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  productVariantId: string;

  @Expose()
  @ApiProperty()
  quantity: number;

  @Expose()
  @ApiProperty()
  unitPrice: number;

  @Expose()
  @ApiProperty()
  entryDate: Date;

  @Expose()
  @ApiPropertyOptional()
  expirationDate?: Date;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}