# Business Logic and Data Access Patterns

## Overview

This guide covers service layer patterns in Stockflow, focusing on business logic implementation, data access through Prisma, multi-tenant data isolation, and complex transactional operations.

## Core Dependencies

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import type { Prisma } from '@prisma/client';
```

## Basic Service Structure

### Standard CRUD Service Template
```typescript
@Injectable()
export class EntityService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEntityDto, companyId: string): Promise<EntityEntity> {
    const entity = await this.prisma.entity.create({
      data: {
        ...dto,
        companyId,
      },
    });
    return new EntityEntity(entity);
  }

  async findAll(companyId: string): Promise<EntityEntity[] | undefined> {
    const entities = await this.prisma.entity.findMany({
      where: { companyId, deletedAt: null },
    });
    return entities.map((item) => new EntityEntity(item));
  }

  async findOne(id: string, companyId: string): Promise<EntityEntity> {
    const entity = await this.prisma.entity.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!entity) throw new NotFoundException('Entity not found');
    return new EntityEntity(entity);
  }

  async update(
    id: string,
    dto: UpdateEntityDto,
    companyId: string,
  ): Promise<EntityEntity> {
    const entity = await this.findOne(id, companyId);

    const updatedEntity = await this.prisma.entity.update({
      where: { id: entity.id },
      data: dto,
    });
    return new EntityEntity(updatedEntity);
  }

  async remove(id: string, companyId: string): Promise<EntityEntity> {
    const entity = await this.findOne(id, companyId);

    // Soft delete pattern
    const deletedEntity = await this.prisma.entity.update({
      where: { id: entity.id }, 
      data: { deletedAt: new Date() },
    });
    return new EntityEntity(deletedEntity);
  }
}
```

## Multi-Tenant Data Isolation

### Always Filter by Company
```typescript
// ✅ Correct - Always include companyId in queries
async findAll(companyId: string): Promise<ProductEntity[]> {
  const products = await this.prisma.product.findMany({
    where: { companyId, deletedAt: null },
  });
  return products.map(item => new ProductEntity(item));
}

// ❌ Wrong - Missing company isolation
async findAll(): Promise<ProductEntity[]> {
  const products = await this.prisma.product.findMany({
    where: { deletedAt: null },
  });
  return products.map(item => new ProductEntity(item));
}
```

### Company Validation in Relations
```typescript
async findProductVariants(productId: string, companyId: string): Promise<ProductVariantEntity[]> {
  // Ensure product belongs to the company
  const product = await this.prisma.product.findFirst({
    where: { id: productId, companyId },
  });

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  const variants = await this.prisma.productVariant.findMany({
    where: { 
      productId: product.id,
      product: { companyId } // Extra safety
    },
  });

  return variants.map(variant => new ProductVariantEntity(variant));
}
```

## Complex Business Logic Patterns

### Transactional Operations
```typescript
async createSale(
  dto: CreateSaleDto,
  companyId: string,
  userId: string,
): Promise<SaleEntity> {
  const sale = await this.prisma.$transaction(async (tx) => {
    // 1. Validate business rules
    await this.validateSaleItems(tx, dto.items, companyId);
    
    // 2. Allocate inventory (FIFO)
    const allocations = await this.allocateStock(tx, dto.items);
    
    // 3. Create main entity
    const sale = await tx.sale.create({
      data: {
        companyId,
        userId,
        saleDate: dto.saleDate ? new Date(dto.saleDate) : new Date(),
        clientId: dto.clientId,
        status: dto.status || 'PENDING',
        notes: dto.notes,
      }
    });
    
    // 4. Create related entities
    await this.createSaleItems(tx, sale.id, dto.items);
    
    // 5. Update inventory and create audit log
    await this.processInventoryMovements(tx, allocations, sale.id, companyId, userId);
    
    // 6. Return with relations
    return tx.sale.findUnique({
      where: { id: sale.id },
      include: {
        items: {
          include: {
            productVariant: {
              select: { sku: true, product: { select: { name: true } } }
            }
          }
        },
        client: { select: { name: true, email: true } }
      }
    });
  }, {
    maxWait: 5000,
    timeout: 10000,
    isolationLevel: 'ReadCommitted'
  });

  if (!sale) throw new NotFoundException('Failed to create sale');
  return new SaleEntity(sale);
}
```

### FIFO Stock Allocation
```typescript
private async allocateStock(
  tx: Prisma.TransactionClient,
  items: CreateSaleItemDto[]
): Promise<AllocationResult[]> {
  const results: AllocationResult[] = [];

  for (const item of items) {
    let remaining = item.quantity;

    // Get available stock lots ordered by FIFO logic
    const stockLots = await tx.stockItem.findMany({
      where: {
        productVariantId: item.productVariantId,
        quantity: { gt: 0 },
      },
      orderBy: [
        { expirationDate: 'asc' }, // Expired first
        { createdAt: 'asc' }       // Then oldest first
      ],
    });

    if (stockLots.length === 0) {
      throw new BadRequestException(
        `No stock available for variant ${item.productVariantId}`
      );
    }

    const allocations: AllocationLine[] = [];

    for (const lot of stockLots) {
      if (remaining <= 0) break;

      const allocateQty = Math.min(remaining, lot.quantity);
      
      allocations.push({
        stockItemId: lot.id,
        qtyAllocated: allocateQty,
        qtyPrevious: lot.quantity,
        unitCost: Number(lot.unitPrice),
      });

      remaining -= allocateQty;
    }

    if (remaining > 0) {
      throw new BadRequestException(
        `Insufficient stock for variant ${item.productVariantId}. Missing ${remaining} units.`
      );
    }

    results.push({
      productVariantId: item.productVariantId,
      lines: allocations,
    });
  }

  return results;
}
```

### Audit Trail Implementation
```typescript
private async processInventoryMovements(
  tx: Prisma.TransactionClient,
  allocations: AllocationResult[],
  saleId: string,
  companyId: string,
  userId: string
): Promise<void> {
  for (const alloc of allocations) {
    for (const line of alloc.lines) {
      // Create audit log entry
      await tx.inventoryLog.create({
        data: {
          companyId,
          type: 'SALE',
          stockItemId: line.stockItemId,
          quantityChange: line.qtyAllocated,
          previousQty: line.qtyPrevious,
          newQty: line.qtyPrevious - line.qtyAllocated,
          isManual: false,
          isReverted: false,
          sourceId: saleId,
          sourceType: 'SALE',
          userId,
          note: `Sale #${saleId} - ${alloc.productVariantId}`,
        }
      });

      // Update stock quantity
      await tx.stockItem.update({
        where: { id: line.stockItemId },
        data: { 
          quantity: { decrement: line.qtyAllocated },
          updatedAt: new Date(),
        }
      });
    }
  }
}
```

## Data Validation Patterns

### Business Rule Validation
```typescript
private async validateSaleItems(
  tx: Prisma.TransactionClient,
  items: CreateSaleItemDto[],
  companyId: string
): Promise<void> {
  // Check if all product variants exist and belong to company
  const variants = await tx.productVariant.findMany({
    where: { 
      id: { in: items.map(i => i.productVariantId) },
      product: { companyId }
    },
    select: { id: true, productId: true }
  });

  const existingIds = new Set(variants.map(v => v.id));
  const missingIds = items
    .map(i => i.productVariantId)
    .filter(id => !existingIds.has(id));

  if (missingIds.length > 0) {
    throw new BadRequestException(
      `Some product variants do not exist or do not belong to this company: ${missingIds.join(', ')}`
    );
  }
}
```

### Input Sanitization
```typescript
async create(dto: CreateProductDto, companyId: string): Promise<ProductEntity> {
  // Sanitize and validate input
  const sanitizedData = {
    ...dto,
    name: dto.name.trim(),
    brand: dto.brand?.trim() || null,
    isActive: dto.isActive ?? true,
    companyId,
  };

  const product = await this.prisma.product.create({
    data: sanitizedData,
  });

  return new ProductEntity(product);
}
```

## Error Handling Patterns

### Standard Error Types
```typescript
// Not Found - 404
if (!entity) {
  throw new NotFoundException('Entity not found');
}

// Bad Request - 400
if (quantity <= 0) {
  throw new BadRequestException('Quantity must be greater than zero');
}

// Forbidden - 403 (handled by guards, but can be used for business rules)
if (user.role !== 'ADMIN' && entity.userId !== user.id) {
  throw new ForbiddenException('You can only modify your own records');
}
```

### Detailed Error Messages
```typescript
private validateStockAvailability(requested: number, available: number, variantId: string): void {
  if (requested > available) {
    throw new BadRequestException(
      `Insufficient stock for variant ${variantId}. ` +
      `Requested: ${requested}, Available: ${available}`
    );
  }
}
```

## Query Optimization

### Selective Field Loading
```typescript
async findAllWithDetails(companyId: string): Promise<ProductEntity[]> {
  const products = await this.prisma.product.findMany({
    where: { companyId, deletedAt: null },
    select: {
      id: true,
      name: true,
      brand: true,
      isActive: true,
      createdAt: true,
      category: {
        select: { id: true, name: true }
      },
      variants: {
        select: { id: true, sku: true, price: true },
        where: { deletedAt: null }
      }
    }
  });

  return products.map(item => new ProductEntity(item));
}
```

### Pagination Support
```typescript
async findAllPaginated(
  companyId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ data: ProductEntity[]; total: number; pages: number }> {
  const offset = (page - 1) * limit;

  const [products, total] = await Promise.all([
    this.prisma.product.findMany({
      where: { companyId, deletedAt: null },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    this.prisma.product.count({
      where: { companyId, deletedAt: null }
    })
  ]);

  return {
    data: products.map(item => new ProductEntity(item)),
    total,
    pages: Math.ceil(total / limit)
  };
}
```

## Advanced Patterns

### Soft Delete with Cascade
```typescript
async removeWithCascade(id: string, companyId: string): Promise<ProductEntity> {
  const product = await this.findOne(id, companyId);

  await this.prisma.$transaction(async (tx) => {
    // Soft delete variants
    await tx.productVariant.updateMany({
      where: { productId: product.id },
      data: { deletedAt: new Date() }
    });

    // Soft delete product
    await tx.product.update({
      where: { id: product.id },
      data: { deletedAt: new Date() }
    });
  });

  return new ProductEntity({ ...product, deletedAt: new Date() });
}
```

### Bulk Operations
```typescript
async createMany(
  dtos: CreateProductDto[],
  companyId: string
): Promise<ProductEntity[]> {
  const data = dtos.map(dto => ({
    ...dto,
    companyId,
    name: dto.name.trim(),
    isActive: dto.isActive ?? true,
  }));

  const products = await this.prisma.product.createMany({
    data,
    skipDuplicates: true,
  });

  // Get created products with their IDs
  const createdProducts = await this.prisma.product.findMany({
    where: {
      companyId,
      name: { in: dtos.map(dto => dto.name.trim()) },
      createdAt: { gte: new Date(Date.now() - 5000) } // Last 5 seconds
    }
  });

  return createdProducts.map(item => new ProductEntity(item));
}
```

## Testing Considerations

### Mockable Service Structure
```typescript
// Keep Prisma operations isolated for easier mocking
private async findProductByIdAndCompany(id: string, companyId: string) {
  return this.prisma.product.findFirst({
    where: { id, companyId, deletedAt: null },
  });
}

async findOne(id: string, companyId: string): Promise<ProductEntity> {
  const product = await this.findProductByIdAndCompany(id, companyId);
  if (!product) throw new NotFoundException('Product not found');
  return new ProductEntity(product);
}
```

## Best Practices

1. **Always include `companyId` in queries** for multi-tenant isolation
2. **Use transactions** for operations affecting multiple entities
3. **Validate business rules** before database operations
4. **Create audit trails** for inventory and financial operations
5. **Use proper error types** with descriptive messages
6. **Implement soft deletes** using `deletedAt` field
7. **Return entity classes** for consistent serialization
8. **Use type-safe Prisma operations** with generated types
9. **Handle edge cases** like insufficient stock or missing relations
10. **Keep services focused** on single domain responsibility

## Common Pitfalls to Avoid

- Forgetting to filter by `companyId` in queries
- Not using transactions for multi-step operations
- Missing audit trails for inventory changes  
- Hard deleting instead of soft deleting
- Not validating business rules before database operations
- Exposing Prisma models directly instead of entity classes
- Not handling concurrent access in inventory operations
- Missing error handling for business rule violations