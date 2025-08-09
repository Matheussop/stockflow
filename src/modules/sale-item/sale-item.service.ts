import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateSaleItemDto } from './dto/create-sale-item.dto';
import { UpdateSaleItemDto } from './dto/update-sale-item.dto';
import { SaleItemEntity } from './entities/sale-item.entity';

@Injectable()
export class SaleItemService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateSaleItemDto,
    companyId: string,
  ): Promise<SaleItemEntity> {
    const sale = await this.prisma.sale.findFirst({
      where: { id: dto.saleId, companyId },
    });
    if (!sale) throw new NotFoundException('Sale not found');

    const variant = await this.prisma.productVariant.findFirst({
      where: { id: dto.productVariantId, product: { companyId } },
    });
    if (!variant) throw new NotFoundException('Product variant not found');

    if (dto.stockItemId) {
      const stockItem = await this.prisma.stockItem.findFirst({
        where: {
          id: dto.stockItemId,
          productVariant: { product: { companyId } },
        },
      });
      if (!stockItem) throw new NotFoundException('Stock item not found');
    }

    const saleItem = await this.prisma.saleItem.create({
      data: dto,
    });
    return new SaleItemEntity(saleItem);
  }

  async findAll(companyId: string): Promise<SaleItemEntity[] | undefined> {
    const items = await this.prisma.saleItem.findMany({
      where: { sale: { companyId } },
    });
    return items.map((item) => new SaleItemEntity(item));
  }

  async findOne(id: string, companyId: string): Promise<SaleItemEntity> {
    const saleItem = await this.prisma.saleItem.findFirst({
      where: { id, sale: { companyId } },
    });
    if (!saleItem) throw new NotFoundException('Sale item not found');
    return new SaleItemEntity(saleItem);
  }

  async update(
    id: string,
    dto: UpdateSaleItemDto,
    companyId: string,
  ): Promise<SaleItemEntity> {
    await this.findOne(id, companyId);
    const saleItemUpdated = await this.prisma.saleItem.update({
      where: { id },
      data: dto,
    });
    return new SaleItemEntity(saleItemUpdated);
  }

  async remove(id: string, companyId: string): Promise<SaleItemEntity> {
    await this.findOne(id, companyId);
    const saleItemDeleted = await this.prisma.saleItem.delete({
      where: { id },
    });
    return new SaleItemEntity(saleItemDeleted);
  }
}