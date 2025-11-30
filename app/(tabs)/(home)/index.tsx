
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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { restaurants, dishes } from '@/data/restaurants';
import { Dish } from '@/types/restaurant';

const { width } = Dimensions.get('window');

interface Address {
  id: string;
  label: string;
  address: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDelivery, setIsDelivery] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address>({
    id: '1',
    label: 'Home',
    address: '123 Main Street, London, SW1A 1AA',
  });

  const [addresses] = useState<Address[]>([
    { id: '1', label: 'Home', address: '123 Main Street, London, SW1A 1AA' },
    { id: '2', label: 'Work', address: '456 Office Road, London, EC1A 1BB' },
    { id: '3', label: 'Other', address: '789 Park Avenue, London, W1A 1CC' },
  ]);

  // Get The Palace restaurant (only one)
  const restaurant = restaurants[0];

  // Get popular dishes from The Palace
  const popularDishes: (Dish & { restaurantId: string })[] = [];
  Object.entries(dishes).forEach(([restaurantId, restaurantDishes]) => {
    restaurantDishes
      .filter((dish) => dish.isPopular)
      .forEach((dish) => {
        popularDishes.push({ ...dish, restaurantId });
      });
  });

  const menuItems = dishes[restaurant.id] || [];
  
  // Get categories from menu items
  const categories = Array.from(new Set(menuItems.map((item) => item.category)));

  // Filter items based on search and category
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

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

        {/* Category Filter - Menu Subheadings */}
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
            ))}
          </ScrollView>
        </View>

        {/* Menu Items Display */}
        {!searchQuery && !selectedCategory && (
          <React.Fragment>
            {/* Popular Dishes */}
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
                {popularDishes.map((dish, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dishCard}
                    onPress={() =>
                      router.push({
                        pathname: '/menu/[id]',
                        params: { id: dish.restaurantId },
                      })
                    }
                  >
                    <Image source={{ uri: dish.image }} style={styles.dishImage} />
                    <View style={styles.dishInfo}>
                      <Text style={styles.dishName} numberOfLines={1}>
                        {dish.name}
                      </Text>
                      <Text style={styles.dishPrice}>£{dish.price.toFixed(2)}</Text>
                      <View style={styles.dishTags}>
                        {dish.isVegetarian && (
                          <View style={styles.vegTag}>
                            <Text style={styles.vegTagText}>VEG</Text>
                          </View>
                        )}
                        {dish.isSpicy && (
                          <Text style={styles.spicyIcon}>🌶️</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

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

        {/* Filtered Results */}
        {(searchQuery || selectedCategory) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {filteredItems.length} {filteredItems.length === 1 ? 'Result' : 'Results'}
              </Text>
            </View>
            {filteredItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.searchResultCard}
                onPress={() =>
                  router.push({
                    pathname: '/menu/[id]',
                    params: { id: restaurant.id },
                  })
                }
              >
                <Image source={{ uri: item.image }} style={styles.resultImage} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.resultFooter}>
                    <Text style={styles.resultPrice}>£{item.price.toFixed(2)}</Text>
                    <View style={styles.resultTags}>
                      {item.isVegetarian && (
                        <View style={styles.vegTag}>
                          <Text style={styles.vegTagText}>VEG</Text>
                        </View>
                      )}
                      {item.isSpicy && <Text style={styles.spicyIcon}>🌶️</Text>}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
                <TouchableOpacity
                  key={index}
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
                      color={colors.text}
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
                      color={colors.highlight}
                    />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={() => {
                  setShowAddressModal(false);
                  console.log('Add new address clicked');
                }}
              >
                <IconSymbol
                  ios_icon_name="plus.circle"
                  android_material_icon_name="add-circle-outline"
                  size={24}
                  color={colors.text}
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
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: colors.textSecondary,
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
  dishImage: {
    width: '100%',
    height: 120,
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
  dishPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  dishTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  searchResultCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  resultImage: {
    width: 100,
    height: 100,
    backgroundColor: colors.border,
  },
  resultInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  resultFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  resultTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
});
