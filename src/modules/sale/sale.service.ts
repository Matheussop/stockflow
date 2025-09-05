import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SaleEntity } from './entities/sale.entity';
import { CreateSaleItemDtoWithoutSaleId } from './dto/create-sale-item-without-sale-id.dto';

interface AllocationLine {
  stockItemId: string;
  qtyAllocated: number;
  qtyPrevious: number;
  unitCost: number;
}

interface AllocationResult {
  productVariantId: string;
  lines: AllocationLine[];
}

interface Variant {
  id: string;
}

@Injectable()
export class SaleService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateSaleDto,
    companyId: string,
    userId: string,
  ): Promise<SaleEntity> {  // todo change return to contain items  
    const { items, saleDate, ...rest } = dto;

    const sale = await this.prisma.$transaction(async (tx) => {
      // 1) Validate items exist and stock is available
      const variants = await tx.productVariant.findMany({
        where: { 
          id: { in: dto.items.map(i => i.productVariantId) },
          product: { companyId}
        },
        select: { 
          id: true, 
          productId: true,
        }
      });

      this.ensureAllExist(variants, dto.items);
  
      // 2) Allocate stock (FIFO over StockItem lots)
      const allocations = await this.allocateFifo(tx, items);
  
      // 3) Create Sale
      const sale = await tx.sale.create({
        data: {
          companyId,
          saleDate: saleDate ? new Date(saleDate) : new Date(),
          userId,
          ...rest
        }
      });
  
      // 4) Create SaleItems
      await Promise.all(dto.items.map((it, idx) =>
        tx.saleItem.create({
          data: {
            saleId: sale.id,
            productVariantId: it.productVariantId,
            stockItemId: it.stockItemId,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            discount: it.discount ?? 0,
            total: it.total,
            note: it.note ?? null
          }
        })
      ));
  
      // 5) Write Inventory movements + decrement stock
      for (const alloc of allocations) {
        for (const line of alloc.lines) {
          await tx.inventoryLog.create({
            data: {
              companyId,
              type: 'SALE',
              stockItemId: line.stockItemId,
              quantityChange: line.qtyAllocated,
              previousQty: line.qtyPrevious,
              newQty: line.qtyPrevious - line.qtyAllocated,
              isManual: false,
              isReverted: false,
              sourceId: sale.id,
              sourceType: 'SALE',
              userId: userId,
              note: `Sale #${sale.id} - ${alloc.productVariantId}`,
            }
          });
          await tx.stockItem.update({
            where: { id: line.stockItemId },
            data: { 
              quantity: { decrement: line.qtyAllocated },
              updatedAt: new Date(),
            }
          });
        }
      }

      // 6) Return sale with items
      return tx.sale.findUnique({
        where: { id: sale.id },
        include: {
          items: {
            include: {
              productVariant: {
                select: { sku: true, product: { select: { name: true } } }
              }
            }
          },
          client: {
            select: { name: true, email: true }
          }
        }
      });
    }, {
      maxWait: 5000,
      timeout: 10000, 
      isolationLevel: 'ReadCommitted' // Appropriate for inventory operations
    });

    if (!sale) throw new NotFoundException('Failed to create sale');
    return new SaleEntity(sale);
  }

  async findAll(companyId: string): Promise<SaleEntity[] | undefined> {
    const sales = await this.prisma.sale.findMany({
      where: { companyId },
    });
    return sales.map((item) => new SaleEntity(item));
  }

  async findOne(id: string, companyId: string): Promise<SaleEntity> {
    const sale = await this.prisma.sale.findFirst({
      where: { id, companyId },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return new SaleEntity(sale);
  }

  async update(
    id: string,
    dto: UpdateSaleDto,
    companyId: string,
  ): Promise<SaleEntity> {
    const sale = await this.findOne(id, companyId);
    const { items: _ignoredItems, saleDate, ...rest } = dto;

    const data: Prisma.SaleUncheckedUpdateInput = {
      ...rest,
      saleDate: saleDate ? new Date(saleDate) : undefined,
    };

    const saleUpdated = await this.prisma.sale.update({
      where: { id: sale.id },
      data,
    });
    return new SaleEntity(saleUpdated);
  }

  async remove(id: string, companyId: string): Promise<SaleEntity> {
    const sale = await this.findOne(id, companyId);
    const saleDeleted = await this.prisma.sale.delete({
      where: { id: sale.id },
    });
    return new SaleEntity(saleDeleted);
  }

  private async allocateFifo(
    tx: Prisma.TransactionClient, 
    items: CreateSaleItemDtoWithoutSaleId[]
  ): Promise<AllocationResult[]> {
    const results: AllocationResult[] = [];
  
    for (const item of items) {
      let remaining = item.quantity;
  
      // Fetch available stock lots FIFO
      const lots = await tx.stockItem.findMany({
        where: {
          productVariantId: item.productVariantId,
          quantity: { gt: 0 },
        },
        orderBy: { expirationDate: 'asc' }, // todo check if expirationDate is better choice
      });
  
      if (lots.length === 0) {
        throw new BadRequestException(
          `No stock available for variant ${item.productVariantId}`,
        );
      }
  
      const allocations: AllocationLine[] = [];
  
      for (const lot of lots) {
        if (remaining <= 0) break;
  
        const allocateQty = Math.min(remaining, lot.quantity);
  
        allocations.push({
          stockItemId: lot.id,
          qtyAllocated: allocateQty,
          qtyPrevious: lot.quantity,
          unitCost: Number(lot.unitPrice), 
        });
  
        remaining -= allocateQty;
      }
  
      if (remaining > 0) {
        throw new BadRequestException(
          `Insufficient stock for variant ${item.productVariantId}. Missing ${remaining} units.`,
        );
      }
  
      results.push({
        productVariantId: item.productVariantId,
        lines: allocations,
      });
    }
  
    return results;
  }

  private async ensureAllExist(variants: Variant[], items: CreateSaleItemDtoWithoutSaleId[]){
    const existingIds = new Set(variants.map(v => v.id));
    const missingIds = items
      .map(i => i.productVariantId)
      .filter(id => !existingIds.has(id));
  
    if (missingIds.length > 0) {
      throw new BadRequestException(
        `Some product variants do not exist or do not belong to this company: ${missingIds.join(', ')}`
      );
    }
  }
}