import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { useProfessional } from '../../contexts/ProfessionalContext';
import { useIsFocused } from '@react-navigation/native';
import { professionalAPI } from '../../services/api';
import { formatDateForDisplay } from '../../utils/dateUtils';

// Estados para datos reales
interface DashboardData {
  stats: {
    totalRequests: number;
    completedRequests: number;
    rating: number;
  };
  recentRequests: any[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return theme.colors.warning;
    case 'accepted':
      return theme.colors.primary;
    case 'in_progress':
      return theme.colors.primary;
    case 'completed':
      return theme.colors.success;
    case 'awaiting_rating':
      return theme.colors.primary;
    case 'closed':
      return theme.colors.success;
    case 'cancelled':
      return theme.colors.error;
    default:
      return theme.colors.textSecondary;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'accepted':
      return 'Aceptada';
    case 'in_progress':
      return 'En Progreso';
    case 'completed':
      return 'Completada';
    case 'awaiting_rating':
      return 'Esperando Calificación';
    case 'closed':
      return 'Cerrada';
    case 'cancelled':
      return 'Cancelada';
    default:
      return 'Desconocido';
  }
};

const StatCard = ({ stat }: { stat: any }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
      <Ionicons name={stat.icon as any} size={24} color={stat.color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statTitle}>{stat.title}</Text>
      <Text style={[styles.statChange, { color: stat.color }]}>
        {stat.change}
      </Text>
    </View>
  </View>
);

const RequestCard = ({ request }: { request: any }) => (
  <View style={styles.requestCard}>
    <View style={styles.requestHeader}>
      <Text style={styles.requestTitle}>{request.title}</Text>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
        <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
      </View>
    </View>
    
    <View style={styles.requestDetails}>
      <View style={styles.detailItem}>
        <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>{request.client}</Text>
      </View>
      <View style={styles.detailItem}>
        <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>
          {typeof request.location === 'object' && request.location?.address 
            ? request.location.address 
            : request.location || 'Ubicación no disponible'}
        </Text>
      </View>
      <View style={styles.detailItem}>
        <Ionicons name="cash-outline" size={16} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>{request.budget}</Text>
      </View>
    </View>
    
    <Text style={styles.requestDate}>{request.date}</Text>
  </View>
);

export default function ProfessionalHomeScreen({ navigation }: any) {
  const { professional, isRegistrationComplete, loading } = useProfessional();
  const isFocused = useIsFocused();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      totalRequests: 0,
      completedRequests: 0,
      rating: 0,
    },
    recentRequests: [],
  });
  const [loadingData, setLoadingData] = useState(false);

  // Verificar si el profesional ha completado su registro
  useEffect(() => {
    if (!loading && !isRegistrationComplete) {
      console.log('ProfessionalHomeScreen - Usuario no ha completado registro');
      // Ya no redirigimos, solo mostramos el mensaje en la UI
    }
  }, [loading, isRegistrationComplete, navigation]);

  // Recargar cuando el profesional cambie (al volver a entrar a la app)
  useEffect(() => {
    if (professional?.id && isFocused) {
      loadDashboardData();
    }
  }, [professional?.id, isFocused]);

  const loadDashboardData = async () => {
    if (!professional?.id) {
      console.log('No professional ID available, skipping dashboard load');
      return;
    }

    try {
      console.log('Loading dashboard data for professional:', professional.id);
      setLoadingData(true);
      
      // Cargar datos del dashboard
      const dashboardResponse = await professionalAPI.getHome(professional.id);
      // Cargar solicitudes recientes de la categoría del profesional
      const requestsResponse = await professionalAPI.getRequests(professional.id);

      if (dashboardResponse.success && dashboardResponse.data) {
        const profRating = dashboardResponse.data.professional?.rating || 0;
        const stats = {
          ...dashboardResponse.data.stats,
          rating: profRating,
        };

        const recentRequests = (requestsResponse.success && Array.isArray(requestsResponse.data))
          ? requestsResponse.data.slice(0, 5).map((r: any) => ({
              _id: r._id,
              title: r.title,
              status: r.status,
              client: r.clientId?.fullName || 'Cliente',
              location: r.location,
              budget: r.budget,
              date: formatDateForDisplay(r.createdAt),
            }))
          : [];

        setDashboardData({
          stats,
          recentRequests,
        });
        console.log('Dashboard data loaded successfully:', recentRequests.length, 'recent requests');
      } else {
        console.log('Dashboard API response failed:', dashboardResponse);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleViewAllRequests = () => {
    console.log('View all requests');
    navigation.navigate('Requests');
  };

  // Renderizado condicional después de que todos los hooks se hayan ejecutado
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Dashboard" showBackButton={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Si no ha completado el registro, mostrar mensaje
  if (!isRegistrationComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Dashboard" showBackButton={false} />
        <View style={styles.incompleteContainer}>
          <Ionicons name="person-circle-outline" size={80} color={theme.colors.primary} />
          <Text style={styles.incompleteTitle}>Perfil Incompleto</Text>
          <Text style={styles.incompleteText}>
            Necesitas completar tu perfil profesional para acceder al dashboard.
          </Text>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.completeButtonText}>Completar Perfil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Si no hay datos del profesional, mostrar error
  if (!professional) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Dashboard" showBackButton={false} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Error al Cargar Perfil</Text>
          <Text style={styles.errorText}>
            No se pudieron cargar los datos de tu perfil profesional.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.retryButtonText}>Completar Perfil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con logo */}
        <Header 
          title="Dashboard" 
          rightAction={{
            icon: 'settings-outline',
            onPress: () => navigation.navigate('Settings')
          }}
        />
        
        {/* Header con gradiente */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>¡Hola, {professional?.name || 'Profesional'}!</Text>
              <Text style={styles.subtitle}>Bienvenido de vuelta</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle" size={40} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {loadingData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : (
          <>
            {/* Stats (3 cards ocupan ancho completo) */}
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Resumen del Mes</Text>
              <View style={styles.statsRow}>
                <StatCard 
                  stat={{
                    id: '1',
                    title: 'Solicitudes',
                    value: (dashboardData.stats.totalRequests || 0).toString(),
                    icon: 'document-text-outline',
                    color: '#3b82f6',
                    change: '+0',
                  }}
                />
                <StatCard 
                  stat={{
                    id: '2',
                    title: 'Completadas',
                    value: (dashboardData.stats.completedRequests || 0).toString(),
                    icon: 'checkmark-circle-outline',
                    color: '#10b981',
                    change: '+0',
                  }}
                />
                <StatCard 
                  stat={{
                    id: '3',
                    title: 'Calificación',
                    value: dashboardData.stats.rating ? dashboardData.stats.rating.toFixed(1) : '0.0',
                    icon: 'star-outline',
                    color: '#8b5cf6',
                    change: '+0.0',
                  }}
                />
              </View>
            </View>

            {/* Solicitudes Recientes (rehecho) */}
            <View style={styles.requestsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Solicitudes Recientes</Text>
                <TouchableOpacity onPress={handleViewAllRequests}>
                  <Text style={styles.viewAllText}>Ver todas</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={dashboardData.recentRequests}
                keyExtractor={(item, index) => (item._id || item.id || String(index))}
                renderItem={({ item }) => (
                  <RequestCard request={item} />
                )}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyStateText}>No hay solicitudes recientes</Text>
                  </View>
                }
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.9,
  },
  profileButton: {
    padding: theme.spacing.xs,
  },
  statsContainer: {
    padding: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  statsContent: {
    paddingRight: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsList: {
    paddingRight: theme.spacing.lg,
  },
  statCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  statTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  statChange: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  requestsContainer: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  requestCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.white,
  },
  requestDetails: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  requestDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  // statsGrid removido en favor de scroll horizontal
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyStateText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  registrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  registrationContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  registrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  registrationSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  registrationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  registrationButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
  incompleteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  incompleteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  incompleteText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  completeButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  completeButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});


