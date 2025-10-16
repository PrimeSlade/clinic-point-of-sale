# Database Schema Documentation

This document provides comprehensive documentation for the Point of Sale Backend database schema. The database uses PostgreSQL with Prisma ORM.

## Table of Contents

- [Overview](#overview)
- [Enumerations](#enumerations)
- [Models](#models)
  - [PhoneNumber](#phonenumber)
  - [Location](#location)
  - [Item](#item)
  - [ItemUnit](#itemunit)
  - [Service](#service)
  - [Patient](#patient)
  - [Doctor](#doctor)
  - [Treatment](#treatment)
  - [Invoice](#invoice)
  - [InvoiceItem](#invoiceitem)
  - [InvoiceService](#invoiceservice)
  - [User](#user)
  - [Role](#role)
  - [Permission](#permission)
  - [Category](#category)
  - [Expense](#expense)
- [Relationships](#relationships)

## Overview

The database is designed to support a Point of Sale system for a medical facility. It manages:

- Patient records and treatments
- Doctor information and commissions
- Inventory management (items and services)
- Invoice generation and payment processing
- User authentication and role-based permissions
- Expense tracking and categorization
- Multi-location support

## Enumerations

### UnitType

Defines the types of units for items in inventory.

| Value   | Description |
| ------- | ----------- |
| `btl`   | Bottle      |
| `amp`   | Ampule      |
| `tube`  | Tube        |
| `strip` | Strip       |
| `cap`   | Capsule     |
| `pcs`   | Pieces      |
| `sac`   | Sachet      |
| `box`   | Box         |
| `pkg`   | Package     |
| `tab`   | Tablet      |

### Gender

Patient and potentially doctor gender.

| Value    | Description |
| -------- | ----------- |
| `male`   | Male        |
| `female` | Female      |

### PatientStatus

The current status of a patient.

| Value         | Description            |
| ------------- | ---------------------- |
| `new_patient` | First-time patient     |
| `follow_up`   | Returning patient      |
| `post_op`     | Post-operative patient |

### PatientCondition

Special medical conditions.

| Value            | Description             |
| ---------------- | ----------------------- |
| `disable`        | Patient with disability |
| `pregnant_woman` | Pregnant patient        |

### Department

Medical departments.

| Value     | Description               |
| --------- | ------------------------- |
| `og`      | Obstetrics and Gynecology |
| `oto`     | Otolaryngology (ENT)      |
| `surgery` | Surgery                   |
| `general` | General Medicine          |

### PatientType

Type of patient admission.

| Value | Description |
| ----- | ----------- |
| `in`  | In-patient  |
| `out` | Out-patient |

### Action

Permission actions for role-based access control.

| Value    | Description             |
| -------- | ----------------------- |
| `manage` | Full management access  |
| `read`   | Read-only access        |
| `create` | Create new records      |
| `update` | Update existing records |
| `delete` | Delete records          |

### Subject

Subjects for permission control.

| Value         | Description               |
| ------------- | ------------------------- |
| `all`         | All subjects              |
| `PhoneNumber` | Phone number management   |
| `Location`    | Location management       |
| `Item`        | Item/inventory management |
| `ItemUnit`    | Item unit management      |
| `Service`     | Service management        |
| `Patient`     | Patient management        |
| `Doctor`      | Doctor management         |
| `Treatment`   | Treatment management      |
| `Invoice`     | Invoice management        |
| `InvoiceItem` | Invoice item management   |
| `User`        | User management           |
| `Role`        | Role management           |
| `Permission`  | Permission management     |
| `Category`    | Category management       |
| `Expense`     | Expense management        |

### PaymentMethod

Available payment methods.

| Value    | Description           |
| -------- | --------------------- |
| `kpay`   | KBZ Pay               |
| `wave`   | Wave Money            |
| `cash`   | Cash payment          |
| `others` | Other payment methods |

## Models

### PhoneNumber

Stores phone numbers used across the system.

**Table Name:** `phone_numbers`

| Field       | Type       | Constraints                 | Description        |
| ----------- | ---------- | --------------------------- | ------------------ |
| `id`        | Int        | Primary Key, Auto-increment | Unique identifier  |
| `number`    | String(30) | Unique, Required            | Phone number       |
| `createdAt` | DateTime   | Default: now()              | Creation timestamp |

**Relations:**

- Has one `Location`
- Has many `Patient`
- Has many `Doctor`

**Indexes:**

- Unique index on `number`

---

### Location

Represents different physical locations/branches.

**Table Name:** `locations`

| Field           | Type   | Constraints                   | Description             |
| --------------- | ------ | ----------------------------- | ----------------------- |
| `id`            | Int    | Primary Key, Auto-increment   | Unique identifier       |
| `name`          | String | Unique, Required              | Location name           |
| `address`       | String | Optional                      | Physical address        |
| `phoneNumberId` | Int    | Unique, Foreign Key, Required | Associated phone number |

**Relations:**

- Belongs to one `PhoneNumber`
- Has many `Item`
- Has many `Patient`
- Has many `Doctor`
- Has many `Invoice`
- Has many `User`
- Has many `Expense`
- Has many `Category`

**Indexes:**

- Unique index on `name`
- Unique index on `phoneNumberId`

---

### Item

Represents inventory items (medicines, supplies, etc.).

**Table Name:** `items`

| Field         | Type   | Constraints                 | Description         |
| ------------- | ------ | --------------------------- | ------------------- |
| `id`          | Int    | Primary Key, Auto-increment | Unique identifier   |
| `barcode`     | String | Unique, Default: UUID       | Item barcode        |
| `name`        | String | Required                    | Item name           |
| `category`    | String | Required                    | Item category       |
| `expiryDate`  | Date   | Required                    | Expiration date     |
| `description` | String | Optional                    | Item description    |
| `locationId`  | Int    | Foreign Key, Required       | Associated location |

**Relations:**

- Belongs to one `Location`
- Has many `ItemUnit`

**Indexes:**

- Unique index on `barcode`

---

### ItemUnit

Represents different unit types and pricing for items.

**Table Name:** `item_units`

| Field           | Type          | Constraints                 | Description                   |
| --------------- | ------------- | --------------------------- | ----------------------------- |
| `id`            | Int           | Primary Key, Auto-increment | Unique identifier             |
| `unitType`      | UnitType      | Required                    | Type of unit (btl, amp, etc.) |
| `rate`          | Int           | Required                    | Conversion rate               |
| `quantity`      | Int           | Required                    | Available quantity            |
| `purchasePrice` | Decimal(10,2) | Required                    | Purchase price per unit       |
| `itemId`        | Int           | Foreign Key, Required       | Associated item               |

**Relations:**

- Belongs to one `Item` (cascade delete)

---

### Service

Represents medical services offered.

**Table Name:** `services`

| Field         | Type          | Constraints                 | Description       |
| ------------- | ------------- | --------------------------- | ----------------- |
| `id`          | Int           | Primary Key, Auto-increment | Unique identifier |
| `name`        | String        | Unique, Required            | Service name      |
| `retailPrice` | Decimal(10,2) | Required                    | Service price     |

**Relations:**

- None (standalone, data copied to `InvoiceService`)

**Indexes:**

- Unique index on `name`

---

### Patient

Stores patient information.

**Table Name:** `patients`

| Field              | Type             | Constraints                 | Description               |
| ------------------ | ---------------- | --------------------------- | ------------------------- |
| `id`               | Int              | Primary Key, Auto-increment | Unique identifier         |
| `name`             | String           | Required                    | Patient name              |
| `gender`           | Gender           | Required                    | Patient gender            |
| `dateOfBirth`      | Date             | Required                    | Date of birth             |
| `address`          | String           | Optional                    | Residential address       |
| `email`            | String           | Optional                    | Email address             |
| `patientStatus`    | PatientStatus    | Required                    | Current patient status    |
| `patientCondition` | PatientCondition | Required                    | Special conditions        |
| `patientType`      | PatientType      | Required                    | In-patient or out-patient |
| `department`       | Department       | Required                    | Assigned department       |
| `registeredAt`     | DateTime         | Default: now()              | Registration timestamp    |
| `deletedAt`        | DateTime         | Optional                    | Soft delete timestamp     |
| `phoneNumberId`    | Int              | Foreign Key, Required       | Contact number            |
| `locationId`       | Int              | Foreign Key, Required       | Registered location       |

**Relations:**

- Belongs to one `PhoneNumber`
- Belongs to one `Location`
- Has many `Treatment`

**Indexes:**

- Index on `deletedAt`

---

### Doctor

Stores doctor information.

**Table Name:** `doctors`

| Field           | Type          | Constraints           | Description                  |
| --------------- | ------------- | --------------------- | ---------------------------- |
| `id`            | String        | Primary Key, UUID     | Unique identifier            |
| `name`          | String        | Required              | Doctor name                  |
| `email`         | String        | Required              | Email address                |
| `commission`    | Decimal(10,2) | Required              | Commission percentage/amount |
| `address`       | String        | Optional              | Residential address          |
| `description`   | String        | Optional              | Additional information       |
| `deletedAt`     | DateTime      | Optional              | Soft delete timestamp        |
| `locationId`    | Int           | Foreign Key, Required | Assigned location            |
| `phoneNumberId` | Int           | Foreign Key, Required | Contact number               |

**Relations:**

- Belongs to one `PhoneNumber`
- Belongs to one `Location`
- Has many `Treatment`

**Indexes:**

- Index on `deletedAt`
- Index on `email`

---

### Treatment

Records medical treatments provided to patients.

**Table Name:** `treatments`

| Field           | Type     | Constraints                 | Description                 |
| --------------- | -------- | --------------------------- | --------------------------- |
| `id`            | Int      | Primary Key, Auto-increment | Unique identifier           |
| `createdAt`     | DateTime | Default: now()              | Treatment timestamp         |
| `doctorId`      | String   | Foreign Key, Required       | Treating doctor             |
| `patientId`     | Int      | Foreign Key, Required       | Patient receiving treatment |
| `investigation` | String   | Optional                    | Investigation notes         |
| `diagnosis`     | String   | Optional                    | Diagnosis details           |
| `treatment`     | String   | Required                    | Treatment provided          |

**Relations:**

- Belongs to one `Doctor`
- Belongs to one `Patient`
- Has many `Invoice`

---

### Invoice

Represents billing invoices.

**Table Name:** `invoices`

| Field                | Type          | Constraints                 | Description                |
| -------------------- | ------------- | --------------------------- | -------------------------- |
| `id`                 | Int           | Primary Key, Auto-increment | Unique identifier          |
| `createdAt`          | DateTime      | Default: now()              | Invoice creation timestamp |
| `locationId`         | Int           | Foreign Key, Required       | Invoice location           |
| `treatmentId`        | Int           | Foreign Key, Optional       | Associated treatment       |
| `totalItemDiscount`  | Decimal(10,2) | Required                    | Total item-level discounts |
| `subTotal`           | Decimal(10,2) | Required                    | Subtotal before discounts  |
| `totalAmount`        | Decimal(10,2) | Required                    | Final total amount         |
| `discountAmount`     | Decimal(10,2) | Required                    | Invoice-level discount     |
| `paymentMethod`      | PaymentMethod | Required                    | Payment method used        |
| `paymentDescription` | String        | Optional                    | Payment details            |
| `note`               | String        | Optional                    | Additional notes           |

**Relations:**

- Belongs to one `Location`
- Belongs to one `Treatment` (optional)
- Has many `InvoiceItem` (cascade delete)
- Has many `InvoiceService` (cascade delete)

---

### InvoiceItem

Individual product/medicine entries on an invoice (e.g., "Medicine A, 2 bottles, $10 each").

**Table Name:** `invoice_items`

| Field           | Type          | Constraints                 | Description           |
| --------------- | ------------- | --------------------------- | --------------------- |
| `id`            | Int           | Primary Key, Auto-increment | Unique identifier     |
| `barcode`       | String        | Required                    | Item barcode          |
| `itemName`      | String        | Required                    | Item name (snapshot)  |
| `unitType`      | UnitType      | Required                    | Unit type             |
| `quantity`      | Int           | Required                    | Quantity sold         |
| `retailPrice`   | Decimal(10,2) | Required                    | Retail price per unit |
| `discountPrice` | Decimal(10,2) | Required                    | Discount applied      |
| `invoiceId`     | Int           | Foreign Key, Required       | Associated invoice    |

**Relations:**

- Belongs to one `Invoice` (cascade delete)

**Note:** Item data denormalized to preserve invoice integrity.

---

### InvoiceService

Individual service entries on an invoice (e.g., "Consultation, $50").

**Table Name:** `invoice_services`

| Field         | Type          | Constraints                 | Description             |
| ------------- | ------------- | --------------------------- | ----------------------- |
| `id`          | Int           | Primary Key, Auto-increment | Unique identifier       |
| `name`        | String        | Required                    | Service name (snapshot) |
| `retailPrice` | Decimal(10,2) | Required                    | Service price           |
| `invoiceId`   | Int           | Foreign Key, Required       | Associated invoice      |

**Relations:**

- Belongs to one `Invoice` (cascade delete)

**Note:** Service data denormalized to preserve invoice integrity.

---

### User

System users with authentication and authorization.

**Table Name:** `users`

| Field          | Type     | Constraints           | Description                 |
| -------------- | -------- | --------------------- | --------------------------- |
| `id`           | String   | Primary Key, UUID     | Unique identifier           |
| `name`         | String   | Required              | User name                   |
| `email`        | String   | Unique, Required      | Email for login             |
| `password`     | String   | Required              | Hashed password             |
| `createdAt`    | DateTime | Default: now()        | Account creation timestamp  |
| `pricePercent` | Int      | Required              | Price adjustment percentage |
| `locationId`   | Int      | Foreign Key, Required | Assigned location           |
| `roleId`       | Int      | Foreign Key, Required | User role                   |

**Relations:**

- Belongs to one `Location`
- Belongs to one `Role`

**Indexes:**

- Unique index on `email`

**Note:** Authorization uses ABAC (CASL) with location-based conditions.

---

### Role

User roles for attribute-based access control (ABAC).

**Table Name:** `roles`

| Field       | Type     | Constraints                 | Description             |
| ----------- | -------- | --------------------------- | ----------------------- |
| `id`        | Int      | Primary Key, Auto-increment | Unique identifier       |
| `name`      | String   | Unique, Required            | Role name               |
| `createdAt` | DateTime | Default: now()              | Role creation timestamp |

**Relations:**

- Has many `User`
- Has many `Permission` (many-to-many)

**Indexes:**

- Unique index on `name`

---

### Permission

Permissions for attribute-based access control (ABAC).

**Table Name:** `permissions`

| Field     | Type   | Constraints                 | Description                            |
| --------- | ------ | --------------------------- | -------------------------------------- |
| `id`      | Int    | Primary Key, Auto-increment | Unique identifier                      |
| `action`  | String | Required                    | Permission action (manage, read, etc.) |
| `subject` | String | Required                    | Subject/resource type                  |

**Relations:**

- Has many `Role` (many-to-many)

---

### Category

Expense categories for financial tracking.

**Table Name:** `categories`

| Field         | Type     | Constraints                 | Description                 |
| ------------- | -------- | --------------------------- | --------------------------- |
| `id`          | Int      | Primary Key, Auto-increment | Unique identifier           |
| `name`        | String   | Required                    | Category name               |
| `description` | String   | Optional                    | Category description        |
| `locationId`  | Int      | Foreign Key, Required       | Associated location         |
| `createdAt`   | DateTime | Default: now()              | Category creation timestamp |

**Relations:**

- Belongs to one `Location`
- Has many `Expense`

---

### Expense

Tracks business expenses.

**Table Name:** `expenses`

| Field         | Type    | Constraints                 | Description              |
| ------------- | ------- | --------------------------- | ------------------------ |
| `id`          | Int     | Primary Key, Auto-increment | Unique identifier        |
| `name`        | String  | Required                    | Expense name/description |
| `amount`      | Decimal | Required                    | Expense amount           |
| `date`        | Date    | Required                    | Expense date             |
| `description` | String  | Optional                    | Additional details       |
| `locationId`  | Int     | Foreign Key, Required       | Associated location      |
| `categoryId`  | Int     | Foreign Key, Required       | Expense category         |

**Relations:**

- Belongs to one `Category`
- Belongs to one `Location`

---

## Relationships

### PhoneNumber Relationships

```
PhoneNumber (1:1) Location
PhoneNumber (1:N) Patient
PhoneNumber (1:N) Doctor
```

### Location-Based Multi-Tenancy

Most entities belong to a `Location`:

- Items
- Patients
- Doctors
- Invoices
- Users
- Expenses
- Categories

### Soft Deletes

Models with soft delete support:

- `Patient`
- `Doctor`

### Complete Entity Relationship Overview

```
┌─────────────┐
│ PhoneNumber │
└──────┬──────┘
       │
       ├─(1:1)──→ Location
       ├─(1:N)──→ Patient
       └─(1:N)──→ Doctor

┌──────────┐
│ Location │───(1:N)──→ Item ───(1:N)──→ ItemUnit
└────┬─────┘
     │
     ├─(1:N)──→ Patient ───(1:N)──→ Treatment
     ├─(1:N)──→ Doctor ───(1:N)──→ Treatment
     ├─(1:N)──→ Invoice
     ├─(1:N)──→ User ───(N:1)──→ Role ───(N:N)──→ Permission
     ├─(1:N)──→ Category ───(1:N)──→ Expense
     └─(1:N)──→ Expense

Treatment ───(1:N)──→ Invoice ───┬─(1:N)──→ InvoiceItem
                                  └─(1:N)──→ InvoiceService

Service (standalone)
```

## Database Configuration

**Provider:** PostgreSQL  
**Prisma Client Output:** `../src/generated/prisma`  
**Connection:** Environment variable `DATABASE_URL`
