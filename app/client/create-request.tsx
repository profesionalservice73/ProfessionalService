import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../config/theme';
import { Input } from '../../components/Input';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { clientAPI } from '../../services/api';

export default function CreateRequestScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: '',
    location: '',
    images: [] as string[],
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    try {
      // Solicitar permisos de cámara y galería
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu galería para seleccionar fotos');
        return;
      }

      // Abrir selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        setSelectedImage(selectedImageUri);
        updateFormData('images', [selectedImageUri]);
        console.log('🔍 Imagen seleccionada:', selectedImageUri);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    updateFormData('images', []);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.serviceType || !formData.location) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'No se pudo identificar al usuario');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        clientId: user.id,
        title: formData.title,
        category: formData.serviceType,
        description: formData.description,
        location: formData.location,
        images: formData.images,
        urgency: 'medium', // Por defecto
        budget: 'No especificado', // Por defecto
        preferredDate: null, // Por defecto
        contactPhone: user.phone || null,
      };

      console.log('🔍 Enviando solicitud:', requestData);
      
      // Enviar al backend real
      const response = await clientAPI.createRequest(requestData);
      
      if (response.success) {
        Alert.alert(
          'Solicitud Creada',
          'Tu solicitud de servicio ha sido creada exitosamente. Los profesionales podrán verla y contactarte.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
      
    } catch (error) {
      console.error('Error al crear la solicitud:', error);
      Alert.alert('Error', 'No se pudo crear la solicitud. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Crear Solicitud de Servicio</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Básica</Text>
            
            <Input
              label="Título de la solicitud"
              placeholder="Ej: Necesito un plomero urgente"
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
            />

            <Input
              label="Descripción del problema"
              placeholder="Describe detalladamente el problema que necesitas resolver..."
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo de Servicio</Text>
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
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos del Problema</Text>
            <Text style={styles.sectionSubtitle}>
              Agrega fotos para que los profesionales entiendan mejor el problema
            </Text>
            
            {selectedImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                <View style={styles.imageActions}>
                  <TouchableOpacity style={styles.imageActionButton} onPress={pickImage}>
                    <Ionicons name="camera" size={20} color={theme.colors.primary} />
                    <Text style={styles.imageActionText}>Cambiar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.imageActionButton} onPress={removeImage}>
                    <Ionicons name="trash" size={20} color={theme.colors.error} />
                    <Text style={styles.imageActionText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color={theme.colors.textSecondary} />
                  <Text style={styles.imagePlaceholderText}>Agregar foto del problema</Text>
                  <Text style={styles.imagePlaceholderSubtext}>
                    Toca aquí para seleccionar una imagen
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Creando Solicitud...' : 'Crear Solicitud'}
          </Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.xl + theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
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
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  selectedImage: {
    width: 200,
    height: 150,
    borderRadius: theme.borderRadius.md,
  },
  footer: {
    paddingBottom: 60,
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
  submitButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.7,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos para subtítulos de sección
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  // Estilos para contenedor de imagen
  imageContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  // Estilos para acciones de imagen
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  imageActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Estilos para texto del placeholder
  imagePlaceholderSubtext: {
    marginTop: theme.spacing.xs,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

