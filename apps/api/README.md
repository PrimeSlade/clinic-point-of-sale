# Point-Of-Sale Backend

A complete backend system for managing medical clinics and pharmacies with attribute-based access control (ABAC), inventory management, and financial tracking.

## Live Demo

**Frontend Application**: [https://medpos.primeslade.dev](https://medpos.primeslade.dev)

Test credentials:
- Email: `sai@email.com`
- Password: `11111`

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Documentation](#documentation)

## Overview

This backend system is designed for medical facilities and pharmacies, providing a complete solution for managing daily operations including patient records, inventory control, treatment documentation, invoicing, and financial tracking.

## Features

- Medical Management - Patient records, doctor profiles, treatment documentation
- Inventory Control - Medicine tracking with multiple unit types and expiry management
- Services Management - Medical services catalog with dynamic pricing
- Invoicing System - Comprehensive invoices with automatic inventory adjustment
- Financial Tracking - Expense management with detailed categorization
- Multi-Location Support - Branch management with location-based data filtering
- Security - JWT authentication with attribute-based access control (ABAC)
- Reporting - Sales and expense reports with date range filtering

## Technology Stack

### Backend Framework

- Node.js (v18+) - JavaScript runtime
- Express (v5.1.0) - Web application framework
- TypeScript (v5.8.3) - Type-safe JavaScript

### Database

- PostgreSQL (v16+) - Relational database
- Prisma (v6.11.0) - Next-generation ORM with type-safe queries and automated migrations

### Authentication & Authorization

- JWT (jsonwebtoken v9.0.2) - Token-based authentication
- bcryptjs (v3.0.2) - Password hashing
- CASL (@casl/ability v6.7.3) - Attribute-based access control (ABAC)

### Security

- Helmet (v8.1.0) - HTTP security headers
- CORS (v2.8.5) - Cross-origin resource sharing
- Cookie Parser (v1.4.7) - Signed cookie support

### Data Validation

- Zod (v4.1.12) - TypeScript-first schema validation

### File Handling

- Multer (v2.0.2) - Multipart form data handling
- ExcelJS (v4.4.0) - Excel file processing

### Development Tools

- ts-node-dev (v2.0.0) - Development server with auto-reload
- ESLint (v9.30.0) - Code linting
- Prettier (v3.6.2) - Code formatting
- Docker - Containerization support

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v16 or higher)
- pnpm

### Installation

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd Point-Of-Sale-Backend

# 2. Enable Corepack (for pnpm)
corepack enable

# 3. Install dependencies
pnpm install

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migrations
npx prisma migrate deploy

# 6. Seed the database (in order)
pnpm run permission-seed   # Permissions (required first)
pnpm run seed             # Roles
pnpm run user-seed        # Initial user and location
pnpm run data-seed        # Sample data (optional)

# 7. Start the development server
pnpm run dev
```

Visit `http://localhost:3000/api` to verify the server is running.

### Default Login Credentials

After seeding:

- Email: `sai@email.com`
- Password: `11111`

**Important:** Change these credentials in production!

### Docker Quick Start

```bash
docker-compose up --build
```

This automatically sets up PostgreSQL, runs migrations, and starts the server.

## Project Structure

```
Point-Of-Sale-Backend/
├── prisma/
│   ├── migrations/              # Database migrations
│   ├── seeds/                   # Database seed scripts
│   └── schema.prisma           # Database schema
├── src/
│   ├── abilities/              # CASL permission definitions
│   ├── config/                 # Configuration files
│   ├── controllers/            # Request handlers
│   ├── errors/                 # Custom error classes
│   ├── middlewares/            # Express middleware
│   ├── models/                 # Database queries
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Helper functions
│   └── index.ts               # Application entry point
├── docs/                       # Documentation
│   ├── api/                    # API endpoint documentation
│   ├── modules/                # Module-specific docs
│   ├── GETTING_STARTED.md      # Installation guide
│   ├── USER_FLOW.md            # User workflows and interaction patterns
│   ├── AUTHORIZATION.md        # ABAC system documentation
│   ├── DATABASE.md             # Database schema guide
│   └── INVOICE_OPERATIONS.md  # Invoice system documentation
├── .env                        # Environment variables
├── docker-compose.yml          # Docker configuration
├── Dockerfile                 # Docker image definition
├── package.json               # Dependencies & scripts
└── tsconfig.json              # TypeScript config
```

## Documentation

### Getting Started

- [Installation Guide](docs/GETTING_STARTED.md) - Detailed setup instructions with prerequisites and configuration

### Core Guides

- [User Flow](docs/USER_FLOW.md) - Complete user workflows and interaction patterns for all system features
- [Authorization (ABAC)](docs/AUTHORIZATION.md) - Attribute-based access control system with location-based multi-tenancy
- [Database Schema](docs/DATABASE.md) - Complete database documentation with relationships and models
- [Invoice Operations](docs/INVOICE_OPERATIONS.md) - Invoice creation/deletion flow with inventory adjustment logic
- [Authentication Module](docs/modules/authentication.md) - User authentication and JWT token management

### API Documentation

Complete API reference with request/response examples:

- [Auth API](docs/api/auth.md) - Signup, login, logout endpoints
- [Patient API](docs/api/patient.md) - Patient management endpoints
- [Doctor API](docs/api/doctor.md) - Doctor management endpoints
- [Item API](docs/api/item.md) - Inventory management endpoints
- [Service API](docs/api/service.md) - Medical services endpoints
- [Treatment API](docs/api/treatment.md) - Treatment records endpoints
- [Invoice API](docs/api/invoice.md) - Invoice management endpoints
- [Expense API](docs/api/expense.md) - Expense tracking endpoints
- [Category API](docs/api/category.md) - Category management endpoints
- [Location API](docs/api/location.md) - Location management endpoints
- [User API](docs/api/user.md) - User management endpoints
- [Role API](docs/api/role.md) - Role management endpoints
- [Permission API](docs/api/permission.md) - Permission management endpoints

---

**Tech Stack**: TypeScript · Express · Prisma · PostgreSQL · JWT · CASL (ABAC)
