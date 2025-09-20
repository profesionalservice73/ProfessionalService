import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { theme } from "../../config/theme";
import { Header } from "../../components/Header";
import { SafeScreen } from "../../components/SafeScreen";
import { LocationMap } from "../../components/LocationMap";
import { formatDateForDisplay } from "../../utils/dateUtils";
import { professionalAPI } from "../../services/api";
import { useProfessional } from "../../contexts/ProfessionalContext";
import { useRequests } from "../../contexts/RequestsContext";

const { width } = Dimensions.get("window");

export default function RequestDetailScreen({ route, navigation }: any) {
  const { requestId } = route.params;
  const { professional } = useProfessional();
  const { updateRequestStatus } = useRequests();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    loadRequestDetail();
  }, [requestId]);

  const loadRequestDetail = async () => {
    try {
      setLoading(true);
      // Por ahora usamos los datos que vienen de la lista
      // En el futuro podríamos crear una ruta específica para obtener detalles
      const requestData = route.params.request;
      console.log('📱 Datos de la solicitud:', requestData);
      console.log('📱 ContactPhone:', requestData?.contactPhone);
      console.log('📱 ClientId phone:', requestData?.clientId?.phone);
      console.log('📍 Estructura de location:', requestData?.location);
      console.log('📍 Tipo de location:', typeof requestData?.location);
      setRequest(requestData);
    } catch (error) {
      console.error("Error loading request detail:", error);
      Alert.alert("Error", "No se pudo cargar los detalles de la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return theme.colors.error;
      case "medium":
        return theme.colors.warning;
      case "low":
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Baja";
      default:
        return "Normal";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return theme.colors.warning;
      case "accepted":
        return theme.colors.primary;
      case "in_progress":
        return theme.colors.primary;
      case "completed":
        return theme.colors.success;
      case "awaiting_rating":
        return theme.colors.primary;
      case "closed":
        return theme.colors.success;
      case "cancelled":
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "accepted":
        return "Aceptada";
      case "in_progress":
        return "En Progreso";
      case "completed":
        return "Completada";
      case "awaiting_rating":
        return "Esperando Calificación";
      case "closed":
        return "Cerrada";
      case "cancelled":
        return "Cancelada";
      default:
        return "Desconocido";
    }
  };

  const handleAcceptRequest = async () => {
    if (!request || !professional?.id) return;

    Alert.alert(
      "Aceptar Solicitud",
      "¿Estás seguro de que quieres aceptar esta solicitud?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Aceptar",
          onPress: async () => {
            try {
              const response = await professionalAPI.acceptRequest(
                request._id || request.id,
                professional.id
              );

              if (response.success) {
                setRequest((prev: any) => ({
                  ...prev,
                  status: "accepted",
                  professionalId: professional.id,
                }));
                // Actualizar el estado en el contexto para que se refleje en la lista del cliente
                updateRequestStatus(request._id || request.id, "accepted");
                Alert.alert("Éxito", "Solicitud aceptada correctamente");
                navigation.goBack();
              } else {
                Alert.alert(
                  "Error",
                  response.error || "Error al aceptar la solicitud"
                );
              }
            } catch (error) {
              console.error("Error aceptando solicitud:", error);
              Alert.alert("Error", "Error de conexión al aceptar la solicitud");
            }
          },
        },
      ]
    );
  };

  const handleContactClient = () => {
    if (request?.contactPhone) {
      Alert.alert(
        "Contactar Cliente",
        `¿Quieres contactar al cliente al ${request.contactPhone}?`,
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Llamar",
            onPress: () => {
              // Aquí se implementaría la funcionalidad de llamada
              console.log("Llamando al cliente:", request.contactPhone);
            },
          },
        ]
      );
    }
  };

  const handleWhatsAppContact = () => {
    if (request?.contactPhone) {
      const phoneNumber = request.contactPhone.replace(/\D/g, ""); // Remover caracteres no numéricos
      const message = `Hola, soy un profesional interesado en tu solicitud "${request.title}". ¿Podemos coordinar los detalles?`;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        message
      )}`;

      Alert.alert(
        "Contactar por WhatsApp",
        `¿Quieres contactar al cliente por WhatsApp?`,
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Abrir WhatsApp",
            onPress: () => {
              Linking.openURL(whatsappUrl).catch((err) => {
                console.error("Error abriendo WhatsApp:", err);
                Alert.alert("Error", "No se pudo abrir WhatsApp");
              });
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Error",
        "No hay número de teléfono disponible para contactar"
      );
    }
  };

  const handleImagePress = (imageUri: string) => {
    setSelectedImage(imageUri);
    setImageModalVisible(true);
  };

  const handleCancelRequest = async () => {
    if (!request || !professional?.id) return;

    Alert.alert(
      "Cancelar Solicitud",
      "¿Estás seguro de cancelar esta solicitud?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await professionalAPI.updateRequest(
                request._id || request.id,
                "cancelled"
              );
              if (response.success) {
                setRequest((prev: any) => ({ ...prev, status: "cancelled" }));
                // Actualizar el estado en el contexto para que se refleje en la lista del cliente
                updateRequestStatus(request._id || request.id, "cancelled");
                Alert.alert(
                  "Solicitud cancelada",
                  "Has cancelado esta solicitud"
                );
                navigation.goBack();
              } else {
                Alert.alert(
                  "Error",
                  response.error || "No se pudo cancelar la solicitud"
                );
              }
            } catch (error) {
              console.error("Error cancelando solicitud:", error);
              Alert.alert(
                "Error",
                "Error de conexión al cancelar la solicitud"
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeScreen>
        <Header
          title="Detalle de Solicitud"
          showBackButton
          onBackPress={() => navigation.goBack()}
          useSafeArea={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </SafeScreen>
    );
  }

  if (!request) {
    return (
      <SafeScreen>
        <Header
          title="Detalle de Solicitud"
          showBackButton
          onBackPress={() => navigation.goBack()}
          useSafeArea={false}
        />
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={theme.colors.error}
          />
          <Text style={styles.errorTitle}>Solicitud no encontrada</Text>
          <Text style={styles.errorSubtitle}>
            No se pudo cargar la información de la solicitud
          </Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Header
          title="Detalle de Solicitud"
          showBackButton
          onBackPress={() => navigation.goBack()}
          useSafeArea={false}
        />

        {/* Foto/Video del problema - PARTE SUPERIOR */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{request.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(request.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(request.status)}
              </Text>
            </View>
          </View>

          <Text style={styles.category}>{request.category}</Text>

          {/* Imágenes del problema */}
          <View style={styles.imagesSection}>
            <Text style={styles.imagesSectionTitle}>Foto del Problema</Text>
            
            {request.images && request.images.length > 0 ? (
              <View style={styles.imagesContainer}>
                {request.images.map((imageUri: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.imageItem}
                    onPress={() => handleImagePress(imageUri)}
                  >
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.problemImage}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <Ionicons name="expand-outline" size={20} color={theme.colors.white} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.noImageContainer}>
                <Ionicons
                  name="camera-outline"
                  size={48}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.noImageText}>Sin foto del problema</Text>
                <Text style={styles.noImageSubtext}>
                  El cliente no ha subido foto para esta solicitud
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Detalles del Servicio - EN AZUL */}
        <View style={styles.serviceDetailsSection}>
          <Text style={styles.serviceDetailsTitle}>Detalles del Servicio</Text>
          <Text style={styles.serviceDescription}>{request.description}</Text>

          <View style={styles.serviceInfoRow}>
            <View style={styles.serviceInfoItem}>
              <Ionicons
                name="location-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.serviceInfoText}>
                {typeof request.location === 'object' && request.location?.address 
                  ? request.location.address 
                  : request.location || 'Ubicación no disponible'}
              </Text>
            </View>

            <View style={styles.serviceInfoItem}>
              <Ionicons
                name="time-outline"
                size={20}
                color={theme.colors.primary}
              />
              <View style={styles.urgencyContainer}>
                <Text style={styles.urgencyLabel}>Urgencia: </Text>
                <View
                  style={[
                    styles.urgencyBadge,
                    { backgroundColor: getUrgencyColor(request.urgency) },
                  ]}
                >
                  <Text style={styles.urgencyText}>
                    {getUrgencyText(request.urgency)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Información del Cliente - solo visible después de aceptar la solicitud */}
        {(request.status === "accepted" ||
          request.status === "in_progress") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Cliente</Text>

            <View style={styles.clientInfoRow}>
              <View style={styles.clientInfoItem}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.clientInfoText}>
                  {request.clientId?.fullName || "Cliente"}
                </Text>
              </View>

              <View style={styles.clientInfoItem}>
                <Ionicons
                  name="logo-whatsapp"
                  size={20}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.clientInfoText}>
                  {(() => {
                    const phone = request.contactPhone || request.clientId?.phone;
                    if (!phone) return 'No disponible';
                    
                    // Formatear el teléfono para WhatsApp
                    let formattedPhone = phone.toString().replace(/\s+/g, '').replace(/[()-]/g, '');
                    
                    // Asegurar que tenga el código de país
                    if (!formattedPhone.startsWith('+')) {
                      if (formattedPhone.startsWith('54')) {
                        formattedPhone = '+' + formattedPhone;
                      } else if (formattedPhone.length === 10) {
                        formattedPhone = '+54' + formattedPhone;
                      } else if (formattedPhone.length === 11 && (formattedPhone.startsWith('11') || formattedPhone.startsWith('15'))) {
                        formattedPhone = '+54' + formattedPhone;
                      }
                    }
                    
                    return formattedPhone;
                  })()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Ubicación - siempre visible */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <LocationMap location={request.location} size="large" />
        </View>

        {/* Acciones */}
        {request.status === "pending" && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAcceptRequest}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={theme.colors.white}
              />
              <Text style={styles.acceptButtonText}>Aceptar Solicitud</Text>
            </TouchableOpacity>
          </View>
        )}

        {(request.status === "accepted" ||
          request.status === "in_progress") && (
          <View style={styles.section}>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => {
                  /* se completa desde la lista por ahora */
                }}
              >
                <Ionicons
                  name="checkmark-done"
                  size={24}
                  color={theme.colors.white}
                />
                <Text style={styles.acceptButtonText}>Completar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelRequest}
              >
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={theme.colors.white}
                />
                <Text style={styles.acceptButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Botón de WhatsApp - solo visible después de aceptar la solicitud */}
        {request.contactPhone &&
          (request.status === "accepted" ||
            request.status === "in_progress") && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.whatsappButton}
                onPress={handleWhatsAppContact}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={24}
                  color={theme.colors.white}
                />
                <Text style={styles.whatsappButtonText}>
                  Contactar por WhatsApp
                </Text>
              </TouchableOpacity>
            </View>
          )}
      </ScrollView>

      {/* Modal para ver imagen en pantalla completa */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Foto del Problema</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setImageModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.imageScrollContainer}>
              <Image
                source={{ uri: selectedImage || '' }}
                style={styles.modalImage}
                resizeMode="contain"
                onLoad={() => console.log('🔍 Imagen cargada en modal')}
                onError={(error) => console.error('Error cargando imagen:', error)}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl + theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  errorSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.sm,
  },
  section: {
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.white,
  },
  category: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textTransform: "capitalize",
    marginBottom: theme.spacing.md,
  },
  imageContainer: {
    marginTop: theme.spacing.md,
  },
  problemImage: {
    width: "100%",
    height: 200,
    borderRadius: theme.borderRadius.md,
  },
  noImageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
  },
  noImageText: {
    marginTop: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  // Detalles del servicio en azul
  serviceDetailsSection: {
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  serviceDetailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.white,
    marginBottom: theme.spacing.md,
  },
  serviceDescription: {
    fontSize: 16,
    color: theme.colors.white,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  serviceInfoRow: {
    gap: theme.spacing.md,
  },
  serviceInfoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  serviceInfoText: {
    fontSize: 16,
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  // Información del cliente
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  clientInfoRow: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  clientInfoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  clientInfoText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  urgencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.xs,
  },
  urgencyLabel: {
    fontSize: 16,
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
  urgencyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.white,
  },
  acceptButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  actionsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  completeButton: {
    backgroundColor: theme.colors.success,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flex: 1,
  },
  acceptButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  contactButton: {
    backgroundColor: theme.colors.success,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  contactButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  whatsappButton: {
    backgroundColor: "#25D366", // Color oficial de WhatsApp
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  whatsappButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  // Estilos para la sección de imágenes
  imagesSection: {
    marginTop: theme.spacing.md,
  },
  imagesSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  imageItem: {
    position: "relative",
    width: (width - theme.spacing.lg * 2 - theme.spacing.sm) / 2,
    height: 120,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.xs,
  },
  // Estilos para el modal de imagen
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width,
    height: "100%",
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  imageScrollContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  modalImage: {
    width: width - theme.spacing.lg * 2,
    height: width - theme.spacing.lg * 2,
    borderRadius: theme.borderRadius.md,
  },
});
