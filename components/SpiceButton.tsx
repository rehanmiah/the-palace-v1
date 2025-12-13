
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useSpiceLevel } from '@/hooks/useSpiceLevel';

interface SpiceButtonProps {
  menuItemId: number;
  onSpiceLevelChange?: (level: number) => void;
}

export function SpiceButton({ menuItemId, onSpiceLevelChange }: SpiceButtonProps) {
  const { spiceLevel, cycleSpiceLevel } = useSpiceLevel(menuItemId);

  const handlePress = () => {
    const nextLevel = spiceLevel >= 3 ? 0 : spiceLevel + 1;
    cycleSpiceLevel();
    if (onSpiceLevelChange) {
      onSpiceLevelChange(nextLevel);
    }
  };

  return (
    <TouchableOpacity
      style={styles.spiceButton}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.spiceButtonContent}>
        <Text style={styles.chilliEmoji}>🌶️</Text>
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
  );
}

const styles = StyleSheet.create({
  spiceButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 6,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    } : {
      elevation: 4,
    }),
    zIndex: 10,
  },
  spiceButtonContent: {
    position: 'relative',
  },
  chilliEmoji: {
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
    ...(Platform.OS === 'android' && {
      elevation: 4,
    }),
  },
  spiceBadgeIOS: {
    shadowColor: '#C41E3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  spiceBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
