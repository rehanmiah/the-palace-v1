
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { restaurants } from '@/data/restaurants';
import { useCart } from '@/contexts/CartContext';
import { useMenu } from '@/hooks/useMenu';
import { useSpiceLevel } from '@/hooks/useSpiceLevel';
import { SpiceButton } from '@/components/SpiceButton';
import AddressModal from '@/components/AddressModal';

const { width } = Dimensions.get('window');

interface Address {
  id: string;
  label: string;
  address: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { addToCart, updateQuantity, cart, getCartItemCount } = useCart();
  const { menuItems, categories, isLoading, getPopularItems } = useMenu();
  const [searchQuery, setSearchQuery] = useState('');
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

  // Get The Palace restaurant (only one)
  const restaurant = restaurants[0];

  // Get popular dishes from database
  const popularDishes = getPopularItems();

  // Filter items based on search and category
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  const getDishQuantity = (dishId: string) => {
    const cartItem = cart.find((item) => item.dish.id === dishId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (menuItem: any, spiceLevel?: number) => {
    console.log('Adding to cart from home:', menuItem.name, 'spice level:', spiceLevel);
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
    addToCart(dish, restaurant.id, spiceLevel);
  };

  const handleCategorySelect = (category: string | null) => {
    if (category === 'All Items') {
      // Navigate to menu page for "All Items"
      router.push({
        pathname: '/menu/[id]',
        params: { id: restaurant.id },
      });
    } else {
      // Stay on home page and filter
      setSelectedCategory(category);
    }
  };

  const handleAddAddress = (address: Address) => {
    setAddresses([...addresses, address]);
    setSelectedAddress(address);
  };

  const cartItemCount = getCartItemCount();

  // Extract postcode from address
  const getPostcode = (address: string) => {
    const parts = address.split(',').map(part => part.trim());
    return parts[parts.length - 1] || '';
  };

  // Render chili emojis based on spice level
  const renderChilies = (count: number) => {
    if (count === 0) return null;
    return (
      <Text style={styles.spiceLevelEmojis}>
        {'🌶️'.repeat(count)}
      </Text>
    );
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>{restaurant.name}</Text>
            <TouchableOpacity
              style={styles.searchIconButton}
              onPress={() => {}}
            >
              <IconSymbol
                ios_icon_name="magnifyingglass"
                android_material_icon_name="search"
                size={24}
                color={colors.secondary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Founder, Martin Lewis. Editor-In-Chief, Marcus Herbert</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity style={styles.tabNavItem}>
            <Text style={[styles.tabNavText, styles.tabNavTextActive]}>Latest</Text>
            <View style={styles.tabNavIndicator} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabNavItem}>
            <Text style={styles.tabNavText}>Weekly Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabNavItem}>
            <Text style={styles.tabNavText}>Cards & Loans</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabNavItem}>
            <Text style={styles.tabNavText}>Household</Text>
          </TouchableOpacity>
        </View>

        {/* Subtitle Banner */}
        <View style={styles.subtitleBanner}>
          <Text style={styles.subtitleText}>Plus Avios warning & lots more</Text>
        </View>

        {/* Email Signup Card */}
        <View style={styles.emailCard}>
          <Text style={styles.emailCardText}>Want the famous Money Tips email?</Text>
        </View>

        {/* Popular Dishes Section */}
        {popularDishes.length > 0 && (
          <View style={styles.section}>
            {popularDishes.map((dish, index) => {
              const quantity = getDishQuantity(dish.id);
              return (
                <PopularDishCard
                  key={index}
                  dish={dish}
                  quantity={quantity}
                  onAdd={handleAddToCart}
                  onUpdateQuantity={updateQuantity}
                />
              );
            })}
          </View>
        )}

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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol
            ios_icon_name="magnifyingglass"
            android_material_icon_name="search"
            size={20}
            color={colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
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
            <TouchableOpacity
              style={styles.categoryChip}
              onPress={() => handleCategorySelect('All Items')}
            >
              <Text style={styles.categoryChipText}>
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
                onPress={() => handleCategorySelect(category.name)}
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

        {/* Filtered Results */}
        {(searchQuery || selectedCategory) && (
          <View style={styles.section}>
            {filteredItems.map((item, index) => {
              const quantity = getDishQuantity(item.id);
              return (
                <MenuItemRow
                  key={index}
                  item={item}
                  quantity={quantity}
                  onAdd={handleAddToCart}
                  onUpdateQuantity={updateQuantity}
                />
              );
            })}
          </View>
        )}

        {/* View Full Menu Button */}
        {!searchQuery && !selectedCategory && (
          <View style={styles.menuButtonContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() =>
                router.push({
                  pathname: '/menu/[id]',
                  params: { id: restaurant.id },
                })
              }
            >
              <Text style={styles.menuButtonText}>View Full Menu</Text>
              <IconSymbol
                ios_icon_name="arrow.right"
                android_material_icon_name="arrow-forward"
                size={20}
                color={colors.card}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Cart Button */}
        {cartItemCount > 0 && (
          <TouchableOpacity
            style={styles.cartFloatingButton}
            onPress={() => router.push('/cart')}
          >
            <IconSymbol
              ios_icon_name="cart.fill"
              android_material_icon_name="shopping-cart"
              size={24}
              color={colors.card}
            />
            <Text style={styles.cartFloatingText}>View Cart ({cartItemCount})</Text>
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
    </View>
  );
}

// Popular Dish Card Component
function PopularDishCard({ dish, quantity, onAdd, onUpdateQuantity }: any) {
  const { spiceLevel } = useSpiceLevel(dish.id);

  const handleAddToCart = () => {
    onAdd(dish, dish.spicy ? spiceLevel : undefined);
  };

  const renderChilies = (count: number) => {
    if (count === 0) return null;
    return (
      <Text style={styles.spiceLevelEmojis}>
        {'🌶️'.repeat(count)}
      </Text>
    );
  };

  return (
    <View style={styles.dishCard}>
      <View style={styles.dishImageContainer}>
        <Image source={{ uri: dish.image_id || '' }} style={styles.dishImage} />
        {dish.spicy && (
          <SpiceButton menuItemId={dish.id} />
        )}
      </View>
      <View style={styles.dishInfo}>
        <Text style={styles.dishName}>{dish.name}</Text>
        <Text style={styles.dishDescription} numberOfLines={2}>
          {dish.description}
        </Text>
        <View style={styles.dishFooter}>
          <View style={styles.priceRow}>
            <Text style={styles.dishPrice}>£{dish.price.toFixed(2)}</Text>
            {spiceLevel > 0 && renderChilies(spiceLevel)}
          </View>
          {quantity === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => onUpdateQuantity(dish.id, quantity - 1)}
              >
                <IconSymbol
                  ios_icon_name={quantity === 1 ? "trash.fill" : "minus"}
                  android_material_icon_name={quantity === 1 ? "delete" : "remove"}
                  size={16}
                  color={colors.card}
                />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleAddToCart}
              >
                <IconSymbol
                  ios_icon_name="plus"
                  android_material_icon_name="add"
                  size={16}
                  color={colors.card}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.dishTags}>
          {dish.is_vegetarian && (
            <View style={styles.vegTag}>
              <Text style={styles.vegTagText}>VEG</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// Menu Item Row Component
function MenuItemRow({ item, quantity, onAdd, onUpdateQuantity }: any) {
  const { spiceLevel } = useSpiceLevel(item.id);

  const handleAddToCart = () => {
    onAdd(item, item.spicy ? spiceLevel : undefined);
  };

  const renderChilies = (count: number) => {
    if (count === 0) return null;
    return (
      <Text style={styles.spiceLevelEmojis}>
        {'🌶️'.repeat(count)}
      </Text>
    );
  };

  return (
    <View style={styles.menuItem}>
      <View style={styles.menuInfo}>
        <Text style={styles.menuName}>{item.name}</Text>
        <Text style={styles.menuDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.menuFooter}>
          <Text style={styles.menuPrice}>£{item.price.toFixed(2)}</Text>
          {spiceLevel > 0 && renderChilies(spiceLevel)}
        </View>
      </View>
      <View style={styles.menuImageContainer}>
        <Image source={{ uri: item.image_id || '' }} style={styles.menuImage} />
        {item.spicy && (
          <SpiceButton menuItemId={item.id} />
        )}
        {quantity === 0 ? (
          <TouchableOpacity
            style={styles.addButtonSmall}
            onPress={handleAddToCart}
          >
            <Text style={styles.addButtonTextSmall}>Add</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.quantityControlSmall}>
            <TouchableOpacity
              style={styles.quantityButtonSmall}
              onPress={() => onUpdateQuantity(item.id, quantity - 1)}
            >
              <IconSymbol
                ios_icon_name={quantity === 1 ? "trash.fill" : "minus"}
                android_material_icon_name={quantity === 1 ? "delete" : "remove"}
                size={14}
                color={colors.card}
              />
            </TouchableOpacity>
            <Text style={styles.quantityTextSmall}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButtonSmall}
              onPress={handleAddToCart}
            >
              <IconSymbol
                ios_icon_name="plus"
                android_material_icon_name="add"
                size={14}
                color={colors.card}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  searchIconButton: {
    padding: 8,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 8,
  },
  tabNavItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  tabNavText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabNavTextActive: {
    color: colors.secondary,
    fontWeight: '600',
  },
  tabNavIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
  },
  subtitleBanner: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subtitleText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '400',
  },
  emailCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  emailCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  dishCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  dishImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  dishImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  dishInfo: {
    padding: 16,
  },
  dishName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  dishDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  dishFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dishPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  spiceLevelEmojis: {
    fontSize: 14,
  },
  dishTags: {
    flexDirection: 'row',
    gap: 8,
  },
  vegTag: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  vegTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.card,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addButtonText: {
    color: colors.card,
    fontSize: 15,
    fontWeight: '700',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  quantityButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 16,
  },
  toggleSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: colors.card,
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: colors.text,
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
    borderWidth: 1,
    borderColor: colors.border,
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
    fontWeight: '600',
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  categorySection: {
    paddingVertical: 12,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryChipTextActive: {
    color: colors.card,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  menuInfo: {
    flex: 1,
    paddingRight: 12,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
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
    color: colors.text,
  },
  menuImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  menuImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  addButtonSmall: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonTextSmall: {
    color: colors.card,
    fontSize: 13,
    fontWeight: '700',
  },
  quantityControlSmall: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  quantityButtonSmall: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quantityTextSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 12,
  },
  menuButtonContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  menuButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    boxShadow: '0px 2px 4px rgba(220, 36, 31, 0.2)',
    elevation: 2,
  },
  menuButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
  },
  cartFloatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 8,
    boxShadow: '0px 4px 12px rgba(220, 36, 31, 0.3)',
    elevation: 6,
  },
  cartFloatingText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
  },
});
