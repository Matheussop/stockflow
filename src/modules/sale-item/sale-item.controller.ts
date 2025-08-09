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
import { SaleItemService } from './sale-item.service';
import { CreateSaleItemDto } from './dto/create-sale-item.dto';
import { UpdateSaleItemDto } from './dto/update-sale-item.dto';
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
import { SaleItemEntity } from './entities/sale-item.entity';
import type { UserWithCompany } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Sale Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sale-item')
export class SaleItemController {
  constructor(private readonly saleItemService: SaleItemService) {}

  @ApiOperation({ summary: 'Create a new sale item' })
  @ApiResponse({
    status: 201,
    description: 'Sale item successfully created',
    type: SaleItemEntity,
  })
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(
    @Body() dto: CreateSaleItemDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<SaleItemEntity> {
    return this.saleItemService.create(dto, user.companyId);
  }

  @ApiOperation({ summary: 'List all sale items from current company' })
  @ApiOkResponse({ type: [SaleItemEntity] })
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findAll(
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<SaleItemEntity[] | undefined> {
    return this.saleItemService.findAll(user.companyId);
  }

  @ApiOperation({ summary: 'Get a single sale item by ID' })
  @ApiOkResponse({ type: SaleItemEntity })
  @ApiParam({
    name: 'id',
    description: 'Sale item ID',
    example: '5c884fd0-b285-4f6b-8aba-51dd2c2dccc4',
  })
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findOne(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<SaleItemEntity> {
    return this.saleItemService.findOne(id, user.companyId);
  }

  @ApiOperation({ summary: 'Update a sale item by ID' })
  @ApiOkResponse({ type: SaleItemEntity })
  @ApiParam({
    name: 'id',
    description: 'Sale item ID',
    example: '5c884fd0-b285-4f6b-8aba-51dd2c2dccc4',
  })
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSaleItemDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<SaleItemEntity> {
    return this.saleItemService.update(id, dto, user.companyId);
  }

  @ApiOperation({ summary: 'Delete a sale item by ID' })
  @ApiOkResponse({
    description: 'Sale item deleted successfully',
    type: SaleItemEntity,
  })
  @ApiParam({
    name: 'id',
    description: 'Sale item ID',
    example: '5c884fd0-b285-4f6b-8aba-51dd2c2dccc4',
  })
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<SaleItemEntity> {
    return this.saleItemService.remove(id, user.companyId);
  }
}