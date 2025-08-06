import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
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
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ) {
    return this.productService.create(createProductDto, user.companyId);
  }

  @ApiOperation({ summary: 'List all products from current company' })
  @ApiOkResponse({ type: [ProductEntity] })
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  findAll(@CurrentUser({ requireCompanyId: true }) user: UserWithCompany) {
    return this.productService.findAll(user.companyId);
  }

  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiOkResponse({ type: ProductEntity })
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  findOne(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ) {
    return this.productService.findOne(id, user.companyId);
  }

  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiOkResponse({ type: ProductEntity })
  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ) {
    return this.productService.update(id, dto, user.companyId);
  }

  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiOkResponse({
    description: 'Product deleted successfully',
    type: ProductEntity,
  })
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ) {
    return this.productService.remove(id, user.companyId);
  }
}
