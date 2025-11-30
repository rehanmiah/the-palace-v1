
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';
import type { Tables, TablesInsert } from '@/app/integrations/supabase/types';

export type Address = Tables<'addresses'>;
export type AddressInsert = Omit<TablesInsert<'addresses'>, 'user_id'>;

export function useAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setAddresses([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setAddresses(data || []);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAddress = async (address: AddressInsert) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add an address');
      return;
    }

    try {
      setIsLoading(true);

      const { data, error: insertError } = await supabase
        .from('addresses')
        .insert({
          ...address,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // If this is set as default, unset others
      if (address.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', data.id);
      }

      await fetchAddresses();
      Alert.alert('Success', 'Address added successfully');
    } catch (err) {
      console.error('Error adding address:', err);
      Alert.alert('Error', 'Failed to add address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAddress = async (id: string, updates: Partial<AddressInsert>) => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { error: updateError } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      // If this is set as default, unset others
      if (updates.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', id);
      }

      await fetchAddresses();
      Alert.alert('Success', 'Address updated successfully');
    } catch (err) {
      console.error('Error updating address:', err);
      Alert.alert('Error', 'Failed to update address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { error: deleteError } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      await fetchAddresses();
      Alert.alert('Success', 'Address deleted successfully');
    } catch (err) {
      console.error('Error deleting address:', err);
      Alert.alert('Error', 'Failed to delete address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultAddress = async (id: string) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Unset all defaults
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      const { error: updateError } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      await fetchAddresses();
    } catch (err) {
      console.error('Error setting default address:', err);
      Alert.alert('Error', 'Failed to set default address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultAddress = () => {
    return addresses.find(addr => addr.is_default) || addresses[0] || null;
  };

  return {
    addresses,
    isLoading,
    error,
    refetch: fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
  };
}
