import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
  @ApiProperty({
    example: 'f4ca84c1-6a3e-49bb-bf19-64b0c4f113fb',
    description: 'ID of the sale associated with this item',
  })
  @IsUUID()
  saleId: string;

  @ApiProperty({
    example: '3f2a2e6b-d940-4ff1-bb61-cb5ea8df4c8c',
    description: 'ID of the product variant sold',
  })
  @IsUUID()
  productVariantId: string;

  @ApiPropertyOptional({
    example: '5c884fd0-b285-4f6b-8aba-51dd2c2dccc4',
    description: 'ID of the stock item used in the sale',
  })
  @IsUUID()
  @IsOptional()
  stockItemId?: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  quantity: number;

  @ApiProperty({ example: 50.0 })
  @Type(() => Number)
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ example: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  discount?: number = 0;

  @ApiProperty({ example: 100.0 })
  @Type(() => Number)
  @IsNumber()
  total: number;

  @ApiPropertyOptional({ example: 'Special discount applied' })
  @IsString()
  @IsOptional()
  note?: string;
}