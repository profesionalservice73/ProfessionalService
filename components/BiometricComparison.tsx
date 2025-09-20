import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

interface BiometricComparisonProps {
  dniFrontUri: string;
  dniBackUri: string;
  selfieUri: string;
  onComparisonComplete: (isMatch: boolean, confidence: number) => void;
  onBack: () => void;
}

export const BiometricComparison: React.FC<BiometricComparisonProps> = ({
  dniFrontUri,
  dniBackUri,
  selfieUri,
  onComparisonComplete,
  onBack,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const performComparison = async () => {
    setIsProcessing(true);
    
    // Simular procesamiento rápido
    setTimeout(() => {
      setIsProcessing(false);
      
      // Simular resultado exitoso
      const isMatch = true;
      const confidence = 95;
      
      Alert.alert(
        "Verificación completada",
        "✅ Verificación biométrica completada exitosamente",
        [
          {
            text: "Continuar",
            onPress: () => onComparisonComplete(isMatch, confidence)
          }
        ]
      );
    }, 1000);
  };

  const handleContinue = () => {
    performComparison();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verificación Biométrica</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={80} color={theme.colors.primary} />
        </View>

        <Text style={styles.title}>Verificación de Identidad</Text>
        <Text style={styles.subtitle}>
          Compararemos tu selfie con la foto de tu DNI para verificar tu identidad
        </Text>

        {/* Images Preview */}
        <View style={styles.imagesContainer}>
          <View style={styles.imagePreview}>
            <Image source={{ uri: dniFrontUri }} style={styles.previewImage} />
            <Text style={styles.imageLabel}>DNI</Text>
          </View>
          
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-forward" size={24} color={theme.colors.primary} />
          </View>
          
          <View style={styles.imagePreview}>
            <Image source={{ uri: selfieUri }} style={styles.previewImage} />
            <Text style={styles.imageLabel}>Selfie</Text>
          </View>
        </View>

        <Text style={styles.instructions}>
          • Se comparará tu rostro con la foto del DNI{"\n"}
          • El proceso es rápido y seguro{"\n"}
          • Tus datos están protegidos
        </Text>

        {isProcessing && (
          <View style={styles.processingContainer}>
            <Text style={styles.processingText}>Procesando verificación...</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, isProcessing && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={isProcessing}
        >
          <Text style={styles.continueButtonText}>
            {isProcessing ? "Procesando..." : "Iniciar Verificación"}
          </Text>
          <Ionicons name="shield-checkmark" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  imagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  imagePreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.sm,
  },
  imageLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  arrowContainer: {
    marginHorizontal: theme.spacing.lg,
  },
  instructions: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  processingContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  processingText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: theme.spacing.lg,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
});