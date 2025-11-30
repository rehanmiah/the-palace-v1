
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
  isDelivery: boolean;
  collectionName?: string;
  onCollectionNameChange?: (name: string) => void;
}

export default function AddressModal({
  visible,
  onClose,
  addresses,
  selectedAddress,
  onSelectAddress,
  onAddAddress,
  isDelivery,
  collectionName = '',
  onCollectionNameChange,
}: AddressModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFillOptions, setShowFillOptions] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
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
      id: editingAddress ? editingAddress.id : Date.now().toString(),
      label: newAddress.label,
      address: fullAddress,
    };

    if (editingAddress) {
      // Update existing address
      console.log('Updating address:', address);
      // Note: You'll need to implement the update logic in the parent component
    } else {
      onAddAddress(address);
    }
    
    setShowAddForm(false);
    setEditingAddress(null);
    setNewAddress({ label: '', street: '', city: '', postcode: '' });
    onClose();
  };

  const handleEditAddress = (address: Address) => {
    console.log('Editing address:', address);
    const parts = address.address.split(',').map(part => part.trim());
    const postcode = parts[parts.length - 1] || '';
    const city = parts[parts.length - 2] || '';
    const street = parts.slice(0, -2).join(', ') || '';

    setEditingAddress(address);
    setNewAddress({
      label: address.label,
      street: street,
      city: city,
      postcode: postcode,
    });
    setShowAddForm(true);
  };

  const handleAddNewAddress = () => {
    setShowFillOptions(true);
  };

  const handleCloseAll = () => {
    setShowAddForm(false);
    setShowFillOptions(false);
    setEditingAddress(null);
    onClose();
  };

  // Extract postcode from address
  const getPostcode = (address: string) => {
    const parts = address.split(',').map(part => part.trim());
    return parts[parts.length - 1] || '';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCloseAll}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={handleCloseAll}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
          style={styles.modalContentWrapper}
        >
          <View style={styles.modalContent}>
            {!showAddForm && !showFillOptions && (
              <ScrollView 
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                {isDelivery ? (
                  <React.Fragment>
                    {addresses.map((address, index) => (
                      <View key={index} style={styles.addressOptionContainer}>
                        <TouchableOpacity
                          style={styles.addressOption}
                          onPress={() => {
                            onSelectAddress(address);
                            onClose();
                          }}
                        >
                          <Text style={styles.addressOptionLabel}>
                            <Text style={styles.addressOptionLabelBold}>{address.label}</Text>
                            <Text style={styles.addressOptionPostcode}> - {getPostcode(address.address)}</Text>
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleEditAddress(address)}
                        >
                          <IconSymbol
                            ios_icon_name="pencil"
                            android_material_icon_name="edit"
                            size={16}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity
                      style={styles.addressOptionSingle}
                      onPress={handleAddNewAddress}
                    >
                      <Text style={styles.addressOptionLabel}>
                        <Text style={styles.addressOptionLabelBold}>Add New Address</Text>
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ) : (
                  <View style={styles.collectionContainer}>
                    <Text style={styles.collectionLabel}>Person collecting</Text>
                    <TextInput
                      style={styles.collectionInput}
                      placeholder="Enter name"
                      placeholderTextColor={colors.textSecondary}
                      value={collectionName}
                      onChangeText={onCollectionNameChange}
                      autoFocus
                    />
                    <TouchableOpacity
                      style={styles.collectionButton}
                      onPress={onClose}
                    >
                      <Text style={styles.collectionButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}

            {showFillOptions && (
              <View style={styles.fillOptionsContainer}>
                <Text style={styles.fillOptionsTitle}>Fill Home Address</Text>

                <TouchableOpacity
                  style={styles.fillOptionButton}
                  onPress={handleFillFromDevice}
                >
                  <Text style={styles.fillOptionTitle}>
                    {Platform.OS === 'ios' ? 'Fill from My Card' : 'Fill from My Profile'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fillOptionButton}
                  onPress={handleManualEntry}
                >
                  <Text style={styles.fillOptionTitle}>Enter Manually</Text>
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
                <Text style={styles.formTitle}>
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </Text>
                
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
                      setEditingAddress(null);
                      setNewAddress({ label: '', street: '', city: '', postcode: '' });
                    }}
                  >
                    <Text style={styles.formButtonSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formButtonPrimary}
                    onPress={handleSaveAddress}
                  >
                    <Text style={styles.formButtonPrimaryText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentWrapper: {
    width: '75%',
    maxWidth: 280,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    maxHeight: 180,
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
    elevation: 8,
    overflow: 'hidden',
  },
  modalScroll: {
    maxHeight: 180,
  },
  addressOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  addressOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  addressOptionSingle: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  addressOptionLabel: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 18,
  },
  addressOptionLabelBold: {
    fontWeight: '700',
    color: '#000000',
  },
  addressOptionPostcode: {
    fontWeight: '400',
    color: '#000000',
  },
  editButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionContainer: {
    padding: 16,
  },
  collectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 10,
  },
  collectionInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#000000',
    marginBottom: 12,
  },
  collectionButton: {
    backgroundColor: '#000000',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  collectionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fillOptionsContainer: {
    padding: 20,
  },
  fillOptionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  fillOptionButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  fillOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#000000',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  formButtonSecondary: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  formButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  formButtonPrimary: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  formButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
