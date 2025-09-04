import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { useProfessional } from '../../contexts/ProfessionalContext';
import { professionalAPI } from '../../services/api';
import { RequestCard } from '../../components/RequestCard';

// Estados para datos reales
interface Request {
  _id?: string;
  id?: string;
  title: string;
  client: string;
  location: string;
  status: string;
  date: string;
  description: string;
  urgency: string;
  professionalId?: string;
  clientId?: any;
  createdAt?: string;
  preferredDate?: string;
  contactPhone?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return theme.colors.warning;
    case 'accepted':
      return theme.colors.primary;
    case 'completed':
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
    case 'completed':
      return 'Completada';
    case 'cancelled':
      return 'Cancelada';
    default:
      return 'Desconocido';
  }
};

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'high':
      return theme.colors.error;
    case 'medium':
      return theme.colors.warning;
    case 'low':
      return theme.colors.success;
    default:
      return theme.colors.textSecondary;
  }
};

const getUrgencyText = (urgency: string) => {
  switch (urgency) {
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Media';
    case 'low':
      return 'Baja';
    default:
      return 'Normal';
  }
};

// Componente RequestCard ya está importado desde components/RequestCard

export default function ProfessionalRequestsScreen({ navigation }: any) {
  const { professional } = useProfessional();
  const [activeFilter, setActiveFilter] = useState('all');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar solicitudes del profesional
  useEffect(() => {
    loadRequests();
  }, [activeFilter]);

  const loadRequests = async () => {
    if (!professional?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let response;

      switch (activeFilter) {
        case 'pending':
          response = await professionalAPI.getPendingRequests(professional.id);
          break;
        case 'accepted':
          response = await professionalAPI.getAcceptedRequests(professional.id);
          break;
        case 'cancelled':
          response = await professionalAPI.getCancelledRequests
            ? await professionalAPI.getCancelledRequests(professional.id)
            : await professionalAPI.getRequests(professional.id);
          break;
        case 'completed':
          response = await professionalAPI.getCompletedRequests
            ? await professionalAPI.getCompletedRequests(professional.id)
            : await professionalAPI.getRequests(professional.id);
          break;
        case 'all':
        default:
          response = await professionalAPI.getRequests(professional.id);
          break;
      }
      
      if (response.success && response.data) {
        setRequests(response.data);
      } else {
        console.log(`No se encontraron solicitudes ${activeFilter}:`, response);
        setRequests([]);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = activeFilter === 'all'
    ? requests
    : activeFilter === 'accepted'
      ? requests.filter(request => request.status === 'accepted' || request.status === 'in_progress')
      : activeFilter === 'cancelled'
        ? requests.filter(request => request.status === 'cancelled')
        : requests.filter(request => request.status === activeFilter);

  const handleRequestPress = (requestId: string) => {
    const request = requests.find(req => req._id === requestId || req.id === requestId);
    if (request) {
      navigation.navigate('RequestDetail', { requestId, request });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await professionalAPI.acceptRequest(requestId, professional?.id);
      
      if (response.success) {
        Alert.alert('Éxito', 'Solicitud aceptada correctamente');
        loadRequests(); // Recargar la lista
      } else {
        Alert.alert('Error', response.error || 'Error al aceptar la solicitud');
      }
    } catch (error) {
      console.error('Error aceptando solicitud:', error);
      Alert.alert('Error', 'Error de conexión al aceptar la solicitud');
    }
  };

  const handleCompleteRequest = async (requestId: string) => {
    try {
      const response = await professionalAPI.updateRequest(requestId, 'completed');
      if (response.success) {
        Alert.alert('Éxito', 'Solicitud marcada como completada');
        loadRequests();
      } else {
        Alert.alert('Error', response.error || 'No se pudo completar la solicitud');
      }
    } catch (error) {
      console.error('Error completando solicitud:', error);
      Alert.alert('Error', 'Error de conexión al completar la solicitud');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const response = await professionalAPI.updateRequest(requestId, 'cancelled');
      if (response.success) {
        Alert.alert('Solicitud cancelada', 'Has cancelado esta solicitud');
        loadRequests();
      } else {
        Alert.alert('Error', response.error || 'No se pudo cancelar la solicitud');
      }
    } catch (error) {
      console.error('Error cancelando solicitud:', error);
      Alert.alert('Error', 'Error de conexión al cancelar la solicitud');
    }
  };



  const filters = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'accepted', label: 'Aceptadas' },
    { key: 'completed', label: 'Completadas' },
    { key: 'cancelled', label: 'Canceladas' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con logo */}
      <Header title="Mis Solicitudes" />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                activeFilter === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View> 

      {/* Requests List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando solicitudes...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          renderItem={({ item }) => (
            <RequestCard 
              request={item} 
              onPress={handleRequestPress}
              onAccept={handleAcceptRequest}
              onComplete={handleCompleteRequest}
              onCancel={handleCancelRequest}
            />
          )}
          contentContainerStyle={styles.requestsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No hay solicitudes</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'all' 
                  ? 'No tienes solicitudes pendientes'
                  : `No hay solicitudes ${getStatusText(activeFilter).toLowerCase()}`
                }
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xxl + 40,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  filtersContainer: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    height: 70,
    justifyContent: 'center',
  },
  filtersContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 90,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  filterTextActive: {
    color: theme.colors.white,
  },
  requestsList: {
    padding: theme.spacing.lg,
  },
  requestCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  requestContent: {
    padding: theme.spacing.lg,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  requestTitleContainer: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.white,
  },
  urgencyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginLeft: theme.spacing.sm,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  requestDetails: {
    gap: theme.spacing.sm,
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
  requestActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: theme.colors.success,
  },
  rejectButton: {
    backgroundColor: theme.colors.error,
  },
  completeButton: {
    backgroundColor: theme.colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: theme.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
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
});
