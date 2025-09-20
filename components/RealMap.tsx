import React from "react";
import { View, StyleSheet, Dimensions, Platform, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
// import { AppleMaps, GoogleMaps } from "expo-maps"; // COMENTADO PARA USO LOCAL
import { theme } from "../config/theme";

interface RealMapProps {
  location:
    | {
        latitude: number;
        longitude: number;
        address?: string;
      }
    | string;
  size?: "small" | "medium" | "large" | "full";
}

export const RealMap: React.FC<RealMapProps> = ({
  location,
  size = "medium",
}) => {
  const getMapSize = () => {
    const { width: screenWidth } = Dimensions.get("window");
    switch (size) {
      case "small":
        return { width: 250, height: 150 };
      case "large":
        return { width: 350, height: 250 };
      case "full":
        return { width: screenWidth - 32, height: 400 };
      default:
        return { width: 300, height: 200 };
    }
  };

  const mapSize = getMapSize();

  // Manejar diferentes tipos de location
  const isLocationObject = typeof location === "object" && location !== null;
  const hasValidCoordinates = isLocationObject && 
    location.latitude !== 0 && location.longitude !== 0 &&
    location.latitude !== null && location.longitude !== null &&
    !isNaN(location.latitude) && !isNaN(location.longitude);
  
  // Si no hay coordenadas válidas, no mostrar el mapa
  if (!hasValidCoordinates) {
    const locationString = typeof location === "string" ? location : "";
    return (
      <View style={[styles.container, mapSize]}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="location-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.mapPlaceholderText}>Ubicación no disponible</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            {locationString.trim() !== ""
              ? locationString
              : "No se pudo obtener la ubicación exacta"}
          </Text>
        </View>
      </View>
    );
  }

  const coordinates = { latitude: location.latitude, longitude: location.longitude };

  const locationText = isLocationObject 
    ? (location.address || "Ubicación del servicio")
    : "Ubicación del servicio";

  // Configuración de la región del mapa
  const region = {
    ...coordinates,
    latitudeDelta: size === "full" ? 0.01 : 0.02,
    longitudeDelta: size === "full" ? 0.01 : 0.02,
  };

  // COMENTADO PARA USO LOCAL - Reemplazado con placeholder
  const renderMap = () => {
    // const markers = [
    //   {
    //     id: 'service-location',
    //     coordinates: coordinates,
    //     title: 'Ubicación del servicio',
    //     snippet: locationText,
    //     showCallout: true,
    //   }
    // ];

    // if (Platform.OS === 'ios') {
    //   return (
    //     <AppleMaps.View 
    //       style={styles.map}
    //       markers={markers}
    //       cameraPosition={{
    //         coordinates: coordinates,
    //         zoom: size === "full" ? 15 : 12,
    //       }}
    //     />
    //   );
    // } else if (Platform.OS === 'android') {
    //   return (
    //     <GoogleMaps.View 
    //       style={styles.map}
    //       markers={markers}
    //       cameraPosition={{
    //         coordinates: coordinates,
    //         zoom: size === "full" ? 15 : 12,
    //       }}
    //     />
    //   );
    // } else {
    //   return (
    //     <View style={styles.map}>
    //       <Text style={styles.unsupportedText}>
    //         Los mapas solo están disponibles en Android e iOS
    //       </Text>
    //     </View>
    //   );
    // }

    // PLACEHOLDER PARA USO LOCAL
    return (
      <View style={styles.map}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={48} color={theme.colors.primary} />
          <Text style={styles.mapPlaceholderText}>Mapa (Modo Local)</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            {locationText}
          </Text>
          <Text style={styles.mapPlaceholderNote}>
            Coordenadas: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, mapSize]}>
      {renderMap()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    marginVertical: theme.spacing.sm,
    alignSelf: 'center',
  },
  map: {
    width: "100%",
    height: "100%"
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
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  mapPlaceholderNote: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
});

/*
 * INSTRUCCIONES PARA RESTAURAR MAPAS REALES:
 * 
 * 1. Descomenta la línea 4: import { AppleMaps, GoogleMaps } from "expo-maps";
 * 2. Descomenta todo el código dentro de renderMap() (líneas 78-118)
 * 3. Comenta o elimina el placeholder (líneas 121-134)
 * 4. Asegúrate de tener expo-maps instalado: npx expo install expo-maps
 * 5. Para producción, configura las API keys de Google Maps y Apple Maps
 * 
 * NOTA: Este componente está comentado para uso local sin dependencias nativas.
 * Los mapas reales requieren configuración adicional y API keys.
 */