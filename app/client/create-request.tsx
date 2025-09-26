import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useRequests } from '../../contexts/RequestsContext';
import { clientAPI } from '../../services/api';
import googlePlacesService from '../../services/googlePlacesService';
import { AddressAutocompleteSimple } from '../../components/AddressAutocompleteSimple';

export default function CreateRequestScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { addNewRequest } = useRequests();
  const { categoryId } = (route.params as any) || {};
  const [formData, setFormData] = useState({
    urgency: '',
    description: '',
    serviceType: '',
    location: '',
    images: [] as string[],
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);


  // Establecer automáticamente el tipo de servicio si viene desde una categoría
  useEffect(() => {
    if (categoryId) {
      // Buscar la categoría por ID
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        updateFormData('serviceType', category.name);
      }
    }
  }, [categoryId]);

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const showImagePicker = () => {
    Alert.alert(
      'Seleccionar imagen',
      '¿Cómo quieres agregar la imagen?',
      [
        {
          text: 'Cámara',
          onPress: () => takePhoto(),
        },
        {
          text: 'Galería',
          onPress: () => pickFromGallery(),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async () => {
    try {
      console.log('📸 Iniciando toma de foto...');
      
      // Verificar si la cámara está disponible
      const cameraAvailable = await ImagePicker.getCameraPermissionsAsync();
      console.log('📸 Cámara disponible:', cameraAvailable);
      
      if (!cameraAvailable.canAskAgain && !cameraAvailable.granted) {
        Alert.alert(
          'Cámara no disponible', 
          'La cámara no está disponible en este dispositivo o los permisos fueron denegados permanentemente.'
        );
        return;
      }
      
      // Solicitar permisos de cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('📸 Estado de permisos de cámara:', status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos', 
          'Necesitamos acceso a tu cámara para tomar fotos. Por favor, habilita los permisos de cámara en la configuración de la app.'
        );
        return;
      }

      console.log('📸 Abriendo cámara...');
      
      // Configuración básica para la cámara
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });

      console.log('📸 Resultado de la cámara:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        console.log('📸 Foto tomada exitosamente:', selectedImageUri);
        
        setSelectedImage(selectedImageUri);
        updateFormData('images', [selectedImageUri]);
        
        console.log('✅ Imagen guardada en formData');
      } else {
        console.log('📸 Usuario canceló la toma de foto');
      }
    } catch (error) {
      console.error('❌ Error tomando foto:', error);
      
      // Mensaje más específico según el tipo de error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('camera')) {
        Alert.alert(
          'Cámara no disponible', 
          'No se pudo acceder a la cámara. Esto puede suceder si estás usando un simulador o si la cámara no está disponible en tu dispositivo.'
        );
      } else {
        Alert.alert(
          'Error', 
          'No se pudo abrir la cámara. Verifica que la cámara esté disponible y que tengas los permisos necesarios.'
        );
      }
    }
  };

  const pickFromGallery = async () => {
    try {
      // Solicitar permisos de galería
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
        console.log('🖼️ Imagen seleccionada:', selectedImageUri);
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

  const handlePlaceSelected = (placeDetails: any) => {
    console.log('📍 Lugar seleccionado:', placeDetails);
    setSelectedPlace(placeDetails);
  };

  const handleSubmit = async () => {
    if (!formData.urgency || !formData.description || !formData.serviceType || !formData.location) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'No se pudo identificar al usuario');
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtener coordenadas reales para la ubicación
      console.log('🗺️ Obteniendo coordenadas para la ubicación...');
      let locationData;
      
      // Si hay un lugar seleccionado, usar sus coordenadas
      if (selectedPlace && selectedPlace.coordinates) {
        locationData = {
          coordinates: selectedPlace.coordinates,
          address: selectedPlace.address,
          placeId: selectedPlace.placeId,
        };
        console.log('📍 Usando lugar seleccionado:', locationData);
      } else {
        // Si no hay lugar seleccionado, intentar geocodificar la dirección
        try {
          locationData = await googlePlacesService.getCoordinatesForRequest(formData.location);
          console.log('📍 Datos de ubicación obtenidos:', locationData);
        } catch (geocodeError) {
          console.log('⚠️ Error en geocodificación, no se pueden obtener coordenadas...');
          // Si falla la geocodificación, no usar coordenadas por defecto
          locationData = {
            coordinates: null, // No usar coordenadas por defecto
            address: formData.location,
            fallback: true,
          };
        }
      }

      // Mapear urgencia a texto en español para el título
      const urgencyMap: { [key: string]: string } = {
        'low': 'Baja',
        'medium': 'Media', 
        'high': 'Alta'
      };

      const requestData = {
        clientId: user.id,
        title: `Solicitud de ${formData.serviceType} - ${urgencyMap[formData.urgency] || formData.urgency}`, // Título generado automáticamente
        category: formData.serviceType,
        description: formData.description,
        location: locationData.address, // Usar la dirección formateada
        coordinates: locationData.coordinates, // Coordenadas reales
        images: formData.images,
        urgency: formData.urgency, // Valor en inglés para el backend
        budget: 'No especificado', // Por defecto
        preferredDate: null, // Por defecto
        contactPhone: user.phone || null,
      };

      console.log('🔍 Enviando solicitud:', requestData);
      console.log('🔍 FormData completo:', formData);
      console.log('🔍 User data:', { id: user.id, phone: user.phone });
      
      // Enviar al backend real
      const response = await clientAPI.createRequest(requestData);
      
      console.log('📥 Respuesta del backend:', response);
      
      if (response.success) {
        // Agregar la nueva solicitud al contexto para actualización automática
        const newRequest = {
          _id: response.data?.id || `temp_${Date.now()}`,
          title: requestData.title,
          category: requestData.category,
          description: requestData.description,
          location: requestData.location,
          urgency: requestData.urgency,
          status: 'pending',
          createdAt: new Date().toISOString(),
          clientId: user.id
        };
        
        console.log('📝 Nueva solicitud creada:', newRequest);
        addNewRequest(newRequest);
        
        // Obtener información de profesionales disponibles
        const availableProfessionalsCount = response.data?.availableProfessionalsCount || 0;
        const message = response.data?.message || 'Solicitud creada exitosamente';
        
        Alert.alert(
          'Solicitud Enviada',
          message,
          [
            {
              text: 'Ver Estado',
              onPress: () => {
                // Regresar a la pantalla anterior (probablemente la lista de solicitudes)
                navigation.goBack();
              },
            },
            { text: 'OK', onPress: () => navigation.goBack() },
          ]
        );
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
      
    } catch (error) {
      console.error('Error al crear la solicitud:', error);
      
      // Mostrar el mensaje específico del error si está disponible
      let errorMessage = 'No se pudo crear la solicitud. Inténtalo de nuevo.';
      
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Categorías iguales a las del home
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
    { value: 'low', label: 'Baja', description: 'Puede esperar unos días' },
    { value: 'medium', label: 'Media', description: 'Necesita atención pronto' },
    { value: 'high', label: 'Alta', description: 'Urgente - necesita atención inmediata' }
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
            
            <View style={styles.urgencySection}>
              <Text style={styles.urgencyLabel}>Tiempo de ejecución</Text>
              <View style={styles.urgencyOptions}>
                {urgencyLevels.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.urgencyCard,
                      formData.urgency === level.value && styles.urgencyCardActive,
                    ]}
                    onPress={() => updateFormData('urgency', level.value)}
                  >
                    <Text style={[
                      styles.urgencyLabelText,
                      formData.urgency === level.value && styles.urgencyLabelTextActive,
                    ]}>
                      {level.label}
                    </Text>
                    <Text style={[
                      styles.urgencyDescription,
                      formData.urgency === level.value && styles.urgencyDescriptionActive,
                    ]}>
                      {level.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

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
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <AddressAutocompleteSimple
              label="Dirección del servicio"
              placeholder="Ingresa la dirección donde se realizará el trabajo (ej: Córdoba Capital, Av. Colón 1234, etc.)"
              value={formData.location}
              onChangeText={(value) => updateFormData('location', value)}
              onPlaceSelected={handlePlaceSelected}
            />
            
            {/* Información sobre autocompletado */}
            <Text style={styles.autocompleteInfo}>
              💡 Escribe al menos 3 caracteres para ver sugerencias de direcciones
            </Text>
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
                  <TouchableOpacity style={styles.imageActionButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={20} color={theme.colors.primary} />
                    <Text style={styles.imageActionText}>Sacar foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.imageActionButton} onPress={pickFromGallery}>
                    <Ionicons name="images" size={20} color={theme.colors.primary} />
                    <Text style={styles.imageActionText}>Galería</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.imageActionButton} onPress={removeImage}>
                    <Ionicons name="trash" size={20} color={theme.colors.error} />
                    <Text style={styles.imageActionText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <View style={styles.imagePicker}>
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={40} color={theme.colors.textSecondary} />
                    <Text style={styles.imagePlaceholderText}>Agregar foto del problema</Text>
                    <Text style={styles.imagePlaceholderSubtext}>
                      Elige una opción para agregar una imagen
                    </Text>
                  </View>
                </View>
                <View style={styles.inlineActions}>
                  <TouchableOpacity style={styles.inlineButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={20} color={theme.colors.white} />
                    <Text style={styles.inlineButtonText}>Sacar foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.inlineButton, styles.inlineButtonSecondary]} onPress={pickFromGallery}>
                    <Ionicons name="images" size={20} color={theme.colors.primary} />
                    <Text style={[styles.inlineButtonText, styles.inlineButtonTextSecondary]}>Galería</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Sección de Tipo de Servicio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo de Servicio</Text>
            
            {/* Mostrar tipo de servicio si viene automáticamente */}
            {categoryId && formData.serviceType && (
              <View style={[
                styles.serviceTypeDisplayCard,
                { backgroundColor: categories.find(cat => cat.name === formData.serviceType)?.color || theme.colors.primary }
              ]}>
                <Text style={styles.serviceTypeDisplayText}>{formData.serviceType}</Text>
              </View>
            )}
            
            {/* Mostrar selección de categorías solo si no viene desde una categoría específica */}
            {!categoryId && (
              <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      formData.serviceType === category.name && styles.categoryCardActive,
                    ]}
                    onPress={() => updateFormData('serviceType', category.name)}
                  >
                    <Ionicons 
                      name={category.icon as any} 
                      size={24} 
                      color={formData.serviceType === category.name ? theme.colors.white : category.color} 
                    />
                    <Text style={[
                      styles.categoryText,
                      formData.serviceType === category.name && styles.categoryTextActive,
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  inlineActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  inlineButtonSecondary: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  inlineButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  inlineButtonTextSecondary: {
    color: theme.colors.primary,
  },
  // Estilos para texto del placeholder
  imagePlaceholderSubtext: {
    marginTop: theme.spacing.xs,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  // Estilos para sección de urgencia
  urgencySection: {
    marginBottom: theme.spacing.lg,
  },
  urgencyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  urgencyOptions: {
    gap: theme.spacing.sm,
  },
  urgencyCard: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  urgencyCardActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  urgencyLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  urgencyLabelTextActive: {
    color: theme.colors.white,
  },
  urgencyDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  urgencyDescriptionActive: {
    color: theme.colors.white,
    opacity: 0.9,
  },
  // Estilos para mostrar el tipo de servicio
  serviceTypeDisplay: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  serviceTypeDisplayLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  serviceTypeDisplayCard: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  serviceTypeDisplayText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  // Estilos para la selección de categorías
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  categoryCardActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  categoryTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  // Estilos para información de autocompletado
  autocompleteInfo: {
    marginTop: theme.spacing.sm,
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

