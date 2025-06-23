// app/(modals)/_layout.tsx
import { Stack } from 'expo-router';

export default function ModalsLayout() {
    return (
        <Stack
            screenOptions={({ route }) => ({
                headerShown: false,
                presentation: route.name === 'RestaurantDetails' ? 'modal' : 'card'
            })}
        />

    );
}