import { OmitType } from '@nestjs/mapped-types';
import { SaleItemBaseDto } from 'src/modules/sale-item/dto/sale-item-base.dto';

export class CreateSaleItemDtoWithoutSaleId extends OmitType(
  SaleItemBaseDto,
  [] as const, // nothing to omit from base; kept for symmetry/readability
) {}