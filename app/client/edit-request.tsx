import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Input } from '../../components/Input';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

export default function EditRequestScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { request } = route.params as any;

  const [formData, setFormData] = useState({
    title: request.title || '',
    description: request.description || '',
    serviceType: request.serviceType || '',
    location: request.location || '',
    images: request.images || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.serviceType) {
      newErrors.serviceType = 'Selecciona el tipo de servicio';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user?.id) {
      Alert.alert('Error', 'No se pudo identificar al usuario');
      return;
    }

    try {
      const updatedData = {
        title: formData.title,
        description: formData.description,
        serviceType: formData.serviceType,
        location: formData.location,
        images: formData.images,
      };

      const requestId = request._id || request.id;
      if (!requestId) {
        Alert.alert('Error', 'No se pudo identificar la solicitud');
        return;
      }
      
      // Aquí iría la lógica para actualizar la solicitud en el backend
      console.log('Actualizando solicitud:', updatedData);
      
      Alert.alert(
        'Solicitud Actualizada',
        'Tu solicitud ha sido actualizada exitosamente.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error actualizando solicitud:', error);
      Alert.alert('Error', 'Error de conexión al actualizar la solicitud');
    }
  };

  const serviceTypes = [
    'Plomería',
    'Electricidad',
    'Limpieza',
    'Pintura',
    'Jardinería',
    'Albañilería',
    'Otros'
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Editar Solicitud</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Básica</Text>
            
            <Input
              label="Título de la solicitud"
              placeholder="Ej: Necesito un plomero urgente"
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              error={errors.title}
            />

            <Input
              label="Descripción del problema"
              placeholder="Describe detalladamente el problema que necesitas resolver..."
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              multiline
              numberOfLines={4}
              error={errors.description}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo de Servicio</Text>
            {errors.serviceType && (
              <Text style={styles.errorText}>{errors.serviceType}</Text>
            )}
            <View style={styles.serviceTypesGrid}>
              {serviceTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.serviceTypeCard,
                    formData.serviceType === type && styles.serviceTypeCardActive,
                  ]}
                  onPress={() => updateFormData('serviceType', type)}
                >
                  <Text style={[
                    styles.serviceTypeText,
                    formData.serviceType === type && styles.serviceTypeTextActive,
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <Input
              label="Dirección del servicio"
              placeholder="Ingresa la dirección donde se realizará el trabajo"
              value={formData.location}
              onChangeText={(value) => updateFormData('location', value)}
              error={errors.location}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos del Problema</Text>
            {formData.images && formData.images.length > 0 ? (
              <View style={styles.imagesContainer}>
                {formData.images.map((image: string, index: number) => (
                  <Image key={index} source={{ uri: image }} style={styles.image} />
                ))}
              </View>
            ) : (
              <Text style={styles.noImagesText}>No hay fotos disponibles</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Actualizar Solicitud</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  form: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
  },
  serviceTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  serviceTypeCard: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  serviceTypeCardActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  serviceTypeText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  serviceTypeTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.md,
  },
  noImagesText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

