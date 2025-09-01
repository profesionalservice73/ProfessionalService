import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { ProfessionalCard } from '../../components/ProfessionalCard';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { clientAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function FavoritesScreen({ navigation }: any) {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused && user?.id) {
      loadFavorites();
    }
  }, [user?.id, isFocused]);

  const loadFavorites = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await clientAPI.getFavorites(user.id);
      
      if (response.success) {
        setFavorites(response.data || []);
      } else {
        console.log('Error cargando favoritos:', response.error);
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalPress = (professionalId: string) => {
    console.log('Professional pressed:', professionalId);
    navigation.navigate('ProfessionalDetail', { id: professionalId });
  };

  const handleContactPress = (professionalId: string) => {
    console.log('Contact professional:', professionalId);
    // Aquí se abriría WhatsApp con el profesional
  };

  const handleRemoveFavorite = async (professionalId: string) => {
    if (!user?.id) return;
    
    try {
      const response = await clientAPI.removeFromFavorites(user.id, professionalId);
      
      if (response.success) {
        setFavorites(prev => prev.filter(fav => fav.id !== professionalId));
      } else {
        console.log('Error removiendo favorito:', response.error);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    }
  };

  const renderFavoriteCard = ({ item }: { item: any }) => (
    <View style={styles.favoriteCardContainer}>
      <ProfessionalCard
        id={item.id}
        name={item.name}
        specialty={item.specialty}
        rating={item.rating}
        reviews={item.reviews}
        image={item.image}
        onPress={handleProfessionalPress}
        onContact={handleContactPress}
      />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFavorite(item.id)}
      >
        <Ionicons name="heart" size={20} color={theme.colors.error} />
      </TouchableOpacity>
      {!item.isAvailable && (
        <View style={styles.unavailableBadge}>
          <Text style={styles.unavailableText}>No disponible</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con logo */}
      <Header title="Mis Favoritos" />
      
      {/* Stats */}
      <View style={styles.headerStats}>
        <Ionicons name="heart" size={20} color={theme.colors.primary} />
        <Text style={styles.headerStatsText}>{favorites.length} profesionales</Text>
      </View>

      {/* Favorites List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando favoritos...</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteCard}
          contentContainerStyle={styles.favoritesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No tienes favoritos</Text>
              <Text style={styles.emptySubtitle}>
                Guarda tus profesionales preferidos para acceder rápidamente a ellos
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  headerStatsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  favoritesList: {
    padding: theme.spacing.lg,
  },
  favoriteCardContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  removeButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  unavailableBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    zIndex: 1,
  },
  unavailableText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
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
});
