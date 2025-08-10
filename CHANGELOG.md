# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

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
