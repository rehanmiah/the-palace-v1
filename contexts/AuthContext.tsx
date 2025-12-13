
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Alert } from 'react-native';
import type { Tables } from '@/app/integrations/supabase/types';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'cash';
  last4?: string;
  brand?: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
  holderName?: string;
}

export interface Order {
  id: string;
  restaurantName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'ready_for_collection' | 'delivered' | 'completed' | 'cancelled';
  orderDate: string;
  deliveryAddress: string;
  orderType: 'delivery' | 'collection';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  resendPhoneVerification: () => Promise<void>;
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  orders: Order[];
  fetchOrders: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Load profile error:', error);
        return;
      }

      if (profile) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        setUser({
          id: profile.id,
          name: profile.name,
          email: authUser?.email || '',
          phone: profile.phone || '',
          emailVerified: profile.email_verified || false,
          phoneVerified: profile.phone_verified || false,
          createdAt: profile.created_at || new Date().toISOString(),
        });

        // Load related data
        await fetchPaymentMethods();
        await fetchOrders();
      }
    } catch (error) {
      console.error('Load user profile error:', error);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Check auth error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setPaymentMethods([]);
        setOrders([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth, loadUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Logging in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        Alert.alert('Login Error', error.message);
        throw error;
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  const register = useCallback(async (name: string, email: string, phone: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Registering user:', { name, email, phone });
      
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            name,
            phone
          }
        }
      });
      
      if (error) {
        Alert.alert('Registration Error', error.message);
        throw error;
      }

      if (data.user) {
        // Create user profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name,
            phone,
            email_verified: false,
            phone_verified: false,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Show verification reminder
        Alert.alert(
          'Registration Successful',
          'Please check your email to verify your account. A verification link has been sent to ' + email,
          [{ text: 'OK' }]
        );

        await loadUserProfile(data.user.id);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Logging out...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        Alert.alert('Logout Error', error.message);
        throw error;
      }
      
      setUser(null);
      setPaymentMethods([]);
      setOrders([]);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Updating profile:', updates);
      
      // Update auth user if email changed
      if (updates.email && updates.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ 
          email: updates.email 
        });
        
        if (emailError) {
          Alert.alert('Update Error', emailError.message);
          throw emailError;
        }
        
        Alert.alert(
          'Email Update',
          'A verification email has been sent to ' + updates.email
        );
      }
      
      // Update user profile in database
      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name || user.name,
          phone: updates.phone || user.phone,
          email_verified: updates.email ? false : user.emailVerified,
          phone_verified: updates.phone && updates.phone !== user.phone ? false : user.phoneVerified,
        })
        .eq('id', user.id);
      
      if (error) {
        Alert.alert('Update Error', error.message);
        throw error;
      }
      
      // Reload profile
      await loadUserProfile(user.id);
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, loadUserProfile]);

  const resendEmailVerification = useCallback(async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      console.log('Resending email verification to:', user.email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed'
        }
      });
      
      if (error) {
        Alert.alert('Error', error.message);
        throw error;
      }
      
      Alert.alert('Success', 'Verification email sent!');
    } catch (error) {
      console.error('Resend email verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const resendPhoneVerification = useCallback(async () => {
    if (!user?.phone) return;
    
    setIsLoading(true);
    try {
      console.log('Resending phone verification to:', user.phone);
      
      // Note: Phone verification requires additional setup in Supabase
      Alert.alert('Info', 'Phone verification is not yet configured. Please contact support.');
      
    } catch (error) {
      console.error('Resend phone verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchPaymentMethods = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('Fetching payment methods...');
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Fetch payment methods error:', error);
        return;
      }
      
      const methods: PaymentMethod[] = (data || []).map(pm => ({
        id: pm.id,
        type: pm.type as PaymentMethod['type'],
        last4: pm.last4 || undefined,
        brand: pm.brand || undefined,
        expiryMonth: pm.expiry_month || undefined,
        expiryYear: pm.expiry_year || undefined,
        isDefault: pm.is_default || false,
        holderName: pm.holder_name || undefined,
      }));
      
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Fetch payment methods error:', error);
    }
  }, [user]);

  const addPaymentMethod = useCallback(async (method: Omit<PaymentMethod, 'id'>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Adding payment method:', method);
      
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          type: method.type,
          last4: method.last4,
          brand: method.brand,
          expiry_month: method.expiryMonth,
          expiry_year: method.expiryYear,
          holder_name: method.holderName,
          is_default: method.isDefault,
        })
        .select()
        .single();
      
      if (error) {
        Alert.alert('Error', error.message);
        throw error;
      }
      
      // If this is set as default, unset others
      if (method.isDefault) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', data.id);
      }
      
      await fetchPaymentMethods();
      Alert.alert('Success', 'Payment method added successfully');
    } catch (error) {
      console.error('Add payment method error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchPaymentMethods]);

  const removePaymentMethod = useCallback(async (id: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Removing payment method:', id);
      
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        Alert.alert('Error', error.message);
        throw error;
      }
      
      await fetchPaymentMethods();
      Alert.alert('Success', 'Payment method removed successfully');
    } catch (error) {
      console.error('Remove payment method error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchPaymentMethods]);

  const setDefaultPaymentMethod = useCallback(async (id: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Setting default payment method:', id);
      
      // Unset all defaults
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);
      
      // Set new default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        Alert.alert('Error', error.message);
        throw error;
      }
      
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Set default payment method error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchPaymentMethods]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('Fetching orders...');
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('Fetch orders error:', ordersError);
        return;
      }
      
      const formattedOrders: Order[] = (ordersData || []).map(order => ({
        id: order.id,
        restaurantName: 'The Palace',
        items: (order.order_items || []).map((item: any) => ({
          name: item.menu_item_name,
          quantity: item.quantity,
          price: item.menu_item_price,
        })),
        total: order.total,
        status: order.status as Order['status'],
        orderDate: order.created_at || new Date().toISOString(),
        deliveryAddress: order.delivery_address_text || 'Collection',
        orderType: order.order_type as 'delivery' | 'collection',
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Fetch orders error:', error);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        resendEmailVerification,
        resendPhoneVerification,
        paymentMethods,
        addPaymentMethod,
        removePaymentMethod,
        setDefaultPaymentMethod,
        orders,
        fetchOrders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
