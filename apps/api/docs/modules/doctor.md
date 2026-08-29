# Doctor Module

Doctor management with commission tracking for medical staff.

## Features

- Doctor profile creation
- Commission percentage tracking
- Phone number and email management
- Specialization descriptions
- Soft delete support
- Treatment assignment

## Endpoints

- `POST /api/v1/doctors/add` - Add new doctor
- `GET /api/v1/doctors` - List all doctors
- `PUT /api/v1/doctors/:id` - Update doctor info
- `DELETE /api/v1/doctors/:id` - Remove doctor (soft delete)

## Related Documentation

- [Doctor API Reference](../api/doctor.md) - Detailed API documentation with request/response examples
- [Treatment Module](./treatment.md) - Doctor-patient treatment records

## Best Practices

- Link to specific locations for multi-branch operations
- Use soft delete to maintain historical records
