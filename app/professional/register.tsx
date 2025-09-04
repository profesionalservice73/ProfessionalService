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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';

const categories = [
  { id: 'plomeria', name: 'Plomería', icon: 'water-outline', color: '#3b82f6' },
  { id: 'electricidad', name: 'Electricidad', icon: 'flash-outline', color: '#ef4444' },
  { id: 'limpieza', name: 'Limpieza', icon: 'sparkles-outline', color: '#10b981' },
  { id: 'pintura', name: 'Pintura', icon: 'color-palette-outline', color: '#8b5cf6' },
  { id: 'jardineria', name: 'Jardinería', icon: 'leaf-outline', color: '#059669' },
  { id: 'albanileria', name: 'Albañilería', icon: 'construct-outline', color: '#f59e0b' },
];

const experienceLevels = [
  { id: 'beginner', name: 'Principiante (0-2 años)' },
  { id: 'intermediate', name: 'Intermedio (3-5 años)' },
  { id: 'advanced', name: 'Avanzado (6-10 años)' },
  { id: 'expert', name: 'Experto (10+ años)' },
];

export default function ProfessionalRegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    // Información personal
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
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

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'El nombre es requerido';
      if (!formData.email.trim()) newErrors.email = 'El email es requerido';
      if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
      if (!formData.password.trim()) newErrors.password = 'La contraseña es requerida';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    if (step === 2) {
      if (!formData.specialty) newErrors.specialty = 'Selecciona una especialidad';
      if (!formData.experience) newErrors.experience = 'Selecciona tu nivel de experiencia';
      if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
      if (!formData.location.trim()) newErrors.location = 'La ubicación es requerida';
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

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      Alert.alert(
        'Registro Exitoso',
        'Tu perfil profesional ha sido creado exitosamente. Los clientes podrán encontrarte y contactarte.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ProfessionalMain'),
          },
        ]
      );
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Información Personal</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nombre Completo</Text>
        <TextInput
          style={[styles.input, errors.fullName && styles.inputError]}
          placeholder="Ej: Carlos Mendoza"
          value={formData.fullName}
          onChangeText={(value) => updateFormData('fullName', value)}
        />
        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="tu@email.com"
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
          placeholder="+506 8888-8888"
          value={formData.phone}
          onChangeText={(value) => updateFormData('phone', value)}
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Contraseña</Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Mínimo 6 caracteres"
          value={formData.password}
          onChangeText={(value) => updateFormData('password', value)}
          secureTextEntry
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder="Repite tu contraseña"
          value={formData.confirmPassword}
          onChangeText={(value) => updateFormData('confirmPassword', value)}
          secureTextEntry
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Información Profesional</Text>
      
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
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con logo */}
      <Header title="Registro Profesional" logoSize="large" />
      
      {/* Header con gradiente */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <View style={styles.placeholder} />
      </LinearGradient>

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
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 4 ? 'Completar Registro' : 'Siguiente'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
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
  },
  categoryCard: {
    width: '30%',
    alignItems: 'center',
    padding: theme.spacing.md,
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
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
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
});
