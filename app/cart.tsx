
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { restaurants } from '@/data/restaurants';
import AddressModal from '@/components/AddressModal';
import { supabase } from '@/app/integrations/supabase/client';
import { Stack } from 'expo-router';

interface Address {
  id: string;
  label: string;
  address: string;
}

type PaymentMethodType = 'card' | 'cash';

export default function CartScreen() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    currentRestaurantId,
  } = useCart();
  const { user, paymentMethods } = useAuth();

  const [isDelivery, setIsDelivery] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('card');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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

  const restaurant = currentRestaurantId
    ? restaurants.find((r) => r.id === currentRestaurantId)
    : null;

  // Calculate pricing
  const subtotal = getCartTotal();
  
  // Delivery fee logic: £2.99 if under £15, otherwise free
  const deliveryFee = isDelivery && subtotal < 15 ? 2.99 : 0;
  
  // 10% discount on collection orders above £15
  const collectionDiscount = !isDelivery && subtotal > 15 ? subtotal * 0.1 : 0;
  
  const total = subtotal + deliveryFee - collectionDiscount;

  // Check if phone number is provided
  useEffect(() => {
    if (!phoneNumber && user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user]);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart first.');
      return;
    }

    // Validate phone number
    if (!phoneNumber || phoneNumber.trim() === '') {
      setShowPhoneInput(true);
      Alert.alert('Phone Number Required', 'Please provide your phone number to continue.');
      return;
    }

    // Validate collection name
    if (!isDelivery && (!collectionName || collectionName.trim() === '')) {
      Alert.alert('Collection Name Required', 'Please provide the name of the person collecting.');
      return;
    }

    try {
      // Create order in database with spice levels
      const orderData = {
        user_id: user?.id || null,
        order_type: isDelivery ? 'delivery' : 'collection',
        status: 'pending',
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        discount: collectionDiscount,
        total: total,
        payment_type: selectedPaymentMethod,
        delivery_address_text: isDelivery ? selectedAddress.address : null,
        contact_phone: phoneNumber,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        Alert.alert('Error', 'Failed to place order. Please try again.');
        return;
      }

      // Create order items with spice levels (stored only at checkout)
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: null, // We don't have UUID menu_item_id
        menu_item_name: item.dish.name,
        menu_item_price: item.dish.price,
        quantity: item.quantity,
        subtotal: item.dish.price * item.quantity,
        spice_level: item.spiceLevel || 0, // Store spice level here at checkout
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        Alert.alert('Error', 'Failed to save order items. Please try again.');
        return;
      }

      const orderType = isDelivery ? 'delivery' : 'collection';
      const paymentMethodText = selectedPaymentMethod === 'cash' 
        ? `Cash on ${isDelivery ? 'Delivery' : 'Collection'}` 
        : 'Card Payment';

      Alert.alert(
        'Order Placed!',
        `Your ${orderType} order has been placed successfully.\n\nPayment: ${paymentMethodText}\nTotal: £${total.toFixed(2)}\n\nYou will receive a confirmation shortly.`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              router.push('/(tabs)/(home)/');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error during checkout:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to clear your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  const handleAddAddress = (address: Address) => {
    setAddresses([...addresses, address]);
    setSelectedAddress(address);
  };

  const getPostcode = (address: string) => {
    const parts = address.split(',').map(part => part.trim());
    return parts[parts.length - 1] || '';
  };

  const renderChillies = (count: number) => {
    if (count === 0) return null;
    
    const chilies = [];
    for (let i = 0; i < count; i++) {
      chilies.push(
        <Text key={i} style={styles.chilliEmoji}>🌶️</Text>
      );
    }
    
    return chilies;
  };

  const getSpiceLevelLabel = (level: number): string => {
    switch (level) {
      case 1:
        return '(HOT)';
      case 2:
        return '(Xtra HOT)';
      case 3:
        return '(Xtra Xtra HOT)';
      default:
        return '';
    }
  };

  if (cart.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        
        {/* Fixed White Header */}
        <View style={styles.fixedHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color="#000000"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout/Cart</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="cart"
            android_material_icon_name="shopping-cart"
            size={80}
            color={colors.border}
          />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Add items from the menu to get started
          </Text>
          <TouchableOpacity
            style={[buttonStyles.primary, styles.browseButton]}
            onPress={() => router.push('/(tabs)/(home)/')}
          >
            <Text style={buttonStyles.text}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Fixed White Header */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color="#000000"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout/Cart</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery/Collection Toggle */}
        <View style={styles.toggleSection}>
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
        </View>

        {/* Delivery Address or Collection Name */}
        {isDelivery ? (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoTitle}>Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(true)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            {restaurant && (
              <Text style={styles.deliveryTime}>Delivery: {restaurant.deliveryTime}</Text>
            )}
            <View style={styles.addressDisplay}>
              <IconSymbol
                ios_icon_name="location.fill"
                android_material_icon_name="location-on"
                size={20}
                color={colors.primary}
              />
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
                <Text style={styles.addressText}>{selectedAddress.address}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Collection Details</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Person collecting</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name"
                placeholderTextColor={colors.textSecondary}
                value={collectionName}
                onChangeText={setCollectionName}
              />
            </View>
          </View>
        )}

        {/* Phone Number */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>Contact Number</Text>
            {!showPhoneInput && phoneNumber && (
              <TouchableOpacity onPress={() => setShowPhoneInput(true)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          {showPhoneInput || !phoneNumber ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textSecondary}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoFocus={showPhoneInput}
              />
              {showPhoneInput && (
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setShowPhoneInput(false)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.phoneDisplay}>
              <IconSymbol
                ios_icon_name="phone.fill"
                android_material_icon_name="phone"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.phoneText}>{phoneNumber}</Text>
            </View>
          )}
        </View>

        {/* Cart Items with Images - Each spice level shown separately */}
        <View style={styles.cartItemsCard}>
          <Text style={styles.cartItemsTitle}>Your Order</Text>
          {cart.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              <Image 
                source={{ uri: item.dish.image || '' }} 
                style={styles.cartItemImage}
              />
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item.dish.name}</Text>
                {item.spiceLevel && item.spiceLevel > 0 && (
                  <View style={styles.spiceLevelIndicator}>
                    {renderChillies(item.spiceLevel)}
                  </View>
                )}
                <Text style={styles.cartItemPrice}>
                  £{item.dish.price.toFixed(2)}
                </Text>
              </View>
              <View style={styles.cartItemControls}>
                <View style={styles.quantityControlCart}>
                  <TouchableOpacity
                    style={styles.quantityButtonCart}
                    onPress={() => updateQuantity(item.dish.id, item.quantity - 1, item.spiceLevel)}
                  >
                    <IconSymbol
                      ios_icon_name={item.quantity === 1 ? "trash.fill" : "minus"}
                      android_material_icon_name={item.quantity === 1 ? "delete" : "remove"}
                      size={16}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                  <Text style={styles.quantityTextCart}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButtonCart}
                    onPress={() => updateQuantity(item.dish.id, item.quantity + 1, item.spiceLevel)}
                  >
                    <IconSymbol
                      ios_icon_name="plus"
                      android_material_icon_name="add"
                      size={16}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cartItemTotal}>
                  £{(item.dish.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary - Receipt View with Item Breakdown */}
        <View style={styles.receiptCard}>
          <Text style={styles.receiptTitle}>━━━ Order Summary ━━━</Text>
          <View style={styles.receiptDivider} />

          {/* Receipt-style item breakdown */}
          <View style={styles.receiptItemsSection}>
            {cart.map((item, index) => (
              <View key={index} style={styles.receiptItemRow}>
                <View style={styles.receiptItemLeft}>
                  <Text style={styles.receiptItemQuantity}>{item.quantity}x</Text>
                  <View style={styles.receiptItemDetails}>
                    <Text style={styles.receiptItemName}>{item.dish.name}</Text>
                    {item.spiceLevel && item.spiceLevel > 0 && (
                      <Text style={styles.receiptItemSpice}>
                        {getSpiceLevelLabel(item.spiceLevel)}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={styles.receiptItemPrice}>
                  £{(item.dish.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.receiptDivider} />

          {/* Subtotal */}
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Subtotal</Text>
            <Text style={styles.receiptValue}>£{subtotal.toFixed(2)}</Text>
          </View>

          {/* Delivery Fee */}
          {isDelivery && (
            <View style={styles.receiptRow}>
              <View style={styles.receiptLabelContainer}>
                <Text style={styles.receiptLabel}>Delivery Fee</Text>
                {subtotal >= 15 && (
                  <Text style={styles.freeText}>(Free over £15)</Text>
                )}
              </View>
              <Text style={styles.receiptValue}>
                {deliveryFee > 0 ? `£${deliveryFee.toFixed(2)}` : 'FREE'}
              </Text>
            </View>
          )}

          {/* Collection Discount */}
          {!isDelivery && collectionDiscount > 0 && (
            <View style={styles.receiptRow}>
              <View style={styles.receiptLabelContainer}>
                <Text style={styles.receiptLabel}>Collection Discount</Text>
                <Text style={styles.discountText}>(10% off over £15)</Text>
              </View>
              <Text style={styles.discountValue}>-£{collectionDiscount.toFixed(2)}</Text>
            </View>
          )}

          {/* No delivery fee for collection */}
          {!isDelivery && (
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Delivery Fee</Text>
              <Text style={styles.freeValue}>FREE</Text>
            </View>
          )}

          <View style={styles.receiptDividerBold} />

          {/* Total */}
          <View style={styles.receiptRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>£{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Payment Method</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPaymentMethod === 'card' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPaymentMethod('card')}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[
                styles.radioButton,
                selectedPaymentMethod === 'card' && styles.radioButtonSelected,
              ]}>
                {selectedPaymentMethod === 'card' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <IconSymbol
                ios_icon_name="creditcard.fill"
                android_material_icon_name="credit-card"
                size={24}
                color={colors.text}
              />
              <View>
                <Text style={styles.paymentOptionTitle}>Card Payment</Text>
                {paymentMethods.length > 0 && (
                  <Text style={styles.paymentOptionSubtitle}>
                    {paymentMethods[0].brand} •••• {paymentMethods[0].last4}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPaymentMethod === 'cash' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPaymentMethod('cash')}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[
                styles.radioButton,
                selectedPaymentMethod === 'cash' && styles.radioButtonSelected,
              ]}>
                {selectedPaymentMethod === 'cash' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <IconSymbol
                ios_icon_name="banknote.fill"
                android_material_icon_name="payments"
                size={24}
                color={colors.text}
              />
              <View>
                <Text style={styles.paymentOptionTitle}>
                  Cash on {isDelivery ? 'Delivery' : 'Collection'}
                </Text>
                <Text style={styles.paymentOptionSubtitle}>
                  Pay when you receive your order
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Messages */}
        {isDelivery && subtotal < 15 && (
          <View style={styles.infoMessage}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={20}
              color={colors.secondary}
            />
            <Text style={styles.infoMessageText}>
              £2.99 delivery fee applies for orders under £15
            </Text>
          </View>
        )}

        {!isDelivery && subtotal > 15 && (
          <View style={styles.successMessage}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={20}
              color="#4CAF50"
            />
            <Text style={styles.successMessageText}>
              10% collection discount applied!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity
          style={[buttonStyles.primary, styles.checkoutButton]}
          onPress={handleCheckout}
        >
          <Text style={buttonStyles.text}>
            Place Order • £{total.toFixed(2)}
          </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fixedHeader: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 4,
    zIndex: 1000,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  toggleSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
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
    color: colors.text,
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  deliveryTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  addressDisplay: {
    flexDirection: 'row',
    gap: 12,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  inputContainer: {
    marginTop: 8,
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
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  doneButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  phoneText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  cartItemsCard: {
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  cartItemsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  spiceLevelIndicator: {
    flexDirection: 'row',
    marginVertical: 4,
    gap: 2,
  },
  chilliEmoji: {
    fontSize: 14,
  },
  cartItemPrice: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  cartItemControls: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  quantityControlCart: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  quantityButtonCart: {
    width: 28,
    height: 28,
    backgroundColor: '#000000',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityTextCart: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 10,
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  receiptCard: {
    backgroundColor: colors.card,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
    borderStyle: 'dashed',
  },
  receiptDividerBold: {
    height: 2,
    backgroundColor: colors.text,
    marginVertical: 12,
  },
  receiptItemsSection: {
    marginBottom: 8,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  receiptItemLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  receiptItemQuantity: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginRight: 10,
    minWidth: 28,
    fontFamily: 'monospace',
  },
  receiptItemDetails: {
    flex: 1,
  },
  receiptItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 20,
  },
  receiptItemSpice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C41E3A',
    marginTop: 3,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  receiptItemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'monospace',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptLabelContainer: {
    flex: 1,
  },
  receiptLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  receiptValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'monospace',
  },
  freeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 2,
  },
  freeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4CAF50',
    fontFamily: 'monospace',
  },
  discountText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  discountValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 12,
    backgroundColor: colors.background,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  paymentOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  paymentOptionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },
  infoMessageText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },
  successMessageText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkoutButton: {
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  browseButton: {
    width: '100%',
    maxWidth: 300,
  },
});
