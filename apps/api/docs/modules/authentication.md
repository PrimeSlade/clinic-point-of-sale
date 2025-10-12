# Authentication Module

Handles user registration, login, and logout with JWT tokens.

## Features

- User signup with email and password
- Secure login with JWT token generation
- Logout functionality

## Endpoints

- `POST /api/v1/auth/signup` - Create new user account
- `POST /api/v1/auth/login` - Authenticate user
- `POST /api/v1/auth/logout` - End user session

## Related Documentation

- [Authentication API Reference](../api/auth.md) - Detailed API documentation with request/response examples
- [User Module](./user.md) - User management after authentication
- [Role Module](./role.md) - ABAC with role assignment
- [Permission Module](./permission.md) - Granular ABAC permissions

## Implementation Details

### Authentication Flow

1. **Signup**: User provides email, password, and name
2. **Login**: User authenticates with email and password, receives JWT token
3. **Logout**: Token is invalidated on the server side

### Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Secure session management
- Token expiration handling
