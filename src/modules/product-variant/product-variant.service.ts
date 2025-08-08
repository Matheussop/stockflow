import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariantEntity } from './entities/product-variant.entity';

@Injectable()
export class ProductVariantService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateProductVariantDto,
    productId: string,
    companyId: string,
  ): Promise<ProductVariantEntity> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, companyId, deletedAt: null },
    });

    if (!product) throw new NotFoundException('Product not found');

    const variant = await this.prisma.productVariant.create({
      data: { ...dto, productId },
    });

    return new ProductVariantEntity(variant);
  }

  async findAll(
    productId: string,
    companyId: string,
  ): Promise<ProductVariantEntity[] | undefined> {
    const variants = await this.prisma.productVariant.findMany({
      where: { productId, product: { companyId } },
    });
    return variants.map((item) => new ProductVariantEntity(item));
  }

  async findOne(
    id: string,
    productId: string,
    companyId: string,
  ): Promise<ProductVariantEntity> {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id, productId, product: { companyId } },
    });
    if (!variant) throw new NotFoundException('Product variant not found');
    return new ProductVariantEntity(variant);
  }

  async update(
    id: string,
    productId: string,
    dto: UpdateProductVariantDto,
    companyId: string,
  ): Promise<ProductVariantEntity> {
    const variant = await this.findOne(id, productId, companyId);
    const variantUpdated = await this.prisma.productVariant.update({
      where: { id: variant.id },
      data: dto,
    });
    return new ProductVariantEntity(variantUpdated);
  }

  async remove(
    id: string,
    productId: string,
    companyId: string,
  ): Promise<ProductVariantEntity> {
    const variant = await this.findOne(id, productId, companyId);
    const variantDeleted = await this.prisma.productVariant.delete({
      where: { id: variant.id },
    });
    return new ProductVariantEntity(variantDeleted);
  }
}