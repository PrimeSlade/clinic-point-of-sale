# Expense Module

Business expense tracking and financial management.

## Features

- Expense recording
- Category-based organization
- Date-range filtering
- Expense reports and analytics
- Receipt/document tracking
- Location-based expenses

## Endpoints

- `POST /api/v1/expenses/add` - Create expense
- `GET /api/v1/expenses` - List all expenses
- `GET /api/v1/expenses/reports` - Generate expense reports
- `PUT /api/v1/expenses/:id` - Update expense
- `DELETE /api/v1/expenses/:id` - Remove expense

## Related Documentation

- [Expense API Reference](../api/expense.md) - Detailed API documentation with request/response examples
- [Category Module](./category.md) - Expense categorization
- [Location Module](./location.md) - Multi-branch expense tracking
- [Invoice Module](./invoice.md) - Revenue tracking

## Reporting Features

Generate expense reports with:

- Total expenses
- Expenses by category
- Expenses by period (day, week, month)
