# Point-Of-Sale Backend

## What This Is

A comprehensive backend system for managing medical clinics and pharmacies, built with Express.js and Prisma. It handles patient records, inventory management, medical services, invoicing, expenses, and multi-location support with JWT authentication and attribute-based access control (ABAC).

## Core Value

Accurate audit trail and inventory tracking across all operations — every change must be recorded and reversible.

## Requirements

### Validated

- ✓ Patient record management with location-based filtering
- ✓ Doctor profile management
- ✓ Inventory tracking with multiple unit types and expiry management
- ✓ Medical services catalog with dynamic pricing
- ✓ Invoicing system with automatic inventory adjustment
- ✓ Expense management with detailed categorization
- ✓ Multi-location support with branch management
- ✓ JWT authentication with attribute-based access control (ABAC)
- ✓ Single item update with history tracking via `addItemHistory()`
- ✓ Excel import/export capabilities for bulk operations

### Active

- [ ] **Item history tracking for bulk Excel imports** — Extend existing `addItemHistory()` to track changes for each item during bulk imports, only recording history when items actually change (determined by `markIsChangedUnit()`)

### Out of Scope

- Audit trail for all operations (noted as missing feature but not in current scope)
- Soft deletes for historical preservation (future enhancement)
- Correlation IDs for request tracing (future enhancement)

## Context

This is a brownfield project with an existing layered MVC architecture. The codebase has:

- **13 domain-specific modules** (Patient, Doctor, Service, Item, Invoice, etc.) each with routes → controllers → services → models
- **Middleware layer** for authentication and authorization using CASL
- **No test coverage** (0% — identified as critical gap)
- **Transaction support** for complex operations like invoicing
- **Known technical debt**: Silent failures in some error paths, decimal precision issues, missing validation in Excel parsing, N+1 query patterns, fragile unit conversion logic
- **Performance concerns**: Offset pagination (no cursor), no query result caching, missing database indexes, unstreamed large imports

The item history feature is already implemented for single item updates but needs to be extended to work with bulk Excel imports while maintaining transactional integrity.

## Constraints

- **Tech Stack**: TypeScript, Express 5.1.0, Prisma 6.18.0, PostgreSQL 16.3
- **Database**: PostgreSQL with Prisma ORM; migrations managed via Prisma tools
- **API Response Format**: Standardized via existing `sendResponse()` utility
- **Error Handling**: Custom error classes (ValidationError, NotFoundError, ForbiddenError, etc.) in `src/errors/`
- **Validation**: Zod for runtime validation of request payloads
- **Authorization**: CASL-based ABAC with location-based multi-tenancy
- **Transactions**: All operations affecting multiple tables must use `prisma.$transaction()`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| History tracking as part of bulk import transaction | Ensures data consistency — all items imported and all history recorded atomically; if any history fails, entire import rolls back | ✓ Implemented intent |
| Reuse existing `addItemHistory()` function | Consistent history recording logic across single and bulk operations; leverages already-tested code | — Pending |
| Use `markIsChangedUnit()` to detect actual changes | Only record history for items that actually changed; reduces noise and storage; matches single-item behavior | — Pending |

---
*Last updated: 2026-03-19 after initialization*
