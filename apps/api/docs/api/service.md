# Service API

Base URL: `/api/v1/services`

All endpoints require authentication.

## Endpoints

### Add Service
Creates a new service.

- **URL**: `/add`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: `create:Service`

**Request Body:**
```json
{
  "name": "string (unique)",
  "retailPrice": "number (decimal)"
}
```

**Success Response:**
- **Code**: 201
- **Content**: 
```json
{
  "id": "number",
  "name": "string",
  "retailPrice": "number (decimal)"
}
```

---

### Get Services
Retrieves a list of all services.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Service`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "services": [
    {
      "id": "number",
      "name": "string",
      "retailPrice": "number (decimal)"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

---

### Update Service
Updates an existing service.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Permissions**: `update:Service`

**URL Parameters:**
- `id` (required): Service ID

**Request Body:**
```json
{
  "name": "string (unique)",
  "retailPrice": "number (decimal)"
}
```

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "id": "number",
  "name": "string",
  "retailPrice": "number (decimal)"
}
```

---

### Delete Service
Deletes a service.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Permissions**: `delete:Service`

**URL Parameters:**
- `id` (required): Service ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "message": "Service deleted successfully"
}
```
