# Invoice API

Base URL: `/api/v1/invoices`

All endpoints require authentication.

## Endpoints

### Create Invoice
Creates a new invoice.

- **URL**: `/add`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: `create:Invoice`

**Request Body:**
```json
{
  "treatmentId": "number (optional)",
  "locationId": "number",
  "invoiceItems": [
    {
      "barcode": "string",
      "itemName": "string",
      "unitType": "btl | amp | tube | strip | cap | pcs | sac | box | pkg | tab",
      "quantity": "number",
      "retailPrice": "number (decimal)",
      "discountPrice": "number (decimal)"
    }
  ],
  "invoiceServices": [
    {
      "name": "string",
      "retailPrice": "number (decimal)"
    }
  ],
  "totalItemDiscount": "number (decimal)",
  "subTotal": "number (decimal)",
  "discountAmount": "number (decimal)",
  "totalAmount": "number (decimal)",
  "paymentMethod": "kpay | wave | cash | others",
  "paymentDescription": "string (optional)",
  "note": "string (optional)"
}
```

**Success Response:**
- **Code**: 201
- **Content**: 
```json
{
  "id": "number",
  "treatmentId": "number | null",
  "locationId": "number",
  "totalItemDiscount": "number (decimal)",
  "subTotal": "number (decimal)",
  "discountAmount": "number (decimal)",
  "totalAmount": "number (decimal)",
  "paymentMethod": "kpay | wave | cash | others",
  "paymentDescription": "string | null",
  "note": "string | null",
  "invoiceItems": [
    {
      "id": "number",
      "barcode": "string",
      "itemName": "string",
      "unitType": "btl | amp | tube | strip | cap | pcs | sac | box | pkg | tab",
      "quantity": "number",
      "retailPrice": "number (decimal)",
      "discountPrice": "number (decimal)"
    }
  ],
  "invoiceServices": [
    {
      "id": "number",
      "name": "string",
      "retailPrice": "number (decimal)"
    }
  ],
  "createdAt": "datetime"
}
```

---

### Get Invoices
Retrieves a list of all invoices.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Invoice`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `locationId` (optional): Filter by location ID
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "invoices": [
    {
      "id": "number",
      "treatmentId": "number | null",
      "locationId": "number",
      "subTotal": "number (decimal)",
      "totalItemDiscount": "number (decimal)",
      "discountAmount": "number (decimal)",
      "totalAmount": "number (decimal)",
      "paymentMethod": "kpay | wave | cash | others",
      "createdAt": "datetime"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

---

### Get Report Invoices
Retrieves invoices for reporting purposes.

- **URL**: `/reports`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Report`, `read:Invoice`

**Query Parameters:**
- `startDate` (required): Report start date
- `endDate` (required): Report end date
- `groupBy` (optional): Group by (day, week, month)

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "summary": {
    "totalInvoices": "number",
    "totalRevenue": "number",
    "averageInvoiceValue": "number"
  },
  "data": [
    {
      "period": "string",
      "invoices": "number",
      "revenue": "number"
    }
  ]
}
```

---

### Get Invoice By ID
Retrieves a single invoice by its ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: `read:Invoice`

**URL Parameters:**
- `id` (required): Invoice ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "id": "number",
  "treatmentId": "number | null",
  "treatment": {
    "id": "number",
    "patient": {
      "id": "number",
      "name": "string"
    },
    "doctor": {
      "id": "string",
      "name": "string"
    }
  },
  "locationId": "number",
  "subTotal": "number (decimal)",
  "totalItemDiscount": "number (decimal)",
  "discountAmount": "number (decimal)",
  "totalAmount": "number (decimal)",
  "paymentMethod": "kpay | wave | cash | others",
  "paymentDescription": "string | null",
  "note": "string | null",
  "invoiceItems": [
    {
      "id": "number",
      "barcode": "string",
      "itemName": "string",
      "unitType": "btl | amp | tube | strip | cap | pcs | sac | box | pkg | tab",
      "quantity": "number",
      "retailPrice": "number (decimal)",
      "discountPrice": "number (decimal)"
    }
  ],
  "invoiceServices": [
    {
      "id": "number",
      "name": "string",
      "retailPrice": "number (decimal)"
    }
  ],
  "createdAt": "datetime"
}
```

---

### Delete Invoice
Deletes an invoice.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Permissions**: `delete:Invoice`

**URL Parameters:**
- `id` (required): Invoice ID

**Success Response:**
- **Code**: 200
- **Content**: 
```json
{
  "message": "Invoice deleted successfully"
}
```
