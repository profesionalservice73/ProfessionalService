import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

interface AddressAutocompleteSimpleProps {
  value: string;
  onChangeText: (text: string) => void;
  onPlaceSelected: (placeDetails: any) => void;
  placeholder?: string;
  label?: string;
  style?: any;
}

export const AddressAutocompleteSimple: React.FC<AddressAutocompleteSimpleProps> = ({
  value,
  onChangeText,
  onPlaceSelected,
  placeholder = "Ingresa la dirección...",
  label,
  style,
}) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounce para evitar demasiadas llamadas a la API
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value && value.trim().length >= 3) {
      setDebugInfo(`Buscando para: "${value}"`);
      debounceRef.current = setTimeout(async () => {
        await searchPredictions(value);
      }, 300);
    } else {
      setPredictions([]);
      setShowPredictions(false);
      setDebugInfo(value.length > 0 ? `Muy corto (${value.length} chars)` : 'Campo vacío');
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  const searchPredictions = async (input: string) => {
    try {
      setIsLoading(true);
      setDebugInfo(`Buscando: "${input}"`);
      
      console.log('🔍 Buscando predicciones para:', input);
      
      // Llamada directa a Google Places API
      const apiKey = 'AIzaSyCMC6Hjca0wTD8tm9fc9X30bthRaOmTUog';
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&language=es&components=country:ar&types=geocode`;
      
      console.log('🌐 URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📡 Respuesta completa:', data);
      
      if (data.status === 'OK' && data.predictions) {
        const results = data.predictions.map((prediction: any) => ({
          placeId: prediction.place_id,
          description: prediction.description,
          mainText: prediction.structured_formatting?.main_text || prediction.description,
          secondaryText: prediction.structured_formatting?.secondary_text || '',
        }));

        setPredictions(results);
        setShowPredictions(results.length > 0);
        setDebugInfo(`Encontradas: ${results.length} sugerencias`);
        console.log('✅ Predicciones procesadas:', results);
      } else {
        setPredictions([]);
        setShowPredictions(false);
        setDebugInfo(`Error: ${data.status} - ${data.error_message || 'Sin mensaje'}`);
        console.log('❌ Error en API:', data.status, data.error_message);
      }
    } catch (error) {
      console.error('❌ Error buscando predicciones:', error);
      setPredictions([]);
      setShowPredictions(false);
      setDebugInfo(`Error de red: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceSelect = async (prediction: any) => {
    try {
      setIsLoading(true);
      setShowPredictions(false);
      setDebugInfo(`Obteniendo detalles de: ${prediction.description}`);
      
      // Obtener detalles del lugar
      const apiKey = 'AIzaSyCMC6Hjca0wTD8tm9fc9X30bthRaOmTUog';
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.placeId}&key=${apiKey}&language=es&fields=formatted_address,geometry,place_id,name`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        const result = data.result;
        const placeDetails = {
          placeId: result.place_id,
          address: result.formatted_address,
          name: result.name || result.formatted_address,
          coordinates: {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
          },
        };
        
        onChangeText(placeDetails.address);
        onPlaceSelected(placeDetails);
        setDebugInfo(`Seleccionado: ${placeDetails.address}`);
        console.log('✅ Lugar seleccionado:', placeDetails);
      } else {
        // Fallback: usar solo la descripción
        onChangeText(prediction.description);
        setDebugInfo(`Fallback: ${prediction.description}`);
      }
    } catch (error) {
      console.error('Error obteniendo detalles:', error);
      onChangeText(prediction.description);
      setDebugInfo(`Error, usando descripción: ${prediction.description}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
    if (showPredictions) {
      setShowPredictions(false);
    }
  };


  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          multiline={false}
        />
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}
      </View>

      {/* Debug info */}
      <Text style={styles.debugInfo}>
        🔍 {debugInfo}
      </Text>

      {showPredictions && predictions.length > 0 && (
        <View style={styles.predictionsContainer}>
          {predictions.map((item) => (
            <TouchableOpacity
              key={item.placeId}
              style={styles.predictionItem}
              onPress={() => handlePlaceSelect(item)}
            >
              <Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} />
              <View style={styles.predictionText}>
                <Text style={styles.mainText}>{item.mainText}</Text>
                {item.secondaryText && (
                  <Text style={styles.secondaryText}>{item.secondaryText}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
  },
  loadingContainer: {
    position: 'absolute',
    right: theme.spacing.md,
  },
  debugInfo: {
    marginTop: theme.spacing.xs,
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  predictionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: theme.borderRadius.md,
    borderBottomRightRadius: theme.borderRadius.md,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  predictionText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  mainText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  secondaryText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
