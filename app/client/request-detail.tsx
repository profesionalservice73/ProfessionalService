
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { theme } from "../../config/theme";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function RequestDetailScreen() {
  const navigation = useNavigation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Datos de ejemplo de la solicitud
  const request = {
    id: "1",
    title: "Necesito un plomero urgente",
    description:
      "Tengo una fuga de agua en el baño principal que está causando daños. Necesito un plomero certificado que pueda venir lo antes posible para reparar el problema.",
    serviceType: "Plomería",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    ],
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: "Nueva York, NY, Estados Unidos",
    },
    requester: {
      name: "María González",
      rating: 4.8,
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
    },
    createdAt: "2024-01-15T10:30:00Z",
    urgency: "Urgente",
  };

  const handleChatPress = () => {
    // Aquí iría la lógica para abrir el chat
    console.log("Abrir chat con el profesional");
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === request.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? request.images.length - 1 : prev - 1
    );
  };

  const handleMapReady = () => {
    console.log("Mapa cargado exitosamente");
    setMapReady(true);
    setMapError(false);
  };

  const retryMap = () => {
    setMapError(false);
    setMapKey(prev => prev + 1);
  };

  const handleImageError = () => {
    console.log('❌ Error cargando imagen:', request.images[currentImageIndex]);
    setImageError(true);
  };

  const retryImage = () => {
    setImageError(false);
  };

  // Validar que hay imágenes disponibles
  const hasValidImages = request.images && request.images.length > 0 && request.images.every(img => img && img.trim() !== '');
  const currentImage = hasValidImages ? request.images[currentImageIndex] : null;

  // Debug: Log de imágenes
  console.log('🖼️ Imágenes de la solicitud:', {
    hasImages: !!request.images,
    imagesLength: request.images?.length || 0,
    images: request.images,
    hasValidImages,
    currentImageIndex,
    currentImage
  });

  const renderMap = () => {
    if (mapError) {
      return (
        <View style={styles.mapFallback}>
          <Ionicons name="map-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.mapFallbackText}>Error al cargar el mapa</Text>
          <Text style={styles.mapFallbackSubtext}>
            {request.location?.address || 'Dirección no disponible'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={retryMap}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const markers = [
      {
        id: 'request-location',
        coordinates: {
          latitude: request.location?.latitude || 0,
          longitude: request.location?.longitude || 0,
        },
        title: 'Ubicación del servicio',
        snippet: request.location?.address || 'Dirección no disponible',
        showCallout: true,
      }
    ];

    if (Platform.OS === 'ios') {
      return (
        <AppleMaps.View 
          key={mapKey} 
          style={styles.map}
          markers={markers}
          cameraPosition={{
            coordinates: {
              latitude: request.location?.latitude || 0,
              longitude: request.location?.longitude || 0,
            },
            zoom: 15,
          }}
        />
      );
    } else if (Platform.OS === 'android') {
      return (
        <GoogleMaps.View 
          key={mapKey} 
          style={styles.map}
          markers={markers}
          cameraPosition={{
            coordinates: {
              latitude: request.location?.latitude || 0,
              longitude: request.location?.longitude || 0,
            },
            zoom: 15,
          }}
        />
      );
    } else {
      return (
        <View style={styles.map}>
          <Text style={styles.unsupportedText}>
            Los mapas solo están disponibles en Android e iOS
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imagen principal */}
        <View style={styles.imageContainer}>
          {hasValidImages && !imageError && currentImage ? (
            <Image
              source={{ uri: currentImage }}
              style={styles.mainImage}
              resizeMode="cover"
              onError={handleImageError}
            />
          ) : (
            <View style={styles.imageFallback}>
              <Ionicons name="image-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.imageFallbackText}>
                {!hasValidImages ? 'No hay imágenes disponibles' : 'Error al cargar la imagen'}
              </Text>
              {imageError && (
                <TouchableOpacity style={styles.retryButton} onPress={retryImage}>
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Flechas de navegación - solo si hay imágenes válidas */}
          {hasValidImages && request.images.length > 1 && (
            <>
              <TouchableOpacity style={styles.navArrow} onPress={prevImage}>
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navArrow, styles.navArrowRight]}
                onPress={nextImage}
              >
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>
            </>
          )}

          {/* Indicadores de imagen - solo si hay imágenes válidas */}
          {hasValidImages && request.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {request.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Tipo de servicio */}
          <View style={styles.serviceTypeContainer}>
            <Text style={styles.serviceType}>{request.serviceType}</Text>
          </View>

          {/* Título */}
          <Text style={styles.title}>{request.title}</Text>

          {/* Información del solicitante */}
          <View style={styles.requesterInfo}>
            <Image
              source={{ uri: request.requester.avatar }}
              style={styles.avatar}
            />
            <View style={styles.requesterDetails}>
              <Text style={styles.requesterName}>{request.requester.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.rating}>{request.requester.rating}</Text>
              </View>
            </View>
          </View>

          {/* Descripción */}
          <Text style={styles.description}>{request.description}</Text>

          {/* Detalles adicionales */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.detailText}>Publicado hace 2 horas</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="alert-circle-outline" size={16} color="#FF6B6B" />
              <Text style={[styles.detailText, styles.urgentText]}>
                {request.urgency}
              </Text>
            </View>
          </View>

          {/* Mapa */}
          <View style={styles.mapSection}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            {renderMap()}
            <Text style={styles.addressText}>
              {request.location?.address || 'Dirección no disponible'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón flotante de chat */}
      <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
        <Ionicons name="chatbubble" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.chatButtonText}>chatear</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  imageContainer: {
    position: "relative",
    height: 300,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  imageFallbackText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  navArrow: {
    position: "absolute",
    top: "50%",
    left: 10,
    transform: [{ translateY: -20 }],
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  navArrowRight: {
    left: undefined,
    right: 10,
  },
  imageIndicators: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeIndicator: {
    backgroundColor: "white",
  },
  content: {
    padding: theme.spacing.lg,
  },
  serviceTypeContainer: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  serviceType: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  requesterInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
  },
  requesterDetails: {
    flex: 1,
  },
  requesterName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  rating: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  detailsContainer: {
    marginBottom: theme.spacing.lg,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  urgentText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  mapSection: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  mapContainer: {
    width: "100%",
    height: 120,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    position: "relative",
    alignSelf: 'center',
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapFallback: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  mapFallbackText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  mapFallbackSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: "center",
    fontStyle: "italic",
  },
  retryButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  mapLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  mapLoadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  addressText: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: "center",
    fontWeight: "500",
    marginTop: theme.spacing.sm,
  },
  chatButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chatButtonText: {
    position: "absolute",
    bottom: -25,
    right: 0,
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  unsupportedText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 14,
    padding: 20,
  },
  // Estilos para el placeholder del mapa
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    textAlign: "center",
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  mapPlaceholderNote: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: "center",
    fontStyle: "italic",
  },
});
