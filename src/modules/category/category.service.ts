import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateCategoryDto,
    companyId: string,
  ): Promise<CategoryEntity> {
    const category = await this.prisma.category.create({
      data: {
        ...dto,
        companyId,
      },
    });
    return new CategoryEntity(category);
  }

  async findAll(companyId: string): Promise<CategoryEntity[] | undefined> {
    const categories = await this.prisma.category.findMany({
      where: { companyId },
    });
    return categories.map((item) => new CategoryEntity(item));
  }

  async findOne(id: string, companyId: string): Promise<CategoryEntity> {
    const category = await this.prisma.category.findFirst({
      where: { id, companyId },
    });

    if (!category) throw new NotFoundException('category not found');
    return new CategoryEntity(category);
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    companyId: string,
  ): Promise<CategoryEntity> {
    const category = await this.findOne(id, companyId);

    if (!category) throw new NotFoundException();
    const categoryUpdated = await this.prisma.category.update({
      where: { id: category.id },
      data: dto,
    });
    return new CategoryEntity(categoryUpdated);
  }

  async remove(id: string, companyId: string): Promise<CategoryEntity> {
    const category = await this.findOne(id, companyId);

    if (!category) throw new NotFoundException();
    const categoryDeleted = await this.prisma.category.delete({
      where: { id: category.id },
    });
    return new CategoryEntity(categoryDeleted);
  }
}
