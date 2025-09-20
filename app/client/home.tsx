import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { SafeScreen } from '../../components/SafeScreen';
import { EnhancedServiceIcon } from '../../components/EnhancedServiceIcon';


// Categorías estáticas
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

export default function HomeScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [isSearching, setIsSearching] = useState(false);

  // Filtrar categorías basado en la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(categories);
      setIsSearching(false);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
      setIsSearching(true);
    }
  }, [searchQuery]);

  const handleCategoryPress = (categoryId: string) => {
    console.log('Categoría seleccionada:', categoryId);
    // Navegar a la pantalla de detalle de categoría
    navigation.navigate('CategoryDetail', { categoryId });
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Si hay texto de búsqueda, navegar a búsqueda de profesionales
      navigation.navigate('SearchResults', { 
        searchQuery: searchQuery.trim(),
        categoryId: null 
      });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredCategories(categories);
    setIsSearching(false);
  };



  return (
    <SafeScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con logo */}
        <Header 
          title="Professional Service" 
          rightAction={{
            icon: 'settings-outline',
            onPress: () => navigation.navigate('ClientSettings')
          }}
          useSafeArea={false}
        />
        
        {/* Header con búsqueda */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.header}
        >
          <Text style={styles.headerSubtitle}>
            ¿Qué necesitas?
          </Text>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar servicios o profesionales..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Categorías */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isSearching ? `Resultados para "${searchQuery}"` : 'Servicios'}
          </Text>
          <View style={styles.categoriesGrid}>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category.id)}
                >
                  <EnhancedServiceIcon type={category.id} size={50} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.noResultsText}>
                  No se encontraron servicios para "{searchQuery}"
                </Text>
                <Text style={styles.noResultsSubtext}>
                  Intenta con otros términos de búsqueda
                </Text>
              </View>
            )}
          </View>
        </View>



        {/* Botón de solicitud rápida */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.quickRequestButton}
            onPress={() => navigation.navigate('CreateRequest')}
          >
            <LinearGradient
              colors={[theme.colors.secondary, theme.colors.primary]}
              style={styles.quickRequestGradient}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={styles.quickRequestText}>Nueva Solicitud</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  headerSubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
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
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },

  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 18,
  },

  quickRequestButton: {
    marginTop: theme.spacing.md,
  },
  quickRequestGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  quickRequestText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    width: '100%',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },

});
