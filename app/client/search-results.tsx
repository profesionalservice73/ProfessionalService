import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { ProfessionalCard } from '../../components/ProfessionalCard';
import { clientAPI } from '../../services/api';

export default function SearchResultsScreen({ route, navigation }: any) {
  const { searchQuery, categoryId } = route.params;
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    searchProfessionals();
  }, [searchQuery, categoryId]);

  const searchProfessionals = async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      if (categoryId) {
        // Buscar por categoría específica
        response = await clientAPI.searchProfessionalsByCategory(categoryId);
      } else {
        // Buscar por texto de búsqueda
        response = await clientAPI.searchProfessionals(searchQuery);
      }

      if (response.success) {
        setProfessionals(response.data || []);
      } else {
        setError(response.error || 'Error al buscar profesionales');
      }
    } catch (error) {
      console.error('Error buscando profesionales:', error);
      setError('Error de conexión al buscar profesionales');
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalPress = (professionalId: string) => {
    navigation.navigate('ProfessionalDetail', { professionalId });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const getSearchTitle = () => {
    if (categoryId) {
      return `Profesionales en ${searchQuery}`;
    }
    return `Resultados para "${searchQuery}"`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={getSearchTitle()}
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Buscando profesionales...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={searchProfessionals}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : professionals.length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsCount}>
              {professionals.length} profesional{professionals.length !== 1 ? 'es' : ''} encontrado{professionals.length !== 1 ? 's' : ''}
            </Text>
            {professionals.map((professional: any) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                onPress={() => handleProfessionalPress(professional.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.noResultsText}>
              No se encontraron profesionales para "{searchQuery}"
            </Text>
            <Text style={styles.noResultsSubtext}>
              Intenta con otros términos de búsqueda o categorías
            </Text>
            <TouchableOpacity 
              style={styles.backToCategoriesButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.backToCategoriesText}>Ver todas las categorías</Text>
            </TouchableOpacity>
          </View>
        )}
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
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  backToCategoriesButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  backToCategoriesText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
