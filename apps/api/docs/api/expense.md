# Expense API

Base URL: `/api/v1/expenses`

All endpoints require authentication.

## Endpoints

### Add Expense
Creates a new expense.

- **URL**: `/add`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: `create:Expense`

**Request Body:**
```json
{
  "name": "string",
  "amount": "number (decimal)",
  "date": "date (YYYY-MM-DD)",
  "description": "string (optional)",
  "categoryId": "number",
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
  "amount": "number (decimal)",
  "date": "date",
  "description": "string | null",
  "categoryId": "number",
  "locationId": "number"
}
```

---

### Get Expenses
Retrieves a list of all expenses.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Expense`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `categoryId` (optional): Filter by category ID
- `locationId` (optional): Filter by location ID
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "expenses": [
    {
      "id": "number",
      "name": "string",
      "amount": "number (decimal)",
      "date": "date",
      "description": "string | null",
      "category": {
        "id": "number",
        "name": "string"
      },
      "locationId": "number"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

---

### Get Report Expenses
Retrieves expenses for reporting purposes.

- **URL**: `/reports`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Report`, `read:Expense`

**Query Parameters:**
- `startDate` (required): Report start date
- `endDate` (required): Report end date
- `groupBy` (optional): Group by (day, week, month, category)

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "summary": {
    "totalExpenses": "number",
    "averageExpense": "number",
    "expensesByCategory": [
      {
        "category": "string",
        "amount": "number",
        "count": "number"
      }
    ]
  },
  "data": [
    {
      "period": "string",
      "expenses": "number",
      "amount": "number"
    }
  ]
}
```

---

### Update Expense
Updates an existing expense.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Permissions**: `update:Expense`

**URL Parameters:**
- `id` (required): Expense ID

**Request Body:**
```json
{
  "name": "string",
  "amount": "number (decimal)",
  "date": "date (YYYY-MM-DD)",
  "description": "string (optional)",
  "categoryId": "number"
}
```

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "id": "number",
  "name": "string",
  "amount": "number (decimal)",
  "date": "date",
  "description": "string | null",
  "categoryId": "number"
}
```

---

### Delete Expense
Deletes an expense.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Permissions**: `delete:Expense`

**URL Parameters:**
- `id` (required): Expense ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "message": "Expense deleted successfully"
}
```
