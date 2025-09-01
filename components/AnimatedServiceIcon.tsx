import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedServiceIconProps {
  type: string;
  size?: number;
}

export const AnimatedServiceIcon: React.FC<AnimatedServiceIconProps> = ({ 
  type, 
  size = 50 
}) => {
  const getIconConfig = () => {
    switch (type) {
      case 'albanileria':
        return {
          icon: 'construct',
          gradient: ['#60a5fa', '#3b82f6'],
          iconColor: '#ffffff',
          shadowColor: '#3b82f6',
          secondaryIcon: 'car-outline',
          secondaryColor: '#fbbf24'
        };
      case 'mudanzas':
        return {
          icon: 'car',
          gradient: ['#f87171', '#ef4444'],
          iconColor: '#ffffff',
          shadowColor: '#ef4444',
          secondaryIcon: 'cube-outline',
          secondaryColor: '#ffffff'
        };
      case 'tecnico':
        return {
          icon: 'settings',
          gradient: ['#34d399', '#10b981'],
          iconColor: '#ffffff',
          shadowColor: '#10b981',
          secondaryIcon: 'wrench-outline',
          secondaryColor: '#fbbf24'
        };
      case 'plomeria':
        return {
          icon: 'water',
          gradient: ['#a78bfa', '#8b5cf6'],
          iconColor: '#ffffff',
          shadowColor: '#8b5cf6',
          secondaryIcon: 'droplet-outline',
          secondaryColor: '#60a5fa'
        };
      case 'gas':
        return {
          icon: 'flame',
          gradient: ['#fbbf24', '#f59e0b'],
          iconColor: '#ffffff',
          shadowColor: '#f59e0b',
          secondaryIcon: 'flash-outline',
          secondaryColor: '#ffffff'
        };
      case 'limpieza':
        return {
          icon: 'sparkles',
          gradient: ['#10b981', '#059669'],
          iconColor: '#ffffff',
          shadowColor: '#059669',
          secondaryIcon: 'brush-outline',
          secondaryColor: '#fbbf24'
        };
      case 'electricidad':
        return {
          icon: 'flash',
          gradient: ['#f472b6', '#ec4899'],
          iconColor: '#ffffff',
          shadowColor: '#ec4899',
          secondaryIcon: 'bulb-outline',
          secondaryColor: '#fbbf24'
        };
      case 'carpinteria':
        return {
          icon: 'hammer',
          gradient: ['#d97706', '#b45309'],
          iconColor: '#ffffff',
          shadowColor: '#b45309',
          secondaryIcon: 'cut-outline',
          secondaryColor: '#ffffff'
        };
      case 'ver-todos':
        return {
          icon: 'grid',
          gradient: ['#9ca3af', '#6b7280'],
          iconColor: '#ffffff',
          shadowColor: '#6b7280',
          secondaryIcon: 'ellipsis-horizontal',
          secondaryColor: '#fbbf24'
        };
      default:
        return {
          icon: 'help-circle',
          gradient: ['#9ca3af', '#6b7280'],
          iconColor: '#ffffff',
          shadowColor: '#6b7280',
          secondaryIcon: 'question-mark',
          secondaryColor: '#fbbf24'
        };
    }
  };

  const config = getIconConfig();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LinearGradient
        colors={config.gradient as [string, string]}
        style={[
          styles.iconContainer,
          { 
            width: size, 
            height: size,
            shadowColor: config.shadowColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }
        ]}
      >
        {/* Icono principal */}
        <Ionicons 
          name={config.icon as any} 
          size={size * 0.4} 
          color={config.iconColor} 
          style={styles.mainIcon}
        />
        
        {/* Icono secundario pequeño */}
        <View style={styles.secondaryIconContainer}>
          <Ionicons 
            name={config.secondaryIcon as any} 
            size={size * 0.2} 
            color={config.secondaryColor} 
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  mainIcon: {
    zIndex: 2,
  },
  secondaryIconContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});
