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
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { User as CurrentUser } from '../auth/decorators/user.decorator';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SaleEntity } from './entities/sale.entity';
import type { UserWithCompany } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({
    status: 201,
    description: 'Sale successfully created',
    type: SaleEntity,
  })
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(
    @Body() dto: CreateSaleDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<SaleEntity> {
    return this.saleService.create(dto, user.companyId, user.sub);
  }

  @ApiOperation({ summary: 'List all sales from current company' })
  @ApiOkResponse({ type: [SaleEntity] })
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findAll(
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<SaleEntity[] | undefined> {
    return this.saleService.findAll(user.companyId);
  }

  @ApiOperation({ summary: 'Get a single sale by ID' })
  @ApiOkResponse({ type: SaleEntity })
  @ApiParam({
    name: 'id',
    description: 'Sale ID',
    example: 'f4ca84c1-6a3e-49bb-bf19-64b0c4f113fb',
  })
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findOne(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<SaleEntity> {
    return this.saleService.findOne(id, user.companyId);
  }

  @ApiOperation({ summary: 'Update a sale by ID' })
  @ApiOkResponse({ type: SaleEntity })
  @ApiParam({
    name: 'id',
    description: 'Sale ID',
    example: 'f4ca84c1-6a3e-49bb-bf19-64b0c4f113fb',
  })
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSaleDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<SaleEntity> {
    return this.saleService.update(id, dto, user.companyId);
  }

  @ApiOperation({ summary: 'Delete a sale by ID' })
  @ApiOkResponse({
    description: 'Sale deleted successfully',
    type: SaleEntity,
  })
  @ApiParam({
    name: 'id',
    description: 'Sale ID',
    example: 'f4ca84c1-6a3e-49bb-bf19-64b0c4f113fb',
  })
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<SaleEntity> {
    return this.saleService.remove(id, user.companyId);
  }
}