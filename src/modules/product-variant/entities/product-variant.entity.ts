import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductVariant } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProductVariantEntity {
  constructor(init?: Partial<ProductVariant>) {
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
  sku: string;

  @Expose()
  @ApiPropertyOptional()
  size?: number;

  @Expose()
  @ApiPropertyOptional()
  unit?: string;

  @Expose()
  @ApiPropertyOptional()
  color?: string;

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