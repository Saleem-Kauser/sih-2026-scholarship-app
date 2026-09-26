import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>JAGO</Text>

      <Text style={styles.greeting}>Welcome, Student 👋</Text>

      <Text style={styles.subtitle}>
        Your unified scholarship assistant
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Scholarship Status</Text>
        <Text style={styles.cardText}>
          You currently have 1 scholarship application in progress.
        </Text>

        <Pressable 
          style={styles.button}
          onPress={() => router.push('/scholarship')}
        >
          <Text style={styles.buttonText}>View Application</Text>
        </Pressable>

        <Pressable 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/scholarships')}
        >
          <Text style={styles.buttonText}>Browse Scholarships</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Need Help?</Text>
        <Text style={styles.cardText}>
          Ask JAGO about eligibility, documents, or your application status.
        </Text>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Ask JAGO</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 70,
  },

  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#ffffff',
  },

  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffffff',
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#cccccc',
  },

  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#eeeeee',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  cardText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },

  button: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#222222',
    alignItems: 'center',
  },

  secondaryButton: {
    marginTop: 10,
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});