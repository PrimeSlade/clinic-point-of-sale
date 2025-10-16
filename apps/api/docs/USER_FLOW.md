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
4. System generates JWT access token and refresh token
5. Access token stored in memory, refresh token in HTTP-only cookie
6. User redirected to dashboard based on role and permissions

#### Session Management
1. Access token expires after 15 minutes
2. Client automatically requests new access token using refresh token
3. Refresh token expires after 7 days
4. User must re-login after refresh token expiry

#### Logout Process
1. User clicks logout button
2. System clears refresh token cookie
3. Client removes access token from memory
4. User redirected to login page

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
   - Invoice history
   - Total spending

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
   - Chief complaint
   - Diagnosis
   - Prescribed medications (with dosage, frequency)
   - Additional notes
5. System validates treatment data
6. System saves treatment record linked to patient and doctor
7. Treatment appears in patient's history

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
   - Initial stock quantity
   - Unit type (bottle, ampule, tablet, etc.)
   - Price per unit
   - Expiry date
   - Reorder level (minimum stock alert)
4. System validates input
5. System creates item record for current location
6. Item appears in inventory list

#### Stock Management
1. Pharmacist views inventory dashboard
2. System displays items with:
   - Current stock levels
   - Items below reorder level (highlighted)
   - Items near expiry (warning indicators)
3. Pharmacist clicks "Update Stock" on item
4. Pharmacist enters stock adjustment:
   - Quantity to add/remove
   - Reason for adjustment
5. System updates inventory level
6. System logs stock movement

#### Low Stock Alerts
1. System automatically monitors stock levels
2. When item quantity falls below reorder level:
   - System highlights item in inventory list
   - System displays notification badge
3. Manager reviews low stock items
4. Manager initiates purchase order

---

### 5. Service Management Flow

#### Service Creation
1. Administrator/Manager creates new service
2. Enters service details:
   - Service name (e.g., "X-Ray", "Blood Test")
   - Category
   - Price
   - Description
3. System saves service to location
4. Service becomes available for invoicing

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
   - System calculates line total (quantity × unit price)
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
    - Updates patient spending history
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
   - Logs deletion action with user and timestamp
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

#### Sales Reports
1. Manager navigates to Reports section
2. Manager selects "Sales Report"
3. Manager sets date range:
   - Start date
   - End date
4. System generates report showing:
   - Total sales amount
   - Number of invoices
   - Sales by payment method
   - Top selling items
   - Sales by category
5. Manager can export to Excel
6. Manager can print report

#### Expense Reports
1. Manager navigates to Reports section
2. Manager selects "Expense Report"
3. Manager sets date range and filters:
   - Date range
   - Category filter (optional)
   - Payment method filter (optional)
4. System generates report showing:
   - Total expenses
   - Breakdown by category
   - Breakdown by payment method
   - Expense trends
5. Manager can export to Excel

#### Profit/Loss Analysis
1. Manager views financial dashboard
2. System displays:
   - Total revenue (from invoices)
   - Total expenses
   - Net profit/loss
   - Period comparison
3. Manager can drill down into:
   - Revenue sources
   - Expense categories
   - Profit margins by item/service

---

### 8. Multi-Location Management Flow

#### Location Setup
1. Administrator creates new location/branch
2. Administrator enters location details:
   - Location name
   - Address
   - Phone number
   - Operating hours
3. System creates location
4. Administrator assigns users to location

#### Location-Based Data Filtering
1. User logs in
2. System loads user's assigned location
3. All data views automatically filtered by location:
   - Patients belong to specific location
   - Inventory is location-specific
   - Invoices show only location's sales
   - Reports generated for user's location only
4. Administrator with "manage all" permission can:
   - Switch between locations
   - View consolidated reports
   - Manage cross-location data

---

### 9. User & Role Management Flow

#### Creating New User
1. Administrator navigates to Users section
2. Administrator clicks "Add User"
3. Administrator enters user details:
   - Name
   - Email
   - Initial password
   - Role selection
   - Location assignment
4. System validates input
5. System creates user account with hashed password
6. System assigns role permissions
7. New user receives credentials
8. User can login and must change password on first login

#### Role & Permission Management
1. Administrator views Roles list
2. Administrator clicks on role to edit
3. System displays permissions matrix:
   - Actions: Create, Read, Update, Delete, Manage
   - Subjects: Patients, Items, Invoices, Users, etc.
   - Conditions: Own data only, Location-based, All data
4. Administrator toggles permissions
5. System updates role
6. Changes apply to all users with that role immediately

#### User Deactivation
1. Administrator searches for user
2. Administrator clicks "Deactivate"
3. System confirms action
4. System deactivates user account
5. User cannot login until reactivated
6. User's historical data preserved

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
1. When creating items, services, or expenses
2. User selects category from dropdown
3. System links entity to category
4. Reports can be filtered by category

---

## Advanced Workflows

### Daily Opening Procedure
1. Cashier/Receptionist logs in
2. System displays dashboard with:
   - Pending appointments
   - Low stock alerts
   - Daily summary
3. Staff reviews notifications
4. Staff prepares for patient visits

### End of Day Procedure
1. Manager runs daily sales report
2. Manager verifies cash reconciliation:
   - Compare actual cash with system records
   - Record any discrepancies
3. Manager reviews pending invoices
4. Manager backs up critical data
5. Staff logs out

### Prescription to Sale Flow (Complete)
1. Patient visits clinic
2. Receptionist registers/updates patient
3. Doctor examines patient and creates treatment record
4. Doctor prescribes medications in treatment notes
5. Patient goes to pharmacy
6. Pharmacist reviews treatment notes
7. Pharmacist creates invoice:
   - Adds prescribed medicines
   - Adds any medical supplies used
   - Adds consultation service fee
8. Patient makes payment
9. Pharmacist dispenses medication
10. System updates all records automatically

### Inventory Reorder Flow
1. System alerts low stock items
2. Pharmacist reviews reorder list
3. Pharmacist checks vendor catalogs
4. Pharmacist places order with supplier
5. Upon delivery:
   - Pharmacist verifies items against order
   - Pharmacist updates stock levels
   - Pharmacist records expiry dates
6. System updates inventory

---

## Error Handling & Edge Cases

### Insufficient Stock During Invoice Creation
1. Cashier attempts to add item to invoice
2. System checks available stock
3. If insufficient stock:
   - System displays error message
   - System shows available quantity
   - Cashier can adjust quantity or remove item

### Duplicate Patient Detection
1. Receptionist enters new patient details
2. System checks for existing patients with same phone number
3. If potential duplicate found:
   - System displays warning with existing patient details
   - Receptionist can view existing patient
   - Receptionist can proceed with new registration if confirmed different person

### Expired Medicine Handling
1. System monitors item expiry dates
2. Items expiring within 30 days highlighted with warning
3. System prevents use of expired items in invoices
4. Pharmacist must remove expired items from inventory

### Payment Failure Recovery
1. During invoice creation, payment processing fails
2. System does not finalize invoice
3. Inventory not deducted
4. Cashier retries payment or cancels invoice
5. No partial transactions recorded

### Session Timeout Handling
1. User inactive for extended period
2. Access token expires
3. System attempts refresh
4. If refresh fails:
   - System saves draft data (if applicable)
   - System redirects to login
   - User can resume after re-authentication

---

## Mobile/Responsive Considerations

### Mobile Access
1. System responsive design adapts to screen size
2. Key mobile workflows:
   - Quick patient lookup
   - Simple invoice creation
   - Stock level checking
   - Treatment documentation
3. Touch-optimized interfaces for frequently used actions
4. Barcode scanning support for inventory management

---

## Security & Audit Trail

### Permission Checks
1. Every action validated against user permissions
2. Location-based data isolation enforced
3. Sensitive operations require re-authentication
4. Failed permission attempts logged

### Audit Logging
1. System logs critical actions:
   - Invoice creation/deletion
   - Inventory adjustments
   - User management changes
   - Permission modifications
2. Logs include:
   - User performing action
   - Timestamp
   - Action details
   - Before/after values
3. Administrators can review audit logs

---

## Integration Points

### Future Integration Capabilities
1. Lab systems integration for test results
2. Appointment scheduling system
3. SMS notifications for patients
4. Email receipts for invoices
5. Accounting software export
6. Government health reporting systems
7. Insurance claim processing

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
- [Authorization Guide](authorization.md) - Permission system details
- [Database Schema](database.md) - Data model documentation
