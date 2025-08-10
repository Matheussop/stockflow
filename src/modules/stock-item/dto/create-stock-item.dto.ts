import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStockItemDto {
  @ApiProperty({
    example: '3f2a2e6b-d940-4ff1-bb61-cb5ea8df4c8c',
    description: 'ID of the product variant associated with this stock item',
  })
  @IsUUID()
  productVariantId: string;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  quantity: number;

  @ApiProperty({ example: 25.5 })
  @Type(() => Number)
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ example: new Date().toISOString() })
  @IsDateString()
  entryDate: Date;

  @ApiPropertyOptional({ example: new Date().toISOString() })
  @IsDateString()
  @IsOptional()
  expirationDate?: Date;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}