import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

interface ProfessionalCardProps {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  image?: string;
  onPress: (id: string) => void;
  onContact: (id: string) => void;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  id,
  name,
  specialty,
  rating,
  reviews,
  image,
  onPress,
  onContact,
}) => {
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

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(id)}>
      <View style={styles.imageContainer}>
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Ionicons name="person" size={30} color={theme.colors.white} />
            </View>
          )}
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.specialty}>{specialty}</Text>
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>{renderStars(rating)}</View>
          <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>
          <Text style={styles.reviews}>({reviews} valoraciones)</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.contactButton}
        onPress={() => onContact(id)}
      >
        <Ionicons name="logo-whatsapp" size={24} color={theme.colors.success} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    marginRight: theme.spacing.md,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
  },
  defaultAvatar: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  specialty: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: theme.spacing.xs,
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  reviews: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  contactButton: {
    padding: theme.spacing.sm,
  },
});
