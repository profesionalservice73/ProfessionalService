import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
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

export default function EditRequestScreen({ route, navigation }: any) {
  const { request } = route.params;
  const { user } = useAuth();
  
  // Debug: ver qué datos llegan
  console.log('Request data received:', request);
  const [formData, setFormData] = useState({
    title: request.title || '',
    description: request.description || '',
    category: request.category || '',
    urgency: request.urgency || 'medium',
    budget: request.budget || '',
    location: request.location || '',
    preferredDate: request.preferredDate || '',
    contactPhone: request.contactPhone || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      const requestData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        budget: formData.budget,
        urgency: formData.urgency,
        contactPhone: formData.contactPhone,
        preferredDate: formData.preferredDate,
      };

      // Solo incluir preferredDate si no está vacío
      if (formData.preferredDate && formData.preferredDate.trim() !== '') {
        requestData.preferredDate = formData.preferredDate;
      }

      const requestId = request._id || request.id;
      console.log('Using request ID:', requestId);
      
      if (!requestId) {
        Alert.alert('Error', 'No se pudo identificar la solicitud');
        return;
      }
      
      const response = await clientAPI.updateRequest(requestId, requestData);
      
      if (response.success) {
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
      } else {
        Alert.alert('Error', response.error || 'Error al actualizar la solicitud');
      }
    } catch (error) {
      console.error('Error actualizando solicitud:', error);
      Alert.alert('Error', 'Error de conexión al actualizar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Header title="Editar Solicitud" showBackButton onBackPress={() => navigation.goBack()} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <Input
            label="Título de la solicitud"
            placeholder="Ej: Reparación de tubería"
            value={formData.title}
            onChangeText={(value) => updateFormData('title', value)}
            error={errors.title}
          />

          <Input
            label="Descripción"
            placeholder="Describe detalladamente el trabajo que necesitas"
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
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Ionicons name={category.icon as any} size={24} color="white" />
                </View>
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
            title={loading ? "Actualizando..." : "Actualizar Solicitud"}
            onPress={handleSubmit}
            style={styles.submitButton}
            disabled={loading}
          />
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Actualizando solicitud...</Text>
            </View>
          )}
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
