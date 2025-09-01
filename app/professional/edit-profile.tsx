import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { useProfessional } from '../../contexts/ProfessionalContext';
import { professionalAPI } from '../../services/api';

// Datos por defecto para el formulario
const defaultFormData = {
  name: '',
  email: '',
  phone: '',
  specialty: '',
  experience: '',
  description: '',
  location: '',
  availability: '',
  responseTime: '',
  services: [] as string[],
  priceRange: '',
  certifications: [] as string[],
  languages: [] as string[],
};

const categories = [
  { id: 'plomeria', name: 'Plomería', icon: 'water-outline', color: '#3b82f6' },
  { id: 'gas', name: 'Gas', icon: 'flame-outline', color: '#f97316' },
  { id: 'electricidad', name: 'Electricidad', icon: 'flash-outline', color: '#ef4444' },
  { id: 'albanileria', name: 'Albañilería', icon: 'construct-outline', color: '#f59e0b' },
  { id: 'carpinteria', name: 'Carpintería', icon: 'hammer-outline', color: '#8b4513' },
  { id: 'herreria', name: 'Herrería', icon: 'hardware-chip-outline', color: '#64748b' },
  { id: 'limpieza', name: 'Limpieza', icon: 'sparkles-outline', color: '#10b981' },
  { id: 'mecanica', name: 'Mecánica', icon: 'car-outline', color: '#1e293b' },
  { id: 'aire_acondicionado', name: 'Aire Acondicionado', icon: 'thermometer-outline', color: '#0ea5e9' },
  { id: 'tecnico_comp_redes', name: 'Técnico en Comp y Redes', icon: 'laptop-outline', color: '#6366f1' },
  { id: 'cerrajeria', name: 'Cerrajería', icon: 'key-outline', color: '#7c3aed' },
];

const experienceLevels = [
  { id: 'beginner', name: 'Principiante (0-2 años)' },
  { id: 'intermediate', name: 'Intermedio (3-5 años)' },
  { id: 'advanced', name: 'Avanzado (6-10 años)' },
  { id: 'expert', name: 'Experto (10+ años)' },
];

export default function EditProfileScreen({ navigation }: any) {
  const { professional, updateProfessional } = useProfessional();
  const [formData, setFormData] = useState(defaultFormData);

  // Cargar datos del profesional cuando el componente se monta
  useEffect(() => {
    if (professional) {
      setFormData({
        name: professional.name || '',
        email: professional.email || '',
        phone: professional.phone || '',
        specialty: professional.specialty || '',
        experience: professional.experience || '',
        description: professional.description || '',
        location: professional.location || '',
        availability: professional.availability || '',
        responseTime: professional.responseTime || '',
        services: professional.services || [],
        priceRange: professional.priceRange || '',
        certifications: professional.certifications || [],
        languages: professional.languages || [],
      });
    }
  }, [professional]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addService = (service: string) => {
    if (service.trim() && !formData.services.includes(service.trim())) {
      updateFormData('services', [...formData.services, service.trim()]);
    }
  };

  const removeService = (service: string) => {
    updateFormData('services', formData.services.filter(s => s !== service));
  };

  const addCertification = (certification: string) => {
    if (certification.trim() && !formData.certifications.includes(certification.trim())) {
      updateFormData('certifications', [...formData.certifications, certification.trim()]);
    }
  };

  const removeCertification = (certification: string) => {
    updateFormData('certifications', formData.certifications.filter(c => c !== certification));
  };

  const addLanguage = (language: string) => {
    if (language.trim() && !formData.languages.includes(language.trim())) {
      updateFormData('languages', [...formData.languages, language.trim()]);
    }
  };

  const removeLanguage = (language: string) => {
    updateFormData('languages', formData.languages.filter(l => l !== language));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
    if (!formData.specialty) newErrors.specialty = 'Selecciona una especialidad';
    if (!formData.experience) newErrors.experience = 'Selecciona tu nivel de experiencia';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.location.trim()) newErrors.location = 'La ubicación es requerida';
    if (formData.services.length === 0) newErrors.services = 'Agrega al menos un servicio';
    if (!formData.priceRange.trim()) newErrors.priceRange = 'El rango de precios es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        // Actualizar en el backend
        const response = await professionalAPI.updateProfile({
          professionalId: professional?.id,
          ...formData
        });

        if (response.success) {
          // Actualizar el contexto local
          updateProfessional(formData);
          
          Alert.alert(
            'Perfil Actualizado',
            'Tu perfil ha sido actualizado exitosamente.',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        } else {
          Alert.alert('Error', response.error || 'Error al actualizar el perfil');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Error de conexión al actualizar el perfil');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con logo y botón guardar */}
      <Header 
        title="Editar Perfil" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightAction={{
          text: "Guardar",
          onPress: handleSave
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nombre Completo</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>
        </View>

        {/* Información Profesional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Profesional</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Especialidad</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    formData.specialty === category.id && styles.categoryCardActive,
                  ]}
                  onPress={() => updateFormData('specialty', category.id)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <Ionicons name={category.icon as any} size={24} color={category.color} />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.specialty && <Text style={styles.errorText}>{errors.specialty}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nivel de Experiencia</Text>
            {experienceLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.experienceCard,
                  formData.experience === level.id && styles.experienceCardActive,
                ]}
                onPress={() => updateFormData('experience', level.id)}
              >
                <Text style={[
                  styles.experienceText,
                  formData.experience === level.id && styles.experienceTextActive,
                ]}>
                  {level.name}
                </Text>
              </TouchableOpacity>
            ))}
            {errors.experience && <Text style={styles.errorText}>{errors.experience}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Descripción Profesional</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              multiline
              numberOfLines={4}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ubicación de Trabajo</Text>
            <TextInput
              style={[styles.input, errors.location && styles.inputError]}
              value={formData.location}
              onChangeText={(value) => updateFormData('location', value)}
            />
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Horarios de Disponibilidad</Text>
            <TextInput
              style={styles.input}
              value={formData.availability}
              onChangeText={(value) => updateFormData('availability', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tiempo de Respuesta</Text>
            <TextInput
              style={styles.input}
              value={formData.responseTime}
              onChangeText={(value) => updateFormData('responseTime', value)}
            />
          </View>
        </View>

        {/* Servicios y Precios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios y Precios</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Servicios que Ofreces</Text>
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                placeholder="Ej: Reparación de tuberías"
                onSubmitEditing={(e) => {
                  addService(e.nativeEvent.text);
                  e.currentTarget.clear();
                }}
              />
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={20} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.itemsList}>
              {formData.services.map((service, index) => (
                <View key={index} style={styles.itemCard}>
                  <Text style={styles.itemText}>{service}</Text>
                  <TouchableOpacity onPress={() => removeService(service)}>
                    <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            {errors.services && <Text style={styles.errorText}>{errors.services}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Rango de Precios</Text>
            <TextInput
              style={[styles.input, errors.priceRange && styles.inputError]}
              value={formData.priceRange}
              onChangeText={(value) => updateFormData('priceRange', value)}
            />
            {errors.priceRange && <Text style={styles.errorText}>{errors.priceRange}</Text>}
          </View>
        </View>

        {/* Certificaciones e Idiomas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certificaciones e Idiomas</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Certificaciones</Text>
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                placeholder="Ej: Técnico en Plomería"
                onSubmitEditing={(e) => {
                  addCertification(e.nativeEvent.text);
                  e.currentTarget.clear();
                }}
              />
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={20} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.itemsList}>
              {formData.certifications.map((certification, index) => (
                <View key={index} style={styles.itemCard}>
                  <Text style={styles.itemText}>{certification}</Text>
                  <TouchableOpacity onPress={() => removeCertification(certification)}>
                    <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Idiomas que Hablas</Text>
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                placeholder="Ej: Español"
                onSubmitEditing={(e) => {
                  addLanguage(e.nativeEvent.text);
                  e.currentTarget.clear();
                }}
              />
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={20} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.itemsList}>
              {formData.languages.map((language, index) => (
                <View key={index} style={styles.itemCard}>
                  <Text style={styles.itemText}>{language}</Text>
                  <TouchableOpacity onPress={() => removeLanguage(language)}>
                    <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  content: {
    flex: 1,
  },
  section: {
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    backgroundColor: theme.colors.white,
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    backgroundColor: theme.colors.white,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
  },
  categoryCard: {
    width: '48%',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  categoryCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  experienceCard: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  experienceCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  experienceText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  experienceTextActive: {
    color: theme.colors.white,
  },
  addItemContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  addItemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    backgroundColor: theme.colors.white,
    marginRight: theme.spacing.sm,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsList: {
    gap: theme.spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  itemText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
});
