import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useProfessional } from '../../contexts/ProfessionalContext';
import { professionalAPI } from '../../services/api';
import { ProfessionalReviewsSection } from '../../components/ProfessionalReviewsSection';

export default function ProfessionalProfileScreen({ navigation }: any) {
  const { logout, user } = useAuth();
  const { professional } = useProfessional();
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  // Cargar datos del perfil
  useEffect(() => {
    if (professional) {
      setIsAvailable(professional.availability !== 'No disponible');
    }
  }, [professional]);

  const handleAvailabilityChange = async (newAvailability: boolean) => {
    if (!professional?.id) return;

    // Cambio inmediato en la UI para mejor experiencia
    setIsAvailable(newAvailability);
    
    try {
      const availabilityText = newAvailability ? 'Disponible' : 'No disponible';
      
      // Actualización en segundo plano sin bloquear la UI
      const response = await professionalAPI.updateAvailability(professional.id, availabilityText);
      
      if (!response.success) {
        // Solo revertir si falló, sin mostrar alert molesto
        console.log('Error actualizando disponibilidad:', response.error);
        setIsAvailable(!newAvailability);
      }
    } catch (error) {
      console.error('Error actualizando disponibilidad:', error);
      // Revertir solo en caso de error de conexión
      setIsAvailable(!newAvailability);
    }
  };

  const handleLogout = () => {
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
              // La navegación se manejará automáticamente en el RootNavigator
            } catch (error) {
              Alert.alert('Error', 'Error al cerrar sesión');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header title="Mi Perfil" />

        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Ionicons name="person-circle" size={80} color={theme.colors.primary} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{professional?.name || 'Cargando...'}</Text>
              <Text style={styles.profileSpecialty}>{professional?.specialty || 'Especialidad'}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={theme.colors.warning} />
                <Text style={styles.ratingText}>
                  {professional?.rating && professional.rating > 0 ? `${professional.rating.toFixed(1)} (${professional.totalReviews || 0} reseñas)` : 'Sin calificaciones'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.availabilityContainer}>
            <View style={styles.availabilityInfo}>
              <Text style={styles.availabilityTitle}>Disponibilidad</Text>
              <Text style={styles.availabilitySubtitle}>
                {isAvailable ? 'Disponible para trabajos' : 'No disponible'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={handleAvailabilityChange}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
              thumbColor={isAvailable ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{professional?.totalReviews || 0}</Text>
              <Text style={styles.statTitle}>Trabajos Completados</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{professional?.rating && professional.rating > 0 ? professional.rating.toFixed(1) : '0.0'}</Text>
              <Text style={styles.statTitle}>Calificación</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>$0</Text>
              <Text style={styles.statTitle}>Ingresos Totales</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{professional?.totalReviews || 0}</Text>
              <Text style={styles.statTitle}>Clientes Satisfechos</Text>
            </View>
          </View>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Información de Contacto</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.contactText}>{professional?.email || 'No disponible'}</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.contactText}>{professional?.phone || 'No disponible'}</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.contactText}>{professional?.location || 'No disponible'}</Text>
          </View>
        </View>

        {/* Sección de Valoraciones */}
        {professional?.id && (
          <ProfessionalReviewsSection professionalId={professional.id} />
        )}

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
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

  profileSection: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  profileInfo: {
    flex: 1,
    marginLeft: theme.spacing.lg,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  profileSpecialty: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  availabilityInfo: {
    flex: 1,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  availabilitySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statsSection: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  contactSection: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  contactText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  actionsSection: {
    padding: theme.spacing.lg,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary + '10',
    marginBottom: theme.spacing.md,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.secondary + '10',
    marginBottom: theme.spacing.md,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.secondary,
    marginLeft: theme.spacing.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.error + '10',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
});
