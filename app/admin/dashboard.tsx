import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Professional {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  specialties: string[];
  experience: string;
  description: string;
  location: string;
  dniNumber?: string;
  dniFrontImage?: string;
  dniBackImage?: string;
  selfieImage?: string;
  profileImage?: string;
  certifications?: string[];
  certificationDocuments?: string[];
  workPhotos?: string[];
  createdAt: string;
  validationStatus?: string;
  rejectionReason?: string;
  validationNotes?: string;
  validatedBy?: string;
  validatedAt?: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [stats, setStats] = useState({
    professionals: { total: 0, pending: 0, approved: 0, rejected: 0 },
    users: { total: 0, clients: 0, professionals: 0, admins: 0 }
  });
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState<string>('');

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleTabChange = (tab: 'pending' | 'approved' | 'rejected') => {
    console.log('🔄 Cambiando pestaña manualmente a:', tab);
    setActiveTab(tab);
  };

  const handleImagePress = (imageUri: string, title: string) => {
    setSelectedImage(imageUri);
    setSelectedImageTitle(title);
    setImageModalVisible(true);
  };

  // Removido para evitar bucles infinitos

  // Componente de imagen optimizado para imágenes grandes
  const OptimizedImageComponent = ({ source, style, onPress }: { source: string; style: any; onPress: () => void }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Verificar si es una imagen base64 muy grande
    const isLargeBase64 = source.startsWith('data:') && source.length > 1000000; // > 1MB

    const handleLoad = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    return (
      <TouchableOpacity style={style} onPress={onPress}>
        {isLoading && (
          <View style={[style, { position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }]}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={{ marginTop: 4, fontSize: 10, color: theme.colors.textSecondary }}>
              {isLargeBase64 ? 'Cargando imagen grande...' : 'Cargando...'}
            </Text>
          </View>
        )}
        {hasError ? (
          <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }]}>
            <Ionicons name="image-outline" size={30} color={theme.colors.textSecondary} />
            <Text style={{ marginTop: 4, fontSize: 10, color: theme.colors.textSecondary }}>Error</Text>
          </View>
        ) : (
          <Image
            source={{ uri: source }}
            style={style}
            resizeMode="contain"
            onLoad={handleLoad}
            onError={handleError}
            // Optimizaciones para imágenes grandes
            progressiveRenderingEnabled={isLargeBase64}
            fadeDuration={isLargeBase64 ? 0 : 300}
          />
        )}
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    if (!user?.id) {
      console.error('No hay usuario autenticado');
      return;
    }

    try {
      setLoading(true);
      
      // Cargar profesionales según la pestaña activa
      let response;
      switch (activeTab) {
        case 'pending':
          response = await adminAPI.getPendingProfessionals(user.id);
          break;
        case 'approved':
          response = await adminAPI.getApprovedProfessionals(user.id);
          break;
        case 'rejected':
          response = await adminAPI.getRejectedProfessionals(user.id);
          break;
      }

      if (response.success) {
        console.log(`📋 Profesionales ${activeTab} cargados:`, response.data?.length || 0);
        console.log('📊 Datos de profesionales:', response.data);
        setProfessionals(response.data || []);
      }

      // Cargar estadísticas
      const statsResponse = await adminAPI.getAdminStats(user.id);
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'Error de conexión al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalPress = async (professional: Professional) => {
    try {
      console.log('🔍 Abriendo detalles del profesional:', professional._id);
      
      // Mostrar modal inmediatamente con datos básicos
      setSelectedProfessional(professional);
      setModalVisible(true);
      
      // Cargar detalles completos en segundo plano (solo si no están ya cargados)
      if (!professional.dniFrontImage && !professional.dniBackImage && !professional.profileImage) {
        console.log('📡 Cargando detalles completos...');
        const response = await adminAPI.getProfessionalDetails(professional._id, user.id);
        
        if (response.success) {
          console.log('✅ Detalles completos cargados');
          setSelectedProfessional(response.data);
        } else {
          console.error('❌ Error cargando detalles:', response.error);
        }
      } else {
        console.log('✅ Datos ya disponibles, no se necesita carga adicional');
      }
    } catch (error) {
      console.error('❌ Error en handleProfessionalPress:', error);
      Alert.alert('Error', 'Error de conexión al cargar detalles');
    }
  };

  const handleAction = (professional: Professional, type: 'approve' | 'reject') => {
    setSelectedProfessional(professional);
    setActionType(type);
    setActionModalVisible(true);
    setNotes('');
    setRejectionReason('');
  };

  const confirmAction = async () => {
    console.log('🚀 Iniciando confirmAction...');
    console.log('👤 selectedProfessional:', selectedProfessional?._id);
    console.log('👤 user:', user?.id);
    console.log('📝 actionType:', actionType);

    if (!selectedProfessional || !user?.id) {
      console.log('❌ Faltan datos requeridos');
      Alert.alert('Error', 'Datos requeridos no disponibles');
      return;
    }

    if (loading) {
      console.log('⏳ Ya hay una acción en progreso');
      return;
    }

    try {
      setLoading(true);
      console.log('⏳ Loading activado');
      
      let response;
      if (actionType === 'approve') {
        console.log('✅ Aprobando profesional...');
        response = await adminAPI.approveProfessional(selectedProfessional._id, notes, user.id);
      } else {
        console.log('❌ Rechazando profesional...');
        if (!rejectionReason.trim()) {
          console.log('❌ Motivo de rechazo requerido');
          Alert.alert('Error', 'El motivo de rechazo es requerido');
          setLoading(false);
          return;
        }
        response = await adminAPI.rejectProfessional(selectedProfessional._id, rejectionReason, notes, user.id);
      }

      console.log('📊 Respuesta recibida:', response?.success ? 'Éxito' : 'Error');

      if (response && response.success) {
        console.log('✅ Acción exitosa:', actionType);
        
        Alert.alert(
          'Éxito',
          `Profesional ${actionType === 'approve' ? 'aprobado' : 'rechazado'} exitosamente`,
          [{ 
            text: 'OK', 
            onPress: () => {
              const newTab = actionType === 'approve' ? 'approved' : 'rejected';
              setActiveTab(newTab);
              setActionModalVisible(false);
              setModalVisible(false);
              loadData();
            }
          }]
        );
      } else {
        console.error('❌ Error en la respuesta:', response?.error);
        Alert.alert('Error', response?.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('❌ Error procesando acción:', error);
      Alert.alert('Error', 'Error de conexión al procesar la solicitud');
    } finally {
      console.log('🔄 Finalizando confirmAction, desactivando loading');
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.colors.warning;
      case 'approved': return theme.colors.success;
      case 'rejected': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      default: return 'Desconocido';
    }
  };

  const ProfessionalCard = ({ professional }: { professional: Professional }) => {
    const status = professional.validationStatus || 'pending';
    
    return (
      <TouchableOpacity
        style={styles.professionalCard}
        onPress={() => handleProfessionalPress(professional)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.professionalInfo}>
            <Text style={styles.professionalName}>{professional.fullName}</Text>
            <Text style={styles.professionalEmail}>{professional.email}</Text>
            <Text style={styles.professionalPhone}>{professional.phone}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
            <Text style={styles.statusText}>
              {getStatusText(status)}
            </Text>
          </View>
        </View>
      
      <View style={styles.specialtiesContainer}>
        {professional.specialties.map((specialty, index) => (
          <View key={index} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.experienceText} numberOfLines={2}>
        {professional.experience}
      </Text>

      <Text style={styles.locationText}>
        📍 {professional.location}
      </Text>

      {activeTab === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleAction(professional, 'approve')}
          >
            <Ionicons name="checkmark" size={16} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Aprobar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleAction(professional, 'reject')}
          >
            <Ionicons name="close" size={16} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Panel de Administración" 
        rightAction={{
          icon: 'log-out-outline',
          onPress: handleLogout
        }}
      />
      
      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.professionals.pending}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.professionals.approved}</Text>
          <Text style={styles.statLabel}>Aprobados</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.professionals.rejected}</Text>
          <Text style={styles.statLabel}>Rechazados</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.professionals.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Pestañas */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => handleTabChange('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pendientes ({stats.professionals.pending})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'approved' && styles.activeTab]}
          onPress={() => handleTabChange('approved')}
        >
          <Text style={[styles.tabText, activeTab === 'approved' && styles.activeTabText]}>
            Aprobados ({stats.professionals.approved})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rejected' && styles.activeTab]}
          onPress={() => handleTabChange('rejected')}
        >
          <Text style={[styles.tabText, activeTab === 'rejected' && styles.activeTabText]}>
            Rechazados ({stats.professionals.rejected})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de profesionales */}
      <ScrollView style={styles.professionalsList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Cargando profesionales...</Text>
          </View>
        ) : professionals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>
              No hay profesionales {activeTab === 'pending' ? 'pendientes' : activeTab === 'approved' ? 'aprobados' : 'rechazados'}
            </Text>
          </View>
        ) : (
          professionals.map((professional) => (
            <ProfessionalCard key={professional._id} professional={professional} />
          ))
        )}
      </ScrollView>

      {/* Modal de detalles */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles del Profesional</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          {selectedProfessional && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Información Personal</Text>
                <Text style={styles.detailText}>Nombre: {selectedProfessional.fullName}</Text>
                <Text style={styles.detailText}>Email: {selectedProfessional.email}</Text>
                <Text style={styles.detailText}>Teléfono: {selectedProfessional.phone}</Text>
                <Text style={styles.detailText}>Ubicación: {selectedProfessional.location}</Text>
                {selectedProfessional.dniNumber && (
                  <Text style={styles.detailText}>DNI: {selectedProfessional.dniNumber}</Text>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Especialidades</Text>
                <View style={styles.specialtiesContainer}>
                  {selectedProfessional.specialties.map((specialty, index) => (
                    <View key={index} style={styles.specialtyTag}>
                      <Text style={styles.specialtyText}>{specialty}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Experiencia</Text>
                <Text style={styles.detailText}>{selectedProfessional.experience}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Descripción</Text>
                <Text style={styles.detailText}>{selectedProfessional.description}</Text>
              </View>

              {/* Documentos de Identidad */}
              {(() => {
                const hasDocuments = selectedProfessional.dniFrontImage || selectedProfessional.dniBackImage || selectedProfessional.profileImage;
                console.log('📋 Verificando documentos:', {
                  dniFront: !!selectedProfessional.dniFrontImage,
                  dniBack: !!selectedProfessional.dniBackImage,
                  selfie: !!selectedProfessional.profileImage,
                  hasDocuments
                });
                return hasDocuments;
              })() && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Documentos de Identidad</Text>
                  
                    {selectedProfessional.dniFrontImage && (
                      <View style={styles.imageContainer}>
                        <Text style={styles.imageLabel}>📄 DNI - Frente</Text>
                        <OptimizedImageComponent
                          source={selectedProfessional.dniFrontImage}
                          style={styles.documentImage}
                          onPress={() => handleImagePress(selectedProfessional.dniFrontImage!, 'DNI - Frente')}
                        />
                      </View>
                    )}
                  
                  {selectedProfessional.dniBackImage && (
                    <View style={styles.imageContainer}>
                      <Text style={styles.imageLabel}>📄 DNI - Dorso</Text>
                      <OptimizedImageComponent
                        source={selectedProfessional.dniBackImage}
                        style={styles.documentImage}
                        onPress={() => handleImagePress(selectedProfessional.dniBackImage!, 'DNI - Dorso')}
                      />
                    </View>
                  )}
                  
                  {selectedProfessional.profileImage && (
                    <View style={styles.imageContainer}>
                      <Text style={styles.imageLabel}>📸 Selfie de Verificación</Text>
                      <OptimizedImageComponent
                        source={selectedProfessional.profileImage}
                        style={styles.documentImage}
                        onPress={() => handleImagePress(selectedProfessional.profileImage!, 'Selfie de Verificación')}
                      />
                    </View>
                  )}
                  
                  <Text style={styles.imageNote}>
                    💡 Toca las imágenes para verlas en tamaño completo
                  </Text>
                </View>
              )}

              {activeTab === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleAction(selectedProfessional, 'approve')}
                  >
                    <Ionicons name="checkmark" size={20} color={theme.colors.white} />
                    <Text style={styles.actionButtonText}>Aprobar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleAction(selectedProfessional, 'reject')}
                  >
                    <Ionicons name="close" size={20} color={theme.colors.white} />
                    <Text style={styles.actionButtonText}>Rechazar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Modal de acción */}
      <Modal
        visible={actionModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.actionModalOverlay}>
          <View style={styles.actionModalContent}>
            <Text style={styles.actionModalTitle}>
              {actionType === 'approve' ? 'Aprobar Profesional' : 'Rechazar Profesional'}
            </Text>
            
            {actionType === 'reject' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Motivo de rechazo *</Text>
                <TextInput
                  style={styles.textInput}
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  placeholder="Ej: Documentos ilegibles, información incompleta..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notas adicionales</Text>
              <TextInput
                style={styles.textInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Notas para el profesional..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.actionModalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setActionModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  actionType === 'approve' ? styles.approveButton : styles.rejectButton,
                  loading && { opacity: 0.6 }
                ]}
                onPress={confirmAction}
                disabled={loading}
              >
                {loading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={theme.colors.white} />
                    <Text style={[styles.actionButtonText, { marginLeft: 8 }]}>
                      {actionType === 'approve' ? 'Aprobando...' : 'Rechazando...'}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.actionButtonText}>
                    {actionType === 'approve' ? 'Aprobar' : 'Rechazar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de imagen ampliada */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalOverlay}>
          <View style={styles.imageModalContent}>
            <View style={styles.imageModalHeader}>
              <Text style={styles.imageModalTitle}>{selectedImageTitle}</Text>
              <TouchableOpacity onPress={() => setImageModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
            {selectedImage && (
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.fullSizeImage}
                resizeMode="contain"
              />
            )}
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
  statsContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.white,
  },
  professionalsList: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  professionalCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  professionalInfo: {
    flex: 1,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  professionalEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  professionalPhone: {
    fontSize: 14,
    color: theme.colors.textSecondary,
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
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  specialtyTag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  specialtyText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '500',
  },
  experienceText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  locationText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  approveButton: {
    backgroundColor: theme.colors.success,
  },
  rejectButton: {
    backgroundColor: theme.colors.error,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  detailSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  imageContainer: {
    marginBottom: theme.spacing.md,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  imageWrapper: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  documentImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  imageNote: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    width: '95%',
    height: '90%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  imageModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
  },
  fullSizeImage: {
    flex: 1,
    width: '100%',
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  actionModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
    textAlignVertical: 'top',
  },
  actionModalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
});
