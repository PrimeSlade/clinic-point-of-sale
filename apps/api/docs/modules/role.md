# Role Module

Attribute-Based Access Control (ABAC) system for managing user permissions through roles.

## Features

- Role creation and management
- Fine-grained permission assignment (action + subject)
- Many-to-many relationship between roles and permissions
- User-role association
- Attribute-based access control using action-subject pairs

## Endpoints

- `POST /api/v1/roles/add` - Create role
- `GET /api/v1/roles` - List all roles
- `GET /api/v1/roles/:id` - Get role details
- `PUT /api/v1/roles/:id` - Update role
- `DELETE /api/v1/roles/:id` - Remove role
- `PATCH /api/v1/roles/:id` - Assign role to users

## Related Documentation

- [Role API Reference](../api/role.md) - Detailed API documentation with request/response examples
- [Permission Module](./permission.md) - Granular permission system
- [User Module](./user.md) - User management
- [Authentication Module](./authentication.md) - Authentication flow

## Default Roles

### Admin

- Full access to all resources and locations
- Manage system configuration
- Create/manage users and roles
- Access all reports and analytics

**Permissions:**

- `manage:all` - Complete system control

### Manager

- Manage specific location
- View location reports
- Manage location staff
- Control location inventory

**Permissions:**

- `manage:Patient`
- `manage:Doctor`
- `manage:Item`
- `manage:Invoice`
- `read:Report`

### Staff

- Daily operations
- Patient registration
- Treatment recording
- Invoice creation

**Permissions:**

- `create:Patient`
- `read:Patient`
- `create:Treatment`
- `create:Invoice`
- `read:Item`

### Cashier

- Invoice creation
- Payment processing
- Limited patient access

**Permissions:**

- `create:Invoice`
- `read:Invoice`
- `read:Patient`
- `read:Item`

### Doctor

- Patient care
- Treatment records
- View patient history

**Permissions:**

- `read:Patient`
- `create:Treatment`
- `update:Treatment`
- `read:Treatment`

---

## Understanding ABAC

This system implements **Attribute-Based Access Control (ABAC)** where permissions are defined by:

- **Action** - What operation can be performed (manage, read, create, update, delete)
- **Subject** - What resource the action applies to (Patient, Doctor, Item, etc.)
- **Context** - Additional attributes like location, time, or user properties

Example: `create:Patient` means the ability to create Patient records.

### ABAC vs RBAC

Unlike traditional Role-Based Access Control (RBAC), ABAC provides:

- **Context-aware authorization** using attributes beyond just roles
- **Location-based access control** - A key advantage in multi-branch operations
- **More scalable authorization model** that adapts to complex business rules

### Location-Based Access Control (Key ABAC Advantage)

One of ABAC's most powerful features in this system is **location-based access control**:

#### What RBAC Cannot Do:

In traditional RBAC, you would need to create separate roles for each location:

- ❌ `ManagerBranchA`, `ManagerBranchB`, `ManagerBranchC`
- ❌ `CashierLocation1`, `CashierLocation2`
- ❌ Role explosion: 10 roles × 5 locations = 50 different roles!

#### What ABAC Enables:

With ABAC, you assign **one role** and **one location** to a user:

- ✅ User has role: `Manager`
- ✅ User has location: `Branch A`
- ✅ System checks: Does user have `read:Patient` permission AND access to this patient's location?
- ✅ Dynamic authorization based on user's locationId attribute

#### Benefits of Location + ABAC:

1. **Single Role, Multiple Locations**
   - One "Manager" role works for all branches
   - Assign user to specific location
   - No need for location-specific roles

2. **Data Isolation**
   - Branch A staff cannot access Branch B data
   - Automatic enforcement based on locationId attribute
   - Prevents unauthorized cross-location access

3. **Simplified Management**
   - Add new location: Just create the location record
   - No need to create new roles for each location
   - Transfer user between branches: Just update locationId

4. **Scalable Growth**
   - 10 locations with 5 roles = Still only 5 roles (not 50!)
   - Easy to add new branches without permission restructuring
   - Consistent permission model across all locations

### Admin Override

System administrators with `manage:all` permission can typically:

- Access resources across all locations
- Override location restrictions
- Manage multi-location operations

This is implemented by checking for `manage:all` before applying location restrictions.
