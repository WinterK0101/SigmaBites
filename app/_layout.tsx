import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import './globals.css';
import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Lexend-Bold": require('../assets/fonts/Lexend-Bold.ttf'),
    "Lexend-Regular": require('../assets/fonts/Lexend-Regular.ttf'),
    "Lexend-Variable": require('../assets/fonts/Lexend-Variable.ttf'),
    "Baloo-Regular": require('../assets/fonts/Baloo-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // If fonts have loaded, splash screen will be hidden
    }
  }, [fontsLoaded]); // Checks if fonts are loaded

  if (!fontsLoaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
      <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
              name="(modals)"
              options={{ presentation: 'modal', headerShown: false }}
          />
        <Stack.Screen
            name="(modals)/Swiping"
            options={{
              headerShown: false,
            }}
        />
        <Stack.Screen
            name="NoMatches"
            options={{
              headerShown: false,
            }}
        />
      </Stack>
  );
}


