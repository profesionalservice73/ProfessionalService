import { Platform } from 'react-native';

export const MAPS_CONFIG = {
  // Configuración por defecto del mapa
  defaultRegion: {
    latitude: 0, // Coordenadas neutras por defecto
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  
  // Configuración específica por plataforma
  platform: {
    ios: {
      showsUserLocation: false,
      showsMyLocationButton: false,
    },
    android: {
      showsUserLocation: false,
      showsMyLocationButton: false,
    },
  },
  
  // Configuración del marcador
  marker: {
    pinColor: '#1E3A8A', // Color del tema
    title: 'Ubicación del servicio',
  },
  
  // Configuración de la región
  region: {
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  
  // Configuración de interacciones
  interactions: {
    zoomEnabled: true,
    scrollEnabled: true,
    rotateEnabled: false,
    pitchEnabled: false,
  },
  
  // Configuración de elementos visuales
  visual: {
    showsCompass: true,
    showsScale: true,
    mapType: 'standard' as const,
    loadingEnabled: true,
  },
};

// Función para obtener la configuración específica de la plataforma
export const getPlatformMapConfig = () => {
  return Platform.OS === 'ios' ? MAPS_CONFIG.platform.ios : MAPS_CONFIG.platform.android;
};

// Función para obtener el provider correcto según la plataforma
export const getMapProvider = () => {
  return Platform.OS === 'android' ? 'google' : undefined;
};

// Función para validar coordenadas
export const validateCoordinates = (latitude: number, longitude: number): boolean => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );
};

// Función para obtener coordenadas por defecto si las proporcionadas son inválidas
export const getSafeCoordinates = (latitude?: number, longitude?: number) => {
  if (validateCoordinates(latitude || 0, longitude || 0)) {
    return { latitude: latitude || 0, longitude: longitude || 0 };
  }
  return MAPS_CONFIG.defaultRegion;
};
