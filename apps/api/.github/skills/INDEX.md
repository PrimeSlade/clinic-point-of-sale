---
id: skills-index
name: Project Skills Index
description: Catalog of specialized skills available for this project
---

# Project Skills

This directory contains specialized knowledge domains (skills) for enhancing Copilot's capabilities when working on this project.

## Available Skills

### 1. **Auth & Security Skill** (`auth-security.skill.md`)
Handles authentication, authorization, session management, and security auditing.

**Covers**:
- JWT vs Cookies decision framework
- RBAC implementation (admin, cashier, manager roles)
- Session handling & token lifecycle
- Audit logging patterns
- Security checklists

**Use when working on**:
- Authentication endpoints
- Permission systems
- User role management
- Session revocation
- Security improvements
- Audit trail implementation

**Key Files Affected**:
- `src/middlewares/verifyAuth.ts`
- `src/abilities/`
- `src/services/auth.ts`
- `prisma/schema.prisma`

### 2. **API Design Skill** (`api-design.skill.md`)
Handles REST API structure, validation patterns, DTO design, and centralized error handling.

**Covers**:
- RESTful endpoint structure and conventions
- API versioning strategy (`/api/v1/`)
- Query parameters (filtering, pagination, sorting)
- Zod-based input validation
- DTO patterns (input/output separation)
- Error hierarchy and handling
- Response format standardization
- Testing API layer

**Use when working on**:
- Creating new API endpoints
- Refactoring existing endpoints
- Adding validation logic
- Improving error handling
- Designing request/response contracts
- Documenting APIs

**Key Files Affected**:
- `src/routes/`
- `src/controllers/`
- `src/types/` (DTOs and validation schemas)
- `src/middlewares/validate.ts` & `errorHandler.ts`
- `src/errors/`

---

## How to Use Skills

### In Copilot CLI
```bash
/skills  # Browse and enable/disable skills
```

### In Your Code
Reference skill knowledge when asking Copilot for help:

**Good**: "Add password reset following the Auth & Security Skill patterns"
**Better**: "Implement password reset with audit logging, following our Auth & Security Skill"

### What Skills Provide
- **Best practices** specific to this project
- **Decision frameworks** for architectural choices
- **Implementation patterns** with examples
- **Security checklists** for completeness
- **Common task templates** for faster development

---

## Adding New Skills

To add a skill for a new domain:

1. Create a new file: `.github/skills/{domain}.skill.md`
2. Follow the template structure (overview, patterns, checklists)
3. Include real examples from the codebase
4. Link to relevant files and documentation
5. Update this `INDEX.md` with the new skill

---

**Last Updated**: March 2026  
**Project**: Point-Of-Sale Backend
