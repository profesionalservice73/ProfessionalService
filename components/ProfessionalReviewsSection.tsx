import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import { reviewsAPI } from '../services/api';

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  serviceType: string;
  serviceDate: string;
  createdAt: string;
}

interface ProfessionalReviewsSectionProps {
  professionalId: string;
}

export const ProfessionalReviewsSection: React.FC<ProfessionalReviewsSectionProps> = ({
  professionalId,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [professionalId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getProfessionalReviews(professionalId);
      
      if (response.success && response.data) {
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#fbbf24' : theme.colors.border}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${date.getDate()} de ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.starsContainer}>
          {renderStars(item.rating)}
        </View>
        <Text style={styles.serviceType}>{item.serviceType}</Text>
      </View>
      
      <Text style={styles.reviewComment}>{item.comment}</Text>
      
      <View style={styles.reviewFooter}>
        <Text style={styles.reviewerName}>por {item.clientName}</Text>
        <Text style={styles.reviewDate}>{formatDate(item.serviceDate)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando valoraciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Valoraciones de Clientes</Text>
        <Text style={styles.reviewCount}>
          {reviews.length} {reviews.length === 1 ? 'valoración' : 'valoraciones'}
        </Text>
      </View>

      {reviews.length > 0 ? (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.reviewsList}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyReviews}>
          <Ionicons name="star-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyReviewsText}>Aún no tienes valoraciones</Text>
          <Text style={styles.emptyReviewsSubtext}>
            Las valoraciones aparecerán aquí cuando los clientes dejen reseñas
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  reviewCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  reviewsList: {
    paddingBottom: theme.spacing.md,
  },
  reviewItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  serviceType: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  reviewComment: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  reviewDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyReviewsText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    fontWeight: '500',
  },
  emptyReviewsSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
