# Item/Inventory Module

Comprehensive inventory management for medicines and medical supplies.

## Features

- Barcode generation (UUID)
- Category
- Expiry date tracking
- Multiple unit types with individual pricing
- Stock quantity management
- Bulk import from Excel
- Bulk export to Excel
- Location-based inventory

## Endpoints

- `POST /api/v1/items/add` - Add new item
- `GET /api/v1/items` - List items (with pagination)
- `GET /api/v1/items/:id` - Get item details
- `PUT /api/v1/items/:id` - Update item
- `DELETE /api/v1/items/:id` - Remove item
- `POST /api/v1/items/import` - Bulk import (Excel)
- `GET /api/v1/items/export` - Bulk export (Excel)

## Supported Unit Types

- `tab` - Tablet
- `strip` - Strip
- `btl` - Bottle
- `cap` - Capsule
- `amp` - Ampoule
- `tube` - Tube
- `sac` - Sachet
- `box` - Box
- `pkg` - Package
- `pcs` - Pieces

## Related Documentation

- [Item API Reference](../api/item.md) - Detailed API documentation with request/response examples
- [Category Module](./category.md) - Item categorization
- [Invoice Module](./invoice.md) - Item sales and billing
- [Location Module](./location.md) - Multi-branch inventory

## Import/Export Features

### Excel Import

Upload Excel files with inventory data to bulk add items.

### Excel Export

Download inventory data in Excel format for:

- Backup purposes
- Analysis in spreadsheet software
- Sharing with external systems

## Best Practices

- Track expiry dates
- Use barcode scanning for faster checkout
- Use bulk import for initial setup
- Export data regularly for backup
- Categorize items for easy searching
- Track multiple unit types for flexible pricing
