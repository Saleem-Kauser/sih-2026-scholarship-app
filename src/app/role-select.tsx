import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, ScreenHeader } from '@/components/ui';
import { SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { setRole, type PrototypeRole } from '@/utils/roleStore';

export default function RoleSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const continueAs = (role: PrototypeRole) => {
    setRole(role);
    router.replace(role === 'admin' ? '/admin' : '/');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="JAGO" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + Spacing.lg, Spacing.xl) }]}>
        <Text style={styles.brand}>JAGO</Text>
        <Text style={styles.subtitle}>Unified Scholarship Platform</Text>
        <Card variant="outlined" style={styles.card}>
          <Text style={Typography.h6}>Prototype Role Selection</Text>
          <Text style={styles.note}>Prototype role selection only. This is not a government login or production authentication.</Text>
          <Button label="Continue as Student" onPress={() => continueAs('student')} fullWidth style={styles.button} />
          <Button label="Continue as Ministry / Admin" variant="secondary" onPress={() => continueAs('admin')} fullWidth style={styles.button} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.base },
  brand: { color: '#1D4ED8', fontSize: 30, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#475569', fontSize: 16, marginBottom: Spacing.lg },
  card: { gap: Spacing.md, padding: Spacing.lg },
  note: { ...Typography.small, color: '#64748B', lineHeight: 20 },
  button: { marginTop: Spacing.xs },
});
