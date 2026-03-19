# Architecture

**Analysis Date:** 2025-01-14

## Pattern Overview

**Overall:** Layered MVC architecture with role-based access control (RBAC) and attribute-based access control (ABAC)

**Key Characteristics:**
- Three-layer separation: Controllers → Services → Models/Data Access
- Express.js REST API with typed request/response handling
- Prisma ORM for database operations with transaction support
- CASL library for permission-based access control
- JWT cookie-based authentication
- Error handling and validation at multiple layers

## Layers

**Controllers:**
- Purpose: Handle HTTP requests/responses, validate input, pass to services
- Location: `src/controllers/`
- Contains: Request handlers for all resource endpoints
- Depends on: Services, error classes, response utilities
- Used by: Routes layer

**Services:**
- Purpose: Business logic implementation, error transformation, transaction coordination
- Location: `src/services/`
- Contains: Business operations, data transformation, Prisma error handling
- Depends on: Models, utilities, error classes
- Used by: Controllers

**Models:**
- Purpose: Direct database access, Prisma query construction
- Location: `src/models/`
- Contains: Raw Prisma queries for CRUD operations
- Depends on: Prisma client, type definitions
- Used by: Services

**Routes:**
- Purpose: HTTP endpoint definitions and middleware chaining
- Location: `src/routes/`
- Contains: Express route handlers with authorization middleware
- Depends on: Controllers, authorization middleware
- Used by: Main app entry point

**Middleware:**
- Purpose: Cross-cutting concerns (auth, authorization, error handling)
- Location: `src/middlewares/` and `src/abilities/`
- Contains: Authentication, authorization, error handling
- Depends on: Services, abilities library
- Used by: Routes and main app

**Utilities:**
- Purpose: Shared helper functions for calculations, validation, transformations
- Location: `src/utils/`
- Contains: Invoice calculations, validation, response formatting
- Depends on: Type definitions, Prisma types
- Used by: Controllers, services, models

## Data Flow

**Request Flow - Authentication Example (Login):**

1. Client POST `/api/v1/auth/login` with credentials
2. Route (`src/routes/v1/auth.route.ts`) → Controller (`src/controllers/auth.controller.ts`)
3. Controller validates input, calls service
4. Service (`src/services/auth.service.ts`) calls model (`src/models/auth.model.ts`)
5. Model performs Prisma query to find user
6. Service handles Prisma errors, verifies password, generates JWT token
7. Controller sends response with token
8. Token stored in signed cookie by client

**Request Flow - Authorization Protected Endpoint (Get Patients):**

1. Client GET `/api/v1/patients` with authentication cookie
2. `verifyAuth` middleware (`src/middlewares/verifyAuth.ts`):
   - Extracts token from signed cookie
   - Verifies token validity
   - Loads user info via `authService.findInfo()`
   - Resolves permissions via `resolvePermissionDependencies()`
   - Builds CASL abilities via `defineAbilities()`
   - Attaches user, ability, and ABAC filter to request
3. Route applies `authorize("read", "Patient")` middleware (`src/abilities/authorize.middleware.ts`):
   - Checks if user ability permits action
   - Generates location-based filter for non-admin users
   - Attaches `req.abacFilter` to request
4. Controller (`src/controllers/patient.controller.ts`) calls service with filter
5. Service (`src/services/patient.service.ts`) calls model with filter
6. Model (`src/models/patient.model.ts`) applies filter to Prisma query
7. Returns filtered patient data respecting user's location/permissions
8. Controller formats response via `sendResponse()`

**Request Flow - Create with Transaction (Create Invoice):**

1. Client POST `/api/v1/invoices/add` with invoice items and services
2. Route passes through auth and authorization middleware
3. Controller extracts invoice data including items and services
4. Service (`src/services/invoice.service.ts`):
   - Initiates Prisma transaction (`prisma.$transaction`)
   - Deducts item quantities via `adjustUnitAmount()`
   - Calculates totals via `calcInvoice()` utility
   - Creates invoice with nested items/services via model
   - Prisma handles atomicity - all succeed or all fail
5. Model (`src/models/invoice.model.ts`) creates invoice with relations
6. Service transforms Prisma Decimal values to numbers
7. Controller sends response with created invoice

**Request Flow - Import/Export (Bulk Item Operations):**

1. Client POST `/api/v1/items/import` with Excel file
2. Route applies file upload middleware (multer) → authorization → controller
3. Controller processes file, extracts data
4. Service handles bulk insertion with individual error tracking
5. Controller/Service returns success count and error list

**State Management:**

- No in-memory state - stateless request handling
- User state attached to request during middleware chain
- Permission state resolved per request from database
- Database transactions ensure consistency during complex operations
- Location-based filtering applied at query level via ABAC

## Key Abstractions

**User Identity & Authentication:**
- Purpose: Represent authenticated user with full context (role, permissions, location)
- Examples: `src/types/auth.type.ts` (UserInfo, LoginCredentials), `src/types/express.d.ts` (Request augmentation)
- Pattern: JWT token verification → user lookup → permission resolution → request enrichment

**Ability & Authorization:**
- Purpose: Define what authenticated user can do on which resources
- Examples: `src/abilities/abilities.ts` (AppAbility definition), `src/abilities/authorize.middleware.ts` (enforcement)
- Pattern: Role-based rules + location-based conditions + CASL/Prisma integration

**Custom Errors:**
- Purpose: Typed, HTTP-aware error handling
- Examples: `src/errors/index.ts` (CustomError, NotFoundError, BadRequestError)
- Pattern: Each error has status code, handled by errorHandler middleware

**Response Format:**
- Purpose: Consistent API response structure across all endpoints
- Examples: `src/utils/response.ts` (sendResponse)
- Pattern: {success, message, data, meta(optional)} JSON structure

**ABAC Filter:**
- Purpose: Apply attribute-based filtering at data access layer
- Examples: `src/abilities/authorize.middleware.ts` generates filter, attached to `req.abacFilter`
- Pattern: Non-admin users get location-filtered where clause, admin gets no filter

**Transaction Handler:**
- Purpose: Ensure atomicity for multi-step operations
- Examples: Invoice creation with items, patient updates with phone numbers
- Pattern: `prisma.$transaction()` wrapping model calls

## Entry Points

**Main Application:**
- Location: `src/index.ts`
- Triggers: Node.js process startup (`npm run dev` or `node dist/index.js`)
- Responsibilities: Express app setup, middleware registration, port listening, CORS/helmet setup

**API Gateway:**
- Location: `src/routes/index.route.ts` and `src/routes/v1/index.route.ts`
- Triggers: HTTP requests to `/api/*`
- Responsibilities: Route versioning, endpoint delegation to domain routes

**Route Layer:**
- Location: `src/routes/v1/*.route.ts` (13 domain-specific route files)
- Triggers: Specific HTTP method + path combinations
- Responsibilities: Middleware chain composition (auth → authorization → controller)

## Error Handling

**Strategy:** Multi-layer error interception with transformation and standardization

**Patterns:**

- **Request Validation:** Controllers validate presence and type of required fields, throw `BadRequestError`
- **Authentication Errors:** `verifyAuth` middleware catches invalid/expired tokens, throws `CustomError(401)`
- **Authorization Errors:** `authorize` middleware throws `CustomError(403)` on permission denial
- **Prisma Errors:** Services call `handlePrismaError()` to map database errors:
  - `P2025` (record not found) → `NotFoundError`
  - `P2002` (unique constraint) → Custom message (e.g., "Email already exists")
  - Other → Generic `CustomError`
- **Error Handler Middleware:** `src/middlewares/errorHandler.ts` catches all errors:
  - Extracts status code (default 500)
  - Returns JSON: {success: false, error: {message}}
  - Logs error to console

**Example Error Transformation Chain:**
```
Prisma throws P2025
  ↓
Model passes to service
  ↓
Service calls handlePrismaError({P2025: "Patient not found"})
  ↓
handlePrismaError throws NotFoundError("Patient not found")
  ↓
Controller catch block calls next(error)
  ↓
errorHandler middleware catches, responds with 404 JSON
```

## Cross-Cutting Concerns

**Logging:** 
- Console logging in error handler (`src/middlewares/errorHandler.ts`)
- No structured logging framework; single point at error boundary

**Validation:** 
- Input validation in controllers via field checks
- Type validation via TypeScript (compile-time)
- Schema validation via Zod for role/permission data
- Business logic validation in services (e.g., password verification, available quantity)

**Authentication:** 
- JWT tokens in signed HTTP-only cookies
- Token generated on login via `generateToken(userId)` in `src/utils/auth.ts`
- Verified on each protected request via `verifyAuth` middleware
- User info loaded from database in middleware

**Authorization:** 
- Role-based permissions stored in database
- Permission dependencies resolved via `resolvePermissionDependencies()` in `src/utils/roleMapping.ts`
- CASL ability rules built from permissions in `defineAbilities()` in `src/abilities/abilities.ts`
- Rules applied at route and model query levels

**Database Access:** 
- Centralized Prisma client in `src/config/prisma.client.ts`
- All models import and use this singleton
- Transaction support via `prisma.$transaction()` for atomic operations

---

*Architecture analysis: 2025-01-14*
