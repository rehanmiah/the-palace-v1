
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
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
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryAddress: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    // Check if user is logged in (in real app, check AsyncStorage or Supabase session)
    const checkAuth = async () => {
      // Mock: Simulate checking stored session
      console.log('Checking authentication status...');
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Logging in with:', email);
      
      // TODO: Replace with actual Supabase auth
      // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      // Mock login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: email,
        phone: '+1234567890',
        emailVerified: true,
        phoneVerified: true,
        createdAt: new Date().toISOString(),
      };
      
      setUser(mockUser);
      
      // Load user's payment methods and orders
      await fetchPaymentMethods();
      await fetchOrders();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, phone: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Registering user:', { name, email, phone });
      
      // TODO: Replace with actual Supabase auth
      // const { data, error } = await supabase.auth.signUp({
      //   email,
      //   password,
      //   options: {
      //     data: { name, phone }
      //   }
      // });
      
      // Also register phone number
      // await supabase.auth.signUp({
      //   phone,
      //   password,
      //   options: { channel: 'sms' }
      // });
      
      // Mock registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        name,
        email,
        phone,
        emailVerified: false,
        phoneVerified: false,
        createdAt: new Date().toISOString(),
      };
      
      setUser(mockUser);
      
      // In real app, verification emails/SMS would be sent automatically
      console.log('Verification email sent to:', email);
      console.log('Verification SMS sent to:', phone);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Logging out...');
      
      // TODO: Replace with actual Supabase auth
      // await supabase.auth.signOut();
      
      await new Promise(resolve => setTimeout(resolve, 500));
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
    setIsLoading(true);
    try {
      console.log('Updating profile:', updates);
      
      // TODO: Replace with actual Supabase auth
      // if (updates.email) {
      //   await supabase.auth.updateUser({ email: updates.email });
      // }
      // if (updates.phone) {
      //   await supabase.auth.updateUser({ phone: updates.phone });
      // }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(prev => {
        if (!prev) return null;
        
        const updated = { ...prev, ...updates };
        
        // If email or phone changed, mark as unverified
        if (updates.email && updates.email !== prev.email) {
          updated.emailVerified = false;
          console.log('Verification email sent to:', updates.email);
        }
        if (updates.phone && updates.phone !== prev.phone) {
          updated.phoneVerified = false;
          console.log('Verification SMS sent to:', updates.phone);
        }
        
        return updated;
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendEmailVerification = useCallback(async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      console.log('Resending email verification to:', user.email);
      
      // TODO: Replace with actual Supabase auth
      // await supabase.auth.resend({
      //   type: 'signup',
      //   email: user.email
      // });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Verification email sent!');
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
      
      // TODO: Replace with actual Supabase auth
      // await supabase.auth.resend({
      //   type: 'sms',
      //   phone: user.phone
      // });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Verification SMS sent!');
    } catch (error) {
      console.error('Resend phone verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      console.log('Fetching payment methods...');
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock payment methods
      const mockMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'card',
          last4: '4242',
          brand: 'Visa',
          expiryMonth: '12',
          expiryYear: '25',
          isDefault: true,
          holderName: 'John Doe',
        },
      ];
      
      setPaymentMethods(mockMethods);
    } catch (error) {
      console.error('Fetch payment methods error:', error);
    }
  }, []);

  const addPaymentMethod = useCallback(async (method: Omit<PaymentMethod, 'id'>) => {
    setIsLoading(true);
    try {
      console.log('Adding payment method:', method);
      
      // TODO: Replace with actual API call (Stripe, etc.)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMethod: PaymentMethod = {
        ...method,
        id: Date.now().toString(),
      };
      
      setPaymentMethods(prev => {
        // If this is set as default, unset others
        if (newMethod.isDefault) {
          return [...prev.map(m => ({ ...m, isDefault: false })), newMethod];
        }
        return [...prev, newMethod];
      });
    } catch (error) {
      console.error('Add payment method error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removePaymentMethod = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      console.log('Removing payment method:', id);
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPaymentMethods(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Remove payment method error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setDefaultPaymentMethod = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      console.log('Setting default payment method:', id);
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPaymentMethods(prev =>
        prev.map(m => ({ ...m, isDefault: m.id === id }))
      );
    } catch (error) {
      console.error('Set default payment method error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      console.log('Fetching orders...');
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock orders
      const mockOrders: Order[] = [
        {
          id: '1',
          restaurantName: 'The Palace',
          items: [
            { name: 'Chicken Tikka Masala', quantity: 2, price: 12.99 },
            { name: 'Garlic Naan', quantity: 3, price: 2.99 },
          ],
          total: 34.95,
          status: 'delivered',
          orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          deliveryAddress: '123 Main St, Apt 4B',
        },
        {
          id: '2',
          restaurantName: 'The Palace',
          items: [
            { name: 'Lamb Biryani', quantity: 1, price: 14.99 },
            { name: 'Samosa', quantity: 4, price: 3.99 },
          ],
          total: 30.95,
          status: 'delivered',
          orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          deliveryAddress: '123 Main St, Apt 4B',
        },
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Fetch orders error:', error);
    }
  }, []);

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
