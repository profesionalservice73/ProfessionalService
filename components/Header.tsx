import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../config/theme';

interface HeaderProps {
  title: string;
  showLogo?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    text?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
  useSafeArea?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  showLogo = true,
  showBackButton = false,
  onBackPress,
  rightAction,
  useSafeArea = true
}) => {
  const insets = useSafeAreaInsets();
  // Lógica inteligente para determinar qué mostrar en cada sección
  const renderLeftSection = () => {
    if (showBackButton) {
      return (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      );
    }
    
    if (showLogo) {
      return (
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      );
    }
    
    return null;
  };

  const renderRightSection = () => {
    // Prioridad 1: Botón de acción (si existe)
    if (rightAction) {
      return (
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={rightAction.onPress}
        >
          {rightAction.icon ? (
            <Ionicons name={rightAction.icon} size={24} color={theme.colors.primary} />
          ) : (
            <Text style={styles.actionButtonText}>{rightAction.text}</Text>
          )}
        </TouchableOpacity>
      );
    }
    
    // Prioridad 2: Logo en la derecha (solo si hay backButton y showLogo)
    if (showBackButton && showLogo) {
      return (
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      );
    }
    
    // Prioridad 3: Nada en la derecha
    return null;
  };

  const headerStyle = useSafeArea 
    ? [styles.header, { paddingTop: insets.top + theme.spacing.md }]
    : styles.header;

  return (
    <View style={headerStyle}>
      <View style={styles.leftSection}>
        {renderLeftSection()}
      </View>

      <View style={styles.centerSection}>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.rightSection}>
        {renderRightSection()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    minHeight: 60,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: theme.spacing.sm,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  actionButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
