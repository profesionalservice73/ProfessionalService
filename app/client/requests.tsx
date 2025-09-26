import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { SafeScreen } from '../../components/SafeScreen';
import { clientAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRequests } from '../../contexts/RequestsContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useClientNotifications } from '../../hooks/useClientNotifications';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { RatingModal } from '../../components/RatingModal';
import { CancelRequestModal } from '../../components/CancelRequestModal';
import { RequestProfessionalsModal } from '../../components/RequestProfessionalsModal';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return theme.colors.warning;
    case 'active_for_acceptance':
      return theme.colors.info;
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
    case 'active_for_acceptance':
      return 'Esperando Aceptaciones';
    case 'in_progress':
      return 'En Progreso';
    case 'completed':
      return 'Completado';
    case 'awaiting_rating':
      return 'Esperando Calificación';
    case 'closed':
      return 'Cerrado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
};

// Función para formatear la fecha de la solicitud
const formatRequestDate = (request: any) => {
  // Si hay fecha preferida, mostrarla
  if (request.preferredDate) {
    return formatDateForDisplay(request.preferredDate);
  }
  
  // Si no hay fecha preferida, mostrar la fecha de creación
  if (request.createdAt) {
    return formatDateForDisplay(request.createdAt);
  }
  
  // Si no hay ninguna fecha, mostrar texto por defecto
  return 'Sin fecha';
};

const RequestCard = ({ 
  request, 
  onPress, 
  onEdit, 
  onDelete,
  onRate,
  onCancel,
  onViewProfessionals
}: { 
  request: any; 
  onPress: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRate: (request: any) => void;
  onCancel: (request: any) => void;
  onViewProfessionals: (id: string) => void;
}) => {
  return (
    <View style={styles.requestCard}>
      <TouchableOpacity onPress={() => onPress(request._id || request.id)} style={styles.requestContent}>
        <View style={styles.requestHeader}>
          <View style={styles.requestTitleContainer}>
            <Text style={styles.requestTitle}>{request.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
              <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
            </View>
          </View>
          <Text style={styles.requestCategory}>{request.category}</Text>
        </View>
        
        <Text style={styles.requestDescription}>{request.description}</Text>
        
        <View style={styles.requestDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{formatRequestDate(request)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>
              {typeof request.location === 'object' && request.location?.address 
                ? request.location.address 
                : request.location || 'Ubicación no disponible'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.requestActions}>
        {/* Botones de acción según el estado */}
        {request.status === 'awaiting_rating' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rateButton]} 
              onPress={() => onRate(request)}
            >
              <Ionicons name="star-outline" size={20} color={theme.colors.white} />
              <Text style={styles.rateButtonText}>Calificar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={() => onCancel(request)}
            >
              <Ionicons name="close-outline" size={20} color={theme.colors.white} />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}
        
        {request.status === 'pending' && (
          <>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onEdit(request._id || request.id)}
            >
              <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onCancel(request)}
            >
              <Ionicons name="close-outline" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </>
        )}
        
        {['active_for_acceptance', 'in_progress', 'completed', 'awaiting_rating'].includes(request.status) && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.professionalsButton]}
            onPress={() => onViewProfessionals(request._id || request.id)}
          >
            <Ionicons name="people-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        
        {['in_progress', 'completed'].includes(request.status) && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onCancel(request)}
          >
            <Ionicons name="close-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        )}
        
        {['closed', 'cancelled'].includes(request.status) && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onDelete(request._id || request.id)}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function RequestsScreen({ navigation }: any) {
  const { user } = useAuth();
  const { requests, loading, refreshRequests } = useRequests();
  const { clearBadge } = useNotifications();
  const { markAsRead } = useClientNotifications();
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Estados para los modales
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [professionalsModalVisible, setProfessionalsModalVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');

  // Recargar solicitudes cuando se regrese a esta pantalla
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user?.id) {
        refreshRequests();
        // Limpiar badge cuando el usuario entra a la pantalla de solicitudes
        clearBadge();
      }
    });

    return unsubscribe;
  }, [navigation, user?.id, refreshRequests, clearBadge]);

  // Asegurar que requests siempre sea un array
  const safeRequests = Array.isArray(requests) ? requests : [];
  
  console.log('🔍 Requests en componente:', requests);
  console.log('🔍 SafeRequests:', safeRequests);
  console.log('🔍 ActiveFilter:', activeFilter);
  
  const filteredRequests = activeFilter === 'all' 
    ? safeRequests 
    : safeRequests.filter((request: any) => request.status === activeFilter);
    
  console.log('🔍 FilteredRequests:', filteredRequests);

  const handleRequestPress = (requestId: string) => {
    console.log('Request pressed:', requestId);
    // Aquí se navegaría al detalle de la solicitud
  };

  const handleNewRequest = () => {
    console.log('New request');
    navigation.navigate('CreateRequest');
  };

  const handleRateRequest = (request: any) => {
    setSelectedRequest(request);
    setRatingModalVisible(true);
  };

  const handleCancelRequest = (request: any) => {
    setSelectedRequest(request);
    setCancelModalVisible(true);
  };

  const handleRatingSuccess = () => {
    refreshRequests();
    setRatingModalVisible(false);
    setSelectedRequest(null);
  };

  const handleCancelSuccess = () => {
    refreshRequests();
    setCancelModalVisible(false);
    setSelectedRequest(null);
  };

  const handleViewProfessionals = (requestId: string) => {
    setSelectedRequestId(requestId);
    setProfessionalsModalVisible(true);
  };

  const handleCloseProfessionalsModal = () => {
    setProfessionalsModalVisible(false);
    setSelectedRequestId('');
  };

  const handleSelectProfessional = async (professionalId: string) => {
    try {
      const response = await clientAPI.selectProfessional(selectedRequestId, user?.id || '', professionalId);
      
      if (response.success) {
        Alert.alert('Éxito', 'Profesional seleccionado correctamente');
        await refreshRequests();
        setProfessionalsModalVisible(false);
        setSelectedRequestId('');
      } else {
        Alert.alert('Error', response.error || 'Error al seleccionar el profesional');
      }
    } catch (error) {
      console.error('Error selecting professional:', error);
      Alert.alert('Error', 'Error de conexión al seleccionar el profesional');
    }
  };

  const handleCloseRequest = async () => {
    try {
      const response = await clientAPI.closeRequest(selectedRequestId, user?.id || '', 'Cliente cerró la solicitud sin seleccionar profesional');
      
      if (response.success) {
        Alert.alert('Éxito', 'Solicitud cerrada correctamente');
        await refreshRequests();
        setProfessionalsModalVisible(false);
        setSelectedRequestId('');
      } else {
        Alert.alert('Error', response.error || 'Error al cerrar la solicitud');
      }
    } catch (error) {
      console.error('Error closing request:', error);
      Alert.alert('Error', 'Error de conexión al cerrar la solicitud');
    }
  };

  const handleEditRequest = (requestId: string) => {
    
    // Buscar la solicitud para pasarla a la pantalla de edición
    const request = safeRequests.find(req => req._id === requestId || req.id === requestId);
    if (request) {
      console.log('Found request to edit:', request);
      navigation.navigate('EditRequest', { request });
    } else {
      Alert.alert('Error', 'No se pudo encontrar la solicitud');
    }
  };

  const handleDeleteRequest = (requestId: string) => {
    Alert.alert(
      'Eliminar Solicitud',
      '¿Estás seguro de que quieres eliminar esta solicitud? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await clientAPI.deleteRequest(requestId);
              
              if (response.success) {
                // Actualizar la lista usando el contexto
                await refreshRequests();
                Alert.alert('Éxito', 'Solicitud eliminada correctamente');
              } else {
                Alert.alert('Error', response.error || 'Error al eliminar la solicitud');
              }
            } catch (error) {
              console.error('Error eliminando solicitud:', error);
              Alert.alert('Error', 'Error de conexión al eliminar la solicitud');
            }
          },
        },
      ]
    );
  };

  const filters = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'in_progress', label: 'En Progreso' },
    { key: 'awaiting_rating', label: 'Esperando Calificación' },
    { key: 'closed', label: 'Cerradas' },
    { key: 'cancelled', label: 'Canceladas' },
  ];

  return (
    <SafeScreen>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Header 
          title="Mis Solicitudes" 
          useSafeArea={false} />
      </View>
      
      {/* Botón nueva solicitud */}
      <View style={styles.newRequestContainer}>
        <TouchableOpacity style={styles.newRequestButton} onPress={handleNewRequest}>
          <Ionicons name="add" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

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
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <RequestCard 
              request={item} 
              onPress={handleRequestPress}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
              onRate={handleRateRequest}
              onCancel={handleCancelRequest}
              onViewProfessionals={handleViewProfessionals}
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
                  ? 'Crea tu primera solicitud de servicio'
                  : `No hay solicitudes ${getStatusText(activeFilter).toLowerCase()}`
                }
              </Text>
              {activeFilter === 'all' && (
                <TouchableOpacity style={styles.emptyButton} onPress={handleNewRequest}>
                  <Text style={styles.emptyButtonText}>Crear Solicitud</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Modales */}
      <RatingModal
        visible={ratingModalVisible}
        onClose={() => {
          setRatingModalVisible(false);
          setSelectedRequest(null);
        }}
        onSuccess={handleRatingSuccess}
        requestId={selectedRequest?._id || selectedRequest?.id || ''}
        clientId={user?.id || ''}
        professionalName={selectedRequest?.professionalId?.userId?.fullName || 'Profesional'}
        serviceTitle={selectedRequest?.title || ''}
      />

      <CancelRequestModal
        visible={cancelModalVisible}
        onClose={() => {
          setCancelModalVisible(false);
          setSelectedRequest(null);
        }}
        onSuccess={handleCancelSuccess}
        requestId={selectedRequest?._id || selectedRequest?.id || ''}
        clientId={user?.id || ''}
        serviceTitle={selectedRequest?.title || ''}
      />

      <RequestProfessionalsModal
        visible={professionalsModalVisible}
        onClose={handleCloseProfessionalsModal}
        requestId={selectedRequestId}
        clientId={user?.id || ''}
        onSelectProfessional={handleSelectProfessional}
        onCloseRequest={handleCloseRequest}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  newRequestContainer: {
    position: 'absolute',
    top: theme.spacing.xl + 60,
    right: theme.spacing.lg,
    zIndex: 1,
  },
  newRequestButton: {
    backgroundColor: theme.colors.primary,
    width: 35,
    height: 35,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: theme.spacing.sm,
  },
  requestTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  requestTitle: {
    fontSize: 18,
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
  requestCategory: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
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
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  emptyButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  requestActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  professionalsButton: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  rateButton: {
    backgroundColor: theme.colors.primary,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  rateButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
  },
  cancelButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
