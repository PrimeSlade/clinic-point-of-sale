# Doctor API

Base URL: `/api/v1/doctors`

All endpoints require authentication.

## Endpoints

### Add Doctor
Creates a new doctor.

- **URL**: `/add`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: `create:Doctor`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "commission": "number (decimal)",
  "address": "string (optional)",
  "description": "string (optional)",
  "locationId": "number"
}
```

**Success Response:**
- **Code**: 201
- **Content**: 
```json
{
  "id": "string (uuid)",
  "name": "string",
  "email": "string",
  "phoneNumberId": "number",
  "commission": "number (decimal)",
  "address": "string | null",
  "description": "string | null",
  "locationId": "number",
  "deletedAt": "datetime | null"
}
```

---

### Get Doctors
Retrieves a list of all doctors.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Doctor`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "doctors": [
    {
      "id": "string (uuid)",
      "name": "string",
      "email": "string",
      "phoneNumber": {
        "number": "string"
      },
      "commission": "number (decimal)",
      "address": "string | null",
      "description": "string | null",
      "locationId": "number"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

---

### Update Doctor
Updates an existing doctor.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Permissions**: `update:Doctor`

**URL Parameters:**
- `id` (required): Doctor ID

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "commission": "number (decimal)",
  "address": "string (optional)",
  "description": "string (optional)"
}
```

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "id": "string (uuid)",
  "name": "string",
  "email": "string",
  "phoneNumberId": "number",
  "commission": "number (decimal)",
  "address": "string | null",
  "description": "string | null"
}
```

---

### Delete Doctor
Deletes a doctor.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Permissions**: `delete:Doctor`

**URL Parameters:**
- `id` (required): Doctor ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "message": "Doctor deleted successfully"
}
```
