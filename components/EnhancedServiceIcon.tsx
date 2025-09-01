import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface EnhancedServiceIconProps {
  type: string;
  size?: number;
}

export const EnhancedServiceIcon: React.FC<EnhancedServiceIconProps> = ({ 
  type, 
  size = 60
}) => {
  const getIconConfig = () => {
    switch (type) {
      case 'plomeria':
        return {
          icon: 'water-outline',
          gradient: ['#60a5fa', '#3b82f6', '#1d4ed8'],
          iconColor: '#ffffff',
          shadowColor: '#3b82f6',
          accentColor: '#dbeafe'
        };
      case 'gas':
        return {
          icon: 'flame-outline',
          gradient: ['#fb923c', '#f97316', '#ea580c'],
          iconColor: '#ffffff',
          shadowColor: '#f97316',
          accentColor: '#fed7aa'
        };
      case 'electricidad':
        return {
          icon: 'flash-outline',
          gradient: ['#f87171', '#ef4444', '#dc2626'],
          iconColor: '#ffffff',
          shadowColor: '#ef4444',
          accentColor: '#fecaca'
        };
      case 'albanileria':
        return {
          icon: 'construct-outline',
          gradient: ['#fbbf24', '#f59e0b', '#d97706'],
          iconColor: '#ffffff',
          shadowColor: '#f59e0b',
          accentColor: '#fef3c7'
        };
      case 'carpinteria':
        return {
          icon: 'hammer-outline',
          gradient: ['#a16207', '#8b4513', '#78350f'],
          iconColor: '#ffffff',
          shadowColor: '#8b4513',
          accentColor: '#fef3c7'
        };
      case 'herreria':
        return {
          icon: 'hardware-chip-outline',
          gradient: ['#94a3b8', '#64748b', '#475569'],
          iconColor: '#ffffff',
          shadowColor: '#64748b',
          accentColor: '#f1f5f9'
        };
      case 'limpieza':
        return {
          icon: 'sparkles-outline',
          gradient: ['#34d399', '#10b981', '#059669'],
          iconColor: '#ffffff',
          shadowColor: '#10b981',
          accentColor: '#d1fae5'
        };
      case 'mecanica':
        return {
          icon: 'car-outline',
          gradient: ['#475569', '#334155', '#1e293b'],
          iconColor: '#ffffff',
          shadowColor: '#1e293b',
          accentColor: '#e2e8f0'
        };
      case 'aire_acondicionado':
        return {
          icon: 'thermometer-outline',
          gradient: ['#38bdf8', '#0ea5e9', '#0284c7'],
          iconColor: '#ffffff',
          shadowColor: '#0ea5e9',
          accentColor: '#bae6fd'
        };
      case 'tecnico_comp_redes':
        return {
          icon: 'laptop-outline',
          gradient: ['#a78bfa', '#8b5cf6', '#7c3aed'],
          iconColor: '#ffffff',
          shadowColor: '#8b5cf6',
          accentColor: '#e9d5ff'
        };
      case 'cerrajeria':
        return {
          icon: 'key-outline',
          gradient: ['#c084fc', '#a855f7', '#9333ea'],
          iconColor: '#ffffff',
          shadowColor: '#a855f7',
          accentColor: '#f3e8ff'
        };
      default:
        return {
          icon: 'help-circle-outline',
          gradient: ['#9ca3af', '#6b7280', '#4b5563'],
          iconColor: '#ffffff',
          shadowColor: '#6b7280',
          accentColor: '#f9fafb'
        };
    }
  };

  const config = getIconConfig();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LinearGradient
        colors={config.gradient as [string, string, string]}
        style={[
          styles.iconContainer,
          { 
            width: size, 
            height: size,
            shadowColor: config.shadowColor,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 12,
          }
        ]}
      >
        {/* Fondo decorativo */}
        <View style={[styles.accentBackground, { backgroundColor: config.accentColor }]} />
        
        {/* Icono principal */}
        <Ionicons 
          name={config.icon as any} 
          size={size * 0.5} 
          color={config.iconColor} 
          style={styles.mainIcon}
        />

        {/* Elemento decorativo adicional */}
        <View style={[styles.decorativeElement, { backgroundColor: config.accentColor }]} />
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
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  accentBackground: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 30,
    height: 30,
    borderRadius: 15,
    opacity: 0.3,
  },
  mainIcon: {
    zIndex: 2,
  },
  decorativeElement: {
    position: 'absolute',
    bottom: -5,
    left: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.4,
  },
});
