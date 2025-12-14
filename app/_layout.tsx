
import { Stack } from 'expo-router';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme, View } from 'react-native';
import { colors } from '@/styles/commonStyles';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#000' : colors.background;
  
  return (
    <View style={{ flex: 1, backgroundColor }}>
      <AuthProvider>
        <CartProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor,
              },
              animation: 'default',
            }}
          >
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                headerShown: false,
                contentStyle: {
                  backgroundColor,
                },
              }} 
            />
            <Stack.Screen 
              name="cart" 
              options={{ 
                presentation: 'modal', 
                headerShown: true, 
                title: 'Cart',
                contentStyle: {
                  backgroundColor,
                },
              }} 
            />
            <Stack.Screen 
              name="login" 
              options={{ 
                presentation: 'modal', 
                headerShown: true, 
                title: 'Login',
                contentStyle: {
                  backgroundColor,
                },
                headerStyle: {
                  backgroundColor,
                },
              }} 
            />
            <Stack.Screen 
              name="register" 
              options={{ 
                presentation: 'modal', 
                headerShown: true, 
                title: 'Register',
                contentStyle: {
                  backgroundColor,
                },
                headerStyle: {
                  backgroundColor,
                },
              }} 
            />
            <Stack.Screen 
              name="account-settings" 
              options={{ 
                presentation: 'modal', 
                headerShown: true, 
                title: 'Account Settings',
                contentStyle: {
                  backgroundColor,
                },
              }} 
            />
            <Stack.Screen 
              name="payment-methods" 
              options={{ 
                presentation: 'modal', 
                headerShown: true, 
                title: 'Payment Methods',
                contentStyle: {
                  backgroundColor,
                },
              }} 
            />
            <Stack.Screen 
              name="order-history" 
              options={{ 
                presentation: 'modal', 
                headerShown: true, 
                title: 'Order History',
                contentStyle: {
                  backgroundColor,
                },
              }} 
            />
          </Stack>
        </CartProvider>
      </AuthProvider>
    </View>
  );
}
