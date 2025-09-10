# When to Update Documentation Files

## Overview

This guide maps specific development activities to the documentation files that should be updated. Use this checklist to ensure all relevant documentation stays current with code changes.

## File Update Triggers

### Core Architecture Files

#### `docs/instructions.md`
**Update when:**
- [ ] **New module created** - Add module to architecture overview and directory structure
- [ ] **Module removed** - Remove references from architecture
- [ ] **Major architectural change** - Update patterns and principles
- [ ] **New design decision** - Add to Key Design Decisions section
- [ ] **Technology stack change** - Update technology list
- [ ] **New domain entity** - Add to Domain Entities section
- [ ] **Role system changes** - Update Role-based access descriptions

**Examples:**
```markdown
# Adding new module
src/modules/
├── inventory-movement/     # <- New module added
```

#### `CLAUDE.md`
**Update when:**
- [ ] **New npm script added** - Add to Commands section
- [ ] **Development workflow changes** - Update commands or processes
- [ ] **Database commands change** - Update Prisma commands
- [ ] **Testing approach changes** - Update testing commands
- [ ] **New environment setup** - Update setup instructions

#### `CHANGELOG.md`
**Update when:**
- [ ] **Version bump in package.json** - Add new version entry
- [ ] **New feature released** - Document in Features section
- [ ] **Bug fix released** - Document in Bug Fixes section
- [ ] **Breaking change** - Document in Breaking Changes section
- [ ] **Dependency update** - Note significant updates
- [ ] **Major refactoring** - Document architectural changes

**Version Mapping:**
- `patch` (1.0.1) → Bug fixes, minor updates
- `minor` (1.1.0) → New features, non-breaking changes
- `major` (2.0.0) → Breaking changes, major refactoring

### Module-Specific Files

#### `src/app.module.ts`
**Update documentation when:**
- [ ] **New module imported** - Update `docs/create-module.md` examples
- [ ] **Module dependencies change** - Update architecture diagrams in `docs/instructions.md`

#### New Module Created
**Files to update:**
- [ ] `docs/instructions.md` - Add to directory structure and domain entities
- [ ] `docs/create-module.md` - Update examples if pattern changes
- [ ] `README.md` - Add to features list if user-facing
- [ ] `CHANGELOG.md` - Document new module in next release

### API and Schema Changes

#### `prisma/schema.prisma`
**Update documentation when:**
- [ ] **New model added** - Update `docs/instructions.md` Domain Entities
- [ ] **Model relationship changes** - Update architecture descriptions
- [ ] **Enum changes** - Update validation examples in `docs/validators.md`
- [ ] **Migration required** - Document in `CHANGELOG.md`

#### New API Endpoint Added
**Files to update:**
- [ ] `docs/controllers.md` - Add example if new pattern introduced
- [ ] API documentation (if external) - Update endpoint lists
- [ ] `CHANGELOG.md` - Document new endpoints in next release

### Development Workflow Files

#### `package.json`
**Update documentation when:**
- [ ] **New script added** - Update `CLAUDE.md` commands section
- [ ] **Version bumped** - Update `CHANGELOG.md` with new version
- [ ] **New dependency** - Update technology stack in `docs/instructions.md`
- [ ] **Node version change** - Update setup requirements in `README.md`

#### `jest.config.js` or Testing Changes
**Update documentation when:**
- [ ] **Testing approach changes** - Update `docs/create-module.md` testing patterns
- [ ] **New test commands** - Update `CLAUDE.md` testing section
- [ ] **Test structure changes** - Update examples in documentation

### Security and Configuration

#### Authentication/Authorization Changes
**Files to update:**
- [ ] `docs/controllers.md` - Update security patterns and examples
- [ ] `docs/services.md` - Update company isolation patterns
- [ ] `docs/instructions.md` - Update Role-based access control section

#### Environment Variables
**Update documentation when:**
- [ ] **New .env variable** - Update setup instructions in `README.md`
- [ ] **Configuration changes** - Update `docs/instructions.md` if architectural

## Specific Update Scenarios

### Scenario: Adding a New Module (e.g., `notification`)

**Step-by-step documentation updates:**

1. **Create the module files** (following `docs/create-module.md`)

2. **Update `docs/instructions.md`:**
   ```markdown
   ### Domain Entities
   - **Notification**: User and system notifications
   
   ### Directory Structure
   ├── modules/
   │   ├── notification/          # User notifications
   ```

3. **Update `CLAUDE.md`** (if new commands needed):
   ```markdown
   ### Notification System
   - `pnpm notification:send` - Send test notification
   ```

4. **Update `CHANGELOG.md`:**
   ```markdown
   ## [Unreleased]
   ### Added
   - Notification module with email and in-app notifications
   ```

### Scenario: Major Refactoring (e.g., changing authentication)

**Files to update:**
1. **`CHANGELOG.md`** - Document breaking changes
2. **`docs/instructions.md`** - Update authentication patterns
3. **`docs/controllers.md`** - Update security examples
4. **`docs/services.md`** - Update user context patterns
5. **`README.md`** - Update setup instructions if needed

### Scenario: New Validation Pattern

**Files to update:**
1. **`docs/validators.md`** - Add new validation example
2. **`docs/create-module.md`** - Update DTO creation examples
3. **`CHANGELOG.md`** - Document improvement

### Scenario: Database Schema Changes

**Files to update:**
1. **`docs/instructions.md`** - Update domain model if new entities
2. **`docs/services.md`** - Update query patterns if needed
3. **`CHANGELOG.md`** - Document schema changes
4. **Migration guide** (if breaking changes)

## Update Checklist by Development Phase

### During Development
- [ ] Update relevant pattern files (`docs/validators.md`, `docs/services.md`, `docs/controllers.md`)
- [ ] Update `docs/create-module.md` if new patterns emerge

### Before Code Review
- [ ] Update `docs/instructions.md` for architectural changes
- [ ] Update examples in pattern files
- [ ] Check that new modules are documented

### Before Release
- [ ] Update `CHANGELOG.md` with all changes
- [ ] Update version in `package.json`
- [ ] Update `README.md` for user-facing changes
- [ ] Update `CLAUDE.md` for new commands

### After Release
- [ ] Update `docs/instructions.md` changelog section
- [ ] Archive old migration guides if applicable

## Automated Checks

### Pre-commit Hooks (Recommended)
```bash
# Check for common documentation updates needed
- If new module exists → Check docs/instructions.md updated
- If package.json version changed → Check CHANGELOG.md updated  
- If new Prisma model → Check docs updated
```

### Pull Request Template
```markdown
## Documentation Updates Required

- [ ] Updated `docs/instructions.md` for architectural changes
- [ ] Updated `CHANGELOG.md` for user-facing changes  
- [ ] Updated relevant pattern files for new approaches
- [ ] Updated `CLAUDE.md` for new commands
- [ ] Updated examples in documentation files
```

## Documentation Maintenance Schedule

### Weekly
- [ ] Review recent commits for missing documentation updates
- [ ] Check that examples in pattern files work with current code

### Before Each Release  
- [ ] Comprehensive review of all documentation
- [ ] Update CHANGELOG.md with complete release notes
- [ ] Verify all architectural changes are documented

### Monthly
- [ ] Review and update outdated examples
- [ ] Check for broken references between documentation files
- [ ] Update technology stack information if needed

## Quick Reference: File Purposes

| File | Primary Purpose | Update Trigger |
|------|----------------|----------------|
| `docs/instructions.md` | Architecture overview | New modules, design decisions |
| `docs/validators.md` | DTO patterns | New validation approaches |  
| `docs/services.md` | Business logic patterns | New service patterns |
| `docs/controllers.md` | API endpoint patterns | New endpoint types |
| `docs/create-module.md` | Module creation workflow | Pattern changes |
| `docs/conventional-commits.md` | Commit standards | Commit pattern changes |
| `CLAUDE.md` | Development commands | New scripts, workflow changes |
| `CHANGELOG.md` | Release notes | Every version bump |
| `README.md` | Project overview | Setup changes, major features |

## Common Mistakes to Avoid

- ❌ Updating code without updating documentation
- ❌ Adding new modules without updating architecture docs
- ❌ Releasing without updating CHANGELOG.md
- ❌ Changing patterns without updating pattern files
- ❌ Adding new commands without updating CLAUDE.md
- ❌ Breaking changes without updating migration guides
- ❌ New validation approaches without updating examples
- ❌ Architectural decisions without documenting rationale