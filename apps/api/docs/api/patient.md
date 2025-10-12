# Patient API

Base URL: `/api/v1/patients`

All endpoints require authentication.

## Endpoints

### Add Patient
Creates a new patient.

- **URL**: `/add`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: `create:Patient`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "dateOfBirth": "date",
  "gender": "string",
  "medicalHistory": "string"
}
```

**Success Response:**
- **Code**: 201
- **Content**: 
```json
{
  "id": "number",
  "name": "string",
  "email": "string | null",
  "phoneNumberId": "number",
  "address": "string | null",
  "dateOfBirth": "date",
  "gender": "male | female",
  "patientStatus": "new_patient | follow_up | post_op",
  "patientCondition": "disable | pregnant_woman",
  "patientType": "in | out",
  "department": "og | oto | surgery | general",
  "locationId": "number",
  "registeredAt": "datetime",
  "deletedAt": "datetime | null"
}
```

---

### Get Patients
Retrieves a list of all patients.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Patient`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "patients": [
    {
      "id": "number",
      "name": "string",
      "email": "string | null",
      "phoneNumber": {
        "number": "string"
      },
      "address": "string | null",
      "dateOfBirth": "date",
      "gender": "male | female",
      "patientStatus": "new_patient | follow_up | post_op",
      "patientCondition": "disable | pregnant_woman",
      "patientType": "in | out",
      "department": "og | oto | surgery | general",
      "registeredAt": "datetime"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

---

### Get Patient By ID
Retrieves a single patient by their ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Patient`

**URL Parameters:**
- `id` (required): Patient ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "id": "number",
  "name": "string",
  "email": "string | null",
  "phoneNumber": {
    "id": "number",
    "number": "string"
  },
  "address": "string | null",
  "dateOfBirth": "date",
  "gender": "male | female",
  "patientStatus": "new_patient | follow_up | post_op",
  "patientCondition": "disable | pregnant_woman",
  "patientType": "in | out",
  "department": "og | oto | surgery | general",
  "treatments": [
    {
      "id": "number",
      "investigation": "string",
      "diagnosis": "string",
      "treatment": "string",
      "createdAt": "datetime"
    }
  ],
  "registeredAt": "datetime"
}
```

---

### Update Patient
Updates an existing patient.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Permissions**: `update:Patient`

**URL Parameters:**
- `id` (required): Patient ID

**Request Body:**
```json
{
  "name": "string",
  "email": "string (optional)",
  "phone": "string",
  "address": "string (optional)",
  "dateOfBirth": "date (YYYY-MM-DD)",
  "gender": "male | female",
  "patientStatus": "new_patient | follow_up | post_op",
  "patientCondition": "disable | pregnant_woman",
  "patientType": "in | out",
  "department": "og | oto | surgery | general"
}
```

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "id": "number",
  "name": "string",
  "email": "string | null",
  "phoneNumberId": "number",
  "address": "string | null",
  "dateOfBirth": "date",
  "gender": "male | female",
  "patientStatus": "new_patient | follow_up | post_op",
  "patientCondition": "disable | pregnant_woman",
  "patientType": "in | out",
  "department": "og | oto | surgery | general"
}
```

---

### Delete Patient
Deletes a patient.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Permissions**: `delete:Patient`

**URL Parameters:**
- `id` (required): Patient ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "message": "Patient deleted successfully"
}
```
