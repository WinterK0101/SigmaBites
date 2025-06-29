import { useFonts } from 'expo-font';
import {Stack, Tabs} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import './globals.css';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/SupabaseConfig';
import { SessionProvider } from '@/context/SessionContext';

export {
    ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded, error] = useFonts({
        'Lexend-Bold': require('../assets/fonts/Lexend-Bold.ttf'),
        'Lexend-Regular': require('../assets/fonts/Lexend-Regular.ttf'),
        'Lexend-Variable': require('../assets/fonts/Lexend-Variable.ttf'),
        'Baloo-Regular': require('../assets/fonts/Baloo-Regular.ttf'),
    });

    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        // Get current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // Subscribe to auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        // Cleanup
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SessionProvider >
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index"/>
                    <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
                    <Stack.Screen
                        name="(tabs)"
                        options={{
                            gestureEnabled: false,
                            animation: 'none'
                        }}
                    />
                </Stack>
        </SessionProvider>
    );
}
