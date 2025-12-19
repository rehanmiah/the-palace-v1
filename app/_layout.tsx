
import { Stack } from 'expo-router';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import VideoSplashScreen from '@/components/VideoSplashScreen';
import { StatusBar } from 'expo-status-bar';

// Keep the native splash screen visible while we load resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showVideoSplash, setShowVideoSplash] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load any resources here (fonts, data, etc.)
        console.log('Preparing app resources...');
        
        // Simulate loading time - replace with actual resource loading
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('App resources ready');
        setAppIsReady(true);
      } catch (error) {
        console.warn('Error preparing app:', error);
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const handleSplashFinish = () => {
    console.log('Splash screen finished');
    setShowVideoSplash(false);
  };

  // Show video splash screen while app is loading or video is playing
  if (!appIsReady || showVideoSplash) {
    return (
      <VideoSplashScreen
        videoSource={require('@/assets/splash-video.mp4')}
        onFinish={handleSplashFinish}
        minDuration={2000}
      />
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        {/* Global StatusBar - dark (black) text/icons on all pages for iOS */}
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colorScheme === 'dark' ? '#000' : colors.background,
            },
            // Ensure header has white background when shown
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#000000',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="cart" 
            options={{ 
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }} 
          />
          <Stack.Screen 
            name="login" 
            options={{ 
              presentation: 'modal', 
              headerShown: true, 
              title: 'Login',
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
              headerTintColor: '#000000',
            }} 
          />
          <Stack.Screen 
            name="register" 
            options={{ 
              presentation: 'modal', 
              headerShown: true, 
              title: 'Register',
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
              headerTintColor: '#000000',
            }} 
          />
          <Stack.Screen 
            name="account-settings" 
            options={{ 
              presentation: 'modal', 
              headerShown: true, 
              title: 'Account Settings',
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
              headerTintColor: '#000000',
            }} 
          />
          <Stack.Screen 
            name="payment-methods" 
            options={{ 
              presentation: 'modal', 
              headerShown: true, 
              title: 'Payment Methods',
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
              headerTintColor: '#000000',
            }} 
          />
          <Stack.Screen 
            name="order-history" 
            options={{ 
              presentation: 'modal', 
              headerShown: true, 
              title: 'Order History',
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
              headerTintColor: '#000000',
            }} 
          />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
