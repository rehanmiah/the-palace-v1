
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { restaurants } from '@/data/restaurants';

export default function RestaurantsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  // Get unique cuisines
  const allCuisines = Array.from(
    new Set(restaurants.flatMap((r) => r.cuisine))
  );

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine =
      !selectedCuisine || restaurant.cuisine.includes(selectedCuisine);
    return matchesSearch && matchesCuisine;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Restaurants</Text>
          <Text style={styles.subtitle}>
            {filteredRestaurants.length} restaurants available
          </Text>
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
            placeholder="Search restaurants..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Cuisine Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedCuisine && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCuisine(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                !selectedCuisine && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {allCuisines.map((cuisine, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedCuisine === cuisine && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCuisine(cuisine)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCuisine === cuisine && styles.filterChipTextActive,
                  ]}
                >
                  {cuisine}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </ScrollView>

        {/* Restaurant List */}
        <View style={styles.restaurantList}>
          {filteredRestaurants.map((restaurant, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.restaurantCard}
                onPress={() =>
                  router.push({
                    pathname: '/menu/[id]',
                    params: { id: restaurant.id },
                  })
                }
              >
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
                  <Text style={styles.restaurantDescription} numberOfLines={2}>
                    {restaurant.description}
                  </Text>
                  <View style={styles.cuisineContainer}>
                    {restaurant.cuisine.slice(0, 3).map((cuisine, idx) => (
                      <React.Fragment key={idx}>
                        <View style={styles.cuisineBadge}>
                          <Text style={styles.cuisineBadgeText}>{cuisine}</Text>
                        </View>
                      </React.Fragment>
                    ))}
                  </View>
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
                      <Text style={styles.metaText}>
                        {restaurant.deliveryTime}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <IconSymbol
                        ios_icon_name="dollarsign.circle.fill"
                        android_material_icon_name="attach-money"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.metaText}>
                        ${restaurant.deliveryFee.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaText}>
                        Min ${restaurant.minimumOrder}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 48,
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
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
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.card,
  },
  restaurantList: {
    paddingHorizontal: 16,
  },
  restaurantCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
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
  restaurantName: {
    fontSize: 20,
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
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  cuisineBadge: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cuisineBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  restaurantMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
});
