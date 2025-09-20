import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../config/theme';

interface NotificationBadgeProps {
  count: number;
  visible?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  visible = true, 
  size = 'small' 
}) => {
  if (!visible || count <= 0) {
    return null;
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          text: styles.smallText,
        };
      case 'medium':
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          text: styles.largeText,
        };
      default:
        return {
          container: styles.smallContainer,
          text: styles.smallText,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <View style={[styles.badge, sizeStyles.container]}>
      <Text style={[styles.badgeText, sizeStyles.text]}>
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
    zIndex: 1000,
  },
  badgeText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Tamaños
  smallContainer: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
  },
  smallText: {
    fontSize: 10,
  },
  mediumContainer: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeContainer: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
  },
  largeText: {
    fontSize: 14,
  },
});