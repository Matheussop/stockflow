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
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductVariantService } from './product-variant.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import type { UserWithCompany } from '../product/product.controller';
import { User as CurrentUser } from '../auth/decorators/user.decorator';
import { ProductVariantEntity } from './entities/product-variant.entity';

@ApiTags('Product Variants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('product/:productId/variant')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  @ApiOperation({ summary: 'Create a new product variant' })
  @ApiResponse({
    status: 201,
    description: 'Product variant successfully created',
    type: ProductVariantEntity,
  })
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(
    @Param('productId') productId: string,
    @Body() dto: CreateProductVariantDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<ProductVariantEntity> {
    return this.productVariantService.create(dto, productId, user.companyId);
  }

  @ApiOperation({ summary: 'List all variants for a product' })
  @ApiOkResponse({ type: [ProductVariantEntity] })
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findAll(
    @Param('productId') productId: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<ProductVariantEntity[] | undefined> {
    return this.productVariantService.findAll(productId, user.companyId);
  }

  @ApiOperation({ summary: 'Get a single product variant by ID' })
  @ApiOkResponse({ type: ProductVariantEntity })
  @ApiParam({
    name: 'id',
    description: 'Product Variant ID',
    example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
  })
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findOne(
    @Param('productId') productId: string,
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<ProductVariantEntity> {
    return this.productVariantService.findOne(id, productId, user.companyId);
  }

  @ApiOperation({ summary: 'Update a product variant by ID' })
  @ApiOkResponse({ type: ProductVariantEntity })
  @ApiParam({
    name: 'id',
    description: 'Product Variant ID',
    example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
  })
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async update(
    @Param('productId') productId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductVariantDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<ProductVariantEntity> {
    return this.productVariantService.update(
      id,
      productId,
      dto,
      user.companyId,
    );
  }

  @ApiOperation({ summary: 'Delete a product variant by ID' })
  @ApiOkResponse({
    description: 'Product variant deleted successfully',
    type: ProductVariantEntity,
  })
  @ApiParam({
    name: 'id',
    description: 'Product Variant ID',
    example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
  })
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(
    @Param('productId') productId: string,
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<ProductVariantEntity> {
    return this.productVariantService.remove(id, productId, user.companyId);
  }
}