
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import type { Tables } from '@/app/integrations/supabase/types';

export type MenuItem = Tables<'menu'>;

export function useMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('menu')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setMenuItems(data || []);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPopularItems = () => {
    return menuItems.filter(item => item.is_popular);
  };

  const getItemsByCategory = (category: string) => {
    return menuItems.filter(item => item.category === category);
  };

  const getCategories = () => {
    const categories = new Set(menuItems.map(item => item.category).filter(Boolean));
    return Array.from(categories) as string[];
  };

  return {
    menuItems,
    isLoading,
    error,
    refetch: fetchMenu,
    getPopularItems,
    getItemsByCategory,
    getCategories,
  };
}
