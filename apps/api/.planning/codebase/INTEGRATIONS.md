# External Integrations

**Analysis Date:** 2024-12-19

## APIs & External Services

**None Currently Integrated:**
- This application is self-contained with no third-party API integrations
- No external SaaS services, payment gateways, or cloud APIs detected
- All business logic is handled internally

## Data Storage

**Primary Database:**
- PostgreSQL 16.3
  - Connection: `DATABASE_URL` environment variable
  - Format: `postgresql://[user]:[password]@[host]:[port]/[database]`
  - Docker service: `postgres` in `docker-compose.yml`
  - Client: Prisma ORM 6.18.0 with @prisma/client
  - Schema file: `prisma/schema.prisma`
  - Generated client output: `src/generated/prisma/`
  - Migrations: `prisma/migrations/` (Prisma-managed)

**File Storage:**
- Local filesystem only
- In-memory buffer storage via Multer:
  - Configuration: `src/routes/v1/item.route.ts` (multer.memoryStorage())
  - No persistent disk writes for uploads
  - File processing: `src/services/item.service.ts` - importItem method
  - Supported format: Excel files (.xlsx, .xls)
  - Files not archived or persisted after processing

**Caching:**
- None - No caching layer (Redis, Memcached) integrated
- Database queries execute directly via Prisma ORM

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based authentication (no external auth service)
  - Implementation: `src/utils/auth.ts`
  - JWT token generation: `generateToken(userId)` - 7-day expiration
  - JWT token verification: `verifyToken(token)`
  - Secret key: `JWT_SECRET` environment variable

**Session Management:**
- Signed HTTP cookies
  - Cookie name: `posToken` (inferred from `req.signedCookies.posToken` in `src/middlewares/verifyAuth.ts`)
  - Secret: `COOKIE_SECRET` environment variable
  - Parser: cookie-parser middleware in `src/index.ts`
  - Credentials enabled for cross-origin requests

**Authorization:**
- Attribute-Based Access Control (ABAC) via CASL
  - Abilities definition: `src/abilities/abilities.ts`
  - Prisma-enabled filtering: @casl/prisma 1.5.2
  - Role mapping: `src/utils/roleMapping.ts`
  - Authorization middleware: `src/abilities/authorize.middleware.ts`
  - Permission verification: Applied to all protected routes in `src/routes/v1/`

**User Model:**
- Database model: `prisma/schema.prisma` - User table
- Fields: id (UUID), name, email (unique), password (bcrypt hashed), role, location, price_percent
- Password hashing: bcryptjs with 12 salt rounds
- Password verification: `verfiyPassword()` in `src/utils/auth.ts`

## Monitoring & Observability

**Error Tracking:**
- None - No error monitoring service integrated
- Local error logging via console output
- Error handler: `src/middlewares/errorHandler.ts` - logs to console, returns JSON error responses

**Logs:**
- Console-based logging
  - Server startup: `console.log()` in `src/index.ts`
  - Error logging: `src/middlewares/errorHandler.ts` logs exceptions
  - No centralized logging service or aggregation

**Health Checks:**
- Basic health endpoint: `GET /api` returns status + version
  - Implementation: `src/index.ts`
  - Response: `{ success: true, version: "v1", message: "Hello from API v1 🧪" }`

## CI/CD & Deployment

**Hosting:**
- Docker containerization provided
  - Build file: `Dockerfile` (Node 24 Alpine base)
  - Compose file: `docker-compose.yml` (App + PostgreSQL)
  - No cloud platform directly targeted (AWS, GCP, Azure, etc.)
  - Manual deployment to any Docker-compatible environment

**CI Pipeline:**
- GitHub Actions directory present: `.github/` directory exists
  - Specific workflows: Not examined in detail
  - Build likely triggered on push/PR

**CircleCI:**
- Configuration directory present: `.circleci/` directory exists
  - Setup suggests CircleCI integration available
  - Configuration details: Not analyzed

**Database Management:**
- Prisma migrations: `prisma/migrations/`
- Schema management: `prisma/schema.prisma`
- Seeding: Multiple seed files:
  - `prisma/seeds/seed.ts` - Main seed
  - `prisma/seeds/permissions.seed.ts` - RBAC setup
  - `prisma/seeds/user.seed.ts` - Default users
  - `prisma/seeds/data.seed.ts` - Sample data
- Prisma Studio: Available on port 5555 in Docker

## Environment Configuration

**Required Environment Variables:**

Core Application:
- `PORT` - HTTP server port (e.g., 3000)
- `NODE_ENV` - Environment mode (development/production)
- `FRONT_END_ORIGIN` - CORS whitelist origin (e.g., http://localhost:3000)

Database:
- `DATABASE_URL` - PostgreSQL connection string
  - Format: `postgresql://[user]:[password]@localhost:5432/[dbname]`
- `DB_USER` - PostgreSQL username (Docker compose)
- `DB_PASSWORD` - PostgreSQL password (Docker compose)
- `DB_NAME` - PostgreSQL database name (Docker compose)

Security:
- `JWT_SECRET` - Secret key for JWT signing
  - Recommended: Min 32 characters, cryptographically random
  - Expiration: 7 days per token config
- `COOKIE_SECRET` - Secret for cookie encryption
  - Recommended: Min 32 characters, cryptographically random

**Secrets Location:**
- `.env` file - Must be created locally (listed in `.gitignore`)
- Docker environment: Via `docker-compose.yml` environment section
- Production: Environment variables in deployment platform (Heroku, AWS, etc.)

**Configuration Loading:**
- dotenv package 17.0.1 loads `.env` in `src/index.ts`
- Order: Environment variables → .env file fallback

## Webhooks & Callbacks

**Incoming Webhooks:**
- None detected - Application does not expose webhook endpoints

**Outgoing Webhooks:**
- None detected - Application does not call external webhooks

**Export Functionality:**
- Item export (not webhook):
  - Endpoint: `GET /api/v1/items/export`
  - Format: Excel file download
  - Implementation: `src/services/item.service.ts` - exportItem()
  - Returns: Workbook stream with item data

## Data Models & Relationships

**Core Entities:**
- Location - Medical clinic/pharmacy branches
- User - Staff members with roles and permissions
- Role - Access control roles (Admin, Doctor, Receptionist, etc.)
- Permission - Granular actions (read, create, update, delete, manage)

**Clinical Data:**
- Patient - Medical patient records
- Doctor - Medical professionals
- Treatment - Patient treatment records
- PhoneNumber - Shared contact information

**Financial & Inventory:**
- Item - Medicinal items/inventory
- ItemUnit - Units of measure with purchase prices
- Invoice - Financial transactions
- InvoiceItem - Line items on invoices
- InvoiceService - Services rendered
- Expense - Operational expenses
- Service - Medical services provided

**Audit & History:**
- ItemHistory - Tracks changes to inventory
- ItemHistoryDetail - Granular change details (quantity, price, unit type)
- HistoryAction enum: edit, import

**Business Enums:**
- UnitType: btl, amp, tube, strip, cap, pcs, sac, box, pkg, tab
- PaymentMethod: kpay, wave, cash, others
- PatientStatus: new_patient, follow_up, post_op
- Department: og (OB/GYN), oto (ENT), surgery, general
- PatientType: in (inpatient), out (outpatient)
- Gender: male, female

---

*Integration audit: 2024-12-19*
