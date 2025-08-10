import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { SaleItemBaseDto } from './sale-item-base.dto';

export class CreateSaleItemDto extends SaleItemBaseDto {
  @ApiProperty({
    example: 'f4ca84c1-6a3e-49bb-bf19-64b0c4f113fb',
    description: 'ID of the sale associated with this item',
  })
  @IsUUID()
  saleId: string;
}