import { View, Text, StyleSheet } from 'react-native';
import { useUser } from '@clerk/clerk-expo';

export default function HomeScreen() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to MealForge Mobile!</Text>
      {user ? (
        <Text style={styles.subtitle}>Hello, {user.firstName || 'User'}!</Text>
      ) : (
        <Text style={styles.subtitle}>Please sign in</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});