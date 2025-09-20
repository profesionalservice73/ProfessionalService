import * as Location from 'expo-location';

class GeocodingService {
  constructor() {
    this.googleMapsApiKey = 'AIzaSyCMC6Hjca0wTD8tm9fc9X30bthRaOmTUog';
  }

  // Obtener ubicación actual del usuario
  async getCurrentLocation() {
    try {
      console.log('📍 Solicitando permisos de ubicación automáticamente...');
      
      // Solicitar permisos directamente (esto debería mostrar el popup nativo)
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      console.log('📍 Estado de permisos:', status);

      if (status !== 'granted') {
        console.log('❌ Permisos denegados por el usuario');
        throw new Error('PERMISSION_DENIED');
      }

      console.log('✅ Permisos otorgados, obteniendo ubicación actual...');
      
      // Obtener ubicación actual con configuración optimizada
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Balance entre precisión y velocidad
        timeout: 20000, // 20 segundos para obtener ubicación
        maximumAge: 300000, // 5 minutos de caché
      });

      const coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      console.log('✅ Ubicación obtenida:', coordinates);

      // Obtener dirección a partir de las coordenadas
      const address = await this.reverseGeocode(coordinates);
      
      return {
        coordinates,
        address: address || 'Ubicación actual',
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('❌ Error obteniendo ubicación:', error);
      
      // Si es error de permisos, lanzar error específico
      if (error.message === 'PERMISSION_DENIED') {
        throw new Error('PERMISSION_DENIED');
      }
      
      throw error;
    }
  }

  // Convertir dirección de texto a coordenadas (geocodificación)
  async geocodeAddress(address) {
    try {
      console.log('🗺️ Geocodificando dirección:', address);
      
      if (!address || address.trim() === '') {
        throw new Error('Dirección vacía');
      }

      // Usar la API de Google Maps para geocodificación
      const encodedAddress = encodeURIComponent(address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.googleMapsApiKey}`;
      
      console.log('🌐 Consultando API de Google Maps...');
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const coordinates = {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        };

        const formattedAddress = result.formatted_address;

        console.log('✅ Geocodificación exitosa:', {
          coordinates,
          formattedAddress,
        });

        return {
          coordinates,
          address: formattedAddress,
          originalAddress: address,
        };
      } else {
        console.log('❌ Error en geocodificación:', data.status, data.error_message);
        throw new Error(`No se pudo encontrar la dirección: ${data.error_message || data.status}`);
      }

    } catch (error) {
      console.error('❌ Error en geocodificación:', error);
      throw error;
    }
  }

  // Convertir coordenadas a dirección (geocodificación inversa)
  async reverseGeocode(coordinates) {
    try {
      console.log('🔄 Geocodificación inversa para:', coordinates);
      
      const { latitude, longitude } = coordinates;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.googleMapsApiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const address = result.formatted_address;
        
        console.log('✅ Geocodificación inversa exitosa:', address);
        return address;
      } else {
        console.log('❌ Error en geocodificación inversa:', data.status);
        return null;
      }

    } catch (error) {
      console.error('❌ Error en geocodificación inversa:', error);
      return null;
    }
  }

  // Validar si las coordenadas son válidas (no son 0,0)
  isValidCoordinates(coordinates) {
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      return false;
    }

    const { latitude, longitude } = coordinates;
    
    // Verificar que no sean coordenadas por defecto (0,0)
    if (latitude === 0 && longitude === 0) {
      return false;
    }

    // Verificar que estén en rangos válidos
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return false;
    }

    return true;
  }

  // Obtener coordenadas para una solicitud (ubicación actual o geocodificación)
  async getCoordinatesForRequest(locationText) {
    try {
      console.log('🎯 Obteniendo coordenadas para solicitud...');
      
      // Si no hay texto de ubicación, usar ubicación actual
      if (!locationText || locationText.trim() === '') {
        console.log('📍 No hay texto de ubicación, usando ubicación actual...');
        return await this.getCurrentLocation();
      }

      // Intentar geocodificar la dirección
      try {
        console.log('🗺️ Intentando geocodificar dirección...');
        return await this.geocodeAddress(locationText);
      } catch (geocodeError) {
        console.log('⚠️ Error en geocodificación, usando ubicación actual como fallback...');
        
        // Si falla la geocodificación, usar ubicación actual
        const currentLocation = await this.getCurrentLocation();
        
        return {
          coordinates: currentLocation.coordinates,
          address: `${locationText} (ubicación aproximada)`,
          originalAddress: locationText,
          fallback: true,
        };
      }

    } catch (error) {
      console.error('❌ Error obteniendo coordenadas:', error);
      
      // Fallback final: coordenadas por defecto de Buenos Aires
      return {
        coordinates: {
          latitude: -34.6037,
          longitude: -58.3816,
        },
        address: locationText || 'Buenos Aires, Argentina',
        originalAddress: locationText,
        fallback: true,
        error: error.message,
      };
    }
  }

  // Calcular distancia entre dos puntos (en kilómetros)
  calculateDistance(point1, point2) {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // Formatear distancia para mostrar
  formatDistance(distanceInKm) {
    if (distanceInKm < 1) {
      return `${Math.round(distanceInKm * 1000)}m`;
    } else {
      return `${distanceInKm.toFixed(1)}km`;
    }
  }
}

// Instancia singleton
const geocodingService = new GeocodingService();

export default geocodingService;
