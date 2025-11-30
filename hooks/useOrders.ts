
import { useState } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';
import type { TablesInsert } from '@/app/integrations/supabase/types';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CreateOrderParams {
  items: CartItem[];
  orderType: 'delivery' | 'collection';
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethodId?: string;
  paymentType: string;
  deliveryAddressId?: string;
  deliveryAddressText?: string;
  contactPhone: string;
  specialInstructions?: string;
}

export function useOrders() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const createOrder = async (params: CreateOrderParams) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to place an order');
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    try {
      // Create order
      const orderData: TablesInsert<'orders'> = {
        user_id: user.id,
        order_type: params.orderType,
        status: 'pending',
        subtotal: params.subtotal,
        delivery_fee: params.deliveryFee,
        discount: params.discount,
        total: params.total,
        payment_method_id: params.paymentMethodId,
        payment_type: params.paymentType,
        delivery_address_id: params.deliveryAddressId,
        delivery_address_text: params.deliveryAddressText,
        contact_phone: params.contactPhone,
        special_instructions: params.specialInstructions,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Create order items
      const orderItems = params.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        menu_item_name: item.name,
        menu_item_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw itemsError;
      }

      Alert.alert(
        'Order Placed Successfully!',
        `Your order #${order.id.substring(0, 8)} has been placed. You will receive a confirmation shortly.`,
        [{ text: 'OK' }]
      );

      return order;
    } catch (err) {
      console.error('Error creating order:', err);
      Alert.alert('Error', 'Failed to place order. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createOrder,
    isLoading,
  };
}
