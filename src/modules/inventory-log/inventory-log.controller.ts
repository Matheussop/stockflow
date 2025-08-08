import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { InventoryLogService } from './inventory-log.service';
import { CreateInventoryLogDto } from './dto/create-inventory-log.dto';
import { InventoryLogEntity } from './entities/inventory-log.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role, InventoryLogType } from '@prisma/client';
import { User as CurrentUser } from '../auth/decorators/user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

type UserWithCompany = JwtPayload & { companyId: string };

@ApiTags('Inventory Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory-log')
export class InventoryLogController {
  constructor(private readonly service: InventoryLogService) {}

  @ApiOperation({ summary: 'Create a manual inventory log and update stock quantity' })
  @ApiResponse({ status: 201, type: InventoryLogEntity })
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(
    @Body() dto: CreateInventoryLogDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<InventoryLogEntity> {
    return this.service.createManual(dto, user.companyId, user.sub);
  }

  @ApiOperation({ summary: 'List inventory logs for current company' })
  @ApiOkResponse({ type: [InventoryLogEntity] })
  @ApiQuery({ name: 'stockItemId', required: false })
  @ApiQuery({ name: 'type', required: false, enum: InventoryLogType })
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findAll(
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
    @Query('stockItemId') stockItemId?: string,
    @Query('type') type?: InventoryLogType,
  ): Promise<InventoryLogEntity[]> {
    return this.service.findAll(user.companyId, { stockItemId, type });
  }

  @ApiOperation({ summary: 'Get a single inventory log by ID' })
  @ApiOkResponse({ type: InventoryLogEntity })
  @ApiParam({ name: 'id', example: 'f2b2a6a4-6a0a-4a3f-9b8c-2f1b3c4d5e6f' })
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findOne(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<InventoryLogEntity> {
    return this.service.findOne(id, user.companyId);
  }

  @ApiOperation({ summary: 'Revert a previous inventory log and restore stock quantity' })
  @ApiOkResponse({ type: InventoryLogEntity })
  @ApiParam({ name: 'id', description: 'Inventory log ID' })
  @Post(':id/revert')
  @Roles(Role.ADMIN, Role.MANAGER)
  async revert(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<InventoryLogEntity> {
    return this.service.revert(id, user.companyId, user.sub);
  }
}


