# Codebase Structure

**Analysis Date:** 2025-01-14

## Directory Layout

```
src/
├── index.ts                    # Express app entry point, middleware setup
├── generated/                  # Auto-generated Prisma types (committed)
│   └── prisma/                 # Prisma client type definitions
├── routes/                     # HTTP endpoint definitions
│   ├── index.route.ts          # API root router
│   └── v1/                     # API v1 routes
│       ├── index.route.ts      # V1 router combining all domain routes
│       ├── auth.route.ts       # Login/signup endpoints
│       ├── patient.route.ts    # Patient CRUD endpoints
│       ├── invoice.route.ts    # Invoice CRUD + reporting
│       ├── item.route.ts       # Item CRUD + import/export
│       ├── treatment.route.ts  # Treatment CRUD
│       ├── doctor.route.ts     # Doctor CRUD
│       ├── service.route.ts    # Service CRUD
│       ├── location.route.ts   # Location CRUD
│       ├── category.route.ts   # Category CRUD
│       ├── expense.route.ts    # Expense CRUD
│       ├── role.route.ts       # Role CRUD
│       ├── user.route.ts       # User management
│       └── permission.route.ts # Permission management
├── controllers/                # HTTP request handlers (13 files)
│   ├── patient.controller.ts   # Patient endpoint logic
│   ├── invoice.controller.ts   # Invoice endpoint logic
│   ├── item.controller.ts      # Item endpoint logic + bulk operations
│   ├── auth.controller.ts      # Login/signup logic
│   ├── treatment.controller.ts
│   ├── doctor.controller.ts
│   ├── user.controller.ts
│   ├── role.controller.ts
│   ├── permission.controller.ts
│   ├── category.controller.ts
│   ├── service.controller.ts
│   ├── location.controller.ts
│   └── expense.controller.ts
├── services/                   # Business logic layer (13 files)
│   ├── patient.service.ts      # Patient business operations
│   ├── invoice.service.ts      # Invoice calculations & operations
│   ├── item.service.ts         # Item management & bulk operations
│   ├── auth.service.ts         # Authentication logic
│   ├── treatment.service.ts
│   ├── doctor.service.ts
│   ├── user.service.ts
│   ├── role.service.ts
│   ├── permission.service.ts
│   ├── category.service.ts
│   ├── service.service.ts
│   ├── location.service.ts
│   └── expense.service.ts
├── models/                     # Data access layer (14 files)
│   ├── patient.model.ts        # Prisma queries for patients
│   ├── invoice.model.ts        # Prisma queries for invoices
│   ├── item.model.ts           # Prisma queries for items
│   ├── itemUnit.model.ts       # Prisma queries for item units
│   ├── auth.model.ts           # User lookup queries
│   ├── treatment.model.ts
│   ├── doctor.model.ts
│   ├── user.model.ts
│   ├── role.model.ts
│   ├── permission.model.ts
│   ├── category.model.ts
│   ├── service.model.ts
│   ├── location.model.ts
│   ├── expense.model.ts
│   └── phoneNumber.model.ts    # Shared phone number queries
├── middlewares/                # Request processing
│   ├── verifyAuth.ts           # JWT verification, user loading
│   └── errorHandler.ts         # Global error catching & formatting
├── abilities/                  # Authorization
│   ├── abilities.ts            # CASL ability rules definition
│   └── authorize.middleware.ts # Permission enforcement
├── types/                      # TypeScript type definitions (11 files)
│   ├── express.d.ts            # Express Request augmentation
│   ├── auth.type.ts            # Authentication types
│   ├── patient.type.ts         # Patient DTO & operations
│   ├── invoice.type.ts         # Invoice DTO & query params
│   ├── item.type.ts            # Item DTO & operations
│   ├── role.type.ts            # Role & permission types
│   ├── service.type.ts
│   ├── treatment.type.ts
│   ├── doctor.type.ts
│   ├── category.type.ts
│   ├── expense.type.ts
│   ├── location.type.ts
│   └── report.type.ts          # Report generation types
├── utils/                      # Shared utilities (11 files)
│   ├── response.ts             # API response formatting
│   ├── auth.ts                 # JWT generation/verification, password hashing
│   ├── calcInvoice.ts          # Invoice total calculations
│   ├── invoice.operations.ts   # Item quantity adjustments
│   ├── validation.ts           # Input validation helpers
│   ├── phoneNumber.util.ts     # Phone number utility functions
│   ├── fetchLocation.ts        # Location filtering helper
│   ├── roleMapping.ts          # Permission dependency resolution
│   ├── item.util.ts            # Item-specific utilities
│   ├── age.util.ts             # Age calculation from DOB
│   └── unit-type.util.ts       # Unit type conversions
├── config/                     # Configuration
│   └── prisma.client.ts        # Singleton Prisma client instance
└── errors/                     # Error classes & handlers (2 files)
    ├── index.ts                # Custom error classes
    └── prismaHandler.ts        # Prisma error mapping

prisma/
├── schema.prisma               # Database schema definition
├── migrations/                 # Database migration history
└── seeds/                      # Database seeding scripts
    ├── seed.ts                 # Main seed runner
    ├── permissions.seed.ts     # Permission data
    ├── user.seed.ts            # User data
    └── data.seed.ts            # General data
```

## Directory Purposes

**src/:**
- Purpose: All TypeScript source code
- Contains: Application logic organized by architectural layer
- Key files: `index.ts` is the entry point

**src/routes/:**
- Purpose: HTTP endpoint routing and middleware composition
- Contains: Express route definitions organized by API version and domain
- Key files: `src/routes/v1/index.route.ts` combines all domain routes

**src/controllers/:**
- Purpose: Request/response handling, input validation
- Contains: One file per domain (13 total)
- Key files: `src/controllers/invoice.controller.ts` (complex: includes bulk operations), `src/controllers/item.controller.ts` (bulk import/export)

**src/services/:**
- Purpose: Business logic, error handling, data transformation
- Contains: One file per domain plus cross-cutting services (13 total)
- Key files: `src/services/invoice.service.ts` (complex calculations), `src/services/auth.service.ts` (token/password handling)

**src/models/:**
- Purpose: Database queries via Prisma ORM
- Contains: One file per entity (14 total)
- Key files: `src/models/invoice.model.ts` (complex relational queries with search/filter), `src/models/patient.model.ts` (soft delete support)

**src/middlewares/:**
- Purpose: Cross-cutting request processing
- Contains: Authentication, authorization, error handling
- Key files: `src/middlewares/verifyAuth.ts` (token verification and user loading), `src/middlewares/errorHandler.ts` (error transformation)

**src/abilities/:**
- Purpose: Access control rules and enforcement
- Contains: CASL-based permission system
- Key files: `src/abilities/abilities.ts` (rule definitions), `src/abilities/authorize.middleware.ts` (route-level enforcement)

**src/types/:**
- Purpose: TypeScript type and interface definitions
- Contains: One primary file per domain (11 total)
- Key files: `src/types/express.d.ts` (Request augmentation with user, ability, abacFilter), `src/types/auth.type.ts` (authentication types)

**src/utils/:**
- Purpose: Reusable helper functions
- Contains: Domain-specific and cross-cutting utilities (11 total)
- Key files: `src/utils/calcInvoice.ts` (invoice math), `src/utils/auth.ts` (JWT, password), `src/utils/response.ts` (response formatting)

**src/config/:**
- Purpose: Application configuration and initialization
- Contains: Prisma client singleton
- Key files: `src/config/prisma.client.ts`

**src/errors/:**
- Purpose: Error classes and error transformation
- Contains: Custom error types, Prisma error mapping
- Key files: `src/errors/index.ts` (CustomError, NotFoundError, BadRequestError), `src/errors/prismaHandler.ts` (error code mapping)

**src/generated/:**
- Purpose: Auto-generated types from database schema
- Contains: Prisma client types (regenerated on schema changes)
- Key files: `src/generated/prisma/*` (committed type definitions)

**prisma/:**
- Purpose: Database schema and data management
- Contains: Schema definition, migrations, seed scripts
- Key files: `prisma/schema.prisma` (single source of truth for data model), `prisma/seeds/*` (initialization data)

## Key File Locations

**Entry Points:**
- `src/index.ts`: Main Express app setup, listens on configured port, registers global middleware
- `src/routes/index.route.ts`: API root router mounting v1 routes
- `src/routes/v1/index.route.ts`: V1 API combining all domain routes

**Configuration:**
- `src/config/prisma.client.ts`: Prisma client singleton used by all models
- `.env`: Environment variables (PORT, FRONT_END_ORIGIN, COOKIE_SECRET, DATABASE_URL)
- `tsconfig.json`: TypeScript compilation settings
- `tsup.config.ts`: Build configuration
- `prisma/schema.prisma`: Database schema and relationships

**Core Logic:**
- `src/services/`: Business operations and data transformation
- `src/models/`: Database queries
- `src/utils/`: Shared calculation and utility functions
- `src/abilities/`: Authorization rules

**Middleware & Error Handling:**
- `src/middlewares/verifyAuth.ts`: JWT verification and user loading
- `src/middlewares/errorHandler.ts`: Global error catching and response formatting
- `src/abilities/authorize.middleware.ts`: Permission enforcement at route level
- `src/errors/`: Error classes and Prisma error mapping

**Authentication & Authorization:**
- `src/utils/auth.ts`: JWT token operations and password hashing
- `src/services/auth.service.ts`: Login/signup logic
- `src/abilities/abilities.ts`: Permission rules for CASL
- `src/utils/roleMapping.ts`: Permission dependency resolution

**Type Definitions:**
- `src/types/express.d.ts`: Express Request augmentation (user, ability, abacFilter)
- `src/types/auth.type.ts`: LoginCredentials, UserForm, UserInfo types
- `src/types/*.type.ts`: Domain-specific DTOs and request types

## Naming Conventions

**Files:**
- Controllers: `{domain}.controller.ts` (camelCase domain, singular or plural, e.g., `patient.controller.ts`, `invoice.controller.ts`)
- Services: `{domain}.service.ts` (same naming)
- Models: `{domain}.model.ts` (same naming)
- Routes: `{domain}.route.ts` and `index.route.ts` for routers
- Types: `{domain}.type.ts` and `express.d.ts` for augmentation
- Utils: `{operation}.ts` or `{domain}.util.ts` (specific operation or domain, e.g., `calcInvoice.ts`, `phoneNumber.util.ts`)

**Directories:**
- Feature-based: `/controllers`, `/services`, `/models`, `/routes`, `/types`
- Cross-cutting: `/middlewares`, `/abilities`, `/utils`, `/errors`, `/config`
- Generated: `/generated` (do not modify)

**Functions:**
- camelCase: `addPatient`, `getPatients`, `createInvoice`, `verifyAuth`
- Action prefix: create*, get*, update*, delete*, add*, remove*
- Query filters: `with*` for related data inclusion, `where*` for filtering

**Variables:**
- camelCase throughout: `req`, `res`, `user`, `abacFilter`, `invoiceItems`
- Prefixes for clarity: `is*` for booleans, `on*` for event handlers, `handle*` for middleware

**Types:**
- PascalCase: `UserInfo`, `Patient`, `Invoice`, `LoginCredentials`
- Suffixes: `*Type` for type definitions, `*DTO` for data transfer objects (not consistently used)
- Union types: `Actions = "manage" | "read" | ...`

## Where to Add New Code

**New Feature (Domain-Specific):**
1. Create types: `src/types/{domain}.type.ts` - DTO and request types
2. Create route: `src/routes/v1/{domain}.route.ts` - endpoints with authorization
3. Create controller: `src/controllers/{domain}.controller.ts` - request handlers
4. Create service: `src/services/{domain}.service.ts` - business logic
5. Create model: `src/models/{domain}.model.ts` - database queries
6. Add to router: Update `src/routes/v1/index.route.ts` to include new routes

**New Component/Module (Cross-Cutting):**
- Shared utilities: `src/utils/{feature}.ts`
- Shared middleware: `src/middlewares/{feature}.ts`
- Error handling: `src/errors/` if new error type
- Database config: `src/config/` if new integration

**New Utility Function:**
- Domain-specific: `src/utils/{domain}.util.ts`
- Operation-specific: `src/utils/{operation}.ts` (e.g., `calcInvoice.ts`)
- Middleware-related: Keep in `src/utils/` or move to `src/middlewares/` if stateful

**New Route Middleware:**
- Authorization: Extend `src/abilities/authorize.middleware.ts`
- Request processing: Add to `src/middlewares/` as new file
- Chain in `src/routes/v1/{domain}.route.ts` before controller handler

**Database Entity:**
1. Add schema: Update `prisma/schema.prisma`
2. Generate types: `npm run prisma generate`
3. Create migration: `npx prisma migrate dev --name {description}`
4. Seed data: Add to appropriate seed file in `prisma/seeds/`

## Special Directories

**src/generated/:**
- Purpose: Auto-generated Prisma client types
- Generated: YES (via `prisma generate`)
- Committed: YES (type definitions are committed)
- Modification: Never edit manually, regenerate via `prisma generate` when schema changes

**prisma/migrations/:**
- Purpose: Database migration history for version control
- Generated: YES (via `prisma migrate`)
- Committed: YES (migrations track schema changes)
- Modification: Never edit existing migrations; create new migrations for changes

**prisma/seeds/:**
- Purpose: Initial data population scripts
- Generated: NO (manually written)
- Committed: YES (part of reproducible setup)
- Modification: Edit and run via `npm run seed`, `npm run permission-seed`, etc.

---

*Structure analysis: 2025-01-14*
