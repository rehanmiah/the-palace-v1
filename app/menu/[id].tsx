
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { restaurants } from '@/data/restaurants';
import { useCart } from '@/contexts/CartContext';
import { useSpiceLevel } from '@/hooks/useSpiceLevel';
import { useMenu } from '@/hooks/useMenu';
import { SpiceButton } from '@/components/SpiceButton';
import AddressModal from '@/components/AddressModal';

interface Address {
  id: string;
  label: string;
  address: string;
}

export default function MenuScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, updateQuantity, getCartItemCount, getItemQuantityInCart, cart } = useCart();
  const { menuItems, categories, isLoading } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

  const restaurant = restaurants.find((r) => r.id === id);

  if (!restaurant) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Restaurant not found</Text>
      </View>
    );
  }

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.category === selectedCategory)
    : menuItems;

  const handleAddToCart = (menuItem: any, spiceLevel?: number) => {
    if (!restaurant.isOpen) {
      Alert.alert('Restaurant Closed', 'This restaurant is currently closed.');
      return;
    }
    
    // Convert menu item to Dish format for cart
    const dish = {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description || '',
      price: menuItem.price,
      category: menuItem.category || '',
      image: menuItem.image_id || '',
      isVegetarian: menuItem.is_vegetarian || false,
      isSpicy: menuItem.spicy || false,
      isPopular: menuItem.is_popular || false,
    };
    
    addToCart(dish, id, spiceLevel);
    console.log('Added to cart:', dish.name, 'with spice level:', spiceLevel);
  };

  const cartItemCount = getCartItemCount();

  const handleAddAddress = (address: Address) => {
    setAddresses([...addresses, address]);
    setSelectedAddress(address);
  };

  const getPostcode = (address: string) => {
    const parts = address.split(',').map(part => part.trim());
    return parts[parts.length - 1] || '';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

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

      {/* Sticky Delivery/Collection Header */}
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
              color={colors.text}
            />
            <View style={styles.addressTextContainer}>
              {isDelivery ? (
                <Text style={styles.addressLabel}>
                  {selectedAddress.label} - {getPostcode(selectedAddress.address)}
                </Text>
              ) : (
                <Text style={styles.addressLabel}>
                  {collectionName || 'Person collecting'}
                </Text>
              )}
            </View>
          </View>
          <IconSymbol
            ios_icon_name="chevron.down"
            android_material_icon_name="keyboard-arrow-down"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Info */}
        <View style={styles.restaurantSection}>
          <Image
            source={restaurant.image}
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
            <Text style={styles.restaurantAddress}>{restaurant.address}</Text>
            <View style={styles.restaurantMeta}>
              <TouchableOpacity 
                style={styles.metaItem}
                onPress={() => router.push('/reviews')}
              >
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={16}
                  color={colors.accent}
                />
                <Text style={styles.metaText}>{restaurant.rating}</Text>
              </TouchableOpacity>
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

        {/* Category Filter - From Database */}
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
                All Items
              </Text>
            </TouchableOpacity>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.name && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category.name &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items - Uber Eats Style */}
        <View style={styles.menuSection}>
          {filteredItems.map((item, index) => (
            <MenuItemRow
              key={index}
              item={item}
              onAdd={handleAddToCart}
              onUpdateQuantity={updateQuantity}
              getItemQuantityInCart={getItemQuantityInCart}
            />
          ))}
        </View>
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
    </View>
  );
}

function MenuItemRow({ item, onAdd, onUpdateQuantity, getItemQuantityInCart }: any) {
  const { spiceLevel, cycleSpiceLevel } = useSpiceLevel(item.id);

  // Get quantity for this specific item with this specific spice level
  const quantity = getItemQuantityInCart(item.id, spiceLevel);

  const handleAddToCart = () => {
    console.log('Adding to cart with spice level:', spiceLevel);
    onAdd(item, spiceLevel);
  };

  const handleSpiceClick = () => {
    console.log('Spice button clicked for:', item.name, 'Current level:', spiceLevel);
    cycleSpiceLevel();
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    onUpdateQuantity(item.id, newQuantity, spiceLevel);
  };

  const renderChilies = (count: number) => {
    if (count === 0) return null;
    
    const chilies = [];
    for (let i = 0; i < count; i++) {
      chilies.push(
        <Text key={i} style={styles.chilliEmoji}>🌶️</Text>
      );
    }
    
    return (
      <View style={styles.spiceLevelContainer}>
        {chilies}
      </View>
    );
  };

  console.log('MenuItemRow render - Item:', item.name, 'Spice Level:', spiceLevel, 'Quantity:', quantity);

  return (
    <View style={styles.menuItem}>
      <View style={styles.menuInfo}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuName}>{item.name}</Text>
          {/* Display spice emojis under the item name */}
          {spiceLevel > 0 && renderChilies(spiceLevel)}
        </View>
        <Text style={styles.menuDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.menuFooter}>
          <Text style={styles.menuPrice}>
            £{item.price.toFixed(2)}
          </Text>
          <View style={styles.menuTags}>
            {item.is_vegetarian && (
              <View style={styles.vegTag}>
                <Text style={styles.vegTagText}>VEG</Text>
              </View>
            )}
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
      
      <Image source={{ uri: item.image_id || '' }} style={styles.menuImage} />
      
      {/* Spice Button - Show for all items so users can add spiciness */}
      <TouchableOpacity
        style={styles.spiceButton}
        onPress={handleSpiceClick}
        activeOpacity={0.8}
      >
        <View style={styles.spiceButtonContent}>
          <Text style={styles.spiceEmoji}>🌶️</Text>
          {spiceLevel > 0 && (
            <View style={[
              styles.spiceBadge,
              Platform.OS === 'ios' && styles.spiceBadgeIOS
            ]}>
              <Text style={styles.spiceBadgeText}>{spiceLevel}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Show Add button if no items with this spice level in cart */}
      {/* Show quantity controls if items with this spice level exist in cart */}
      {quantity === 0 ? (
        <TouchableOpacity
          style={styles.addButtonUber}
          onPress={handleAddToCart}
        >
          <Text style={styles.addButtonTextUber}>Add</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.quantityControlUber}>
          <TouchableOpacity
            style={styles.quantityButtonUber}
            onPress={() => handleUpdateQuantity(quantity - 1)}
          >
            <IconSymbol
              ios_icon_name={quantity === 1 ? "trash.fill" : "minus"}
              android_material_icon_name={quantity === 1 ? "delete" : "remove"}
              size={16}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <Text style={styles.quantityTextUber}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButtonUber}
            onPress={handleAddToCart}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 48,
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
    backgroundColor: colors.green,
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
  stickyHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 4,
    zIndex: 100,
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  restaurantAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
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
    color: colors.text,
    fontWeight: '600',
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
    color: colors.primary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 0,
    marginBottom: 24,
    padding: 0,
    boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.12)',
    elevation: 6,
    position: 'relative',
  },
  menuInfo: {
    flex: 1,
    padding: 0,
    paddingLeft: 16,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  menuHeader: {
    marginBottom: 6,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
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
  spiceLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  chilliEmoji: {
    fontSize: 16,
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
  menuImage: {
    width: 120,
    height: 120,
    borderRadius: 0,
    backgroundColor: colors.border,
  },
  spiceButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 6,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 4,
    zIndex: 10,
  },
  spiceButtonContent: {
    position: 'relative',
  },
  spiceEmoji: {
    fontSize: 20,
  },
  spiceBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#C41E3A',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: Platform.OS === 'ios' ? 1.5 : 0,
    borderColor: Platform.OS === 'ios' ? '#C41E3A' : 'transparent',
  },
  spiceBadgeIOS: {
    shadowColor: '#C41E3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 4,
  },
  spiceBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  addButtonUber: {
    position: 'absolute',
    bottom: 24,
    right: 24,
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
    bottom: 24,
    right: 24,
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
    backgroundColor: '#000000',
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
});
