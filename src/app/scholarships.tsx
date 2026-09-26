import { useRouter } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ScholarshipScheme } from '@/data/scholarships';
import { scholarshipSchemes } from '@/data/scholarships';

export default function ScholarshipsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleViewDetails = (scheme: ScholarshipScheme) => {
    router.push({
      pathname: '/scholarship-details',
      params: { id: scheme.id },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 12, 20) }]}>
        <Text style={styles.headerTitle}>Scholarships</Text>
        <Text style={styles.headerSubtitle}>
          Explore scholarship schemes available through JAGO
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!scholarshipSchemes || scholarshipSchemes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No scholarship schemes available.</Text>
          </View>
        ) : (
          scholarshipSchemes.map((scheme) => (
            <View key={scheme.id} style={styles.card}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{scheme.category}</Text>
              </View>

              <Text style={styles.shortName}>{scheme.shortName}</Text>
              <Text style={styles.fullName}>{scheme.name}</Text>

              <Text style={styles.description} numberOfLines={3}>
                {scheme.description}
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => handleViewDetails(scheme)}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  shortName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  fullName: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10,
    lineHeight: 16,
  },
  description: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
});