import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfessionalCard } from '../../components/ProfessionalCard';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { searchAPI, clientAPI } from '../../services/api';

// Categorías estáticas
const categories = {
  plomeria: {
    name: 'Plomería',
    icon: 'water-outline',
    color: '#3b82f6',
    description: 'Servicios de plomería profesional para hogares y comercios',
  },
  gas: {
    name: 'Gas',
    icon: 'flame-outline',
    color: '#f97316',
    description: 'Instalación y mantenimiento de sistemas de gas',
  },
  electricidad: {
    name: 'Electricidad',
    icon: 'flash-outline',
    color: '#ef4444',
    description: 'Servicios eléctricos certificados y seguros',
  },
  albanileria: {
    name: 'Albañilería',
    icon: 'construct-outline',
    color: '#f59e0b',
    description: 'Servicios de construcción y albañilería profesional',
  },
  carpinteria: {
    name: 'Carpintería',
    icon: 'hammer-outline',
    color: '#8b4513',
    description: 'Trabajos de carpintería y muebles a medida',
  },
  herreria: {
    name: 'Herrería',
    icon: 'hardware-chip-outline',
    color: '#64748b',
    description: 'Servicios de herrería y metalurgia',
  },
  limpieza: {
    name: 'Limpieza',
    icon: 'sparkles-outline',
    color: '#10b981',
    description: 'Servicios de limpieza profesional para hogares y oficinas',
  },
  mecanica: {
    name: 'Mecánica',
    icon: 'car-outline',
    color: '#1e293b',
    description: 'Servicios de mecánica automotriz y mantenimiento',
  },
  aire_acondicionado: {
    name: 'Aire Acondicionado',
    icon: 'thermometer-outline',
    color: '#0ea5e9',
    description: 'Instalación y mantenimiento de sistemas de aire acondicionado',
  },
  tecnico_comp_redes: {
    name: 'Técnico en Comp y Redes',
    icon: 'laptop-outline',
    color: '#6366f1',
    description: 'Servicios técnicos en computación y redes',
  },
  cerrajeria: {
    name: 'Cerrajería',
    icon: 'key-outline',
    color: '#7c3aed',
    description: 'Servicios de cerrajería y seguridad',
  },
};

export default function CategoryDetailScreen({ route, navigation }: any) {
  const { categoryId } = route.params;
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);

  const category = categories[categoryId as keyof typeof categories];

  useEffect(() => {
    loadProfessionals();
  }, [categoryId]);

  useEffect(() => {
    filterProfessionals();
  }, [searchQuery, professionals]);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando profesionales para categoría:', categoryId);
      const response = await clientAPI.getProfessionalsByCategory(categoryId);
      
      if (response.success) {
        console.log('🔍 Profesionales encontrados:', response.data?.length || 0);
        setProfessionals(response.data || []);
      } else {
        console.log('Error cargando profesionales:', response.error);
        setProfessionals([]);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProfessionals = () => {
    if (!searchQuery.trim()) {
      setFilteredProfessionals(professionals);
    } else {
      const filtered = professionals.filter((prof: any) =>
        prof.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProfessionals(filtered);
    }
  };

  const handleProfessionalPress = (professionalId: string) => {
    console.log('Profesional seleccionado:', professionalId);
    navigation.navigate('ProfessionalDetail', { id: professionalId });
  };

  const handleContactPress = (professionalId: string) => {
    console.log('Contactar profesional:', professionalId);
    // Aquí se abriría WhatsApp con el profesional
  };

  const renderProfessional = ({ item }: { item: any }) => (
    <ProfessionalCard
      id={item.id}
      name={item.name}
      specialty={item.specialty}
      rating={item.rating}
      reviews={item.totalReviews}
      image={item.image}
      onPress={handleProfessionalPress}
      onContact={handleContactPress}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={category?.name || 'Categoría'} 
        showBackButton 
        onBackPress={() => navigation.goBack()}
      />
      
      {/* Header con información de la categoría */}
      <View style={[styles.categoryHeader, { backgroundColor: category?.color }]}>
        <View style={styles.categoryInfo}>
          <View style={styles.categoryIconContainer}>
            <Ionicons name={category?.icon as any} size={40} color="white" />
          </View>
          <View style={styles.categoryText}>
            <Text style={styles.categoryTitle}>{category?.name}</Text>
            <Text style={styles.categoryDescription}>{category?.description}</Text>
          </View>
        </View>
        
        {/* Estadísticas de la categoría */}
        <View style={styles.categoryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{filteredProfessionals.length}</Text>
            <Text style={styles.statLabel}>Profesionales</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating Promedio</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24h</Text>
            <Text style={styles.statLabel}>Respuesta</Text>
          </View>
        </View>
      </View>

      {/* Barra de búsqueda y botón de solicitud */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar profesionales..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={[styles.createRequestButton, { backgroundColor: category?.color }]}
          onPress={() => navigation.navigate('CreateRequest', { categoryId })}
        >
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.createRequestText}>Nueva Solicitud</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de profesionales */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando profesionales...</Text>
        </View>
      ) : filteredProfessionals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>No se encontraron profesionales</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Intenta con otros términos de búsqueda' : 'No hay profesionales registrados en esta categoría'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProfessionals}
          renderItem={renderProfessional}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.professionalsList}
          showsVerticalScrollIndicator={false}
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
  categoryHeader: {
    padding: theme.spacing.lg,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  categoryText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  categoryDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  searchContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  professionalsList: {
    padding: theme.spacing.lg,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  createRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  createRequestText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
});

