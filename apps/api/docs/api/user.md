# User API

Base URL: `/api/v1/users`

All endpoints require authentication.

## Endpoints

### Get Current User
Retrieves the currently authenticated user's information.

- **URL**: `/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: None

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "id": "string (uuid)",
  "email": "string",
  "name": "string",
  "pricePercent": "number",
  "locationId": "number",
  "roleId": "number",
  "createdAt": "datetime"
}
```

---

### Add User
Creates a new user.

- **URL**: `/add`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: `create:User`

**Request Body:**
```json
{
  "name": "string",
  "email": "string (unique)",
  "password": "string",
  "pricePercent": "number",
  "locationId": "number",
  "roleId": "number"
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
  "pricePercent": "number",
  "locationId": "number",
  "roleId": "number",
  "createdAt": "datetime"
}
```

---

### Get Users
Retrieves a list of all users.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:User`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "users": [
    {
      "id": "string (uuid)",
      "email": "string",
      "name": "string",
      "pricePercent": "number",
      "locationId": "number",
      "roleId": "number",
      "role": {
        "id": "number",
        "name": "string"
      },
      "createdAt": "datetime"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

---

### Update User
Updates an existing user.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Permissions**: `update:User`

**URL Parameters:**
- `id` (required): User ID

**Request Body:**
```json
{
  "name": "string",
  "email": "string (unique)",
  "pricePercent": "number",
  "locationId": "number",
  "roleId": "number"
}
```

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "id": "string (uuid)",
  "email": "string",
  "name": "string",
  "pricePercent": "number",
  "locationId": "number",
  "roleId": "number"
}
```

---

### Delete User
Deletes a user.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Permissions**: `delete:User`

**URL Parameters:**
- `id` (required): User ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "message": "User deleted successfully"
}
```
