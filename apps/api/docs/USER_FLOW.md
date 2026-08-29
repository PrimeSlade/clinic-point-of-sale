# User Flow Documentation

## Overview

This document outlines the complete user flows for the Medical Clinic & Pharmacy Point-Of-Sale system. The system serves medical facilities and pharmacies with comprehensive patient management, inventory control, and financial tracking capabilities.

## User Roles

The system supports multiple user roles with different permission levels:

- **Administrator** - Full system access, manages users, roles, and locations
- **Manager** - Branch-level management, reports access, inventory oversight
- **Doctor** - Patient treatment, prescription creation
- **Pharmacist** - Inventory management, invoice creation
- **Receptionist** - Patient registration, appointment scheduling
- **Cashier** - Invoice processing, payment collection

## Core User Flows

### 1. Authentication Flow

#### Login Process

1. User navigates to login page
2. User enters email and password
3. System validates credentials
4. System generates JWT token
5. User redirected to dashboard based on role and permissions

#### Logout Process

1. User clicks logout button
2. System clears token cookie
3. User redirected to login page

---

### 2. Patient Management Flow

#### New Patient Registration

1. Receptionist clicks "Add Patient" button
2. System displays patient registration form
3. Receptionist enters patient information:
   - Name, age, gender
   - Phone number
   - Address
   - Patient status (new/follow-up/post-op)
   - Patient type (inpatient/outpatient)
   - Special conditions (if any)
4. System validates input data
5. System creates patient record linked to current location
6. System displays success message with patient ID
7. Patient appears in patient list

#### Patient Search & View

1. User enters search criteria (name, phone, or patient ID)
2. System filters patient list in real-time
3. User clicks on patient from list
4. System displays patient details including:
   - Personal information
   - Treatment history

#### Patient Update

1. User navigates to patient detail page
2. User clicks "Edit" button
3. System displays editable patient form with current data
4. User modifies information
5. System validates changes
6. System updates patient record
7. System displays success message

---

### 3. Doctor & Treatment Flow

#### Doctor Profile Management

1. Administrator adds new doctor profile
2. Administrator enters doctor information:
   - Name
   - Department (OG, OTO, Surgery, General)
   - Specialization
   - Location assignment
3. System creates doctor profile
4. Doctor becomes available for treatment assignment

#### Treatment Documentation

1. Doctor searches for patient
2. Doctor clicks "Add Treatment" on patient profile
3. System displays treatment form
4. Doctor enters treatment details:
   - Diagnosis
   - Prescribed medications (with dosage, frequency)
   - Additional notes
5. System validates treatment data
6. System saves treatment record linked to patient and doctor
7. Treatment appears in patient's history and treatment page

#### Treatment Review

1. User views patient profile
2. System displays list of all treatments
3. User clicks on specific treatment
4. System shows complete treatment details including:
   - Date and time
   - Doctor name
   - Diagnosis and prescriptions
   - Any follow-up notes

---

### 4. Inventory Management Flow

#### Adding New Medicine/Item

1. Pharmacist clicks "Add Item" button
2. System displays item creation form
3. Pharmacist enters item information:
   - Item name
   - Category
   - Barcode (auto-generated UUID if not provided)
   - Expiry date
   - Description (optional)
   - Unit type (bottle, ampule, tube, strip, capsule, pieces, sachet, box, package, tablet)
   - Rate (conversion rate for the unit)
   - Initial stock quantity
   - Purchase price per unit
4. System validates input
5. System creates item record for current location if user is not an admin (admin can select locations)
6. Item appears in inventory list

---

### 5. Service Management Flow

#### Service Creation

1. Administrator/Manager creates new service
2. Enters service details:
   - Service name (e.g., "X-Ray", "Blood Test")
   - Price
3. Service becomes available for invoicing

#### Service Pricing Updates

1. Manager navigates to services list
2. Manager clicks "Edit" on service
3. Manager updates price
4. System validates and saves new price
5. New price applies to future invoices only

---

### 6. Invoice & Sales Flow

#### Creating Invoice (Point of Sale)

1. Cashier clicks "New Invoice" button
2. System displays invoice creation form
3. Cashier selects patient (or creates walk-in customer)
4. Cashier adds items to invoice:

   **Adding Medicine/Items:**
   - Search and select item from inventory
   - Specify quantity
   - System shows available stock
   - System calculates retail price from purchase price using user's price percentage markup (retail price = purchase price + (purchase price × pricePercent / 100))
   - System calculates line total (quantity × retail price)
   - System checks if sufficient stock available

   **Adding Services:**
   - Select service from list
   - System adds service with preset price
   - Cashier can adjust price if permitted

5. System calculates subtotal
6. Cashier applies discount (if applicable):
   - Enter discount amount or percentage
   - System recalculates total
7. Cashier selects payment method:
   - Cash
   - KPay
   - Wave Pay
   - Others
8. System displays final total
9. Cashier confirms invoice
10. System processes invoice:
    - Deducts items from inventory
    - Records payment
    - Generates invoice number
11. System displays success message with invoice number
12. Cashier can print receipt

#### Invoice Correction/Deletion

1. Manager searches for invoice by number or date
2. Manager views invoice details
3. Manager clicks "Delete Invoice"
4. System displays confirmation dialog with warning
5. Manager confirms deletion
6. System processes deletion:
   - Returns items to inventory
   - Reverses payment record
   - Marks invoice as deleted
7. System displays success message

---

### 7. Financial Management Flow

#### Recording Expenses

1. Manager clicks "Add Expense"
2. System displays expense form
3. Manager enters expense details:
   - Amount
   - Category (utilities, rent, salaries, supplies, etc.)
   - Description
   - Date
   - Payment method
4. System validates and saves expense
5. Expense appears in expense list
6. System updates financial dashboard

#### Invoice Reports

1. Manager navigates to Reports section
2. Manager selects "Invoice Report"
3. Manager sets date range:
   - Start date
   - End date
4. System generates report showing:
   - Total sales amount
   - Number of invoices
5. Manager can print report

#### Expense Reports

1. Manager navigates to Reports section
2. Manager selects "Expense Report"
3. Manager sets date range and filters:
   - Date range
4. System generates report showing:
   - Total expenses

---

### 8. Multi-Location Management Flow

#### Location Setup

1. Administrator or user with location create permission creates new location/branch
2. User enters location details:
   - Location name
   - Address
   - Phone number
3. System creates location
4. Administrator or user with appropriate permissions assigns users to location

#### Location Management

1. Administrator or user with location read permission can view locations
2. Administrator or user with location update permission can edit location details
3. Administrator or user with location delete permission can remove locations
4. System enforces role-based access control for all location operations

#### Location-Based Data Filtering

1. User logs in
2. System loads user's assigned location
3. All data views automatically filtered by location:
   - Patients belong to specific location
   - Inventory is location-specific
   - Invoices show only location's sales
   - Reports generated for user's location only
4. Administrator or user with "manage all" permission can:
   - Switch between locations
   - Manage cross-location data

---

### 9. User & Role Management Flow

#### Creating New User

1. Administrator or user with user create permission navigates to Users section
2. User clicks "Add User"
3. User enters user details:
   - Name
   - Email
   - Initial password
   - Role selection
   - Location assignment
4. System validates input
5. System creates user account with hashed password
6. Administrator or user with role management permission assigns role permissions
7. New user receives credentials
8. User can login

#### Role & Permission Management

1. Administrator or user with role read permission views Roles list
2. Administrator or user with role update permission clicks on role to edit
3. System displays permissions matrix:
   - Actions: Create, Read, Update, Delete, Manage
   - Subjects: Patients, Items, Invoices, Users, Locations, Roles, etc.
   - Conditions: Own data only, Location-based, All data
4. User toggles permissions
5. System updates role
6. Changes apply to all users with that role immediately

---

### 10. Category Management Flow

#### Creating Categories

1. Administrator navigates to Categories
2. Administrator clicks "Add Category"
3. Administrator enters category name
4. Administrator selects category type:
   - Item Category (for inventory)
   - Service Category (for services)
   - Expense Category (for expenses)
5. System creates category
6. Category available for assignment

#### Category Assignment

1. When creating expenses
2. User selects category from dropdown
3. System links entity to category
4. Reports can be filtered by category

---

## Performance Considerations

### Optimized Workflows

1. Real-time search with debouncing
2. Paginated lists for large datasets
3. Cached frequently accessed data
4. Lazy loading for detailed views
5. Batch operations for bulk updates

---

## Conclusion

This user flow documentation provides a comprehensive overview of how different users interact with the Medical Clinic & Pharmacy Point-Of-Sale system. Each flow is designed with real-world medical facility operations in mind, ensuring efficiency, accuracy, and compliance with healthcare data management requirements.

For technical implementation details, refer to:

- [API Documentation](api/) - Endpoint specifications
- [Authorization Guide](AUTHORIZATION.md) - Permission system details
- [Database Schema](DATABASE.md) - Data model documentation
