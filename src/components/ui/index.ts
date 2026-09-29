/**
 * JAGO UI Components - Barrel Export
 * 
 * Import all UI components from this single file:
 * 
 * import { Button, Card, Input, Badge, BottomNavBar } from '@/components/ui';
 */

// Core Components
export { Badge, type BadgeProps, type BadgeSize, type BadgeVariant } from './Badge';
export { BottomNavBar, type BottomNavBarProps, type TabKey } from './BottomNavBar';
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from './Button';
export { Card, type CardProps, type CardVariant } from './Card';
export { Input, type InputProps } from './Input';
export { ScreenHeader, type ScreenHeaderProps } from './ScreenHeader';
export { SectionHeader, type SectionHeaderProps } from './SectionHeader';

// JAGO-Specific Components
export {
    ApplicationTimeline,
    type ApplicationTimelineProps,
    type TimelineItem,
    type TimelineStage
} from './ApplicationTimeline';
export { DocumentCard, type DocumentCardProps, type DocumentStatus } from './DocumentCard';
export { EmptyState, type EmptyStateProps } from './EmptyState';
export { LoadingState, type LoadingStateProps } from './LoadingState';
export {
    ScholarshipCard,
    type ScholarshipCardProps
} from './ScholarshipCard';
export { StatusBadge, type StatusBadgeProps } from './StatusBadge';

