import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyEntity } from './entities/company.entity';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCompanyDto): Promise<CompanyEntity> {
    const company = await this.prisma.company.create({ data: dto });
    return new CompanyEntity(company);
  }

  async findAll(): Promise<CompanyEntity[]> {
    const companies = await this.prisma.company.findMany();
    return companies.map((item) => new CompanyEntity(item));
  }

  async findOne(id: string): Promise<CompanyEntity> {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    return new CompanyEntity(company);
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<CompanyEntity> {
    await this.findOne(id);
    const companyUpdated = await this.prisma.company.update({
      where: { id },
      data: dto,
    });
    return new CompanyEntity(companyUpdated);
  }

  async remove(id: string): Promise<CompanyEntity> {
    await this.findOne(id);
    const companyDeleted = await this.prisma.company.delete({ where: { id } });
    return new CompanyEntity(companyDeleted);
  }
}