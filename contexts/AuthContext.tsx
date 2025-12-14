
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hashPassword, verifyPassword } from '@/utils/passwordUtils';
import * as Network from 'expo-network';
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

// Generate a UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const checkNetworkConnection = async (): Promise<boolean> => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return networkState.isConnected === true && networkState.isInternetReachable === true;
    } catch (error) {
      console.error('Network check error:', error);
      return true; // Assume connected if check fails
    }
  };

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
      
      // Check network connectivity
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      
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
      console.log('[AuthContext] Starting registration process...');
      console.log('[AuthContext] User data:', { name, email, phone });
      
      // Validate inputs before proceeding
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
      
      // Check network connectivity first
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      
      console.log('[AuthContext] Network check passed');
      
      // Sanitize inputs
      const sanitizedName = name.trim();
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPhone = phone.trim();
      
      console.log('[AuthContext] Inputs sanitized');
      
      // Check if email already exists with better error handling
      let existingUsers;
      let checkError;
      
      try {
        console.log('[AuthContext] Checking if email exists...');
        const result = await supabase
          .from('users')
          .select('id')
          .eq('email', sanitizedEmail)
          .limit(1);
        
        existingUsers = result.data;
        checkError = result.error;
        console.log('[AuthContext] Email check completed');
      } catch (dbError: any) {
        console.error('[AuthContext] Database connection error:', dbError);
        
        // Check if it's a network/connection error
        if (dbError.message?.includes('fetch') || 
            dbError.message?.includes('network') || 
            dbError.message?.includes('Failed to fetch') ||
            dbError.code === 'PGRST301') {
          throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
        }
        
        throw new Error('Database error: ' + (dbError.message || 'Unknown error occurred'));
      }

      // Handle database query errors
      if (checkError) {
        console.error('[AuthContext] Email check error details:', checkError);
        
        // Check for specific error types
        if (checkError.code === 'PGRST116') {
          // Table doesn't exist or permission denied
          throw new Error('Database configuration error. Please contact support.');
        } else if (checkError.message?.includes('JWT')) {
          // Authentication/authorization error
          throw new Error('Authentication error. Please try again.');
        } else if (checkError.message?.includes('network') || checkError.message?.includes('fetch')) {
          // Network error
          throw new Error('Network error. Please check your connection and try again.');
        }
        
        // Generic database error
        throw new Error('Unable to verify email availability: ' + checkError.message);
      }

      // Check if email is already taken
      if (existingUsers && existingUsers.length > 0) {
        throw new Error('An account with this email already exists');
      }

      console.log('[AuthContext] Email is available');

      // Hash password using bcrypt - with explicit error handling
      console.log('[AuthContext] Starting password hashing...');
      let passwordHash: string;
      try {
        // Test if hashPassword function is available
        if (typeof hashPassword !== 'function') {
          console.error('[AuthContext] hashPassword is not a function!');
          throw new Error('Password hashing function not available');
        }
        
        console.log('[AuthContext] Calling hashPassword function...');
        passwordHash = await hashPassword(password);
        console.log('[AuthContext] Password hashed successfully, hash length:', passwordHash?.length);
        
        // Verify the hash was created properly
        if (!passwordHash || typeof passwordHash !== 'string' || passwordHash.length === 0) {
          console.error('[AuthContext] Invalid password hash generated');
          throw new Error('Invalid password hash generated');
        }
        
        console.log('[AuthContext] Password hash validated');
      } catch (hashError: any) {
        console.error('[AuthContext] Password hashing error:', hashError);
        console.error('[AuthContext] Error type:', typeof hashError);
        console.error('[AuthContext] Error name:', hashError?.name);
        console.error('[AuthContext] Error message:', hashError?.message);
        console.error('[AuthContext] Error stack:', hashError?.stack);
        
        // Provide more specific error message
        if (hashError.message?.includes('not available') || hashError.message?.includes('not a function')) {
          throw new Error('Password encryption service is not available. Please restart the app and try again.');
        }
        
        throw new Error('Failed to process password. Please try again.');
      }

      // Generate a UUID for the new user
      const userId = generateUUID();
      console.log('[AuthContext] Generated user ID:', userId);

      // Create user profile in users table
      console.log('[AuthContext] Creating user in database...');
      
      const newUserData = {
        id: userId,
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        password_hash: passwordHash,
        email_verified: false,
        phone_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('[AuthContext] User data prepared (password_hash redacted)');
      
      let insertResult;
      try {
        console.log('[AuthContext] Inserting user into database...');
        insertResult = await supabase
          .from('users')
          .insert(newUserData)
          .select()
          .single();
        console.log('[AuthContext] Database insert completed');
      } catch (insertException: any) {
        console.error('[AuthContext] Insert exception:', insertException);
        throw new Error('Database insert failed: ' + (insertException.message || 'Unknown error'));
      }

      const { data: newUser, error: insertError } = insertResult;

      if (insertError) {
        console.error('[AuthContext] Registration error:', insertError);
        console.error('[AuthContext] Error code:', insertError.code);
        console.error('[AuthContext] Error details:', insertError.details);
        console.error('[AuthContext] Error hint:', insertError.hint);
        console.error('[AuthContext] Error message:', insertError.message);
        
        // Handle specific insert errors
        if (insertError.code === '23505') {
          // Unique constraint violation
          throw new Error('An account with this email already exists');
        } else if (insertError.code === '23503') {
          // Foreign key constraint violation
          throw new Error('Database constraint error. Please contact support.');
        } else if (insertError.code === '42501') {
          // Insufficient privilege
          throw new Error('Permission denied. Please contact support.');
        } else if (insertError.message?.includes('network') || insertError.message?.includes('fetch')) {
          throw new Error('Network error during registration. Please try again.');
        } else if (insertError.message?.includes('JWT')) {
          throw new Error('Authentication error. Please try again.');
        }
        
        throw new Error(insertError.message || 'Failed to create account');
      }

      if (!newUser) {
        throw new Error('Failed to create user account. Please try again.');
      }

      console.log('[AuthContext] User created successfully:', newUser.id);

      // Show success message
      Alert.alert(
        'Registration Successful!',
        'Your account has been created successfully!\n\n' +
        'You can now sign in with your email and password.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('[AuthContext] Registration error:', error);
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
