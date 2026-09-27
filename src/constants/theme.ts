/**
 * JAGO Central Design System
 * 
 * Defines all reusable visual tokens for the JAGO scholarship assistant.
 * Use these values in components instead of hardcoding colors/spacing.
 * 
 * Modern, clean, trustworthy, and accessible design for government services.
 */

import '@/global.css';

import { Platform } from 'react-native';

// ============================================================================
// COLORS - Theme-aware color palette
// ============================================================================

export const Colors = {
  light: {
    // Neutral colors
    text: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#94a3b8',
    background: '#ffffff',
    backgroundElement: '#f8fafc',
    backgroundSelected: '#f1f5f9',
    border: '#e2e8f0',
    borderStrong: '#cbd5e1',

    // Semantic: Primary (Trust/Authority - Blue)
    primary: '#1d4ed8',
    primaryLight: '#3b82f6',
    primaryLightest: '#eff6ff',
    primaryDark: '#1e40af',

    // Semantic: Success (Green)
    success: '#15803d',
    successLight: '#4ade80',
    successLightest: '#f0fdf4',

    // Semantic: Warning (Amber)
    warning: '#b45309',
    warningLight: '#fbbf24',
    warningLightest: '#fef3c7',

    // Semantic: Error (Red)
    error: '#dc2626',
    errorLight: '#fca5a5',
    errorLightest: '#fee2e2',

    // Semantic: Info (Light Blue)
    info: '#0284c7',
    infoLight: '#38bdf8',
    infoLightest: '#f0f9ff',
  },
  dark: {
    // Neutral colors
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textTertiary: '#64748b',
    background: '#0f172a',
    backgroundElement: '#1e293b',
    backgroundSelected: '#334155',
    border: '#334155',
    borderStrong: '#475569',

    // Semantic: Primary (Trust/Authority - Blue)
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryLightest: '#1e3a8a',
    primaryDark: '#1d4ed8',

    // Semantic: Success (Green)
    success: '#4ade80',
    successLight: '#86efac',
    successLightest: '#1b2e1b',

    // Semantic: Warning (Amber)
    warning: '#fbbf24',
    warningLight: '#fcd34d',
    warningLightest: '#332701',

    // Semantic: Error (Red)
    error: '#ef4444',
    errorLight: '#f87171',
    errorLightest: '#3a0a0a',

    // Semantic: Info (Light Blue)
    info: '#38bdf8',
    infoLight: '#7dd3fc',
    infoLightest: '#001f3f',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// ============================================================================
// APPLICATION STATUS COLORS - For JAGO application states
// ============================================================================

export const StatusColors = {
  light: {
    submitted: {
      text: '#1d4ed8',
      background: '#eff6ff',
      border: '#bfdbfe',
      badge: '#3b82f6',
    },
    under_verification: {
      text: '#0284c7',
      background: '#f0f9ff',
      border: '#7dd3fc',
      badge: '#38bdf8',
    },
    action_required: {
      text: '#b45309',
      background: '#fef3c7',
      border: '#fde68a',
      badge: '#fbbf24',
    },
    sanctioned: {
      text: '#15803d',
      background: '#f0fdf4',
      border: '#86efac',
      badge: '#4ade80',
    },
    disbursed: {
      text: '#15803d',
      background: '#f0fdf4',
      border: '#86efac',
      badge: '#22c55e',
    },
    rejected: {
      text: '#dc2626',
      background: '#fee2e2',
      border: '#fca5a5',
      badge: '#ef4444',
    },
  },
  dark: {
    submitted: {
      text: '#60a5fa',
      background: '#1e3a8a',
      border: '#1e40af',
      badge: '#3b82f6',
    },
    under_verification: {
      text: '#7dd3fc',
      background: '#001f3f',
      border: '#0369a1',
      badge: '#38bdf8',
    },
    action_required: {
      text: '#fbbf24',
      background: '#332701',
      border: '#d97706',
      badge: '#fbbf24',
    },
    sanctioned: {
      text: '#86efac',
      background: '#1b2e1b',
      border: '#15803d',
      badge: '#4ade80',
    },
    disbursed: {
      text: '#86efac',
      background: '#1b2e1b',
      border: '#15803d',
      badge: '#22c55e',
    },
    rejected: {
      text: '#fca5a5',
      background: '#3a0a0a',
      border: '#991b1b',
      badge: '#ef4444',
    },
  },
} as const;

export type ApplicationStatus = keyof typeof StatusColors.light;

// ============================================================================
// TYPOGRAPHY - Font families and type scales
// ============================================================================

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

// Type scale: Defines font sizes and line heights for different text styles
export const Typography = {
  h1: {
    fontSize: 48,
    fontWeight: '600',
    lineHeight: 56,
  },
  h2: {
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 40,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  small: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  smallBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  xs: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  xsBold: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  code: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
} as const;

// ============================================================================
// SPACING - Consistent spacing scale
// ============================================================================

// New-style spacing scale, used by the generated JAGO UI component library
// (Button, Card, Input, Badge, ScreenHeader, etc.) below.
export const SpacingTokens = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
} as const;

// `Spacing` keeps the ORIGINAL key names already in use throughout the
// existing JAGO codebase (explore.tsx, collapsible.tsx, web-badge.tsx,
// hint-row.tsx, app-tabs.web.tsx, etc.). Do not rename these keys or every
// existing usage of Spacing.three / Spacing.four / etc. breaks at runtime.
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// Alias kept for clarity/back-compat with anything referencing this name directly.
export const LegacySpacing = Spacing;

// ============================================================================
// BORDER RADIUS - Consistent corner rounding
// ============================================================================

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// ============================================================================
// SHADOWS - Elevation and depth
// ============================================================================

export const Shadows = {
  light: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  dark: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
    },
  },
} as const;

// ============================================================================
// INTERACTION - Touch targets and animations
// ============================================================================

export const Interaction = {
  // Minimum touch target size for accessibility (44x44 points)
  minTouchSize: 44,
  // Default opacity for disabled state
  disabledOpacity: 0.5,
  // Active/pressed state opacity
  activeOpacity: 0.7,
} as const;

// ============================================================================
// LAYOUT - Common layout values
// ============================================================================

// Direct top-level exports preserved for existing code (explore.tsx,
// app-tabs.web.tsx) that imports these by name rather than via Layout.
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const Layout = {
  screenPadding: 16,
  maxContentWidth: MaxContentWidth,
  bottomTabInset: BottomTabInset,
  safeAreaInset: Platform.select({ ios: 8, android: 0 }) ?? 0,
} as const;

// ============================================================================
// COMPONENTS - Component-specific token groups (optional convenience)
// ============================================================================

export const ComponentTokens = {
  button: {
    height: 44,
    paddingHorizontal: SpacingTokens.base,
    paddingVertical: SpacingTokens.sm,
    borderRadius: BorderRadius.md,
  },
  input: {
    height: 44,
    paddingHorizontal: SpacingTokens.base,
    paddingVertical: SpacingTokens.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  card: {
    paddingVertical: SpacingTokens.lg,
    paddingHorizontal: SpacingTokens.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  badge: {
    paddingHorizontal: SpacingTokens.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
} as const;

// ============================================================================
// BACKWARD COMPATIBILITY - Legacy color exports
// ============================================================================

// Keep these for backward compatibility with existing code
export { Colors as ColorScheme };
