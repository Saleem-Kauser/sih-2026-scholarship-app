import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      {/* Forces the top status bar text/icons to be dark, matching the light app theme */}
      <StatusBar style="dark" />
      
      <AnimatedSplashOverlay />
      
      <Stack
        screenOptions={{
          // Prevents dark flashes during screen transitions
          contentStyle: { backgroundColor: '#F8FAFC' },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="explore" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="scholarship" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="scholarships" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="scholarship-details" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="apply" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="apply-documents" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="documents" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="document-detail" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="assistant" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="admin" 
          options={{ headerShown: false }} 
        />
      </Stack>
    </ThemeProvider>
  );
}