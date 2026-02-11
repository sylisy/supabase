# Focus States Consolidation Plan

Related: [DEPR-354](https://linear.app/supabase/issue/DEPR-354/consolidate-focus-states-across-studio-and-ui-libraries)

## Goal

Standardize all focus states in `packages/ui` to use a single, consistent pattern for better UX and accessibility.

---

## Target Pattern

```css
/* Standard focus ring */
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
focus-visible:ring-offset-background
```

This is the shadcn default pattern. All components should converge to this.

---

## Phase 1: Define Focus Utilities

**Files to modify:**
- `packages/ui/src/lib/commonCva.ts`
- `packages/ui/tailwind.config.js` (if needed for CSS variable)

**Tasks:**

- [ ] 1.1 Create standardized focus class utilities in `commonCva.ts`:
  ```ts
  export const focusRing = `
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-ring
    focus-visible:ring-offset-2
  `

  export const focusRingInset = `
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-ring
    focus-visible:ring-inset
  `
  ```

- [ ] 1.2 Update `defaults.focus` and `defaults['focus-visible']` in both:
  - `src/lib/commonCva.ts`
  - `src/lib/theme/defaultTheme.ts`

---

## Phase 2: Update Shadcn Components

**Goal:** Ensure all shadcn components use `focus-visible:` (not `focus:`) with consistent `ring-ring` color.

**Files to update:**

- [ ] 2.1 `src/components/shadcn/ui/select.tsx`
  - Change `focus:outline-none focus:ring-2 focus:ring-ring` → `focus-visible:...`

- [ ] 2.2 `src/components/shadcn/ui/dialog.tsx`
  - Change close button `focus:outline-none focus:ring-2` → `focus-visible:...`

- [ ] 2.3 `src/components/shadcn/ui/sheet.tsx`
  - Change close button `focus:outline-none focus:ring-2` → `focus-visible:...`

- [ ] 2.4 `src/components/shadcn/ui/input.tsx`
  - Change `ring-background-control` → `ring-ring` for consistency

- [ ] 2.5 `src/components/shadcn/ui/text-area.tsx`
  - Verify uses `ring-ring` (currently uses `ring-background-control`)

- [ ] 2.6 `src/components/shadcn/ui/radio-group.tsx`
  - Remove `focus:outline-none` (keep only `focus-visible:`)

- [ ] 2.7 `src/components/shadcn/ui/button.tsx`
  - Change `ring-foreground-muted` → `ring-ring`

---

## Phase 3: Update Custom Button Component

**File:** `src/components/Button/Button.tsx`

**Current pattern:**
```tsx
focus-visible:outline-4
focus-visible:outline-offset-1
focus-visible:outline-brand-600  // varies by button type
```

**Target pattern:**
```tsx
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
```

**Tasks:**

- [ ] 3.1 Replace outline-based focus with ring-based focus in `buttonVariants`

- [ ] 3.2 Remove per-variant focus colors (brand-600, border-strong, amber-700)
  - All variants should use `ring-ring` for consistency

- [ ] 3.3 Update `data-[state=open]:outline-*` to `data-[state=open]:ring-*` if needed

---

## Phase 4: Update defaultTheme.ts

**File:** `src/lib/theme/defaultTheme.ts`

This file contains the most focus patterns. Update each section:

- [ ] 4.1 Update `defaults.focus` (line ~25):
  ```ts
  focus: `outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
  ```

- [ ] 4.2 Update `defaults['focus-visible']` (line ~29)

- [ ] 4.3 Update accordion triggers (lines ~133, ~171)
  - Change `ring-foreground-light` → `ring-ring`

- [ ] 4.4 Update tabs (lines ~344-401)
  - Change `ring-foreground-muted` → `ring-ring`

- [ ] 4.5 Update input/select/inputNumber (lines ~437, ~481, ~527)
  - Standardize to `ring-ring`

- [ ] 4.6 Update checkbox (line ~581)
  - Change `ring-border-muted` → `ring-ring`

- [ ] 4.7 Update radio (line ~640)
  - Change `ring-brand-400` → `ring-ring`

- [ ] 4.8 Update toggle (line ~943)
  - Change `!ring-border` → `ring-ring`

- [ ] 4.9 Update popover trigger (lines ~1086-1087)
  - Change outline to ring

- [ ] 4.10 Update menu items (line ~1143)
  - Change `ring-foreground-muted` → `ring-ring`

- [ ] 4.11 Update listbox (lines ~1298-1321)
  - Standardize to `ring-ring`

---

## Phase 5: Remove Legacy CSS Module Focus Styles

**Files to update:**

- [ ] 5.1 `src/components/Listbox/SelectStyled.module.css`
  - Remove `.sbui-listbox:focus { box-shadow: ... }` (line ~27)

- [ ] 5.2 `src/components/InputNumber/InputNumber.module.css`
  - Remove `.sbui-inputnumber:focus { ... }` (line ~26)
  - Remove `.sbui-inputnumber:focus + .sbui-inputnumber-nav` (line ~47)

- [ ] 5.3 `src/components/Select/Select.module.css`
  - Remove `.sbui-select:focus { ... }` (line ~32)

- [ ] 5.4 Verify Input.module.css (mostly commented out, confirm safe)

- [ ] 5.5 Verify Checkbox.module.css (mostly commented out, confirm safe)

- [ ] 5.6 Verify Radio.module.css (mostly commented out, confirm safe)

---

## Phase 6: Update Remaining Components

- [ ] 6.1 `src/components/TextLink/TextLink.tsx`
  - Change `ring-foreground-lighter` → `ring-ring`

- [ ] 6.2 `src/components/radio-group-stacked.tsx`
  - Verify uses `ring-ring`

- [ ] 6.3 `src/components/radio-group-card.tsx`
  - Verify uses `ring-ring`

- [ ] 6.4 `src/components/NavMenu/index.tsx`
  - Verify uses `ring-ring`

---

## Phase 7: Testing & Verification

- [ ] 7.1 Visual regression testing
  - Tab through all interactive components
  - Verify consistent ring color and size

- [ ] 7.2 Browser testing
  - Test in Chrome, Firefox, Safari
  - Verify `focus-visible` works correctly (no focus on click)

- [ ] 7.3 Accessibility testing
  - Verify focus indicators meet WCAG 2.1 requirements
  - Test with screen readers

---

## Estimated Effort

| Phase | Files | Estimated Time |
|-------|-------|----------------|
| Phase 1 | 2 | 30 min |
| Phase 2 | 7 | 1 hour |
| Phase 3 | 1 | 30 min |
| Phase 4 | 1 (large) | 2 hours |
| Phase 5 | 6 | 1 hour |
| Phase 6 | 4 | 30 min |
| Phase 7 | - | 2 hours |
| **Total** | ~21 files | **~7-8 hours** |

---

## Risk Mitigation

1. **Visual regression**: Take screenshots before/after for comparison
2. **Safari tabIndex**: Some elements may need explicit `tabIndex={0}` for Safari keyboard focus
3. **Downstream impact**: Studio and other apps consume these components - coordinate release

---

## Success Criteria

- [ ] All focus states use `focus-visible:` (not `focus:`)
- [ ] All focus states use `ring-ring` color token
- [ ] All focus states use `ring-2` size
- [ ] All focus states use `ring-offset-2` (or `ring-inset` for specific cases)
- [ ] No hardcoded colors (green box-shadows removed)
- [ ] Visual consistency when tabbing through any page

---

*Plan created: February 2026*
*Related audit: FOCUS_STATES_AUDIT.md*
