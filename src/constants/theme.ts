import { TextStyle } from 'react-native';

export type ApplicationStatus =
  | 'submitted'
  | 'under_verification'
  | 'action_required'
  | 'sanctioned'
  | 'disbursed'
  | 'rejected';

export const Fonts = {
  mono: 'Courier',
  sans: 'System',
};

export const Colors = {
  light: {
    // Primary Brand Blue
    primary: '#1D4ED8',
    primaryLight: '#3B82F6',
    primaryLightest: '#EFF6FF',
    primaryDark: '#1E40AF',

    // Screen & Surface Backgrounds
    background: '#F8FAFC',
    backgroundCard: '#FFFFFF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F1F5F9',
    backgroundSecondary: '#F1F5F9',

    // Text Colors
    text: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    textInverted: '#FFFFFF',

    // Borders & Dividers
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    borderFocus: '#2563EB',

    // Status Colors
    success: '#15803D',
    successLight: '#BBF7D0',
    successLightest: '#F0FDF4',

    warning: '#B45309',
    warningLight: '#FDE68A',
    warningLightest: '#FFFBEB',

    error: '#B91C1C',
    errorLight: '#FECACA',
    errorLightest: '#FEF2F2',

    info: '#0369A1',
    infoLight: '#BAE6FD',
    infoLightest: '#F0F9FF',
  },
  // Default fallback configured to clean light surface
  dark: {
    primary: '#1D4ED8',
    primaryLight: '#3B82F6',
    primaryLightest: '#EFF6FF',
    primaryDark: '#1E40AF',

    background: '#F8FAFC',
    backgroundCard: '#FFFFFF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F1F5F9',
    backgroundSecondary: '#F1F5F9',

    text: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    textInverted: '#FFFFFF',

    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    borderFocus: '#2563EB',

    success: '#15803D',
    successLight: '#BBF7D0',
    successLightest: '#F0FDF4',

    warning: '#B45309',
    warningLight: '#FDE68A',
    warningLightest: '#FFFBEB',

    error: '#B91C1C',
    errorLight: '#FECACA',
    errorLightest: '#FEF2F2',

    info: '#0369A1',
    infoLight: '#BAE6FD',
    infoLightest: '#F0F9FF',
  },
};

export const StatusColors: Record<
  ApplicationStatus,
  { bg: string; text: string; border: string; label: string; badge: string }
> = {
  submitted: {
    bg: '#EFF6FF',
    text: '#1D4ED8',
    border: '#BFDBFE',
    label: 'Submitted',
    badge: '#1D4ED8',
  },
  under_verification: {
    bg: '#F0F9FF',
    text: '#0369A1',
    border: '#BAE6FD',
    label: 'Under Verification',
    badge: '#0369A1',
  },
  action_required: {
    bg: '#FFFBEB',
    text: '#B45309',
    border: '#FDE68A',
    label: 'Action Required',
    badge: '#B45309',
  },
  sanctioned: {
    bg: '#F0FDF4',
    text: '#15803D',
    border: '#BBF7D0',
    label: 'Sanctioned',
    badge: '#15803D',
  },
  disbursed: {
    bg: '#F0FDF4',
    text: '#15803D',
    border: '#BBF7D0',
    label: 'Disbursed',
    badge: '#15803D',
  },
  rejected: {
    bg: '#FEF2F2',
    text: '#B91C1C',
    border: '#FECACA',
    label: 'Rejected',
    badge: '#B91C1C',
  },
};

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
};

export const Spacing = {
  half: 4,
  one: 8,
  two: 16,
  three: 24,
  four: 32,
  five: 40,
  six: 48,
  ...SpacingTokens,
};

export const BottomTabInset = 16;
export const MaxContentWidth = 600;

export const Typography: Record<string, TextStyle> = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  h2: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h3: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h4: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h5: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  h6: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  smallBold: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  xs: { fontSize: 11, fontWeight: '400', lineHeight: 14 },
  xsBold: { fontSize: 11, fontWeight: '600', lineHeight: 14 },
  label: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  code: { fontSize: 13, fontWeight: '400', fontFamily: 'Courier' },
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  light: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  dark: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export const Layout = {
  screenPadding: SpacingTokens.base,
  maxContentWidth: MaxContentWidth,
  headerHeight: 56,
};

export const ComponentTokens = {
  inputHeight: 44,
  buttonHeight: 44,
  iconSizeSm: 16,
  iconSizeMd: 20,
  iconSizeLg: 24,
};

export const Interaction = {
  minTouchSize: 44,
  disabledOpacity: 0.5,
  activeOpacity: 0.7,
};