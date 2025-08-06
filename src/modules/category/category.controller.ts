import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UserWithCompany } from '../product/product.controller';
import { CategoryEntity } from './entities/category.entity';
import { User as CurrentUser } from '../auth/decorators/user.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Category')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category successfully created',
    type: CategoryEntity,
  })
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<CategoryEntity> {
    return this.categoryService.create(createCategoryDto, user.companyId);
  }
  @ApiOperation({ summary: 'List all categories from current company' })
  @ApiOkResponse({ type: [CategoryEntity] })
  @Get()
  async findAll(
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<CategoryEntity[] | undefined> {
    return this.categoryService.findAll(user.companyId);
  }

  @ApiOperation({ summary: 'Get a single category by ID' })
  @ApiOkResponse({ type: CategoryEntity })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '83d2e9b8-63e1-4d55-83fa-e3b4a17401e6',
  })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<CategoryEntity> {
    return this.categoryService.findOne(id, user.companyId);
  }

  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiOkResponse({ type: CategoryEntity })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '83d2e9b8-63e1-4d55-83fa-e3b4a17401e6',
  })
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<CategoryEntity> {
    return this.categoryService.update(id, updateCategoryDto, user.companyId);
  }

  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiOkResponse({
    description: 'Category deleted successfully',
    type: CategoryEntity,
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '83d2e9b8-63e1-4d55-83fa-e3b4a17401e6',
  })
  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async remove(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<CategoryEntity> {
    return this.categoryService.remove(id, user.companyId);
  }
}
