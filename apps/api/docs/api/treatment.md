# Treatment API

Base URL: `/api/v1/treatments`

All endpoints require authentication.

## Endpoints

### Add Treatment
Creates a new treatment record.

- **URL**: `/add`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: `create:Treatment`

**Request Body:**
```json
{
  "patientId": "number",
  "doctorId": "string (uuid)",
  "investigation": "string (optional)",
  "diagnosis": "string (optional)",
  "treatment": "string"
}
```

**Success Response:**
- **Code**: 201
- **Content**: 
```json
{
  "id": "number",
  "patientId": "number",
  "doctorId": "string (uuid)",
  "investigation": "string | null",
  "diagnosis": "string | null",
  "treatment": "string",
  "createdAt": "datetime"
}
```

---

### Get Treatments
Retrieves a list of all treatments with pagination.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Treatment`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `patientId` (optional): Filter by patient ID
- `doctorId` (optional): Filter by doctor ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "treatments": [
    {
      "id": "number",
      "patientId": "number",
      "patient": {
        "id": "number",
        "name": "string"
      },
      "doctorId": "string (uuid)",
      "doctor": {
        "id": "string",
        "name": "string"
      },
      "investigation": "string | null",
      "diagnosis": "string | null",
      "treatment": "string",
      "createdAt": "datetime"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

---

### Get Treatments By Cursor
Retrieves treatments using cursor-based pagination for infinite scrolling.

- **URL**: `/infinite`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Treatment`

**Query Parameters:**
- `cursor` (optional): Cursor for pagination
- `limit` (optional): Number of items per page (default: 20)
- `patientId` (optional): Filter by patient ID
- `doctorId` (optional): Filter by doctor ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "treatments": [
    {
      "id": "number",
      "patientId": "number",
      "patient": {
        "id": "number",
        "name": "string"
      },
      "doctorId": "string (uuid)",
      "doctor": {
        "id": "string",
        "name": "string"
      },
      "investigation": "string | null",
      "diagnosis": "string | null",
      "treatment": "string",
      "createdAt": "datetime"
    }
  ],
  "nextCursor": "string",
  "hasMore": "boolean"
}
```

---

### Get Treatment By ID
Retrieves a single treatment by its ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Treatment`

**URL Parameters:**
- `id` (required): Treatment ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "id": "number",
  "patientId": "number",
  "patient": {
    "id": "number",
    "name": "string",
    "email": "string | null",
    "phoneNumber": {
      "number": "string"
    }
  },
  "doctorId": "string (uuid)",
  "doctor": {
    "id": "string",
    "name": "string",
    "description": "string | null"
  },
  "investigation": "string | null",
  "diagnosis": "string | null",
  "treatment": "string",
  "createdAt": "datetime"
}
```

---

### Update Treatment
Updates an existing treatment.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Permissions**: `update:Treatment`

**URL Parameters:**
- `id` (required): Treatment ID

**Request Body:**
```json
{
  "patientId": "number",
  "doctorId": "string (uuid)",
  "investigation": "string (optional)",
  "diagnosis": "string (optional)",
  "treatment": "string"
}
```

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "id": "number",
  "patientId": "number",
  "doctorId": "string (uuid)",
  "investigation": "string | null",
  "diagnosis": "string | null",
  "treatment": "string"
}
```

---

### Delete Treatment
Deletes a treatment.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Permissions**: `delete:Treatment`

**URL Parameters:**
- `id` (required): Treatment ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "message": "Treatment deleted successfully"
}
```
