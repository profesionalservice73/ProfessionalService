import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { reviewsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AddReviewScreen({ route, navigation }: any) {
  const { professionalId, professionalName } = route.params;
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    serviceType: '',
  });

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setNewReview({ ...newReview, rating: i })}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={40}
            color={i <= rating ? '#fbbf24' : theme.colors.border}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const handleAddReview = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Debes iniciar sesión para dejar una reseña');
      return;
    }

    if (newReview.rating === 0) {
      Alert.alert('Error', 'Debes seleccionar una calificación');
      return;
    }

    if (!newReview.comment.trim()) {
      Alert.alert('Error', 'Debes escribir un comentario');
      return;
    }

    if (!newReview.serviceType.trim()) {
      Alert.alert('Error', 'Debes especificar el tipo de servicio');
      return;
    }

    try {
      setSubmitting(true);
      const response = await reviewsAPI.createReview({
        clientId: user.id,
        professionalId,
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        serviceType: newReview.serviceType.trim(),
      });

      if (response.success) {
        Alert.alert('Éxito', 'Reseña agregada exitosamente', [
          { 
            text: 'OK', 
            onPress: () => {
              // Pasar parámetro para indicar que se actualizó
              navigation.goBack();
              // Notificar a la pantalla anterior que debe actualizar
              if (route.params?.onReviewAdded) {
                route.params.onReviewAdded();
              }
            }
          }
        ]);
      } else {
        Alert.alert('Error', response.error || 'No se pudo agregar la reseña');
      }
    } catch (error) {
      console.error('Error agregando reseña:', error);
      Alert.alert('Error', 'Error de conexión al agregar la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Agregar Valoración" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.professionalInfo}>
          <Text style={styles.professionalName}>{professionalName}</Text>
          <Text style={styles.subtitle}>Cuéntanos tu experiencia</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calificación</Text>
          <View style={styles.starsContainer}>
            {renderStars(newReview.rating)}
          </View>
          <Text style={styles.ratingText}>
            {newReview.rating > 0 ? `${newReview.rating} estrellas` : 'Selecciona una calificación'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de servicio</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Plomero, Electricista, Pintor..."
            value={newReview.serviceType}
            onChangeText={(text) => setNewReview({ ...newReview, serviceType: text })}
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comentario</Text>
          <TextInput
            style={[styles.textInput, styles.commentInput]}
            placeholder="Cuéntanos tu experiencia con este profesional..."
            value={newReview.comment}
            onChangeText={(text) => setNewReview({ ...newReview, comment: text })}
            multiline
            numberOfLines={6}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {newReview.comment.length}/500 caracteres
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={submitting ? 'Agregando...' : 'Agregar Valoración'}
          onPress={handleAddReview}
          disabled={submitting}
          style={styles.submitButton}
        />
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
    padding: theme.spacing.lg,
  },
  professionalInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  professionalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
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
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
  },
  commentInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 60,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
});
