# JAGO Reusable UI Component Library

This directory contains all reusable UI components for the JAGO scholarship assistant. Components are organized into two categories:

1. **Core Components** - Basic building blocks (Button, Card, Input, Badge, Headers)
2. **JAGO-Specific Components** - Domain-specific components for scholarship features

## Core Design Principles

✅ **DO:**
- Use components from `src/constants/theme.ts` for all colors, spacing, typography
- Keep components presentational (data-in, UI-out)
- Pass all dynamic data through props
- Write TypeScript interfaces for all props
- Reuse existing components instead of duplicating code
- Keep styling in StyleSheet (React Native best practice)

❌ **DON'T:**
- Hardcode colors or spacing values in components
- Add API/Supabase calls directly in UI components
- Create screen-specific logic in reusable components
- Add unnecessary dependencies
- Duplicate existing component functionality
- Mix navigation logic into presentational components

## Core Components

### Button

Primary interactive element for actions and submissions.

**Props:**
```typescript
{
  label: string;                    // Button text
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  textColor?: string;               // Custom text color override
}
```

**Usage:**
```tsx
import { Button } from '@/components/ui/Button';

<Button
  label="Apply Now"
  variant="primary"
  size="md"
  onPress={() => handleApply()}
/>
```

**Variants:**
- `primary` - Filled blue button (main actions)
- `secondary` - Outlined button (secondary actions)
- `tertiary` - Text-only button (subtle actions)
- `destructive` - Red button (delete/reject actions)

**When to use:** Any interactive action that requires a button

**When NOT to use:** For navigation (use Pressable with router), for text links (use tertiary variant)

---

### Card

Container component for grouping related content.

**Props:**
```typescript
{
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: number;                 // Inner spacing (default: 16)
  borderRadius?: number;
  showShadow?: boolean;             // Only for elevated
  borderColor?: string;             // Custom border color
  borderWidth?: number;
  children: React.ReactNode;
}
```

**Usage:**
```tsx
import { Card } from '@/components/ui/Card';

<Card variant="outlined" padding={16}>
  <Text>Application Details</Text>
</Card>
```

**Variants:**
- `default` - Subtle border, no shadow
- `elevated` - Shadow for emphasis
- `outlined` - Visible border

**When to use:** To group related information (details, lists, forms)

**When NOT to use:** For single items (use View instead)

---

### Input

Text input field with label, error states, and help text.

**Props:**
```typescript
{
  label?: string;
  placeholder?: string;
  error?: string;                   // Shows error state + message
  hint?: string;                    // Helper text (no error)
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  // + all TextInputProps (value, onChangeText, etc)
}
```

**Usage:**
```tsx
import { Input } from '@/components/ui/Input';

const [name, setName] = useState('');

<Input
  label="Full Name"
  placeholder="Enter your name"
  value={name}
  onChangeText={setName}
  required
  error={nameError}
/>
```

**When to use:** For collecting user input (forms, applications)

**When NOT to use:** For display-only text (use Text component)

---

### Badge

Small label/tag for status, category, or classification.

**Props:**
```typescript
{
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  size?: 'sm' | 'md';
  backgroundColor?: string;         // Custom color override
  textColor?: string;
  borderColor?: string;
}
```

**Usage:**
```tsx
import { Badge } from '@/components/ui/Badge';

<Badge label="Pre-Matric" variant="info" size="sm" />
```

**Variants:**
- `success` - Green (approved, completed)
- `warning` - Amber (pending, attention needed)
- `error` - Red (failed, rejected)
- `info` - Blue (information, category)
- `primary` - Brand blue
- `default` - Neutral gray

**When to use:** To label categories, statuses, or tags

**When NOT to use:** For buttons (use Button component), for status-specific displays (use StatusBadge)

---

### ScreenHeader

Screen header with title and back button.

**Props:**
```typescript
{
  title: string;
  showBackButton?: boolean;        // Default: true
  onBackPress?: () => void;        // Custom back handler
  rightContent?: React.ReactNode;  // Icon, menu, etc
  showBorder?: boolean;            // Default: true
}
```

**Usage:**
```tsx
import { ScreenHeader } from '@/components/ui/ScreenHeader';

<ScreenHeader
  title="Application Status"
  showBackButton={true}
/>
```

**Notes:**
- Automatically handles safe area insets
- Back button calls `router.back()` by default
- Use `onBackPress` for custom navigation

**When to use:** At the top of every screen for consistency

**When NOT to use:** In nested modals (use different header)

---

### SectionHeader

Section title for grouping related content within a screen.

**Props:**
```typescript
{
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;  // "See all" link, etc
  marginBottom?: number;           // Default: 16
}
```

**Usage:**
```tsx
import { SectionHeader } from '@/components/ui/SectionHeader';

<SectionHeader
  title="Recent Applications"
  subtitle="Your latest scholarship applications"
  marginBottom={16}
/>
```

**When to use:** To separate content sections within a screen

**When NOT to use:** For screen-level headers (use ScreenHeader)

---

## JAGO-Specific Components

### ScholarshipCard

Displays a single scholarship scheme with description and action.

**Props:**
```typescript
{
  name: string;                     // Full scheme name
  shortName: string;                // Short name/abbreviation
  category: string;                 // e.g., "Pre-Matric Education"
  description: string;              // Scheme description
  actionLabel?: string;             // Button text (default: "Learn More")
  onActionPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}
```

**Usage:**
```tsx
import { ScholarshipCard } from '@/components/ui/ScholarshipCard';

const scholarship = scholarshipSchemes[0];

<ScholarshipCard
  name={scholarship.name}
  shortName={scholarship.shortName}
  category={scholarship.category}
  description={scholarship.description}
  actionLabel="Apply Now"
  onActionPress={() => router.push('/apply')}
/>
```

**Data source:** Pass data from `src/data/scholarships.ts`

**When to use:** In scholarship listing screens

**When NOT to use:** Don't hardcode scheme data inside this component

---

### DocumentCard

Displays a document upload/verification status.

**Props:**
```typescript
{
  documentName: string;             // e.g., "ST Certificate"
  documentType: string;             // e.g., "Community Certificate"
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  statusMessage?: string;           // Optional detail message
  actionLabel?: string;             // Custom button label
  onActionPress?: () => void;       // Upload/replace handler
}
```

**Usage:**
```tsx
import { DocumentCard } from '@/components/ui/DocumentCard';

<DocumentCard
  documentName="ST Certificate"
  documentType="Community Certificate"
  status="pending"
  statusMessage="Required for all ST students"
  onActionPress={() => handleUpload()}
/>
```

**Status behavior:**
- `pending` → Shows "Upload" button
- `uploaded` → Shows "Replace" button
- `verified` → No button shown
- `rejected` → Shows "Re-upload" button

**When to use:** In application document submission sections

---

### StatusBadge

JAGO-specific status indicator for application stages.

**Props:**
```typescript
{
  status: 'submitted' | 'under_verification' | 'action_required' | 'sanctioned' | 'disbursed' | 'rejected';
  variant?: 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage:**
```tsx
import { StatusBadge } from '@/components/ui/StatusBadge';

<StatusBadge status="under_verification" variant="outlined" />
```

**Status colors:**
- `submitted` → Blue (initial state)
- `under_verification` → Light blue (in progress)
- `action_required` → Amber (needs attention)
- `sanctioned` → Green (approved)
- `disbursed` → Green (completed)
- `rejected` → Red (failed)

**When to use:** To display JAGO application status

**When NOT to use:** For general badges (use Badge component)

---

### ApplicationTimeline

Vertical progress timeline for application journey.

**Props:**
```typescript
{
  stages: Array<{
    name: string;                   // e.g., "Document Verification"
    status: 'completed' | 'current' | 'pending';
    description?: string;           // Optional detail
  }>;
  showDescriptions?: boolean;       // Default: true
}
```

**Usage:**
```tsx
import { ApplicationTimeline } from '@/components/ui/ApplicationTimeline';

const stages = [
  { name: 'Submitted', status: 'completed' },
  { name: 'Document Verification', status: 'current' },
  { name: 'Sanction', status: 'pending' },
  { name: 'Disbursement', status: 'pending' },
];

<ApplicationTimeline stages={stages} showDescriptions={true} />
```

**JAGO Journey:**
```
1. Submitted ✓
2. Document Verification (in progress)
3. Sanction (pending)
4. Disbursement (pending)
```

**When to use:** In application status screens to show progress

---

### EmptyState

Displays when no content is available.

**Props:**
```typescript
{
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  showAction?: boolean;
  icon?: React.ReactNode;           // Optional illustration
  paddingVertical?: number;
}
```

**Usage:**
```tsx
import { EmptyState } from '@/components/ui/EmptyState';

{applications.length === 0 ? (
  <EmptyState
    title="No Applications Yet"
    description="Start by applying to a scholarship scheme"
    actionLabel="Browse Scholarships"
    onActionPress={() => router.push('/scholarships')}
  />
) : (
  <ApplicationList apps={applications} />
)}
```

**When to use:** When a list/section has no data

**When NOT to use:** For error states (create ErrorState component if needed)

---

### LoadingState

Simple loading indicator with optional message.

**Props:**
```typescript
{
  message?: string;                 // Default: "Loading..."
  size?: 'small' | 'large';
  paddingVertical?: number;
}
```

**Usage:**
```tsx
import { LoadingState } from '@/components/ui/LoadingState';

{isLoading ? (
  <LoadingState message="Fetching scholarships..." size="large" />
) : (
  <ScholarshipList schemes={schemes} />
)}
```

**Notes:**
- Uses React Native ActivityIndicator (no custom animation)
- Simple and lightweight

**When to use:** During data fetching

---

## Theme Usage

All components automatically use the central theme. Colors, spacing, and typography come from `src/constants/theme.ts`.

**To access theme in your own components:**

```tsx
import { useTheme } from '@/hooks/use-theme';
import { SpacingTokens as Spacing, Typography, BorderRadius } from '@/constants/theme';

export function MyComponent() {
  const theme = useTheme();
  
  return (
    <View style={{ 
      backgroundColor: theme.background,
      padding: Spacing.base,
    }}>
      <Text style={[Typography.h6, { color: theme.text }]}>
        Hello
      </Text>
    </View>
  );
}
```

**Available theme tokens:**
- `Colors` - All color values (light/dark mode aware)
- `Typography` - Font sizes, weights, line heights
- `SpacingTokens` - Padding/margin sizes used by this UI library (xs, sm, md, base, lg, xl, 2xl, etc). Import it aliased as `Spacing` (`import { SpacingTokens as Spacing } from '@/constants/theme'`) as shown above.
- `Spacing` - ⚠️ Reserved for the app's pre-existing legacy scale (`half`, `one`, `two`, `three`, `four`, `five`, `six`). Don't use these keys in new UI-library components — use `SpacingTokens` instead.
- `BorderRadius` - Roundness values (sm, md, lg, xl, full)
- `Shadows` - Elevation (light, md, lg)
- `StatusColors` - Application status colors
- `ComponentTokens` - Common component dimensions

---

## Component Composition Rules

### ✅ Composition Guidelines

1. **Nest reusable components:**
   ```tsx
   // Good: DocumentCard uses Card and Badge
   <Card variant="outlined">
     <Badge label="Status" />
   </Card>
   ```

2. **Pass data through props:**
   ```tsx
   // Good: Data comes from parent
   <ScholarshipCard name={scheme.name} />
   
   // Bad: Data hardcoded
   <ScholarshipCard name="Fixed Name" />
   ```

3. **Use theme for styling:**
   ```tsx
   // Good: Theme color
   backgroundColor: theme.primary
   
   // Bad: Hardcoded color
   backgroundColor: '#1d4ed8'
   ```

### ❌ Anti-Patterns

1. **Don't add API calls:**
   ```tsx
   // Bad - don't do this
   export function ScholarshipCard() {
     useEffect(() => {
       fetch('/api/schemes'); // ❌ No API calls in UI components
     }, []);
   }
   ```

2. **Don't add navigation logic:**
   ```tsx
   // Bad - don't do this
   export function Button() {
     const router = useRouter();
     return <Pressable onPress={() => router.push('/next')} />; // ❌
   }
   
   // Good - pass callback
   export function Button({ onPress }) {
     return <Pressable onPress={onPress} />;
   }
   ```

3. **Don't hardcode screen-specific data:**
   ```tsx
   // Bad
   <Badge label="JAGO-2026-00124" /> // ❌ Hardcoded app ID
   
   // Good
   <Badge label={applicationId} /> // ✓ Passed as prop
   ```

---

## Component Import Pattern

```tsx
// Always import from ui directory
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';

// Not from component files directly
// ❌ Don't do: import Button from '@/components/ui/Button.tsx'
```

---

## TypeScript Best Practices

All components have full TypeScript support:

```tsx
import type { ButtonProps } from '@/components/ui/Button';

// Use the type for custom buttons
const MyCustomButton: React.FC<ButtonProps> = (props) => {
  // ...
};
```

---

## Testing Components

For testing/debugging components in isolation:

```tsx
// src/app/debug/components.tsx
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ComponentDebug() {
  return (
    <ScrollView>
      <Button label="Test Button" variant="primary" />
      <Card>
        <Text>Test Card</Text>
      </Card>
    </ScrollView>
  );
}
```

---

## Future Enhancements

Components can be extended with:
- Form field wrapper component (combines Input + label + error)
- Modal component
- Toast/notification component
- Dropdown/select component
- Date picker component
- File upload component

But don't add these until actually needed - keep the library lean!

---

## Summary

- ✅ Keep components simple and focused
- ✅ Pass all data through props
- ✅ Use theme tokens, never hardcode values
- ✅ Compose reusable components together
- ✅ Write clear TypeScript interfaces
- ❌ No API calls in components
- ❌ No screen-specific logic
- ❌ No hardcoded data
- ❌ No unnecessary dependencies

Happy building! 🚀
