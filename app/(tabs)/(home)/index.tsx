
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { restaurants, dishes } from '@/data/restaurants';
import { Dish } from '@/types/restaurant';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

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
  const filteredItems = searchQuery
    ? menuItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : menuItems;

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
            <View style={styles.metaItem}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={18}
                color={colors.accent}
              />
              <Text style={styles.metaText}>{restaurant.rating}</Text>
            </View>
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

        {/* Popular Dishes */}
        {!searchQuery && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Dishes</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {popularDishes.map((dish, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
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
                </React.Fragment>
              ))}
            </ScrollView>
          </View>
        )}

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

        {/* Search Results */}
        {searchQuery && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {filteredItems.length} Results
              </Text>
            </View>
            {filteredItems.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
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
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
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
});
