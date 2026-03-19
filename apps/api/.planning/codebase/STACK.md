# Technology Stack

**Analysis Date:** 2024-12-19

## Languages

**Primary:**
- TypeScript 5.8.3 - All source code and configuration files in `src/`

**Transpilation:**
- ECMAScript 2022 target with Node.js module resolution (`tsconfig.json`)

## Runtime

**Environment:**
- Node.js 24 (Alpine Linux variant in Docker) - See `Dockerfile`
- Uses CommonJS module format for compiled output

**Package Manager:**
- pnpm 10.29.2 - Specified in `package.json` packageManager field
- Lock file: `pnpm-lock.yaml` - Ensures reproducible installs

## Frameworks

**Core Web Framework:**
- Express.js 5.1.0 - HTTP server in `src/index.ts`
  - Entry point: `src/index.ts`
  - Route handling: `src/routes/` directory structure
  - Middleware setup: CORS, helmet, cookie-parser, error handling

**Database ORM:**
- Prisma 6.18.0 - Database schema management and querying
  - Schema: `prisma/schema.prisma`
  - Client config: `src/config/prisma.client.ts`
  - Accelerate Extension 2.0.1 - Performance optimization

**Authorization/ABAC:**
- CASL 6.7.3 (@casl/ability) - Role and permission management
  - Prisma integration: @casl/prisma 1.5.2
  - Ability definitions: `src/abilities/abilities.ts`
  - Authorization middleware: `src/abilities/authorize.middleware.ts`
  - Role mapping utilities: `src/utils/roleMapping.ts`

**Build Tools:**
- tsup 8.5.0 - TypeScript bundler and transpiler
  - Config: `tsup.config.ts`
  - Outputs to `dist/` directory
  - Source maps enabled for debugging
  - Development via ts-node-dev for hot reload

## Key Dependencies

**Security & Authentication:**
- jsonwebtoken 9.0.2 - JWT token generation and verification
  - Implementation: `src/utils/auth.ts` (generateToken, verifyToken)
  - Token stored in signed cookies via cookie-parser
  - JWT_SECRET environment variable required
- bcryptjs 3.0.2 - Password hashing and verification
  - Implementation: `src/utils/auth.ts` (generatePassword, verifyPassword)
  - 12 salt rounds for hashing

**HTTP & Middleware:**
- cors 2.8.5 - Cross-origin resource sharing
  - Configuration: `src/index.ts` - accepts FRONT_END_ORIGIN env variable
  - Credentials enabled for cookie transport
- helmet 8.1.0 - Security headers middleware
- cookie-parser 1.4.7 - Cookie parsing with signed cookie support
  - Uses COOKIE_SECRET environment variable

**Data Handling:**
- exceljs 4.4.0 - Excel file import/export
  - Item import: `src/services/item.service.ts` (importItem function)
  - Item export: `src/services/item.service.ts` (exportItem function)
  - Row type definition: `ExcelRow` for Excel data mapping
- multer 2.0.2 - File upload middleware
  - Memory storage only: `src/routes/v1/item.route.ts`
  - Single file uploads for Excel imports
  - Buffer-based processing (no disk writes)

**Data Validation & Types:**
- zod 4.1.12 - Schema validation
  - Validation utilities: `src/utils/validation.ts`
- date-fns 4.1.0 - Date manipulation and formatting
  - Utility exports and invoice calculations

**Database Client:**
- pg 8.16.3 - PostgreSQL client library (required by Prisma)

## Configuration

**Environment Variables Required:**
- `PORT` - HTTP server port (default shown in docker-compose: 3000)
- `DATABASE_URL` - PostgreSQL connection string format: `postgresql://user:password@host:port/database`
- `JWT_SECRET` - Secret key for JWT token signing/verification (7-day expiration)
- `COOKIE_SECRET` - Secret for signed cookie encryption
- `FRONT_END_ORIGIN` - CORS origin for frontend (e.g., `http://localhost:3000`)
- `NODE_ENV` - Environment mode (development/production)
- `DB_USER` - PostgreSQL username (for docker-compose)
- `DB_PASSWORD` - PostgreSQL password (for docker-compose)
- `DB_NAME` - PostgreSQL database name (for docker-compose)

**TypeScript Configuration:**
- Target: ES2022
- Module resolution: NodeNext
- Strict type checking enabled
- Type roots: `./node_modules/@types`, `./src/types`
- Type directory: `src/types/` for custom type definitions

**Prisma Configuration:**
- Provider: PostgreSQL
- Client output: `src/generated/prisma/` (generated directory excluded from linting)
- Prisma Studio: Accessible on port 5555 in Docker

## Build Output

**Build System:**
- tsup configuration: `tsup.config.ts`
- Output: `dist/index.js` (CommonJS single-file bundle)
- Compiled code entry: `npm start` runs `node dist/index.js`
- Development: `npm run dev` uses ts-node-dev with watch mode

**Build Script:**
```bash
npm run build          # Transpile src/ to dist/
npm start             # Run compiled application
npm run dev           # Development with hot reload
```

## Platform Requirements

**Development:**
- Node.js 24 or compatible LTS version
- pnpm 10.29.2 (can use newer compatible versions)
- PostgreSQL 16+ (via Docker or local installation)
- TypeScript knowledge for source modification

**Production:**
- Node.js 24 (Alpine) or compatible LTS
- PostgreSQL 16.3+ database
- Docker container orchestration (see `docker-compose.yml`)
- Environment variables configured via deployment platform secrets

**Docker Deployment:**
- Base image: `node:24-alpine`
- Working directory: `/app`
- Exposed ports: 3000 (API), 5555 (Prisma Studio)
- Volume mounts for code and node_modules in development
- Postgres service: PostgreSQL 16.3 with persistent data volume

---

*Stack analysis: 2024-12-19*
