import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { theme } from "../../config/theme";
import { useAuth } from "../../contexts/AuthContext";
import { Header } from "../../components/Header";
import { EnhancedServiceIcon } from "../../components/EnhancedServiceIcon";
import { useRequests } from "../../contexts/RequestsContext";
import { clientAPI } from "../../services/api";
import { useNavigation, useRoute } from "@react-navigation/native";

// Categorías disponibles (mismo que en el seed del backend)
const defaultCategories = [
  {
    _id: "plomeria",
    name: 'Plomería',
    icon: 'water-outline',
    color: '#3b82f6'
  },
  {
    _id: "gas",
    name: 'Gas',
    icon: 'flame-outline',
    color: '#f97316'
  },
  {
    _id: "electricidad",
    name: 'Electricidad',
    icon: 'flash-outline',
    color: '#ef4444'
  },
  {
    _id: "albanileria",
    name: 'Albañilería',
    icon: 'construct-outline',
    color: '#f59e0b'
  },
  {
    _id: "carpinteria",
    name: 'Carpintería',
    icon: 'hammer-outline',
    color: '#8b4513'
  },
  {
    _id: "herreria",
    name: 'Herrería',
    icon: 'hardware-chip-outline',
    color: '#64748b'
  },
  {
    _id: "limpieza",
    name: 'Limpieza',
    icon: 'sparkles-outline',
    color: '#10b981'
  },
  {
    _id: "mecanica",
    name: 'Mecánica',
    icon: 'car-outline',
    color: '#1e293b'
  },
  {
    _id: "aire_acondicionado",
    name: 'Aire Acondicionado',
    icon: 'thermometer-outline',
    color: '#0ea5e9'
  },
  {
    _id: "tecnico_comp",
    name: 'Técnico en Comp y Redes',
    icon: 'laptop-outline',
    color: '#6366f1'
  },
  {
    _id: "cerrajeria",
    name: 'Cerrajería',
    icon: 'key-outline',
    color: '#7c3aed'
  }
];

export default function EditRequestScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { refreshRequests } = useRequests();
  const { request } = route.params as any;

  const [formData, setFormData] = useState({
    // Información básica
    title: "",
    description: "",
    location: "",
    urgency: "",
    
    // Tipo de servicio
    serviceType: "",
    
    // Fotos
    images: [] as string[],
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Cargar categorías disponibles
  useEffect(() => {
    loadCategories();
  }, []);

  // Poblar el formulario con los datos de la solicitud existente
  useEffect(() => {
    if (request) {
      setFormData({
        title: request.title || "",
        description: request.description || "",
        location: request.location || "",
        urgency: request.urgency || "",
        serviceType: request.category || "",
        images: request.images || [],
      });
    }
  }, [request]);

  const loadCategories = async () => {
    try {
      console.log('🔄 Cargando categorías...');
      setLoadingCategories(true);
      const response = await clientAPI.getCategories();
      
      console.log('📡 Respuesta de categorías:', response);
      console.log('📡 Response.success:', response.success);
      console.log('📡 Response.data:', response.data);
      console.log('📡 Response.data type:', typeof response.data);
      console.log('📡 Response.data isArray:', Array.isArray(response.data));
      
      if (response.success && response.data && response.data.length > 0) {
        const categoriesData = response.data || [];
        console.log('✅ Categorías cargadas desde backend:', categoriesData);
        console.log('✅ Cantidad de categorías:', categoriesData.length);
        setCategories(categoriesData);
      } else {
        console.log('⚠️ Usando categorías por defecto');
        console.log('✅ Categorías por defecto:', defaultCategories);
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error('❌ Error de conexión, usando categorías por defecto:', error);
      console.log('✅ Categorías por defecto:', defaultCategories);
      setCategories(defaultCategories);
    } finally {
      setLoadingCategories(false);
    }
  };

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const urgencyLevels = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
  ];

  const urgencyMap = {
    'low': 'Baja',
    'medium': 'Media', 
    'high': 'Alta'
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.urgency) {
      newErrors.urgency = 'Selecciona el tiempo de ejecución';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage = result.assets[0].uri;
        setSelectedImage(newImage);
        updateFormData('images', [...formData.images, newImage]);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'Error al seleccionar la imagen');
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData('images', newImages);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user?.id) {
      Alert.alert('Error', 'No se pudo identificar al usuario');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generar título automáticamente basado en el tipo de servicio y urgencia
      const urgencyLabel = urgencyMap[formData.urgency as keyof typeof urgencyMap];
      const title = `Solicitud de ${formData.serviceType} - ${urgencyLabel}`;

      const requestData = {
        title,
        description: formData.description,
        category: formData.serviceType,
        location: formData.location,
        urgency: formData.urgency,
        images: formData.images,
        budget: 'No especificado',
        preferredDate: null,
        contactPhone: null,
        status: 'pending',
      };

      console.log('📝 Datos de la solicitud a actualizar:', requestData);

      const requestId = request._id || request.id;
      if (!requestId) {
        Alert.alert('Error', 'No se pudo identificar la solicitud');
        return;
      }

      const response = await clientAPI.updateRequestFull(requestId, requestData);
      
      console.log('📡 Respuesta del backend:', response);

      if (response.success) {
        Alert.alert(
          'Solicitud Actualizada',
          'Tu solicitud ha sido actualizada exitosamente.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await refreshRequests();
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Error al actualizar la solicitud');
      }
    } catch (error) {
      console.error('Error actualizando solicitud:', error);
      Alert.alert('Error', 'Error de conexión al actualizar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || theme.colors.primary;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Editar Solicitud</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            {/* Tiempo de Ejecución */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tiempo de Ejecución</Text>
              <View style={styles.urgencyContainer}>
                {urgencyLevels.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.urgencyButton,
                      formData.urgency === level.value && styles.urgencyButtonActive,
                    ]}
                    onPress={() => updateFormData('urgency', level.value)}
                  >
                    <Text
                      style={[
                        styles.urgencyText,
                        formData.urgency === level.value && styles.urgencyTextActive,
                      ]}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.urgency && <Text style={styles.errorText}>{errors.urgency}</Text>}
            </View>

            {/* Descripción */}
            <View style={styles.section}>
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

            {/* Ubicación */}
            <View style={styles.section}>
            <Input
              label="Dirección del servicio"
              placeholder="Ingresa la dirección donde se realizará el trabajo (ej: Córdoba Capital, Av. Colón 1234, etc.)"
              value={formData.location}
              onChangeText={(value) => updateFormData('location', value)}
              error={errors.location}
            />
            </View>

            {/* Fotos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fotos del Problema</Text>
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleImagePicker}>
                <Ionicons name="camera" size={24} color={theme.colors.primary} />
                <Text style={styles.addPhotoText}>Agregar Foto</Text>
              </TouchableOpacity>
              
              {formData.images.length > 0 && (
                <View style={styles.imagesContainer}>
                  {formData.images.map((image, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri: image }} style={styles.image} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Tipo de Servicio - Todas las categorías disponibles */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo de Servicio</Text>
              {errors.serviceType && <Text style={styles.errorText}>{errors.serviceType}</Text>}
              {loadingCategories ? (
                <Text style={styles.loadingText}>Cargando categorías...</Text>
              ) : (
                <View style={styles.categoriesGrid}>
                  {categories.length === 0 ? (
                    <Text style={styles.loadingText}>No hay categorías disponibles</Text>
                  ) : (
                    categories.map((category) => (
                      <TouchableOpacity
                        key={category._id}
                        style={[
                          styles.categoryCard,
                          { borderColor: category.color },
                          formData.serviceType === category.name && {
                            backgroundColor: category.color,
                            borderColor: category.color,
                          },
                        ]}
                        onPress={() => updateFormData('serviceType', category.name)}
                      >
                        <EnhancedServiceIcon
                          name={category.icon as any}
                          size={24}
                          color={formData.serviceType === category.name ? theme.colors.white : category.color}
                        />
                        <Text
                          style={[
                            styles.categoryText,
                            formData.serviceType === category.name && styles.categoryTextActive,
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Footer con botón de envío */}
        <View style={styles.footer}>
          <Button
            title={isSubmitting ? "Actualizando..." : "Actualizar Solicitud"}
            onPress={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    paddingTop: 70,
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
  urgencyContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
  },
  urgencyButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  urgencyTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: theme.spacing.sm,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.backgroundSecondary,
  },
  addPhotoText: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.white,
    borderRadius: 10,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryCard: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    backgroundColor: theme.colors.white,
    minWidth: '30%',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    height:130,
    backgroundColor: theme.colors.background,
  },
});