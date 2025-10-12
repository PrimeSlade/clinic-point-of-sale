# Permission Module

Granular permission system for Attribute-Based Access Control (ABAC).

## Features

- Permission listing
- Action-based permissions (manage, read, create, update, delete)
- Resource-based permissions (subjects)
- Flexible ABAC permission model
- Fine-grained access control

## Endpoints

- `GET /api/v1/permissions` - List all permissions

## Related Documentation

- [Permission API Reference](../api/permission.md) - Detailed API documentation with request/response examples
- [Role Module](./role.md) - ABAC system using roles
- [User Module](./user.md) - User management

## What is ABAC?

**Attribute-Based Access Control (ABAC)** is an authorization model that evaluates attributes (or characteristics) to determine access. In this system:

- **Action Attribute**: What the user wants to do (create, read, update, delete, manage)
- **Subject Attribute**: What resource they want to access (Patient, Doctor, Item, etc.)

This provides more flexibility than traditional RBAC because permissions are granular combinations of actions and subjects, not just role names.

## Permission Actions

### `manage`

Full control over resource including create, read, update, delete, and special actions.

### `read`

View resource data. Used for listing and viewing details.

### `create`

Add new resources to the system.

### `update`

Modify existing resources.

### `delete`

Remove resources from the system.

### `import`

Bulk import data from external sources.

### `export`

Bulk export data to external formats.

## Permission Subjects

### `all`

All resources (super admin only).

### Core Resources

- `User` - User management
- `Role` - Role management
- `Permission` - Permission management

### Medical Resources

- `Patient` - Patient records
- `Doctor` - Doctor profiles
- `Treatment` - Treatment records

### Inventory Resources

- `Item` - Inventory items
- `ItemUnit` - Item unit types
- `Category` - Item categories

### Financial Resources

- `Invoice` - Invoicing
- `InvoiceItem` - Invoice line items
- `Expense` - Expense tracking
- `Report` - Financial reports

### System Resources

- `Location` - Location management
- `Service` - Service catalog
- `PhoneNumber` - Phone number management

## Permission Format

Permissions follow the pattern: `action:Subject`

Examples:

- `manage:all` - Full system access
- `read:Patient` - View patient records
- `create:Invoice` - Create new invoices
- `update:Item` - Modify inventory items
- `delete:Expense` - Remove expense records
- `import:Item` - Bulk import inventory
- `export:Report` - Export reports

## Common Permission Sets

### Admin Permissions

```
manage:all
```

### Manager Permissions

```
manage:Patient
manage:Doctor
manage:Item
manage:Treatment
manage:Invoice
read:Report
```

### Staff Permissions

```
create:Patient
read:Patient
update:Patient
create:Treatment
read:Treatment
create:Invoice
read:Invoice
read:Item
```

### Cashier Permissions

```
create:Invoice
read:Invoice
update:Invoice
read:Patient
read:Item
```

### Doctor Permissions

```
read:Patient
create:Treatment
update:Treatment
read:Treatment
```
