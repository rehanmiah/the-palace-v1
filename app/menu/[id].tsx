
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { restaurants, dishes } from '@/data/restaurants';
import { useCart } from '@/contexts/CartContext';

export default function MenuScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, getCartItemCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
        <Text style={styles.headerTitle}>Menu</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <IconSymbol
            ios_icon_name="cart.fill"
            android_material_icon_name="shopping-cart"
            size={24}
            color={colors.primary}
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
        {/* Restaurant Info */}
        <View style={styles.restaurantSection}>
          <Image
            source={{ uri: restaurant.image }}
            style={styles.restaurantImage}
          />
          <View style={styles.restaurantInfo}>
            <View style={styles.restaurantHeader}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
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
                  Min ${restaurant.minimumOrder}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category Filter */}
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
              All
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

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {filteredItems.map((item, index) => (
            <React.Fragment key={index}>
              <View style={styles.menuItem}>
                <Image source={{ uri: item.image }} style={styles.menuImage} />
                <View style={styles.menuInfo}>
                  <View style={styles.menuHeader}>
                    <Text style={styles.menuName}>{item.name}</Text>
                    <View style={styles.menuTags}>
                      {item.isVegetarian && (
                        <View style={styles.vegTag}>
                          <Text style={styles.vegTagText}>VEG</Text>
                        </View>
                      )}
                      {item.isSpicy && <Text style={styles.spicyIcon}>🌶️</Text>}
                    </View>
                  </View>
                  <Text style={styles.menuDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.menuFooter}>
                    <Text style={styles.menuPrice}>
                      ${item.price.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddToCart(item)}
                    >
                      <IconSymbol
                        ios_icon_name="plus"
                        android_material_icon_name="add"
                        size={20}
                        color={colors.card}
                      />
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
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
    color: colors.card,
    fontSize: 12,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  restaurantSection: {
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  restaurantImage: {
    width: '100%',
    height: 200,
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
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
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
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  menuSection: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  menuImage: {
    width: 120,
    height: 120,
    backgroundColor: colors.border,
  },
  menuInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
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
  menuDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  menuFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 100,
  },
});
