# Codebase Concerns

**Analysis Date:** 2025-01-17

## Tech Debt

### Silent Item Skipping in Invoice Operations
- **Issue:** When an invoice is created/deleted, if a barcode item is not found in the database, the code silently continues instead of failing
- **Files:** `src/utils/invoice.operations.ts` (lines 88-92)
- **Impact:** Invoice transactions can silently succeed despite missing inventory items, leading to inaccurate inventory counts and financial discrepancies. Users won't know some items weren't properly adjusted.
- **Fix approach:** Replace the `continue` statement with an error throw. Either validate all items exist before processing, or maintain a list of skipped items to return to the caller. Current commented-out error should be uncommented: `throw new BadRequestError(...)`

### Decimal Precision Loss via toNumber()
- **Issue:** All financial calculations convert Prisma Decimal to JavaScript number using `.toNumber()`, losing precision for large values
- **Files:** 
  - `src/services/invoice.service.ts` (multiple lines: 66-73, 93-100, 126-134)
  - `src/services/item.service.ts` (multiple lines: 67, 89, 117, 222, 298-299)
- **Impact:** Financial rounding errors accumulate, especially problematic for invoicing systems. JavaScript numbers lose precision beyond 15-16 significant digits.
- **Fix approach:** Keep Decimal in transit until JSON serialization. Create a utility function for safe Decimal→string→number conversion with explicit rounding rules. Or consider using BigInt library for exact decimal arithmetic.

### Math.floor() Used for Quantity Rounding
- **Issue:** Unit conversion calculations use `Math.floor()` which silently truncates fractional quantities
- **Files:** `src/utils/invoice.operations.ts` (lines 27-29, 37-39)
- **Impact:** Unit conversion data loss. If converting from smaller to larger units results in fractional amounts, precision is lost without warning. Can cause inventory mismatches.
- **Fix approach:** Implement configurable rounding strategy (round, truncate, throw on remainder). Add validation to detect and reject fractional unit conversions that would lose data.

### Missing Return Values in Error Handlers
- **Issue:** Service functions don't consistently return after calling `handlePrismaError()` - handlers throw but callers may expect a return value
- **Files:** 
  - `src/services/invoice.service.ts` (lines 38, 79, 106, 139, 162)
  - `src/services/item.service.ts` (lines 39, 74, 97, 140, 150)
- **Impact:** Type system can't guarantee function returns. While exceptions prevent actual undefined returns, TypeScript doesn't guarantee this at compile time. Fragile error flow.
- **Fix approach:** Mark all service functions with `Promise<Type | never>` return type to document that error paths throw. Or explicitly return never from error handlers.

### Error Handler Logging Too Verbose
- **Issue:** Error handler logs full error object to console without structured logging
- **Files:** `src/middlewares/errorHandler.ts` (line 13)
- **Impact:** In production, sensitive data (stack traces, internal paths) exposed in logs. No log aggregation or filtering capability.
- **Fix approach:** Replace `console.log(err)` with structured logging (Winston, Pino). Log only error code/message in production, full trace only in dev environment.

## Known Bugs

### Invalid Role Comparison Pattern
- **Issue:** Role checking uses `user.role.name.toLowerCase() === "admin"` string comparison which is case-sensitive and fragile
- **Files:** 
  - `src/models/item.model.ts` (line 60)
  - `src/models/expense.model.ts` (line 53)
  - `src/models/invoice.model.ts` (line 81)
  - `src/models/treatment.model.ts` (line 173)
- **Impact:** If database stores roles as "Admin" instead of "admin", authorization fails silently and users don't get admin features. Multiple code locations checking same pattern increases bug surface.
- **Fix approach:** Normalize role names in database layer or create role comparison helper function. Consider enum-based role checking instead of strings. Centralize in `roleMapping.ts` utility.

### Unvalidated Number Parsing in Controllers
- **Issue:** Controllers use `Number(req.params.id)` and `Number(req.query.page)` without validating the result (NaN check)
- **Files:** Over 33 instances across all controllers
- **Impact:** Passing `NaN` to database queries silently fails or returns wrong results. e.g., `/items/abc` converts to `NaN` and query behavior is undefined.
- **Fix approach:** Create validation middleware that coerces and validates numeric params/query values. Or use Zod/validation library for all route parameters. Add tests for invalid ID formats.

## Security Considerations

### Cookie Secret Configuration Not Validated
- **Issue:** `process.env.COOKIE_SECRET` used without validation that it exists and has sufficient length
- **Files:** `src/index.ts` (line 23)
- **Impact:** If COOKIE_SECRET is missing or too short, signed cookies aren't properly secure. Could allow cookie tampering.
- **Fix approach:** Add startup validation in config module checking required env vars exist and meet minimum requirements. Fail early with clear error message.

### CORS Origin Hardcoded from Env
- **Issue:** CORS origin comes directly from `process.env.FRONT_END_ORIGIN` without validation
- **Files:** `src/index.ts` (lines 16-20)
- **Impact:** If env var is misconfigured, CORS could allow unintended origins or block valid ones. No fallback if env var missing.
- **Fix approach:** Validate CORS origin is a valid URL. Provide sensible default for development. Document required format.

### Token Expiration Not Explicit
- **Issue:** `verifyAuth` middleware catches all errors as "Invalid or expired token" without distinguishing between token expiration vs malformed/signature issues
- **Files:** `src/middlewares/verifyAuth.ts` (lines 27-29)
- **Impact:** Frontend can't differentiate between token needing refresh vs being corrupted. User experience suffers - unclear if they should retry or re-login.
- **Fix approach:** Let specific JWT errors propagate (ExpiredSignatureError, JsonWebTokenError) and handle in error handler with different status codes (401 for expired, 403 for invalid).

### No Rate Limiting on Endpoints
- **Issue:** No rate limiting middleware detected on any endpoints
- **Files:** All controller files
- **Impact:** System vulnerable to brute force attacks on login, inventory operations. Inventory adjustments could be weaponized for DoS.
- **Fix approach:** Add express-rate-limit middleware. Configure stricter limits on auth endpoints, moderate limits on mutation endpoints.

## Performance Bottlenecks

### Decimal Parsing in Every Response
- **Issue:** Every service response iterates over objects to manually convert Decimal → number on every API call
- **Files:** `src/services/invoice.service.ts`, `src/services/item.service.ts`
- **Impact:** Response mapping is O(n) overhead for every paginated result. With large invoice lists, noticeable latency.
- **Fix approach:** Use Prisma select/map capabilities or create response interceptor middleware that auto-converts Decimal in JSON serialization. Avoid manual mapping.

### Missing Database Indexes for Search Operations
- **Issue:** Search operations use `contains` on fields without verification indexes exist
- **Files:** `src/models/item.model.ts` (lines 50-56), `src/models/invoice.model.ts` (lines 59-77)
- **Impact:** Full table scans for search queries. Performance degrades linearly with data volume.
- **Fix approach:** Add Prisma indexes on searchable fields (item.name, item.category, treatment.patient.name). Verify with EXPLAIN ANALYZE.

### Inefficient N+1 Potential in Item Unit Lookups
- **Issue:** `adjustUnitAmount()` loops through items and calls `getItemByBarcode()` for each, potentially N+1 queries
- **Files:** `src/utils/invoice.operations.ts` (lines 85-86)
- **Impact:** Creating invoice with 10 items requires 10 separate queries instead of 1 batch fetch.
- **Fix approach:** Batch load all barcodes upfront: `getItemsByBarcodes(uniqueBarcodeIds)` instead of loop. Significantly improves invoice creation time.

### Excel Import Processing Without Streaming
- **Issue:** Entire Excel file loaded into memory and processed synchronously
- **Files:** `src/services/item.service.ts` (lines 154-200)
- **Impact:** Large Excel files (>100MB) cause memory spikes and timeout. No progress indication for user.
- **Fix approach:** Implement streaming Excel parser with progress callback. Process rows in chunks with database batching (e.g., 100 rows at a time).

## Fragile Areas

### Invoice Transaction Without Rollback on Side Effects
- **Issue:** `createInvoice` uses transaction for database ops but external side effects (file uploads, external API calls) aren't transactional
- **Files:** `src/services/invoice.service.ts` (lines 14-31)
- **Impact:** If invoice saves successfully but downstream process fails, database is committed but external state is inconsistent. No automatic cleanup.
- **Fix approach:** Move external side effects outside transaction. Implement saga pattern or event sourcing for long-running operations. Add cleanup handlers.

### Item Unit Quantity Recalculation Algorithm Fragile
- **Issue:** `recalculateRelatedUnits()` mutates array indices based on position logic that's hard to verify
- **Files:** `src/utils/invoice.operations.ts` (lines 15-43)
- **Impact:** Complex nested loops with subtle cascade effects. Easy to introduce bugs when modifying. Hard to test all edge cases.
- **Fix approach:** Refactor to immutable transformations or create lookup map instead of position-based logic. Add comprehensive unit tests for all unit conversion paths (up, down, middle). Document algorithm with examples.

### Excel File Format Validation Minimal
- **Issue:** `validateFile()` checks worksheet exists but doesn't validate column structure or data types
- **Files:** `src/services/item.service.ts` (lines 161-166), `src/utils/item.util.ts`
- **Impact:** Silently skips rows with wrong format or creates invalid records. No feedback to user about which rows failed.
- **Fix approach:** Validate all required columns exist. Pre-scan entire file and report all errors before starting import. Create detailed error report with row numbers.

### No Atomic Rate Adjustments Across Multiple Units
- **Issue:** When one unit type update fails mid-transaction, related units may already be updated
- **Files:** `src/utils/invoice.operations.ts` (lines 110-132)
- **Impact:** Inventory becomes inconsistent if operation partially completes. Cannot easily restore state.
- **Fix approach:** Ensure entire unit adjustment happens in single transaction. Pre-validate all units will succeed before starting mutations.

## Scaling Limits

### Pagination Offset-Based Only
- **Issue:** All queries use offset-based pagination (`skip`/`take`)
- **Files:** Multiple model files use offset pagination
- **Impact:** Pagination degrades as datasets grow. Offset 10000 requires scanning 10000 rows. Real-time data shifts cause duplicate/missing results.
- **Fix approach:** Implement cursor-based pagination for large result sets. Use indexed columns for cursor values.

### No Caching Layer
- **Issue:** Every read query hits database, no caching of frequently accessed data (items, roles, locations)
- **Files:** All model files
- **Impact:** Database load increases linearly with users. Report queries full-scan without cache.
- **Fix approach:** Add Redis caching with TTL for reference data (items, categories, roles). Cache invalidation on mutations.

### Missing Connection Pool Tuning
- **Issue:** No evidence of Prisma connection pool configuration
- **Files:** `src/config/prisma.client.ts`
- **Impact:** Under high concurrency, connection pool exhaustion causes request queueing/failures.
- **Fix approach:** Configure Prisma connection pool size appropriately for load. Monitor connection utilization.

## Dependencies at Risk

### ExcelJS Large Bundle Size
- **Issue:** ExcelJS is large dependency loaded on every import
- **Files:** `src/services/item.service.ts` (line 2)
- **Impact:** Increases bundle size. Import is top-level, so loaded even for non-import operations.
- **Fix approach:** Lazy load ExcelJS only when import endpoint called. Consider lighter alternatives like `simple-xlsx` or `xlsx` if performance critical.

### No GraphQL or API Versioning
- **Issue:** REST API with no versioning strategy, endpoints tightly coupled to current schema
- **Files:** All routes
- **Impact:** Changing response format breaks existing clients. No clear migration path for breaking changes.
- **Fix approach:** Add API version to routes `/api/v1/...`. Implement deprecation warnings. Plan v2 with schema flexibility.

### Zod Validation Not Used Consistently
- **Issue:** Validation library is imported but used selectively, many endpoints missing validation
- **Files:** `src/utils/validation.ts` vs controller files
- **Impact:** Inconsistent data validation. Some endpoints accept invalid data. Hard to find validation rules.
- **Fix approach:** Create validation middleware that auto-validates all request bodies/params with Zod schemas.

## Missing Critical Features

### No Audit Trail
- **Issue:** No tracking of who created/modified/deleted records
- **Files:** All models lack audit fields
- **Impact:** Can't trace financial changes for compliance. Difficult to debug data corruption.
- **Fix approach:** Add `createdBy`, `updatedBy`, `deletedBy`, `createdAt`, `updatedAt` to all critical tables. Log to audit table.

### No Soft Deletes
- **Issue:** Hard deletes remove records permanently with no recovery
- **Files:** All delete operations
- **Impact:** Accidental deletions cause data loss. Financial records deleted are unrecoverable.
- **Fix approach:** Implement soft deletes with `deletedAt` timestamp. Restore deleted records from backups only as last resort.

### No Request Correlation IDs
- **Issue:** No way to trace request flow through system
- **Files:** No middleware assigning request IDs
- **Impact:** Debugging distributed issues impossible. Can't correlate logs across services.
- **Fix approach:** Add correlation ID middleware that generates/passes X-Request-ID through system. Include in all logs.

## Test Coverage Gaps

### Missing Error Case Testing
- **Issue:** No evidence of test suite, likely no tests for error paths
- **Files:** No test files found
- **Risk:** Error handlers untested. Dead code paths in error scenarios.
- **Priority:** High - Financial software MUST test all error paths

### Invoice Transaction Rollback Not Tested
- **Issue:** If `adjustUnitAmount()` throws mid-transaction, unclear if database rolled back
- **Files:** `src/services/invoice.service.ts` (lines 14-31)
- **Risk:** Transaction inconsistency bugs silently pass through without detection
- **Priority:** Critical - Inventory corruption risk

### Invalid Input Not Tested
- **Issue:** Controllers accept NaN, undefined, negative values without validation tests
- **Files:** All controllers
- **Risk:** Malformed requests cause crashes or wrong behavior
- **Priority:** High - Security and stability risk

### Unit Conversion Edge Cases
- **Issue:** Edge cases like fractional conversions, zero quantities, missing unit types
- **Files:** `src/utils/invoice.operations.ts`, `src/services/item.service.ts`
- **Risk:** Uncommon but possible data states cause crashes
- **Priority:** Medium - Affects data integrity

### Authorization Edge Cases
- **Issue:** Role-based access control edge cases (missing role, null user, admin override)
- **Files:** All models with role checks
- **Risk:** Security bypass or incorrect access denial
- **Priority:** Critical - Security risk

---

*Concerns audit: 2025-01-17*
