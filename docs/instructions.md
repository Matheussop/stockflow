# Instructions - Master AI Integration Guide

## Overview

Stockflow is a sophisticated multi-tenant inventory and sales management API built with NestJS, PostgreSQL, and Prisma. This system provides comprehensive lot-based inventory tracking, sales processing with FIFO logic, and complete audit trails for regulatory compliance scenarios like pharmaceuticals and food supply chains.

**Key Characteristics:**
- Multi-tenant architecture with strict company isolation
- Role-based access control (ADMIN, MANAGER, VIEWER, USER)
- Comprehensive inventory management with batch tracking
- Sales processing with automatic stock allocation
- Full audit trail system for compliance
- RESTful API with OpenAPI/Swagger documentation

## Personality and Communication

When working with this codebase, AI should:

- **Be Direct and Concise**: Focus on practical solutions without unnecessary explanations
- **Prioritize Security**: Always validate company isolation and user permissions
- **Follow Established Patterns**: Mirror existing code structures and conventions
- **Maintain Type Safety**: Use strong TypeScript typing throughout
- **Think Multi-Tenant**: Every business operation must consider company scoping
- **Document Appropriately**: Use Swagger decorators and maintain clear API contracts

## Core Architecture

### Technology Stack
```typescript
// Core Technologies
- Backend: NestJS with TypeScript
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT with Passport.js
- Validation: class-validator + class-transformer
- Documentation: Swagger/OpenAPI with Scalar
- Testing: Jest (unit, integration, e2e)
```

### Multi-Tenant Design
Every business entity is scoped by `companyId`:
```typescript
// Always filter by company
async findAll(companyId: string): Promise<EntityType[]> {
  return this.prisma.entity.findMany({
    where: { companyId, deletedAt: null }
  });
}
```

### Domain Entities
- **Company**: Tenant isolation boundary
- **Product → ProductVariant**: Hierarchical product structure
- **StockItem**: Lot-based inventory with FIFO processing
- **Sale → SaleItem**: Transactional sales with item details
- **InventoryLog**: Comprehensive audit trail
- **Client**: Customer management
- **Category**: Product classification

### Authentication & Authorization
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('endpoint')
export class ExampleController {
  @Post()
  async create(
    @Body() dto: CreateDto,
    @User({ requireCompanyId: true }) user: UserWithCompany
  ) {
    return this.service.create(dto, user.companyId);
  }
}
```

## Directory Structure

```
src/
├── main.ts                    # Application bootstrap
├── app.module.ts             # Root module with all imports
├── config/
│   ├── prisma/               # Database configuration
│   └── swagger.config.ts     # API documentation setup
├── modules/                  # Domain modules
│   ├── auth/                 # Authentication & JWT
│   ├── user/                 # User management
│   ├── company/              # Multi-tenant companies
│   ├── product/              # Base products
│   ├── product-variant/      # Product variations
│   ├── category/             # Product categories
│   ├── stock-item/           # Inventory management
│   ├── inventory-log/        # Audit trail
│   ├── sale/                 # Sales processing
│   ├── sale-item/            # Sale line items
│   └── client/               # Customer management
├── common/                   # Shared utilities
│   ├── decorators/           # Custom decorators (@User, @Roles)
│   ├── guards/               # Security guards
│   └── dto/                  # Base DTOs
└── prisma/                   # Database schema & migrations
    ├── schema.prisma         # Database models
    ├── migrations/           # Version control for DB
    └── seed.ts              # Development data
```

## How AI Should Respond

### Code Generation Principles
1. **Follow Existing Patterns**: Always examine similar modules before creating new code
2. **Maintain Type Safety**: Use Prisma-generated types and proper TypeScript
3. **Implement Security**: Never bypass company isolation or role validation
4. **Document APIs**: Include Swagger decorators for all endpoints
5. **Handle Errors**: Use NestJS exception filters with proper HTTP status codes
6. **Test Coverage**: Include unit tests for services and e2e tests for controllers

### Module Creation Workflow
1. Analyze requirements and domain relationships
2. Create Prisma schema updates if needed
3. Generate service with proper business logic
4. Build controller with security guards
5. Create DTOs with validation decorators
6. Design entities with proper serialization
7. Write comprehensive tests
8. Update module imports in AppModule

### Business Logic Guidelines
- **Inventory Operations**: Always create InventoryLog entries for audit
- **Sales Processing**: Use FIFO logic for stock allocation
- **Multi-Tenancy**: Filter all queries by companyId
- **Soft Deletes**: Use deletedAt for recoverable operations
- **Transactions**: Use Prisma transactions for complex operations

## Navigation Guide

### Specific Instructions
- **validators.md**: DTO creation and validation patterns
- **services.md**: Business logic and data access patterns
- **controllers.md**: API controllers and endpoint patterns (includes individual endpoint creation)
- **conventional-commits.md**: Git commit message standards

### Task-Specific Prompts
- **when-to-update.md**: Documentation maintenance and update triggers 
  
## Changelog & Architecture

### Recent Architectural Decisions (from CHANGELOG.md)
- **v0.2.0**: Refactored SaleService to use nested Prisma creation for transactional integrity
- **v0.2.0**: Implemented explicit Prisma types for better type safety
- **v0.1.0**: Established core domain modules and multi-tenant architecture

### Key Design Decisions
1. **Multi-Tenancy**: Company-based isolation for complete data separation
2. **FIFO Inventory**: First-in-first-out logic for stock allocation
3. **Audit Trail**: Comprehensive logging via InventoryLog for compliance
4. **API Security**: Role-based access with JWT authentication
5. **Data Validation**: class-validator for inputs, class-transformer for outputs

## Quick Reference

### Essential Commands
```bash
# Development
pnpm start:dev              # Development server with watch
pnpm build                  # Production build
pnpm test                   # Run all tests
pnpm test:e2e              # End-to-end tests
pnpm lint                   # Code linting
pnpm format                 # Code formatting

# Database
pnpm prisma migrate dev     # Run migrations
pnpm prisma db seed        # Seed development data
pnpm prisma studio         # Database GUI
```

### Common Patterns
```typescript
// Service Method Template
async create(dto: CreateDto, companyId: string): Promise<Entity> {
  const created = await this.prisma.model.create({
    data: { ...dto, companyId }
  });
  return new Entity(created);
}

// Controller Endpoint Template  
@ApiOperation({ summary: 'Create resource' })
@ApiResponse({ status: 201, type: Entity })
@Post()
@Roles(Role.ADMIN, Role.MANAGER)
async create(
  @Body() dto: CreateDto,
  @User({ requireCompanyId: true }) user: UserWithCompany
): Promise<Entity> {
  return this.service.create(dto, user.companyId);
}

// Entity Serialization Template
@Exclude()
export class Entity {
  constructor(init?: Partial<PrismaModel>) {
    if (init) Object.assign(this, init);
  }
  
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() createdAt: Date;
}
```

### Validation Checklist
- [ ] Company isolation implemented
- [ ] Role-based access control applied
- [ ] Swagger documentation complete
- [ ] Input validation with class-validator
- [ ] Proper error handling with NestJS exceptions
- [ ] Tests covering business logic and edge cases
- [ ] Audit trail for inventory operations
- [ ] Type safety with Prisma-generated types

---

**Remember**: This codebase prioritizes security, auditability, and multi-tenant isolation. Every feature must respect these architectural principles while maintaining the established patterns and conventions.