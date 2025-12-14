
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Success', 'Logged out successfully');
            } catch (error) {
              console.log('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  // Menu items for authenticated users
  const authenticatedMenuItems = [
    {
      icon: 'person.fill',
      title: 'Account Settings',
      subtitle: 'Manage your account details',
      onPress: () => router.push('/account-settings'),
    },
    {
      icon: 'location.fill',
      title: 'Delivery Addresses',
      subtitle: 'Manage your saved addresses',
      onPress: () => {
        Alert.alert('Coming Soon', 'Address management will be available soon');
      },
    },
    {
      icon: 'creditcard.fill',
      title: 'Payment Methods',
      subtitle: 'Manage your payment options',
      onPress: () => router.push('/payment-methods'),
    },
    {
      icon: 'clock.fill',
      title: 'Order History',
      subtitle: 'View your past orders',
      onPress: () => router.push('/order-history'),
    },
    {
      icon: 'info.circle.fill',
      title: 'About',
      subtitle: 'App version and information',
      onPress: () => {
        Alert.alert('About', 'The Palace - Indian Takeaway\nVersion 1.0.0');
      },
    },
  ];

  // Menu items for guest users
  const guestMenuItems = [
    {
      icon: 'info.circle.fill',
      title: 'About',
      subtitle: 'App version and information',
      onPress: () => {
        Alert.alert('About', 'The Palace - Indian Takeaway\nVersion 1.0.0');
      },
    },
  ];

  const menuItems = isAuthenticated ? authenticatedMenuItems : guestMenuItems;

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <GlassView style={styles.profileHeader} glassEffectStyle="regular">
            <IconSymbol ios_icon_name="person.circle.fill" android_material_icon_name="account-circle" size={80} color={colors.primary} />
            {isAuthenticated && user ? (
              <React.Fragment>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>
                {(!user.emailVerified || !user.phoneVerified) && (
                  <View style={styles.verificationWarning}>
                    <IconSymbol
                      ios_icon_name="exclamationmark.triangle.fill"
                      android_material_icon_name="warning"
                      size={16}
                      color="#FF6B6B"
                    />
                    <Text style={styles.verificationText}>
                      Please verify your {!user.emailVerified ? 'email' : ''}{!user.emailVerified && !user.phoneVerified ? ' and ' : ''}{!user.phoneVerified ? 'phone' : ''}
                    </Text>
                  </View>
                )}
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Text style={styles.name}>Guest User</Text>
                <Text style={styles.guestSubtitle}>Sign in to access your account</Text>
                <View style={styles.authButtonsContainer}>
                  <TouchableOpacity
                    style={styles.signInButton}
                    onPress={() => router.push('/login')}
                  >
                    <Text style={styles.signInButtonText}>Sign In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => router.push('/register')}
                  >
                    <Text style={styles.registerButtonText}>Register</Text>
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            )}
          </GlassView>

          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity onPress={item.onPress}>
                  <GlassView style={styles.menuItem} glassEffectStyle="regular">
                    <View style={styles.menuIconContainer}>
                      <IconSymbol ios_icon_name={item.icon} android_material_icon_name={item.icon} size={24} color={colors.primary} />
                    </View>
                    <View style={styles.menuTextContainer}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    </View>
                    <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron-right" size={20} color={colors.textSecondary} />
                  </GlassView>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>

          {isAuthenticated && (
            <TouchableOpacity onPress={handleLogout}>
              <GlassView style={styles.logoutButton} glassEffectStyle="regular">
                <IconSymbol ios_icon_name="arrow.right.square" android_material_icon_name="logout" size={20} color="#FF6B6B" />
                <Text style={styles.logoutText}>Logout</Text>
              </GlassView>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 32,
    marginBottom: 20,
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  guestSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  authButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  signInButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(27, 127, 192, 0.3)',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(27, 127, 192, 0.3)',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  verificationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF6B6B20',
    borderRadius: 8,
  },
  verificationText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  menuSection: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});
