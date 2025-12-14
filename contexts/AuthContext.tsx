
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hashPassword, verifyPassword } from '@/utils/passwordUtils';
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
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
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

const SESSION_KEY = '@auth_session';

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
        await AsyncStorage.removeItem(SESSION_KEY);
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone || '',
          emailVerified: profile.email_verified || false,
          phoneVerified: profile.phone_verified || false,
          createdAt: profile.created_at || new Date().toISOString(),
        });

        // Load related data
        await fetchPaymentMethods(userId);
        await fetchOrdersInternal(userId);
      }
    } catch (error) {
      console.error('Load user profile error:', error);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      
      if (sessionData) {
        const session = JSON.parse(sessionData);
        await loadUserProfile(session.userId);
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
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Logging in with:', email);
      
      // Fetch user by email
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .limit(1);
      
      if (fetchError) {
        console.error('Login fetch error:', fetchError);
        throw new Error('Invalid email or password');
      }

      if (!users || users.length === 0) {
        throw new Error('Invalid email or password');
      }

      const userRecord = users[0];

      // Verify password using bcrypt
      if (!userRecord.password_hash) {
        throw new Error('Account not properly configured. Please contact support.');
      }

      const isPasswordValid = await verifyPassword(password, userRecord.password_hash);
      
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Check email verification (optional - can be disabled for testing)
      // Uncomment the following lines to enforce email verification
      /*
      if (!userRecord.email_verified) {
        throw new Error('Please verify your email address before signing in. Check your inbox for the verification link.');
      }
      */

      // Create session
      const session = {
        userId: userRecord.id,
        email: userRecord.email,
        timestamp: new Date().toISOString(),
      };

      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      await loadUserProfile(userRecord.id);
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
      
      // Check if email already exists with better error handling
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1);

      // Handle database connection errors
      if (checkError) {
        console.error('Email check error details:', checkError);
        throw new Error('Unable to verify email availability. Please check your connection and try again.');
      }

      // Check if email is already taken
      if (existingUsers && existingUsers.length > 0) {
        throw new Error('An account with this email already exists');
      }

      // Hash password using bcrypt
      const passwordHash = await hashPassword(password);

      // Create user profile in users table
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          name,
          email,
          phone,
          password_hash: passwordHash,
          email_verified: false,
          phone_verified: false,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Registration error:', insertError);
        throw new Error(insertError.message || 'Failed to create account');
      }

      // Show success message
      Alert.alert(
        'Registration Successful!',
        'Your account has been created successfully!\n\n' +
        'You can now sign in with your email and password.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      // Re-throw the error so it can be caught in the UI
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Logging out...');
      
      await AsyncStorage.removeItem(SESSION_KEY);
      
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
      
      // Update user profile in database
      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name || user.name,
          email: updates.email || user.email,
          phone: updates.phone || user.phone,
          email_verified: updates.email && updates.email !== user.email ? false : user.emailVerified,
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
      
      // Note: Email verification requires additional setup
      Alert.alert('Info', 'Email verification is currently disabled. Your account is active.');
      
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
      
      // Note: Phone verification requires additional setup
      Alert.alert('Info', 'Phone verification is not yet configured. Please contact support.');
      
    } catch (error) {
      console.error('Resend phone verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchPaymentMethods = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;
    
    try {
      console.log('Fetching payment methods...');
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', targetUserId)
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

  const fetchOrdersInternal = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;
    
    try {
      console.log('Fetching orders...');
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', targetUserId)
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

  const fetchOrders = useCallback(async () => {
    await fetchOrdersInternal();
  }, [fetchOrdersInternal]);

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
