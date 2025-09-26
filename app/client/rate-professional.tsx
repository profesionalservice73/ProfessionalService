import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { clientAPI } from '../../services/api';

interface Professional {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  totalReviews: number;
  profileImage: string | null;
}

interface RequestData {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  completedAt: string;
}

export default function RateProfessionalScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { requestId, professional, requestData } = (route.params as any) || {};
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    if (!requestId || !user?.id || !professional?.id) {
      Alert.alert('Error', 'Información incompleta para calificar');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await clientAPI.rateProfessional(requestId, user.id, {
        professionalId: professional.id,
        rating: rating,
        comment: comment.trim() || null,
      });

      if (response.success) {
        Alert.alert(
          'Calificación Enviada',
          'Gracias por calificar al profesional. Tu opinión es muy importante para nosotros.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'No se pudo enviar la calificación');
      }
    } catch (error) {
      console.error('Error enviando calificación:', error);
      Alert.alert('Error', 'No se pudo enviar la calificación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRatingPress(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={40}
              color={star <= rating ? theme.colors.warning : theme.colors.border}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return 'Muy malo';
      case 2:
        return 'Malo';
      case 3:
        return 'Regular';
      case 4:
        return 'Bueno';
      case 5:
        return 'Excelente';
      default:
        return 'Selecciona una calificación';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Calificar Profesional</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Información del profesional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profesional</Text>
          <View style={styles.professionalCard}>
            <View style={styles.professionalInfo}>
              <Text style={styles.professionalName}>{professional?.name}</Text>
              <Text style={styles.professionalSpecialties}>
                {professional?.specialties?.join(', ')}
              </Text>
              <View style={styles.currentRating}>
                <Ionicons name="star" size={16} color={theme.colors.warning} />
                <Text style={styles.currentRatingText}>
                  {professional?.rating?.toFixed(1)} ({professional?.totalReviews} reseñas)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Información del trabajo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trabajo Realizado</Text>
          <View style={styles.workCard}>
            <Text style={styles.workTitle}>{requestData?.title}</Text>
            <Text style={styles.workCategory}>{requestData?.category}</Text>
            <Text style={styles.workDescription}>{requestData?.description}</Text>
            <Text style={styles.workLocation}>📍 {requestData?.location}</Text>
            {requestData?.completedAt && (
              <Text style={styles.workDate}>
                Completado: {new Date(requestData.completedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {/* Calificación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Cómo calificarías el servicio?</Text>
          <View style={styles.ratingCard}>
            {renderStars()}
            <Text style={[styles.ratingText, { color: rating > 0 ? theme.colors.text : theme.colors.textSecondary }]}>
              {getRatingText(rating)}
            </Text>
          </View>
        </View>

        {/* Comentario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comentario (Opcional)</Text>
          <View style={styles.commentCard}>
            <TextInput
              style={styles.commentInput}
              placeholder="Comparte tu experiencia con este profesional..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{comment.length}/500</Text>
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Tu calificación es muy importante para ayudar a otros clientes a elegir profesionales de confianza.
          </Text>
        </View>
      </ScrollView>

      {/* Botón de envío */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <>
              <Ionicons name="star" size={20} color={theme.colors.white} />
              <Text style={styles.submitButtonText}>Enviar Calificación</Text>
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
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  professionalCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  professionalInfo: {
    alignItems: 'center',
  },
  professionalName: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  professionalSpecialties: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  currentRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  currentRatingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  workCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  workTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  workCategory: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
  },
  workDescription: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  workLocation: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  workDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  ratingCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  starButton: {
    padding: theme.spacing.xs,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  commentCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  commentInput: {
    padding: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.text,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    gap: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
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
});

