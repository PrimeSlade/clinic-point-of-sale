# User Module

Staff user account management and access control.

## Features

- User creation and management
- Role assignment
- Location assignment
- Price percentage setting (for pricing tiers)
- Password hashing with bcrypt
- User authentication

## Endpoints

- `POST /api/v1/users/add` - Create user
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Remove user

## Related Documentation

- [User API Reference](../api/user.md) - Detailed API documentation with request/response examples
- [Authentication Module](./authentication.md) - User authentication
- [Role Module](./role.md) - ABAC system with roles
- [Permission Module](./permission.md) - Granular ABAC permissions
- [Location Module](./location.md) - Multi-branch access

## Price Percentage (Profit Margin)

The price percentage field determines the profit margin when generating invoices. It's the markup percentage added to the purchase price to calculate the retail price.

### Formula:
```javascript
Retail Price = Purchase Price + (Purchase Price × pricePercent / 100)

// Example with pricePercent = 30:
// Purchase Price: $10.00
// Retail Price: $10.00 + ($10.00 × 30 / 100) = $13.00
// Profit: $3.00
```

### Use Cases:

- **pricePercent: 30** - 30% markup (Purchase $10 → Retail $13)
- **pricePercent: 50** - 50% markup (Purchase $10 → Retail $15)
- **pricePercent: 100** - 100% markup (Purchase $10 → Retail $20)

This allows different users/counters to apply different profit margins when creating invoices.
