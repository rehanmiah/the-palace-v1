
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import type { Tables } from '@/app/integrations/supabase/types';

export type MenuItem = Tables<'menu'>;
export type MenuCategory = Tables<'menu_categories'>;

export function useMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (menuError) {
        throw menuError;
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoriesError) {
        throw categoriesError;
      }

      setMenuItems(menuData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error('Error fetching menu data:', err);
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

  const getCategoryNames = () => {
    return categories.map(cat => cat.name);
  };

  return {
    menuItems,
    categories,
    isLoading,
    error,
    refetch: fetchMenuData,
    getPopularItems,
    getItemsByCategory,
    getCategoryNames,
  };
}
