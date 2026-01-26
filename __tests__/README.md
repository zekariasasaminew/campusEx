# Campus Exchange Test Suite

Comprehensive test coverage for phase one marketplace features.

## Test Organization

```
__tests__/
├── lib/
│   └── marketplace/
│       ├── constants.test.ts    # Domain constants validation
│       ├── types.test.ts        # TypeScript type definitions
│       └── validators.test.ts   # Input validation logic
├── components/
│   ├── marketplace/
│   │   ├── EmptyState.test.tsx      # Empty state display
│   │   ├── FiltersBar.test.tsx      # Filter controls and interactions
│   │   └── ListingCard.test.tsx     # Listing card display
│   └── ui/
│       ├── button.test.tsx          # Button component
│       ├── confirm-dialog.test.tsx  # Confirmation dialogs
│       ├── input.test.tsx           # Input fields
│       ├── modal.test.tsx           # Modal dialogs
│       ├── select.test.tsx          # Select dropdowns
│       └── spinner.test.tsx         # Loading spinners
├── setup.test.ts    # Test infrastructure validation
└── README.md        # This file
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Coverage

### Validation Logic (38 tests)

**Price Validation**

- ✓ Free items with null price
- ✓ Paid items with valid price
- ✓ Zero price handling
- ✓ Invalid price scenarios (negative, non-integer, mismatched free flag)

**Create Listing Validation**

- ✓ Complete valid listing
- ✓ Free listing without price
- ✓ Title validation (required, min/max length)
- ✓ Description validation (required, min/max length)
- ✓ Category validation (required, valid values)
- ✓ Condition validation (optional, valid values)
- ✓ Location validation (max length)
- ✓ Image validation (required, count limits, file types, file size)
- ✓ Rules agreement validation
- ✓ Price consistency validation

**Update Listing Validation**

- ✓ Empty updates
- ✓ Partial updates
- ✓ Field-specific validations
- ✓ Price change scenarios

**Report Validation**

- ✓ Complete report
- ✓ Missing required fields
- ✓ Empty details
- ✓ Max length constraints

### Constants and Types (25 tests)

**Categories**

- ✓ All expected categories present (Books, Electronics, Furniture, Tickets, Clothing, Services, Other)
- ✓ No duplicates
- ✓ Minimum count validation

**Conditions**

- ✓ All condition levels (New, Like New, Good, Fair, Parts)
- ✓ Exact count validation

**Validation Rules**

- ✓ Title constraints (3-100 chars)
- ✓ Description constraints (10-2000 chars)
- ✓ Location constraints (max 100 chars)
- ✓ Report details constraints (max 500 chars)

**Image Constraints**

- ✓ Max count (5 images)
- ✓ Max file size (5MB)
- ✓ Allowed types and extensions

**Type Definitions**

- ✓ Valid structure for all marketplace types
- ✓ Optional field handling
- ✓ Partial update types

### Component Tests (80 tests)

**Marketplace Components**

_ListingCard (14 tests)_

- ✓ Displays listing title, price, category, condition
- ✓ Free vs paid price formatting
- ✓ Sold badge display
- ✓ Location display
- ✓ Image rendering
- ✓ Navigation links
- ✓ Edge cases (zero price, large prices)

_FiltersBar (12 tests)_

- ✓ Search input with debouncing
- ✓ Category and condition filters
- ✓ Price range inputs
- ✓ Free items only toggle
- ✓ Clear filters functionality
- ✓ Filter state updates
- ✓ Display of current filter values

_EmptyState (5 tests)_

- ✓ Default and custom messages
- ✓ Optional action button
- ✓ Proper linking

**UI Components**

_Button (9 tests)_

- ✓ Click handlers
- ✓ Disabled state
- ✓ Variants (primary, secondary, destructive, ghost)
- ✓ Sizes (sm, md, lg)
- ✓ Type attributes
- ✓ Custom className support

_Input (10 tests)_

- ✓ Label and placeholder
- ✓ Value changes
- ✓ Error display and styling
- ✓ Disabled state
- ✓ Different input types
- ✓ MaxLength attribute
- ✓ Accessibility (htmlFor linking)

_Select (9 tests)_

- ✓ Label display
- ✓ Option rendering
- ✓ Value selection
- ✓ Change handlers
- ✓ Disabled state
- ✓ Error display
- ✓ Placeholder option

_Modal (6 tests)_

- ✓ Open/close state
- ✓ Title display
- ✓ Overlay and close button clicks
- ✓ Content click handling

_ConfirmDialog (7 tests)_

- ✓ Open/close state
- ✓ Confirm/cancel actions
- ✓ Custom labels
- ✓ Variant styling (primary, destructive)

_Spinner (4 tests)_

- ✓ With and without message
- ✓ Size variants
- ✓ Accessibility attributes

## Testing Patterns

### Mocking Next.js Components

```tsx
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));
```

### Testing User Interactions

```tsx
const user = userEvent.setup();
await user.click(button);
await user.type(input, "text");
```

### Testing Debounced Inputs

```tsx
await vi.waitFor(
  () => {
    expect(mockCallback).toHaveBeenCalledWith(expectedValue);
  },
  { timeout: 600 },
);
```

## Coverage Goals

- **Validators**: 100% - All validation paths tested
- **Constants**: 100% - All constants verified
- **UI Components**: 90%+ - Core functionality and user interactions
- **Marketplace Components**: 85%+ - Main features and edge cases

## What's Not Tested

Following the guideline to focus on main features without being granular:

- Server actions and mutations (require complex mocking)
- File upload storage operations (require Supabase mocks)
- Authentication flows (tested at integration level)
- CSS module imports (styling is visual)
- Complex form state management (tested through validators)

## Best Practices

1. **Test behavior, not implementation** - Focus on what users see and do
2. **Use descriptive test names** - Clear "should" statements
3. **Arrange-Act-Assert** - Structured test organization
4. **Mock external dependencies** - Isolate unit tests
5. **Test edge cases** - Empty states, null values, boundary conditions
6. **Keep tests focused** - One assertion topic per test

## Continuous Integration

Tests run automatically on:

- Every commit (local pre-commit hook recommended)
- Pull request creation
- Main branch pushes

## Maintenance

- Update tests when component interfaces change
- Add tests for new features immediately
- Keep test data realistic but minimal
- Remove tests for deprecated features

---

For issues or questions about tests, refer to the [vitest documentation](https://vitest.dev) or consult the team.
