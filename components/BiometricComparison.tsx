import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
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

interface ComparisonResult {
  isMatch: boolean;
  confidence: number;
  faceMatch: boolean;
  documentValidity: boolean;
  issues: string[];
  biometricScore: number;
}

export const BiometricComparison: React.FC<BiometricComparisonProps> = ({
  dniFrontUri,
  dniBackUri,
  selfieUri,
  onComparisonComplete,
  onBack,
}) => {
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'processing' | 'result'>('processing');
  const [progress, setProgress] = useState(0);
  
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentStep === 'processing') {
      startBiometricComparison();
    }
  }, [currentStep]);

  const startBiometricComparison = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    // Animación de pulso
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Simular proceso de comparación biométrica
    const steps = [
      { step: 'Extrayendo datos del DNI...', progress: 20 },
      { step: 'Analizando rostro en el documento...', progress: 40 },
      { step: 'Procesando selfie...', progress: 60 },
      { step: 'Comparando características faciales...', progress: 80 },
      { step: 'Validando autenticidad del documento...', progress: 95 },
      { step: 'Generando resultado final...', progress: 100 },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgress(step.progress);
      
      Animated.timing(progressAnimation, {
        toValue: step.progress / 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }

    pulse.stop();
    
    // Simular resultado de comparación
    const result = await performBiometricComparison();
    setComparisonResult(result);
    setCurrentStep('result');
    setIsProcessing(false);
  };

  const performBiometricComparison = async (): Promise<ComparisonResult> => {
    // Simular comparación biométrica
    // En producción, aquí integrarías con servicios como:
    // - AWS Rekognition
    // - Google Cloud Vision API
    // - Azure Face API
    // - Face++ API
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const issues: string[] = [];
    let faceMatch = true;
    let documentValidity = true;
    let biometricScore = 100;
    
    // Simular diferentes escenarios de validación
    const random = Math.random();
    
    // Validación de coincidencia facial
    if (random < 0.1) {
      faceMatch = false;
      issues.push('No se detectó coincidencia facial entre el DNI y la selfie');
      biometricScore -= 40;
    } else if (random < 0.2) {
      issues.push('Coincidencia facial con baja confianza');
      biometricScore -= 20;
    }
    
    // Validación del documento
    if (random < 0.05) {
      documentValidity = false;
      issues.push('Documento no válido o alterado');
      biometricScore -= 30;
    } else if (random < 0.1) {
      issues.push('Posibles signos de manipulación en el documento');
      biometricScore -= 15;
    }
    
    // Validación de calidad de imágenes
    if (random < 0.15) {
      issues.push('Calidad de imagen insuficiente para comparación');
      biometricScore -= 10;
    }
    
    // Validación de edad/apariencia
    if (random < 0.08) {
      issues.push('Diferencias significativas en apariencia');
      biometricScore -= 15;
    }
    
    const isMatch = faceMatch && documentValidity && biometricScore >= 70;
    
    return {
      isMatch,
      confidence: biometricScore,
      faceMatch,
      documentValidity,
      issues,
      biometricScore,
    };
  };

  const handleRetry = () => {
    setCurrentStep('processing');
    setComparisonResult(null);
    setProgress(0);
    progressAnimation.setValue(0);
    pulseAnimation.setValue(1);
  };

  const handleContinue = () => {
    if (comparisonResult) {
      onComparisonComplete(comparisonResult.isMatch, comparisonResult.confidence);
    }
  };

  const renderProcessing = () => (
    <View style={styles.stepContainer}>
      <Animated.View style={[styles.processingIcon, { transform: [{ scale: pulseAnimation }] }]}>
        <Ionicons name="finger-print" size={80} color={theme.colors.primary} />
      </Animated.View>
      
      <Text style={styles.processingTitle}>Comparación Biométrica</Text>
      <Text style={styles.processingSubtitle}>
        Estamos comparando tu rostro con la foto del DNI para verificar tu identidad
      </Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              { width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              })}
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
      
      <View style={styles.comparisonImages}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: dniFrontUri }} style={styles.comparisonImage} />
          <Text style={styles.imageLabel}>DNI</Text>
        </View>
        
        <View style={styles.vsContainer}>
          <Ionicons name="swap-horizontal" size={30} color={theme.colors.primary} />
        </View>
        
        <View style={styles.imageContainer}>
          <Image source={{ uri: selfieUri }} style={styles.comparisonImage} />
          <Text style={styles.imageLabel}>Selfie</Text>
        </View>
      </View>
      
      <View style={styles.processingSteps}>
        <View style={styles.processingStep}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          <Text style={styles.processingStepText}>Extrayendo datos del DNI</Text>
        </View>
        <View style={styles.processingStep}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          <Text style={styles.processingStepText}>Analizando rostro en el documento</Text>
        </View>
        <View style={styles.processingStep}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          <Text style={styles.processingStepText}>Procesando selfie</Text>
        </View>
        <View style={styles.processingStep}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.processingStepText}>Comparando características faciales</Text>
        </View>
      </View>
    </View>
  );

  const renderResult = () => {
    if (!comparisonResult) return null;

    return (
      <View style={styles.stepContainer}>
        <View style={[
          styles.resultIcon,
          comparisonResult.isMatch ? styles.resultIconSuccess : styles.resultIconError
        ]}>
          <Ionicons 
            name={comparisonResult.isMatch ? 'checkmark-circle' : 'close-circle'} 
            size={80} 
            color={comparisonResult.isMatch ? theme.colors.success : theme.colors.error} 
          />
        </View>
        
        <Text style={[
          styles.resultTitle,
          comparisonResult.isMatch ? styles.resultTitleSuccess : styles.resultTitleError
        ]}>
          {comparisonResult.isMatch ? 'Verificación Exitosa' : 'Verificación Fallida'}
        </Text>
        
        <Text style={styles.resultSubtitle}>
          {comparisonResult.isMatch 
            ? 'Tu identidad ha sido verificada correctamente'
            : 'No se pudo verificar tu identidad'
          }
        </Text>
        
        <View style={styles.resultDetails}>
          <View style={styles.detailItem}>
            <Ionicons 
              name={comparisonResult.faceMatch ? 'checkmark-circle' : 'close-circle'} 
              size={20} 
              color={comparisonResult.faceMatch ? theme.colors.success : theme.colors.error} 
            />
            <Text style={styles.detailText}>
              Coincidencia facial: {comparisonResult.faceMatch ? 'Sí' : 'No'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons 
              name={comparisonResult.documentValidity ? 'checkmark-circle' : 'close-circle'} 
              size={20} 
              color={comparisonResult.documentValidity ? theme.colors.success : theme.colors.error} 
            />
            <Text style={styles.detailText}>
              Documento válido: {comparisonResult.documentValidity ? 'Sí' : 'No'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="analytics" size={20} color={theme.colors.primary} />
            <Text style={styles.detailText}>
              Puntuación biométrica: {comparisonResult.biometricScore}%
            </Text>
          </View>
        </View>
        
        {comparisonResult.issues.length > 0 && (
          <View style={styles.issuesContainer}>
            <Text style={styles.issuesTitle}>Problemas detectados:</Text>
            {comparisonResult.issues.map((issue, index) => (
              <Text key={index} style={styles.issueText}>• {issue}</Text>
            ))}
          </View>
        )}
        
        <View style={styles.resultActions}>
          {!comparisonResult.isMatch && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Ionicons name="refresh" size={20} color={theme.colors.primary} />
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.continueButton,
              !comparisonResult.isMatch && styles.continueButtonDisabled
            ]} 
            onPress={handleContinue}
            disabled={!comparisonResult.isMatch}
          >
            <Text style={styles.continueButtonText}>
              {comparisonResult.isMatch ? 'Continuar' : 'Revisión Manual'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Verificación Biométrica</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {currentStep === 'processing' && renderProcessing()}
        {currentStep === 'result' && renderResult()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl + 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  comparisonImages: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  imageContainer: {
    alignItems: 'center',
    flex: 1,
  },
  comparisonImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.sm,
  },
  imageLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  vsContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  processingSteps: {
    width: '100%',
  },
  processingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  processingStepText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  resultIconSuccess: {
    backgroundColor: theme.colors.success + '20',
  },
  resultIconError: {
    backgroundColor: theme.colors.error + '20',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  resultTitleSuccess: {
    color: theme.colors.success,
  },
  resultTitleError: {
    color: theme.colors.error,
  },
  resultSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  resultDetails: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  issuesContainer: {
    backgroundColor: theme.colors.error + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.error,
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
  },
  issueText: {
    fontSize: 12,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  resultActions: {
    flexDirection: 'row',
    width: '100%',
    gap: theme.spacing.md,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  retryButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
});
