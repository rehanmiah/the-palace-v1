
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useSpiceLevel } from '@/hooks/useSpiceLevel';

interface SpiceButtonProps {
  menuItemId: string;
  onSpiceLevelChange?: (level: number) => void;
}

export function SpiceButton({ menuItemId, onSpiceLevelChange }: SpiceButtonProps) {
  const { spiceLevel, incrementSpiceLevel, decrementSpiceLevel } = useSpiceLevel(menuItemId);
  const [showModal, setShowModal] = useState(false);

  const handleIncrement = () => {
    incrementSpiceLevel();
    if (onSpiceLevelChange) {
      onSpiceLevelChange(Math.min(3, spiceLevel + 1));
    }
  };

  const handleDecrement = () => {
    decrementSpiceLevel();
    if (onSpiceLevelChange) {
      onSpiceLevelChange(Math.max(0, spiceLevel - 1));
    }
  };

  const renderChillies = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <Text key={i} style={styles.chilliEmoji}>🌶️</Text>
    ));
  };

  return (
    <React.Fragment>
      <TouchableOpacity
        style={styles.spiceButton}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <View style={styles.spiceButtonContent}>
          <Text style={styles.chilliEmoji}>🌶️</Text>
          {spiceLevel > 0 && (
            <View style={styles.spiceBadge}>
              <Text style={styles.spiceBadgeText}>{spiceLevel}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowModal(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Select Spice Level</Text>
            
            <View style={styles.spiceLevelDisplay}>
              {spiceLevel === 0 ? (
                <Text style={styles.noSpiceText}>No spice selected</Text>
              ) : (
                <View style={styles.chilliesContainer}>
                  {renderChillies(spiceLevel)}
                </View>
              )}
            </View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  spiceLevel === 0 && styles.controlButtonDisabled,
                ]}
                onPress={handleDecrement}
                disabled={spiceLevel === 0}
              >
                <IconSymbol
                  ios_icon_name="minus"
                  android_material_icon_name="remove"
                  size={24}
                  color={spiceLevel === 0 ? colors.textSecondary : '#FFFFFF'}
                />
              </TouchableOpacity>

              <View style={styles.levelIndicator}>
                <Text style={styles.levelText}>{spiceLevel}</Text>
                <Text style={styles.levelSubtext}>/ 3</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.controlButton,
                  spiceLevel === 3 && styles.controlButtonDisabled,
                ]}
                onPress={handleIncrement}
                disabled={spiceLevel === 3}
              >
                <IconSymbol
                  ios_icon_name="plus"
                  android_material_icon_name="add"
                  size={24}
                  color={spiceLevel === 3 ? colors.textSecondary : '#FFFFFF'}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </React.Fragment>
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
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  spiceLevelDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    marginBottom: 24,
  },
  noSpiceText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  chilliesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: colors.border,
  },
  levelIndicator: {
    alignItems: 'center',
  },
  levelText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
  },
  levelSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: -4,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
