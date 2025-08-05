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
import type { User } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { User as CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product successfully created' })
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: User,
  ) {
    return this.productService.create(createProductDto, user.companyId);
  }

  @ApiOperation({ summary: 'List all products from current company' })
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  findAll(@CurrentUser() user: User) {
    return this.productService.findAll(user.companyId);
  }

  @ApiOperation({ summary: 'Get a single product by ID' })
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.productService.findOne(id, user.companyId);
  }

  @ApiOperation({ summary: 'Update a product by ID' })
  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: User,
  ) {
    return this.productService.update(id, dto, user.companyId);
  }

  @ApiOperation({ summary: 'Delete a product by ID' })
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.productService.remove(id, user.companyId);
  }
}
