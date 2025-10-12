# Location Module

Multi-branch management system for distributed operations.

## Features

- Location/branch creation
- Phone number assignment
- Address tracking
- Multi-location data segregation

## Endpoints

- `POST /api/v1/locations/add` - Create location
- `GET /api/v1/locations` - List all locations
- `PUT /api/v1/locations/:id` - Update location
- `DELETE /api/v1/locations/:id` - Remove location

## Related Documentation

- [Location API Reference](../api/location.md) - Detailed API documentation with request/response examples

## Multi-Location Architecture

The system is designed for multi-branch operations where:

- Each location maintains its own inventory
- Patients are registered at specific locations
- Doctors work at specific locations
- Users have access to specific locations
- Expenses are tracked per location

## Best Practices

- Use clear, distinguishable location names
- Keep location information up to date
- Assign users to appropriate locations
- Track inventory separately per location
- Generate location-specific reports
- Consider access controls per location
- Plan for location-to-location transfers
- Maintain consistent branding across locations
- Set up location-specific permissions
