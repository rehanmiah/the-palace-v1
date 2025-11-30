
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { restaurants, dishes } from '@/data/restaurants';
import { useCart } from '@/contexts/CartContext';

interface Address {
  id: string;
  label: string;
  address: string;
}

export default function MenuScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, updateQuantity, getCartItemCount, cart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDelivery, setIsDelivery] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address>({
    id: '1',
    label: 'Home',
    address: '123 Main Street, London, SW1A 1AA',
  });

  // Sample addresses - in a real app, these would come from user profile
  const [addresses] = useState<Address[]>([
    { id: '1', label: 'Home', address: '123 Main Street, London, SW1A 1AA' },
    { id: '2', label: 'Work', address: '456 Office Road, London, EC1A 1BB' },
    { id: '3', label: 'Other', address: '789 Park Avenue, London, W1A 1CC' },
  ]);

  const restaurant = restaurants.find((r) => r.id === id);
  const menuItems = dishes[id] || [];

  if (!restaurant) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Restaurant not found</Text>
      </View>
    );
  }

  // Get unique categories
  const categories = Array.from(new Set(menuItems.map((item) => item.category)));

  // Filter menu items by category
  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.category === selectedCategory)
    : menuItems;

  const handleAddToCart = (dish: any) => {
    if (!restaurant.isOpen) {
      Alert.alert('Restaurant Closed', 'This restaurant is currently closed.');
      return;
    }
    addToCart(dish, id);
    console.log('Added to cart:', dish.name);
  };

  const cartItemCount = getCartItemCount();

  // Get quantity for a specific dish
  const getDishQuantity = (dishId: string) => {
    const cartItem = cart.find((item) => item.dish.id === dishId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurant.name}</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <IconSymbol
            ios_icon_name="cart.fill"
            android_material_icon_name="shopping-cart"
            size={24}
            color="#FFFFFF"
          />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
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

        {/* Address Dropdown (only show for delivery) */}
        {isDelivery && (
          <TouchableOpacity
            style={styles.addressDropdown}
            onPress={() => setShowAddressModal(true)}
          >
            <View style={styles.addressContent}>
              <IconSymbol
                ios_icon_name="location.fill"
                android_material_icon_name="location-on"
                size={20}
                color={colors.text}
              />
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
                <Text style={styles.addressText} numberOfLines={1}>
                  {selectedAddress.address}
                </Text>
              </View>
            </View>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="keyboard-arrow-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {/* Restaurant Info */}
        <View style={styles.restaurantSection}>
          <Image
            source={{ uri: restaurant.image }}
            style={styles.restaurantImage}
          />
          <View style={styles.restaurantInfo}>
            <View style={styles.restaurantHeader}>
              {!restaurant.isOpen && (
                <View style={styles.closedBadge}>
                  <Text style={styles.closedText}>Closed</Text>
                </View>
              )}
            </View>
            <Text style={styles.restaurantDescription}>
              {restaurant.description}
            </Text>
            <View style={styles.restaurantMeta}>
              <View style={styles.metaItem}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={16}
                  color={colors.accent}
                />
                <Text style={styles.metaText}>{restaurant.rating}</Text>
              </View>
              <View style={styles.metaItem}>
                <IconSymbol
                  ios_icon_name="clock.fill"
                  android_material_icon_name="schedule"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={styles.metaText}>{restaurant.deliveryTime}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>
                  Min £{restaurant.minimumOrder}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategory && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  !selectedCategory && styles.categoryChipTextActive,
                ]}
              >
                Picked for you
              </Text>
            </TouchableOpacity>
            {categories.map((category, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category &&
                        styles.categoryChipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items - Uber Eats Style */}
        <View style={styles.menuSection}>
          {filteredItems.map((item, index) => {
            const quantity = getDishQuantity(item.id);
            return (
              <React.Fragment key={index}>
                <View style={styles.menuItem}>
                  <View style={styles.menuInfo}>
                    <View style={styles.menuHeader}>
                      <Text style={styles.menuName}>{item.name}</Text>
                    </View>
                    <Text style={styles.menuDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.menuFooter}>
                      <Text style={styles.menuPrice}>
                        £{item.price.toFixed(2)}
                      </Text>
                      <View style={styles.menuTags}>
                        {item.isVegetarian && (
                          <View style={styles.vegTag}>
                            <Text style={styles.vegTagText}>VEG</Text>
                          </View>
                        )}
                        {item.isSpicy && <Text style={styles.spicyIcon}>🌶️</Text>}
                      </View>
                      <View style={styles.ratingContainer}>
                        <IconSymbol
                          ios_icon_name="hand.thumbsup.fill"
                          android_material_icon_name="thumb-up"
                          size={14}
                          color={colors.text}
                        />
                        <Text style={styles.ratingText}>
                          {Math.floor(Math.random() * 10) + 85}% ({Math.floor(Math.random() * 100) + 20})
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.menuImageContainer}>
                    <Image source={{ uri: item.image }} style={styles.menuImage} />
                    {quantity === 0 ? (
                      <TouchableOpacity
                        style={styles.addButtonUber}
                        onPress={() => handleAddToCart(item)}
                      >
                        <Text style={styles.addButtonTextUber}>Add</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.quantityControlUber}>
                        <TouchableOpacity
                          style={styles.quantityButtonUber}
                          onPress={() => updateQuantity(item.id, quantity - 1)}
                        >
                          <IconSymbol
                            ios_icon_name="minus"
                            android_material_icon_name="remove"
                            size={16}
                            color="#FFFFFF"
                          />
                        </TouchableOpacity>
                        <Text style={styles.quantityTextUber}>{quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButtonUber}
                          onPress={() => handleAddToCart(item)}
                        >
                          <IconSymbol
                            ios_icon_name="plus"
                            android_material_icon_name="add"
                            size={16}
                            color="#FFFFFF"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>

      {/* Address Selection Modal */}
      <Modal
        visible={showAddressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {addresses.map((address, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.addressOption,
                      selectedAddress.id === address.id && styles.addressOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedAddress(address);
                      setShowAddressModal(false);
                    }}
                  >
                    <View style={styles.addressOptionContent}>
                      <IconSymbol
                        ios_icon_name="location.fill"
                        android_material_icon_name="location-on"
                        size={24}
                        color={selectedAddress.id === address.id ? colors.primary : colors.textSecondary}
                      />
                      <View style={styles.addressOptionText}>
                        <Text style={styles.addressOptionLabel}>{address.label}</Text>
                        <Text style={styles.addressOptionAddress}>{address.address}</Text>
                      </View>
                    </View>
                    {selectedAddress.id === address.id && (
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check-circle"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              ))}
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={() => {
                  setShowAddressModal(false);
                  Alert.alert('Add Address', 'This feature will allow you to add a new delivery address.');
                }}
              >
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add-circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.addAddressText}>Add New Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  toggleSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
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
  addressDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
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
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  restaurantSection: {
    backgroundColor: colors.card,
    marginBottom: 8,
  },
  restaurantImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.border,
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  closedBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  closedText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '600',
  },
  restaurantDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  restaurantMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categorySection: {
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  seeAllButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#808080',
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 0,
    marginBottom: 0,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuInfo: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'space-between',
  },
  menuHeader: {
    marginBottom: 6,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  menuFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  menuTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vegTag: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vegTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  spicyIcon: {
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  ratingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  menuImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  menuImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  addButtonUber: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  addButtonTextUber: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  quantityControlUber: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  quantityButtonUber: {
    width: 32,
    height: 32,
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityTextUber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 12,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  addressOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
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
    backgroundColor: colors.background,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addAddressText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});
