# Patient Module

Complete patient record management system for medical facility operations.

## Features

- Patient registration
- Phone number management
- Medical status tracking (new patient, follow-up, post-op)
- Patient condition tracking (disability, pregnancy)
- Patient type classification (in-patient, out-patient)
- Department assignment (OB/GYN, ENT, surgery, general)
- Soft delete support (maintains history)
- Treatment history viewing

## Endpoints

- `POST /api/v1/patients/add` - Register new patient
- `GET /api/v1/patients` - List all patients
- `GET /api/v1/patients/:id` - Get patient details
- `PUT /api/v1/patients/:id` - Update patient info
- `DELETE /api/v1/patients/:id` - Remove patient (soft delete)

## Related Documentation

- [Patient API Reference](../api/patient.md) - Detailed API documentation with request/response examples
- [Treatment Module](./treatment.md) - Patient treatment records
- [Invoice Module](./invoice.md) - Patient billing
- [Location Module](./location.md) - Multi-branch patient management

## Patient Status Types

- **New Patient** - First-time visit
- **Follow-up** - Returning for continued care
- **Post-op** - Post-operative care

## Patient Conditions

- **Disability** - Physical or mental disability
- **Pregnancy** - Pregnant patients

## Patient Types

- **In-patient** - Admitted to the facility
- **Out-patient** - Outpatient care only

## Departments

- **OB/GYN** - Obstetrics and Gynecology
- **ENT** - Ear, Nose, and Throat
- **Surgery** - Surgical department
- **General** - General medicine

## Best Practices

- Always collect accurate contact information
- Use soft delete to maintain patient records
- Verify patient identity before accessing records
- Respect patient privacy and confidentiality
