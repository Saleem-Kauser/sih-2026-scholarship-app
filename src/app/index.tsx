import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>JAGO</Text>

        <Text style={styles.greeting}>
          Welcome, Student 👋
        </Text>

        <Text style={styles.subtitle}>
          Your unified scholarship assistant
        </Text>
      </View>

      {/* Scholarship Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Scholarship Status
        </Text>

        <Text style={styles.cardText}>
          You currently have 1 scholarship application in progress.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push('/scholarship')}
        >
          <Text style={styles.primaryButtonText}>
            View Application
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push('/scholarships')}
        >
          <Text style={styles.secondaryButtonText}>
            Browse Scholarships
          </Text>
        </Pressable>
      </View>

      {/* Need Help */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Need Help?
        </Text>

        <Text style={styles.cardText}>
          Ask JAGO about eligibility, documents, or your application status.
        </Text>

        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>
            Ask JAGO
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 20,
    paddingTop: 64,
  },

  header: {
    marginBottom: 28,
  },

  logo: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1677FF',
    marginBottom: 24,
    letterSpacing: 0.5,
  },

  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#172033',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: '#667085',
    lineHeight: 22,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#172033',
    marginBottom: 8,
  },

  cardText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#667085',
    marginBottom: 18,
  },

  primaryButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#1677FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  secondaryButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  secondaryButtonText: {
    color: '#344054',
    fontSize: 15,
    fontWeight: '600',
  },
});