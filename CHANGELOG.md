# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [Unreleased]

### Added
- Enhanced SaleService with company validation and userId tracking for better security and audit trail
- FIFO (First In, First Out) stock allocation logic for sale items
- Product variant existence validation before processing sales
- Comprehensive stock item validation and allocation system
- Improved sale creation with nested item creation and better error handling
- Swagger UI URL logging on application startup for developer convenience

### Fixed
- JWT strategy validation with improved error handling and security
- Stock item quantity updates with proper timestamp tracking
- Sale retrieval now includes improved item details and associations

### Changed
- Sale processing now implements sophisticated inventory management with FIFO logic
- Enhanced error handling throughout the sale creation process
- Improved sale item details in sale retrieval operations

## [0.2.0] - 2025-08-10

### Changed
- `src/modules/sale/sale.service.ts`: Switch to nested creation of items via Prisma (`items: { create: [...] }`) instead of passing the items array directly; creates `Sale` and related `SaleItem`s in a single transactional operation.
- `src/modules/sale/sale.service.ts`: Normalize `saleDate` to a `Date` instance when persisting.
- `src/modules/sale/sale.service.ts`: Use explicit types `Prisma.SaleUncheckedCreateInput` and `Prisma.SaleUncheckedUpdateInput` for proper compatibility with scalar fields and nested relations.
- `src/modules/sale/sale.service.ts`: `update` operation now ignores `items` (item maintenance should be handled via `SaleItem` endpoints or specific nested update operations).

## [0.1.0] - 2025-08-10

### Added
- Initial NestJS application scaffolding and configuration (modules, controllers, services, and Swagger config).
- Core domain modules and endpoints:
  - Auth (`auth`)
  - User (`user`)
  - Company (`company`)
  - Client (`client`)
  - Category (`category`)
  - Product (`product`)
  - Product Variant (`product-variant`)
  - Stock Item (`stock-item`)
  - Sale (`sale`)
  - Sale Item (`sale-item`)
  - Inventory Log (`inventory-log`)
- Prisma setup with PostgreSQL datasource, schema models, and initial migrations.

[0.2.0]: https://example.com/compare/v0.1.0...v0.2.0
[0.1.0]: https://example.com/releases/v0.1.0
