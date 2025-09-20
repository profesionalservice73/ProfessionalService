import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { clientAPI } from '../../services/api';

const menuItems = [
  {
    id: '1',
    title: 'Ayuda y Soporte',
    icon: 'help-circle-outline',
    action: 'help',
  },
  {
    id: '2',
    title: 'Acerca de',
    icon: 'information-circle-outline',
    action: 'about',
  },
];

const MenuItem = ({ item, onPress }: { item: any; onPress: (action: string) => void }) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={() => onPress(item.action)}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={item.icon as any} size={20} color={theme.colors.primary} />
        </View>
        <Text style={styles.menuItemTitle}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
};

export default function ProfileScreen({ navigation }: any) {
  const { logout, user } = useAuth();

  const handleMenuPress = (action: string) => {
    console.log('Menu action:', action);
    
    switch (action) {
      case 'help':
        Alert.alert(
          'Ayuda y Soporte',
          '¿Necesitas ayuda? Contáctanos por correo electrónico:\n\nprofesionalservice73@gmail.com',
          [
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
        break;
        
      case 'about':
        Alert.alert(
          'Acerca de Professional Service',
          'Professional Service es una plataforma que conecta clientes con profesionales certificados en hogar, industria y comercio.\n\nPara soporte técnico o consultas, contáctanos en:\n\nprofesionalservice73@gmail.com',
          [
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
        break;
        
      default:
        console.log('Acción no reconocida:', action);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // La navegación se manejará automáticamente en el RootNavigator
            } catch (error) {
              Alert.alert('Error', 'Error al cerrar sesión');
            }
          },
        },
      ]
    );
  };

  // Usar datos reales del usuario
  const userData = {
    name: user?.fullName || 'Usuario',
    email: user?.email || 'usuario@email.com',
    phone: user?.phone || 'Sin teléfono',
    avatar: undefined,
    userType: user?.userType || 'client',
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long' 
    }) : 'Reciente',
    totalRequests: 0, // Esto se podría cargar desde el backend si es necesario
    completedRequests: 0,
    rating: 0,
    reviews: 0,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Header 
          title="Mi Perfil" 
          rightAction={{
            icon: 'settings-outline',
            onPress: () => navigation.navigate('ClientSettings')
          }}
        />
        
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.profileHeader}
        >
          <View style={styles.avatarContainer}>
            {userData.avatar ? (
              <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Ionicons name="person" size={40} color={theme.colors.white} />
              </View>
            )}
            <View style={styles.userTypeBadge}>
              <Ionicons
                name={userData.userType === 'professional' ? 'briefcase' : 'person'}
                size={12}
                color={theme.colors.white}
              />
            </View>
          </View>
          
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          <Text style={styles.userPhone}>{userData.phone}</Text>
          <Text style={styles.userJoinDate}>Miembro desde {userData.joinDate}</Text>
          
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.totalRequests}</Text>
              <Text style={styles.statLabel}>Solicitudes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.completedRequests}</Text>
              <Text style={styles.statLabel}>Completadas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.rating}</Text>
              <Text style={styles.statLabel}>Calificación</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <MenuItem key={item.id} item={item} onPress={handleMenuPress} />
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Professional Service v1.0.0</Text>
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
  profileHeader: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.full,
    borderWidth: 4,
    borderColor: theme.colors.white,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.full,
    borderWidth: 4,
    borderColor: theme.colors.white,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userTypeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.full,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: theme.spacing.xs,
  },
  userPhone: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.8,
    marginBottom: theme.spacing.xs,
  },
  userJoinDate: {
    fontSize: 12,
    color: theme.colors.white,
    opacity: 0.7,
    marginBottom: theme.spacing.lg,
  },
  userStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.white,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: theme.spacing.sm,
  },
  menuContainer: {
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuItemTitle: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  logoutContainer: {
    padding: theme.spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  versionText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
