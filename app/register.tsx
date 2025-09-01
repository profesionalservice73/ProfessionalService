import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { theme } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';

// Datos para el formulario de profesionales
const categories = [
  { id: 'plomeria', name: 'Plomería', icon: 'water', color: '#3b82f6' },
  { id: 'gas', name: 'Gas', icon: 'flame', color: '#f97316' },
  { id: 'electricidad', name: 'Electricidad', icon: 'flash', color: '#f59e0b' },
  { id: 'albanileria', name: 'Albañilería', icon: 'construct', color: '#ef4444' },
  { id: 'carpinteria', name: 'Carpintería', icon: 'hammer', color: '#8b4513' },
  { id: 'herreria', name: 'Herrería', icon: 'hardware-chip', color: '#64748b' },
  { id: 'limpieza', name: 'Limpieza', icon: 'sparkles', color: '#8b5cf6' },
  { id: 'mecanica', name: 'Mecánica', icon: 'car', color: '#1e293b' },
  { id: 'aire_acondicionado', name: 'Aire Acondicionado', icon: 'thermometer', color: '#0ea5e9' },
  { id: 'tecnico_comp_redes', name: 'Técnico en Comp y Redes', icon: 'laptop', color: '#6366f1' },
  { id: 'cerrajeria', name: 'Cerrajería', icon: 'key', color: '#7c3aed' },
];

const experienceLevels = [
  { id: 'beginner', name: 'Principiante (0-2 años)' },
  { id: 'intermediate', name: 'Intermedio (2-5 años)' },
  { id: 'advanced', name: 'Avanzado (5+ años)' },
];

export default function RegisterScreen({ navigation }: any) {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'client', // 'client' or 'professional'
    // Campos adicionales para profesionales
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
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estados para campos dinámicos de profesionales
  const [serviceText, setServiceText] = useState('');
  const [certificationText, setCertificationText] = useState('');
  const [languageText, setLanguageText] = useState('');

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Funciones para campos dinámicos de profesionales
  const handleAddService = () => {
    if (serviceText.trim()) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, serviceText.trim()]
      }));
      setServiceText('');
    }
  };

  const handleAddCertification = () => {
    if (certificationText.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, certificationText.trim()]
      }));
      setCertificationText('');
    }
  };

  const handleAddLanguage = () => {
    if (languageText.trim()) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, languageText.trim()]
      }));
      setLanguageText('');
    }
  };

  const handleRemoveService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Teléfono inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Solo validar para clientes
    if (formData.userType !== 'client') {
      newErrors.userType = 'Selecciona el tipo de usuario';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await register(formData);
      
      if (result.success) {
        Alert.alert('Éxito', result.message, [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al conectar con el servidor');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header con gradiente */}
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.header}
          >
 
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image 
                  source={require('../assets/icon.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.title}>¡Registrate!</Text>
            <Text style={styles.subtitle}>Crea tu cuenta en Professional Service</Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label="Nombre Completo"
              placeholder="Tu nombre completo"
              value={formData.fullName}
              onChangeText={(value) => updateFormData('fullName', value)}
              error={errors.fullName}
            />

            <Input
              label="Email"
              placeholder="tu@email.com"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Teléfono"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              keyboardType="phone-pad"
              error={errors.phone}
            />

            <View style={styles.passwordContainer}>
              <Input
                label="Contraseña"
                placeholder="Tu contraseña"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry={!showPassword}
                error={errors.password}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <Input
                label="Confirmar Contraseña"
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                error={errors.confirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* User Type Selection */}
            <View style={styles.userTypeContainer}>
              <Text style={styles.userTypeLabel}>Tipo de Usuario</Text>
              <View style={styles.userTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    formData.userType === 'client' && styles.userTypeButtonActive,
                  ]}
                  onPress={() => updateFormData('userType', 'client')}
                >
                  <Ionicons
                    name="person"
                    size={20}
                    color={formData.userType === 'client' ? theme.colors.white : theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.userTypeText,
                      formData.userType === 'client' && styles.userTypeTextActive,
                    ]}
                  >
                    Cliente
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    formData.userType === 'professional' && styles.userTypeButtonActive,
                  ]}
                  onPress={() => {
                    updateFormData('userType', 'professional');
                    // Navegar al registro de profesional en pasos
                    navigation.navigate('ProfessionalRegisterSteps');
                  }}
                >
                  <Ionicons
                    name="briefcase"
                    size={20}
                    color={formData.userType === 'professional' ? theme.colors.white : theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.userTypeText,
                      formData.userType === 'professional' && styles.userTypeTextActive,
                    ]}
                  >
                    Profesional
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Información adicional para clientes */}
            {formData.userType === 'client' && (
              <View style={styles.clientInfo}>
                <Text style={styles.infoText}>
                  Como cliente podrás solicitar servicios de profesionales certificados y recibir cotizaciones personalizadas.
                </Text>
              </View>
            )}

            <Button
              title={loading ? "Creando..." : "Crear Cuenta"}
              onPress={handleRegister}
              style={styles.registerButton}
              disabled={loading}
            />

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Inicia sesión aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    paddingTop: theme.spacing.xxl + 60,
    paddingBottom: theme.spacing.xl,
  },
  logoContainer: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 100,
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing.xl + 60,
    left: theme.spacing.lg,
    zIndex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: theme.spacing.md,
    top: 45,
    zIndex: 1,
  },
  userTypeContainer: {
    marginBottom: theme.spacing.lg,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  userTypeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  userTypeText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  userTypeTextActive: {
    color: theme.colors.white,
  },
  registerButton: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  loginText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Estilos para campos de profesionales
  professionalFields: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
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
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  categoryCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  experienceCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  experienceCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  experienceText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  experienceTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  addItemInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsList: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  itemTag: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  itemText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  clientInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
