# Conventional Commits Standards

## Overview

Stockflow follows the Conventional Commits specification to maintain a clean, readable commit history that enables automatic changelog generation and semantic versioning. This guide covers the commit message patterns used in this project.

**IMPORTANT: All commit messages must be written entirely in English.**

## Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Examples from Stockflow
```bash
feat(sale): enhance SaleService to include company validation and userId tracking
chore(bootstrap): log Swagger UI URL on startup for quick access
fix(config,category,auth,user,docs): align API to schema and configure environment
feat(stock-item): add StockItem module with CRUD operations
```

## Commit Types

### Primary Types (Most Common)

#### `feat` - New Features
New functionality or capabilities added to the application.

```bash
feat(sale): implement FIFO stock allocation logic for sales processing
feat(product-variant): add ProductVariant module with CRUD operations  
feat(auth): add JWT authentication with role-based access control
feat(inventory-log): implement audit trail for all stock movements
```

#### `fix` - Bug Fixes
Corrections to existing functionality that resolve issues.

```bash
fix(sale): resolve stock allocation race condition in concurrent sales
fix(auth): prevent company data leakage in multi-tenant queries
fix(validation): ensure companyId isolation in all business operations
fix(swagger): correct API documentation for sale creation response
```

#### `chore` - Maintenance Tasks
Routine tasks, dependency updates, build configuration, etc.

```bash
chore(deps): update NestJS to v10.2.1 and related packages
chore(config): configure Swagger UI with Scalar theme
chore(bootstrap): log application startup URL for development
chore(docker): update Docker configuration for production deployment
```

### Secondary Types (Less Common)

#### `docs` - Documentation
Documentation-only changes, README updates, API documentation.

```bash
docs(readme): add API serialization control details using class-transformer
docs(api): update Swagger examples for sale creation endpoints
docs(setup): add development environment setup instructions
```

#### `style` - Code Style
Formatting, missing semicolons, linting fixes (no functional changes).

```bash
style(product): format code according to Prettier configuration
style(imports): organize import statements alphabetically
```

#### `refactor` - Code Refactoring
Code changes that neither fix bugs nor add features.

```bash
refactor(sale): utilize Prisma types for better type safety
refactor(user): extract JWT payload type for better reusability
refactor(controllers): consolidate error handling patterns
```

#### `test` - Testing
Adding or modifying tests.

```bash
test(sale): add unit tests for FIFO allocation algorithm
test(auth): add integration tests for role-based access control
test(e2e): add end-to-end tests for complete sale workflow
```

#### `perf` - Performance Improvements
Changes that improve performance.

```bash
perf(queries): optimize product search with database indexes
perf(sale): improve stock allocation performance for large inventories
```

## Scope Guidelines

### Domain-Based Scopes
Use the module or domain name as scope:

```bash
feat(product): add new product management features
feat(sale): implement sales processing logic
feat(inventory-log): add inventory tracking capabilities
feat(auth): enhance authentication system
feat(user): add user management features
feat(company): implement multi-tenant company system
feat(stock-item): add stock item management
feat(product-variant): handle product variations
feat(client): add client/customer management
feat(category): implement product categorization
```

### Technical Scopes
For technical/infrastructure changes:

```bash
chore(config): configuration updates
chore(deps): dependency management  
chore(docker): containerization setup
chore(database): database schema or migrations
chore(swagger): API documentation setup
chore(bootstrap): application startup configuration
```

### Multi-Scope Changes
For changes affecting multiple areas, separate with commas:

```bash
fix(config,category,auth,user,docs): align API to schema and configure environment
refactor(sale,inventory): restructure stock allocation logic
feat(product,category): add product-category relationship management
```

## Description Guidelines

### Capitalization and Grammar
- Use lowercase for the first word
- Use imperative mood (like git itself)
- No period at the end
- Be concise but descriptive

```bash
# ✅ Good
feat(auth): add JWT token validation middleware
fix(sale): resolve inventory allocation race condition
chore(deps): update Prisma to latest version

# ❌ Bad  
feat(auth): Added JWT token validation middleware.
fix(sale): Fixed the inventory allocation race condition
chore(deps): updating Prisma to latest version
```

### Be Specific and Descriptive
Provide enough context to understand the change without reading the code.

```bash
# ✅ Good - Specific and descriptive
feat(sale): implement FIFO stock allocation with audit trail creation
fix(auth): prevent cross-company data access in product queries
refactor(services): extract common validation patterns into base service

# ❌ Bad - Too vague
feat(sale): add new functionality
fix(auth): security fix
refactor(services): improve code
```

## Body and Footer (Optional)

### Body Guidelines
Use the body to explain **what** and **why**, not **how**. **Write entirely in English.**

```bash
feat(sale): implement FIFO stock allocation algorithm

Stock items are now allocated using First-In-First-Out logic based on
expiration dates and creation timestamps. This ensures proper inventory
rotation and compliance with regulatory requirements for pharmaceutical
and food supply chain scenarios.

Includes automatic creation of inventory log entries for full audit trail.
```

### Footer for Breaking Changes
```bash
feat(auth): redesign authentication system

BREAKING CHANGE: JWT payload structure has changed. The 'companyId' field
is now required in all authenticated requests. Update client applications
to handle the new token structure.

Closes #123
```

### Footer for Issue References
```bash
fix(sale): resolve duplicate sale item creation

Prevents race condition when creating sale items concurrently by adding
proper transaction isolation.

Fixes #456
Closes #789
```

## Commit Examples by Scenario

### New Module Creation
```bash
feat(client): add Client module with CRUD operations and integrate into AppModule

Includes ClientController, ClientService, and DTOs for client creation
and updates. Implements multi-tenant isolation and role-based access
control consistent with existing modules.
```

### Bug Fixes
```bash
fix(sale): resolve stock quantity calculation error in FIFO allocation

Previously, stock quantities could become negative due to race conditions
in concurrent sale processing. Added proper transaction isolation and
quantity validation to prevent overselling.

Fixes #234
```

### Configuration Changes
```bash
chore(swagger): configure Scalar UI theme for API documentation

Replaces default Swagger UI with Scalar for better developer experience.
Updates bootstrap configuration to log Swagger URL on startup.
```

### Documentation Updates
```bash
docs(api): enhance Swagger documentation for sale endpoints

Adds comprehensive examples and descriptions for sale creation and stock
allocation processes. Includes error response schemas and business rule
explanations.
```

### Performance Improvements
```bash
perf(inventory): optimize stock item queries with database indexes

Adds composite indexes on (productVariantId, quantity, expirationDate)
to improve FIFO allocation query performance. Reduces query time by ~70%
for large inventory datasets.
```

## Common Patterns in Stockflow

### Multi-Tenant Features
```bash
feat(product): implement company-scoped product management
feat(sale): add company validation in sale creation workflow
fix(auth): ensure proper company isolation in all queries
```

### API Enhancements
```bash
feat(api): add pagination support to product listing endpoints
feat(swagger): enhance API documentation with comprehensive examples
fix(validation): improve DTO validation with custom decorators
```

### Database and Schema
```bash
feat(schema): add soft delete support with deletedAt field
chore(migration): add indexes for improved query performance
fix(schema): resolve foreign key constraint issues
```

### Business Logic
```bash
feat(inventory): implement FIFO stock allocation algorithm
feat(audit): add comprehensive audit trail for inventory movements
fix(calculation): resolve unit price calculation in sale items
```

## Automated Workflows

### Changelog Generation
Commits following this convention enable automatic changelog generation:

- `feat` → Features section
- `fix` → Bug Fixes section  
- `BREAKING CHANGE` → Breaking Changes section

### Semantic Versioning
- `fix` → Patch version (1.0.1)
- `feat` → Minor version (1.1.0)
- `BREAKING CHANGE` → Major version (2.0.0)

## Best Practices

1. **Keep commits atomic** - One logical change per commit
2. **Use present tense** - "add feature" not "added feature"
3. **Be specific about scope** - Helps with code organization
4. **Explain business value** - Why was this change needed?
5. **Reference issues** - Link to GitHub issues when applicable
6. **Use conventional types** - Stick to the standard types
7. **Keep subject line under 72 characters** - For better git log display
8. **Use body for complex changes** - Explain context and reasoning
9. **Write entirely in English** - All commit messages must be in English

## Tools and Validation

### Recommended Tools
- `commitizen` - Interactive commit message generator
- `commitlint` - Validates commit message format
- `husky` - Git hooks for commit message validation
- `conventional-changelog` - Automatic changelog generation

## Migration from Non-Conventional Commits

If migrating from non-conventional commits:

1. Start using conventional format for new commits
2. Don't rewrite existing history unless necessary
3. Focus on consistency moving forward
4. Train team members on the new format
5. Set up validation tools to prevent format violations

## Troubleshooting

### Common Issues
- **Unclear scope**: Use the module name or technical area
- **Too generic description**: Be more specific about what changed
- **Missing type**: Always include a type (feat, fix, chore, etc.)
- **Wrong tense**: Use imperative mood (add, fix, update)
- **Non-English text**: All commit messages must be in English

### Validation Errors
If using commitlint, common validation errors and fixes:

```bash
# Error: type-empty
# Fix: Add a commit type
feat(user): add user profile update functionality

# Error: subject-case  
# Fix: Use lowercase
fix(auth): resolve token expiration issue

# Error: subject-max-length
# Fix: Shorten the subject line
feat(sale): implement FIFO allocation
```

## Language Enforcement

**Remember: Every part of your commit message must be in English:**

```bash
# ✅ Correct - All in English
feat(product): add new product creation functionality

Implements product creation with validation and company isolation.
Includes proper error handling and Swagger documentation.

# ❌ Wrong - Mixed languages
feat(produto): adicionar nova funcionalidade de criação

Implementa criação de produto com validação.
```

This ensures consistency across the codebase and makes the project accessible to international developers.