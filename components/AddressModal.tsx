
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Contacts from 'expo-contacts';

interface Address {
  id: string;
  label: string;
  address: string;
}

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  addresses: Address[];
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
  onAddAddress: (address: Address) => void;
}

export default function AddressModal({
  visible,
  onClose,
  addresses,
  selectedAddress,
  onSelectAddress,
  onAddAddress,
}: AddressModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFillOptions, setShowFillOptions] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    city: '',
    postcode: '',
  });

  const handleFillFromDevice = async () => {
    try {
      console.log('Requesting contacts permission...');
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          `To autofill your address, please allow access to your ${Platform.OS === 'ios' ? 'contacts' : 'profile'}.`,
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('Permission granted, fetching contacts...');
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Addresses, Contacts.Fields.FirstName, Contacts.Fields.LastName],
      });

      if (data.length > 0) {
        // Find the first contact with an address
        const contactWithAddress = data.find(
          (contact) => contact.addresses && contact.addresses.length > 0
        );

        if (contactWithAddress && contactWithAddress.addresses) {
          const address = contactWithAddress.addresses[0];
          const fullAddress = [
            address.street,
            address.city,
            address.region,
            address.postalCode,
            address.country,
          ]
            .filter(Boolean)
            .join(', ');

          setNewAddress({
            label: address.label || 'Home',
            street: address.street || '',
            city: address.city || '',
            postcode: address.postalCode || '',
          });

          setShowFillOptions(false);
          setShowAddForm(true);

          console.log('Address filled from contacts:', fullAddress);
        } else {
          Alert.alert(
            'No Address Found',
            `No address found in your ${Platform.OS === 'ios' ? 'contacts' : 'profile'}. Please enter manually.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'No Contacts',
          'No contacts found on your device.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error accessing contacts:', error);
      Alert.alert(
        'Error',
        'Failed to access contacts. Please enter address manually.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleManualEntry = () => {
    setShowFillOptions(false);
    setShowAddForm(true);
    setNewAddress({
      label: '',
      street: '',
      city: '',
      postcode: '',
    });
  };

  const handleSaveAddress = () => {
    if (!newAddress.label || !newAddress.street || !newAddress.city || !newAddress.postcode) {
      Alert.alert('Missing Information', 'Please fill in all address fields.');
      return;
    }

    const fullAddress = `${newAddress.street}, ${newAddress.city}, ${newAddress.postcode}`;
    const address: Address = {
      id: Date.now().toString(),
      label: newAddress.label,
      address: fullAddress,
    };

    onAddAddress(address);
    setShowAddForm(false);
    setNewAddress({ label: '', street: '', city: '', postcode: '' });
    onClose();
  };

  const handleAddNewAddress = () => {
    setShowFillOptions(true);
  };

  const handleCloseAll = () => {
    setShowAddForm(false);
    setShowFillOptions(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCloseAll}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showAddForm ? 'Add New Address' : 'Select Delivery Address'}
            </Text>
            <TouchableOpacity onPress={handleCloseAll}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            {!showAddForm && !showFillOptions && (
              <React.Fragment>
                {addresses.map((address, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.addressOption,
                      selectedAddress?.id === address.id && styles.addressOptionSelected,
                    ]}
                    onPress={() => {
                      onSelectAddress(address);
                      onClose();
                    }}
                  >
                    <View style={styles.addressOptionContent}>
                      <IconSymbol
                        ios_icon_name="location.fill"
                        android_material_icon_name="location-on"
                        size={24}
                        color={colors.text}
                      />
                      <View style={styles.addressOptionText}>
                        <Text style={styles.addressOptionLabel}>{address.label}</Text>
                        <Text style={styles.addressOptionAddress}>{address.address}</Text>
                      </View>
                    </View>
                    {selectedAddress?.id === address.id && (
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check-circle"
                        size={24}
                        color={colors.highlight}
                      />
                    )}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addAddressButton}
                  onPress={handleAddNewAddress}
                >
                  <IconSymbol
                    ios_icon_name="plus.circle"
                    android_material_icon_name="add-circle-outline"
                    size={24}
                    color={colors.text}
                  />
                  <Text style={styles.addAddressText}>Add New Address</Text>
                </TouchableOpacity>
              </React.Fragment>
            )}

            {showFillOptions && (
              <View style={styles.fillOptionsContainer}>
                <Text style={styles.fillOptionsTitle}>Fill Home Address</Text>
                <Text style={styles.fillOptionsSubtitle}>
                  Choose how you&apos;d like to add your address
                </Text>

                <TouchableOpacity
                  style={styles.fillOptionButton}
                  onPress={handleFillFromDevice}
                >
                  <View style={styles.fillOptionContent}>
                    <IconSymbol
                      ios_icon_name="person.crop.circle.fill"
                      android_material_icon_name="account-circle"
                      size={32}
                      color={colors.primary}
                    />
                    <View style={styles.fillOptionText}>
                      <Text style={styles.fillOptionTitle}>
                        {Platform.OS === 'ios' ? 'Fill from My Card' : 'Fill from My Profile'}
                      </Text>
                      <Text style={styles.fillOptionDescription}>
                        {Platform.OS === 'ios'
                          ? 'Use address from your iOS contact card'
                          : 'Use address from your Android profile'}
                      </Text>
                    </View>
                  </View>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fillOptionButton}
                  onPress={handleManualEntry}
                >
                  <View style={styles.fillOptionContent}>
                    <IconSymbol
                      ios_icon_name="pencil.circle.fill"
                      android_material_icon_name="edit"
                      size={32}
                      color={colors.secondary}
                    />
                    <View style={styles.fillOptionText}>
                      <Text style={styles.fillOptionTitle}>Enter Manually</Text>
                      <Text style={styles.fillOptionDescription}>
                        Type in your address details
                      </Text>
                    </View>
                  </View>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowFillOptions(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            {showAddForm && (
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Label</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Home, Work, Other"
                    placeholderTextColor={colors.textSecondary}
                    value={newAddress.label}
                    onChangeText={(text) =>
                      setNewAddress({ ...newAddress, label: text })
                    }
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Street Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123 Main Street"
                    placeholderTextColor={colors.textSecondary}
                    value={newAddress.street}
                    onChangeText={(text) =>
                      setNewAddress({ ...newAddress, street: text })
                    }
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="London"
                    placeholderTextColor={colors.textSecondary}
                    value={newAddress.city}
                    onChangeText={(text) =>
                      setNewAddress({ ...newAddress, city: text })
                    }
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Postcode</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="SW1A 1AA"
                    placeholderTextColor={colors.textSecondary}
                    value={newAddress.postcode}
                    onChangeText={(text) =>
                      setNewAddress({ ...newAddress, postcode: text })
                    }
                  />
                </View>

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={styles.formButtonSecondary}
                    onPress={() => {
                      setShowAddForm(false);
                      setNewAddress({ label: '', street: '', city: '', postcode: '' });
                    }}
                  >
                    <Text style={styles.formButtonSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formButtonPrimary}
                    onPress={handleSaveAddress}
                  >
                    <Text style={styles.formButtonPrimaryText}>Save Address</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalScroll: {
    padding: 16,
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#000000',
  },
  addressOptionSelected: {
    borderColor: '#000000',
    backgroundColor: colors.highlight,
  },
  addressOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  addressOptionText: {
    flex: 1,
  },
  addressOptionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  addressOptionAddress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    gap: 12,
  },
  addAddressText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  fillOptionsContainer: {
    paddingVertical: 8,
  },
  fillOptionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  fillOptionsSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  fillOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  fillOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  fillOptionText: {
    flex: 1,
  },
  fillOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  fillOptionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  formContainer: {
    paddingVertical: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  formButtonSecondary: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  formButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  formButtonPrimary: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  formButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
