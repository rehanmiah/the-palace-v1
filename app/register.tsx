
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';

// Validation functions
const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }
  
  // Check if name contains any numbers
  if (/\d/.test(name)) {
    return { isValid: false, error: 'Name must not contain any numbers' };
  }
  
  return { isValid: true };
};

const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

const validateUKMobile = (phone: string): { isValid: boolean; error?: string } => {
  // Remove all spaces and dashes for validation
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // UK mobile number patterns:
  // 07xxx xxxxxx (11 digits starting with 07)
  // +447xxx xxxxxx (13 digits starting with +447)
  // 00447xxx xxxxxx (14 digits starting with 00447)
  const ukMobileRegex = /^(?:(?:\+44|0044|0)7\d{9})$/;
  
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  if (!ukMobileRegex.test(cleanPhone)) {
    return { 
      isValid: false, 
      error: 'Please enter a valid UK mobile number (e.g., 07xxx xxxxxx or +447xxx xxxxxx)' 
    };
  }
  
  return { isValid: true };
};

const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*...)' };
  }
  
  return { isValid: true };
};

const validateConfirmPassword = (password: string, confirmPassword: string): { isValid: boolean; error?: string } => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true };
};

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Error states for real-time validation feedback
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Real-time validation handlers
  const handleNameBlur = () => {
    const validation = validateName(name);
    setNameError(validation.error || '');
  };

  const handleEmailBlur = () => {
    const validation = validateEmail(email);
    setEmailError(validation.error || '');
  };

  const handlePhoneBlur = () => {
    const validation = validateUKMobile(phone);
    setPhoneError(validation.error || '');
  };

  const handlePasswordBlur = () => {
    const validation = validatePassword(password);
    setPasswordError(validation.error || '');
  };

  const handleConfirmPasswordBlur = () => {
    const validation = validateConfirmPassword(password, confirmPassword);
    setConfirmPasswordError(validation.error || '');
  };

  const handleRegister = async () => {
    // Clear previous errors
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate all fields before submission
    let hasError = false;
    let firstErrorMessage = '';

    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error || '');
      if (!firstErrorMessage) {
        firstErrorMessage = nameValidation.error || 'Invalid name';
      }
      hasError = true;
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
      if (!firstErrorMessage) {
        firstErrorMessage = emailValidation.error || 'Invalid email';
      }
      hasError = true;
    }

    // Validate phone
    const phoneValidation = validateUKMobile(phone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || '');
      if (!firstErrorMessage) {
        firstErrorMessage = phoneValidation.error || 'Invalid phone number';
      }
      hasError = true;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || '');
      if (!firstErrorMessage) {
        firstErrorMessage = passwordValidation.error || 'Invalid password';
      }
      hasError = true;
    }

    // Validate confirm password
    const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);
    if (!confirmPasswordValidation.isValid) {
      setConfirmPasswordError(confirmPasswordValidation.error || '');
      if (!firstErrorMessage) {
        firstErrorMessage = confirmPasswordValidation.error || 'Passwords do not match';
      }
      hasError = true;
    }

    // Stop if there are validation errors and show the first error
    if (hasError) {
      Alert.alert('Validation Error', firstErrorMessage);
      return;
    }

    // All validations passed, proceed with registration
    try {
      await register(name, email, phone, password);
      Alert.alert(
        'Success',
        'Account created! Please check your email to verify your account before signing in.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.log('Registration error:', error);
      const errorMessage = error?.message || 'Failed to create account. Please try again.';
      Alert.alert('Registration Error', errorMessage);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <IconSymbol
          ios_icon_name="person.badge.plus.fill"
          android_material_icon_name="person-add"
          size={80}
          color={colors.primary}
        />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <View style={[styles.inputWrapper, nameError ? styles.inputWrapperError : null]}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={20}
              color={nameError ? colors.error : colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError('');
              }}
              onBlur={handleNameBlur}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputWrapper, emailError ? styles.inputWrapperError : null]}>
            <IconSymbol
              ios_icon_name="envelope.fill"
              android_material_icon_name="email"
              size={20}
              color={emailError ? colors.error : colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              onBlur={handleEmailBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number (UK Mobile)</Text>
          <View style={[styles.inputWrapper, phoneError ? styles.inputWrapperError : null]}>
            <IconSymbol
              ios_icon_name="phone.fill"
              android_material_icon_name="phone"
              size={20}
              color={phoneError ? colors.error : colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="07xxx xxxxxx or +447xxx xxxxxx"
              placeholderTextColor={colors.textSecondary}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (phoneError) setPhoneError('');
              }}
              onBlur={handlePhoneBlur}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputWrapper, passwordError ? styles.inputWrapperError : null]}>
            <IconSymbol
              ios_icon_name="lock.fill"
              android_material_icon_name="lock"
              size={20}
              color={passwordError ? colors.error : colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
                if (confirmPassword && confirmPasswordError) {
                  setConfirmPasswordError('');
                }
              }}
              onBlur={handlePasswordBlur}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <IconSymbol
                ios_icon_name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                android_material_icon_name={showPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          <Text style={styles.hintText}>
            Must be at least 8 characters with uppercase, lowercase, and special character
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputWrapper, confirmPasswordError ? styles.inputWrapperError : null]}>
            <IconSymbol
              ios_icon_name="lock.fill"
              android_material_icon_name="lock"
              size={20}
              color={confirmPasswordError ? colors.error : colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              onBlur={handleConfirmPasswordBlur}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="password-new"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <IconSymbol
                ios_icon_name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                android_material_icon_name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={styles.registerButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.back()}
        >
          <Text style={styles.loginLinkText}>
            Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputWrapperError: {
    borderColor: colors.error || '#ff4444',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    fontSize: 12,
    color: colors.error || '#ff4444',
    marginTop: 4,
    marginLeft: 4,
  },
  hintText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginLeft: 4,
  },
  registerButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    boxShadow: '0px 4px 8px rgba(37, 99, 235, 0.3)',
    elevation: 4,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLinkBold: {
    color: colors.primary,
    fontWeight: '600',
  },
});
