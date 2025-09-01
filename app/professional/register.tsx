import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { EnhancedServiceIcon } from '../../components/EnhancedServiceIcon';
import { useProfessional } from '../../contexts/ProfessionalContext';
import { useAuth } from '../../contexts/AuthContext';
import { professionalAPI } from '../../services/api';

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

export default function ProfessionalRegisterScreen({ navigation }: any) {
  const { setRegistrationComplete, updateProfessional, loadProfessionalData } = useProfessional();
  const { user } = useAuth();
  

  
  const [formData, setFormData] = useState({
    // Información personal
    fullName: '',
    phone: '',
    email: '',
    
    // Información profesional
    specialty: '',
    experience: '',
    description: '',
    location: '',
    availability: '',
    responseTime: '',
    
    // Servicios y precios
    services: [] as string[],
    priceRange: '',
    
    // Certificaciones
    certifications: [] as string[],
    
    // Idiomas
    languages: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Estados para las imágenes
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [dniImage, setDniImage] = useState<string | null>(null);

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

  // Funciones para manejar imágenes
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos Requeridos',
        'Necesitamos acceso a tu galería para seleccionar fotos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const selectImage = async (type: 'profile' | 'dni') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        if (type === 'profile') {
          setProfileImage(result.assets[0].uri);
        } else {
          setDniImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async (type: 'profile' | 'dni') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos Requeridos',
        'Necesitamos acceso a tu cámara para tomar fotos.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        if (type === 'profile') {
          setProfileImage(result.assets[0].uri);
        } else {
          setDniImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  // Estados para manejar el texto de los inputs
  const [serviceText, setServiceText] = useState('');
  const [certificationText, setCertificationText] = useState('');
  const [languageText, setLanguageText] = useState('');

  // Funciones para manejar los botones de agregar
  const handleAddService = () => {
    if (serviceText.trim()) {
      addService(serviceText);
      setServiceText('');
    }
  };

  const handleAddCertification = () => {
    if (certificationText.trim()) {
      addCertification(certificationText);
      setCertificationText('');
    }
  };

  const handleAddLanguage = () => {
    if (languageText.trim()) {
      addLanguage(languageText);
      setLanguageText('');
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'El nombre completo es requerido';
      if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
      if (!formData.email.trim()) newErrors.email = 'El email es requerido';
      if (!profileImage) newErrors.profileImage = 'La foto de perfil es requerida';
    }

    if (step === 2) {
      if (!formData.specialty) newErrors.specialty = 'Selecciona una especialidad';
      if (!formData.experience) newErrors.experience = 'Selecciona tu nivel de experiencia';
      if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
      if (!formData.location.trim()) newErrors.location = 'La ubicación es requerida';
      if (!dniImage) newErrors.dniImage = 'La foto del DNI es requerida';
    }

    if (step === 3) {
      if (formData.services.length === 0) newErrors.services = 'Agrega al menos un servicio';
      if (!formData.priceRange.trim()) newErrors.priceRange = 'El rango de precios es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      setLoading(true);
      try {
        // Llamar al backend para completar el registro
        const response = await professionalAPI.completeRegistration({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          profileImage: profileImage,
          dniImage: dniImage,
          specialty: formData.specialty,
          experience: formData.experience,
          description: formData.description,
          location: formData.location,
          availability: formData.availability,
          responseTime: formData.responseTime,
          services: formData.services,
          priceRange: formData.priceRange,
          certifications: formData.certifications,
          languages: formData.languages,
        }, user?.id);

        if (response.success) {
          // Recargar los datos del profesional desde el backend
          await loadProfessionalData();
          
          Alert.alert(
            'Registro Exitoso',
            'Tu perfil profesional ha sido creado exitosamente. Los clientes podrán encontrarte y contactarte.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // No navegar manualmente, dejar que RegistrationGuard maneje la navegación
                  // El RegistrationGuard detectará que isRegistrationComplete es true
                  // y automáticamente mostrará el panel principal
                },
              },
            ]
          );
        } else {
          Alert.alert('Error', response.error || 'Error al completar el registro');
        }
      } catch (error) {
        Alert.alert('Error', 'Error de conexión al completar el registro');
      } finally {
        setLoading(false);
      }
    }
  };



  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Información Personal</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Foto de Perfil</Text>
        {errors.profileImage && <Text style={styles.errorText}>{errors.profileImage}</Text>}
        
        {profileImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            <TouchableOpacity style={styles.removeImageButton} onPress={() => setProfileImage(null)}>
              <Ionicons name="close-circle" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageSelectorContainer}>
            <TouchableOpacity style={styles.imageSelector} onPress={() => takePhoto('profile')}>
              <Ionicons name="camera" size={32} color={theme.colors.primary} />
              <Text style={styles.imageSelectorText}>Tomar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageSelector} onPress={() => selectImage('profile')}>
              <Ionicons name="images" size={32} color={theme.colors.primary} />
              <Text style={styles.imageSelectorText}>Galería</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nombre Completo</Text>
        <TextInput
          style={[styles.input, errors.fullName && styles.inputError]}
          placeholder="Tu nombre completo"
          value={formData.fullName}
          onChangeText={(value) => updateFormData('fullName', value)}
        />
        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Teléfono</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          placeholder="+506 8888 8888"
          value={formData.phone}
          onChangeText={(value) => updateFormData('phone', value)}
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="tu@email.com"
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Información Profesional</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Foto del DNI</Text>
        <Text style={styles.inputSubtext}>Necesitamos verificar tu identidad</Text>
        {errors.dniImage && <Text style={styles.errorText}>{errors.dniImage}</Text>}
        
        {dniImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: dniImage }} style={styles.dniImage} />
            <TouchableOpacity style={styles.removeImageButton} onPress={() => setDniImage(null)}>
              <Ionicons name="close-circle" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageSelectorContainer}>
            <TouchableOpacity style={styles.imageSelector} onPress={() => takePhoto('dni')}>
              <Ionicons name="camera" size={32} color={theme.colors.primary} />
              <Text style={styles.imageSelectorText}>Tomar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageSelector} onPress={() => selectImage('dni')}>
              <Ionicons name="images" size={32} color={theme.colors.primary} />
              <Text style={styles.imageSelectorText}>Galería</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

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
              <EnhancedServiceIcon type={category.id} size={50} />
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
          placeholder="Describe tu experiencia, especialidades y lo que te hace único como profesional..."
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
          placeholder="Ej: San José, Costa Rica"
          value={formData.location}
          onChangeText={(value) => updateFormData('location', value)}
        />
        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Horarios de Disponibilidad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Lun-Vie 8:00 AM - 6:00 PM"
          value={formData.availability}
          onChangeText={(value) => updateFormData('availability', value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Tiempo de Respuesta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 2-4 horas"
          value={formData.responseTime}
          onChangeText={(value) => updateFormData('responseTime', value)}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Servicios y Precios</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Servicios que Ofreces</Text>
        <View style={styles.addItemContainer}>
          <TextInput
            style={styles.addItemInput}
            placeholder="Ej: Reparación de tuberías"
            value={serviceText}
            onChangeText={setServiceText}
            onSubmitEditing={handleAddService}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddService}>
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
          placeholder="Ej: $50 - $150 por trabajo"
          value={formData.priceRange}
          onChangeText={(value) => updateFormData('priceRange', value)}
        />
        {errors.priceRange && <Text style={styles.errorText}>{errors.priceRange}</Text>}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Certificaciones e Idiomas</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Certificaciones</Text>
        <View style={styles.addItemContainer}>
          <TextInput
            style={styles.addItemInput}
            placeholder="Ej: Técnico en Plomería"
            value={certificationText}
            onChangeText={setCertificationText}
            onSubmitEditing={handleAddCertification}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddCertification}>
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
            value={languageText}
            onChangeText={setLanguageText}
            onSubmitEditing={handleAddLanguage}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddLanguage}>
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
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con logo */}
              <Header 
          title="Registro" 
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
      

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentStep / 4) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>Paso {currentStep} de 4</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.backButtonFooter} onPress={handleBack}>
            <Text style={styles.backButtonText}>Atrás</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[
            styles.nextButton,
            currentStep === 1 && styles.nextButtonFull
          ]} 
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === 4 ? 'Completar Registro' : 'Siguiente'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
            </>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl + 20,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: theme.spacing.lg,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    paddingBottom: 60,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  backButtonFooter: {
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  backButtonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginRight: theme.spacing.sm,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs,
  },
  imageSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  imageSelector: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  imageSelectorText: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  inputSubtext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontStyle: 'italic',
  },
  dniImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
});
