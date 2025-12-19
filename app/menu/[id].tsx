
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TextInput,
  Dimensions,
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

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MenuScreen() {
  const router = useRouter();
  const { id, category: categoryParam } = useLocalSearchParams<{ id: string; category?: string }>();
  const { addToCart, updateQuantity, getCartItemCount, getItemQuantityInCart, cart } = useCart();
  const { menuItems, categories } = useMenu();
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

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll position state
  const [scrollY, setScrollY] = useState(0);
  const [filterSectionHeight, setFilterSectionHeight] = useState(0);
  const filterSectionRef = useRef<View>(null);

  // Category scroll refs for centering
  const categoryScrollRef = useRef<ScrollView>(null);
  const stickyCategoryScrollRef = useRef<ScrollView>(null);
  const categoryButtonRefs = useRef<{ [key: string]: { x: number; width: number } }>({});
  const [categoryScrollWidth, setCategoryScrollWidth] = useState(0);

  // Set initial category from URL params
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const restaurant = restaurants.find((r) => r.id === id);

  if (!restaurant) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Restaurant not found</Text>
      </View>
    );
  }

  // Filter items by category first
  const categoryFilteredItems = selectedCategory
    ? menuItems.filter((item) => item.category === selectedCategory)
    : menuItems;

  // Then filter by search query within the selected category
  const filteredItems = searchQuery.trim()
    ? categoryFilteredItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : categoryFilteredItems;

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

  // Handle scroll to track position
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    setScrollY(currentScrollY);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Determine if filter section should be sticky
  // The sticky header is 156px tall, and the image is 180px
  // So we want to stick when we've scrolled past the image
  const STICKY_THRESHOLD = 180;
  const isFilterSectionSticky = scrollY >= STICKY_THRESHOLD;

  // Calculate the top position for the sticky filter section
  const HEADER_HEIGHT = Platform.OS === 'android' ? 156 : 156;

  // Function to center the selected category in the horizontal scroll
  const centerSelectedCategory = (categoryKey: string, scrollViewRef: React.RefObject<ScrollView>) => {
    const categoryInfo = categoryButtonRefs.current[categoryKey];
    if (!categoryInfo || !scrollViewRef.current) {
      console.log('Cannot center - missing refs:', { categoryInfo, scrollViewRef: scrollViewRef.current });
      return;
    }

    const { x, width } = categoryInfo;
    
    // Calculate the center position of the category button
    const categoryCenter = x + (width / 2);
    
    // Calculate where to scroll to center the button on screen
    // We want the center of the button to align with the center of the screen
    const targetScrollX = categoryCenter - (SCREEN_WIDTH / 2);
    
    // Clamp the scroll position to valid range
    // Minimum is 0 (start of scroll)
    // Maximum is total content width minus screen width
    const maxScrollX = Math.max(0, categoryScrollWidth - SCREEN_WIDTH);
    const finalScrollX = Math.max(0, Math.min(targetScrollX, maxScrollX));
    
    console.log('Centering category:', {
      categoryKey,
      x,
      width,
      categoryCenter,
      targetScrollX,
      finalScrollX,
      screenWidth: SCREEN_WIDTH,
      contentWidth: categoryScrollWidth,
    });
    
    scrollViewRef.current.scrollTo({
      x: finalScrollX,
      animated: true,
    });
  };

  // Handle category selection with centering
  const handleCategorySelect = (categoryName: string | null) => {
    setSelectedCategory(categoryName);
    
    // Center the selected category in both scroll views
    const categoryKey = categoryName || 'all';
    
    // Small delay to ensure the button is rendered and measured
    setTimeout(() => {
      if (isFilterSectionSticky) {
        centerSelectedCategory(categoryKey, stickyCategoryScrollRef);
      } else {
        centerSelectedCategory(categoryKey, categoryScrollRef);
      }
    }, 50);
  };

  // Effect to center selected category when sticky state changes
  useEffect(() => {
    if (selectedCategory !== null) {
      const categoryKey = selectedCategory || 'all';
      // When transitioning to sticky, center in the sticky scroll view
      if (isFilterSectionSticky) {
        setTimeout(() => {
          centerSelectedCategory(categoryKey, stickyCategoryScrollRef);
        }, 100);
      }
    }
  }, [isFilterSectionSticky]);

  // Store category button positions
  const handleCategoryLayout = (categoryKey: string, event: any) => {
    const { x, width } = event.nativeEvent.layout;
    categoryButtonRefs.current[categoryKey] = { x, width };
    console.log('Category layout:', categoryKey, { x, width });
  };

  // Track the total content width of the category scroll
  const handleCategoryContentSizeChange = (width: number, height: number) => {
    setCategoryScrollWidth(width);
    console.log('Category scroll content width:', width);
  };

  return (
    <View style={styles.container}>
      {/* Sticky Delivery/Collection Header - At the Top */}
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

      {/* Sticky Combined Filter Section - Positioned absolutely when sticky */}
      {isFilterSectionSticky && (
        <View style={styles.stickyFilterSection}>
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
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Chips - Sticky Version */}
          <ScrollView
            ref={stickyCategoryScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
            bounces={false}
            onContentSizeChange={handleCategoryContentSizeChange}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategory && styles.categoryChipActive,
              ]}
              onPress={() => handleCategorySelect(null)}
              onLayout={(event) => handleCategoryLayout('all', event)}
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
                onPress={() => handleCategorySelect(category.name)}
                onLayout={(event) => handleCategoryLayout(category.name, event)}
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
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={true}
        overScrollMode="auto"
      >
        {/* Background Image with Cart Button */}
        <View style={styles.restaurantImageContainer}>
          <Image
            source={restaurant.image}
            style={styles.restaurantImage}
          />
          {/* Back Button */}
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
          {/* Cart Button in Background Image */}
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

        {/* Combined Filter Section (Search + Categories) - Normal position in scroll */}
        <View 
          ref={filterSectionRef}
          style={[
            styles.filterSection,
            isFilterSectionSticky && styles.filterSectionPlaceholder
          ]}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setFilterSectionHeight(height);
          }}
        >
          {!isFilterSectionSticky && (
            <>
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
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <IconSymbol
                      ios_icon_name="xmark.circle.fill"
                      android_material_icon_name="cancel"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Category Chips - Normal Version */}
              <ScrollView
                ref={categoryScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
                bounces={false}
                onContentSizeChange={handleCategoryContentSizeChange}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    !selectedCategory && styles.categoryChipActive,
                  ]}
                  onPress={() => handleCategorySelect(null)}
                  onLayout={(event) => handleCategoryLayout('all', event)}
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
                    onPress={() => handleCategorySelect(category.name)}
                    onLayout={(event) => handleCategoryLayout(category.name, event)}
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
            </>
          )}
        </View>

        {/* Menu Items Container - Separate but seamlessly integrated */}
        <View style={styles.menuSection}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <MenuItemRow
                key={index}
                item={item}
                onAdd={handleAddToCart}
                onUpdateQuantity={updateQuantity}
                getItemQuantityInCart={getItemQuantityInCart}
              />
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <IconSymbol
                ios_icon_name="magnifyingglass"
                android_material_icon_name="search"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.noResultsText}>
                No items found
              </Text>
              <Text style={styles.noResultsSubtext}>
                Try adjusting your search or category filter
              </Text>
            </View>
          )}
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
      
      <View style={styles.menuImageContainer}>
        <Image source={{ uri: item.image_id || '' }} style={styles.menuImage} />
        
        {/* Spice Button - Positioned at top-right of image */}
        <TouchableOpacity
          style={styles.spiceButton}
          onPress={handleSpiceClick}
          activeOpacity={0.8}
        >
          <View style={styles.spiceButtonContent}>
            <Text style={styles.spiceEmoji}>🌶️</Text>
            {spiceLevel > 0 && (
              <View style={styles.spiceBadge}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stickyHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 48,
    paddingBottom: 12,
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
  restaurantImageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    marginBottom: 0,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  backButton: {
    position: 'absolute',
    top: 8,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
    elevation: 5,
  },
  cartButton: {
    position: 'absolute',
    top: 8,
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
  // Combined Filter Section (Search + Categories) - Normal position
  filterSection: {
    backgroundColor: colors.background,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  // Placeholder to maintain layout when sticky
  filterSectionPlaceholder: {
    // Height will be set dynamically via onLayout
    minHeight: 140,
  },
  // Sticky Combined Filter Section
  stickyFilterSection: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 156 : 156,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 6,
    zIndex: 99,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
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
    color: colors.primary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  // Menu Items Container - Separate container
  menuSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: colors.background,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  menuInfo: {
    flex: 1,
    padding: 16,
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
  menuImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  menuImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  spiceButton: {
    position: 'absolute',
    top: 6,
    right: 6,
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
  },
  spiceBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
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
  errorText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 100,
  },
});
