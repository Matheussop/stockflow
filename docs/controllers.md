# API Controllers and Endpoint Patterns

## Overview

This guide covers controller implementation patterns in Stockflow, including API endpoint design, security implementation, Swagger documentation, and proper HTTP response handling within a multi-tenant architecture. Use this for both creating new controllers and adding endpoints to existing ones.

## Core Dependencies

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Query,
  Res,
  Header,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { User as CurrentUser } from '../auth/decorators/user.decorator';
import { Role } from '@prisma/client';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
```

## Basic Controller Structure

### Standard CRUD Controller Template
```typescript
export type UserWithCompany = JwtPayload & { companyId: string };

@ApiTags('Entity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('entity')
export class EntityController {
  constructor(private readonly entityService: EntityService) {}

  @ApiOperation({ summary: 'Create a new entity' })
  @ApiCreatedResponse({
    description: 'Entity successfully created',
    type: EntityEntity,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(
    @Body() createDto: CreateEntityDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<EntityEntity> {
    return this.entityService.create(createDto, user.companyId);
  }

  @ApiOperation({ summary: 'List all entities from current company' })
  @ApiOkResponse({ type: [EntityEntity] })
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findAll(
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<EntityEntity[]> {
    return this.entityService.findAll(user.companyId);
  }

  @ApiOperation({ summary: 'Get a single entity by ID' })
  @ApiOkResponse({ type: EntityEntity })
  @ApiNotFoundResponse({ description: 'Entity not found' })
  @ApiParam({
    name: 'id',
    description: 'Entity ID',
    example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
  })
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findOne(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<EntityEntity> {
    return this.entityService.findOne(id, user.companyId);
  }

  @ApiOperation({ summary: 'Update an entity by ID' })
  @ApiOkResponse({ type: EntityEntity })
  @ApiNotFoundResponse({ description: 'Entity not found' })
  @ApiParam({
    name: 'id',
    description: 'Entity ID',
    example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
  })
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEntityDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<EntityEntity> {
    return this.entityService.update(id, dto, user.companyId);
  }

  @ApiOperation({ summary: 'Delete an entity by ID' })
  @ApiOkResponse({
    description: 'Entity deleted successfully',
    type: EntityEntity,
  })
  @ApiNotFoundResponse({ description: 'Entity not found' })
  @ApiParam({
    name: 'id',
    description: 'Entity ID',
    example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
  })
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<EntityEntity> {
    return this.entityService.remove(id, user.companyId);
  }
}
```

## Adding New Endpoints

### Endpoint Creation Workflow

Before creating an endpoint:
- [ ] Define the business purpose and operation
- [ ] Identify required input/output data
- [ ] Determine HTTP method (GET, POST, PATCH, DELETE)
- [ ] Plan URL structure and parameters
- [ ] Identify security requirements (roles, company isolation)
- [ ] Consider performance implications

### RESTful URL Design

```bash
# Resource operations
GET    /product              # List all products
GET    /product/:id          # Get single product
POST   /product              # Create new product
PATCH  /product/:id          # Update product
DELETE /product/:id          # Delete product

# Nested resources
GET    /product/:id/variants # Get variants for product
POST   /product/:id/variants # Create variant for product

# Action endpoints (non-CRUD)
POST   /product/:id/activate   # Activate product
POST   /product/search         # Search products
GET    /product/export         # Export products
POST   /product/bulk-import    # Import products
```

## Common Endpoint Patterns

### 1. Search/Filter Endpoints

```typescript
@ApiOperation({
  summary: 'Search products with filters',
  description: 'Search and filter products with pagination support'
})
@ApiOkResponse({
  description: 'Paginated search results',
  schema: {
    type: 'object',
    properties: {
      data: { type: 'array', items: { $ref: '#/components/schemas/ProductEntity' } },
      total: { type: 'number', example: 150 },
      page: { type: 'number', example: 1 },
      pages: { type: 'number', example: 15 },
    }
  }
})
@Get('search')
@Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
async search(
  @Query() params: SearchProductDto,
  @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
): Promise<{
  data: ProductEntity[];
  total: number;
  page: number;
  pages: number;
}> {
  return this.productService.search(params, user.companyId);
}
```

### 2. Action Endpoints

```typescript
@ApiOperation({
  summary: 'Activate a product',
  description: 'Sets a product as active for sales and listings'
})
@ApiOkResponse({ type: ProductEntity })
@ApiNotFoundResponse({ description: 'Product not found' })
@ApiParam({
  name: 'id',
  description: 'Product ID',
  example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
})
@Post(':id/activate')
@Roles(Role.ADMIN, Role.MANAGER)
async activate(
  @Param('id') id: string,
  @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
): Promise<ProductEntity> {
  return this.productService.update(id, { isActive: true }, user.companyId);
}
```

### 3. Bulk Operations

```typescript
@ApiOperation({
  summary: 'Perform bulk actions on products',
  description: 'Activate, deactivate, or delete multiple products at once'
})
@ApiOkResponse({
  description: 'Bulk action completed',
  schema: {
    type: 'object',
    properties: {
      affected: { type: 'number', example: 5 },
      message: { type: 'string', example: 'Successfully activated 5 products' },
    }
  }
})
@ApiBadRequestResponse({
  description: 'Invalid product IDs or insufficient permissions'
})
@Post('bulk-action')
@Roles(Role.ADMIN, Role.MANAGER)
async bulkAction(
  @Body() dto: BulkProductActionDto,
  @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
): Promise<{ affected: number; message: string }> {
  return this.productService.bulkAction(dto, user.companyId);
}
```

### 4. File Export/Download

```typescript
@ApiOperation({
  summary: 'Export products to CSV',
  description: 'Downloads all company products as a CSV file'
})
@ApiOkResponse({
  description: 'CSV file download',
  headers: {
    'Content-Type': { description: 'text/csv' },
    'Content-Disposition': { description: 'attachment; filename="products.csv"' },
  },
})
@Get('export')
@Header('Content-Type', 'text/csv')
@Header('Content-Disposition', 'attachment; filename="products.csv"')
@Roles(Role.ADMIN, Role.MANAGER)
async exportToCsv(
  @Res() res: Response,
  @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
): Promise<void> {
  const csvData = await this.productService.exportToCsv(user.companyId);
  res.send(csvData);
}
```

### 5. File Upload

```typescript
import { FileInterceptor } from '@nestjs/platform-express';

@ApiOperation({ summary: 'Upload product image' })
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: 'Product image file',
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
@ApiCreatedResponse({
  description: 'Image uploaded successfully',
  schema: {
    type: 'object',
    properties: {
      imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
    }
  }
})
@Post(':id/upload-image')
@UseInterceptors(FileInterceptor('file', {
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/^image\//)) {
      return callback(new BadRequestException('Only image files are allowed'), false);
    }
    callback(null, true);
  },
}))
@Roles(Role.ADMIN, Role.MANAGER)
async uploadImage(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
  @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
): Promise<{ imageUrl: string }> {
  if (!file) {
    throw new BadRequestException('No file uploaded');
  }
  
  return this.productService.uploadImage(id, file, user.companyId);
}
```

### 6. Nested Resource Access

```typescript
@ApiOperation({
  summary: 'Get all variants for a product',
  description: 'Retrieves all active variants belonging to the specified product'
})
@ApiOkResponse({ type: [ProductVariantEntity] })
@ApiNotFoundResponse({ description: 'Product not found' })
@ApiParam({
  name: 'productId',
  description: 'Product ID',
  example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
})
@Get(':productId/variants')
@Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
async getProductVariants(
  @Param('productId') productId: string,
  @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
): Promise<ProductVariantEntity[]> {
  // Verify product exists and belongs to company
  await this.productService.findOne(productId, user.companyId);
  
  // Get variants through product variant service
  return this.productVariantService.findByProduct(productId, user.companyId);
}
```

### 7. Pagination Support

```typescript
@ApiOperation({ summary: 'Get paginated list of products' })
@ApiOkResponse({
  description: 'Paginated products list',
  schema: {
    type: 'object',
    properties: {
      data: { type: 'array', items: { $ref: '#/components/schemas/ProductEntity' } },
      total: { type: 'number', example: 150 },
      page: { type: 'number', example: 1 },
      pages: { type: 'number', example: 15 },
    }
  }
})
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
@Get('paginated')
@Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
async findAllPaginated(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
): Promise<{
  data: ProductEntity[];
  total: number;
  page: number;
  pages: number;
}> {
  return this.productService.findAllPaginated(user.companyId, page, limit);
}
```

## Security Implementation

### Authentication and Authorization
```typescript
// Global guards for all endpoints in controller
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('product')
export class ProductController {
  
  // Role-based access control per endpoint
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER) // Only ADMIN and MANAGER can create
  async create(/* params */) { /* implementation */ }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER) // All roles can view
  async findAll(/* params */) { /* implementation */ }

  @Delete(':id')
  @Roles(Role.ADMIN) // Only ADMIN can delete
  async remove(/* params */) { /* implementation */ }
}
```

### User Context and Company Isolation
```typescript
// Always require company context for business operations
@Post()
async create(
  @Body() dto: CreateProductDto,
  @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
): Promise<ProductEntity> {
  // user.companyId is automatically enforced
  return this.productService.create(dto, user.companyId);
}

// For operations that might need user ID
@Post('sale')
async createSale(
  @Body() dto: CreateSaleDto,
  @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
): Promise<SaleEntity> {
  return this.saleService.create(dto, user.companyId, user.sub); // user.sub is userId
}
```

### Conditional Access Based on Role

```typescript
@Get('detailed')
@Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
async getDetailedList(
  @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
): Promise<ProductEntity[]> {
  const includeFinancials = [Role.ADMIN, Role.MANAGER].includes(user.role);
  const includeSensitive = user.role === Role.ADMIN;
  
  return this.productService.findAllDetailed(
    user.companyId,
    includeFinancials,
    includeSensitive
  );
}
```

## Swagger Documentation

### Complete API Documentation
```typescript
@ApiTags('Products') // Groups endpoints in Swagger UI
@ApiBearerAuth() // Indicates JWT authentication required
@Controller('product')
export class ProductController {

  @ApiOperation({ 
    summary: 'Create a new product',
    description: 'Creates a new product within the current company context. Requires ADMIN or MANAGER role.'
  })
  @ApiCreatedResponse({
    description: 'Product successfully created',
    type: ProductEntity,
  })
  @ApiBadRequestResponse({ 
    description: 'Validation failed or business rule violation',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Category not found' },
        error: { type: 'string', example: 'Bad Request' },
      }
    }
  })
  @Post()
  async create(/* params */) { /* implementation */ }
}
```

### Complex Response Documentation
```typescript
@ApiOperation({ summary: 'Get product analytics' })
@ApiOkResponse({
  description: 'Product analytics data',
  schema: {
    type: 'object',
    properties: {
      totalProducts: { type: 'number', example: 150 },
      activeProducts: { type: 'number', example: 120 },
      inactiveProducts: { type: 'number', example: 30 },
      categoriesBreakdown: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            categoryName: { type: 'string', example: 'Electronics' },
            count: { type: 'number', example: 45 },
          }
        }
      }
    }
  }
})
@Get('analytics')
async getAnalytics(/* params */) { /* implementation */ }
```

## Error Handling

### Standard Error Responses
```typescript
// Let NestJS handle standard HTTP exceptions
@Get(':id')
async findOne(
  @Param('id') id: string,
  @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
): Promise<ProductEntity> {
  // Service will throw NotFoundException, automatically becomes HTTP 404
  return this.productService.findOne(id, user.companyId);
}

// Custom validation with descriptive errors
@Post()
async create(
  @Body() dto: CreateProductDto,
  @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
): Promise<ProductEntity> {
  try {
    return await this.productService.create(dto, user.companyId);
  } catch (error) {
    // Let NestJS exception filter handle known exceptions
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error;
    }
    
    // Log and rethrow unknown errors
    console.error('Unexpected error creating product:', error);
    throw new InternalServerErrorException('Failed to create product');
  }
}
```

## Testing Controllers

### E2E Test Structure

```typescript
describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let managerToken: string;
  let viewerToken: string;

  beforeEach(async () => {
    // Setup test app and authentication tokens
  });

  describe('POST /product', () => {
    it('should create a new product with valid data', () => {
      return request(app.getHttpServer())
        .post('/product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProductDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe(validProductDto.name);
          expect(res.body.id).toBeDefined();
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/product')
        .send(validProductDto)
        .expect(401);
    });

    it('should respect role-based access control', () => {
      return request(app.getHttpServer())
        .post('/product')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(validProductDto)
        .expect(403); // Forbidden
    });
  });

  describe('GET /product/search', () => {
    it('should search products with filters', () => {
      return request(app.getHttpServer())
        .get('/product/search')
        .query({ search: 'cream', isActive: 'true' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.total).toBeDefined();
        });
    });
  });
});
```

## Best Practices

### 1. Consistent Endpoint Naming
```typescript
// ✅ Good - RESTful resource naming
@Controller('product')
@Get()           // GET /product
@Get(':id')      // GET /product/:id
@Post()          // POST /product
@Patch(':id')    // PATCH /product/:id
@Delete(':id')   // DELETE /product/:id

// ✅ Good - Nested resources
@Get(':id/variants')        // GET /product/:id/variants
@Post(':id/variants')       // POST /product/:id/variants

// ✅ Good - Action endpoints
@Post(':id/activate')       // POST /product/:id/activate
@Post('search')            // POST /product/search
```

### 2. Comprehensive Documentation
```typescript
@ApiOperation({
  summary: 'Short description',
  description: 'Detailed description of what this endpoint does, including business logic implications'
})
@ApiParam({ name: 'id', description: 'Resource identifier', example: 'uuid-here' })
@ApiQuery({ name: 'filter', required: false, description: 'Optional filter parameter' })
@ApiCreatedResponse({ description: 'Success response', type: EntityClass })
@ApiBadRequestResponse({ description: 'What causes 400 errors' })
@ApiNotFoundResponse({ description: 'What causes 404 errors' })
```

### 3. Security First
```typescript
// Always use authentication and authorization
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)

// Always use company context for data isolation
@CurrentUser({ requireCompanyId: true }) user: UserWithCompany

// Pass company context to services
this.service.operation(dto, user.companyId)
```

### 4. Input Validation
```typescript
// DTOs handle validation automatically
@Post()
async create(@Body() dto: CreateProductDto) {
  // dto is automatically validated by class-validator
}

// Additional custom validation if needed
@Post()
async create(@Body() dto: CreateProductDto) {
  if (dto.customField && dto.customField.length > 1000) {
    throw new BadRequestException('Custom field too long');
  }
}
```

## Quick Reference

### HTTP Method Selection
- `GET` - Retrieve data (no side effects)
- `POST` - Create resource or perform action
- `PATCH` - Partial update of resource
- `PUT` - Complete replacement of resource (rarely used)
- `DELETE` - Remove resource (soft delete recommended)

### Common URL Patterns
- `/resource` - Collection operations
- `/resource/:id` - Individual resource operations  
- `/resource/:id/action` - Actions on specific resource
- `/resource/action` - Actions on collection
- `/resource/search` - Search within collection
- `/parent/:id/child` - Nested resource access

### Role Access Guidelines
- `ADMIN` - Full access to all operations
- `MANAGER` - Create, read, update operations
- `VIEWER` - Read-only access
- `USER` - Limited access based on business rules

### Common Status Codes
- `200 OK` - Successful operation
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input or business rule violation
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Unexpected error

## Common Patterns to Avoid

- ❌ Business logic in controllers (keep controllers thin)
- ❌ Direct database access in controllers (use services)
- ❌ Inconsistent error handling (let NestJS handle HTTP exceptions)
- ❌ Missing role-based access control
- ❌ Forgetting company isolation in multi-tenant operations
- ❌ Incomplete Swagger documentation
- ❌ Not validating input parameters beyond DTOs when needed