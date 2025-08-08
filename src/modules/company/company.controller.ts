import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CompanyEntity } from './entities/company.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Company')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({
    status: 201,
    description: 'Company successfully created',
    type: CompanyEntity,
  })
  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateCompanyDto): Promise<CompanyEntity> {
    return this.companyService.create(dto);
  }

  @ApiOperation({ summary: 'List all companies' })
  @ApiOkResponse({ type: [CompanyEntity] })
  @Get()
  @Roles(Role.ADMIN)
  async findAll(): Promise<CompanyEntity[]> {
    return this.companyService.findAll();
  }

  @ApiOperation({ summary: 'Get a single company by ID' })
  @ApiOkResponse({ type: CompanyEntity })
  @ApiParam({
    name: 'id',
    description: 'Company ID',
    example: 'e7d3c40d-bf88-4a8f-a308-09d9a7f4cdaa',
  })
  @Get(':id')
  @Roles(Role.ADMIN)
  async findOne(@Param('id') id: string): Promise<CompanyEntity> {
    return this.companyService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a company by ID' })
  @ApiOkResponse({ type: CompanyEntity })
  @ApiParam({
    name: 'id',
    description: 'Company ID',
    example: 'e7d3c40d-bf88-4a8f-a308-09d9a7f4cdaa',
  })
  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
  ): Promise<CompanyEntity> {
    return this.companyService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a company by ID' })
  @ApiOkResponse({
    description: 'Company deleted successfully',
    type: CompanyEntity,
  })
  @ApiParam({
    name: 'id',
    description: 'Company ID',
    example: 'e7d3c40d-bf88-4a8f-a308-09d9a7f4cdaa',
  })
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<CompanyEntity> {
    return this.companyService.remove(id);
  }
}