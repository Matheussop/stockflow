import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryLogType } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateInventoryLogDto {
  @ApiProperty({ example: 'a3d1b8b2-4c6a-4e2e-9f85-0e6a4a1b2c3d' })
  @IsUUID()
  stockItemId: string;

  @ApiProperty({ enum: InventoryLogType })
  @IsEnum(InventoryLogType)
  type: InventoryLogType;

  @ApiProperty({ description: 'Positive for ENTRY/ADJUSTMENT increases; negative for LOSS/ADJUSTMENT decreases', example: 10 })
  @IsInt()
  quantityChange: number;

  @ApiPropertyOptional({ example: 'SALE-123' })
  @IsOptional()
  @IsString()
  sourceId?: string;

  @ApiPropertyOptional({ example: 'ManualAdjustment' })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiPropertyOptional({ description: 'If true, marks as manual entry. Defaults to true for this endpoint.' })
  @IsOptional()
  @IsBoolean()
  isManual?: boolean = true;

  @ApiPropertyOptional({ example: 'Stock recount after audit' })
  @IsOptional()
  @IsString()
  note?: string;
}


