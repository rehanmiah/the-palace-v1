
import { useState, useCallback } from 'react';

// This hook manages spice level as temporary local state only
// Spice levels are NOT persisted to the database until checkout
export function useSpiceLevel(menuItemId: number) {
  const [spiceLevel, setSpiceLevel] = useState<number>(0);

  const updateSpiceLevel = useCallback((newLevel: number) => {
    // Clamp level between 0 and 3
    const clampedLevel = Math.max(0, Math.min(3, newLevel));
    
    // Update local state only - no database persistence
    setSpiceLevel(clampedLevel);
    console.log('Updated local spice level to:', clampedLevel, 'for item:', menuItemId);
  }, [menuItemId]);

  const cycleSpiceLevel = useCallback(() => {
    // Cycle through 0 -> 1 -> 2 -> 3 -> 0
    setSpiceLevel((prevLevel) => {
      const nextLevel = prevLevel >= 3 ? 0 : prevLevel + 1;
      console.log('Cycling spice level from', prevLevel, 'to', nextLevel, 'for item:', menuItemId);
      return nextLevel;
    });
  }, [menuItemId]);

  const incrementSpiceLevel = useCallback(() => {
    setSpiceLevel((prevLevel) => {
      const newLevel = Math.min(3, prevLevel + 1);
      return newLevel;
    });
  }, []);

  const decrementSpiceLevel = useCallback(() => {
    setSpiceLevel((prevLevel) => {
      const newLevel = Math.max(0, prevLevel - 1);
      return newLevel;
    });
  }, []);

  const resetSpiceLevel = useCallback(() => {
    setSpiceLevel(0);
  }, []);

  return {
    spiceLevel,
    isLoading: false,
    updateSpiceLevel,
    cycleSpiceLevel,
    incrementSpiceLevel,
    decrementSpiceLevel,
    resetSpiceLevel,
  };
}
