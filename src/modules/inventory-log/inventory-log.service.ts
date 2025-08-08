import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, InventoryLogType } from '@prisma/client';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateInventoryLogDto } from './dto/create-inventory-log.dto';
import { InventoryLogEntity } from './entities/inventory-log.entity';

@Injectable()
export class InventoryLogService {
  constructor(private readonly prisma: PrismaService) {}

  async createManual(
    dto: CreateInventoryLogDto,
    companyId: string,
    userId?: string,
  ): Promise<InventoryLogEntity> {
    const stockItem = await this.prisma.stockItem.findFirst({
      where: { id: dto.stockItemId, productVariant: { product: { companyId } } },
    });
    if (!stockItem) {
      throw new NotFoundException('Stock item not found for this company');
    }

    const previousQty = stockItem.quantity;
    const newQty = previousQty + dto.quantityChange;
    if (newQty < 0) {
      throw new BadRequestException('Resulting quantity cannot be negative');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.stockItem.update({
        where: { id: stockItem.id },
        data: { quantity: newQty },
      });

      const created = await tx.inventoryLog.create({
        data: {
          ...dto,
          stockItemId: stockItem.id,
          previousQty,
          newQty,
          userId,
          companyId,
          isManual: dto.isManual ?? true,
          isReverted: false,
        },
      });
      return created;
    });

    return new InventoryLogEntity(result);
  }

  async findAll(companyId: string, filters?: Partial<{ stockItemId: string; type: InventoryLogType }>): Promise<InventoryLogEntity[]> {
    const logs = await this.prisma.inventoryLog.findMany({
      where: {
        companyId,
        stockItemId: filters?.stockItemId,
        type: filters?.type,
      },
      orderBy: { createdAt: 'desc' },
    });
    return logs.map((l) => new InventoryLogEntity(l));
  }

  async findOne(id: string, companyId: string): Promise<InventoryLogEntity> {
    const log = await this.prisma.inventoryLog.findFirst({ where: { id, companyId } });
    if (!log) throw new NotFoundException('Inventory log not found');
    return new InventoryLogEntity(log);
  }

  async revert(logId: string, companyId: string, revertedById?: string): Promise<InventoryLogEntity> {
    const log = await this.prisma.inventoryLog.findFirst({ where: { id: logId, companyId } });
    if (!log) throw new NotFoundException('Inventory log not found');
    if (log.isReverted) throw new BadRequestException('Log already reverted');

    const stockItem = await this.prisma.stockItem.findFirst({
      where: { id: log.stockItemId, productVariant: { product: { companyId } } },
    });
    if (!stockItem) throw new NotFoundException('Stock item not found for this company');

    const newQty = stockItem.quantity - log.quantityChange; // reverse the change
    if (newQty < 0) {
      throw new BadRequestException('Reversion would result in negative quantity');
    }

    const reverted = await this.prisma.$transaction(async (tx) => {
      await tx.stockItem.update({ where: { id: stockItem.id }, data: { quantity: newQty } });
      return tx.inventoryLog.update({
        where: { id: log.id },
        data: { isReverted: true, revertedById },
      });
    });

    return new InventoryLogEntity(reverted);
  }
}


