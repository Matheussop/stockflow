import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateStockItemDto } from './dto/create-stock-item.dto';
import { UpdateStockItemDto } from './dto/update-stock-item.dto';
import { StockItemEntity } from './entities/stock-item.entity';

@Injectable()
export class StockItemService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateStockItemDto,
    companyId: string,
  ): Promise<StockItemEntity> {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: dto.productVariantId, product: { companyId } },
    });
    if (!variant) throw new NotFoundException('Product variant not found');

    const stockItem = await this.prisma.stockItem.create({
      data: dto,
    });
    return new StockItemEntity(stockItem);
  }

  async findAll(companyId: string): Promise<StockItemEntity[] | undefined> {
    const items = await this.prisma.stockItem.findMany({
      where: { productVariant: { product: { companyId } } },
    });
    return items.map((i) => new StockItemEntity(i));
  }

  async findOne(id: string, companyId: string): Promise<StockItemEntity> {
    const item = await this.prisma.stockItem.findFirst({
      where: { id, productVariant: { product: { companyId } } },
    });
    if (!item) throw new NotFoundException('Stock item not found');
    return new StockItemEntity(item);
  }

  async update(
    id: string,
    dto: UpdateStockItemDto,
    companyId: string,
  ): Promise<StockItemEntity> {
    await this.findOne(id, companyId);
    if (dto.productVariantId) {
      const variant = await this.prisma.productVariant.findFirst({
        where: { id: dto.productVariantId, product: { companyId } },
      });
      if (!variant) throw new NotFoundException('Product variant not found');
    }
    const updated = await this.prisma.stockItem.update({
      where: { id },
      data: dto,
    });
    return new StockItemEntity(updated);
  }

  async remove(id: string, companyId: string): Promise<StockItemEntity> {
    await this.findOne(id, companyId);
    const deleted = await this.prisma.stockItem.delete({ where: { id } });
    return new StockItemEntity(deleted);
  }
}