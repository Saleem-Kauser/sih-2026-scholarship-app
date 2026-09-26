import { useRouter } from 'expo-router';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProgressStage {
  name: string;
  status: 'completed' | 'current' | 'pending';
}

export default function ScholarshipScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const stages: ProgressStage[] = [
    { name: 'Submitted', status: 'completed' },
    { name: 'Document Verification', status: 'current' },
    { name: 'Sanction', status: 'pending' },
    { name: 'Disbursement', status: 'pending' },
  ];

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
        <Text style={styles.headerTitle}>Application Status</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 32, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Application Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Application Details</Text>
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>Demo data</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Scheme</Text>
            <Text style={styles.value}>Post-Matric Scholarship</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Application ID</Text>
            <Text style={[styles.value, styles.monoValue]}>JAGO-2026-00124</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Application Status</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusBadgeText}>Under Verification</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Application Date</Text>
            <Text style={styles.value}>18 September 2026</Text>
          </View>
        </View>

        {/* Application Progress Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Application Progress</Text>

          <View style={styles.timelineContainer}>
            {stages.map((stage, index) => {
              const isCompleted = stage.status === 'completed';
              const isCurrent = stage.status === 'current';
              const isFirst = index === 0;
              const isLast = index === stages.length - 1;

              return (
                <View key={stage.name} style={styles.timelineRow}>
                  {/* Timeline Track & Dot */}
                  <View style={styles.trackColumn}>
                    <View
                      style={[
                        styles.trackLine,
                        {
                          backgroundColor: isFirst
                            ? 'transparent'
                            : isCompleted || isCurrent
                            ? '#16a34a'
                            : '#e2e8f0',
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.dot,
                        isCompleted && styles.dotCompleted,
                        isCurrent && styles.dotCurrent,
                        stage.status === 'pending' && styles.dotPending,
                      ]}
                    >
                      {isCurrent && <View style={styles.dotCurrentInner} />}
                    </View>
                    <View
                      style={[
                        styles.trackLine,
                        {
                          backgroundColor: isLast
                            ? 'transparent'
                            : isCompleted
                            ? '#16a34a'
                            : '#e2e8f0',
                        },
                      ]}
                    />
                  </View>

                  {/* Stage Details */}
                  <View style={styles.stageContent}>
                    <Text
                      style={[
                        styles.stageName,
                        isCurrent && styles.stageNameCurrent,
                      ]}
                    >
                      {stage.name}
                    </Text>

                    <Text
                      style={[
                        styles.stageStatusText,
                        isCompleted && styles.statusTextCompleted,
                        isCurrent && styles.statusTextCurrent,
                        stage.status === 'pending' && styles.statusTextPending,
                      ]}
                    >
                      {isCompleted
                        ? 'Completed'
                        : isCurrent
                        ? 'In Progress'
                        : 'Pending'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Pending Action Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pending Action</Text>
          <Text style={styles.cardSubtitle}>
            No action required from you at this stage.
          </Text>
        </View>

        {/* Disbursement Status Card */}
        <View style={[styles.card, styles.disbursementCard]}>
          <View style={styles.disbursementHeader}>
            <Text style={styles.cardTitle}>Disbursement</Text>
            <View style={styles.amberBadge}>
              <Text style={styles.amberBadgeText}>Pending</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>Pending verification.</Text>
        </View>

        {/* Disclaimer Notice */}
        <Text style={styles.disclaimerText}>
          Demo Data: This record is sample data for demonstration purposes and is not connected to a live government scholarship portal.
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
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  demoBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  infoRow: {
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  monoValue: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1d4ed8',
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  timelineContainer: {
    paddingVertical: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 48,
  },
  trackColumn: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  trackLine: {
    width: 2,
    flex: 1,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    zIndex: 1,
  },
  dotCompleted: {
    borderColor: '#16a34a',
    backgroundColor: '#16a34a',
  },
  dotCurrent: {
    borderColor: '#1d4ed8',
    backgroundColor: '#ffffff',
  },
  dotCurrentInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1d4ed8',
  },
  dotPending: {
    borderColor: '#cbd5e1',
  },
  stageContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  stageName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  stageNameCurrent: {
    fontWeight: '700',
    color: '#0f172a',
  },
  stageStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextCompleted: {
    color: '#15803d',
  },
  statusTextCurrent: {
    color: '#1d4ed8',
  },
  statusTextPending: {
    color: '#94a3b8',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginTop: 4,
  },
  disbursementCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#d97706',
  },
  disbursementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amberBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  amberBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#b45309',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
    marginHorizontal: 12,
  },
});