import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import { clientAPI } from '../services/api';

interface Professional {
  id: string;
  name: string;
  phone: string;
  whatsappUrl: string | null;
  acceptanceStatus: string;
  acceptedAt: string;
  completedAt?: string;
  specialties: string[];
  rating: number;
  totalReviews: number;
  profileImage?: string;
}

interface RequestProfessionalsModalProps {
  visible: boolean;
  onClose: () => void;
  requestId: string;
  clientId: string;
  onSelectProfessional?: (professionalId: string) => void;
  onCloseRequest?: () => void;
}

export const RequestProfessionalsModal: React.FC<RequestProfessionalsModalProps> = ({
  visible,
  onClose,
  requestId,
  clientId,
  onSelectProfessional,
  onCloseRequest,
}) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string>('');
  const [completedBy, setCompletedBy] = useState<string | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);

  useEffect(() => {
    if (visible && requestId && clientId) {
      fetchProfessionals();
    }
  }, [visible, requestId, clientId]);

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const response = await clientAPI.getRequestProfessionals(requestId, clientId);
      
      if (response.success) {
        setProfessionals(response.data.professionals);
        setRequestStatus(response.data.requestStatus);
        setCompletedBy(response.data.completedBy);
        setSelectedProfessionalId(response.data.selectedProfessional || null);
      } else {
        Alert.alert('Error', 'No se pudieron cargar los profesionales');
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
      Alert.alert('Error', 'Error al cargar los profesionales');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppPress = (whatsappUrl: string, professionalName: string) => {
    if (whatsappUrl) {
      Linking.openURL(whatsappUrl).catch(() => {
        Alert.alert('Error', 'No se pudo abrir WhatsApp');
      });
    } else {
      Alert.alert('Error', `${professionalName} no tiene número de teléfono disponible`);
    }
  };

  const handleSelectProfessional = (professionalId: string, professionalName: string) => {
    Alert.alert(
      'Seleccionar Profesional',
      `¿Confirmar que aceptas a ${professionalName} para esta solicitud?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => {
            if (onSelectProfessional) {
              onSelectProfessional(professionalId);
            }
          },
        },
      ]
    );
  };

  const handleCloseRequest = () => {
    Alert.alert(
      'Cerrar Solicitud',
      '¿Cerrar solicitud sin seleccionar a ningún profesional?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar',
          style: 'destructive',
          onPress: () => {
            if (onCloseRequest) {
              onCloseRequest();
            }
          },
        },
      ]
    );
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Aceptado';
      case 'completed':
        return 'Completado';
      case 'completed_by_other':
        return 'Completado por otro';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return theme.colors.primary;
      case 'completed':
        return theme.colors.success;
      case 'completed_by_other':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderProfessional = ({ item }: { item: Professional }) => (
    <View style={styles.professionalCard}>
      <View style={styles.professionalHeader}>
        <View style={styles.professionalInfo}>
          <Text style={styles.professionalName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={theme.colors.warning} />
            <Text style={styles.ratingText}>
              {item.rating.toFixed(1)} ({item.totalReviews} reseñas)
            </Text>
          </View>
          <Text style={styles.specialties}>
            {item.specialties.join(', ')}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.acceptanceStatus) }]}>
          <Text style={styles.statusText}>{getStatusText(item.acceptanceStatus)}</Text>
        </View>
      </View>

      <View style={styles.professionalActions}>
        {item.phone && (
          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={() => handleWhatsAppPress(item.whatsappUrl || '', item.name)}
          >
            <Ionicons name="logo-whatsapp" size={20} color={theme.colors.white} />
            <Text style={styles.whatsappButtonText}>WhatsApp</Text>
          </TouchableOpacity>
        )}
        
        {requestStatus === 'active_for_acceptance' && !selectedProfessionalId ? (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleSelectProfessional(item.id, item.name)}
          >
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />
            <Text style={styles.acceptButtonText}>Aceptar</Text>
          </TouchableOpacity>
        ) : selectedProfessionalId === item.id ? (
          <View style={styles.selectedButton}>
            <Ionicons name="checkmark-done" size={20} color={theme.colors.success} />
            <Text style={styles.selectedButtonText}>Seleccionado</Text>
          </View>
        ) : (
          <View style={styles.disabledButton}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.disabledButtonText}>No disponible</Text>
          </View>
        )}
      </View>

      <View style={styles.professionalFooter}>
        <Text style={styles.acceptedAt}>
          Aceptado: {new Date(item.acceptedAt).toLocaleDateString('es-ES')}
        </Text>
        {item.completedAt && (
          <Text style={styles.completedAt}>
            Completado: {new Date(item.completedAt).toLocaleDateString('es-ES')}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profesionales Disponibles</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {requestStatus && (
          <View style={styles.requestStatusContainer}>
            <Text style={styles.requestStatusText}>
              Estado de la solicitud: <Text style={styles.requestStatusValue}>{requestStatus}</Text>
            </Text>
            {completedBy && (
              <Text style={styles.completedByText}>
                Completada por: {professionals.find(p => p.id === completedBy)?.name || 'Profesional'}
              </Text>
            )}
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Cargando profesionales...</Text>
          </View>
        ) : (
          <FlatList
            data={professionals}
            keyExtractor={(item) => item.id}
            renderItem={renderProfessional}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>No hay profesionales aceptados</Text>
              </View>
            }
          />
        )}

        {/* Botón para cerrar solicitud */}
        {onCloseRequest && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeRequestButton} onPress={handleCloseRequest}>
              <Ionicons name="close-circle" size={20} color={theme.colors.error} />
              <Text style={styles.closeRequestButtonText}>Cerrar Solicitud</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
  },
  requestStatusContainer: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  requestStatusText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
  },
  requestStatusValue: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  completedByText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  listContainer: {
    padding: 16,
  },
  professionalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  professionalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  professionalInfo: {
    flex: 1,
    marginRight: 12,
  },
  professionalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  specialties: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  professionalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: 8,
  },
  whatsappButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  phoneButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  phoneButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  professionalFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
  },
  acceptedAt: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  completedAt: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  acceptButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  acceptButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  closeRequestButton: {
    backgroundColor: theme.colors.error + '20',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  closeRequestButtonText: {
    color: theme.colors.error,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  selectedButton: {
    backgroundColor: theme.colors.success + '20',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  selectedButtonText: {
    color: theme.colors.success,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  disabledButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
