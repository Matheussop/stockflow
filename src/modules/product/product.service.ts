import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { Product } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto, companyId: string): Promise<Product> {
    return this.prisma.product.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async findAll(companyId: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { companyId },
    });
  }

  async findOne(id: string, companyId: string): Promise<Product | null> {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    companyId: string,
  ): Promise<Product | null> {
    const product = await this.findOne(id, companyId);

    if (!product) throw new NotFoundException();
    return this.prisma.product.update({
      where: { id: product.id },
      data: dto,
    });
  }

  async remove(id: string, companyId: string): Promise<Product> {
    const product = await this.findOne(id, companyId);

    if (!product) throw new NotFoundException();
    return this.prisma.product.delete({
      where: { id: product.id },
    });
  }
}
