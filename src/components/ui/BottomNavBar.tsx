import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { setRoleAndNavigate } from '@/utils/roleStore';

export type TabKey = 'home' | 'scholarships' | 'documents' | 'status' | 'assistant';

interface NavItem {
  key: TabKey;
  label: string;
  route: string;
  iconSymbol: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Home', route: '/', iconSymbol: '🏠' },
  { key: 'scholarships', label: 'Scholarships', route: '/scholarships', iconSymbol: '🎓' },
  { key: 'documents', label: 'Documents', route: '/documents', iconSymbol: '📁' },
  { key: 'status', label: 'Status', route: '/scholarship', iconSymbol: '📋' },
  { key: 'assistant', label: 'JAGO', route: '/assistant', iconSymbol: '💬' },
];

export interface BottomNavBarProps {
  activeTab?: TabKey;
}

export function BottomNavBar({ activeTab }: BottomNavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const getIsActive = (item: NavItem): boolean => {
    if (activeTab) {
      return activeTab === item.key;
    }
    if (item.route === '/' && (pathname === '/' || pathname === '/index')) {
      return true;
    }
    if (item.route !== '/' && pathname.startsWith(item.route)) {
      return true;
    }
    return false;
  };

  const handlePress = (item: NavItem) => {
    if (item.key === 'assistant' && activeTab !== 'assistant') {
      setRoleAndNavigate('student', () => router.replace(item.route as any));
      return;
    }
    router.replace(item.route as any);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.navRow}>
        {NAV_ITEMS.map((item) => {
          const isActive = getIsActive(item);

          return (
            <TouchableOpacity
              key={item.key}
              style={styles.tabButton}
              onPress={() => handlePress(item)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.iconText, isActive && styles.iconTextActive]}>
                {item.iconSymbol}
              </Text>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    position: 'relative',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconText: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.7,
  },
  iconTextActive: {
    opacity: 1.0,
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  labelActive: {
    fontWeight: '700',
    color: '#1D4ED8',
  },
  activeIndicator: {
    width: 16,
    height: 3,
    backgroundColor: '#1D4ED8',
    borderRadius: 2,
    marginTop: 4,
  },
});