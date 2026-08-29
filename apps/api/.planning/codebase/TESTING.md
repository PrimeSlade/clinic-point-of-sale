# Testing Patterns

**Analysis Date:** 2025-01-15

## Current State

**Status:** No automated testing infrastructure detected
- No test files found (`.test.ts`, `.spec.ts`)
- No test framework installed (Jest, Vitest not in dependencies)
- No test configuration files (jest.config.ts, vitest.config.ts)
- No test directories (`__tests__/`, `tests/`)

This document outlines the recommended testing approach based on codebase architecture and dependencies.

## Recommended Test Framework

### Framework Selection

**Recommended:** Vitest or Jest (TypeScript-first)
- Works seamlessly with existing TypeScript setup
- Supports async testing naturally
- Compatible with Express request/response mocking

**Installation (Vitest):**
```bash
npm install --save-dev vitest @vitest/ui
npm install --save-dev @types/node
```

**Installation (Jest):**
```bash
npm install --save-dev jest ts-jest @types/jest
npm install --save-dev jest-mock-extended  # For mocking Prisma
```

### Assertion Library

**Option 1: Built-in (Vitest)**
- Vitest includes assertion library by default

**Option 2: Dedicated**
```bash
npm install --save-dev expect chai
```

## Test File Organization

### Location Strategy

**Pattern: Co-located with source**
```
src/
├── services/
│   ├── auth.service.ts
│   └── auth.service.test.ts        # Test file next to source
├── controllers/
│   ├── auth.controller.ts
│   └── auth.controller.test.ts
├── utils/
│   ├── validation.ts
│   └── validation.test.ts
```

**Rationale:**
- Easy to locate tests for any source file
- Clear relationship between source and test
- Reduces import path complexity

### Naming Convention

**Test file naming:** `{source}.test.ts`
- `auth.service.ts` → `auth.service.test.ts`
- `validation.ts` → `validation.test.ts`

**Test suite naming:** Describe what is being tested
```typescript
describe("AuthService.login", () => {
  // tests
});

describe("validateItems", () => {
  // tests
});
```

## Recommended Test Structure

### Basic Test Suite Pattern

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as authService from "./auth.service";
import * as authModel from "../models/auth.model";
import { CustomError, NotFoundError } from "../errors";

describe("AuthService", () => {
  describe("login", () => {
    it("should return token and user when credentials are valid", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        password: "$2a$12$hashed",
        name: "Test User",
        roleId: 1,
        locationId: 1,
        pricePercent: 0,
        role: { id: 1, name: "Admin", permissions: [] },
      };

      vi.spyOn(authModel, "findInfo").mockResolvedValueOnce(mockUser);

      const result = await authService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe("test@example.com");
      expect(result.user).not.toHaveProperty("password");
    });

    it("should throw NotFoundError when email does not exist", async () => {
      vi.spyOn(authModel, "findInfo").mockResolvedValueOnce(null);

      await expect(
        authService.login({
          email: "nonexistent@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw CustomError when password is incorrect", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        password: "$2a$12$wronghash",
        name: "Test User",
        roleId: 1,
        locationId: 1,
        pricePercent: 0,
        role: { id: 1, name: "Admin", permissions: [] },
      };

      vi.spyOn(authModel, "findInfo").mockResolvedValueOnce(mockUser);

      await expect(
        authService.login({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow(CustomError);
    });
  });
});
```

### Controller Test Pattern

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import * as authController from "./auth.controller";
import * as authService from "../services/auth.service";

describe("AuthController.login", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: Partial<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  it("should set cookie and call sendResponse on successful login", async () => {
    const mockUser = { id: "123", email: "test@example.com", name: "Test" };
    const mockToken = "jwt.token.here";

    vi.spyOn(authService, "login").mockResolvedValueOnce({
      token: mockToken,
      user: mockUser,
    });

    await authController.login(
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction,
    );

    expect(mockResponse.cookie).toHaveBeenCalledWith("posToken", mockToken, expect.any(Object));
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  it("should call next(error) when login fails", async () => {
    const error = new Error("Login failed");
    vi.spyOn(authService, "login").mockRejectedValueOnce(error);

    await authController.login(
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction,
    );

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
```

### Model/Database Layer Test Pattern

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as authModel from "./auth.model";
import prisma from "../config/prisma.client";

vi.mock("../config/prisma.client");

describe("AuthModel", () => {
  describe("findInfo", () => {
    it("should find user by email with role and permissions", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        password: "hashed",
        name: "Test",
        roleId: 1,
        locationId: 1,
        pricePercent: 0,
        role: {
          id: 1,
          name: "Admin",
          permissions: [{ id: 1, name: "read:items" }],
        },
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);

      const result = await authModel.findInfo("test@example.com", "email");

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
      });
    });
  });
});
```

### Utility/Validation Test Pattern

```typescript
import { describe, it, expect } from "vitest";
import { validateItems } from "./validation";
import { BadRequestError } from "../errors";

describe("validateItems", () => {
  it("should validate correct item array", () => {
    const validData = [
      {
        name: "Item 1",
        category: "Category",
        expiryDate: new Date("2025-12-31"),
        locationId: 1,
        barcode: "123e4567-e89b-12d3-a456-426614174000",
        itemUnits: [
          { unitType: "BOX", quantity: 10, purchasePrice: 100, rate: 1 },
          { unitType: "TABLET", quantity: 100, purchasePrice: 10, rate: 10 },
          { unitType: "STRIP", quantity: 500, purchasePrice: 2, rate: 50 },
        ],
      },
    ];

    const result = validateItems(validData);
    expect(result).toBeDefined();
    expect(result[0].name).toBe("Item 1");
  });

  it("should throw BadRequestError when required fields are missing", () => {
    const invalidData = [
      {
        name: "Item 1",
        // Missing category, expiryDate, locationId
        itemUnits: [],
      },
    ];

    expect(() => validateItems(invalidData)).toThrow(BadRequestError);
  });

  it("should throw BadRequestError when itemUnits array length is not 3", () => {
    const invalidData = [
      {
        name: "Item 1",
        category: "Category",
        expiryDate: new Date("2025-12-31"),
        locationId: 1,
        itemUnits: [
          { unitType: "BOX", quantity: 10, purchasePrice: 100, rate: 1 },
          { unitType: "TABLET", quantity: 100, purchasePrice: 10, rate: 10 },
          // Only 2 units instead of 3
        ],
      },
    ];

    expect(() => validateItems(invalidData)).toThrow(BadRequestError);
  });
});
```

## Mocking Strategies

### Mocking Prisma Client

**Using Vitest + vi.mock():**
```typescript
// At top of test file
vi.mock("../config/prisma.client");

// In test
import prisma from "../config/prisma.client";

it("should call prisma correctly", async () => {
  vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
  
  const result = await authModel.findInfo("test@example.com");
  
  expect(prisma.user.findUnique).toHaveBeenCalled();
});
```

**Using jest-mock-extended (Jest):**
```typescript
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import prisma from "../config/prisma.client";

jest.mock("../config/prisma.client");

const prismaMock = prisma as unknown as DeepMockProxy<typeof prisma>;

it("should find user", async () => {
  prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
  
  const result = await authModel.findInfo("test@example.com");
  
  expect(prismaMock.user.findUnique).toHaveBeenCalled();
});
```

### Mocking Services

**In Controller tests:**
```typescript
import * as authService from "../services/auth.service";

vi.spyOn(authService, "login").mockResolvedValueOnce({
  token: "mock-token",
  user: mockUser,
});
```

**What to mock:**
- Prisma queries (database)
- Third-party APIs (JWT, bcrypt verification)
- External services
- Time-dependent operations (dates)

**What NOT to mock:**
- Pure utility functions (`calculateAge()`, `sortUnits()`)
- Validation logic
- Error handling logic
- Business calculations

## Fixture and Factory Patterns

### Mock Data Factories

**Create reusable test data:**

```typescript
// fixtures/user.fixture.ts
export const createMockUser = (overrides = {}) => {
  return {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    password: "$2a$12$hashed",
    locationId: 1,
    roleId: 1,
    pricePercent: 0,
    role: {
      id: 1,
      name: "Admin",
      permissions: [],
    },
    ...overrides,
  };
};

// Usage in tests
import { createMockUser } from "../fixtures/user.fixture";

it("should handle admin user", async () => {
  const adminUser = createMockUser({ role: { name: "Admin" } });
  // test with admin
});
```

**Fixture directory structure:**
```
src/
├── __fixtures__/
│   ├── user.fixture.ts
│   ├── item.fixture.ts
│   ├── auth.fixture.ts
│   └── prisma.fixture.ts
```

### Test Data Builders

```typescript
// Test data builder for complex objects
export class ItemBuilder {
  private item = {
    name: "Test Item",
    category: "Category",
    expiryDate: new Date("2025-12-31"),
    locationId: 1,
    barcode: "123e4567-e89b-12d3-a456-426614174000",
  };

  withName(name: string): this {
    this.item.name = name;
    return this;
  }

  withLocationId(id: number): this {
    this.item.locationId = id;
    return this;
  }

  build() {
    return this.item;
  }
}

// Usage
it("should handle multiple locations", async () => {
  const item1 = new ItemBuilder().withLocationId(1).build();
  const item2 = new ItemBuilder().withLocationId(2).build();
  
  // test with different locations
});
```

## Test Coverage Areas

### Unit Tests (Per Service/Model/Utility)

**Target:** Increase from 0% to minimum 60-70%

**Priority 1: Critical Business Logic**

1. **Authentication Service** (`src/services/auth.service.ts`)
   - login() - Valid/invalid credentials, token generation
   - signup() - Email validation, duplicate email handling
   - findInfo() - Token verification, user not found

2. **Item Service** (`src/services/item.service.ts`)
   - addItem() - Item creation with units
   - getItems() - Filtering, pagination, search
   - validateItems() - Zod schema validation

3. **Invoice Service** (`src/services/invoice.service.ts`)
   - Complex calculations for invoice totals
   - Item stock management
   - Tax calculations

**Priority 2: Error Handling**

1. **Error Classes** (`src/errors/index.ts`)
   - CustomError construction with status
   - NotFoundError default status
   - BadRequestError instantiation

2. **Prisma Error Handler** (`src/errors/prismaHandler.ts`)
   - P2002 (unique constraint)
   - P2025 (record not found)
   - Custom message overrides

3. **Middleware Errors** (`src/middlewares/errorHandler.ts`)
   - Error status extraction
   - Response format consistency

**Priority 3: Validation**

1. **Zod Schemas** (`src/utils/validation.ts`)
   - itemSchema validation
   - Error message formatting
   - Array length constraints

2. **Utility Validators** (`src/utils/item.util.ts`)
   - Excel file validation
   - Data transformation
   - Header verification

### Integration Tests

**Scope: Service + Model + Database interactions**

**Test cases:**
```typescript
describe("AuthService (Integration)", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = new PrismaClient();
    await db.$connect();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it("should create user and login successfully", async () => {
    // 1. Create user via service
    // 2. Verify in database
    // 3. Login with created user
    // 4. Verify token and response
  });
});
```

### Controller Layer Tests

**Scope: Request parsing → Service calling → Response formatting**

**Test cases:**
- Valid request → Correct service call → Proper response
- Invalid request → BadRequestError handling
- Service error → Error middleware handling
- Cookie setting (for auth)
- Status code correctness

### Error Handling Tests

**All custom errors must be tested:**
```typescript
describe("Error Classes", () => {
  it("CustomError should set status", () => {
    const error = new CustomError("Test", 409);
    expect(error.status).toBe(409);
  });

  it("NotFoundError should default to 404", () => {
    const error = new NotFoundError();
    expect(error.status).toBe(404);
  });

  it("BadRequestError should default to 400", () => {
    const error = new BadRequestError();
    expect(error.status).toBe(400);
  });
});
```

## Test Execution

### Recommended Commands

```bash
# Run all tests
npm run test

# Watch mode for development
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- auth.service.test.ts

# Run tests matching pattern
npm run test -- --grep "should throw"
```

### Package.json Scripts

**Recommended additions:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Coverage Goals

### Targets by Layer

| Layer | Target | Current | Priority |
|-------|--------|---------|----------|
| Services | 80% | 0% | High |
| Models | 70% | 0% | High |
| Utils | 85% | 0% | High |
| Controllers | 60% | 0% | Medium |
| Errors | 90% | 0% | High |
| Middleware | 50% | 0% | Medium |
| **Overall** | **70%** | **0%** | **High** |

### Coverage Gaps (Current)

**Untested areas:**
- All service layer functions
- All model queries
- All validation logic
- Error handling paths
- Middleware authentication flow
- Authorization (CASL) integration

### Coverage Reporting

**Enable coverage tracking:**
```bash
npm run test:coverage
```

**Report output:**
```
File                    Statements  Branches  Functions  Lines
────────────────────────────────────────────────────────────
All files                   0%       0%        0%        0%

src/services/
  auth.service.ts           0%       0%        0%        0%
  item.service.ts           0%       0%        0%        0%

src/utils/
  validation.ts             0%       0%        0%        0%
  response.ts               0%       0%        0%        0%
```

## Test Configuration

### Vitest Configuration

**Create `vitest.config.ts`:**
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/generated/",
        "**/*.d.ts",
        "**/*.config.ts",
      ],
    },
    testTimeout: 10000,
  },
});
```

**Install coverage provider:**
```bash
npm install --save-dev @vitest/coverage-v8
```

## Test Execution Patterns

### Async Testing

**Pattern for async functions:**
```typescript
it("should handle async operations", async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

// With error handling
it("should reject on error", async () => {
  await expect(asyncFunction()).rejects.toThrow(CustomError);
});
```

### Error Testing

**Pattern for thrown errors:**
```typescript
it("should throw NotFoundError when user not found", async () => {
  await expect(userService.getById("nonexistent")).rejects.toThrow(
    NotFoundError,
  );
});

// Verify specific error properties
it("should throw with correct status code", async () => {
  try {
    await authService.login({
      email: "test@example.com",
      password: "wrong",
    });
  } catch (error) {
    expect(error).toBeInstanceOf(CustomError);
    expect((error as CustomError).status).toBe(401);
  }
});
```

### Setup and Teardown

**Pattern with Prisma database:**
```typescript
describe("AuthService Integration", () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create test data
    const user = await prisma.user.create({
      data: { ... },
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    // Cleanup test data
    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  it("test case", () => {
    // Use testUserId
  });
});
```

## Quality Gates

### Pre-commit Checks

**Recommended:** Add linting before tests
```bash
npm run lint           # ESLint
npm run test           # Unit tests
```

### CI/CD Pipeline Requirements

**Recommended GitHub Actions:**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run test:coverage
```

### Coverage Enforcement

**Minimum requirements:**
- No PR merges without tests
- Coverage must not decrease
- 70% overall coverage minimum
- 90% for critical paths (auth, errors)

## Test Maintenance

### Updating Tests

**When code changes:**
1. Update tests before modifying implementation (TDD)
2. Update tests after implementation changes
3. Ensure error tests still validate correct behavior
4. Verify mock expectations match new code

### Test Deprecation

**Removing tests:**
- Mark obsolete tests with `it.skip()`
- Document reason in comment
- Remove completely in cleanup PR
- Never commit skipped tests

---

*Testing analysis: 2025-01-15*
