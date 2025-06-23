// app/(modals)/_layout.tsx
import { Stack } from 'expo-router';

export default function ModalsLayout() {
    return (
        <Stack
            screenOptions={({ route }) => ({
                headerShown: false,
                presentation: 'modal'
            })}
        >
            <Stack.Screen name="RestaurantDetails" options={{ presentation: 'card' }} />
            <Stack.Screen name="OtherUserProfile" options={{ presentation: 'card' }} />
        </Stack>

    );
}