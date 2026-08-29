---
id: auth-security
name: Auth and Security Skill
description: Authentication, authorization, session management, and security auditing patterns
tags:
  - authentication
  - authorization
  - security
  - jwt
  - rbac
  - abac
  - audit-logs
---

# Auth and Security Skill

**Scope**: Authentication, authorization, session management, and security auditing for the Point-Of-Sale Backend system.

## JWT vs Cookies: Decision Framework

### Current Implementation
The project uses **JWT tokens stored in signed cookies** - a hybrid approach combining both patterns.

```typescript
// Token stored in signed cookie (secure, httpOnly)
res.cookie('posToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  signed: true,
});
```

### JWT vs Cookies Comparison

#### **JWT (Stateless)**
**When to use**: Distributed systems, microservices, mobile apps, high-scale APIs

✅ **Advantages**:
- Stateless - no server-side session storage needed
- Self-contained - user info encoded in token
- Scales horizontally - any server can validate
- Good for multiple client types (web, mobile, SPAs)
- Works well with CORS/API Gateway patterns

❌ **Disadvantages**:
- Cannot revoke instantly (token valid until expiry)
- Token size increases with claims (larger cookies)
- Must rotate/refresh tokens carefully
- Requires HTTPS to prevent interception

**Use in this project**:
```typescript
// Sign JWT with user claims
const token = jwt.sign(
  { id: user.id, locationId: user.locationId, roleId: user.roleId },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

#### **Cookies (Stateful)**
**When to use**: Traditional web apps, server-side rendering, simpler deployment

✅ **Advantages**:
- Server controls session lifetime (instant revocation possible)
- Browser sends automatically (no manual header handling)
- Smaller payload (just session ID)
- Built-in CSRF protection with SameSite

❌ **Disadvantages**:
- Requires server-side session storage (Redis/Database)
- Doesn't scale well across distributed servers
- CORS complexity
- Not ideal for mobile/native apps

### Hybrid Approach (Current Choice)
**JWT stored in signed, httpOnly cookie** - Best of both worlds:
- ✅ JWT benefits: Stateless validation, scalable
- ✅ Cookie benefits: Auto-transmission, browser security (httpOnly), CSRF protection (SameSite)
- ✅ Signed cookies: Tamper-proof validation

**Trade-off**: Small cookie size overhead vs. complete stateless design benefits.

### When to Consider Changes

| Scenario | Recommendation | Reason |
|----------|---|---|
| Need instant token revocation | Add token blacklist/session store | Check Redis before accepting token |
| Multi-domain/API Gateway | Keep JWT in cookie | Auto-transmission across domains |
| Mobile app support | Add separate endpoint | Issue JWT without cookie for API clients |
| Scale to 100k+ concurrent | Current approach is fine | Stateless validation scales infinitely |
| User force-logout needed | Implement token blacklist | Real-time session termination |

---

## RBAC (Role-Based Access Control)

### Current Implementation
The project uses **CASL (ABAC)**, which is more powerful than simple RBAC, but RBAC is the foundation.

```prisma
model User {
  id        String
  role      Role
  locationId Int  // Multi-tenancy key
}

model Role {
  name        String
  permissions Permission[]
}

model Permission {
  action  String  // "create", "read", "update", "delete", "manage"
  subject String  // "all", "Patient", "Invoice", "Item", etc.
  roles   Role[]  // Many-to-many
}
```

### Role Hierarchy (Current Roles)

**Admin** (Full Access)
- Manage all resources at location
- Create/edit/delete users and roles
- Access audit logs
- Configure permissions
- Permissions: `manage:all`

**Manager** (Operational Control)
- Create/read/update invoices, patients, inventory
- Generate reports
- Cannot delete critical data (invoices, users)
- Cannot modify permissions
- Permissions: `create,read,update:Patient,Doctor,Item,Service,Invoice`

**Cashier** (Operational Limited)
- Read patients, create invoices only
- Cannot edit/delete invoices
- Cannot access financial reports or user management
- Permissions: `read:Patient`, `create:Invoice`, `read:Invoice`

**Doctor** (View Only)
- Read patient records
- Create treatment records
- Cannot access financial data
- Permissions: `read:Patient`, `create:Treatment`, `read:Treatment`

### Adding New Roles

**Process**:
1. Define role in seed script (`prisma/seeds/seed.ts`)
2. Create permission set in seed
3. Link permissions to role
4. Define ability rules in `src/abilities/`
5. Add role to middleware if custom auth needed

**Example: Adding "Pharmacist" Role**
```typescript
// 1. Seed definition
const pharmacist = await prisma.role.create({
  data: {
    name: 'Pharmacist',
    permissions: {
      connect: [
        { id: readItemPerm.id },
        { id: updateItemPerm.id },
        { id: readInvoicePerm.id },
      ],
    },
  },
});

// 2. Ability rule
defineAbility((can, cannot) => {
  can('read', 'Item');
  can('update', 'Item');
  can('read', 'Invoice');
  cannot('create', 'Invoice'); // Can't create invoices
});
```

### RBAC vs ABAC

**This project uses ABAC (Attribute-Based Access Control)** via CASL:
- More flexible than RBAC
- Can check attributes: `can('read', 'Patient', { locationId: user.locationId })`
- Example: Managers only see patients at their location

```typescript
// ABAC in action
can('read', 'Patient', { locationId: user.locationId });
can('read', 'Invoice', { status: 'completed' });
```

---

## Session Handling

### Token Lifecycle

**1. Login Flow**
```
User credentials → Validation → JWT issued → Stored in signed cookie → Set expiry (24h default)
```

**2. Request Flow**
```
Browser sends cookie (automatic) → verifyAuth middleware → Extract JWT → Validate signature → Load user abilities
```

**3. Logout Flow**
```
User requests logout → Clear cookie → (Optional) Add to blacklist → Send response
```

### Configuration

**Token Expiry** (`.env`)
```bash
# 24 hours - balance between security and UX
JWT_EXPIRES_IN=24h
# Refresh token (if implemented) - 7 days
REFRESH_TOKEN_EXPIRES=7d
```

**Cookie Settings** (`src/config/`)
```typescript
const cookieOptions = {
  httpOnly: true,           // JavaScript cannot access (XSS protection)
  secure: isProduction,     // HTTPS only (in production)
  sameSite: 'strict',       // CSRF protection
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};
```

### Implementing Session Revocation

**Use Case**: User logs out or admin terminates session

**Option 1: Token Blacklist (Simple)**
```typescript
// In-memory or Redis
const tokenBlacklist = new Set();

// On logout
tokenBlacklist.add(token);

// In middleware
if (tokenBlacklist.has(token)) {
  throw new UnauthorizedError('Token revoked');
}
```

**Option 2: Session Store (Robust)**
```typescript
// Store in database
const session = await prisma.session.create({
  data: {
    userId: user.id,
    token: hashedToken,
    expiresAt: new Date(Date.now() + 24h),
  },
});

// Validate: check session exists and not revoked
const session = await prisma.session.findFirst({
  where: { token: hashedToken, expiresAt: { gt: now } },
});
```

### Refresh Tokens (When to Implement)

**Not currently implemented** - Consider adding if:
- Users complain about frequent re-login
- API clients need long-lived access without re-authentication
- Mobile apps need offline capability

**Implementation**:
1. Issue refresh token (expires in 7 days) separately
2. Access token expires in 15 minutes
3. When access token expires, use refresh to get new one
4. Refresh token blacklist for revocation

---

## Audit Logs

### Purpose
Track all security-relevant actions for compliance, debugging, and forensics.

### What to Log

**Always Log**:
- ✅ Login/logout attempts (success & failure)
- ✅ Permission changes (role, permission assignments)
- ✅ Data modifications (create, update, delete)
- ✅ Failed authorization (attempted access denial)
- ✅ Admin actions (user creation, deletion, role changes)

**Consider Logging**:
- ⚠️ Bulk operations (invoice creation, data exports)
- ⚠️ Report generation
- ⚠️ Sensitive reads (patient PII access)
- ⚠️ Failed validations (input errors)

**Don't Log**:
- ❌ Read operations (unless sensitive data)
- ❌ Every HTTP request (use request logging instead)
- ❌ Passwords or tokens (only hash if needed)

### Implementation Pattern

**Create audit log entry**:
```typescript
// src/services/audit.ts
export const logAudit = async (
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  changes?: Record<string, any>,
  status: 'success' | 'failure' = 'success'
) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,           // 'login', 'create', 'update', 'delete'
      resource,         // 'Invoice', 'User', 'Permission'
      resourceId,
      changes,          // Before/after values
      status,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
    },
  });
};
```

### Database Schema

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  action      String   // login, logout, create, update, delete, permission_change
  resource    String   // Invoice, User, Patient, Item, etc.
  resourceId  String   // ID of affected resource
  
  changes     Json?    // {before: {...}, after: {...}}
  status      String   // success, failure
  errorMsg    String?  // If failure, why?
  
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@index([resource])
  @@index([createdAt])
}
```

### Query Examples

```typescript
// Find all failed login attempts in last 24h
const failedLogins = await prisma.auditLog.findMany({
  where: {
    action: 'login',
    status: 'failure',
    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  },
});

// Find all changes to a specific invoice
const invoiceChanges = await prisma.auditLog.findMany({
  where: {
    resource: 'Invoice',
    resourceId: invoiceId,
  },
  orderBy: { createdAt: 'desc' },
});

// Find user's last 20 actions
const userActions = await prisma.auditLog.findMany({
  where: { userId },
  take: 20,
  orderBy: { createdAt: 'desc' },
});
```

### Audit Log API Endpoint

```typescript
// GET /api/v1/audit-logs?action=login&resource=User&days=7
// Only accessible to Admin
router.get('/audit-logs', verifyAuth, async (req, res) => {
  const { action, resource, days = 30 } = req.query;
  
  // Check authorization
  if (!req.user.ability.can('read', 'AuditLog')) {
    throw new ForbiddenError('Access denied');
  }
  
  const logs = await prisma.auditLog.findMany({
    where: {
      ...(action && { action }),
      ...(resource && { resource }),
      createdAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  
  res.json({ data: logs });
});
```

### Retention & Archival

**Policy** (adjust based on compliance needs):
- Keep audit logs for **1 year** in active database
- Archive older logs to cold storage (S3/archive DB)
- GDPR: Delete logs for deleted users after 1 year

```typescript
// Cleanup job (run daily)
const archiveOldLogs = async () => {
  const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const oldLogs = await prisma.auditLog.findMany({
    where: { createdAt: { lt: cutoff } },
  });
  
  // Archive to S3/cold storage
  await s3.upload({ key: 'audit-logs-archive', body: JSON.stringify(oldLogs) });
  
  // Delete from active DB
  await prisma.auditLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
};
```

---

## Security Checklists

### When Adding New Endpoints

- [ ] Authentication required? Add `verifyAuth` middleware
- [ ] Authorization check? Use `req.user.ability.can()`
- [ ] Input validation? Use Zod schema
- [ ] Sensitive data? Ensure audit log entry
- [ ] Location filtering? Include `locationId` in query
- [ ] Rate limiting? Add if public endpoint
- [ ] Error messages? Avoid leaking system details

### Before Deployment

- [ ] JWT_SECRET changed from default
- [ ] COOKIE_SECRET changed from default
- [ ] HTTPS enabled in production
- [ ] CORS origins restricted
- [ ] Helmet security headers configured
- [ ] Database credentials in .env (not hardcoded)
- [ ] Audit logs enabled
- [ ] Rate limiting configured
- [ ] OWASP Top 10 review completed

### Regular Security Tasks

- [ ] Review audit logs weekly for anomalies
- [ ] Rotate JWT_SECRET quarterly
- [ ] Check for abandoned sessions
- [ ] Review user permissions monthly
- [ ] Test token expiration behavior
- [ ] Verify location-based isolation working

---

## Common Auth & Security Tasks

### Task: Add JWT Refresh Token
1. Create refresh token schema in Prisma
2. Issue refresh token on login (7-day expiry)
3. Create `/api/v1/auth/refresh` endpoint
4. Return new access token when refresh token valid
5. Invalidate refresh token on logout

### Task: Implement Password Reset
1. Create reset token (6-digit code, 15-min expiry)
2. Send via email
3. Validate code, create new password
4. Invalidate old sessions
5. Log password change in audit

### Task: Add Two-Factor Authentication (2FA)
1. Generate TOTP secret on first login
2. User scans QR code in authenticator app
3. Require code on login for multi-device accounts
4. Store backup codes for account recovery
5. Audit log all 2FA changes

### Task: Implement API Key Auth
1. Generate cryptographically secure keys
2. Hash keys before storing
3. Create `/api/v1/api-keys` management
4. Support key rotation
5. Audit all API key usage

---

## References

- **JWT Best Practices**: https://tools.ietf.org/html/rfc8949
- **OWASP Authentication Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- **CASL Documentation**: https://casl.js.org/
- **Express Security**: https://expressjs.com/en/advanced/best-practice-security.html
- **Node.js Security Checklist**: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

---

**Last Updated**: March 2026  
**Skill Owner**: Security Architecture Team  
**Related Files**:
- `src/middlewares/verifyAuth.ts` - Authentication middleware
- `src/abilities/` - Authorization rules
- `src/services/auth.ts` - Auth business logic
- `prisma/schema.prisma` - Data models
