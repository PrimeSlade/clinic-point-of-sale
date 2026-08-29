---
id: api-design
name: API Design Skill
description: REST API structure, validation patterns, DTO design, and error handling for Express.js
tags:
  - api-design
  - rest
  - validation
  - zod
  - dto
  - error-handling
  - express
---

# API Design Skill

**Scope**: API design patterns, REST conventions, validation strategies, DTO patterns, and error handling for Express.js TypeScript backends.

## REST Structure & Conventions

### API Versioning

**Current Implementation**: `/api/v1/`

```
http://localhost:3000/api/v1/patients
http://localhost:3000/api/v1/invoices
http://localhost:3000/api/v1/users
```

**Rationale**:

- ✅ Allows backwards-compatible changes (v2 coexists with v1)
- ✅ Clear communication of stability
- ✅ Gradual migration path for clients
- ✅ URL-based versioning is simpler than header versioning

**Pattern**:

```typescript
// src/routes/index.ts
import patientRoutes from "./patient";
import invoiceRoutes from "./invoice";
import userRoutes from "./user";

export const setupRoutes = (app: Express) => {
  const v1Router = express.Router();

  v1Router.use("/patients", patientRoutes);
  v1Router.use("/invoices", invoiceRoutes);
  v1Router.use("/users", userRoutes);

  app.use("/api/v1", v1Router);
};
```

### RESTful Endpoint Structure

#### Resource-Based URLs (Not Action-Based)

**❌ Bad (Action-based, RPC-style)**:

```
GET  /api/v1/getPatient?id=123
POST /api/v1/createPatient
POST /api/v1/updatePatient
POST /api/v1/deletePatient
```

**✅ Good (Resource-based, RESTful)**:

```
GET    /api/v1/patients           # List all patients
POST   /api/v1/patients           # Create new patient
GET    /api/v1/patients/{id}      # Get specific patient
PUT    /api/v1/patients/{id}      # Update patient (full)
PATCH  /api/v1/patients/{id}      # Update patient (partial)
DELETE /api/v1/patients/{id}      # Delete patient
```

#### HTTP Methods & Semantics

| Method     | Semantics         | Idempotent | Safe   | Use Case              |
| ---------- | ----------------- | ---------- | ------ | --------------------- |
| **GET**    | Retrieve          | ✅ Yes     | ✅ Yes | Fetch resource(s)     |
| **POST**   | Create            | ❌ No      | ❌ No  | Create new resource   |
| **PUT**    | Replace           | ✅ Yes     | ❌ No  | Full update (replace) |
| **PATCH**  | Partial Update    | ❌ No      | ❌ No  | Partial update        |
| **DELETE** | Remove            | ✅ Yes     | ❌ No  | Delete resource       |
| **HEAD**   | Like GET, no body | ✅ Yes     | ✅ Yes | Check existence       |

**In this project**:

- Use **POST** for creation
- Use **PUT** for full replacements (rare in this project)
- Use **PATCH** for partial updates (preferred)
- Use **DELETE** for removal

### Resource Nesting (When to Use)

**Flat Structure (Preferred for this project)**:

```
GET  /api/v1/invoices/{invoiceId}
GET  /api/v1/invoice-items/{itemId}
```

**Nested Structure (Use sparingly)**:

```
GET  /api/v1/invoices/{invoiceId}/items        # Get items of specific invoice
POST /api/v1/invoices/{invoiceId}/items        # Add item to invoice
GET  /api/v1/invoices/{invoiceId}/items/{id}   # Get specific invoice item
```

**Rule of thumb**:

- ✅ Nest if: Dependent resource cannot exist without parent (invoice items)
- ❌ Don't nest if: Resource is independently queryable (patients, doctors)
- ❌ Don't nest > 2 levels deep (creates complex URLs)

**Example in this project**:

```typescript
// Good: Invoice items nested under invoices
GET / api / v1 / invoices / { invoiceId } / items;

// Good: Direct access still available
GET / api / v1 / invoice - items;

// Bad: Too deep
GET / api / v1 / invoices / { invoiceId } / items / { itemId } / details;
```

### Query Parameters

**Filtering**:

```
GET /api/v1/invoices?status=paid
GET /api/v1/invoices?status=paid&locationId=1
GET /api/v1/patients?name=John&age_gte=18
```

**Pagination**:

```
GET /api/v1/invoices?page=1&limit=20
GET /api/v1/invoices?offset=40&limit=20
GET /api/v1/invoices?cursor=abc123&limit=20  # Cursor-based (best for large datasets)
```

**Sorting**:

```
GET /api/v1/invoices?sort=date_desc
GET /api/v1/invoices?sort=-date,+amount      # Multiple fields
```

**Searching**:

```
GET /api/v1/invoices?search=INV-001
GET /api/v1/patients?search=John%20Doe
```

**Include/Expand Relations**:

```
GET /api/v1/invoices/{id}?include=items,patient
GET /api/v1/invoices/{id}?expand=items       # Fetch related data
```

---

## Validation Strategy

### Zod-Based Validation (Current Choice)

The project uses **Zod** for runtime validation - TypeScript-first schema validation.

#### Why Zod?

- ✅ TypeScript-first (inferred types from schemas)
- ✅ Composable and reusable schemas
- ✅ Great error messages
- ✅ Minimal bundle size
- ✅ Works in Node.js and browsers

#### Schema Definition Pattern

**Location**: `src/types/` (alongside domain models)

**Example: Patient Creation Schema**

```typescript
// src/types/patient.ts
import { z } from "zod";

export const createPatientSchema = z.object({
  name: z.string().min(2).max(100),
  phoneNumber: z.string().regex(/^09\d{7,9}$/), // Myanmar format
  age: z.number().int().min(0).max(150),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

// Inferred TypeScript types
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
```

#### Validation Middleware Pattern

**Reusable Validation Middleware**:

```typescript
// src/middlewares/validate.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "../errors";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validated = schema.parse(req.body);
      req.body = validated; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        throw new ValidationError("Invalid input", errors);
      }
      throw error;
    }
  };
};

// Export Zod for use in middleware
export { z };
```

#### Usage in Routes

```typescript
// src/routes/patient.ts
import { Router } from "express";
import { validate } from "../middlewares/validate";
import { createPatientSchema } from "../types/patient";
import * as patientController from "../controllers/patient";

const router = Router();

router.post(
  "/",
  validate(createPatientSchema), // Validation middleware
  patientController.createPatient,
);

router.patch(
  "/:id",
  validate(updatePatientSchema),
  patientController.updatePatient,
);

export default router;
```

### Validation Levels

**Level 1: Basic Type Validation**

```typescript
const schema = z.object({
  email: z.string().email(),
  age: z.number().int(),
});
```

**Level 2: Business Logic Validation**

```typescript
const schema = z
  .object({
    email: z
      .string()
      .email()
      .refine(
        async (email) => {
          const exists = await prisma.user.findUnique({ where: { email } });
          return !exists; // Email must not exist
        },
        { message: "Email already in use" },
      ),
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });
```

**Level 3: Database Constraint Validation**

```typescript
// In controller/service after basic validation
const existingPatient = await prisma.patient.findUnique({
  where: { phoneNumber: input.phoneNumber },
});
if (existingPatient) {
  throw new ValidationError("Phone number already registered");
}
```

### Array & Nested Object Validation

```typescript
// Invoice with multiple items
const createInvoiceSchema = z.object({
  patientId: z.string().uuid(),
  items: z
    .array(
      z.object({
        itemId: z.string().uuid(),
        quantity: z.number().int().min(1),
        unitPrice: z.number().positive(),
      }),
    )
    .min(1, "At least one item required"),
  notes: z.string().optional(),
});
```

---

## DTO Patterns

### What is a DTO?

**DTO (Data Transfer Object)** = Plain object that defines request/response structure. Separates internal representation from API contract.

### Pattern: Separate Input/Output DTOs

```typescript
// src/types/patient.ts

// INPUT DTO (what client sends)
export const createPatientSchema = z.object({
  name: z.string(),
  phoneNumber: z.string(),
  age: z.number(),
});
export type CreatePatientDTO = z.infer<typeof createPatientSchema>;

// OUTPUT DTO (what API returns)
export type PatientResponseDTO = {
  id: string;
  name: string;
  phoneNumber: string;
  age: number;
  createdAt: Date;
  locationId: number;
};

// INTERNAL MODEL (database representation)
// Includes sensitive fields, internal flags
export type PatientModel = {
  id: string;
  name: string;
  phoneNumber: string;
  age: number;
  passwordHash?: string; // Never exposed in DTO
  internalNotes?: string; // Never exposed
  createdAt: Date;
  locationId: number;
};
```

### Mapping Between Layers

**Controller → Service → Repository**

```typescript
// src/controllers/patient.ts
export const createPatient = async (req: Request, res: Response) => {
  const input: CreatePatientDTO = req.body; // Already validated by middleware

  const patient = await patientService.create(input);
  const response = toPatientResponseDTO(patient);

  res.status(201).json({
    success: true,
    data: response,
  });
};

// src/services/patient.ts
export const create = async (
  input: CreatePatientDTO,
): Promise<PatientModel> => {
  // Business logic (e.g., check duplicates)
  const patient = await prisma.patient.create({
    data: input,
  });
  return patient;
};

// Helper: Convert model to DTO
const toPatientResponseDTO = (patient: PatientModel): PatientResponseDTO => {
  const { passwordHash, internalNotes, ...response } = patient;
  return response;
};
```

### Common DTO Patterns

#### Pattern 1: Pagination Response

```typescript
export type PaginatedResponseDTO<T> = {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

// Usage
res.json<PaginatedResponseDTO<PatientResponseDTO>>({
  success: true,
  data: patients,
  pagination: { page: 1, limit: 20, total: 100, hasMore: true },
});
```

#### Pattern 2: Nested Relationships

```typescript
export type InvoiceResponseDTO = {
  id: string;
  invoiceNumber: string;
  patient: PatientResponseDTO; // Nested DTO
  items: InvoiceItemResponseDTO[]; // Array of DTOs
  total: number;
  createdAt: Date;
};

// In controller
const invoice = await invoiceService.get(id);
return {
  ...invoice,
  patient: toPatientResponseDTO(invoice.patient),
  items: invoice.items.map(toInvoiceItemResponseDTO),
};
```

#### Pattern 3: Conditional Fields

```typescript
export type PatientResponseDTO = {
  id: string;
  name: string;
  // Only when ?include=details
  details?: {
    totalInvoices: number;
    lastVisit: Date;
    totalSpent: number;
  };
};

// In service
const includeDetails = req.query.include?.includes("details");
return {
  ...patient,
  ...(includeDetails && { details: await getPatientDetails(patient.id) }),
};
```

---

## Error Handling

### Error Hierarchy

**Design custom error classes**:

```typescript
// src/errors/AppError.ts
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Specific error types
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(
    message: string,
    public errors?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(resource: string, id?: string) {
    super(`${resource} not found${id ? `: ${id}` : ""}`);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly isOperational = true;

  constructor(message = "Access denied") {
    super(message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly isOperational = true;

  constructor(message = "Unauthorized") {
    super(message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly isOperational = true;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class InternalServerError extends AppError {
  readonly statusCode = 500;
  readonly isOperational = false; // Unrecoverable

  constructor(message = "Internal server error") {
    super(message);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
```

### Centralized Error Handling Middleware

```typescript
// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError, InternalServerError } from "../errors";

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Log error
  console.error("[ERROR]", {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        ...(error instanceof ValidationError && { errors: error.errors }),
      },
    });
  }

  // Handle unknown errors (never send stack trace to client)
  res.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
    },
  });
};

// Wrapper to catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

### Middleware Order

```typescript
// src/index.ts
import express from "express";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

// 1. Body parsing
app.use(express.json());

// 2. Logging
app.use(loggingMiddleware);

// 3. Security
app.use(helmet());
app.use(cors());

// 4. Authentication
app.use(verifyAuth);

// 5. Routes
app.use("/api/v1", routes);

// 6. 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

// 7. Error handling (MUST be last)
app.use(errorHandler);
```

### Error Response Format

**Consistent Response Format**:

```typescript
// Success Response
{
  "success": true,
  "data": { ... }
}

// Validation Error (400)
{
  "success": false,
  "error": {
    "message": "Invalid input",
    "errors": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "age", "message": "Must be at least 18" }
    ]
  }
}

// Not Found (404)
{
  "success": false,
  "error": {
    "message": "Patient not found: 123"
  }
}

// Forbidden (403)
{
  "success": false,
  "error": {
    "message": "You cannot access this patient's records"
  }
}

// Internal Error (500)
{
  "success": false,
  "error": {
    "message": "Internal server error"
  }
}
```

### Using Errors in Controllers

```typescript
// src/controllers/patient.ts
import { asyncHandler } from "../middlewares/errorHandler";
import { NotFoundError, ValidationError } from "../errors";

export const getPatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const patient = await patientService.getById(id);
  if (!patient) {
    throw new NotFoundError("Patient", id);
  }

  res.json({ success: true, data: toPatientResponseDTO(patient) });
});

export const updatePatient = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = req.body; // Already validated

    const patient = await patientService.getById(id);
    if (!patient) {
      throw new NotFoundError("Patient", id);
    }

    // Business logic validation
    if (input.phoneNumber && input.phoneNumber !== patient.phoneNumber) {
      const exists = await patientService.phoneNumberExists(input.phoneNumber);
      if (exists) {
        throw new ValidationError("Phone number already in use");
      }
    }

    const updated = await patientService.update(id, input);
    res.json({ success: true, data: toPatientResponseDTO(updated) });
  },
);
```

---

## Request/Response Lifecycle

```
Request
  ↓
Body Parser Middleware
  ↓
Logging Middleware
  ↓
Auth Middleware (verifyAuth)
  ↓
Route Matched
  ↓
Validation Middleware (validate schema)
  ↓
Controller
  ├→ Extract data from request
  ├→ Call service layer
  ├→ Map response DTO
  └→ Send response
  ↓
Response Sent
  ↓
[Error caught at any step]
  ↓
Error Handler Middleware
  ├→ Log error
  ├→ Determine status code
  └→ Send error response
```

---

## API Documentation Best Practices

### Document in Code

```typescript
/**
 * GET /api/v1/patients/{id}
 *
 * Retrieve a single patient by ID
 *
 * @param {string} id - Patient ID (UUID)
 * @returns {PatientResponseDTO} Patient object
 *
 * @throws {NotFoundError} 404 - Patient not found
 * @throws {ForbiddenError} 403 - No access to patient's location
 *
 * @example
 * GET /api/v1/patients/abc123
 * Response: { success: true, data: { id: 'abc123', name: 'John' } }
 */
export const getPatient = asyncHandler(async (req: Request, res: Response) => {
  // Implementation
});
```

### Keep API Docs Updated

When changing endpoints:

1. Update TypeScript interfaces (DTOs)
2. Update validation schemas
3. Update JSDoc comments
4. Update OpenAPI/Swagger spec (if used)
5. Communicate breaking changes

---

## Testing API Layer

### Unit Test Pattern

```typescript
// src/controllers/__tests__/patient.test.ts
describe("PatientController", () => {
  describe("getPatient", () => {
    it("should return patient when found", async () => {
      const mockPatient = { id: "123", name: "John" };
      jest.spyOn(patientService, "getById").mockResolvedValue(mockPatient);

      const req = { params: { id: "123" } } as Request;
      const res = { json: jest.fn() } as unknown as Response;

      await patientController.getPatient(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ id: "123" }),
      });
    });

    it("should throw NotFoundError when patient not found", async () => {
      jest.spyOn(patientService, "getById").mockResolvedValue(null);

      const req = { params: { id: "999" } } as Request;
      const res = {} as Response;

      await expect(patientController.getPatient(req, res)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
```

---

## Common Patterns Checklist

When designing API endpoints:

- [ ] Resource-based URLs (not action-based)
- [ ] Correct HTTP methods (GET, POST, PATCH, DELETE)
- [ ] Input validation with Zod
- [ ] Input/Output DTOs separated
- [ ] Centralized error handling
- [ ] Consistent response format
- [ ] Location-based filtering (multi-tenancy)
- [ ] Proper status codes (201 for create, 204 for delete, etc.)
- [ ] Pagination for list endpoints
- [ ] Documented with JSDoc
- [ ] Unit tested
- [ ] No sensitive data in responses
- [ ] Authorization checks (ability.can())

---

## References

- **RESTful API Best Practices**: https://restfulapi.net/
- **HTTP Status Codes**: https://httpwg.org/specs/rfc7231.html#status.codes
- **Zod Documentation**: https://zod.dev/
- **Express Best Practices**: https://expressjs.com/en/advanced/best-practice-security.html
- **API Design Patterns**: https://swagger.io/resources/articles/best-practices-in-api-design/

---

**Last Updated**: March 2026  
**Skill Owner**: Backend Architecture Team  
**Related Files**:

- `src/routes/` - API endpoint definitions
- `src/controllers/` - Request handlers
- `src/services/` - Business logic
- `src/types/` - DTOs and validation schemas
- `src/middlewares/` - Validation and error handling
- `src/errors/` - Error class definitions
