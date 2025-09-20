import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigate' | 'action';
  value?: boolean;
  onPress?: () => void;
}

export default function ClientSettingsScreen({ navigation }: any) {
  const { logout } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    mobileNotifications: true,
    locationServices: true,
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'about':
        navigation.navigate('ClientAbout');
        break;
      case 'contact':
        navigation.navigate('ClientCustomerSupport');
        break;
      case 'logout':
        Alert.alert(
          'Cerrar Sesión',
          '¿Estás seguro de que quieres cerrar sesión?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Cerrar Sesión', 
              style: 'destructive',
              onPress: async () => {
                try {
                  await logout();
                } catch (error) {
                  Alert.alert('Error', 'No se pudo cerrar sesión');
                }
              }
            }
          ]
        );
        break;
    }
  };

  const settingsItems: SettingsItem[] = [
    {
      id: 'notifications',
      title: 'Notificaciones',
      subtitle: 'Recibir notificaciones de nuevas respuestas',
      icon: 'notifications-outline',
      type: 'toggle',
      value: settings.notifications,
      onPress: () => handleToggle('notifications'),
    },
    {
      id: 'email',
      title: 'Notificaciones por Email',
      subtitle: 'Recibir notificaciones por correo electrónico',
      icon: 'mail-outline',
      type: 'toggle',
      value: settings.emailNotifications,
      onPress: () => handleToggle('emailNotifications'),
    },
    {
      id: 'mobile',
      title: 'Notificaciones Móviles',
      subtitle: 'Recibir notificaciones push en el móvil',
      icon: 'phone-portrait-outline',
      type: 'toggle',
      value: settings.mobileNotifications,
      onPress: () => handleToggle('mobileNotifications'),
    },
    {
      id: 'location',
      title: 'Servicios de Ubicación',
      subtitle: 'Permitir acceso a tu ubicación para servicios cercanos',
      icon: 'location-outline',
      type: 'toggle',
      value: settings.locationServices,
      onPress: () => handleToggle('locationServices'),
    },
    {
      id: 'about',
      title: 'Acerca de',
      subtitle: 'Información de la aplicación',
      icon: 'information-circle-outline',
      type: 'action',
      onPress: () => handleAction('about'),
    },
    {
      id: 'contact',
      title: 'Contacto',
      subtitle: 'Soporte y ayuda',
      icon: 'headset-outline',
      type: 'action',
      onPress: () => handleAction('contact'),
    },
    {
      id: 'logout',
      title: 'Cerrar Sesión',
      subtitle: 'Salir de tu cuenta',
      icon: 'log-out-outline',
      type: 'action',
      onPress: () => handleAction('logout'),
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingsItem}
        onPress={item.onPress}
      >
        <View style={styles.settingsItemLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon as any} size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.settingsTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingsSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.settingsItemRight}>
          {item.type === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onPress}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={item.value ? theme.colors.white : theme.colors.textSecondary}
            />
          ) : (
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Configuraciones" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          {settingsItems.slice(0, 4).map(renderSettingsItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          {settingsItems.slice(4, 6).map(renderSettingsItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          {settingsItems.slice(6).map(renderSettingsItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  settingsItemRight: {
    marginLeft: theme.spacing.md,
  },
});
