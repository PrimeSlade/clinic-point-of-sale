# Service Module

Medical services catalog management.

## Features

- Service creation and management
- Retail price setting
- Service name uniqueness
- Service categorization

## Endpoints

- `POST /api/v1/services/add` - Create service
- `GET /api/v1/services` - List all services
- `PUT /api/v1/services/:id` - Update service
- `DELETE /api/v1/services/:id` - Remove service

## Related Documentation

- [Service API Reference](../api/service.md) - Detailed API documentation with request/response examples
- [Treatment Module](./treatment.md) - Services provided in treatments
- [Invoice Module](./invoice.md) - Service billing
