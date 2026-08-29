# Category API

Base URL: `/api/v1/categories`

All endpoints require authentication.

## Endpoints

### Add Category
Creates a new category.

- **URL**: `/add`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: `create:Category`

**Request Body:**
```json
{
  "name": "string",
  "description": "string (optional)",
  "locationId": "number"
}
```

**Success Response:**
- **Code**: 201
- **Content**: 
```json
{
  "id": "number",
  "name": "string",
  "description": "string | null",
  "locationId": "number",
  "createdAt": "datetime"
}
```

---

### Get Categories
Retrieves a list of all categories.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Category`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "categories": [
    {
      "id": "number",
      "name": "string",
      "description": "string | null",
      "locationId": "number",
      "createdAt": "datetime"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

---

### Update Category
Updates an existing category.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Permissions**: `update:Category`

**URL Parameters:**
- `id` (required): Category ID

**Request Body:**
```json
{
  "name": "string",
  "description": "string (optional)"
}
```

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "id": "number",
  "name": "string",
  "description": "string | null"
}
```

---

### Delete Category
Deletes a category.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Permissions**: `delete:Category`

**URL Parameters:**
- `id` (required): Category ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "message": "Category deleted successfully"
}
```
