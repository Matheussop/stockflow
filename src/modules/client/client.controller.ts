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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { ClientEntity } from './entities/client.entity';
import { User as CurrentUser } from '../auth/decorators/user.decorator';
import type { UserWithCompany } from '../product/product.controller';

@ApiTags('Client')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({
    status: 201,
    description: 'Client successfully created',
    type: ClientEntity,
  })
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(
    @Body() createClientDto: CreateClientDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<ClientEntity> {
    return this.clientService.create(createClientDto, user.companyId);
  }

  @ApiOperation({ summary: 'List all clients from current company' })
  @ApiOkResponse({ type: [ClientEntity] })
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findAll(
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<ClientEntity[] | undefined> {
    return this.clientService.findAll(user.companyId);
  }

  @ApiOperation({ summary: 'Get a single client by ID' })
  @ApiOkResponse({ type: ClientEntity })
  @ApiParam({
    name: 'id',
    description: 'Client ID',
    example: 'f1a2b3c4-d5e6-7890-ab12-cd34ef56gh78',
  })
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findOne(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<ClientEntity> {
    return this.clientService.findOne(id, user.companyId);
  }

  @ApiOperation({ summary: 'Update a client by ID' })
  @ApiOkResponse({ type: ClientEntity })
  @ApiParam({
    name: 'id',
    description: 'Client ID',
    example: 'f1a2b3c4-d5e6-7890-ab12-cd34ef56gh78',
  })
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<ClientEntity> {
    return this.clientService.update(id, updateClientDto, user.companyId);
  }

  @ApiOperation({ summary: 'Delete a client by ID' })
  @ApiOkResponse({
    description: 'Client deleted successfully',
    type: ClientEntity,
  })
  @ApiParam({
    name: 'id',
    description: 'Client ID',
    example: 'f1a2b3c4-d5e6-7890-ab12-cd34ef56gh78',
  })
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<ClientEntity> {
    return this.clientService.remove(id, user.companyId);
  }
}