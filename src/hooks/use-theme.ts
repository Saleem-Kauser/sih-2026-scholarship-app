import { Colors } from '@/constants/theme';

/**
 * JAGO Theme Hook
 * Always returns the light theme palette regardless of system or device dark mode settings.
 */
export function useTheme() {
  return Colors.light;
}