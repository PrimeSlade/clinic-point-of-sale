# GitHub Copilot Instructions

This file provides guidelines for GitHub Copilot when working on the Point-Of-Sale Backend project.

## Project Overview

**Point-Of-Sale Backend** is a comprehensive backend system for managing medical clinics and pharmacies with the following key features:

- **Medical Management**: Patient records, doctor profiles, treatment documentation
- **Inventory Control**: Medicine tracking with multiple unit types and expiry management
- **Services Management**: Medical services catalog with dynamic pricing
- **Invoicing System**: Comprehensive invoices with automatic inventory adjustment
- **Financial Tracking**: Expense management with detailed categorization
- **Multi-Location Support**: Branch management with location-based data filtering
- **Security**: JWT authentication with attribute-based access control (ABAC)

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript (v5.8.3)
- **Framework**: Express (v5.1.0)
- **Database**: PostgreSQL (v16+) with Prisma (v6.11.0)
- **Authentication**: JWT + bcryptjs
- **Authorization**: CASL (ABAC - Attribute-Based Access Control)
- **Validation**: Zod
- **Security**: Helmet, CORS
- **File Handling**: Multer, ExcelJS
- **Code Quality**: ESLint, Prettier
- **Package Manager**: pnpm

## Project Structure

```
src/
├── abilities/         # CASL permission definitions and ability configuration
├── config/           # Configuration files (database, env variables)
├── controllers/      # Request handlers (route layer)
├── errors/          # Custom error classes (ValidationError, NotFoundError, etc.)
├── middlewares/     # Express middleware (auth, validation, error handling)
├── models/          # Database query functions (data access layer)
├── routes/          # API route definitions
├── services/        # Business logic layer
├── types/           # TypeScript type definitions and interfaces
├── utils/           # Helper functions and utilities
└── index.ts         # Application entry point

prisma/
├── schema.prisma    # Database schema definition
├── migrations/      # Database migration files
└── seeds/          # Database seed scripts

docs/
├── api/            # API endpoint documentation
├── modules/        # Module-specific documentation
└── *.md           # Core guides (DATABASE, AUTHORIZATION, etc.)
```

## Coding Standards & Conventions

### TypeScript & Code Style

- **Use TypeScript** for all new code files
- **Follow existing patterns** in the codebase
- **Use Prettier** for code formatting (configured in `.prettierrc`)
- **Use ESLint** for code linting (configured in `eslint.config.js`)
- **Type everything**: Avoid `any` type; use explicit interfaces and types from `src/types`
- **Arrow functions** preferred over function declarations
- **Const/let**: Prefer `const` over `let`, never use `var`

### Naming Conventions

- **Files**: kebab-case (e.g., `verify-auth.ts`, `user-service.ts`)
- **Classes**: PascalCase (e.g., `ValidationError`, `UserService`)
- **Functions/Variables**: camelCase (e.g., `getUserById`, `isValidEmail`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`, `DEFAULT_TIMEOUT`)
- **Database Models**: PascalCase (e.g., `User`, `Patient`, `Invoice`)

### Architecture Layers

The project follows a **layered architecture**:

1. **Routes** (`src/routes/*.ts`) - Define endpoints and HTTP methods
2. **Controllers** (`src/controllers/*.ts`) - Handle requests, call services
3. **Services** (`src/services/*.ts`) - Business logic orchestration and transactions
4. **Models** (`src/models/*.ts`) - Pure database queries via Prisma (no business logic)
5. **Utils** (`src/utils/*.ts`) - Pure helper functions (no DB calls, no side effects)
6. **Middlewares** (`src/middlewares/*.ts`) - Request processing (auth, validation, error handling)
7. **Types** (`src/types/*.ts`) - Shared TypeScript definitions

#### Layer Responsibilities

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Models** | Database operations only | `getItemById()`, `upsertItem()`, `addHistory()` |
| **Utils** | Pure helper functions | `detectChanges()`, `generateSummary()`, `formatDate()` |
| **Services** | Orchestration & transactions | Combine models + utils inside `prisma.$transaction()` |

```typescript
// ✅ Correct: Service orchestrates inside transaction
const importItem = async (items, user) => {
  const result = await prisma.$transaction(async (trx) => {
    for (const item of items) {
      const existing = await itemModel.getByBarcode(item.barcode, trx);  // Model: DB
      const changes = detectUnitChanges(existing, item.units);           // Util: Pure
      const upserted = await itemModel.upsertItem(item, trx);            // Model: DB
      if (changes.hasChanges) {
        await itemModel.addHistory(changes, user, trx);                  // Model: DB
      }
    }
    return generateImportSummary(results);                               // Util: Pure
  });
  return result;
};

// ❌ Wrong: Model containing business logic
const importItemsWithTransaction = async (items, user, trx) => {
  // Don't put orchestration logic in models
};
```

### Key Patterns

#### Authentication & Authorization (ABAC)

- **JWT Token Handling**: Tokens are stored in signed cookies (`posToken`)
- **ABAC System**: CASL is used for fine-grained authorization based on user attributes
- **Location-based Multi-tenancy**: Users are filtered by their assigned location
- **Ability Definition**: Located in `src/abilities/` - defines what actions users can perform

```typescript
// Example: Checking authorization in a controller
const user = req.user; // Attached by verifyAuth middleware
const canRead = user.ability.can("read", "Patient");
if (!canRead) {
  throw new ForbiddenError("You cannot read patients");
}
```

#### Error Handling

- **Custom Error Classes**: Extend from base error classes in `src/errors/`
- **Consistent Error Responses**: Use the custom error classes for uniform error handling
- **HTTP Status Codes**: Map to appropriate status codes (400, 401, 403, 404, 500)

```typescript
// Example: Throwing a custom error
throw new ValidationError("Invalid email format");
throw new NotFoundError("User not found");
throw new ForbiddenError("Access denied");
```

#### Database Operations (Prisma)

- **Type-safe Queries**: Always use Prisma's type-safe query builder
- **Location Filtering**: Always include location filtering in queries where applicable
- **Transaction Support**: Use Prisma transactions for operations affecting multiple tables (especially invoices)
- **Migrations**: Create migrations for schema changes using `npx prisma migrate dev --name <name>`

```typescript
// Example: Database query with location filtering
const items = await prisma.item.findMany({
  where: {
    locationId: user.locationId,
  },
  include: { units: true },
});
```

#### Input Validation

- **Use Zod**: Define validation schemas using Zod for runtime validation
- **Request DTO Validation**: Validate request bodies in controllers or middleware
- **Type Safety**: Ensure inferred types from Zod schemas match database models

```typescript
// Example: Zod schema validation
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### Invoice System (Important)

The invoice system is critical and complex:

- **Automatic Inventory Adjustment**: Creating/deleting invoices automatically adjusts item quantities
- **Transaction Safety**: Invoice operations use database transactions to ensure consistency
- **Reversible Operations**: Deleting an invoice reverses the inventory changes from creation
- **Documentation**: See `docs/INVOICE_OPERATIONS.md` for detailed flow

When working on invoice features:

1. Always maintain inventory consistency
2. Use database transactions for multi-step operations
3. Test both creation and deletion flows
4. Ensure existing invoices don't break with schema changes

## Development Workflow

### Planning Phase (IMPORTANT)

**When handling requests with multiple tasks or unclear scope:**

1. **Analyze the request** and identify all tasks/changes needed
2. **Create a structured plan** listing all tasks clearly (numbered or bulleted)
3. **If multiple tasks exist**, ask the user for explicit permission before proceeding:
   - Show the complete plan with all identified tasks
   - Ask which task(s) to proceed with
   - Get clear confirmation from the user
4. **Wait for user confirmation** before implementing any code
5. **Document your approach** if the implementation strategy has multiple valid approaches

Example:

```
I've identified 3 tasks:
1. Update Patient model schema in Prisma
2. Create migration for new fields
3. Update Patient controller with new endpoints

Which task(s) would you like me to proceed with first?
```

### Before Starting Work

1. **Read relevant documentation** in `docs/` folder:
   - `AUTHORIZATION.md` - for permission/access control changes
   - `DATABASE.md` - for schema-related changes
   - `INVOICE_OPERATIONS.md` - for invoice logic changes
   - Specific API docs for the endpoint you're modifying

2. **Understand the current implementation** by reading existing code

3. **Check database relationships** in `prisma/schema.prisma`

### When Writing Code

1. **Follow the existing architectural patterns** (Routes → Controllers → Services → Models)

2. **Update types** in `src/types/` when adding new data structures

3. **Add proper error handling** with custom error classes

4. **Include location-based filtering** in queries that deal with user data

5. **Use transactions** for operations affecting multiple tables

6. **Write clear, self-documenting code** - prefer clarity over cleverness

7. **Test edge cases**, especially for invoice and financial operations

### After Implementation (IMPORTANT)

**ALWAYS report back to the user with the following details:**

1. **Summary** - Brief overview of what was implemented
2. **Files Modified** - List each file with its full path:
   - Include creation of new files
   - Include modifications to existing files
   - Example format: `src/controllers/patient.ts`, `prisma/schema.prisma`, etc.
3. **Files Created** - List any new files created with full path
4. **Testing Status** - Confirm feature works as expected
5. **Breaking Changes** - Any API changes, deprecations, or migration requirements
6. **Next Steps** - What needs to be done next (if anything)
7. **Issues Encountered** - Any problems and how they were resolved

Example Report:

```
✅ Implementation Complete: Patient Bulk Import Feature

**Summary**: Created new endpoint for bulk patient import via CSV with validation and error handling.

**Files Modified**:
- `src/routes/patient.ts` - Added POST /api/v1/patients/import route
- `src/controllers/patient.ts` - Added importPatients controller method
- `src/services/patient.ts` - Added bulk import business logic with transaction
- `src/types/patient.ts` - Added PatientImportInput and ImportResponse types

**Files Created**:
- `src/utils/csv-parser.ts` - New utility for CSV parsing

**Testing**: ✅ Tested with sample CSV file, successfully imported 50 patients

**Breaking Changes**: None

**Next Steps**: Frontend team can integrate the new endpoint

**Issues**: Initially faced transaction rollback issue, fixed by ensuring proper error propagation
```

### Before Committing

1. **Run linter**: `pnpm run lint` - fix any linting errors
2. **Format code**: Let Prettier format your code
3. **Test the feature**: Use the API to verify it works
4. **Check database migrations**: Ensure migrations are clean and ordered
5. **Update documentation** if you've made significant changes

## Common Tasks

### Adding a New API Endpoint

1. Create/update route in `src/routes/`
2. Create controller in `src/controllers/` to handle the request
3. Add service logic in `src/services/` for business operations
4. Add database queries in `src/models/` using Prisma
5. Define types in `src/types/` for request/response
6. Add validation schema using Zod if needed
7. Include proper error handling
8. Update relevant documentation in `docs/api/`

### Modifying Database Schema

1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name <descriptive-name>`
3. Update types in `src/types/` if needed
4. Update relevant models in `src/models/`
5. Update documentation in `docs/DATABASE.md`
6. Test with existing data and new migrations

### Adding Authorization Rules

1. Update permission definitions in `prisma/schema.prisma` if needed
2. Modify or create ability rules in `src/abilities/`
3. Update `src/middlewares/verifyAuth.ts` if middleware changes needed
4. Add checks in controllers using `user.ability.can()`
5. Update documentation in `docs/AUTHORIZATION.md`

### Working with Inventory/Invoices

1. Understand the current invoice flow in `docs/INVOICE_OPERATIONS.md`
2. Use database transactions for multi-step operations
3. Test both creation and deletion flows
4. Ensure inventory is properly adjusted
5. Verify no orphaned data is left after operations

## Important Rules

### Security

- **Never commit secrets** - Keep `.env` out of version control
- **Validate all inputs** - Use Zod schemas for runtime validation
- **Check permissions** - Always verify authorization before returning data
- **Hash passwords** - Use bcryptjs for password hashing
- **Use HTTPS in production** - Configure proper security headers with Helmet

### Data Integrity

- **Use transactions** - For operations affecting multiple tables
- **Validate constraints** - Ensure foreign key relationships are maintained
- **Handle cascades carefully** - Understand delete cascade implications
- **Test migrations** - Always test database migrations with real data

### Performance

- **Load relationships efficiently** - Use Prisma `include` instead of N+1 queries
- **Filter at database level** - Don't fetch all records and filter in application
- **Use indexes** - For frequently queried fields
- **Limit query results** - Implement pagination for large datasets

## Testing & Verification

- **Manual API Testing**: Use Postman, curl, or the frontend to test endpoints
- **Database Testing**: Use Prisma Studio (`npx prisma studio`) to verify data
- **Error Cases**: Test both success and failure scenarios
- **Edge Cases**: Think about boundary conditions (empty lists, max values, etc.)
- **Permission Testing**: Verify authorization rules work correctly

## Documentation

- **API Changes**: Update `docs/api/*.md` files with endpoint changes
- **Schema Changes**: Update `docs/DATABASE.md` with model changes
- **Authorization Changes**: Update `docs/AUTHORIZATION.md` with permission changes
- **Complex Logic**: Add comments explaining non-obvious business logic
- **Breaking Changes**: Document migration paths for API consumers

## Resources

- **Main README**: See `README.md` for project overview
- **Getting Started Guide**: See `docs/GETTING_STARTED.md` for setup instructions
- **Database Schema**: See `docs/DATABASE.md` for complete schema documentation
- **Authorization Guide**: See `docs/AUTHORIZATION.md` for ABAC system details
- **Invoice Operations**: See `docs/INVOICE_OPERATIONS.md` for invoice logic
- **API Documentation**: See `docs/api/*.md` for endpoint documentation
- **Prisma Docs**: https://www.prisma.io/docs/
- **CASL Docs**: https://casl.js.org/

## Questions or Unclear Requirements?

When in doubt:

1. **Check documentation** in the `docs/` folder
2. **Look at existing implementations** for similar features
3. **Review the database schema** in `prisma/schema.prisma`
4. **Read test endpoints** to understand expected behavior
5. **Ask for clarification** rather than making assumptions

---

**Last Updated**: March 2026  
**Project**: Point-Of-Sale Backend  
**Stack**: TypeScript · Express · Prisma · PostgreSQL · JWT · CASL
