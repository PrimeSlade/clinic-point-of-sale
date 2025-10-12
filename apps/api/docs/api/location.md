# Location API

Base URL: `/api/v1/locations`

All endpoints require authentication.

## Endpoints

### Add Location
Creates a new location.

- **URL**: `/add`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: `create:Location`

**Request Body:**
```json
{
  "name": "string (unique)",
  "address": "string (optional)",
  "phone": "string"
}
```

**Success Response:**
- **Code**: 201
- **Content**: 
```json
{
  "id": "number",
  "name": "string",
  "address": "string | null",
  "phoneNumberId": "number"
}
```

---

### Get Locations
Retrieves a list of all locations.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Location`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "locations": [
    {
      "id": "number",
      "name": "string",
      "address": "string | null",
      "phoneNumber": {
        "id": "number",
        "number": "string"
      }
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

---

### Update Location
Updates an existing location.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Permissions**: `update:Location`

**URL Parameters:**
- `id` (required): Location ID

**Request Body:**
```json
{
  "name": "string (unique)",
  "address": "string (optional)",
  "phone": "string"
}
```

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "id": "number",
  "name": "string",
  "address": "string | null",
  "phoneNumberId": "number"
}
```

---

### Delete Location
Deletes a location.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Permissions**: `delete:Location`

**URL Parameters:**
- `id` (required): Location ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "message": "Location deleted successfully"
}
```
