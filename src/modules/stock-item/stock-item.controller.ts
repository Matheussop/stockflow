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
import { StockItemService } from './stock-item.service';
import { CreateStockItemDto } from './dto/create-stock-item.dto';
import { UpdateStockItemDto } from './dto/update-stock-item.dto';
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
import { StockItemEntity } from './entities/stock-item.entity';
import type { UserWithCompany } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Stock Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock-item')
export class StockItemController {
  constructor(private readonly stockItemService: StockItemService) {}

  @ApiOperation({ summary: 'Create a new stock item' })
  @ApiResponse({
    status: 201,
    description: 'Stock item successfully created',
    type: StockItemEntity,
  })
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(
    @Body() dto: CreateStockItemDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<StockItemEntity> {
    return this.stockItemService.create(dto, user.companyId);
  }

  @ApiOperation({ summary: 'List all stock items from current company' })
  @ApiOkResponse({ type: [StockItemEntity] })
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findAll(
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<StockItemEntity[] | undefined> {
    return this.stockItemService.findAll(user.companyId);
  }

  @ApiOperation({ summary: 'Get a single stock item by ID' })
  @ApiOkResponse({ type: StockItemEntity })
  @ApiParam({
    name: 'id',
    description: 'Stock item ID',
    example: '5c884fd0-b285-4f6b-8aba-51dd2c2dccc4',
  })
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findOne(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<StockItemEntity> {
    return this.stockItemService.findOne(id, user.companyId);
  }

  @ApiOperation({ summary: 'Update a stock item by ID' })
  @ApiOkResponse({ type: StockItemEntity })
  @ApiParam({
    name: 'id',
    description: 'Stock item ID',
    example: '5c884fd0-b285-4f6b-8aba-51dd2c2dccc4',
  })
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStockItemDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<StockItemEntity> {
    return this.stockItemService.update(id, dto, user.companyId);
  }

  @ApiOperation({ summary: 'Delete a stock item by ID' })
  @ApiOkResponse({
    description: 'Stock item deleted successfully',
    type: StockItemEntity,
  })
  @ApiParam({
    name: 'id',
    description: 'Stock item ID',
    example: '5c884fd0-b285-4f6b-8aba-51dd2c2dccc4',
  })
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<StockItemEntity> {
    return this.stockItemService.remove(id, user.companyId);
  }
}