# copilot.md

## Purpose

You are GitHub Copilot working inside this repository.
Follow these instructions for every code suggestion, edit, refactor, and new file you create.
If a request conflicts with these rules, propose a compliant alternative.

## Core principles

- Prioritize correctness, readability, maintainability, and security over cleverness.
- Keep solutions simple. Avoid unnecessary abstraction.
- Write code that a new teammate can understand quickly.
- Prefer small, incremental changes that are easy to review.

## Coding standards

- Clean code: clear names, small functions, single responsibility, minimal side effects.
- DRY, but do not over abstract. Only extract shared logic after it repeats.
- KISS and YAGNI: do not build features not explicitly required.
- Prefer pure functions where practical.
- Prefer composition over inheritance.
- Avoid global state. Minimize shared mutable state.
- Prefer immutable data patterns where feasible.

## File size and structure

- Hard limit: no source file should exceed 300 lines.
- If a file approaches 250 lines, proactively split it.
- Prefer many small focused files over one large file.
- Organize by feature or domain, not by technical layer when possible.
  - Example: `features/events/` rather than `components/` dumping ground.
- Each folder should have a short README if the structure is non obvious.

## Functions and complexity

- Keep functions small. Target 20 to 40 lines max per function.
- Limit nesting. Prefer early returns and guard clauses.
- Avoid high cyclomatic complexity. If logic branches heavily, refactor into helpers.
- Prefer explicit code over clever one liners.

## Naming

- Use descriptive names. Avoid abbreviations unless universally obvious.
- Booleans should read like predicates: `isReady`, `hasAccess`, `canSubmit`.
- Functions should be verbs: `fetchUser`, `calculateTotal`, `serializePayload`.
- Keep naming consistent across the codebase.

## Types and contracts

- Strongly prefer explicit types over implicit any.
- Create clear interfaces and data contracts at module boundaries.
- Validate external inputs at the boundary (API handlers, file IO, user input).
- Do not trust network, client, env, or database input without validation.

## Error handling

- Fail fast with clear messages.
- Use typed errors or error classes when helpful.
- Do not swallow errors. Either handle them or propagate them.
- Log with context and avoid leaking secrets.
- Prefer returning structured errors for user facing paths.

## Security

- Never hardcode secrets, tokens, keys, passwords, or connection strings.
- Use environment variables and documented configuration.
- Sanitize and validate all user input.
- Use parameterized queries. Never string concatenate SQL.
- Apply principle of least privilege.
- Avoid insecure crypto and weak randomness.

## Performance

- Make performance improvements only when justified.
- Prefer algorithmic improvements over micro optimizations.
- Avoid unnecessary re renders, repeated queries, and N plus 1 patterns.
- Cache only with clear invalidation rules.

## Testing and quality

- Every change should include tests when practical.
- Prefer unit tests for pure logic and integration tests for boundaries.
- Tests must be deterministic. No flaky timing assumptions.
- Use meaningful assertions, not snapshot spam.
- Aim for high confidence coverage on critical paths.

## Documentation

- Write docstrings only where the intent is not obvious.
- Prefer self documenting code over excessive comments.
- Add a short module header comment when a file has non obvious constraints.
- When adding public functions, document inputs, outputs, and edge cases.

## Formatting and style

- Match the repository formatter and linter.
- No commented out code.
- Keep imports sorted and minimal.
- Avoid deep relative imports when possible. Prefer alias or module boundaries.

## Dependencies

- Prefer standard library and existing repo dependencies.
- Do not add new dependencies unless necessary.
- If you must add a dependency, explain why and the tradeoffs.

## Git workflow and commits

- Make small, focused changes per commit.
- Commit messages should be imperative and specific:
  - Example: `Add validation for event date range`
- Never push directly to main.
- Always work on feature branches.
- Prefer PRs with clear descriptions and minimal diff surface area.

## API and data modeling

- Keep endpoints thin. Put business logic in services or domain modules.
- Validate request payloads and response shapes.
- Prefer explicit DTOs at boundaries.
- Avoid leaking database models directly to clients.

## Frontend guidance (if applicable)

- Keep components small and focused.
- Avoid components over 250 lines, split into subcomponents.
- Prefer controlled components for forms when appropriate.
- Keep state close to where it is used.
- Avoid prop drilling by introducing context only when it clearly helps.

## Backend guidance (if applicable)

- Separate routing, validation, business logic, and persistence.
- Prefer idempotent operations where feasible.
- Use transactions when multiple writes must be consistent.
- Handle retries and timeouts for network calls.

## Pull request readiness checklist

Before finalizing changes, ensure:

- Code compiles and lint passes.
- Tests added or updated and passing.
- No file over 300 lines.
- No secrets introduced.
- Clear naming and minimal complexity.
- Changes are documented if behavior changed.

## Response style for Copilot

When generating code:

- Output only what is needed for the change.
- Keep edits minimal and localized.
- If multiple approaches exist, choose the simplest compliant option.
- If asked to do something unsafe or out of scope, refuse and propose a safer alternative.
