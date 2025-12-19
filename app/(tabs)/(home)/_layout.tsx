
import { Platform } from 'react-native';
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#000000',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // Hide header on all platforms (using custom sticky header)
        }}
      />
    </Stack>
  );
}
