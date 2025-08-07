import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SaleEntity } from './entities/sale.entity';

@Injectable()
export class SaleService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateSaleDto,
    companyId: string,
    userId: string,
  ): Promise<SaleEntity> {
    const sale = await this.prisma.sale.create({
      data: {
        ...dto,
        saleDate: dto.saleDate ? new Date(dto.saleDate) : new Date(),
        companyId,
        userId,
      },
    });
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
    const saleUpdated = await this.prisma.sale.update({
      where: { id: sale.id },
      data: dto,
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
}