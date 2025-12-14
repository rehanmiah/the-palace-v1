
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#000' : colors.background;
  
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Home',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: 'Profile',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: {
            backgroundColor,
          },
        }}
      >
        <Stack.Screen 
          key="home" 
          name="(home)" 
          options={{
            contentStyle: {
              backgroundColor,
            },
          }}
        />
        <Stack.Screen 
          key="profile" 
          name="profile" 
          options={{
            contentStyle: {
              backgroundColor,
            },
          }}
        />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
