# Coding Conventions

**Analysis Date:** 2025-01-15

## Overview

This codebase follows a **layered, service-oriented architecture** with strong typing via TypeScript. The conventions emphasize separation of concerns (Controller → Service → Model → Database), consistent error handling through custom error classes, and strict type safety with Zod validation.

## Naming Patterns

### Files

**Controllers:**
- Pattern: `{domain}.controller.ts`
- Example: `src/controllers/auth.controller.ts`, `src/controllers/item.controller.ts`
- Each file exports named functions (not classes) for each route handler

**Services:**
- Pattern: `{domain}.service.ts`
- Example: `src/services/auth.service.ts`, `src/services/patient.service.ts`
- Business logic layer between controllers and models

**Models:**
- Pattern: `{domain}.model.ts`
- Example: `src/models/auth.model.ts`, `src/models/item.model.ts`
- Direct database interaction via Prisma

**Types/Interfaces:**
- Pattern: `{domain}.type.ts`
- Example: `src/types/auth.type.ts`, `src/types/item.type.ts`
- Contains domain-specific TypeScript types and exported type unions

**Utilities:**
- Pattern: `{feature}.util.ts` or `{feature}.helper.ts`
- Example: `src/utils/item.util.ts`, `src/utils/age.util.ts`, `src/utils/unit-type.util.ts`
- Pure functions for calculations, transformations, data parsing

**Errors:**
- Pattern: All custom errors in `src/errors/index.ts`
- Prisma-specific errors in `src/errors/prismaHandler.ts`

**Middleware:**
- Pattern: `{purpose}.ts` or `{purpose}.middleware.ts`
- Example: `src/middlewares/errorHandler.ts`, `src/middlewares/verifyAuth.ts`

**Routes:**
- Pattern: `{domain}.route.ts`
- Example: `src/routes/v1/auth.route.ts`, `src/routes/v1/item.route.ts`
- Simple Router with namespaced endpoints

### Functions

**Naming:**
- camelCase for all function names
- Verbs indicate action: `get`, `add`, `update`, `delete`, `find`, `fetch`, `handle`, `validate`, `transform`
- Examples: `login()`, `addItem()`, `getItems()`, `validateItems()`, `handlePrismaError()`

**Async functions:**
- All async operations are clearly marked with `async` keyword
- Promises are handled with try/catch blocks
- Example:
```typescript
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // logic
  } catch (error: any) {
    next(error);
  }
};
```

**Controller functions:**
- Standard signature: `(req: Request, res: Response, next: NextFunction): Promise<void>`
- All route handlers take next parameter for error propagation
- Return type is explicitly `Promise<void>` (don't return response object)

**Service functions:**
- Take domain-specific types/objects as parameters
- Throw custom errors instead of returning error objects
- Return typed results directly

### Variables

- camelCase throughout
- Descriptive names that indicate purpose
- Examples: `loginCredentials`, `itemData`, `userInfo`, `abacFilter`

**Destructuring patterns:**
- Exclude fields with rest operator: `const { password: _, ...userData } = info;`
- Extract query params: `const { offset, limit, search } = req.query;`

### Types and Interfaces

**File suffix:** `.type.ts` (not `.types.ts`)
- Example: `src/types/auth.type.ts`, `src/types/item.type.ts`

**Type exports:**
- Exported as named types: `export type { LoginCredentials, UserForm, UserInfo };`
- Grouped by domain in dedicated type files

**Type patterns:**
- Use `type` keyword (not `interface`) for most domain types
- Use `interface` for third-party extensions (e.g., Express.Request)
- Partial/Optional types use `Partial<>` or optional field marking

**Examples:**
```typescript
type Item = {
  name: string;
  category: string;
  expiryDate: Date;
  locationId: number;
  barcode?: string;
  description?: string;
};

type UpdateItem = Partial<Item>;
```

## Code Style

### Formatting

**Tool:** Prettier v3.6.2
- Config file: `.prettierrc`
- Settings:
  - `semi: true` - Require semicolons at end of statements
  - `singleQuote: false` - Use double quotes

**Example formatted code:**
```typescript
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  signed: true,
};
```

### Linting

**Tool:** ESLint v9.30.0 with TypeScript support
- Config file: `eslint.config.js` (flat config format)
- Extends: `typescript-eslint` recommended rules
- Integration: `eslint-plugin-prettier` for style enforcement

**Key rules enforced:**
- `@typescript-eslint/no-unused-vars` (warn level) - with patterns for ignored vars starting with `_`
- `@typescript-eslint/consistent-type-imports` (warn) - Enforce `import type` for type-only imports
- `@typescript-eslint/no-explicit-any` (warn) - Discourage `any` type
- `prettier/prettier` (warn) - Run prettier as linter rule

**Run commands:**
```bash
npm run lint              # Check for linting issues
```

### TypeScript Configuration

**Target:** ES2022
**Module:** Nodenext (Node.js 16+ ESM compatibility)
**Strict mode:** Enabled
- `strict: true` enforces all strict type checking options
- `esModuleInterop: true` for CommonJS compatibility
- `skipLibCheck: true` to speed up type checking

## Import Organization

### Import Order

**Standard pattern observed:**
1. External packages (Express, utils, etc.)
2. Internal type imports (`import type`)
3. Service/model/utility imports (as namespace or named)
4. Configuration and error classes

**Example from `src/services/auth.service.ts`:**
```typescript
import { LoginCredentials, UserForm } from "../types/auth.type";
import * as authModel from "../models/auth.model";
import { NotFoundError, CustomError } from "../errors";
import { generatePassword, generateToken, verfiyPassword } from "../utils/auth";
import { handlePrismaError } from "../errors/prismaHandler";
```

### Namespace imports

**Pattern:** Import services/models as namespace:
```typescript
import * as authService from "../services/auth.service";
import * as authModel from "../models/auth.model";
```
- Used when exporting multiple related functions
- Prevents naming conflicts
- Makes origin clear

### Named imports

**Pattern:** For utilities and specific exports:
```typescript
import { sendResponse } from "../utils/response";
import { BadRequestError, CustomError } from "../errors";
```

### Type-only imports

**Pattern:** Types and interfaces use `type` keyword:
```typescript
import { type Request, type Response } from "express";
import type { UserInfo } from "../types/auth.type";
```

## Error Handling

### Strategy

**Consistent error throwing approach:**
- Services throw custom error instances
- Controllers catch and pass to `next(error)` middleware
- Global error handler in middleware catches all errors
- No silent failures or error swallowing

**Flow example from `src/services/auth.service.ts`:**
```typescript
const login = async (data: LoginCredentials) => {
  try {
    const info = await authModel.findInfo(data.email);

    if (!info) {
      throw new NotFoundError("Email not found!");
    }

    const valid = await verfiyPassword(data.password, info.password);

    if (!valid) {
      throw new CustomError("Password is incorrect", 401);
    }

    // ... rest of logic
  } catch (error: any) {
    // Pass through known errors
    if (error instanceof CustomError || error instanceof NotFoundError) {
      throw error;
    }
    handlePrismaError(error);
  }
};
```

### Custom Error Classes

**Location:** `src/errors/index.ts`

**Base error:**
```typescript
export class CustomError extends Error {
  status?: number;
  cause?: Error;

  constructor(message: string, status = 500, options?: { cause?: Error }) {
    super(message);
    this.status = status;
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}
```

**Specialized errors:**
```typescript
export class NotFoundError extends Error {
  status?: number;
  constructor(message = "Data not found") {
    super(message);
    this.status = 404;
  }
}

export class BadRequestError extends Error {
  status?: number;
  constructor(message = "Bad Request") {
    super(message);
    this.status = 400;
  }
}
```

**Prisma-specific errors:** `src/errors/prismaHandler.ts`
- Maps Prisma error codes to custom errors with user-friendly messages
- Supports overriding default messages via options object
- Handles: P2000, P2001, P2002, P2003, P2025

**Controller error propagation:**
```typescript
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, user } = await authService.login(data);
    sendResponse(res, 200, "Successfully logged in", user);
  } catch (error: any) {
    next(error);  // Pass to error handler middleware
  }
};
```

### Global Error Handler

**Location:** `src/middlewares/errorHandler.ts`

**Behavior:**
- Extracts status code from error or defaults to 500
- Returns consistent JSON format: `{ success: false, error: { message } }`
- Logs full error for debugging
- Must be last middleware registered

```typescript
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(err);
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: {
      message,
    },
  });
};
```

## Validation

### Validation Tool: Zod

**Pattern:** Define schemas in utility files, use in services/controllers

**Example from `src/utils/validation.ts`:**
```typescript
const itemSchema = z.object({
  name: z.string(),
  barcode: z.uuid().optional(),
  category: z.string(),
  expiryDate: z.date({ message: "Expire date is required" }),
  locationId: z.number({ message: "Please select a valid location" }),
  description: z.string().optional(),
  itemUnits: z
    .array(subUnitSchema)
    .length(3, { message: "You must provide exactly 3 units" }),
});

export const validateItems = (data: ImportItems) => {
  try {
    return itemArraySchema.parse(data);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((issue) => {
          const itemIndex = Number(issue.path[0]) + 1;
          const fieldName = String(issue.path[issue.path.length - 1]);
          return `Item${itemIndex} ${fieldName}: ${issue.message}`;
        })
        .join(", ");
      throw new BadRequestError(errorMessages);
    }
    throw error;
  }
};
```

**Validation placement:**
- Controller-level: Pre-validate request structure
- Service-level: Domain-specific business rule validation
- Type-driven: TypeScript types enforce structure

## Response Format

### Standard Response Utility

**Location:** `src/utils/response.ts`

**Signature:**
```typescript
export const sendResponse = <T>(
  res: Response,
  status: number = 200,
  message: string,
  data: T,
  meta?: CursorMeta | OffsetMeta,
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
  res.status(status).json(response);
};
```

**Response format:**
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... },
  "meta": {
    "hasNextPage": false,
    "page": 1,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

**Error response format:**
```json
{
  "success": false,
  "error": {
    "message": "Human-readable error"
  }
}
```

## Comments and Documentation

### Comment Style

**Inline comments:** Minimal, only for non-obvious logic
- Used sparingly for complex business logic
- Example: `//change string to number`

**JSDoc:** Not widely used
- No function-level JSDoc comments found in codebase
- Rely on TypeScript types for documentation
- Clear function names provide context

**Section comments:**
```typescript
// Exclude password from response
const { password: _, ...userData } = info;

// Admin can search all locations
if (user.role.name.toLowerCase() === "admin" && filter) {
  // logic
}
```

## Function Design

### Size Guidelines

**Observed pattern:** Functions are moderately sized (20-50 lines typical)
- Single responsibility principle respected
- Complex operations broken into utilities
- Example: `src/services/item.service.ts:43-76` (33 lines) for `getItems()`

### Parameters

**Pattern:** Domain-specific object parameters, not scattered primitives
```typescript
// Preferred: object parameter
const getItems = async ({
  offset,
  limit,
  search,
  filter,
  user,
  abacFilter,
}: ItemQueryParams) => {
  // logic
};

// Parameter destructuring pattern
const addItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { item, itemUnits } = req.body;
  // logic
};
```

### Return Values

**Services:**
- Return typed objects directly
- Throw errors instead of returning null/undefined
- Example: `return { token, user: userData };`

**Controllers:**
- Return void (via `sendResponse()`)
- Use status codes and messages for communication

**Models:**
- Return Prisma query results directly
- Example: `return prisma.item.findMany({ ... });`

### Null/Undefined Handling

**Pattern:** Check and throw instead of propagating null
```typescript
if (!info) {
  throw new NotFoundError("Email not found!");
}
```

**Exclusion pattern:** Use underscore for unused destructured values
```typescript
const { password: _, ...userData } = info;
```

## Module Organization

### Barrel Exports

**Not used:** Each file explicitly imports what it needs
- Example: `import * as authService from "../services/auth.service";`
- No index.ts re-exports found in model/service directories

### Module Boundaries

**Clear layer separation:**
- Controllers only call services
- Services only call models (+ utils)
- Models only use Prisma ORM
- Utils have no dependencies on business logic

**Cross-layer access:**
- All layers can access types and errors
- All layers can use utilities
- Reverse dependencies (model → service) strictly prohibited

### Dependency Flow

```
Routes → Controllers → Services → Models → Prisma
         ↓            ↓           ↓         ↓
         └─→ Types, Errors, Utils ←────────┘
         ↓            ↓           ↓
       Middleware   Validation  Auth Utils
```

## Database Interaction

### Prisma Client

**Location:** `src/config/prisma.client.ts` (singleton)
- Imported from generated types: `import { PrismaClient } from "../generated/prisma";`
- Used in all model files via `import prisma from "../config/prisma.client";`

**Query patterns:**
```typescript
// From src/models/auth.model.ts
const findInfo = async (data: string, searchMode: "email" | "id" = "email") => {
  return prisma.user.findUnique({
    where: searchMode === "email" ? { email: data } : { id: data },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });
};
```

**Typed results:** All Prisma operations return fully typed objects
- Generated types in `src/generated/prisma/`
- No manual type casting needed

## Authentication & Authorization

### Token Generation

**Location:** `src/utils/auth.ts`
```typescript
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
};
```

### Password Hashing

**Tool:** bcryptjs v3.0.2
```typescript
const generatePassword = async (password: string): Promise<string> => {
  return bcryptjs.hash(password, 12);
};

const verfiyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcryptjs.compare(password, hashedPassword);
};
```

### Permission Management

**Framework:** CASL (@casl/ability, @casl/prisma)
- Defined in `src/abilities/abilities.ts`
- Middleware: `src/abilities/authorize.middleware.ts`
- Permissions mapped in `src/utils/roleMapping.ts`

## Logging

**Approach:** Minimal, console-based
- Error handler logs full error: `console.log(err);` in `src/middlewares/errorHandler.ts`
- No structured logging or log levels observed
- Environment startup message: `console.log(\`app is listening on port ${port}\`);`

## Configuration

**Environment variables:**
- Loaded via `dotenv` in `src/index.ts`
- No committed `.env` file (in .gitignore)
- Key variables: `PORT`, `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `COOKIE_SECRET`, `FRONT_END_ORIGIN`

**Build output:**
- TypeScript compiled to `dist/` directory
- Build tool: `tsup` v8.5.0
- Config: `tsup.config.ts`

---

*Convention analysis: 2025-01-15*
