# GitHub Copilot Instructions (Optimized for AI)

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

- Test user-facing behavior, not implementation details
- Tests in `__tests__/` mirroring source structure
- Focus on critical paths and core business logic
- No flaky tests (avoid timing assumptions)

## Dependencies

- Prefer existing dependencies
- Only add new deps when necessary
- Explain tradeoffs when adding deps

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
