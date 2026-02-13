# Tests for Copilot Instructions

## Core Feature Tests

### 1. Data Layer Pattern Compliance

**File**: `__tests__/lib/data-layer-pattern.test.ts`

Test that each feature domain follows the required structure:

- `actions.ts` exists and uses `"use server"` directive
- `queries.ts` contains only read operations with no auth logic
- `mutations.ts` validates input before write operations
- `types.ts` defines domain interfaces
- `validators.ts` exports Zod schemas
- Action flow correctly routes: Component → actions → mutations → database

### 2. Type Safety Enforcement

**File**: `__tests__/lib/type-safety.test.ts`

Verify no unsafe typing practices:

- No `any` types exist in source files (whitelist only where unavoidable)
- Functions have explicit return types
- Props interfaces are properly defined
- Zod validators match corresponding TypeScript types

### 3. React Component Size & Structure

**File**: `__tests__/app/components/component-limits.test.ts`

Ensure components comply with architectural limits:

- No component exceeds 250 lines
- useEffect dependencies are properly declared (no eslint-disable)
- useCallback wraps callbacks passed to children/external dependencies
- Component logic is extracted into custom hooks when reusable

### 4. File Organization & Size

**File**: `__tests__/lib/file-organization.test.ts`

Validate project structure:

- No file exceeds 300 lines
- Components are organized by feature domain, not by type
- Feature files follow naming convention (`features/domain/FileName.tsx`)
- Import paths use `@/` alias consistently

### 5. Security Practices

**File**: `__tests__/lib/security.test.ts`

Check for common security issues:

- No hardcoded secrets, API keys, or connection strings in source
- Server actions validate user input before processing
- Database queries use parameterized statements (Supabase client methods)
- Sensitive data is not logged

### 6. Git Workflow Compliance

**File**: `__tests__/git/commit-frequency.test.ts`

Monitor commit health (advisory, not automated):

- Commits represent logical changes (not massive multi-file dumps)
- Commit messages use imperative mood and describe the change
- No commits with vague messages like "Fix", "Updates", "WIP"

### 7. Supabase Client Usage

**File**: `__tests__/lib/supabase-patterns.test.ts`

Verify correct Supabase setup:

- Browser components import from `@/lib/supabase/client`
- Server actions use `getSupabaseWithAuth()` helper
- Middleware uses `@/lib/supabase/middleware` for session refresh
- No direct instantiation of SupabaseClient in components

### 8. Function Complexity & Length

**File**: `__tests__/lib/function-rules.test.ts`

Check function quality:

- Functions average 20-40 lines (flag outliers)
- Early returns preferred over nested conditionals
- Function names are verbs (`fetch*`, `calculate*`, `handle*`)
- Boolean predicates are named with `is*`, `has*`, `can*` prefix

### 9. Test Structure Compliance

**File**: `__tests__/test-structure.test.ts`

Ensure test files mirror source structure:

- Tests in `__tests__/lib/marketplace/` for `lib/marketplace/` code
- Tests focus on user-facing behavior, not implementation details
- No timing-dependent assertions (flaky tests)
- Tests run with Vitest + happy-dom setup

### 10. Database Migration Safety

**File**: `__tests__/database/migrations.test.ts`

Monitor migration practices:

- No edits to existing SQL files in `supabase/migrations/`
- New migrations have timestamp prefix `YYYYMMDD_description.sql`
- SQL uses idempotent patterns (`IF NOT EXISTS`, `IF EXISTS`)
- Migration files reviewed before application

---

## Test Execution
