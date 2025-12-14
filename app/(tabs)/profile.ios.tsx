
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import AddressModal from '@/components/AddressModal';

interface Address {
  id: string;
  label: string;
  address: string;
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [isDelivery, setIsDelivery] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<Address>({
    id: '1',
    label: 'Home',
    address: '123 Main Street, London, SW1A 1AA',
  });

  const [addresses, setAddresses] = useState<Address[]>([
    { id: '1', label: 'Home', address: '123 Main Street, London, SW1A 1AA' },
    { id: '2', label: 'Work', address: '456 Office Road, London, EC1A 1BB' },
    { id: '3', label: 'Other', address: '789 Park Avenue, London, W1A 1CC' },
  ]);

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

  const handleAddAddress = (address: Address) => {
    setAddresses([...addresses, address]);
    setSelectedAddress(address);
  };

  const getPostcode = (address: string) => {
    const parts = address.split(',').map(part => part.trim());
    return parts[parts.length - 1] || '';
  };

  const menuItems = [
    {
      icon: 'person.fill',
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
      icon: 'location.fill',
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
      icon: 'creditcard.fill',
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
      icon: 'clock.fill',
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
      icon: 'wrench.and.screwdriver.fill',
      title: 'Admin Utilities',
      subtitle: 'Update menu images and manage popular items',
      onPress: () => {
        router.push('/admin-utils');
      },
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Sticky Header with Delivery/Collection Toggle and Address */}
      <View style={styles.stickyHeader}>
        {/* Delivery/Collection Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              isDelivery && styles.toggleButtonActive,
            ]}
            onPress={() => setIsDelivery(true)}
          >
            <Text
              style={[
                styles.toggleButtonText,
                isDelivery && styles.toggleButtonTextActive,
              ]}
            >
              Delivery
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !isDelivery && styles.toggleButtonActive,
            ]}
            onPress={() => setIsDelivery(false)}
          >
            <Text
              style={[
                styles.toggleButtonText,
                !isDelivery && styles.toggleButtonTextActive,
              ]}
            >
              Collection
            </Text>
          </TouchableOpacity>
        </View>

        {/* Address/Collection Dropdown */}
        <TouchableOpacity
          style={styles.addressDropdown}
          onPress={() => setShowAddressModal(true)}
        >
          <View style={styles.addressContent}>
            <IconSymbol
              ios_icon_name={isDelivery ? "location.fill" : "person.fill"}
              android_material_icon_name={isDelivery ? "location-on" : "person"}
              size={20}
              color={theme.colors.text}
            />
            <View style={styles.addressTextContainer}>
              {isDelivery ? (
                <Text style={[styles.addressLabel, { color: theme.colors.text }]}>
                  {selectedAddress.label} - {getPostcode(selectedAddress.address)}
                </Text>
              ) : (
                <Text style={[styles.addressLabel, { color: theme.colors.text }]}>
                  {collectionName || 'Person collecting'}
                </Text>
              )}
            </View>
          </View>
          <IconSymbol
            ios_icon_name="chevron.down"
            android_material_icon_name="keyboard-arrow-down"
            size={20}
            color={theme.dark ? '#98989D' : '#666'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <GlassView style={styles.profileHeader} glassEffectStyle="regular">
          <IconSymbol ios_icon_name="person.circle.fill" android_material_icon_name="account-circle" size={80} color={theme.colors.primary} />
          {isAuthenticated && user ? (
            <React.Fragment>
              <Text style={[styles.name, { color: theme.colors.text }]}>{user.name}</Text>
              <Text style={[styles.email, { color: theme.dark ? '#98989D' : '#666' }]}>{user.email}</Text>
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
              <Text style={[styles.name, { color: theme.colors.text }]}>Guest User</Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.loginButtonText}>Sign In</Text>
              </TouchableOpacity>
            </React.Fragment>
          )}
        </GlassView>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity onPress={item.onPress}>
                <GlassView style={styles.menuItem} glassEffectStyle="regular">
                  <View style={styles.menuIconContainer}>
                    <IconSymbol ios_icon_name={item.icon} android_material_icon_name={item.icon} size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={[styles.menuTitle, { color: theme.colors.text }]}>{item.title}</Text>
                    <Text style={[styles.menuSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>{item.subtitle}</Text>
                  </View>
                  <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron-right" size={20} color={theme.dark ? '#98989D' : '#666'} />
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

      {/* Address Selection Modal */}
      <AddressModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        addresses={addresses}
        selectedAddress={selectedAddress}
        onSelectAddress={setSelectedAddress}
        onAddAddress={handleAddAddress}
        isDelivery={isDelivery}
        collectionName={collectionName}
        onCollectionNameChange={setCollectionName}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  stickyHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 100,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#000000',
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  addressDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
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
  loginButton: {
    marginTop: 16,
    backgroundColor: '#FF7F50',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
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
