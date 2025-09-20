class GooglePlacesService {
  constructor() {
    this.apiKey = 'AIzaSyCMC6Hjca0wTD8tm9fc9X30bthRaOmTUog';
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
  }

  // Autocompletar direcciones mientras el usuario escribe
  async getPlacePredictions(input, options = {}) {
    try {
      if (!input || input.trim().length < 3) {
        return [];
      }

      const params = new URLSearchParams({
        input: input.trim(),
        key: this.apiKey,
        language: 'es', // Español
        components: 'country:ar', // Restringir a Argentina
        types: 'geocode', // Solo direcciones geocodificables
        ...options
      });

      const url = `${this.baseUrl}/autocomplete/json?${params}`;
      
      console.log('🔍 Buscando predicciones para:', input);
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        const predictions = data.predictions.map(prediction => ({
          placeId: prediction.place_id,
          description: prediction.description,
          mainText: prediction.structured_formatting?.main_text || prediction.description,
          secondaryText: prediction.structured_formatting?.secondary_text || '',
        }));

        console.log('✅ Predicciones encontradas:', predictions.length);
        return predictions;
      } else {
        console.log('⚠️ Sin predicciones:', data.status);
        return [];
      }

    } catch (error) {
      console.error('❌ Error obteniendo predicciones:', error);
      return [];
    }
  }

  // Obtener detalles de un lugar específico (incluyendo coordenadas)
  async getPlaceDetails(placeId) {
    try {
      const params = new URLSearchParams({
        place_id: placeId,
        key: this.apiKey,
        language: 'es',
        fields: 'formatted_address,geometry,place_id,name'
      });

      const url = `${this.baseUrl}/details/json?${params}`;
      
      console.log('📍 Obteniendo detalles del lugar:', placeId);
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const result = data.result;
        const coordinates = {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        };

        const placeDetails = {
          placeId: result.place_id,
          address: result.formatted_address,
          name: result.name || result.formatted_address,
          coordinates,
        };

        console.log('✅ Detalles obtenidos:', placeDetails);
        return placeDetails;
      } else {
        console.log('❌ Error obteniendo detalles:', data.status);
        throw new Error(`Error obteniendo detalles: ${data.status}`);
      }

    } catch (error) {
      console.error('❌ Error obteniendo detalles del lugar:', error);
      throw error;
    }
  }

  // Geocodificar una dirección (convertir texto a coordenadas)
  async geocodeAddress(address) {
    try {
      const params = new URLSearchParams({
        address: address,
        key: this.apiKey,
        language: 'es',
        region: 'ar' // Argentina
      });

      const url = `https://maps.googleapis.com/maps/api/geocode/json?${params}`;
      
      console.log('🗺️ Geocodificando dirección:', address);
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const coordinates = {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        };

        const geocodeResult = {
          address: result.formatted_address,
          coordinates,
          placeId: result.place_id,
          types: result.types,
        };

        console.log('✅ Geocodificación exitosa:', geocodeResult);
        return geocodeResult;
      } else {
        console.log('❌ Error en geocodificación:', data.status);
        throw new Error(`No se pudo encontrar la dirección: ${data.status}`);
      }

    } catch (error) {
      console.error('❌ Error geocodificando dirección:', error);
      throw error;
    }
  }

  // Obtener coordenadas para una solicitud (con fallbacks)
  async getCoordinatesForRequest(address) {
    try {
      console.log('🎯 Obteniendo coordenadas para solicitud...');
      
      if (!address || address.trim() === '') {
        throw new Error('Dirección vacía');
      }

      // Intentar geocodificación directa
      try {
        const result = await this.geocodeAddress(address);
        return {
          coordinates: result.coordinates,
          address: result.address,
          placeId: result.placeId,
          originalAddress: address,
        };
      } catch (geocodeError) {
        console.log('⚠️ Error en geocodificación, usando fallback...');
        
        // Fallback: Buenos Aires
        return {
          coordinates: {
            latitude: -34.6037,
            longitude: -58.3816,
          },
          address: address,
          placeId: null,
          originalAddress: address,
          fallback: true,
        };
      }

    } catch (error) {
      console.error('❌ Error obteniendo coordenadas:', error);
      
      // Fallback final
      return {
        coordinates: {
          latitude: -34.6037,
          longitude: -58.3816,
        },
        address: address || 'Buenos Aires, Argentina',
        placeId: null,
        originalAddress: address,
        fallback: true,
        error: error.message,
      };
    }
  }

  // Validar si las coordenadas son válidas
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
}

// Instancia singleton
const googlePlacesService = new GooglePlacesService();

export default googlePlacesService;
