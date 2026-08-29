# Role API

Base URL: `/api/v1/roles`

All endpoints require authentication.

## Endpoints

### Add Role
Creates a new role.

- **URL**: `/add`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: `create:Role`

**Request Body:**
```json
{
  "name": "string (unique)",
  "permissions": [
    {
      "action": "manage | read | create | update | delete",
      "subject": "all | PhoneNumber | Location | Item | ItemUnit | Service | Patient | Doctor | Treatment | Invoice | InvoiceItem | User | Role | Permission | Category | Expense"
    }
  ]
}
```

**Success Response:**
- **Code**: 201
- **Content**: 
```json
{
  "id": "number",
  "name": "string",
  "permissions": [
    {
      "id": "number",
      "action": "string",
      "subject": "string"
    }
  ],
  "createdAt": "datetime"
}
```

---

### Get Roles
Retrieves a list of all roles.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Role`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "roles": [
    {
      "id": "number",
      "name": "string",
      "userCount": "number",
      "createdAt": "datetime"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

---

### Get Role By ID
Retrieves a single role by its ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Role`

**URL Parameters:**
- `id` (required): Role ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "id": "number",
  "name": "string",
  "permissions": [
    {
      "id": "number",
      "action": "string",
      "subject": "string"
    }
  ],
  "users": [
    {
      "id": "string",
      "name": "string",
      "email": "string"
    }
  ],
  "createdAt": "datetime"
}
```

---

### Update Role
Updates an existing role.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Permissions**: `update:Role`

**URL Parameters:**
- `id` (required): Role ID

**Request Body:**
```json
{
  "name": "string (unique)",
  "permissions": [
    {
      "action": "manage | read | create | update | delete",
      "subject": "all | PhoneNumber | Location | Item | ItemUnit | Service | Patient | Doctor | Treatment | Invoice | InvoiceItem | User | Role | Permission | Category | Expense"
    }
  ]
}
```

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "id": "number",
  "name": "string",
  "permissions": [
    {
      "id": "number",
      "action": "string",
      "subject": "string"
    }
  ]
}
```

---

### Delete Role
Deletes a role.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Permissions**: `delete:Role`

**URL Parameters:**
- `id` (required): Role ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "message": "Role deleted successfully"
}
```

**Notes:**
- Cannot delete a role that has users assigned to it
- System default roles may be protected from deletion

---

### Assign Role
Assigns a role to users.

- **URL**: `/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Permissions**: `update:Role`

**URL Parameters:**
- `id` (required): Role ID

**Request Body:**
```json
{
  "userIds": ["string"]
}
```

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "message": "Role assigned successfully",
  "assignedCount": "number"
}
```
