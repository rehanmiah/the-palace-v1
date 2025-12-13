
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// MoneySavingExpert inspired color palette
export const colors = {
  background: '#FFFFFF',           // Pure white background
  backgroundSecondary: '#F5F5F5',  // Light gray for subtle backgrounds
  text: '#000000',                 // Black text
  textSecondary: '#666666',        // Medium gray for secondary text
  textTertiary: '#999999',         // Light gray for tertiary text
  primary: '#DC241F',              // MSE Red
  primaryLight: '#FF3B30',         // Lighter red for hover states
  secondary: '#007AFF',            // iOS Blue
  accent: '#FFD700',               // Gold for highlights
  card: '#FFFFFF',                 // White cards
  highlight: '#FFF9E6',            // Light yellow for highlights
  border: '#E5E5E5',               // Light border
  divider: '#DDDDDD',              // Divider lines
  error: '#FF3B30',                // Error red
  success: '#34C759',              // Success green
  warning: '#FF9500',              // Warning orange
  tabBarBackground: '#FFFFFF',     // White tab bar
  tabBarBorder: '#E5E5E5',         // Tab bar border
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 4px rgba(220, 36, 31, 0.2)',
    elevation: 2,
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 4px rgba(0, 122, 255, 0.2)',
    elevation: 2,
  },
  outline: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'left',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSmall: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.08)',
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardWithAccent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  searchBar: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 12,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  link: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
