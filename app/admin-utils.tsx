
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

export default function AdminUtilsScreen() {
  const router = useRouter();
  const [isUpdatingImages, setIsUpdatingImages] = useState(false);
  const [updateResult, setUpdateResult] = useState<any>(null);

  const handleUpdateMenuImages = async () => {
    try {
      setIsUpdatingImages(true);
      setUpdateResult(null);

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('update-menu-images', {
        body: {},
      });

      if (error) {
        throw error;
      }

      console.log('Update result:', data);
      setUpdateResult(data);
      Alert.alert(
        'Success',
        `Updated ${data.totalItems} menu items with Unsplash images!`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error updating images:', error);
      Alert.alert('Error', error.message || 'Failed to update menu images');
    } finally {
      setIsUpdatingImages(false);
    }
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
        <Text style={styles.headerTitle}>Admin Utilities</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu Management</Text>
          <Text style={styles.sectionDescription}>
            Update all menu items with high-quality Unsplash images based on dish names.
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, isUpdatingImages && styles.actionButtonDisabled]}
            onPress={handleUpdateMenuImages}
            disabled={isUpdatingImages}
          >
            {isUpdatingImages ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <React.Fragment>
                <IconSymbol
                  ios_icon_name="photo.fill"
                  android_material_icon_name="image"
                  size={24}
                  color={colors.card}
                />
                <Text style={styles.actionButtonText}>Update Menu Images</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>

          {updateResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Update Results:</Text>
              <Text style={styles.resultText}>
                Total Items: {updateResult.totalItems}
              </Text>
              <Text style={styles.resultText}>
                Successful: {updateResult.updates?.filter((u: any) => u.success).length || 0}
              </Text>
              <Text style={styles.resultText}>
                Failed: {updateResult.updates?.filter((u: any) => !u.success).length || 0}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Items</Text>
          <Text style={styles.sectionDescription}>
            The following items are currently marked as popular and will appear in the &quot;Popular Dishes&quot; section:
          </Text>
          <View style={styles.popularList}>
            <Text style={styles.popularItem}>• Chicken Tikka Masala</Text>
            <Text style={styles.popularItem}>• Butter Chicken</Text>
            <Text style={styles.popularItem}>• Chicken Biryani</Text>
            <Text style={styles.popularItem}>• Garlic Naan</Text>
            <Text style={styles.popularItem}>• Onion Bhajee</Text>
            <Text style={styles.popularItem}>• Vegetable Samosa</Text>
            <Text style={styles.popularItem}>• Tandoori Chicken</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            These utilities are for administrative purposes. The image update function will fetch appropriate images from Unsplash and update all menu items in the database.
          </Text>
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
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    boxShadow: '0px 4px 8px rgba(255, 127, 80, 0.3)',
    elevation: 4,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  popularList: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  popularItem: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.highlight,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
