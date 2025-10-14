# Point-Of-Sale Backend

A complete backend system for managing medical clinics and pharmacies. This system handles patient records, doctor management, medical inventory, treatments, invoicing, and expense tracking with role-based access control.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Modules](#system-modules)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [API Overview](#api-overview)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [License](#license)

## Overview

This backend system is designed specifically for medical facilities and pharmacies. It provides a complete solution for managing daily operations, from patient registration and treatment records to inventory control and financial tracking.

### What Problems Does This Solve?

**For Medical Clinics:**

- Track patient history and medical records
- Manage doctor schedules and commissions
- Document diagnoses and treatment plans
- Generate invoices for consultations and procedures

**For Pharmacies:**

- Control medicine inventory with expiry tracking
- Handle multiple unit types (tablets, strips, bottles, etc.)
- Track stock levels across multiple locations
- Process sales with detailed invoicing

**For Business Management:**

- Monitor expenses by category
- Track revenue from services and sales
- Support multiple branch locations
- Control access with role-based permissions

### Who Is This For?

- Medical clinics and hospitals
- Pharmacies and drug stores
- Healthcare facility chains with multiple locations
- Medical administrators who need detailed reporting

## Key Features

### 🏥 Complete Medical Management

- **Patient Records** - Store complete patient information including demographics, contact details, medical history, and visit records
- **Doctor Profiles** - Manage doctor information with commission tracking and performance monitoring
- **Treatment Documentation** - Record investigations, diagnoses, and treatment plans for each patient visit
- **Medical History** - Track patient treatment history with date-stamped records

### 💊 Inventory Control

- **Medicine Tracking** - Manage pharmaceutical inventory with barcode generation
- **Multiple Units** - Support for various unit types: tablets, strips, bottles, capsules, ampoules, sachets, boxes, packages
- **Expiry Management** - Track expiration dates to prevent selling expired medicines
- **Stock Levels** - Monitor quantity for each unit type
- **Pricing Control** - Set purchase prices and retail prices per unit
- **Import/Export** - Bulk import items from Excel files and export inventory data

### 📋 Services Management

- **Service Catalog** - Maintain a list of medical services offered (consultations, X-rays, lab tests, etc.)
- **Dynamic Pricing** - Set and update service prices
- **Service Invoicing** - Include services in patient invoices

### 🧾 Invoicing System

- **Comprehensive Invoices** - Generate invoices that include both items and services
- **Treatment Linking** - Associate invoices with specific treatments
- **Multiple Payment Methods** - Support cash, KPay, Wave Money, and other payment methods
- **Discount Management** - Apply item-level and invoice-level discounts
- **Invoice Reports** - Generate sales reports filtered by date range and location

### 💰 Financial Tracking

- **Expense Management** - Track operational expenses with detailed categorization
- **Expense Categories** - Organize expenses (utilities, maintenance, supplies, salaries, transportation, etc.)
- **Date Range Reports** - Generate expense reports for specific periods
- **Location-Based Tracking** - Monitor expenses per branch or location

### 📍 Multi-Location Support

- **Branch Management** - Handle multiple clinic or pharmacy locations
- **Location-Based Data** - Filter patients, items, and invoices by location
- **Shared Resources** - Phone numbers can be associated with multiple locations
- **Location-Specific Inventory** - Each location maintains its own inventory

### 👥 User & Access Management

- **User Accounts** - Create accounts for staff members with secure password hashing
- **Role-Based Access Control** - Assign roles (Admin, User, custom roles) to users
- **Granular Permissions** - Control access at the action level (read, create, update, delete, manage)
- **Attribute-Based Authorization** - Users can only access data from their assigned location (unless admin)
- **Permission System** - Define permissions for each resource (Patient, Doctor, Item, Invoice, etc.)

### 📊 Reporting Capabilities

- **Invoice Reports** - Sales reports with filtering by date and location
- **Expense Reports** - Expense summaries with category breakdowns
- **Pagination Support** - Handle large datasets efficiently
- **Infinite Scroll** - Cursor-based pagination for treatments
- **Search Functionality** - Search patients, doctors, items, and expenses

### 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication with 7-day expiry
- **Password Hashing** - Bcrypt hashing for secure password storage
- **HTTP Security Headers** - Helmet.js for enhanced security
- **CORS Protection** - Controlled cross-origin resource sharing
- **Cookie Security** - Signed cookies for session management

## What's Included

The system consists of 13 interconnected modules that work together to manage your medical facility or pharmacy.

### Core Modules

- 🏥 **Patients** - Complete patient records and medical history
- 👨‍⚕️ **Doctors** - Doctor profiles with commission tracking
- 💊 **Inventory** - Medicine tracking with expiry dates and multiple units
- 📋 **Services** - Medical services catalog (consultations, tests, etc.)
- 💉 **Treatments** - Treatment records with diagnoses and prescriptions
- 🧾 **Invoices** - Generate invoices for treatments and sales
- 💰 **Expenses** - Track operational costs by category
- 📍 **Locations** - Multi-branch support
- 👥 **Users & Roles** - Role-based access control

[View detailed module descriptions →](docs/modules.md)

## Technology Stack

### Backend Framework

- **Node.js** (v18+) - JavaScript runtime
- **Express** (v5.1.0) - Web application framework
- **TypeScript** (v5.8.3) - Type-safe JavaScript

### Database

- **PostgreSQL** (v16+) - Relational database
- **Prisma** (v6.11.0) - Next-generation ORM
  - Type-safe database client
  - Automated migrations
  - Schema versioning

### Authentication & Authorization

- **JWT** (jsonwebtoken v9.0.2) - Token-based authentication
- **bcryptjs** (v3.0.2) - Password hashing
- **CASL** (@casl/ability v6.7.3) - Attribute-based access control

### Security

- **Helmet** (v8.1.0) - HTTP security headers
- **CORS** (v2.8.5) - Cross-origin resource sharing
- **Cookie Parser** (v1.4.7) - Signed cookie support

### Data Validation

- **Zod** (v4.1.12) - TypeScript-first schema validation

### File Handling

- **Multer** (v2.0.2) - Multipart form data handling (for Excel import)
- **ExcelJS** (v4.4.0) - Excel file reading and writing

### Utilities

- **date-fns** (v4.1.0) - Date manipulation library
- **dotenv** (v17.0.1) - Environment variable management

### Development Tools

- **ts-node-dev** (v2.0.0) - Development server with auto-reload
- **ESLint** (v9.30.0) - Code linting
- **Prettier** (v3.6.2) - Code formatting

### Deployment

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Quick Start

Get the system running in 5 minutes!

### Prerequisites

Make sure you have these installed:

- Node.js (v18 or higher)
- PostgreSQL (v16 or higher)
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd Point-Of-Sale-Backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migrations
npx prisma migrate deploy

# 6. Seed the database (in order)
npm run permission-seed   # Permissions (required first)
npm run seed             # Roles
npm run user-seed        # Initial user and location
npm run data-seed        # Sample data (optional)

# 7. Start the development server
npm run dev
```

Visit `http://localhost:3000/api` - if you see a success message, you're all set!

### Default Login Credentials

After seeding, you can login with:

- **Email**: `sai@email.com`
- **Password**: `11111`

**Important:** Change these credentials in production!

### Docker Quick Start

Prefer Docker? Run everything with one command:

```bash
docker-compose up
```

This automatically:

- Sets up PostgreSQL
- Runs migrations
- Starts the backend server

## Documentation

Comprehensive guides for every aspect of the system:

### Getting Started

- **[Installation Guide](docs/getting-started.md)** - Detailed setup instructions
- **[Environment Configuration](docs/getting-started.md#step-3-configure-environment-variables)** - All environment variables explained
- **[First Steps](docs/getting-started.md#whats-next)** - What to do after installation

### Core Guides

- **[Project Structure](docs/project-structure.md)** - Understanding the codebase organization
- **[Database Guide](docs/database.md)** - Working with Prisma and PostgreSQL
- **[API Reference](docs/api-reference.md)** - Complete API documentation with examples
- **[Authentication Guide](docs/authentication.md)** - Auth and permission system explained

### Development

- **[Development Guide](docs/development.md)** - Contributing and development workflow
- **[Docker Guide](docs/docker.md)** - Running and deploying with Docker
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

## API Overview

### Base URL

```
http://localhost:3000/api/v1
```

### Response Format

All API responses follow this consistent structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "pagination": {
    "page": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNextPage": true
  }
}
```

### Authentication

Most endpoints require authentication. Include the JWT token:

```http
Authorization: Bearer your-jwt-token
```

Or use cookies (automatically sent if on same domain).

### Complete Endpoint List

| Module          | Method | Endpoint               | Description            | Auth Required |
| --------------- | ------ | ---------------------- | ---------------------- | ------------- |
| **Auth**        | POST   | `/auth/signup`         | Create user account    | No            |
|                 | POST   | `/auth/login`          | Authenticate user      | No            |
|                 | POST   | `/auth/logout`         | End session            | Yes           |
| **Patients**    | POST   | `/patients/add`        | Register patient       | Yes           |
|                 | GET    | `/patients`            | List all patients      | Yes           |
|                 | GET    | `/patients/:id`        | Get patient details    | Yes           |
|                 | PUT    | `/patients/:id`        | Update patient         | Yes           |
|                 | DELETE | `/patients/:id`        | Remove patient         | Yes           |
| **Doctors**     | POST   | `/doctors`             | Add doctor             | Yes           |
|                 | GET    | `/doctors`             | List all doctors       | Yes           |
|                 | PUT    | `/doctors/:id`         | Update doctor          | Yes           |
|                 | DELETE | `/doctors/:id`         | Remove doctor          | Yes           |
| **Items**       | POST   | `/items/add`           | Add inventory item     | Yes           |
|                 | GET    | `/items`               | List items (paginated) | Yes           |
|                 | GET    | `/items/:id`           | Get item details       | Yes           |
|                 | PUT    | `/items/:id`           | Update item            | Yes           |
|                 | DELETE | `/items/:id`           | Remove item            | Yes           |
|                 | POST   | `/items/import`        | Import from Excel      | Yes           |
|                 | GET    | `/items/export`        | Export to Excel        | Yes           |
| **Services**    | POST   | `/services`            | Create service         | Yes           |
|                 | GET    | `/services`            | List all services      | Yes           |
|                 | PUT    | `/services/:id`        | Update service         | Yes           |
|                 | DELETE | `/services/:id`        | Remove service         | Yes           |
| **Treatments**  | POST   | `/treatments/add`      | Create treatment       | Yes           |
|                 | GET    | `/treatments`          | List treatments        | Yes           |
|                 | GET    | `/treatments/infinite` | List with cursor       | Yes           |
|                 | GET    | `/treatments/:id`      | Get treatment details  | Yes           |
|                 | PUT    | `/treatments/:id`      | Update treatment       | Yes           |
|                 | DELETE | `/treatments/:id`      | Remove treatment       | Yes           |
| **Invoices**    | POST   | `/invoices/add`        | Create invoice         | Yes           |
|                 | GET    | `/invoices`            | List invoices          | Yes           |
|                 | GET    | `/invoices/:id`        | Get invoice details    | Yes           |
|                 | GET    | `/invoices/reports`    | Generate reports       | Yes           |
|                 | DELETE | `/invoices/:id`        | Remove invoice         | Yes           |
| **Expenses**    | POST   | `/expenses/add`        | Record expense         | Yes           |
|                 | GET    | `/expenses`            | List expenses          | Yes           |
|                 | GET    | `/expenses/reports`    | Generate reports       | Yes           |
|                 | PUT    | `/expenses/:id`        | Update expense         | Yes           |
|                 | DELETE | `/expenses/:id`        | Remove expense         | Yes           |
| **Categories**  | POST   | `/categories`          | Create category        | Yes           |
|                 | GET    | `/categories`          | List categories        | Yes           |
|                 | PUT    | `/categories/:id`      | Update category        | Yes           |
|                 | DELETE | `/categories/:id`      | Remove category        | Yes           |
| **Locations**   | POST   | `/locations`           | Create location        | Yes           |
|                 | GET    | `/locations`           | List locations         | Yes           |
| **Users**       | GET    | `/users`               | List all users         | Yes           |
|                 | GET    | `/users/:id`           | Get user details       | Yes           |
|                 | PUT    | `/users/:id`           | Update user            | Yes           |
| **Roles**       | POST   | `/roles`               | Create role            | Yes           |
|                 | GET    | `/roles`               | List all roles         | Yes           |
| **Permissions** | GET    | `/permissions`         | List permissions       | Yes           |

[View detailed API documentation with examples →](docs/api-reference.md)

### Quick API Examples

#### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sai@email.com",
    "password": "11111"
  }'
```

#### Create Patient

```bash
curl -X POST http://localhost:3000/api/v1/patients/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "John Doe",
    "gender": "male",
    "dateOfBirth": "1990-01-01",
    "phoneNumber": "+959123456789",
    "patientStatus": "new_patient",
    "patientCondition": "disable",
    "patientType": "out",
    "department": "general",
    "locationId": 1
  }'
```

#### Get Items with Pagination

```bash
curl "http://localhost:3000/api/v1/items?page=1&limit=10&search=paracetamol" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Schema

### Entity Relationship Overview

The database consists of 15 interconnected tables:

**Core Entities:**

- `PhoneNumber` - Shared phone numbers
- `Location` - Clinic/pharmacy branches
- `User` - System users
- `Role` - User roles
- `Permission` - Access permissions

**Medical Entities:**

- `Patient` - Patient records
- `Doctor` - Doctor profiles
- `Treatment` - Treatment documentation

**Inventory:**

- `Item` - Medical items/medicines
- `ItemUnit` - Unit pricing and stock
- `Service` - Medical services

**Financial:**

- `Invoice` - Sales invoices
- `InvoiceItem` - Items in invoices
- `InvoiceService` - Services in invoices
- `Expense` - Operational expenses
- `Category` - Expense categories

### Key Relationships

```
Location
├── has many Users
├── has many Patients
├── has many Doctors
├── has many Items
├── has many Expenses
└── has many Categories

Patient
├── belongs to Location
├── belongs to PhoneNumber
└── has many Treatments

Doctor
├── belongs to Location
├── belongs to PhoneNumber
└── has many Treatments

Treatment
├── belongs to Patient
├── belongs to Doctor
└── has many Invoices

Invoice
├── belongs to Location
├── belongs to Treatment (optional)
├── has many InvoiceItems
└── has many InvoiceServices

Item
├── belongs to Location
└── has many ItemUnits

User
├── belongs to Location
└── belongs to Role

Role
└── has many Permissions (many-to-many)
```

### Database Features

- **Referential Integrity** - Foreign keys ensure data consistency
- **Soft Deletes** - Patients and doctors use `deletedAt` for data retention
- **Indexes** - Optimized queries on frequently searched fields
- **Cascading Deletes** - Automatic cleanup of related records where appropriate
- **Unique Constraints** - Prevent duplicate data
- **Default Values** - Auto-generated IDs, timestamps, and UUIDs

[View complete schema file →](prisma/schema.prisma)
[Learn more about database operations →](docs/database.md)

## Project Structure

```
Point-Of-Sale-Backend/
├── prisma/                      # Database files
│   ├── migrations/              # Database migrations
│   ├── seeds/                   # Database seed scripts
│   │   ├── permissions.seed.ts  # Permission data
│   │   ├── seed.ts             # Role data
│   │   ├── user.seed.ts        # Initial user
│   │   └── data.seed.ts        # Sample data
│   └── schema.prisma           # Database schema
├── src/                        # Application source code
│   ├── abilities/              # CASL permission definitions
│   ├── config/                 # Configuration files
│   ├── controllers/            # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── patient.controller.ts
│   │   ├── doctor.controller.ts
│   │   ├── item.controller.ts
│   │   ├── treatment.controller.ts
│   │   ├── invoice.controller.ts
│   │   ├── expense.controller.ts
│   │   └── ... (more controllers)
│   ├── errors/                 # Custom error classes
│   ├── middlewares/            # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── permission.middleware.ts
│   │   └── errorHandler.ts
│   ├── models/                 # Database queries
│   ├── routes/                 # API routes
│   │   ├── index.route.ts
│   │   └── v1/                # Version 1 routes
│   ├── services/               # Business logic
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Helper functions
│   └── index.ts               # Application entry point
├── docs/                       # Documentation
├── .env                        # Environment variables
├── docker-compose.yml          # Docker configuration
├── Dockerfile                 # Docker image definition
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript config
└── README.md                  # This file
```

[View detailed project structure guide →](docs/project-structure.md)

### Key Directories Explained

- **`prisma/`** - All database-related files including schema and migrations
- **`src/controllers/`** - Handle HTTP requests and responses
- **`src/services/`** - Contain business logic
- **`src/models/`** - Database queries using Prisma
- **`src/routes/`** - API endpoint definitions
- **`src/middlewares/`** - Authentication, authorization, and error handling
- **`src/types/`** - TypeScript type definitions
- **`docs/`** - Comprehensive documentation files

## License

[Add your license information here]

## Support & Contact

### Resources

- [Complete Documentation](docs/)
- [API Reference](docs/api-reference.md)
- [Database Guide](docs/database.md)
- [Development Guide](docs/development.md)

---

**Tech Stack**: TypeScript · Express · Prisma · PostgreSQL · JWT · CASL
