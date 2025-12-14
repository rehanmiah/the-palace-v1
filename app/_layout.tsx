
import { Stack } from 'expo-router';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Set status bar style to dark (black text) on iOS
  useEffect(() => {
    if (Platform.OS === 'ios') {
      SystemUI.setBackgroundColorAsync('#FFFFFF');
    }
  }, []);
  
  return (
    <AuthProvider>
      <CartProvider>
        {/* iOS Status Bar - Set to dark content (black icons/text) */}
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colorScheme === 'dark' ? '#000' : colors.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ presentation: 'modal', headerShown: true, title: 'Cart' }} />
          <Stack.Screen name="login" options={{ presentation: 'modal', headerShown: true, title: 'Login' }} />
          <Stack.Screen name="register" options={{ presentation: 'modal', headerShown: true, title: 'Register' }} />
          <Stack.Screen name="account-settings" options={{ presentation: 'modal', headerShown: true, title: 'Account Settings' }} />
          <Stack.Screen name="payment-methods" options={{ presentation: 'modal', headerShown: true, title: 'Payment Methods' }} />
          <Stack.Screen name="order-history" options={{ presentation: 'modal', headerShown: true, title: 'Order History' }} />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
