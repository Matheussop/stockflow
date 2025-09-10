# Complete Module Generation Workflow

## Overview

This guide provides a comprehensive workflow for creating new NestJS modules in Stockflow, ensuring consistency with the established architecture, multi-tenant design, and security patterns.

## Prerequisites

- Understanding of NestJS module system
- Familiarity with Stockflow's multi-tenant architecture
- Knowledge of Prisma schema and database design
- Review of existing modules for patterns

## Module Creation Checklist

### Phase 1: Planning and Design
- [ ] Define domain entity and business rules
- [ ] Identify relationships with other entities
- [ ] Plan database schema changes (if needed)
- [ ] Define required roles and permissions
- [ ] Sketch API endpoints and operations

### Phase 2: Database Schema (if needed)
- [ ] Update Prisma schema
- [ ] Create and run migration
- [ ] Seed database with test data
- [ ] Verify schema relationships

### Phase 3: Core Module Files
- [ ] Create module directory structure
- [ ] Generate service with business logic
- [ ] Create controller with API endpoints
- [ ] Design DTOs with validation
- [ ] Create entity class for serialization
- [ ] Create module configuration file

### Phase 4: Integration and Testing
- [ ] Import module in AppModule
- [ ] Write unit tests for service
- [ ] Write e2e tests for controller
- [ ] Test multi-tenant isolation
- [ ] Verify role-based access control

### Phase 5: Documentation and Cleanup
- [ ] Complete Swagger documentation
- [ ] Update API documentation
- [ ] Commit with conventional commit format

## Step-by-Step Module Creation

### Step 1: Create Directory Structure

```bash
mkdir -p src/modules/new-entity/{dto,entities}
```

Expected structure:
```
src/modules/new-entity/
├── dto/
│   ├── create-new-entity.dto.ts
│   └── update-new-entity.dto.ts
├── entities/
│   └── new-entity.entity.ts
├── new-entity.controller.ts
├── new-entity.service.ts
└── new-entity.module.ts
```

### Step 2: Create Entity Class

```typescript
// src/modules/new-entity/entities/new-entity.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { NewEntity } from '@prisma/client';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class NewEntityEntity {
  constructor(init?: Partial<NewEntity>) {
    if (init) {
      const clean = Object.fromEntries(
        Object.entries(init).map(([key, value]) => [key, value ?? undefined]),
      );
      Object.assign(this, clean);
    }
  }

  @Expose()
  @ApiProperty({
    example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
    description: 'Unique identifier'
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'Entity Name',
    description: 'Human-readable name'
  })
  name: string;

  @Expose()
  @ApiProperty({
    example: 'Entity description',
    description: 'Optional description'
  })
  description?: string;

  @Expose()
  @ApiProperty({
    example: true,
    description: 'Whether the entity is active'
  })
  isActive: boolean;

  @Expose()
  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Creation timestamp'
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Last update timestamp'
  })
  updatedAt: Date;

  // Don't expose sensitive fields
  // companyId, deletedAt are automatically excluded
}
```

### Step 3: Create DTOs

#### Create DTO
```typescript
// src/modules/new-entity/dto/create-new-entity.dto.ts
import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNewEntityDto {
  @ApiProperty({
    example: 'Entity Name',
    description: 'Human-readable name for the entity'
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Entity description',
    description: 'Optional description of the entity'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the entity is active',
    default: true,
  })
  @IsBoolean()
  isActive?: boolean = true;

  // Add relationship fields if needed
  @ApiProperty({
    example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
    description: 'Related entity ID'
  })
  @IsUUID()
  relatedEntityId: string;
}
```

#### Update DTO
```typescript
// src/modules/new-entity/dto/update-new-entity.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateNewEntityDto } from './create-new-entity.dto';

export class UpdateNewEntityDto extends PartialType(CreateNewEntityDto) {}
```

### Step 4: Create Service

```typescript
// src/modules/new-entity/new-entity.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateNewEntityDto } from './dto/create-new-entity.dto';
import { UpdateNewEntityDto } from './dto/update-new-entity.dto';
import { NewEntityEntity } from './entities/new-entity.entity';

@Injectable()
export class NewEntityService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateNewEntityDto,
    companyId: string,
  ): Promise<NewEntityEntity> {
    // Validate related entities if needed
    if (dto.relatedEntityId) {
      const relatedEntity = await this.prisma.relatedEntity.findFirst({
        where: { id: dto.relatedEntityId, companyId },
      });
      if (!relatedEntity) {
        throw new BadRequestException('Related entity not found');
      }
    }

    const newEntity = await this.prisma.newEntity.create({
      data: {
        ...dto,
        companyId,
      },
    });
    
    return new NewEntityEntity(newEntity);
  }

  async findAll(companyId: string): Promise<NewEntityEntity[]> {
    const entities = await this.prisma.newEntity.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    
    return entities.map((item) => new NewEntityEntity(item));
  }

  async findOne(id: string, companyId: string): Promise<NewEntityEntity> {
    const entity = await this.prisma.newEntity.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    
    return new NewEntityEntity(entity);
  }

  async update(
    id: string,
    dto: UpdateNewEntityDto,
    companyId: string,
  ): Promise<NewEntityEntity> {
    const entity = await this.findOne(id, companyId);

    // Validate related entities if being updated
    if (dto.relatedEntityId) {
      const relatedEntity = await this.prisma.relatedEntity.findFirst({
        where: { id: dto.relatedEntityId, companyId },
      });
      if (!relatedEntity) {
        throw new BadRequestException('Related entity not found');
      }
    }

    const updatedEntity = await this.prisma.newEntity.update({
      where: { id: entity.id },
      data: dto,
    });
    
    return new NewEntityEntity(updatedEntity);
  }

  async remove(id: string, companyId: string): Promise<NewEntityEntity> {
    const entity = await this.findOne(id, companyId);

    // Check for dependent entities if needed
    const dependentCount = await this.prisma.dependentEntity.count({
      where: { newEntityId: entity.id, deletedAt: null },
    });
    
    if (dependentCount > 0) {
      throw new BadRequestException(
        'Cannot delete entity with dependent records'
      );
    }

    // Soft delete
    const deletedEntity = await this.prisma.newEntity.update({
      where: { id: entity.id },
      data: { deletedAt: new Date() },
    });
    
    return new NewEntityEntity(deletedEntity);
  }
}
```

### Step 5: Create Controller

```typescript
// src/modules/new-entity/new-entity.controller.ts
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
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { User as CurrentUser } from '../auth/decorators/user.decorator';
import { Role } from '@prisma/client';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

import { NewEntityService } from './new-entity.service';
import { CreateNewEntityDto } from './dto/create-new-entity.dto';
import { UpdateNewEntityDto } from './dto/update-new-entity.dto';
import { NewEntityEntity } from './entities/new-entity.entity';

export type UserWithCompany = JwtPayload & { companyId: string };

@ApiTags('New Entity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('new-entity')
export class NewEntityController {
  constructor(private readonly newEntityService: NewEntityService) {}

  @ApiOperation({
    summary: 'Create a new entity',
    description: 'Creates a new entity within the current company context'
  })
  @ApiCreatedResponse({
    description: 'Entity successfully created',
    type: NewEntityEntity,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or business rule violation'
  })
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(
    @Body() createDto: CreateNewEntityDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<NewEntityEntity> {
    return this.newEntityService.create(createDto, user.companyId);
  }

  @ApiOperation({
    summary: 'List all entities from current company',
    description: 'Retrieves all active entities belonging to the current company'
  })
  @ApiOkResponse({ type: [NewEntityEntity] })
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findAll(
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<NewEntityEntity[]> {
    return this.newEntityService.findAll(user.companyId);
  }

  @ApiOperation({
    summary: 'Get a single entity by ID',
    description: 'Retrieves a specific entity by its unique identifier'
  })
  @ApiOkResponse({ type: NewEntityEntity })
  @ApiNotFoundResponse({ description: 'Entity not found' })
  @ApiParam({
    name: 'id',
    description: 'Entity unique identifier',
    example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
  })
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  async findOne(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<NewEntityEntity> {
    return this.newEntityService.findOne(id, user.companyId);
  }

  @ApiOperation({
    summary: 'Update an entity by ID',
    description: 'Updates an existing entity with new data'
  })
  @ApiOkResponse({ type: NewEntityEntity })
  @ApiNotFoundResponse({ description: 'Entity not found' })
  @ApiBadRequestResponse({ description: 'Invalid update data' })
  @ApiParam({
    name: 'id',
    description: 'Entity unique identifier',
    example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
  })
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateNewEntityDto,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<NewEntityEntity> {
    return this.newEntityService.update(id, updateDto, user.companyId);
  }

  @ApiOperation({
    summary: 'Delete an entity by ID',
    description: 'Soft deletes an entity (sets deletedAt timestamp)'
  })
  @ApiOkResponse({
    description: 'Entity deleted successfully',
    type: NewEntityEntity,
  })
  @ApiNotFoundResponse({ description: 'Entity not found' })
  @ApiBadRequestResponse({
    description: 'Cannot delete entity with dependent records'
  })
  @ApiParam({
    name: 'id',
    description: 'Entity unique identifier',
    example: 'ea734dc6-53f9-4cef-a4a8-266772b3003f',
  })
  @Delete(':id')
  @Roles(Role.ADMIN) // Only admins can delete
  async remove(
    @Param('id') id: string,
    @CurrentUser({ requireCompanyId: true }) user: UserWithCompany,
  ): Promise<NewEntityEntity> {
    return this.newEntityService.remove(id, user.companyId);
  }
}
```

### Step 6: Create Module

```typescript
// src/modules/new-entity/new-entity.module.ts
import { Module } from '@nestjs/common';
import { NewEntityService } from './new-entity.service';
import { NewEntityController } from './new-entity.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NewEntityController],
  providers: [NewEntityService],
  exports: [NewEntityService], // Export if other modules need access
})
export class NewEntityModule {}
```

### Step 7: Update AppModule

```typescript
// src/app.module.ts - Add import and module
import { NewEntityModule } from './modules/new-entity/new-entity.module';

@Module({
  imports: [
    // ... existing modules
    NewEntityModule,
    // ... other modules
  ],
  // ... rest of configuration
})
export class AppModule {}
```

## Common Pitfalls to Avoid

1. **Missing Company Isolation**: Always filter by `companyId`
2. **Forgetting Role-Based Access**: Apply appropriate `@Roles()` decorators
3. **Incomplete Error Handling**: Handle business rule violations
4. **Missing Swagger Documentation**: Document all endpoints properly
5. **Hard Deletes**: Use soft deletes with `deletedAt`
6. **No Input Validation**: Use DTOs with proper validation decorators
7. **Exposing Internal Fields**: Use entity classes for serialization
8. **Missing Tests**: Write both unit and e2e tests
9. **Inconsistent Naming**: Follow established naming conventions
10. **Forgetting AppModule Import**: Always register new modules

## Final Checklist

Before considering the module complete:

- [ ] All files follow established patterns
- [ ] Multi-tenant isolation is implemented
- [ ] Role-based access control is configured
- [ ] Swagger documentation is complete
- [ ] Input validation is comprehensive
- [ ] Error handling covers business rules
- [ ] Soft delete is implemented where appropriate
- [ ] Tests are written and passing
- [ ] Module is registered in AppModule
- [ ] Code follows project conventions
- [ ] Commit message follows conventional format

## Module Templates

For quick reference, you can find complete module templates in the existing modules:

- **Simple CRUD**: `src/modules/product/` or `src/modules/category/`
- **Complex Business Logic**: `src/modules/sale/` 
- **Audit Trail Integration**: `src/modules/inventory-log/`
- **Nested Resources**: `src/modules/product-variant/`

Follow these established patterns to ensure consistency across the codebase.