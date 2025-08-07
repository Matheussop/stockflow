# Stockflow — Inventory and Sales Management API

**Stockflow** is a scalable, multi-tenant API designed to manage inventory and sales operations with precision and traceability. It supports use cases ranging from simple point-of-sale systems to highly controlled environments such as pharmaceutical or food supply chains.

Key features include:

- ✅ Product registration with variant tracking
- 📦 Lot-based inventory control (`StockItem`)
- 🔁 Full audit trail of inventory changes (`InventoryLog`)
- 🧾 Sales with itemized detail, customer info, and payment tracking
- 🏢 Multi-company structure with scoped access control
- 🧼 Controlled API serialization using `class-transformer` for secure and clean responses
- 🔜 Future-ready for integrations (e.g., invoicing, loyalty programs)

---

## 🧩 Domain Entities Overview

Stockflow models a robust and extensible inventory + sales domain, including:

- 🏢 `Company`: defines isolated organizational units (multi-tenancy)
- 📦 `Product` + `ProductVariant`: base items and their physical variations
- 🏷️ `Category`: used for product classification
- 🗃️ `StockItem`: represents a tracked batch of inventory
- 🔁 `InventoryLog`: audit trail for all stock changes
- 🧾 `Sale` + `SaleItem`: sales records and their associated items
- 🙋 `Client`: customer data used during sales

👉 For detailed entity definitions, see the [full schema reference](docs/entities.md)

---

## 🔒 API Serialization Control

Stockflow uses `class-transformer` with `@Exclude()` and `@Expose()` decorators to ensure only explicitly exposed fields are returned in API responses. This protects sensitive fields like `companyId` from leaking into client-side payloads.

The `ClassSerializerInterceptor` is enabled globally, and entities like `ProductEntity` define exactly which fields are visible.

Example:
```ts
@Exclude()
export class ProductEntity {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() price: number;
  // No `@Expose()` for companyId — it won't be serialized
}
```

This approach helps maintain a clean, predictable API surface.

---

# 📁 Project Structure


## 🔧 Folder Structure

```bash
src/
├── main.ts                # Application entry point
├── app.module.ts          # Root module
├── config/                # Configuration (e.g., Prisma)
│   └── prisma/            # Prisma integration for NestJS
│       ├── prisma.module.ts
│       └── prisma.service.ts
├── modules/               # Main domain modules
│   ├── company/           # Company management
│   ├── category/          # Product categories
│   ├── product/           # Product + ProductVariant
│   ├── stock/             # StockItem + InventoryLog
│   ├── sale/              # Sale + SaleItem
│   ├── client/            # Client CRUD
│   ├── auth/              # Authentication, guards, roles
│   └── user/              # User and role assignments
├── common/                # Shared utilities, DTOs, pipes, guards
│   ├── decorators/        # Custom decorators (e.g., current user)
│   ├── dtos/              # Generic/shared DTOs
│   ├── filters/           # Global exception filters
│   ├── interceptors/      # Logging, transformation
│   └── guards/            # Auth and permissions
├── prisma/                # Prisma schema and seed
│   ├── schema.prisma      # Main Prisma schema file
│   └── seed.ts            # Optional seeding script
└── tests/                 # E2E or integration tests
```

---

# 🚀 Project Setup & Run Guide

Follow the steps below to set up and run Stockflow locally.

---

## ✅ Prerequisites

* Node.js v18+
* pnpm (or npm/yarn)
* Docker (for running PostgreSQL)

---

## 📦 Install dependencies

```bash
pnpm install
```

---

## ⚙️ Environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/stockflow"
JWT_SECRET="your_jwt_secret"
```

---

## 🐘 Start PostgreSQL with Docker (dev only)

```bash
docker run --name stockflow-db -p 5432:5432 \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=stockflow \
  -d postgres
```

---

## 🌱 Run Prisma migrations

```bash
pnpm prisma migrate dev --name init
```

---

## ▶️ Start the app

```bash
pnpm start:dev
```

---

## 🧪 Run tests

```bash
pnpm test
```

---

## 🗃️ Seed the database (optional)

```bash
pnpm db:seed
```

---

You’re now ready to develop and evolve Stockflow!
