import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

interface HeaderProps {
  title: string;
  showLogo?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    text: string;
    onPress: () => void;
  };
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  showLogo = true,
  showBackButton = false,
  onBackPress,
  rightAction
}) => {
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
          <Text style={styles.actionButtonText}>{rightAction.text}</Text>
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

  return (
    <View style={styles.header}>
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
    paddingTop: theme.spacing.xl + 40,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    minHeight: 80,
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logo: {
    width: 45,
    height: 45,
    borderRadius: 10,
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
