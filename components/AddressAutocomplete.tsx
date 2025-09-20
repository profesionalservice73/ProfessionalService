import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import googlePlacesService from '../services/googlePlacesService';

interface AddressPrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onPlaceSelected: (placeDetails: any) => void;
  placeholder?: string;
  label?: string;
  style?: any;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChangeText,
  onPlaceSelected,
  placeholder = "Ingresa la dirección...",
  label,
  style,
}) => {
  const [predictions, setPredictions] = useState<AddressPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounce para evitar demasiadas llamadas a la API
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value && value.trim().length >= 3) {
      debounceRef.current = setTimeout(async () => {
        await searchPredictions(value);
      }, 300); // 300ms de delay
    } else {
      setPredictions([]);
      setShowPredictions(false);
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
      const results = await googlePlacesService.getPlacePredictions(input);
      setPredictions(results);
      setShowPredictions(results.length > 0);
    } catch (error) {
      console.error('Error buscando predicciones:', error);
      setPredictions([]);
      setShowPredictions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceSelect = async (prediction: AddressPrediction) => {
    try {
      setIsLoading(true);
      setShowPredictions(false);
      
      // Obtener detalles completos del lugar
      const placeDetails = await googlePlacesService.getPlaceDetails(prediction.placeId);
      
      // Actualizar el valor del input
      onChangeText(placeDetails.address);
      setSelectedPlace(placeDetails);
      
      // Notificar al componente padre
      onPlaceSelected(placeDetails);
      
      console.log('✅ Lugar seleccionado:', placeDetails);
      
    } catch (error) {
      console.error('Error obteniendo detalles del lugar:', error);
      // Si falla, al menos usar la descripción
      onChangeText(prediction.description);
      setShowPredictions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
    setSelectedPlace(null);
    
    // Si el texto cambia manualmente, ocultar predicciones
    if (showPredictions) {
      setShowPredictions(false);
    }
  };

  const renderPrediction = ({ item }: { item: AddressPrediction }) => (
    <TouchableOpacity
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
  );

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
        
        {selectedPlace && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          </View>
        )}
      </View>

      {showPredictions && predictions.length > 0 && (
        <View style={styles.predictionsContainer}>
          <FlatList
            data={predictions}
            renderItem={renderPrediction}
            keyExtractor={(item) => item.placeId}
            style={styles.predictionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
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
  selectedIndicator: {
    position: 'absolute',
    right: theme.spacing.md,
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
  predictionsList: {
    maxHeight: 200,
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






