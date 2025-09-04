import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
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
        return { width: 200, height: 120 };
      case "large":
        return { width: 300, height: 200 };
      case "full":
        return { width: screenWidth - 32, height: 300 };
      default:
        return { width: 250, height: 150 };
    }
  };

  const mapSize = getMapSize();

  // Manejar diferentes tipos de location
  const isLocationObject = typeof location === "object" && location !== null;
  const coordinates = isLocationObject
    ? { latitude: location.latitude, longitude: location.longitude }
    : { latitude: 4.711, longitude: -74.0721 }; // Bogotá por defecto

  const locationText = isLocationObject
    ? location.address || "Ubicación del servicio"
    : typeof location === "string" && location.trim() !== ""
    ? location
    : "Ubicación del servicio";

  // Configuración de la región del mapa
  const region = {
    ...coordinates,
    latitudeDelta: size === "full" ? 0.01 : 0.02,
    longitudeDelta: size === "full" ? 0.01 : 0.02,
  };

  return (
    <View style={[styles.container, mapSize]}>
      <MapView style={styles.map}/>
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
  },
  map: {
    width: "100%",
    height: "100%"
  },
});
