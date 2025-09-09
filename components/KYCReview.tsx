import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

interface KYCReviewProps {
  kycData: {
    dniFrontUri: string;
    dniBackUri: string;
    selfieUri: string;
    otpVerified: boolean;
    biometricMatch: boolean;
    biometricConfidence: number;
  };
  onReviewComplete: (isApproved: boolean, reviewType: 'automatic' | 'manual') => void;
  onBack: () => void;
}

interface ReviewResult {
  isApproved: boolean;
  reviewType: 'automatic' | 'manual';
  confidence: number;
  issues: string[];
  recommendations: string[];
}

export const KYCReview: React.FC<KYCReviewProps> = ({
  kycData,
  onReviewComplete,
  onBack,
}) => {
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'processing' | 'result' | 'manual'>('processing');
  const [processingStep, setProcessingStep] = useState(0);
  const [manualReviewData, setManualReviewData] = useState<any>(null);

  const processingSteps = [
    'Validando datos del documento...',
    'Verificando autenticidad del DNI...',
    'Analizando calidad de las imágenes...',
    'Evaluando coincidencia biométrica...',
    'Revisando consistencia de datos...',
    'Generando recomendación final...',
  ];

  useEffect(() => {
    if (currentStep === 'processing') {
      startAutomaticReview();
    }
  }, [currentStep]);

  const startAutomaticReview = async () => {
    setIsProcessing(true);
    setProcessingStep(0);

    // Simular proceso de revisión automática
    for (let i = 0; i < processingSteps.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Simular resultado de revisión automática
    const result = await performAutomaticReview();
    setReviewResult(result);
    
    if (result.isApproved || result.confidence >= 80) {
      setCurrentStep('result');
    } else {
      // Si la confianza es baja, pasar a revisión manual
      setCurrentStep('manual');
      await initiateManualReview();
    }
    
    setIsProcessing(false);
  };

  const performAutomaticReview = async (): Promise<ReviewResult> => {
    // Simular revisión automática
    // En producción, aquí integrarías con servicios de:
    // - Validación de documentos (Jumio, Onfido, etc.)
    // - Verificación de identidad
    // - Análisis de riesgo
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    let confidence = 100;
    
    // Validar OTP
    if (!kycData.otpVerified) {
      issues.push('Verificación OTP no completada');
      confidence -= 20;
    }
    
    // Validar coincidencia biométrica
    if (!kycData.biometricMatch) {
      issues.push('No se detectó coincidencia entre el DNI y la selfie');
      confidence -= 30;
    } else if (kycData.biometricConfidence < 80) {
      issues.push('Coincidencia biométrica con baja confianza');
      confidence -= 15;
    }
    
    // Simular otros problemas
    const random = Math.random();
    
    if (random < 0.1) {
      issues.push('Calidad de imagen del DNI insuficiente');
      confidence -= 10;
    }
    
    if (random < 0.05) {
      issues.push('Posibles signos de manipulación en el documento');
      confidence -= 25;
    }
    
    if (random < 0.08) {
      issues.push('Información inconsistente en los datos');
      confidence -= 15;
    }
    
    // Generar recomendaciones
    if (confidence < 70) {
      recommendations.push('Se requiere revisión manual por un especialista');
    }
    
    if (issues.some(issue => issue.includes('calidad'))) {
      recommendations.push('Solicitar nuevas fotos con mejor calidad');
    }
    
    if (issues.some(issue => issue.includes('biométrica'))) {
      recommendations.push('Repetir el proceso de verificación biométrica');
    }
    
    const isApproved = confidence >= 80 && kycData.otpVerified && kycData.biometricMatch;
    
    return {
      isApproved,
      reviewType: 'automatic',
      confidence,
      issues,
      recommendations,
    };
  };

  const initiateManualReview = async () => {
    // Simular envío a revisión manual
    // En producción, aquí se enviarían los datos a un panel de administración
    // para que un especialista los revise
    
    setManualReviewData({
      id: `KYC_${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      priority: reviewResult?.confidence < 50 ? 'high' : 'normal',
    });
    
    Alert.alert(
      'Revisión Manual Requerida',
      'Tu solicitud ha sido enviada para revisión manual. Un especialista revisará tu información y te notificaremos el resultado en las próximas 24 horas.',
      [
        { text: 'Entendido', onPress: () => onReviewComplete(false, 'manual') }
      ]
    );
  };

  const handleRetry = () => {
    setCurrentStep('processing');
    setReviewResult(null);
    setProcessingStep(0);
    setManualReviewData(null);
  };

  const renderProcessing = () => (
    <View style={styles.stepContainer}>
      <View style={styles.processingIcon}>
        <Ionicons name="shield-checkmark" size={80} color={theme.colors.primary} />
      </View>
      
      <Text style={styles.processingTitle}>Revisión Automática</Text>
      <Text style={styles.processingSubtitle}>
        Estamos revisando toda tu información para verificar tu identidad
      </Text>
      
      <View style={styles.processingSteps}>
        {processingSteps.map((step, index) => (
          <View key={index} style={styles.processingStep}>
            <Ionicons 
              name={index <= processingStep ? 'checkmark-circle' : 'ellipse-outline'} 
              size={20} 
              color={index <= processingStep ? theme.colors.success : theme.colors.border} 
            />
            <Text style={[
              styles.processingStepText,
              index <= processingStep && styles.processingStepTextActive
            ]}>
              {step}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.dataSummary}>
        <Text style={styles.dataSummaryTitle}>Datos Revisados:</Text>
        <View style={styles.dataItem}>
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
          <Text style={styles.dataItemText}>Verificación OTP</Text>
        </View>
        <View style={styles.dataItem}>
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
          <Text style={styles.dataItemText}>Captura de DNI</Text>
        </View>
        <View style={styles.dataItem}>
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
          <Text style={styles.dataItemText}>Verificación de vida</Text>
        </View>
        <View style={styles.dataItem}>
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
          <Text style={styles.dataItemText}>Comparación biométrica</Text>
        </View>
      </View>
    </View>
  );

  const renderResult = () => {
    if (!reviewResult) return null;

    return (
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.stepContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.resultIcon,
          reviewResult.isApproved ? styles.resultIconSuccess : styles.resultIconWarning
        ]}>
          <Ionicons 
            name={reviewResult.isApproved ? 'checkmark-circle' : 'warning'} 
            size={80} 
            color={reviewResult.isApproved ? theme.colors.success : theme.colors.warning} 
          />
        </View>
        
        <Text style={[
          styles.resultTitle,
          reviewResult.isApproved ? styles.resultTitleSuccess : styles.resultTitleWarning
        ]}>
          {reviewResult.isApproved ? 'Aprobado Automáticamente' : 'Revisión Manual Requerida'}
        </Text>
        
        <Text style={styles.resultSubtitle}>
          {reviewResult.isApproved 
            ? 'Tu identidad ha sido verificada exitosamente'
            : 'Se requiere revisión adicional por un especialista'
          }
        </Text>
        
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Nivel de Confianza:</Text>
          <View style={styles.confidenceBar}>
            <View 
              style={[
                styles.confidenceFill,
                { 
                  width: `${reviewResult.confidence}%`,
                  backgroundColor: reviewResult.confidence >= 80 ? theme.colors.success : 
                                  reviewResult.confidence >= 60 ? theme.colors.warning : theme.colors.error
                }
              ]} 
            />
          </View>
          <Text style={styles.confidenceText}>{reviewResult.confidence}%</Text>
        </View>
        
        {reviewResult.issues.length > 0 && (
          <View style={styles.issuesContainer}>
            <Text style={styles.issuesTitle}>Problemas Detectados:</Text>
            {reviewResult.issues.map((issue, index) => (
              <Text key={index} style={styles.issueText}>• {issue}</Text>
            ))}
          </View>
        )}
        
        {reviewResult.recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>Recomendaciones:</Text>
            {reviewResult.recommendations.map((recommendation, index) => (
              <Text key={index} style={styles.recommendationText}>• {recommendation}</Text>
            ))}
          </View>
        )}
        
        <View style={styles.actionsContainer}>
          {!reviewResult.isApproved && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Ionicons name="refresh" size={20} color={theme.colors.primary} />
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.continueButton,
              !reviewResult.isApproved && styles.continueButtonWarning
            ]} 
            onPress={() => onReviewComplete(reviewResult.isApproved, reviewResult.reviewType)}
          >
            <Text style={styles.continueButtonText}>
              {reviewResult.isApproved ? 'Continuar' : 'Enviar a Revisión Manual'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderManual = () => (
    <View style={styles.stepContainer}>
      <View style={styles.manualIcon}>
        <Ionicons name="person-circle" size={80} color={theme.colors.warning} />
      </View>
      
      <Text style={styles.manualTitle}>Revisión Manual</Text>
      <Text style={styles.manualSubtitle}>
        Tu solicitud ha sido enviada para revisión manual por un especialista
      </Text>
      
      {manualReviewData && (
        <View style={styles.manualDataContainer}>
          <Text style={styles.manualDataTitle}>Detalles de la Solicitud:</Text>
          <View style={styles.manualDataItem}>
            <Text style={styles.manualDataLabel}>ID de Solicitud:</Text>
            <Text style={styles.manualDataValue}>{manualReviewData.id}</Text>
          </View>
          <View style={styles.manualDataItem}>
            <Text style={styles.manualDataLabel}>Estado:</Text>
            <Text style={styles.manualDataValue}>Pendiente de revisión</Text>
          </View>
          <View style={styles.manualDataItem}>
            <Text style={styles.manualDataLabel}>Prioridad:</Text>
            <Text style={[
              styles.manualDataValue,
              manualReviewData.priority === 'high' && styles.highPriorityText
            ]}>
              {manualReviewData.priority === 'high' ? 'Alta' : 'Normal'}
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.manualInstructions}>
        <Text style={styles.manualInstructionsTitle}>¿Qué sucede ahora?</Text>
        <View style={styles.manualInstructionItem}>
          <Ionicons name="time" size={16} color={theme.colors.primary} />
          <Text style={styles.manualInstructionText}>
            Un especialista revisará tu información en las próximas 24 horas
          </Text>
        </View>
        <View style={styles.manualInstructionItem}>
          <Ionicons name="notifications" size={16} color={theme.colors.primary} />
          <Text style={styles.manualInstructionText}>
            Recibirás una notificación con el resultado
          </Text>
        </View>
        <View style={styles.manualInstructionItem}>
          <Ionicons name="help-circle" size={16} color={theme.colors.primary} />
          <Text style={styles.manualInstructionText}>
            Si tienes dudas, contacta a soporte
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.continueButton} 
        onPress={() => onReviewComplete(false, 'manual')}
      >
        <Text style={styles.continueButtonText}>Entendido</Text>
        <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Revisión KYC</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {currentStep === 'processing' && renderProcessing()}
        {currentStep === 'result' && renderResult()}
        {currentStep === 'manual' && renderManual()}
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
  scrollContainer: {
    flex: 1,
  },
  stepContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
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
  processingSteps: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  processingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  processingStepText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  processingStepTextActive: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  dataSummary: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  dataSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  dataItemText: {
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
  resultIconWarning: {
    backgroundColor: theme.colors.warning + '20',
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
  resultTitleWarning: {
    color: theme.colors.warning,
  },
  resultSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  confidenceContainer: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  confidenceBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'right',
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
  recommendationsContainer: {
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  recommendationText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  actionsContainer: {
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
  continueButtonWarning: {
    backgroundColor: theme.colors.warning,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
  manualIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  manualTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  manualSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  manualDataContainer: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  manualDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  manualDataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  manualDataLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  manualDataValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  highPriorityText: {
    color: theme.colors.error,
  },
  manualInstructions: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  manualInstructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  manualInstructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  manualInstructionText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
});
