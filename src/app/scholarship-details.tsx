import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { scholarshipSchemes } from '@/data/scholarships';

export default function ScholarshipDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const scheme = scholarshipSchemes.find((s) => s.id === id);

  if (!scheme) {
    return (
      <View style={[styles.container, styles.notFoundContainer, { paddingTop: insets.top }]}>
        <Text style={styles.notFoundText}>Scholarship scheme not found.</Text>
        <TouchableOpacity
          style={styles.backButtonSimple}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonSimpleText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 16) }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scholarship Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Scheme Main Info Card */}
        <View style={styles.card}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{scheme.category}</Text>
          </View>

          <Text style={styles.shortName}>{scheme.shortName}</Text>
          <Text style={styles.fullName}>{scheme.name}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.descriptionText}>{scheme.description}</Text>
        </View>

        {/* Eligibility Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Eligibility</Text>
          {scheme.basicEligibility.map((item, index) => (
            <View key={index} style={styles.listRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Required Documents Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          {scheme.requiredDocuments.map((item, index) => (
            <View key={index} style={styles.listRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Application System Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Related Government System(s)</Text>
          <Text style={styles.portalText}>{scheme.portal}</Text>
        </View>

        {/* JAGO Prototype Notice */}
        <View style={[styles.card, styles.prototypeCard]}>
          <Text style={styles.prototypeTitle}>JAGO Prototype</Text>
          <Text style={styles.prototypeText}>
            Unified tracking is a prototype feature for demonstration purposes and does NOT mean JAGO has live access to the government portal.
          </Text>
          {scheme.trackingAvailability && (
            <View style={styles.trackingBadge}>
              <Text style={styles.trackingBadgeText}>
                Unified tracking is supported in the JAGO prototype.
              </Text>
            </View>
          )}
        </View>

        {/* Official Disclaimer */}
        <Text style={styles.disclaimerText}>
          Scheme eligibility, documents and other official requirements should be confirmed using the latest official government guidelines.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  notFoundContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  notFoundText: {
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 16,
  },
  backButtonSimple: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  backButtonSimpleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSpacer: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  fullName: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#1d4ed8',
    marginRight: 8,
    lineHeight: 20,
  },
  listText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    flex: 1,
  },
  portalText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  prototypeCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  prototypeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  prototypeText: {
    fontSize: 12,
    color: '#1e3a8a',
    lineHeight: 18,
  },
  trackingBadge: {
    marginTop: 10,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  trackingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 8,
    marginHorizontal: 12,
  },
});