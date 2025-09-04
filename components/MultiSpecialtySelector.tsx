import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

interface MultiSpecialtySelectorProps {
  selectedSpecialties: string[];
  onSpecialtiesChange: (specialties: string[]) => void;
  maxSpecialties?: number;
}

export const MultiSpecialtySelector: React.FC<MultiSpecialtySelectorProps> = ({
  selectedSpecialties,
  onSpecialtiesChange,
  maxSpecialties = 5,
}) => {
  const [newSpecialty, setNewSpecialty] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Lista predefinida de especialidades comunes
  const predefinedSpecialties = [
    'Plomería',
    'Electricidad',
    'Albañilería',
    'Carpintería',
    'Herrería',
    'Limpieza',
    'Mecánica',
    'Jardinería',
    'Pintura',
    'Aire Acondicionado',
    'Técnico en Computación',
    'Redes y Telecomunicaciones',
    'Cerrajería',
    'Gas',
    'Climatización',
    'Instalaciones Sanitarias',
    'Instalaciones Eléctricas',
    'Construcción',
    'Mantenimiento Industrial',
    'Seguridad Electrónica',
  ];

  const addSpecialty = (specialty: string) => {
    if (selectedSpecialties.length >= maxSpecialties) {
      Alert.alert(
        'Límite Alcanzado',
        `Puedes seleccionar máximo ${maxSpecialties} especialidades.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (selectedSpecialties.includes(specialty)) {
      Alert.alert('Ya Seleccionada', 'Esta especialidad ya está seleccionada.');
      return;
    }

    onSpecialtiesChange([...selectedSpecialties, specialty]);
  };

  const removeSpecialty = (specialty: string) => {
    onSpecialtiesChange(selectedSpecialties.filter(s => s !== specialty));
  };

  const addCustomSpecialty = () => {
    const trimmedSpecialty = newSpecialty.trim();
    
    if (!trimmedSpecialty) {
      Alert.alert('Error', 'Por favor ingresa una especialidad válida.');
      return;
    }

    if (trimmedSpecialty.length < 3) {
      Alert.alert('Error', 'La especialidad debe tener al menos 3 caracteres.');
      return;
    }

    if (trimmedSpecialty.length > 50) {
      Alert.alert('Error', 'La especialidad es demasiado larga.');
      return;
    }

    addSpecialty(trimmedSpecialty);
    setNewSpecialty('');
    setShowCustomInput(false);
  };

  const renderSpecialtyChip = (specialty: string, isSelected: boolean) => (
    <TouchableOpacity
      key={specialty}
      style={[
        styles.specialtyChip,
        isSelected ? styles.specialtyChipSelected : styles.specialtyChipUnselected
      ]}
      onPress={() => isSelected ? removeSpecialty(specialty) : addSpecialty(specialty)}
    >
      <Text style={[
        styles.specialtyChipText,
        isSelected ? styles.specialtyChipTextSelected : styles.specialtyChipTextUnselected
      ]}>
        {specialty}
      </Text>
      {isSelected && (
        <Ionicons 
          name="close-circle" 
          size={16} 
          color={theme.colors.white} 
          style={styles.removeIcon}
        />
      )}
    </TouchableOpacity>
  );

  const renderSelectedSpecialties = () => (
    <View style={styles.selectedContainer}>
      <Text style={styles.selectedTitle}>
        Especialidades Seleccionadas ({selectedSpecialties.length}/{maxSpecialties})
      </Text>
      <View style={styles.selectedChipsContainer}>
        {selectedSpecialties.map(specialty => renderSpecialtyChip(specialty, true))}
      </View>
      {selectedSpecialties.length === 0 && (
        <Text style={styles.noSpecialtiesText}>
          No has seleccionado especialidades aún
        </Text>
      )}
    </View>
  );

  const renderPredefinedSpecialties = () => (
    <View style={styles.predefinedContainer}>
      <Text style={styles.predefinedTitle}>Especialidades Disponibles</Text>
      <View style={styles.predefinedChipsContainer}>
        {predefinedSpecialties.map(specialty => 
          renderSpecialtyChip(specialty, selectedSpecialties.includes(specialty))
        )}
      </View>
    </View>
  );

  const renderCustomSpecialtyInput = () => (
    <View style={styles.customContainer}>
      <Text style={styles.customTitle}>Agregar Especialidad Personalizada</Text>
      
      {showCustomInput ? (
        <View style={styles.customInputContainer}>
          <TextInput
            style={styles.customInput}
            placeholder="Ej: Instalación de Sistemas de Riego"
            value={newSpecialty}
            onChangeText={setNewSpecialty}
            maxLength={50}
            autoFocus
          />
          <View style={styles.customInputButtons}>
            <TouchableOpacity
              style={styles.customInputButton}
              onPress={addCustomSpecialty}
            >
              <Ionicons name="checkmark" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.customInputButton, styles.customInputButtonCancel]}
              onPress={() => {
                setShowCustomInput(false);
                setNewSpecialty('');
              }}
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addCustomButton}
          onPress={() => setShowCustomInput(true)}
          disabled={selectedSpecialties.length >= maxSpecialties}
        >
          <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
          <Text style={styles.addCustomButtonText}>Agregar Especialidad Personalizada</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Especialidades Profesionales</Text>
      <Text style={styles.sectionDescription}>
        Selecciona las especialidades en las que te desempeñas. Puedes elegir hasta {maxSpecialties} especialidades.
      </Text>

      {renderSelectedSpecialties()}
      
      <ScrollView 
        style={styles.predefinedScrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderPredefinedSpecialties()}
        {renderCustomSpecialtyInput()}
      </ScrollView>

      {selectedSpecialties.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryBold}>Resumen:</Text> {selectedSpecialties.join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  selectedContainer: {
    marginBottom: theme.spacing.lg,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  selectedChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  noSpecialtiesText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: theme.spacing.md,
  },
  predefinedContainer: {
    marginBottom: theme.spacing.lg,
  },
  predefinedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  predefinedChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  predefinedScrollView: {
    maxHeight: 300,
  },
  customContainer: {
    marginBottom: theme.spacing.lg,
  },
  customTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  addCustomButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
  },
  customInputButtons: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  customInputButton: {
    backgroundColor: theme.colors.success,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  customInputButtonCancel: {
    backgroundColor: theme.colors.error,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    maxWidth: '100%',
  },
  specialtyChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  specialtyChipUnselected: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
  },
  specialtyChipText: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  specialtyChipTextSelected: {
    color: theme.colors.white,
  },
  specialtyChipTextUnselected: {
    color: theme.colors.text,
  },
  removeIcon: {
    marginLeft: theme.spacing.xs,
  },
  summaryContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  summaryBold: {
    fontWeight: '600',
  },
});

