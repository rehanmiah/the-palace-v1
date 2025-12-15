
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Alert } from 'react-native';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('[AuthContext] Loading user profile for:', userId);
      
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Load profile error:', error);
        return;
      }

      if (profile) {
        console.log('[AuthContext] Profile loaded successfully');
        setUser({
          id: profile.id,
          name: profile.name || '',
          email: profile.email || '',
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
      console.error('[AuthContext] Load user profile error:', error);
    }
  }, []);

  // Set up auth state listener
  useEffect(() => {
    console.log('[AuthContext] Setting up auth state listener');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthContext] Initial session:', session ? 'exists' : 'none');
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthContext] Auth state changed:', _event, session ? 'session exists' : 'no session');
      setSession(session);
      
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setPaymentMethods([]);
        setOrders([]);
      }
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('[AuthContext] Logging in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('[AuthContext] Login error:', error);
        throw error;
      }

      console.log('[AuthContext] Login successful');
      
      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email address before signing in. Check your inbox for the verification link.',
          [{ text: 'OK' }]
        );
        // Sign out the user since email is not verified
        await supabase.auth.signOut();
        throw new Error('Email not verified');
      }
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, phone: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('[AuthContext] Starting registration process...');
      console.log('[AuthContext] User data:', { name, email, phone });
      
      // Validate inputs
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new Error('Name is required');
      }
      
      if (!email || typeof email !== 'string' || email.trim().length === 0) {
        throw new Error('Email is required');
      }
      
      if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
        throw new Error('Phone number is required');
      }
      
      if (!password || typeof password !== 'string' || password.trim().length === 0) {
        throw new Error('Password is required');
      }
      
      console.log('[AuthContext] Input validation passed');
      
      // Sanitize inputs
      const sanitizedName = name.trim();
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPhone = phone.trim();
      
      console.log('[AuthContext] Registering with Supabase Auth...');
      
      // Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          data: {
            name: sanitizedName,
            phone: sanitizedPhone,
          },
          emailRedirectTo: 'https://natively.dev/email-confirmed',
        },
      });

      if (error) {
        console.error('[AuthContext] Registration error:', error);
        
        // Handle specific errors
        if (error.message?.includes('already registered')) {
          throw new Error('An account with this email already exists');
        }
        
        throw error;
      }

      if (!data.user) {
        throw new Error('Failed to create user account. Please try again.');
      }

      console.log('[AuthContext] User registered successfully:', data.user.id);

      // Show success message with email verification reminder
      Alert.alert(
        'Registration Successful!',
        'Your account has been created successfully!\n\n' +
        'Please check your email inbox and click the verification link to activate your account.\n\n' +
        'You will need to verify your email before you can sign in.',
        [{ text: 'OK' }]
      );
      
      // Sign out immediately since email needs to be verified
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('[AuthContext] Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('[AuthContext] Logging out...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AuthContext] Logout error:', error);
        throw error;
      }
      
      setUser(null);
      setSession(null);
      setPaymentMethods([]);
      setOrders([]);
      
      console.log('[AuthContext] Logout successful');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('[AuthContext] Updating profile:', updates);
      
      // Update user profile in database
      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name || user.name,
          phone: updates.phone || user.phone,
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('[AuthContext] Update profile error:', error);
        Alert.alert('Update Error', error.message);
        throw error;
      }
      
      // If email is being updated, use Supabase Auth
      if (updates.email && updates.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: updates.email,
        });
        
        if (emailError) {
          console.error('[AuthContext] Update email error:', emailError);
          Alert.alert('Update Error', emailError.message);
          throw emailError;
        }
        
        Alert.alert(
          'Email Update',
          'A verification email has been sent to your new email address. Please verify it to complete the change.'
        );
      }
      
      // Reload profile
      await loadUserProfile(user.id);
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('[AuthContext] Update profile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, loadUserProfile]);

  const resendEmailVerification = useCallback(async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      console.log('[AuthContext] Resending email verification to:', user.email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
        },
      });
      
      if (error) {
        console.error('[AuthContext] Resend email error:', error);
        throw error;
      }
      
      Alert.alert('Success', 'Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('[AuthContext] Resend email verification error:', error);
      Alert.alert('Error', 'Failed to send verification email. Please try again later.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const resendPhoneVerification = useCallback(async () => {
    if (!user?.phone) return;
    
    setIsLoading(true);
    try {
      console.log('[AuthContext] Resending phone verification to:', user.phone);
      
      Alert.alert('Info', 'Phone verification is not yet configured. Please contact support.');
    } catch (error) {
      console.error('[AuthContext] Resend phone verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchPaymentMethods = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;
    
    try {
      console.log('[AuthContext] Fetching payment methods...');
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('[AuthContext] Fetch payment methods error:', error);
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
      console.error('[AuthContext] Fetch payment methods error:', error);
    }
  }, [user]);

  const addPaymentMethod = useCallback(async (method: Omit<PaymentMethod, 'id'>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('[AuthContext] Adding payment method:', method);
      
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
      console.error('[AuthContext] Add payment method error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchPaymentMethods]);

  const removePaymentMethod = useCallback(async (id: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('[AuthContext] Removing payment method:', id);
      
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
      console.error('[AuthContext] Remove payment method error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchPaymentMethods]);

  const setDefaultPaymentMethod = useCallback(async (id: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('[AuthContext] Setting default payment method:', id);
      
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
      console.error('[AuthContext] Set default payment method error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchPaymentMethods]);

  const fetchOrdersInternal = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;
    
    try {
      console.log('[AuthContext] Fetching orders...');
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('[AuthContext] Fetch orders error:', ordersError);
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
      console.error('[AuthContext] Fetch orders error:', error);
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    await fetchOrdersInternal();
  }, [fetchOrdersInternal]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!session,
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
