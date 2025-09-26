import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  Linking,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { clientAPI } from '../../services/api';

interface Professional {
  id: string;
  name: string;
  phone: string;
  whatsappUrl: string;
  specialties: string[];
  rating: number;
  totalReviews: number;
  profileImage: string | null;
}

interface RequestData {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  completedAt: string;
}

export default function RequestProfessionalsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { requestId, professionals: initialProfessionals, requestData } = (route.params as any) || {};
  
  const [professionals, setProfessionals] = useState<Professional[]>(initialProfessionals || []);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  useEffect(() => {
    if (requestId && !initialProfessionals) {
      loadProfessionals();
    }
  }, [requestId]);

  const loadProfessionals = async () => {
    if (!requestId || !user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await clientAPI.getRequestProfessionals(requestId, user.id);
      if (response.success) {
        setProfessionals(response.data.professionals || []);
      }
    } catch (error) {
      console.error('Error cargando profesionales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfessionals();
    setRefreshing(false);
  };

  const openWhatsApp = async (professional: Professional) => {
    if (!professional.whatsappUrl) {
      Alert.alert('Error', 'Número de teléfono no disponible');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(professional.whatsappUrl);
      if (canOpen) {
        await Linking.openURL(professional.whatsappUrl);
      } else {
        Alert.alert('Error', 'No se puede abrir WhatsApp');
      }
    } catch (error) {
      console.error('Error abriendo WhatsApp:', error);
      Alert.alert('Error', 'No se pudo abrir WhatsApp');
    }
  };

  const handleAcceptProfessional = (professional: Professional) => {
    setSelectedProfessional(professional);
    setShowAcceptModal(true);
  };

  const confirmAcceptProfessional = async () => {
    if (!selectedProfessional || !requestId || !user?.id) return;

    try {
      const response = await clientAPI.selectProfessional(requestId, user.id, selectedProfessional.id);
      if (response.success) {
        setShowAcceptModal(false);
        Alert.alert(
          'Profesional Seleccionado',
          `${selectedProfessional.name} ha sido seleccionado para realizar el trabajo.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'No se pudo seleccionar al profesional');
      }
    } catch (error) {
      console.error('Error seleccionando profesional:', error);
      Alert.alert('Error', 'No se pudo seleccionar al profesional');
    }
  };

  const handleCloseRequest = () => {
    setShowCloseModal(true);
  };

  const confirmCloseRequest = async () => {
    if (!requestId || !user?.id) return;
    
    try {
      const response = await clientAPI.closeRequest(requestId, user.id, 'Cliente cerró la solicitud sin seleccionar profesional');
      if (response.success) {
        setShowCloseModal(false);
        Alert.alert(
          'Solicitud Cerrada',
          'La solicitud ha sido cerrada exitosamente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'No se pudo cerrar la solicitud');
      }
    } catch (error) {
      console.error('Error cerrando solicitud:', error);
      Alert.alert('Error', 'No se pudo cerrar la solicitud');
    }
  };

  const renderProfessional = (professional: Professional) => (
    <View key={professional.id} style={styles.professionalCard}>
      <View style={styles.professionalHeader}>
        <View style={styles.professionalInfo}>
          <Text style={styles.professionalName}>{professional.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={theme.colors.warning} />
            <Text style={styles.ratingText}>
              {professional.rating.toFixed(1)} ({professional.totalReviews} reseñas)
            </Text>
          </View>
          <Text style={styles.specialtiesText}>
            {professional.specialties.join(', ')}
          </Text>
        </View>
        {professional.profileImage && (
          <Image source={{ uri: professional.profileImage }} style={styles.profileImage} />
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.whatsappButton}
          onPress={() => openWhatsApp(professional)}
        >
          <Ionicons name="logo-whatsapp" size={20} color={theme.colors.white} />
          <Text style={styles.whatsappButtonText}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptProfessional(professional)}
        >
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />
          <Text style={styles.acceptButtonText}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Profesionales Disponibles</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Profesionales Encontrados</Text>
            <Text style={styles.infoText}>
              Hicimos una búsqueda y te mostramos {professionals.length} profesionales que están en la zona y que cumplen la categoría que pediste.
            </Text>
          </View>
        </View>

        {requestData && (
          <View style={styles.requestInfo}>
            <Text style={styles.requestTitle}>{requestData.title}</Text>
            <Text style={styles.requestDescription}>{requestData.description}</Text>
            <Text style={styles.requestLocation}>📍 {requestData.location}</Text>
          </View>
        )}

        <View style={styles.professionalsSection}>
          <Text style={styles.sectionTitle}>
            Elige un Profesional ({professionals.length})
          </Text>
          
          {professionals.length > 0 ? (
            professionals.map(renderProfessional)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyStateText}>No hay profesionales disponibles</Text>
              <Text style={styles.emptyStateSubtext}>
                Los profesionales de la zona podrán ver tu solicitud y contactarte.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botón fijo para cerrar solicitud */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.closeButton} onPress={handleCloseRequest}>
          <Ionicons name="close-circle" size={20} color={theme.colors.error} />
          <Text style={styles.closeButtonText}>Cerrar Solicitud</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de confirmación para aceptar profesional */}
      <Modal
        visible={showAcceptModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAcceptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Selección</Text>
            <Text style={styles.modalText}>
              ¿Confirmar que aceptas a {selectedProfessional?.name}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAcceptModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmAcceptProfessional}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación para cerrar solicitud */}
      <Modal
        visible={showCloseModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCloseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cerrar Solicitud</Text>
            <Text style={styles.modalText}>
              ¿Cerrar solicitud sin aceptar a ningún profesional?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCloseModal(false)}
              >
                <Text style={styles.cancelButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmCloseRequest}
              >
                <Text style={styles.confirmButtonText}>Sí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    paddingTop: theme.spacing.xl + theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  infoContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  requestInfo: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  requestDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  requestLocation: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  professionalsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  professionalCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  professionalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  professionalInfo: {
    flex: 1,
  },
  professionalName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  ratingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  specialtiesText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surface,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  whatsappButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  acceptButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
    gap: theme.spacing.xs,
  },
  closeButtonText: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  // Estilos para modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

