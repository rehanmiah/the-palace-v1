
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
        {/* Header with Restaurant Image */}
        <View style={styles.headerImageContainer}>
          <Image source={restaurant.image} style={styles.headerImage} />
          <View style={styles.headerOverlay}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantAddress}>{restaurant.address}</Text>
          </View>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push('/cart')}
          >
            <IconSymbol
              ios_icon_name="cart.fill"
              android_material_icon_name="shopping-cart"
              size={28}
              color="#FFFFFF"
            />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Restaurant Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.description}>{restaurant.description}</Text>
          <View style={styles.metaContainer}>
            <TouchableOpacity 
              style={styles.metaItem}
              onPress={() => router.push('/reviews')}
            >
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={18}
                color={colors.accent}
              />
              <Text style={styles.metaText}>{restaurant.rating}</Text>
            </TouchableOpacity>
            <View style={styles.metaItem}>
              <IconSymbol
                ios_icon_name="clock.fill"
                android_material_icon_name="schedule"
                size={18}
                color={colors.text}
              />
              <Text style={styles.metaText}>{restaurant.deliveryTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>Min £{restaurant.minimumOrder}</Text>
            </View>
          </View>
        </View>

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

        {/* Popular Dishes - Moved above search */}
        {!searchQuery && !selectedCategory && popularDishes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Dishes</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/menu/[id]', params: { id: restaurant.id } })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
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
            </ScrollView>
          </View>
        )}

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

        {/* Category Filter - Menu Subheadings from Database */}
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

        {/* Menu Items Display */}
        {!searchQuery && !selectedCategory && (
          <React.Fragment>
            {/* Full Menu Button */}
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
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </React.Fragment>
        )}

        {/* Filtered Results - When search or category is selected */}
        {(searchQuery || selectedCategory) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategory || `${filteredItems.length} ${filteredItems.length === 1 ? 'Result' : 'Results'}`}
              </Text>
            </View>
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
          <SpiceButtonInline menuItemId={dish.id} />
        )}
      </View>
      <View style={styles.dishInfo}>
        <Text style={styles.dishName} numberOfLines={1}>
          {dish.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.dishPrice}>£{dish.price.toFixed(2)}</Text>
          {spiceLevel > 0 && renderChilies(spiceLevel)}
        </View>
        <View style={styles.dishTags}>
          {dish.is_vegetarian && (
            <View style={styles.vegTag}>
              <Text style={styles.vegTagText}>VEG</Text>
            </View>
          )}
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
                size={14}
                color="#FFFFFF"
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
                size={14}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        )}
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
          {spiceLevel > 0 && renderChilies(spiceLevel)}
          <View style={styles.menuTags}>
            {item.is_vegetarian && (
              <View style={styles.vegTag}>
                <Text style={styles.vegTagText}>VEG</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.menuImageContainer}>
        <Image source={{ uri: item.image_id || '' }} style={styles.menuImage} />
        {item.spicy && (
          <SpiceButtonInline menuItemId={item.id} />
        )}
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
              onPress={() => onUpdateQuantity(item.id, quantity - 1)}
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
    </View>
  );
}

// Inline Spice Button Component - Now only controls spice level, doesn't add to cart
function SpiceButtonInline({ menuItemId }: { menuItemId: string }) {
  const { spiceLevel, incrementSpiceLevel, decrementSpiceLevel, updateSpiceLevel } = useSpiceLevel(menuItemId);
  const [showControls, setShowControls] = useState(false);

  const handlePress = () => {
    if (spiceLevel === 0) {
      // First click sets to level 1
      incrementSpiceLevel();
    } else {
      // Subsequent clicks show controls
      setShowControls(true);
    }
  };

  const handleIncrement = (e: any) => {
    e.stopPropagation();
    incrementSpiceLevel();
  };

  const handleDecrement = (e: any) => {
    e.stopPropagation();
    decrementSpiceLevel();
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    updateSpiceLevel(0);
    setShowControls(false);
  };

  // Show controls if spice level > 0 and controls are visible
  if (spiceLevel > 0 && showControls) {
    return (
      <View style={styles.spiceControlsContainer}>
        <TouchableOpacity
          style={styles.spiceControlButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="trash.fill"
            android_material_icon_name="delete"
            size={16}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.spiceControlButton}
          onPress={handleDecrement}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="minus"
            android_material_icon_name="remove"
            size={16}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <View style={styles.spiceLevelDisplay}>
          <Text style={styles.spiceLevelText}>{spiceLevel}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.spiceControlButton,
            spiceLevel >= 3 && styles.spiceControlButtonDisabled,
          ]}
          onPress={handleIncrement}
          disabled={spiceLevel >= 3}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="plus"
            android_material_icon_name="add"
            size={16}
            color={spiceLevel >= 3 ? colors.textSecondary : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>
    );
  }

  // Default button view
  return (
    <TouchableOpacity
      style={styles.spiceButtonInline}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.chilliEmoji}>🌶️</Text>
      {spiceLevel > 0 && (
        <View style={styles.spiceBadge}>
          <Text style={styles.spiceBadgeText}>{spiceLevel}</Text>
        </View>
      )}
    </TouchableOpacity>
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
  headerImageContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    paddingTop: 40,
  },
  restaurantName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cartButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
    elevation: 5,
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
  infoCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  description: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  toggleSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  categorySection: {
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#808080',
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dishCard: {
    width: width * 0.4,
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  dishImageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  dishImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  dishInfo: {
    padding: 12,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
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
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
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
  addButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    backgroundColor: '#000000',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 10,
  },
  menuButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  menuButton: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 0,
    marginBottom: 0,
    paddingVertical: 16,
    paddingHorizontal: 16,
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
  spiceButtonInline: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 6,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 4,
    zIndex: 10,
  },
  chilliEmoji: {
    fontSize: 20,
  },
  spiceBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  spiceBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  spiceControlsContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 4,
    gap: 4,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.25)',
    elevation: 6,
    zIndex: 10,
  },
  spiceControlButton: {
    width: 32,
    height: 32,
    backgroundColor: '#000000',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spiceControlButtonDisabled: {
    backgroundColor: colors.border,
  },
  spiceLevelDisplay: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spiceLevelText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
