import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

interface KYCResultProps {
  isApproved: boolean;
  reviewType: 'automatic' | 'manual';
  confidence?: number;
  issues?: string[];
  onComplete: () => void;
  onRetry?: () => void;
}

const { width } = Dimensions.get('window');

export const KYCResult: React.FC<KYCResultProps> = ({
  isApproved,
  reviewType,
  confidence = 0,
  issues = [],
  onComplete,
  onRetry,
}) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const scaleAnimation = new Animated.Value(0);
  const fadeAnimation = new Animated.Value(0);
  const slideAnimation = new Animated.Value(50);

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Animación de escala para el ícono
    Animated.spring(scaleAnimation, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Animación de fade para el contenido
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 800,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Animación de slide para los botones
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 600,
      delay: 600,
      useNativeDriver: true,
    }).start(() => {
      setAnimationComplete(true);
    });
  };

  const getResultConfig = () => {
    if (isApproved) {
      return {
        icon: 'checkmark-circle',
        color: theme.colors.success,
        backgroundColor: theme.colors.success + '20',
        title: '¡Verificación Exitosa!',
        subtitle: 'Tu identidad ha sido verificada correctamente',
        description: 'Ya puedes acceder a todas las funcionalidades de la aplicación',
        primaryAction: 'Continuar',
        showSecondaryAction: false,
      };
    } else {
      return {
        icon: 'close-circle',
        color: theme.colors.error,
        backgroundColor: theme.colors.error + '20',
        title: 'Verificación Rechazada',
        subtitle: reviewType === 'manual' 
          ? 'Tu solicitud fue revisada y no cumple con los requisitos'
          : 'No se pudo verificar tu identidad automáticamente',
        description: reviewType === 'manual'
          ? 'Por favor, revisa los motivos y contacta a soporte si necesitas ayuda'
          : 'Se ha enviado tu solicitud para revisión manual',
        primaryAction: reviewType === 'manual' ? 'Contactar Soporte' : 'Entendido',
        showSecondaryAction: reviewType === 'automatic' && !!onRetry,
      };
    }
  };

  const config = getResultConfig();

  const handlePrimaryAction = () => {
    if (isApproved) {
      onComplete();
    } else if (reviewType === 'manual') {
      // Abrir contacto de soporte
      Alert.alert(
        'Contactar Soporte',
        '¿Cómo te gustaría contactar a nuestro equipo de soporte?',
        [
          { text: 'Email', onPress: () => {/* Abrir email */} },
          { text: 'Teléfono', onPress: () => {/* Abrir teléfono */} },
          { text: 'Chat', onPress: () => {/* Abrir chat */} },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    } else {
      onComplete();
    }
  };

  const handleSecondaryAction = () => {
    if (onRetry) {
      Alert.alert(
        'Reintentar Verificación',
        '¿Estás seguro de que quieres volver a intentar el proceso de verificación?',
        [
          { text: 'Sí, reintentar', onPress: onRetry },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    }
  };

  const renderSuccessDetails = () => (
    <Animated.View 
      style={[
        styles.detailsContainer,
        { opacity: fadeAnimation }
      ]}
    >
      <View style={styles.detailCard}>
        <Ionicons name="shield-checkmark" size={24} color={theme.colors.success} />
        <Text style={styles.detailTitle}>Verificación Completa</Text>
        <Text style={styles.detailText}>
          Tu identidad ha sido verificada exitosamente. Ahora puedes:
        </Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark" size={16} color={theme.colors.success} />
            <Text style={styles.benefitText}>Acceder a todas las funcionalidades</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark" size={16} color={theme.colors.success} />
            <Text style={styles.benefitText}>Realizar transacciones seguras</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark" size={16} color={theme.colors.success} />
            <Text style={styles.benefitText}>Contactar profesionales verificados</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderFailureDetails = () => (
    <Animated.View 
      style={[
        styles.detailsContainer,
        { opacity: fadeAnimation }
      ]}
    >
      {issues.length > 0 && (
        <View style={styles.issuesCard}>
          <Ionicons name="warning" size={24} color={theme.colors.error} />
          <Text style={styles.issuesTitle}>Motivos del Rechazo:</Text>
          {issues.map((issue, index) => (
            <Text key={index} style={styles.issueText}>• {issue}</Text>
          ))}
        </View>
      )}
      
      <View style={styles.helpCard}>
        <Ionicons name="help-circle" size={24} color={theme.colors.primary} />
        <Text style={styles.helpTitle}>¿Qué puedes hacer?</Text>
        <View style={styles.helpList}>
          <View style={styles.helpItem}>
            <Ionicons name="camera" size={16} color={theme.colors.primary} />
            <Text style={styles.helpText}>Asegúrate de que las fotos sean claras y legibles</Text>
          </View>
          <View style={styles.helpItem}>
            <Ionicons name="document-text" size={16} color={theme.colors.primary} />
            <Text style={styles.helpText}>Verifica que el documento no esté vencido</Text>
          </View>
          <View style={styles.helpItem}>
            <Ionicons name="person" size={16} color={theme.colors.primary} />
            <Text style={styles.helpText}>Asegúrate de que la selfie coincida con el DNI</Text>
          </View>
          <View style={styles.helpItem}>
            <Ionicons name="call" size={16} color={theme.colors.primary} />
            <Text style={styles.helpText}>Contacta a soporte si necesitas ayuda</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Ícono animado */}
        <Animated.View 
          style={[
            styles.iconContainer,
            { 
              backgroundColor: config.backgroundColor,
              transform: [{ scale: scaleAnimation }]
            }
          ]}
        >
          <Ionicons name={config.icon as any} size={100} color={config.color} />
        </Animated.View>

        {/* Título y subtítulo */}
        <Animated.View 
          style={[
            styles.textContainer,
            { 
              opacity: fadeAnimation,
              transform: [{ translateY: slideAnimation }]
            }
          ]}
        >
          <Text style={[styles.title, { color: config.color }]}>
            {config.title}
          </Text>
          <Text style={styles.subtitle}>
            {config.subtitle}
          </Text>
          <Text style={styles.description}>
            {config.description}
          </Text>
        </Animated.View>

        {/* Detalles adicionales */}
        {animationComplete && (
          <>
            {isApproved ? renderSuccessDetails() : renderFailureDetails()}
          </>
        )}

        {/* Botones de acción */}
        <Animated.View 
          style={[
            styles.actionsContainer,
            { 
              opacity: fadeAnimation,
              transform: [{ translateY: slideAnimation }]
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: config.color }]}
            onPress={handlePrimaryAction}
          >
            <Text style={styles.primaryButtonText}>
              {config.primaryAction}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
          </TouchableOpacity>

          {config.showSecondaryAction && (
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleSecondaryAction}
            >
              <Ionicons name="refresh" size={20} color={theme.colors.primary} />
              <Text style={styles.secondaryButtonText}>
                Reintentar
              </Text>
            </TouchableOpacity>
          )}

          {!isApproved && (
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => setShowDetails(!showDetails)}
            >
              <Ionicons name="information-circle" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.helpButtonText}>
                {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: width * 0.8,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  detailCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
    marginBottom: theme.spacing.md,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  benefitsList: {
    gap: theme.spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  issuesCard: {
    backgroundColor: theme.colors.error + '10',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  issuesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  issueText: {
    fontSize: 14,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
    lineHeight: 18,
  },
  helpCard: {
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  helpList: {
    gap: theme.spacing.sm,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    minWidth: width * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.md,
    minWidth: width * 0.7,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  helpButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginLeft: theme.spacing.xs,
  },
});
