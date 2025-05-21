---
title: UI Component Usage Guide
created: [YYYY-MM-DD - Original Creation Date]
last_updated: 2025-05-08
update_history:
  - 2025-05-08: Added guidance on dark mode styling for UI components.
  - 2025-05-08: Updated to include Design System and Button component usage.
status: Draft
owner: [Primary Maintainer]
related_files:
  - client/src/design-system/index.js
  - client/src/design-system/components/Button.tsx
  - client/src/contexts/ThemeContext.js
---

# UI Component Usage Guide

This guide provides instructions and best practices for using UI components within the Receipt Scanner application, with a focus on the newly implemented Design System and the consolidated Button component.

## Design System

The application utilizes a Design System to ensure consistency and maintainability of the user interface. The core of the Design System is defined in `client/src/design-system/index.js`, which includes design tokens for colors, typography, spacing, and component variants.

**Accessing Design Tokens:**

Design tokens are exported as constants from `client/src/design-system/index.js`. You can import and use these tokens in your components and styles to maintain a consistent look and feel.

```javascript
import { designTokens } from '@/design-system';

const primaryColor = designTokens.colors.primary[500];
```

## Button Component

The application now uses a consolidated `Button` component located at `client/src/design-system/components/Button.tsx`. This component provides a consistent interface for all button interactions across the application and supports various variants, sizes, and states.

**Importing the Button Component:**

```javascript
import { Button } from '@/design-system/components/Button';
```

**Button Props:**

The `Button` component accepts the following props:

- `variant`: Defines the visual style of the button. Available options: `default`, `secondary`, `outline`, `ghost`, `gradient`, `destructive`, `glass`.
- `size`: Defines the size of the button. Available options: `sm`, `default`, `lg`, `icon`.
- `rounded`: Defines the border radius of the button. Available options: `default`, `full`, `lg`.
- `isLoading`: A boolean that, when true, displays a loading spinner and disables the button.
- `leftIcon`: A React node to display an icon on the left side of the button text.
- `rightIcon`: A React node to display an icon on the right side of the button text.
- `className`: Additional CSS classes to apply to the button.
- Standard HTML button attributes (e.g., `onClick`, `type`, `disabled`).

**Examples:**

```jsx
{/* Default button */}
<Button onClick={() => console.log('Clicked!')}>Click Me</Button>

{/* Secondary button with large size and left icon */}
import { Plus } from 'lucide-react';

<Button variant="secondary" size="lg" leftIcon={<Plus size={20} />}>Add Item</Button>

{/* Loading button */}
<Button isLoading>Loading...</Button>

{/* Icon button with full rounded corners */}
import { Settings } from 'lucide-react';

<Button variant="ghost" size="icon" rounded="full">
  <Settings size={24} />
</Button>
```

**Migration:**

Existing button usages across the application should be migrated to use this consolidated `Button` component to leverage the Design System and ensure consistency. Refer to the "Button Usage Audit" section below (or in previous versions of this document) to identify locations where older button implementations might still be in use.

## Other UI Components

[This section can be expanded in the future to include documentation for other common UI components as they are developed and consolidated.]

## Best Practices

- Always use components from the `client/src/design-system/components/` directory when available.
- Prefer using the defined `variant`, `size`, and `rounded` props for styling instead of applying custom styles directly, unless absolutely necessary.
- Utilize the `isLoading`, `leftIcon`, and `rightIcon` props for common button states and adornments.
- Ensure all interactive components have appropriate accessibility attributes (e.g., `aria-label`) when needed.
- Document any new components added to the design system in this guide.

### Dark Mode Styling

When implementing or updating UI components, ensure they support dark mode.

*   Utilize Tailwind CSS dark mode variants (e.g., `dark:bg-gray-800`, `dark:text-white`).
*   Refer to the `ThemeContext` (`client/src/contexts/ThemeContext.js`) and the `useTheme` hook for accessing the current theme state.
*   Define dark mode colors and other theme-specific values in the Design System tokens where appropriate.

## Accessibility Guidelines

Ensuring the application is accessible to users with disabilities is a priority. Follow these guidelines when developing UI components:

- **ARIA Attributes:** Use appropriate ARIA attributes (e.g., `aria-label`, `aria-labelledby`, `aria-describedby`, `role`) to provide semantic information and improve the experience for screen reader users.
- **Keyboard Navigation:** Ensure all interactive elements are keyboard focusable and that the tab order is logical.
- **Color Contrast:** Maintain sufficient color contrast between text and background elements to ensure readability for users with visual impairments.
- **Focus Indicators:** Provide clear visual focus indicators for interactive elements to help users navigating with a keyboard.
- **Alt Text for Images:** Include descriptive `alt` text for all meaningful images.
- **Semantic HTML:** Use semantic HTML elements (e.g., `<button>`, `<nav>`, `<aside>`) to convey the purpose of content and improve navigation for assistive technologies.
- **Testing:** Regularly test components with screen readers and keyboard navigation to identify and address accessibility issues.
