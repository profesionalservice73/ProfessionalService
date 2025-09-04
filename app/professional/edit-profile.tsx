import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { useProfessional } from '../../contexts/ProfessionalContext';
import { professionalAPI } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');

// Datos por defecto para el formulario
const defaultFormData = {
  name: '',
  email: '',
  phone: '',
  specialties: [] as string[], // Cambiar a specialties (plural)
  experience: '',
  description: '',
  location: '',
  availability: '',
  responseTime: '',
  services: [] as string[],
  priceRange: '',
  certifications: [] as string[],
  certificationDocuments: [] as (string | null)[], // Agregar documentos de certificación
  languages: [] as string[],
  profileImage: '', // Agregar foto de perfil
  dniFrontImage: '', // Agregar DNI frente
  dniBackImage: '', // Agregar DNI dorso
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
  
  // Refs para limpiar inputs
  const serviceInputRef = useRef<TextInput>(null);
  const certificationInputRef = useRef<TextInput>(null);
  const languageInputRef = useRef<TextInput>(null);
  
  // Estados para editar certificación inline
  const [editingCertificationIndex, setEditingCertificationIndex] = useState<number | null>(null);
  const [editingCertificationName, setEditingCertificationName] = useState('');

  // Cargar datos del profesional cuando el componente se monta
  useEffect(() => {
    if (professional) {
      
      
      const newFormData = {
        name: professional.name || '',
        email: professional.email || '',
        phone: professional.phone || '',
        specialties: professional.specialties || [], // Cambiar a especialidades
        experience: professional.experience || '',
        description: professional.description || '',
        location: professional.location || '',
        availability: professional.availability || '',
        responseTime: professional.responseTime || '',
        services: professional.services || [],
        priceRange: professional.priceRange || '',
        certifications: professional.certifications || [],
        certificationDocuments: professional.certificationDocuments || [], // Agregar documentos
        languages: professional.languages || [],
        profileImage: professional.profileImage || '',
        dniFrontImage: professional.dniFrontImage || '',
        dniBackImage: professional.dniBackImage || '',
      };
      
      setFormData(newFormData);
    }
  }, [professional]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Funciones para manejar especialidades múltiples
  const toggleSpecialty = (specialtyId: string) => {
    setFormData(prev => {
      const newSpecialties = prev.specialties.includes(specialtyId)
        ? prev.specialties.filter(id => id !== specialtyId)
        : [...prev.specialties, specialtyId];
      
      return {
        ...prev,
        specialties: newSpecialties
      };
    });
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

  const handleEditCertification = (index: number) => {
    const certification = formData.certifications[index];
    setEditingCertificationIndex(index);
    setEditingCertificationName(certification);
  };

  const handleEditCertificationDocument = async (index: number) => {
    Alert.alert(
      'Cambiar Documento de Certificación',
      '¿Qué tipo de documento quieres subir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: '📷 Tomar Foto', 
          onPress: () => takeCertificationPhoto(index)
        },
        { 
          text: '🖼️ Seleccionar Imagen', 
          onPress: () => selectCertificationImage(index)
        },
        { 
          text: '📄 Seleccionar PDF/Documento', 
          onPress: () => selectCertificationDocument(index)
        }
      ]
    );
  };

  const handleRemoveCertificationDocument = (index: number) => {
    Alert.alert(
      'Eliminar Documento',
      '¿Estás seguro de que quieres eliminar el documento de esta certificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            setFormData(prev => ({
              ...prev,
              certificationDocuments: prev.certificationDocuments.map((doc, i) => 
                i === index ? null : doc
              )
            }));
          }
        }
      ]
    );
  };

  const takeCertificationPhoto = async (index: number) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos de cámara para tomar la foto');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          certificationDocuments: prev.certificationDocuments.map((doc, i) => 
            i === index ? result.assets[0].uri : doc
          )
        }));
      }
    } catch (error) {
      console.error('Error tomando foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const selectCertificationImage = async (index: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          certificationDocuments: prev.certificationDocuments.map((doc, i) => 
            i === index ? result.assets[0].uri : doc
          )
        }));
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const selectCertificationDocument = async (index: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          certificationDocuments: prev.certificationDocuments.map((doc, i) => 
            i === index ? result.assets[0].uri : doc
          )
        }));
      }
    } catch (error) {
      console.error('Error seleccionando documento:', error);
      Alert.alert('Error', 'No se pudo seleccionar el documento');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
    if (formData.specialties.length === 0) newErrors.specialties = 'Selecciona al menos una especialidad';
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
            <Text style={styles.inputLabel}>Especialidades</Text>
            <Text style={styles.inputSubtext}>
              Selecciona todas las especialidades en las que trabajas
            </Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => {
                const isSelected = formData.specialties.includes(category.id);
                
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardActive,
                    ]}
                    onPress={() => toggleSpecialty(category.id)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                      <Ionicons name={category.icon as any} size={24} color={category.color} />
                    </View>
                    <Text style={[
                      styles.categoryName,
                      isSelected && styles.categoryNameActive
                    ]}>
                      {category.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Mostrar especialidades seleccionadas */}
            {formData.specialties.length > 0 ? (
              <View style={styles.selectedSpecialtiesContainer}>
                <Text style={styles.selectedSpecialtiesTitle}>Especialidades seleccionadas:</Text>
                <View style={styles.selectedSpecialtiesList}>
                  {formData.specialties.map((specialtyId) => {
                    const category = categories.find(cat => cat.id === specialtyId);
                    return (
                      <View key={specialtyId} style={styles.selectedSpecialtyTag}>
                        <Text style={styles.selectedSpecialtyText}>{category?.name || specialtyId}</Text>
                        <TouchableOpacity onPress={() => toggleSpecialty(specialtyId)}>
                          <Ionicons name="close-circle" size={16} color={theme.colors.error} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.noSpecialtiesContainer}>
                <Text style={styles.noSpecialtiesText}>
                  No tienes especialidades seleccionadas. Selecciona al menos una para continuar.
                </Text>
              </View>
            )}
            
            {errors.specialties && <Text style={styles.errorText}>{errors.specialties}</Text>}
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
                ref={serviceInputRef}
                style={styles.addItemInput}
                placeholder="Ej: Reparación de tuberías"
                onSubmitEditing={(e) => {
                  addService(e.nativeEvent.text);
                  serviceInputRef.current?.clear();
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
                ref={certificationInputRef}
                style={styles.addItemInput}
                placeholder="Ej: Técnico en Plomería"
                onSubmitEditing={(e) => {
                  addCertification(e.nativeEvent.text);
                  certificationInputRef.current?.clear();
                }}
              />
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={20} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.itemsList}>
              {formData.certifications.map((certification, index) => (
                <View key={index} style={styles.certificationCard}>
                  <View style={styles.certificationInfo}>
                    {editingCertificationIndex === index ? (
                      <TextInput
                        style={styles.certificationEditInput}
                        value={editingCertificationName}
                        onChangeText={setEditingCertificationName}
                        placeholder="Nombre de la certificación"
                        autoFocus
                      />
                    ) : (
                      <Text style={styles.certificationTitle}>{certification}</Text>
                    )}
                    {formData.certificationDocuments[index] && (
                      <Text style={styles.certificationDocument}>
                        📎 Documento adjunto
                      </Text>
                    )}
                  </View>
                  <View style={styles.certificationActions}>
                    {editingCertificationIndex === index ? (
                      <>
                        <TouchableOpacity 
                          style={styles.saveButton}
                          onPress={() => {
                            if (editingCertificationName.trim()) {
                              setFormData(prev => ({
                                ...prev,
                                certifications: prev.certifications.map((cert, i) => 
                                  i === index ? editingCertificationName.trim() : cert
                                )
                              }));
                              setEditingCertificationIndex(null);
                              setEditingCertificationName('');
                            }
                          }}
                        >
                          <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.cancelButton}
                          onPress={() => {
                            setEditingCertificationIndex(null);
                            setEditingCertificationName('');
                          }}
                        >
                          <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity 
                          style={styles.editButton}
                          onPress={() => {
                            setEditingCertificationIndex(index);
                            setEditingCertificationName(certification);
                          }}
                        >
                          <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.documentButton}
                          onPress={() => handleEditCertificationDocument(index)}
                        >
                          <Ionicons name="document-outline" size={16} color={theme.colors.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.removeButton}
                          onPress={() => removeCertification(certification)}
                        >
                          <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Idiomas que Hablas</Text>
            <View style={styles.addItemContainer}>
              <TextInput
                ref={languageInputRef}
                style={styles.addItemInput}
                placeholder="Ej: Español"
                onSubmitEditing={(e) => {
                  addLanguage(e.nativeEvent.text);
                  languageInputRef.current?.clear();
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
  inputSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
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
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 3,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  categoryNameActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedSpecialtiesContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  selectedSpecialtiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  selectedSpecialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  selectedSpecialtyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  selectedSpecialtyText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  noSpecialtiesContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  noSpecialtiesText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
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
  experienceTextActive: {
    color: theme.colors.white,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  specialtyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  specialtyItemSelected: {
    backgroundColor: theme.colors.primary,
  },
  specialtyText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  specialtyTextSelected: {
    color: theme.colors.white,
  },
  experienceContainer: {
    gap: theme.spacing.sm,
  },
  experienceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  experienceItemSelected: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  experienceText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
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
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  itemsList: {
    gap: theme.spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  certificationCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  certificationInfo: {
    flex: 1,
    marginBottom: theme.spacing.sm,
  },
  certificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  certificationEditInput: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  certificationDocument: {
    fontSize: 14,
    color: theme.colors.secondary,
  },
  certificationActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  editButton: {
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.sm,
  },
  removeButton: {
    padding: theme.spacing.xs,
  },
  documentButton: {
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.secondary + '20',
    borderRadius: theme.borderRadius.sm,
  },
  saveButton: {
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.success + '20',
    borderRadius: theme.borderRadius.sm,
  },
  cancelButton: {
    padding: theme.spacing.xs,
  },
  saveProfileButton: {
    backgroundColor: theme.colors.primary,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  saveProfileButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
