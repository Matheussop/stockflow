import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryLog, InventoryLogType } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class InventoryLogEntity {
  constructor(init?: Partial<InventoryLog>) {
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
  stockItemId: string;

  @Expose()
  @ApiProperty()
  type: InventoryLogType;

  @Expose()
  @ApiProperty()
  quantityChange: number;

  @Expose()
  @ApiProperty()
  previousQty: number;

  @Expose()
  @ApiProperty()
  newQty: number;

  @Expose()
  @ApiProperty()
  isManual: boolean;

  @Expose()
  @ApiProperty()
  isReverted: boolean;

  @Expose()
  @ApiPropertyOptional()
  sourceId?: string;

  @Expose()
  @ApiPropertyOptional()
  sourceType?: string;

  @Expose()
  @ApiPropertyOptional()
  userId?: string;

  @Expose()
  @ApiPropertyOptional()
  revertedById?: string;

  @Expose()
  @ApiPropertyOptional()
  note?: string;

  @Expose()
  @ApiProperty()
  companyId: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}


