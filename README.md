# Clinic & Pharmacy Point-of-Sale (MedPOS)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-black?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.18-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-10+-F69220?logo=pnpm)](https://pnpm.io/)

A full-stack, enterprise-grade Clinic & Pharmacy Point-of-Sale (POS) and Healthcare Management System. Built as a high-performance monorepo, it streamlines daily medical clinic operations—from patient triage and doctor consultations to treatment tracking, multi-unit medicine inventory control, POS invoicing with automatic stock reconciliation, expense monitoring, and branch-level analytics with Attribute-Based Access Control (ABAC).

---

## Live Demo

- **Application URL:** [https://medpos.primeslade.dev](https://medpos.primeslade.dev)
- **Demo Credentials:**
  - **Email:** `sai@email.com`
  - **Password:** `11111`

> [!NOTE]
> Demo access provides full administrator privileges across all clinic modules and multi-branch management.

---

## Table of Contents

- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Monorepo Architecture](#monorepo-architecture)
- [Project Structure](#project-structure)
- [Quick Start Guide](#quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Database Setup & Seeding](#database-setup--seeding)
  - [Running the Applications](#running-the-applications)
  - [Docker Setup](#docker-setup)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Documentation & Deep Dives](#documentation--deep-dives)
- [Security & Authorization](#security--authorization)

---

## Key Features

### Medical Clinic Operations
- **Patient Management:** Track patient demographics, registration records, conditions (such as pregnancy, disability), patient status (`new_patient`, `follow_up`, `post_op`), patient types (`inpatient`, `outpatient`), and department assignment (`og`, `oto`, `surgery`, `general`).
- **Doctor Profiles & Commissions:** Maintain physician profiles, contact details, specializations, and custom doctor consultation commission rates.
- **Treatment Records:** Comprehensive consultation logs containing medical history, diagnoses, prescribed treatments, and lab investigations linked directly to both patient and attending doctor.

### Pharmacy & Inventory Control
- **Multi-Unit Packaging & Conversion:** Multi-level packaging units (`box`, `pkg`, `strip`, `tab`, `btl`, `amp`, `tube`, `sac`, `pcs`, `cap`) with automatic quantity-rate conversions and purchase prices.
- **Expiry & Barcode Tracking:** Expiration date monitoring and unique barcode identifier generation for fast barcode scanner integration.
- **Bulk Excel Import/Export:** Import/export inventory catalogs via formatted `.xlsx` spreadsheets using `ExcelJS`.
- **Inventory Audit History:** Granular audit trail tracking all stock adjustments, purchase price updates, and quantity modifications with user attribution.

### Point of Sale & Invoicing
- **Hybrid Invoicing:** Combine clinical services and pharmaceutical items in a single consolidated bill.
- **One-Click Invoicing from Treatment:** Convert completed treatment logs directly into actionable POS invoices.
- **Real-Time Stock Adjustment:** Automatic inventory deduction upon invoice issuance, with automated stock reversal upon invoice deletion or cancellation.
- **Discounts & Payment Channels:** Apply item-level discounts or overall invoice discounts; supports Cash, KPay, Wave Pay, and Custom payment methods.
- **PDF Receipt Generation:** Client-side vector PDF generation and printing via `@react-pdf/renderer`.

### Financial & Branch Analytics
- **Expense Tracking:** Categorized expense management with branch location association.
- **Sales & Expense Reports:** Real-time revenue, expense, and profitability filtering by date range, department, and location.
- **Multi-Branch Multi-Tenancy:** Manage multiple physical clinic branches with location-scoped records and user access.

### Security & Access Control
- **Attribute-Based Access Control (ABAC):** Granular permission management powered by `@casl/ability` and `@casl/react`.
- **JWT & Signed Cookies:** Secure HTTP-only cookie-based authentication with bcrypt password hashing.

---

## Technology Stack

### Monorepo & Tooling
| Tool | Purpose |
| :--- | :--- |
| **[pnpm](https://pnpm.io/)** | High-efficiency workspace package manager |
| **[TypeScript](https://www.typescriptlang.org/)** (v5.8) | End-to-end type safety |
| **[ESLint 9](https://eslint.org/) & [Prettier](https://prettier.io/)** | Code quality, linting, and formatting |
| **[Vitest](https://vitest.dev/)** | Fast unit and integration testing |
| **[Docker & Compose](https://www.docker.com/)** | Containerized backend and database deployment |

### Frontend (`apps/web`)
| Layer / Library | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), `@tailwindcss/vite`, `tw-animate-css` |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) primitives + [Shadcn UI](https://ui.shadcn.com/) patterns |
| **Data Fetching & Caching** | [@tanstack/react-query v5](https://tanstack.com/query) |
| **Tables & Data Grids** | [@tanstack/react-table v8](https://tanstack.com/table) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **Authorization** | [@casl/react](https://casl.js.org/) for declarative UI permission gating |
| **Document Export** | [@react-pdf/renderer](https://react-pdf.org/) for vector PDF invoice generation |
| **Icons & Notifications** | [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) |

### Backend (`apps/api`)
| Layer / Library | Technology |
| :--- | :--- |
| **Runtime & Server** | [Node.js](https://nodejs.org/) (v18+) + [Express 5](https://expressjs.com/) |
| **ORM & Database** | [Prisma ORM v6](https://www.prisma.io/) + [PostgreSQL 16+](https://www.postgresql.org/) (Neon / Self-hosted) |
| **Validation** | [Zod 4](https://zod.dev/) request payload and query validation |
| **Authorization** | [@casl/ability](https://casl.js.org/) + `@casl/prisma` (ABAC) |
| **Authentication** | [jsonwebtoken (JWT)](https://github.com/auth0/node-jsonwebtoken) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Security Headers & Cookies** | [Helmet](https://helmetjs.github.io/), [CORS](https://github.com/expressjs/cors), [cookie-parser](https://github.com/expressjs/cookie-parser) |
| **File Processing** | [Multer](https://github.com/expressjs/multer) (Multipart uploads), [ExcelJS](https://github.com/exceljs/exceljs) (Spreadsheets) |
| **Build & Dev Tooling** | [tsup](https://tsup.egoist.dev/), [ts-node-dev](https://github.com/wclr/ts-node-dev) |

---

## Monorepo Architecture

```mermaid
graph TD
    subgraph Client ["Client Layer (apps/web)"]
        UI["React 19 + Tailwind v4 + Radix UI"]
        State["TanStack Query (Cache & State)"]
        AuthCASL["CASL Ability (UI Permission Guard)"]
        PDF["@react-pdf/renderer (Invoice Engine)"]
    end

    subgraph API ["Backend API Layer (apps/api)"]
        Router["Express 5 REST Routes (/api/v1)"]
        Middlewares["Auth / Helmet / CORS / Error Middlewares"]
        ABAC["CASL ABAC & Multi-Location Resolver"]
        Services["Business Logic & Stock Control Services"]
        PrismaClient["Prisma ORM Client"]
    end

    subgraph Database ["Data & Storage Layer"]
        Postgres[(PostgreSQL Database)]
    end

    UI --> State
    State -->|HTTP / REST API| Router
    Router --> Middlewares
    Middlewares --> ABAC
    ABAC --> Services
    Services --> PrismaClient
    PrismaClient --> Postgres
```

---

## Project Structure

```
clinic-point-of-sale/
├── apps/
│   ├── api/                           # Backend REST API Service
│   │   ├── prisma/
│   │   │   ├── migrations/            # Database schema migrations
│   │   │   ├── seeds/                 # Database seed scripts (permissions, roles, user, data)
│   │   │   └── schema.prisma          # Prisma schema definition
│   │   ├── src/
│   │   │   ├── abilities/             # CASL permission definitions & rule builder
│   │   │   ├── config/                # Environment & Prisma client setup
│   │   │   ├── controllers/           # HTTP route controllers
│   │   │   ├── errors/                # Standardized custom error classes
│   │   │   ├── middlewares/           # Auth, error handling, validation middlewares
│   │   │   ├── models/                # Data access & query abstraction
│   │   │   ├── routes/                # Express API route declarations
│   │   │   ├── services/              # Core business logic (Invoicing, Inventory)
│   │   │   ├── types/                 # TypeScript interfaces & types
│   │   │   ├── utils/                 # Token, password, and calculation helpers
│   │   │   └── index.ts               # Server entry point
│   │   ├── docs/                      # Extensive API & Architecture documentation
│   │   ├── Dockerfile                 # Backend container definition
│   │   └── package.json
│   │
│   └── web/                           # Frontend React Application
│       ├── src/
│       │   ├── api/                   # API clients and endpoint helpers
│       │   ├── components/            # Reusable UI components & Shadcn primitives
│       │   ├── contexts/              # Authentication & App context providers
│       │   ├── hooks/                 # Custom React Query & entity hooks
│       │   ├── pages/                 # Route pages (Inventory, Patients, POS, Reports, etc.)
│       │   │   ├── auth/              # Login page
│       │   │   ├── doctor/            # Doctor directory & profiles
│       │   │   ├── expense/           # Expense tracking & categories
│       │   │   ├── inventory/         # Medicine inventory & unit management
│       │   │   ├── invoice/           # POS terminal, bills, and PDF invoice views
│       │   │   ├── patient/           # Patient records & detail views
│       │   │   ├── report/            # Sales & expense reporting
│       │   │   ├── service/           # Medical services catalog
│       │   │   ├── setting/           # Branch locations, users, and role permissions
│       │   │   └── treatment/         # Medical treatment logs
│       │   ├── routes/                # Protected & Public routing logic
│       │   ├── types/                 # Frontend TypeScript type declarations
│       │   └── App.tsx                # App route mapping & layout assembly
│       ├── vite.config.ts             # Vite configuration
│       └── package.json
│
├── docker-compose.dev.yml             # Local hot-reload development stack
├── docker-compose.prod.yml            # Production deployment stack
├── package.json                       # Monorepo root configuration
├── pnpm-workspace.yaml                # pnpm workspace definition
└── README.md                          # Project documentation
```

---

## Quick Start Guide

### Prerequisites

Ensure you have the following installed on your workstation:
- **Node.js**: `v18.0.0` or higher
- **pnpm**: `v10.0.0` or higher (`corepack enable && corepack prepare pnpm@latest --activate`)
- **PostgreSQL**: `v16+` (or access to a cloud PostgreSQL instance such as [Neon](https://neon.tech/))

---

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PrimeSlade/clinic-point-of-sale.git
   cd clinic-point-of-sale
   ```

2. **Install all monorepo dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**

   **Backend (`apps/api/.env`):**
   ```env
   PORT=3000
   NODE_ENV="development"
   FRONT_END_ORIGIN="http://localhost:5173"
   DATABASE_URL="postgresql://username:password@localhost:5432/medclinic?schema=public"
   JWT_SECRET="your-super-secure-jwt-secret-key-at-least-32-chars"
   COOKIE_SECRET="your-super-secure-cookie-secret-key"
   ```

   **Frontend (`apps/web/.env`):**
   ```env
   VITE_URL="http://localhost:3000/api/v1"
   ```

---

### Database Setup & Seeding

1. **Generate Prisma Client:**
   ```bash
   pnpm db:generate
   ```

2. **Run Database Migrations:**
   ```bash
   pnpm db:migrate
   ```

3. **Seed Database (Execute in specific order):**
   ```bash
   # 1. Seed base permission registry
   pnpm --filter @pos/api permission-seed

   # 2. Seed default roles (admin, user)
   pnpm --filter @pos/api seed

   # 3. Seed initial admin user and default branch location
   pnpm --filter @pos/api user-seed

   # 4. (Optional) Seed sample clinic data (patients, doctors, inventory, services)
   pnpm --filter @pos/api data-seed
   ```

---

### Running the Applications

Start both the backend API and frontend client concurrently:

```bash
# Run both apps in parallel
pnpm dev
```

Or run each application individually:

```bash
# Start frontend only (http://localhost:5173)
pnpm dev:web

# Start backend API only (http://localhost:3000)
pnpm dev:api
```

Open your browser and navigate to `http://localhost:5173`. Log in with:
- **Email:** `sai@email.com`
- **Password:** `11111`

---

### Docker Setup

The Dokploy development environment tracks the `dev` branch and uses
`docker-compose.dev.yml`. Configure these environment variables in Dokploy:

```env
POSTGRES_DB=medpos_dev
POSTGRES_USER=medpos_dev
POSTGRES_PASSWORD=<strong-alphanumeric-password>
JWT_SECRET=<strong-random-secret>
COOKIE_SECRET=<strong-random-secret>
FRONT_END_ORIGIN=https://medpos-dev.primeslade.dev
```

In the Compose service's Domains tab, route `medpos-dev.primeslade.dev` to the
`web` service on container port `5173`. The API and PostgreSQL services remain
on an internal network, and all services restart automatically.

To validate the configuration locally without starting it:

```bash
POSTGRES_PASSWORD=check JWT_SECRET=check COOKIE_SECRET=check \
  docker compose -f docker-compose.dev.yml config -q
```

---

## Available Scripts

### Root Workspace Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts both Frontend and Backend concurrently in development mode |
| `pnpm dev:web` | Starts the React frontend development server |
| `pnpm dev:api` | Starts the Express API server with auto-reload (`ts-node-dev`) |
| `pnpm build` | Builds all packages across the monorepo |
| `pnpm build:web` | Builds the React frontend for production (`dist/`) |
| `pnpm build:api` | Compiles the backend TypeScript code using `tsup` |
| `pnpm lint` | Runs ESLint across all projects |
| `pnpm test` | Runs the API test suite using Vitest |
| `pnpm db:generate` | Generates the Prisma client library |
| `pnpm db:migrate` | Runs Prisma schema migrations |

### API Specific Scripts (`apps/api`)

| Command | Description |
| :--- | :--- |
| `pnpm --filter @pos/api test:watch` | Runs Vitest in interactive watch mode |
| `pnpm --filter @pos/api test:ui` | Opens the Vitest interactive UI web runner |
| `pnpm --filter @pos/api permission-seed` | Seeds the system permission list |
| `pnpm --filter @pos/api user-seed` | Seeds the initial admin account and default location |
| `pnpm --filter @pos/api data-seed` | Seeds comprehensive sample clinic data |

---

## Security & Authorization

The system implements **Attribute-Based Access Control (ABAC)** with **Multi-Location Scoping**:

- **Subject & Action Granularity:** Permissions are mapped per subject (such as `Patient`, `Doctor`, `Item`, `Invoice`, `Treatment`, `User`, `Role`) and action (`create`, `read`, `update`, `delete`, `manage`, `import`, `export`).
- **Location Isolation:** Users are tied to a specific `locationId`. Queries automatically scope data records to the authenticated user's branch location.
- **Price Percentage Markup:** User roles support custom pricing visibility percentages (`pricePercent`), enabling tiered retail price calculations for different tiers of staff.

---

## Documentation & Deep Dives

For in-depth explanations, refer to the detailed guides located in [`apps/api/docs`](apps/api/docs):

- **[Installation Guide](apps/api/docs/GETTING_STARTED.md):** Complete configuration and deployment instructions.
- **[User Workflows](apps/api/docs/USER_FLOW.md):** Step-by-step user interaction patterns and operational flows.
- **[Authorization & ABAC](apps/api/docs/AUTHORIZATION.md):** Detailed security architecture and permission matrix.
- **[Database Schema Guide](apps/api/docs/DATABASE.md):** Data models, relations, indexes, and entity lifecycle.
- **[Invoice Operations & Stock Logic](apps/api/docs/INVOICE_OPERATIONS.md):** Comprehensive inventory deduction and reversal lifecycle.
- **[API Endpoint Reference](apps/api/docs/api):** Complete HTTP endpoint specifications with request/response payloads.

---

## License

This project is licensed under the [MIT License](LICENSE).
