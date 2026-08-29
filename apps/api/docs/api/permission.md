# Permission API

Base URL: `/api/v1/permissions`

All endpoints require authentication.

## Endpoints

### Get Permissions
Retrieves a list of all available permissions.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: None

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "permissions": [
    {
      "id": "string",
      "action": "string",
      "subject": "string",
      "description": "string"
    }
  ]
}
```

**Notes:**
- This endpoint returns all available permissions in the system
- Permissions are used for role-based access control
- Common actions include: create, read, update, delete, import, export
- Common subjects include: User, Role, Patient, Doctor, Item, Invoice, etc.
