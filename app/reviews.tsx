
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  userImage?: string;
}

const reviews: Review[] = [
  {
    id: '1',
    userName: 'Sarah Johnson',
    rating: 5,
    date: '2 days ago',
    comment: 'Absolutely amazing food! The butter chicken was incredible and the naan was perfectly cooked. Will definitely order again!',
  },
  {
    id: '2',
    userName: 'Michael Chen',
    rating: 5,
    date: '5 days ago',
    comment: 'Best Indian food in the area. The biryani is authentic and full of flavor. Delivery was quick too!',
  },
  {
    id: '3',
    userName: 'Emma Williams',
    rating: 4,
    date: '1 week ago',
    comment: 'Really good food, generous portions. The paneer tikka masala was delicious. Only minor issue was the delivery took a bit longer than expected.',
  },
  {
    id: '4',
    userName: 'David Brown',
    rating: 5,
    date: '1 week ago',
    comment: 'Outstanding quality! The lamb rogan josh was tender and flavorful. The spice level was perfect. Highly recommend!',
  },
  {
    id: '5',
    userName: 'Lisa Anderson',
    rating: 5,
    date: '2 weeks ago',
    comment: 'My go-to place for Indian food. Never disappoints! The samosas are crispy and the chutneys are amazing.',
  },
  {
    id: '6',
    userName: 'James Wilson',
    rating: 4,
    date: '2 weeks ago',
    comment: 'Great food and good value for money. The garlic naan is a must-try!',
  },
  {
    id: '7',
    userName: 'Sophie Taylor',
    rating: 5,
    date: '3 weeks ago',
    comment: 'Fantastic experience! The chicken tikka masala is the best I&apos;ve had. Fresh ingredients and authentic taste.',
  },
  {
    id: '8',
    userName: 'Robert Martinez',
    rating: 5,
    date: '3 weeks ago',
    comment: 'Excellent service and delicious food. The vegetable biryani was packed with flavor and the portions were generous.',
  },
];

export default function ReviewsScreen() {
  const router = useRouter();

  const averageRating = 4.9;
  const totalReviews = reviews.length;

  const ratingDistribution = [
    { stars: 5, count: 6, percentage: 75 },
    { stars: 4, count: 2, percentage: 25 },
    { stars: 3, count: 0, percentage: 0 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ];

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
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Rating Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.ratingHeader}>
            <View style={styles.ratingMain}>
              <Text style={styles.ratingNumber}>{averageRating}</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star, index) => (
                  <IconSymbol
                    key={index}
                    ios_icon_name="star.fill"
                    android_material_icon_name="star"
                    size={20}
                    color={colors.accent}
                  />
                ))}
              </View>
              <Text style={styles.totalReviews}>{totalReviews} reviews</Text>
            </View>
          </View>

          {/* Rating Distribution */}
          <View style={styles.distributionContainer}>
            {ratingDistribution.map((item, index) => (
              <View key={index} style={styles.distributionRow}>
                <Text style={styles.distributionStars}>{item.stars}</Text>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={14}
                  color={colors.accent}
                />
                <View style={styles.distributionBarContainer}>
                  <View
                    style={[
                      styles.distributionBar,
                      { width: `${item.percentage}%` },
                    ]}
                  />
                </View>
                <Text style={styles.distributionCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          {reviews.map((review, index) => (
            <View key={index} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userInitial}>
                      {review.userName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{review.userName}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                </View>
                <View style={styles.reviewRating}>
                  <IconSymbol
                    ios_icon_name="star.fill"
                    android_material_icon_name="star"
                    size={16}
                    color={colors.accent}
                  />
                  <Text style={styles.reviewRatingText}>{review.rating}</Text>
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  summaryCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  ratingHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingMain: {
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  distributionContainer: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distributionStars: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    width: 12,
  },
  distributionBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 24,
    textAlign: 'right',
  },
  reviewsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reviewRatingText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  reviewComment: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});
