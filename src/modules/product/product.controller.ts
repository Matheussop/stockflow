import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { User as CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ProductEntity } from './entities/product.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

export type UserWithCompany = JwtPayload & { companyId: string };

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product successfully created',
    type: ProductEntity,
  })
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<ProductEntity> {
    return this.productService.create(createProductDto, user.companyId);
  }

  @ApiOperation({ summary: 'List all products from current company' })
  @ApiOkResponse({ type: [ProductEntity] })
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findAll(
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<ProductEntity[] | undefined> {
    return this.productService.findAll(user.companyId);
  }

  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiOkResponse({ type: ProductEntity })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
  })
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findOne(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<ProductEntity> {
    const product = await this.productService.findOne(id, user.companyId);
    return product;
  }

  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiOkResponse({ type: ProductEntity })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
  })
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<ProductEntity> {
    return this.productService.update(id, dto, user.companyId);
  }

  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiOkResponse({
    description: 'Product deleted successfully',
    type: ProductEntity,
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
  })
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<ProductEntity> {
    return this.productService.remove(id, user.companyId);
  }
}
