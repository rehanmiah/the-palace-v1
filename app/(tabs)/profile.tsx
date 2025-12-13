
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

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
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person',
      iosIcon: 'person.fill',
      title: 'Account Settings',
      subtitle: 'Manage your account details',
      onPress: () => {
        if (!isAuthenticated) {
          router.push('/login');
        } else {
          router.push('/account-settings');
        }
      },
    },
    {
      icon: 'location-on',
      iosIcon: 'location.fill',
      title: 'Delivery Addresses',
      subtitle: 'Manage your saved addresses',
      onPress: () => {
        if (!isAuthenticated) {
          router.push('/login');
        } else {
          Alert.alert('Coming Soon', 'Address management will be available soon');
        }
      },
    },
    {
      icon: 'payment',
      iosIcon: 'creditcard.fill',
      title: 'Payment Methods',
      subtitle: 'Manage your payment options',
      onPress: () => {
        if (!isAuthenticated) {
          router.push('/login');
        } else {
          router.push('/payment-methods');
        }
      },
    },
    {
      icon: 'history',
      iosIcon: 'clock.fill',
      title: 'Order History',
      subtitle: 'View your past orders',
      onPress: () => {
        if (!isAuthenticated) {
          router.push('/login');
        } else {
          router.push('/order-history');
        }
      },
    },
    {
      icon: 'settings',
      iosIcon: 'wrench.and.screwdriver.fill',
      title: 'Admin Utilities',
      subtitle: 'Update menu images and manage popular items',
      onPress: () => {
        router.push('/admin-utils');
      },
    },
    {
      icon: 'info',
      iosIcon: 'info.circle.fill',
      title: 'About',
      subtitle: 'App version and information',
      onPress: () => {
        Alert.alert('About', 'The Palace - Indian Takeaway\nVersion 1.0.0');
      },
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <IconSymbol
              ios_icon_name="person.circle.fill"
              android_material_icon_name="account-circle"
              size={80}
              color={colors.primary}
            />
          </View>
          {isAuthenticated && user ? (
            <>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {(!user.emailVerified || !user.phoneVerified) && (
                <View style={styles.verificationWarning}>
                  <IconSymbol
                    ios_icon_name="exclamationmark.triangle.fill"
                    android_material_icon_name="warning"
                    size={16}
                    color={colors.error}
                  />
                  <Text style={styles.verificationText}>
                    Please verify your {!user.emailVerified ? 'email' : ''}{!user.emailVerified && !user.phoneVerified ? ' and ' : ''}{!user.phoneVerified ? 'phone' : ''}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.userName}>Guest User</Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.loginButtonText}>Sign In</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuIconContainer}>
                  <IconSymbol
                    ios_icon_name={item.iosIcon}
                    android_material_icon_name={item.icon}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Logout Button */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <IconSymbol
              ios_icon_name="arrow.right.square"
              android_material_icon_name="logout"
              size={20}
              color={colors.error}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 48,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  verificationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.error + '20',
    borderRadius: 8,
  },
  verificationText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    boxShadow: '0px 4px 8px rgba(255, 127, 80, 0.3)',
    elevation: 4,
  },
  loginButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
    gap: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});
