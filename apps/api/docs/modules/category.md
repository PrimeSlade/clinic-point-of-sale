# Category Module

Expense categorization system for financial organization.

## Features

- Category creation and management
- Description support
- Location-based categories
- Hierarchical organization

## Endpoints

- `POST /api/v1/categories/add` - Create category
- `GET /api/v1/categories` - List categories
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Remove category

## Data Tracked

- Category name
- Description
- Associated location
- Creation timestamp

## Related Documentation

- [Category API Reference](../api/category.md) - Detailed API documentation with request/response examples
- [Expense Module](./expense.md) - Use categories for expense tracking
- [Item Module](./item.md) - Use categories for item classification
