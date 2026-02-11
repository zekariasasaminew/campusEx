# GitHub Copilot Instructions

## Architecture Overview

**CampusEx** is a Next.js 16 + Supabase marketplace app using TypeScript, React 19, and CSS Modules.

### Data Layer Pattern (Critical)

Every feature domain (`lib/marketplace`, `lib/messaging`, `lib/notifications`, `lib/admin`, `lib/saves`) follows this structure:

- **`actions.ts`** - Server actions with `"use server"` directive. Handle auth, call queries/mutations. Return `Result<T>` type.
- **`queries.ts`** - Pure read operations. Accept `SupabaseClient`, return data. No auth logic here.
- **`mutations.ts`** - Pure write operations. Accept `SupabaseClient` and `userId`. Call validators first.
- **`types.ts`** - TypeScript interfaces/types for the domain.
- **`validators.ts`** - Zod schemas for input validation.
- **`storage.ts`** - (if needed) File upload/deletion operations.

**Example flow**: Component → `actions.ts` (gets user, creates client) → `mutations.ts` (validates, writes) → database

### Supabase Patterns

- **Browser**: Import from `@/lib/supabase/client` (has `"use client"`)
- **Server**: Use `getSupabaseWithAuth()` helper in actions.ts (handles cookies/auth)
- **Shared config**: `@/lib/supabase/config` centralizes URL/key
- **Middleware**: Auth session refresh in `middleware.ts` using `@/lib/supabase/middleware`

### Next.js App Router

- **Route groups**: `(app)` = protected pages, `(auth)` = public auth pages
- **Styling**: CSS Modules (`.module.css`) co-located with components
- **Imports**: Use `@/` alias (maps to project root)
- **Images**: Supabase storage URLs configured in `next.config.ts`

### Testing Setup

- **Framework**: Vitest with happy-dom (not jsdom)
- **Location**: `__tests__/` mirrors source structure (`__tests__/lib/marketplace/` for `lib/marketplace/`)
- **Run**: `npm test` (one-time), `npm run test:ui` (watch mode), `npm run test:coverage`
- **Focus**: Test user-facing behavior, not implementation details

## CRITICAL: Git Workflow - MANDATORY

### When to Commit (Required Actions)

**COMMIT AFTER EVERY LOGICAL CHANGE** - This is not optional.

Examples of when you MUST commit:

- ✅ After fixing 1-3 related lint errors in a file
- ✅ After removing unused imports from a file
- ✅ After adding a new function or component
- ✅ After fixing a bug
- ✅ After updating types in a module
- ✅ After refactoring a function

**DO NOT:**

- ❌ Make 10+ file changes without committing
- ❌ Fix all lint errors in one massive commit
- ❌ Wait until everything is "done" to commit

### Commit Command Workflow

After EACH logical change:

```bash
git add <changed-files>
git commit -m "Imperative message describing the change"
```

**Good commit messages:**

- `Remove unused imports from messaging components`
- `Fix useEffect dependencies in inbox page`
- `Replace any types with proper types in admin queries`
- `Add useCallback to profile edit handlers`

**Bad commit messages:**

- `Fix lint errors` (too vague)
- `Updates` (meaningless)
- `WIP` (not descriptive)

### Multi-Step Task Pattern

When user asks to "fix all lint errors":

1. Run lint to see all errors
2. **Group errors by type/file**
3. Fix first group (e.g., unused imports)
4. **COMMIT** with message like: `Remove unused imports from components`
5. Fix second group (e.g., useEffect deps)
6. **COMMIT** with message like: `Fix useEffect dependency warnings`
7. Continue until done

**Pattern:** Fix → Test → Commit → Repeat

## Core Principles

- Correctness > Cleverness
- Simple > Complex
- Readable > Compact
- Small incremental changes > Large rewrites
- Self-documenting code > Comments

## File Size Rules

- **Hard limit:** 300 lines per file
- **Action trigger:** At 250 lines, split the file
- **Organization:** By feature/domain, not by type
  - ✅ `features/events/EventList.tsx`
  - ❌ `components/EventList.tsx`

## Function Rules

- **Target:** 20-40 lines per function
- **Max complexity:** Prefer early returns over nested ifs
- **Naming:** Verbs for functions (`fetchUser`, `calculateTotal`)
- **Naming:** Predicates for booleans (`isValid`, `hasAccess`)

## Type Safety Rules

- **NEVER use `any`** - Use proper types or `unknown`
- **Alternatives to `any`:**
  - `Record<string, unknown>` for objects
  - `unknown` when type is truly unknown
  - Explicit type with `as Type` assertion when justified
  - Create proper interface/type

## React-Specific Rules

### useEffect Dependencies

**NEVER use eslint-disable for useEffect deps**

✅ **Correct approach:**

```typescript
const loadData = useCallback(async () => {
  // fetch logic
}, [dependencies]);

useEffect(() => {
  loadData();
}, [loadData]);
```

❌ **Wrong approach:**

```typescript
useEffect(() => {
  loadData();
  // eslint-disable-next-line
}, []);
```

### Component Size

- Max 250 lines per component
- Split into subcomponents when approaching limit
- Extract hooks when logic is reusable

## Error Handling

- Fail fast with clear messages
- Never swallow errors silently
- Use typed errors for user-facing paths
- Log with context, never log secrets

## Security

- **NEVER hardcode:** tokens, keys, passwords, connection strings
- **ALWAYS validate:** user input, external data
- **ALWAYS use:** parameterized queries (never string concatenation)
- Use environment variables for configuration

## Testing

- Framework: Vitest with happy-dom (not jsdom)
- Tests in `__tests__/` mirror source structure
- Test user-facing behavior, not implementation details
- Focus on critical paths and core business logic
- No flaky tests (avoid timing assumptions)
- Run: `npm test`, `npm run test:ui`, `npm run test:coverage`

## Build Workflow

- **`npm run build`** - Runs lint automatically, then builds
- Fix all lint errors before builds will succeed
- Dev server: `npm run dev` (port 3000)
- Production: `npm run start` (requires build first)

## Dependencies

- Prefer existing dependencies
- Only add new deps when necessary
- Explain tradeoffs when adding deps

## Database Migrations

- **NEVER edit existing SQL files** in `supabase/migrations/`
- **ALWAYS create new migration files** for any database changes
- **File naming**: Use timestamp prefix `YYYYMMDD_description.sql` (e.g., `20260210_add_user_column.sql`)
- **Before creating**: Review current DB schema and previous migrations
- **Content**: Write idempotent SQL (use `IF NOT EXISTS`, `IF EXISTS`)
- **Track state**: Consider the current database state when writing new migrations
- **Example flow**: Need to add column → review existing schema → create new migration file → apply via Supabase CLI

## Before Completing Task

Checklist:

- [ ] Lint passes (`npm run lint`)
- [ ] Tests pass (if applicable)
- [ ] All changes committed (check with `git status`)
- [ ] No files over 300 lines
- [ ] No `any` types in code
- [ ] No hardcoded secrets
- [ ] Commit messages are descriptive

## Response Style

- Be concise
- Show only relevant code changes
- If asked to do something unsafe, refuse and suggest alternative
- Choose simplest compliant solution
- Don't announce which tools you're using

## Workflow Summary for Multi-File Changes

```
1. Understand the task
2. Break into logical steps
3. For each step:
   a. Make the change
   b. Test if needed
   c. Commit with clear message
4. Run final verification
5. Report completion
```

**Remember:** Small commits = easier reviews, safer rollbacks, clearer history
