import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { EnhancedServiceIcon } from '../../components/EnhancedServiceIcon';
import { clientAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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

const urgencyLevels = [
  { id: 'low', name: 'Baja', color: theme.colors.success, icon: 'time-outline' },
  { id: 'medium', name: 'Media', color: theme.colors.warning, icon: 'time-outline' },
  { id: 'high', name: 'Alta', color: theme.colors.error, icon: 'time-outline' },
];

export default function CreateRequestScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const { categoryId } = route.params || {};
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: categoryId || '',
    urgency: '',
    budget: '',
    location: '',
    preferredDate: '',
    contactPhone: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos Requeridos',
        'Necesitamos acceso a tu galería para seleccionar fotos del problema.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const selectImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        if (errors.image) {
          setErrors(prev => ({ ...prev, image: '' }));
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.category) {
      newErrors.category = 'Selecciona una categoría';
    }

    if (!formData.urgency) {
      newErrors.urgency = 'Selecciona el nivel de urgencia';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'El teléfono de contacto es requerido';
    }

    if (!selectedImage) {
      newErrors.image = 'Debes seleccionar una foto del problema';
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

    setLoading(true);
    
    try {
      const requestData: any = {
        clientId: user.id,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        budget: formData.budget,
        urgency: formData.urgency,
        contactPhone: formData.contactPhone,
        image: selectedImage, // Incluir la imagen seleccionada
      };

      // Solo incluir preferredDate si no está vacío
      if (formData.preferredDate && formData.preferredDate.trim() !== '') {
        requestData.preferredDate = formData.preferredDate;
      }

      const response = await clientAPI.createRequest(requestData);
      
      if (response.success) {
        Alert.alert(
          'Solicitud Creada',
          'Tu solicitud ha sido creada exitosamente. Los profesionales recibirán una notificación.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Error al crear la solicitud');
      }
    } catch (error) {
      console.error('Error creando solicitud:', error);
      Alert.alert('Error', 'Error de conexión al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con logo */}
        <Header 
          title="Nueva Solicitud" 
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Foto del Problema</Text>
            {errors.image && (
              <Text style={styles.errorText}>{errors.image}</Text>
            )}
            
            {selectedImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imageSelector} onPress={selectImage}>
                <Ionicons name="camera-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.imageSelectorText}>Seleccionar foto del problema</Text>
                <Text style={styles.imageSelectorSubtext}>Toca para elegir desde tu galería</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Servicio</Text>
            
            <Input
              label="Título de la solicitud"
              placeholder="Ej: Reparación de tubería en baño"
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              error={errors.title}
            />

            <Input
              label="Descripción detallada"
              placeholder="Describe el problema o servicio que necesitas..."
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              multiline
              numberOfLines={4}
              error={errors.description}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categoría</Text>
            {errors.category && (
              <Text style={styles.errorText}>{errors.category}</Text>
            )}
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    formData.category === category.id && styles.categoryCardActive,
                  ]}
                  onPress={() => updateFormData('category', category.id)}
                >
                  <EnhancedServiceIcon type={category.id} size={50} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nivel de Urgencia</Text>
            {errors.urgency && (
              <Text style={styles.errorText}>{errors.urgency}</Text>
            )}
            <View style={styles.urgencyContainer}>
              {urgencyLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.urgencyCard,
                    formData.urgency === level.id && styles.urgencyCardActive,
                  ]}
                  onPress={() => updateFormData('urgency', level.id)}
                >
                  <Ionicons
                    name={level.icon as any}
                    size={20}
                    color={formData.urgency === level.id ? theme.colors.white : level.color}
                  />
                  <Text
                    style={[
                      styles.urgencyText,
                      formData.urgency === level.id && styles.urgencyTextActive,
                    ]}
                  >
                    {level.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles Adicionales</Text>
            
            <Input
              label="Presupuesto estimado (opcional)"
              placeholder="Ej: $50 - $100"
              value={formData.budget}
              onChangeText={(value) => updateFormData('budget', value)}
            />

            <Input
              label="Ubicación"
              placeholder="Dirección donde se realizará el trabajo"
              value={formData.location}
              onChangeText={(value) => updateFormData('location', value)}
              error={errors.location}
            />

            <Input
              label="Fecha preferida (opcional)"
              placeholder="Ej: 15 de enero, 2024 o 2024-12-25"
              value={formData.preferredDate}
              onChangeText={(value) => updateFormData('preferredDate', value)}
            />
            <Text style={styles.helpText}>
              Formatos válidos: "15 de enero, 2024", "2024-12-25", "25/12/2024"
            </Text>

            <Input
              label="Teléfono de contacto"
              placeholder="+506 8888 8888"
              value={formData.contactPhone}
              onChangeText={(value) => updateFormData('contactPhone', value)}
              keyboardType="phone-pad"
              error={errors.contactPhone}
            />
          </View>

          <View style={styles.submitContainer}>
            <Button
              title={loading ? "Creando..." : "Crear Solicitud"}
              onPress={handleSubmit}
              style={styles.submitButton}
              disabled={loading}
            />
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Guardando solicitud...</Text>
              </View>
            )}
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
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
  },
  // Estilos para selección de imagen
  imageSelector: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  imageSelectorText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  imageSelectorSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs,
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
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  categoryCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 18,
  },
  urgencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  urgencyCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginHorizontal: theme.spacing.xs,
  },
  urgencyCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  urgencyTextActive: {
    color: theme.colors.white,
  },
  submitContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 60,
    backgroundColor: theme.colors.white,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  helpText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
});

