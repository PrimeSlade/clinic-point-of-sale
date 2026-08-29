# Invoice Module

Comprehensive billing and invoice management system.

## Features

- Invoice generation with auto-numbering
- Item and service billing
- Discount calculations
- Invoice history and reports
- Date-range filtering

## Endpoints

- `POST /api/v1/invoices/add` - Create invoice
- `GET /api/v1/invoices` - List all invoices
- `GET /api/v1/invoices/reports` - Get invoice reports
- `GET /api/v1/invoices/:id` - Get invoice details
- `DELETE /api/v1/invoices/:id` - Remove invoice

## Related Documentation

- [Invoice API Reference](../api/invoice.md) - Detailed API documentation with request/response examples
- [Patient Module](./patient.md) - Patient billing information
- [Item Module](./item.md) - Items for sale
- [Service Module](./service.md) - Services provided
- [Expense Module](./expense.md) - Track business expenses

## Invoice Components

### Items

Physical products from inventory:

- Medicine
- Medical supplies
- Equipment

### Services

Medical services provided:

- Consultations
- Procedures
- Tests

### Calculations

- **Subtotal** = Sum of all items and services
- **Discount** = Percentage or fixed amount off
- **Tax** = Applied tax rate
- **Total** = Subtotal - Discount + Tax

## Reporting Features

Generate revenue reports with:

- Total invoices count
- Total revenue
- Revenue by period (day, week, month)

## Best Practices

- Verify patient information before billing
- Apply discounts transparently
- Keep detailed notes on invoices
- Use reports for financial analysis
- Provide receipts to patients
