# Treatment Module

Patient treatment records and medical history management.

## Features

- Treatment record creation
- Patient-doctor-service linking
- Infinite scroll pagination support
- Treatment history tracking
- Follow-up date scheduling
- Diagnosis and prescription recording

## Endpoints

- `POST /api/v1/treatments/add` - Create treatment
- `GET /api/v1/treatments` - List all treatments (paginated)
- `GET /api/v1/treatments/infinite` - Get with cursor pagination (infinite scroll)
- `GET /api/v1/treatments/:id` - Get treatment details
- `PUT /api/v1/treatments/:id` - Update treatment
- `DELETE /api/v1/treatments/:id` - Remove treatment

## Related Documentation

- [Treatment API Reference](../api/treatment.md) - Detailed API documentation with request/response examples
- [Patient Module](./patient.md) - Patient information
- [Doctor Module](./doctor.md) - Doctor information

## Pagination Options

### Standard Pagination

Use `page` and `limit` parameters for traditional pagination:

```
GET /api/v1/treatments?page=1&limit=20
```

### Cursor-based Pagination

Use the `/infinite` endpoint for infinite scrolling:

```
GET /api/v1/treatments/infinite?cursor=abc123&limit=20
```

## Treatment Workflow

1. **Patient Check-in** - Register patient arrival
2. **Doctor Consultation** - Doctor examines patient
3. **Diagnosis** - Doctor determines condition
4. **Treatment Plan** - Create treatment record with prescription
5. **Billing** - Generate invoice for treatment
