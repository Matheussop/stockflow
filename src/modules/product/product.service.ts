import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ProductEntity } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateProductDto,
    companyId: string,
  ): Promise<ProductEntity> {
    const product = await this.prisma.product.create({
      data: {
        ...dto,
        companyId,
      },
    });
    return new ProductEntity(product);
  }

  async findAll(companyId: string): Promise<ProductEntity[] | undefined> {
    const products = await this.prisma.product.findMany({
      where: { companyId, deletedAt: null },
    });
    return products.map((item) => new ProductEntity(item));
  }

  async findOne(id: string, companyId: string): Promise<ProductEntity> {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!product) throw new NotFoundException('Product not found');
    return new ProductEntity(product);
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    companyId: string,
  ): Promise<ProductEntity> {
    const product = await this.findOne(id, companyId);

    if (!product) throw new NotFoundException();
    const productUpdated = await this.prisma.product.update({
      where: { id: product.id },
      data: dto,
    });
    return new ProductEntity(productUpdated);
  }

  async remove(id: string, companyId: string): Promise<ProductEntity> {
    const product = await this.findOne(id, companyId);

    if (!product) throw new NotFoundException();
    const productDeleted = await this.prisma.product.update({
      where: { id: product.id }, data: { deletedAt: new Date() },
    });
    return new ProductEntity(productDeleted);
  }
}
