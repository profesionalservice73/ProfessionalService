import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { clientAPI } from '../../services/api';
import { formatPhoneForWhatsApp, createWhatsAppUrl } from '../../utils/phoneUtils';
import { useAuth } from '../../contexts/AuthContext';
import { ReviewsSection } from '../../components/ReviewsSection';

export default function ProfessionalDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [isFavorite, setIsFavorite] = useState(false);
  const [professional, setProfessional] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    loadProfessionalData();
    checkIfFavorite();
  }, [id, user?.id]);

  const loadProfessionalData = async () => {
    try {
      setLoading(true);
      const response = await clientAPI.getProfessionalDetail(id);
      
      if (response.success) {
        setProfessional(response.data);
      } else {
        console.log('Error cargando datos del profesional:', response.error);
        setProfessional(null);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setProfessional(null);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!user?.id) return;
    
    try {
      const response = await clientAPI.getFavorites(user.id);
      if (response.success && response.data) {
        const isAlreadyFavorite = response.data.some((fav: any) => fav.id === id);
        setIsFavorite(isAlreadyFavorite);
      }
    } catch (error) {
      console.error('Error verificando favoritos:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header 
          title="Detalle del Profesional" 
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando datos del profesional...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!professional) {
    return (
      <SafeAreaView style={styles.container}>
        <Header 
          title="Detalle del Profesional" 
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profesional no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

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

  const handleContact = () => {
    if (!professional.phone) {
      Alert.alert(
        'Información no disponible',
        'Este profesional no tiene un número de teléfono registrado.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Crear mensaje predefinido
    const message = `Hola ${professional.name}, vi tu perfil en Professional Service y me interesa contratar tus servicios de ${professional.specialty}. ¿Podrías darme más información sobre tus servicios y disponibilidad?`;
    
    // Crear URL de WhatsApp
    const whatsappUrl = createWhatsAppUrl(professional.phone, message);
    
    if (!whatsappUrl) {
      Alert.alert(
        'Número inválido',
        'El número de teléfono no tiene un formato válido para WhatsApp.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    console.log('Abriendo WhatsApp con URL:', whatsappUrl);
    console.log('Número original:', professional.phone);
    console.log('Número formateado:', formatPhoneForWhatsApp(professional.phone));
    
    // Abrir WhatsApp con manejo de errores
    Linking.openURL(whatsappUrl).catch((err) => {
      console.error('Error abriendo WhatsApp:', err);
      Alert.alert(
        'Error',
        'No se pudo abrir WhatsApp. Asegúrate de tener la aplicación instalada.',
        [{ text: 'OK' }]
      );
    });
  };

  const handleFavorite = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Debes iniciar sesión para agregar favoritos');
      return;
    }

    if (favoriteLoading) return;

    try {
      setFavoriteLoading(true);
      
      if (isFavorite) {
        // Quitar de favoritos
        const response = await clientAPI.removeFromFavorites(user.id, id);
        if (response.success) {
          setIsFavorite(false);
          // Sin alert para mejor UX
        } else {
          Alert.alert('Error', response.error || 'No se pudo remover de favoritos');
        }
      } else {
        // Agregar a favoritos
        const response = await clientAPI.addToFavorites(user.id, id);
        if (response.success) {
          setIsFavorite(true);
          // Sin alert para mejor UX
        } else {
          Alert.alert('Error', response.error || 'No se pudo agregar a favoritos');
        }
      }
    } catch (error) {
      console.error('Error manejando favoritos:', error);
      Alert.alert('Error', 'Error de conexión al manejar favoritos');
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header 
          title="Detalle del Profesional" 
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        
        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.reviewsButton}
            onPress={() => navigation.navigate('Reviews', {
              professionalId: id,
              professionalName: professional.name,
              professionalImage: professional.image
            })}
          >
            <Ionicons name="star" size={20} color="#fbbf24" />
            <Text style={styles.reviewsButtonText}>Ver Valoraciones</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.favoriteButton, favoriteLoading && styles.favoriteButtonDisabled]}
            onPress={handleFavorite}
            disabled={favoriteLoading}
          >
            {favoriteLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? theme.colors.error : theme.colors.text}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.professionalInfo}>
          <View style={styles.avatarContainer}>
            {professional.image ? (
              <Image source={{ uri: professional.image }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Ionicons name="person" size={40} color={theme.colors.white} />
              </View>
            )}
          </View>
          
          <Text style={styles.professionalName}>{professional.name}</Text>
          <Text style={styles.professionalSpecialty}>{professional.specialty}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(professional.rating || 0)}
            </View>
            <Text style={styles.ratingText}>
              {professional.rating ? professional.rating.toFixed(1) : '0.0'} ({professional.totalReviews || 0} reseñas)
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'info' && styles.activeTab]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
              Información
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'services' && styles.activeTab]}
            onPress={() => setActiveTab('services')}
          >
            <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
              Servicios
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Valoraciones
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <View style={styles.infoContent}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{professional.description || 'Sin descripción disponible'}</Text>
            
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <Text style={styles.description}>{professional.location || 'Ubicación no especificada'}</Text>
            
            <Text style={styles.sectionTitle}>Experiencia</Text>
            <Text style={styles.description}>{professional.experience || 'Experiencia no especificada'}</Text>
            
            <Text style={styles.sectionTitle}>Certificaciones</Text>
            {professional.certifications && professional.certifications.length > 0 ? (
              professional.certifications.map((cert: string, index: number) => (
                <View key={index} style={styles.certificationItem}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.certificationText}>{cert}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.description}>Sin certificaciones registradas</Text>
            )}
            
            <Text style={styles.sectionTitle}>Disponibilidad</Text>
            <Text style={styles.availabilityText}>{professional.availability || 'No especificada'}</Text>
            
            <Text style={styles.sectionTitle}>Tiempo de Respuesta</Text>
            <Text style={styles.responseTimeText}>{professional.responseTime || 'No especificado'}</Text>
            
                         <Text style={styles.sectionTitle}>Idiomas</Text>
             {professional.languages && professional.languages.length > 0 ? (
               <Text style={styles.languagesText}>{professional.languages.join(', ')}</Text>
             ) : (
               <Text style={styles.description}>No especificados</Text>
             )}
             
             <Text style={styles.sectionTitle}>Contacto</Text>
             <Text style={styles.description}>
               Teléfono: {professional.phone || 'No especificado'}
             </Text>
             <Text style={styles.description}>
               Email: {professional.email || 'No especificado'}
             </Text>
          </View>
        )}

        {activeTab === 'services' && (
          <View style={styles.servicesContent}>
            <Text style={styles.sectionTitle}>Servicios Ofrecidos</Text>
            {professional.services && professional.services.length > 0 ? (
              professional.services.map((service: string, index: number) => (
                <View key={index} style={styles.serviceItem}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.description}>Sin servicios registrados</Text>
            )}
            
            <Text style={styles.sectionTitle}>Rango de Precios</Text>
            <Text style={styles.description}>{professional.priceRange || 'No especificado'}</Text>
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.reviewsContainer}>
            <ReviewsSection
              professionalId={id}
              professionalName={professional.name}
              professionalImage={professional.image}
              navigation={navigation}
            />
          </View>
        )}
      </ScrollView>

      {/* Botón de contacto */}
      <View style={styles.contactContainer}>
        <Button
          title={`Contactar a ${professional.name} por WhatsApp`}
          onPress={handleContact}
          style={styles.contactButton}
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  reviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  reviewsButtonText: {
    marginLeft: theme.spacing.xs,
    fontSize: 14,
    color: theme.colors.white,
    fontWeight: '500',
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  favoriteButton: {
    padding: theme.spacing.sm,
  },
  favoriteButtonDisabled: {
    opacity: 0.6,
  },
  professionalInfo: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  professionalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  professionalSpecialty: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  ratingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  infoContent: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  certificationText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  availabilityText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  responseTimeText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  languagesText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  servicesContent: {
    padding: theme.spacing.lg,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  serviceText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  reviewsContent: {
    padding: theme.spacing.lg,
  },
  reviewsContainer: {
    flex: 1,
  },
  contactContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  contactButton: {
    backgroundColor: theme.colors.success,
    marginBottom: theme.spacing.xl + 5,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
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

