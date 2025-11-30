
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function PaymentMethodsScreen() {
  const { paymentMethods, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod, isLoading } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  const handleAddPayment = async () => {
    if (!cardNumber || !holderName || !expiryMonth || !expiryYear || !cvv) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (cardNumber.length < 16) {
      Alert.alert('Error', 'Invalid card number');
      return;
    }

    try {
      await addPaymentMethod({
        type: 'card',
        last4: cardNumber.slice(-4),
        brand: 'Visa',
        expiryMonth,
        expiryYear,
        holderName,
        isDefault: paymentMethods.length === 0,
      });

      Alert.alert('Success', 'Payment method added successfully!');
      setShowAddModal(false);
      setCardNumber('');
      setHolderName('');
      setExpiryMonth('');
      setExpiryYear('');
      setCvv('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add payment method');
    }
  };

  const handleRemovePayment = (id: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removePaymentMethod(id);
              Alert.alert('Success', 'Payment method removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove payment method');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
      Alert.alert('Success', 'Default payment method updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update default payment method');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="creditcard.fill"
              android_material_icon_name="credit-card"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>No payment methods added</Text>
            <Text style={styles.emptySubtext}>Add a payment method to make checkout faster</Text>
          </View>
        ) : (
          <View style={styles.methodsList}>
            {paymentMethods.map((method, index) => (
              <React.Fragment key={index}>
                <View style={styles.methodCard}>
                  <View style={styles.methodHeader}>
                    <View style={styles.methodInfo}>
                      <IconSymbol
                        ios_icon_name="creditcard.fill"
                        android_material_icon_name="credit-card"
                        size={32}
                        color={colors.primary}
                      />
                      <View style={styles.methodDetails}>
                        <Text style={styles.methodBrand}>{method.brand}</Text>
                        <Text style={styles.methodNumber}>•••• {method.last4}</Text>
                        <Text style={styles.methodExpiry}>
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </Text>
                      </View>
                    </View>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.methodActions}>
                    {!method.isDefault && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(method.id)}
                      >
                        <Text style={styles.actionButtonText}>Set as Default</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.actionButton, styles.removeButton]}
                      onPress={() => handleRemovePayment(method.id)}
                    >
                      <Text style={[styles.actionButtonText, styles.removeButtonText]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <IconSymbol
          ios_icon_name="plus.circle.fill"
          android_material_icon_name="add-circle"
          size={24}
          color={colors.card}
        />
        <Text style={styles.addButtonText}>Add Payment Method</Text>
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Payment Method</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="cancel"
                size={28}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Card Number</Text>
              <View style={styles.inputWrapper}>
                <IconSymbol
                  ios_icon_name="creditcard.fill"
                  android_material_icon_name="credit-card"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.textSecondary}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="number-pad"
                  maxLength={16}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cardholder Name</Text>
              <View style={styles.inputWrapper}>
                <IconSymbol
                  ios_icon_name="person.fill"
                  android_material_icon_name="person"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textSecondary}
                  value={holderName}
                  onChangeText={setHolderName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.flex1]}>
                <Text style={styles.label}>Expiry Month</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="MM"
                    placeholderTextColor={colors.textSecondary}
                    value={expiryMonth}
                    onChangeText={setExpiryMonth}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              </View>

              <View style={[styles.inputContainer, styles.flex1]}>
                <Text style={styles.label}>Expiry Year</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="YY"
                    placeholderTextColor={colors.textSecondary}
                    value={expiryYear}
                    onChangeText={setExpiryYear}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              </View>

              <View style={[styles.inputContainer, styles.flex1]}>
                <Text style={styles.label}>CVV</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor={colors.textSecondary}
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="number-pad"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleAddPayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.saveButtonText}>Add Card</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  methodsList: {
    gap: 16,
  },
  methodCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  methodInfo: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
  },
  methodDetails: {
    flex: 1,
  },
  methodBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  methodNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  methodExpiry: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  defaultBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  methodActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  removeButton: {
    backgroundColor: colors.error + '20',
  },
  removeButtonText: {
    color: colors.error,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    boxShadow: '0px 4px 12px rgba(255, 127, 80, 0.4)',
    elevation: 6,
  },
  addButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    boxShadow: '0px 4px 8px rgba(255, 127, 80, 0.3)',
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});
