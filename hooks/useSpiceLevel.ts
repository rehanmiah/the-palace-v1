
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_ID_KEY = 'guest_session_id';

export function useSpiceLevel(menuItemId: string) {
  const { user } = useAuth();
  const [spiceLevel, setSpiceLevel] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Get or create session ID for guest users
  useEffect(() => {
    const initSessionId = async () => {
      if (!user) {
        let storedSessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
        if (!storedSessionId) {
          storedSessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          await AsyncStorage.setItem(SESSION_ID_KEY, storedSessionId);
          console.log('Created new guest session:', storedSessionId);
        }
        setSessionId(storedSessionId);
      }
    };
    initSessionId();
  }, [user]);

  // Fetch spice level from database
  useEffect(() => {
    if (!menuItemId || (!user && !sessionId)) {
      setIsLoading(false);
      return;
    }

    fetchSpiceLevel();
  }, [menuItemId, user, sessionId]);

  const fetchSpiceLevel = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('menu_item_spice_levels')
        .select('spice_level')
        .eq('menu_item_id', menuItemId);

      if (user) {
        query = query.eq('user_id', user.id);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No spice level found for item:', menuItemId);
          setSpiceLevel(0);
        } else {
          console.error('Error fetching spice level:', error);
        }
      } else if (data) {
        console.log('Fetched spice level:', data.spice_level);
        setSpiceLevel(data.spice_level);
      }
    } catch (err) {
      console.error('Error in fetchSpiceLevel:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSpiceLevel = useCallback(async (newLevel: number) => {
    if (!menuItemId || (!user && !sessionId)) {
      console.log('Cannot update spice level: missing user/session or menuItemId');
      return;
    }

    // Clamp level between 0 and 3
    const clampedLevel = Math.max(0, Math.min(3, newLevel));
    setSpiceLevel(clampedLevel);

    try {
      if (clampedLevel === 0) {
        // Delete the record if level is 0
        let deleteQuery = supabase
          .from('menu_item_spice_levels')
          .delete()
          .eq('menu_item_id', menuItemId);

        if (user) {
          deleteQuery = deleteQuery.eq('user_id', user.id);
        } else if (sessionId) {
          deleteQuery = deleteQuery.eq('session_id', sessionId);
        }

        const { error } = await deleteQuery;
        if (error) {
          console.error('Error deleting spice level:', error);
        } else {
          console.log('Deleted spice level for item:', menuItemId);
        }
      } else {
        // Upsert the spice level
        const record = {
          menu_item_id: menuItemId,
          user_id: user?.id || null,
          session_id: !user ? sessionId : null,
          spice_level: clampedLevel,
        };

        const { error } = await supabase
          .from('menu_item_spice_levels')
          .upsert(record, {
            onConflict: user ? 'menu_item_id,user_id' : 'menu_item_id,session_id',
          });

        if (error) {
          console.error('Error updating spice level:', error);
        } else {
          console.log('Updated spice level to:', clampedLevel);
        }
      }
    } catch (err) {
      console.error('Error in updateSpiceLevel:', err);
    }
  }, [menuItemId, user, sessionId]);

  const incrementSpiceLevel = useCallback(() => {
    const newLevel = Math.min(3, spiceLevel + 1);
    updateSpiceLevel(newLevel);
  }, [spiceLevel, updateSpiceLevel]);

  const decrementSpiceLevel = useCallback(() => {
    const newLevel = Math.max(0, spiceLevel - 1);
    updateSpiceLevel(newLevel);
  }, [spiceLevel, updateSpiceLevel]);

  return {
    spiceLevel,
    isLoading,
    updateSpiceLevel,
    incrementSpiceLevel,
    decrementSpiceLevel,
  };
}
