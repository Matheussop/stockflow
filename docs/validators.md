# DTO Creation and Validation Patterns

## Overview

This guide covers creating Data Transfer Objects (DTOs) with proper validation for the Stockflow API. DTOs ensure type safety, input validation, and consistent API documentation through Swagger decorators.

## Core Dependencies

```typescript
import { IsString, IsUUID, IsBoolean, IsNumber, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
```

## Basic DTO Structure

### Create DTO Template
```typescript
export class CreateEntityDto {
  @ApiProperty({ 
    example: 'Example Name',
    description: 'Clear description of the field'
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({ 
    example: 'Optional Brand',
    description: 'Optional brand name'
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the entity is active',
    default: true,
  })
  @IsBoolean()
  isActive?: boolean = true;
}
```

### Update DTO Template
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateEntityDto } from './create-entity.dto';

export class UpdateEntityDto extends PartialType(CreateEntityDto) {}
```

## Validation Decorators

### String Validation
```typescript
// Basic string
@ApiProperty({ example: 'Product Name' })
@IsString()
name: string;

// Optional string
@ApiPropertyOptional({ example: 'Optional Description' })
@IsOptional()
@IsString()
description?: string;

// String with length validation
@ApiProperty({ example: 'ABC123' })
@IsString()
@Length(3, 20)
code: string;
```

### UUID Validation
```typescript
@ApiProperty({ 
  example: '3f2a2e6b-d940-4ff1-bb61-cb5ea8df4c8c',
  description: 'Related entity ID' 
})
@IsUUID()
relationId: string;
```

### Number Validation
```typescript
// Basic number
@ApiProperty({ example: 100 })
@IsNumber()
quantity: number;

// Decimal with precision
@ApiProperty({ 
  example: 29.99,
  description: 'Price in currency units',
  type: 'number',
  format: 'decimal'
})
@IsNumber({ maxDecimalPlaces: 2 })
price: number;

// Positive number
@ApiProperty({ example: 5 })
@IsNumber()
@Min(1)
quantity: number;
```

### Boolean Validation
```typescript
@ApiProperty({
  example: true,
  description: 'Whether the item is active',
  default: true,
})
@IsBoolean()
isActive?: boolean = true;
```

### Enum Validation
```typescript
import { SaleStatus } from '@prisma/client';

@ApiProperty({
  enum: SaleStatus,
  example: SaleStatus.PENDING,
  description: 'Current status of the sale'
})
@IsEnum(SaleStatus)
status: SaleStatus;
```

### Array Validation
```typescript
// Array of objects
@ApiProperty({
  type: [CreateSaleItemDto],
  description: 'Items included in the sale'
})
@IsArray()
@ValidateNested({ each: true })
@Type(() => CreateSaleItemDto)
items: CreateSaleItemDto[];

// Array of strings
@ApiProperty({
  type: [String],
  example: ['tag1', 'tag2'],
  description: 'Product tags'
})
@IsArray()
@IsString({ each: true })
tags: string[];
```

### Date Validation
```typescript
@ApiProperty({
  example: '2024-12-01T10:00:00Z',
  description: 'Scheduled delivery date',
  type: 'string',
  format: 'date-time'
})
@IsDateString()
deliveryDate: string;
```

## Complex Validation Examples

### Nested Object Validation
```typescript
export class CreateSaleDto {
  @ApiProperty({ example: 'client-uuid-here' })
  @IsUUID()
  clientId: string;

  @ApiProperty({
    type: [CreateSaleItemWithoutSaleIdDto],
    description: 'Sale items'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemWithoutSaleIdDto)
  items: CreateSaleItemWithoutSaleIdDto[];
}

export class CreateSaleItemWithoutSaleIdDto {
  @ApiProperty({ example: 'product-variant-uuid' })
  @IsUUID()
  productVariantId: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 29.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  unitPrice: number;
}
```

### Conditional Validation
```typescript
export class CreateStockItemDto {
  @ApiProperty({ example: 'product-variant-uuid' })
  @IsUUID()
  productVariantId: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ 
    example: '2024-12-31',
    description: 'Expiration date for perishable items'
  })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional({ 
    example: 'BATCH-2024-001',
    description: 'Batch identifier for tracking'
  })
  @IsOptional()
  @IsString()
  batchNumber?: string;
}
```

## Best Practices

### 1. Clear API Documentation
```typescript
@ApiProperty({
  example: 'Creme Hidratante',
  description: 'Human-readable product name displayed in listings',
  minLength: 1,
  maxLength: 100
})
@IsString()
@Length(1, 100)
name: string;
```

### 2. Proper Type Transformations
```typescript
// For nested objects
@Type(() => CreateSaleItemDto)
items: CreateSaleItemDto[];

// For dates
@Transform(({ value }) => new Date(value))
@IsDate()
createdAt: Date;
```

### 3. Default Values
```typescript
@ApiProperty({
  example: true,
  description: 'Active status for new records',
  default: true,
})
@IsBoolean()
isActive?: boolean = true;
```

### 4. Validation Groups (if needed)
```typescript
export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number'
  })
  password: string;
}
```

## Common Patterns in Stockflow

### Multi-tenant DTO Pattern
```typescript
// Note: companyId is NOT included in DTOs
// It's injected at the service layer from JWT token
export class CreateProductDto {
  @ApiProperty({ example: 'Product Name' })
  @IsString()
  name: string;
  // companyId automatically added by service
}
```

### Update DTO with Partial Pattern
```typescript
import { PartialType } from '@nestjs/swagger';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  // Automatically makes all CreateProductDto fields optional
  // Maintains validation decorators
}
```

### Base DTO for Shared Fields
```typescript
export class BaseEntityDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Whether the entity is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateProductDto extends BaseEntityDto {
  @ApiProperty({ example: 'Product Name' })
  @IsString()
  name: string;
  
  // isActive inherited from BaseEntityDto
}
```

## Error Handling

### Custom Validation Messages
```typescript
@ApiProperty({ example: 'user@example.com' })
@IsEmail({}, { message: 'Please provide a valid email address' })
email: string;

@ApiProperty({ example: 10 })
@IsNumber({}, { message: 'Quantity must be a valid number' })
@Min(1, { message: 'Quantity must be at least 1' })
quantity: number;
```

## Checklist

When creating a new DTO:

- [ ] Import required validation decorators from `class-validator`
- [ ] Import `ApiProperty`/`ApiPropertyOptional` from `@nestjs/swagger`
- [ ] Add descriptive examples and descriptions to all fields
- [ ] Use appropriate validation decorators for data types
- [ ] Set proper default values where applicable
- [ ] Use `@Type()` decorator for nested objects and arrays
- [ ] Extend `PartialType` for update DTOs
- [ ] Ensure UUIDs use `@IsUUID()` validation
- [ ] Add proper enum validation with `@IsEnum()`
- [ ] Consider optional fields with `@IsOptional()`
- [ ] Test validation with invalid data to ensure proper error messages

## Integration Notes

- DTOs are automatically validated by NestJS when used with controller endpoints
- Validation errors are automatically formatted and returned as HTTP 400 responses
- Swagger documentation is automatically generated from `@ApiProperty` decorators
- Class transformer automatically handles type conversions based on decorators