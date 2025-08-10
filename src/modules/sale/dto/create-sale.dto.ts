import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsDateString,
  IsEnum,
  IsString,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentStatus, SaleStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { CreateSaleItemDtoWithoutSaleId } from './create-sale-item-without-sale-id.dto';

export class CreateSaleDto {
  @ApiPropertyOptional({
    example: '3f2a2e6b-d940-4ff1-bb61-cb5ea8df4c8c',
    description: 'ID of the client associated with the sale',
  })
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiProperty({ example: new Date().toISOString() })
  @IsDateString()
  saleDate: Date;

  @ApiProperty({ enum: SaleStatus, default: SaleStatus.OPEN })
  @IsEnum(SaleStatus)
  status: SaleStatus = SaleStatus.OPEN;

  @ApiProperty({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus = PaymentStatus.PENDING;

  @ApiPropertyOptional({ example: 'credit_card' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiProperty({ example: 100.0 })
  @Min(0, {message: "Total has to be at least 0."})
  @IsNumber()
  total: number;

  @ApiPropertyOptional({ example: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  discount?: number = 0;

  @ApiPropertyOptional({ example: 'Special discount applied' })
  @IsString()
  @IsOptional()
  note?: string;
  
  @ApiProperty({
    description: 'Respective items to a sale',
    type: CreateSaleItemDtoWithoutSaleId,
    isArray: true,
    example: [
      { productVariantId: 'd2d4b3d4-...', quantity: 2, price: 19.9 },
      { productVariantId: 'a1c2e3f4-...', quantity: 1, price: 5.0, discount: 1.0 },
    ],
  })  @ValidateNested({each: true})
  @Type(() => CreateSaleItemDtoWithoutSaleId)
  items: CreateSaleItemDtoWithoutSaleId[];
}