import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductVariantDto {
  @ApiProperty({ example: 'SKU123' })
  @IsString()
  sku: string;

  @ApiPropertyOptional({ example: 500, description: 'Size of the variant' })
  @IsNumber()
  @IsOptional()
  size?: number;

  @ApiPropertyOptional({
    example: 'ml',
    description: 'Unit of measure for size',
  })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ example: 'red' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indicates whether the variant is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}