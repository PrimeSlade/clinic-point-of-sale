# Item API

Base URL: `/api/v1/items`

All endpoints require authentication.

## Endpoints

### Add Item
Creates a new item.

- **URL**: `/add`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: `create:Item`

**Request Body:**
```json
{
  "name": "string",
  "category": "string",
  "expiryDate": "date (YYYY-MM-DD)",
  "description": "string (optional)",
  "locationId": "number",
  "itemUnits": [
    {
      "unitType": "btl | amp | tube | strip | cap | pcs | sac | box | pkg | tab",
      "rate": "number",
      "quantity": "number",
      "purchasePrice": "number (decimal)"
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
  "barcode": "string (uuid)",
  "name": "string",
  "category": "string",
  "expiryDate": "date",
  "description": "string | null",
  "locationId": "number",
  "itemUnits": [
    {
      "id": "number",
      "unitType": "btl | amp | tube | strip | cap | pcs | sac | box | pkg | tab",
      "rate": "number",
      "quantity": "number",
      "purchasePrice": "number (decimal)"
    }
  ]
}
```

---

### Get Items
Retrieves a list of all items.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Item`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term
- `category` (optional): Filter by category

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "items": [
    {
      "id": "number",
      "barcode": "string (uuid)",
      "name": "string",
      "category": "string",
      "expiryDate": "date",
      "description": "string | null",
      "locationId": "number",
      "itemUnits": [
        {
          "id": "number",
          "unitType": "btl | amp | tube | strip | cap | pcs | sac | box | pkg | tab",
          "rate": "number",
          "quantity": "number",
          "purchasePrice": "number (decimal)"
        }
      ]
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

---

### Import Items
Imports items from a CSV/Excel file.

- **URL**: `/import`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: `import:Item`
- **Content-Type**: `multipart/form-data`

**Request Body:**
- `file` (required): CSV or Excel file containing items

**File Format:**
The file should contain the following columns:
- name
- category
- expiryDate
- description (optional)
- unitType (btl, amp, tube, strip, cap, pcs, sac, box, pkg, tab)
- rate
- quantity
- purchasePrice

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "message": "Items imported successfully",
  "imported": "number",
  "failed": "number"
}
```

---

### Export Items
Exports items to a CSV/Excel file.

- **URL**: `/export`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `export:Item`

**Query Parameters:**
- `format` (optional): Export format (csv, xlsx). Default: csv
- `category` (optional): Filter by category

**Success Response:**
- **Code**: 200
- **Content**: File download

---

### Get Item By ID
Retrieves a single item by its ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Item`

**URL Parameters:**
- `id` (required): Item ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "id": "number",
  "barcode": "string (uuid)",
  "name": "string",
  "category": "string",
  "expiryDate": "date",
  "description": "string | null",
  "locationId": "number",
  "itemUnits": [
    {
      "id": "number",
      "unitType": "btl | amp | tube | strip | cap | pcs | sac | box | pkg | tab",
      "rate": "number",
      "quantity": "number",
      "purchasePrice": "number (decimal)"
    }
  ]
}
```

---

### Update Item
Updates an existing item.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Permissions**: `update:Item`

**URL Parameters:**
- `id` (required): Item ID

**Request Body:**
```json
{
  "name": "string",
  "category": "string",
  "expiryDate": "date (YYYY-MM-DD)",
  "description": "string (optional)",
  "itemUnits": [
    {
      "unitType": "btl | amp | tube | strip | cap | pcs | sac | box | pkg | tab",
      "rate": "number",
      "quantity": "number",
      "purchasePrice": "number (decimal)"
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
  "barcode": "string (uuid)",
  "name": "string",
  "category": "string",
  "expiryDate": "date",
  "description": "string | null",
  "itemUnits": [
    {
      "id": "number",
      "unitType": "btl | amp | tube | strip | cap | pcs | sac | box | pkg | tab",
      "rate": "number",
      "quantity": "number",
      "purchasePrice": "number (decimal)"
    }
  ]
}
```

---

### Delete Item
Deletes an item.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Permissions**: `delete:Item`

**URL Parameters:**
- `id` (required): Item ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "message": "Item deleted successfully"
}
```
