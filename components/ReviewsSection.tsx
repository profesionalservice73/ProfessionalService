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
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  serviceType: string;
  serviceDate: string;
  createdAt: string;
}

interface ReviewsSectionProps {
  professionalId: string;
  professionalName: string;
  professionalImage?: string;
  navigation?: any;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  professionalId,
  professionalName,
  professionalImage,
  navigation,
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [professionalRating, setProfessionalRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadReviews();
  }, [professionalId]);

  // Escuchar cuando regrese de agregar reseña
  useEffect(() => {
    if (navigation) {
      const unsubscribe = navigation.addListener('focus', () => {
        loadReviews();
      });

      return unsubscribe;
    }
  }, [navigation]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getProfessionalReviews(professionalId);
      
      if (response.success && response.data) {
        setReviews(response.data.reviews || []);
        setProfessionalRating(response.data.professional?.rating || 0);
        setTotalReviews(response.data.professional?.totalReviews || 0);
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={size}
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

  const handleAddReview = () => {
    if (!user?.id) {
      Alert.alert('Error', 'Debes iniciar sesión para dejar una reseña');
      return;
    }

    if (navigation) {
      navigation.navigate('AddReview', {
        professionalId,
        professionalName,
        onReviewAdded: loadReviews // Pasar la función para actualizar
      });
    }
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

  const renderHeader = () => (
    <View>
      {/* Header con información del profesional */}
      <View style={styles.professionalHeader}>
        <View style={styles.professionalInfo}>
          <Text style={styles.professionalName}>{professionalName}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingNumber}>{professionalRating.toFixed(2)}</Text>
            <View style={styles.starsContainer}>
              {renderStars(professionalRating, 20)}
            </View>
          </View>
        </View>
      </View>

      {/* Botón para agregar reseña */}
      {user?.id && (
        <TouchableOpacity
          style={styles.addReviewButton}
          onPress={handleAddReview}
        >
          <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
          <Text style={styles.addReviewText}>Agregar valoración</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyReviews}>
      <Ionicons name="star-outline" size={48} color={theme.colors.textSecondary} />
      <Text style={styles.emptyReviewsText}>Aún no hay valoraciones</Text>
      <Text style={styles.emptyReviewsSubtext}>
        Sé el primero en dejar una reseña para este profesional
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {reviews.length > 0 ? (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.reviewsList}
          nestedScrollEnabled={true}
        />
      ) : (
        <View style={styles.container}>
          {renderHeader()}
          {renderEmpty()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  professionalHeader: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  professionalInfo: {
    alignItems: 'center',
  },
  professionalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  addReviewText: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  reviewsList: {
    paddingBottom: theme.spacing.lg,
  },
  reviewItem: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
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
  serviceType: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  emptyReviews: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
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
