
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AddressModal from '@/components/AddressModal';

interface Address {
  id: string;
  label: string;
  address: string;
}

interface DeliveryHeaderProps {
  isDelivery: boolean;
  setIsDelivery: (value: boolean) => void;
  selectedAddress: Address;
  setSelectedAddress: (address: Address) => void;
  addresses: Address[];
  setAddresses: (addresses: Address[]) => void;
  collectionName: string;
  setCollectionName: (name: string) => void;
}

export default function DeliveryHeader({
  isDelivery,
  setIsDelivery,
  selectedAddress,
  setSelectedAddress,
  addresses,
  setAddresses,
  collectionName,
  setCollectionName,
}: DeliveryHeaderProps) {
  const [showAddressModal, setShowAddressModal] = useState(false);

  const handleAddAddress = (address: Address) => {
    setAddresses([...addresses, address]);
    setSelectedAddress(address);
  };

  // Extract postcode from address
  const getPostcode = (address: string) => {
    const parts = address.split(',').map(part => part.trim());
    return parts[parts.length - 1] || '';
  };

  return (
    <React.Fragment>
      <View style={styles.headerContainer}>
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
              size={18}
              color={colors.text}
            />
            <View style={styles.addressTextContainer}>
              {isDelivery ? (
                <Text style={styles.addressLabel} numberOfLines={1}>
                  {selectedAddress.label} - {getPostcode(selectedAddress.address)}
                </Text>
              ) : (
                <Text style={styles.addressLabel} numberOfLines={1}>
                  {collectionName || 'Person collecting'}
                </Text>
              )}
            </View>
          </View>
          <IconSymbol
            ios_icon_name="chevron.down"
            android_material_icon_name="keyboard-arrow-down"
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

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
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#000000',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  addressDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 10,
    borderRadius: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
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
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
});
