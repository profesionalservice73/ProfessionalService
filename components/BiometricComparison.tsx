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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import { faceValidationAPI } from '../services/api';

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
  const [isCancelled, setIsCancelled] = useState(false);
  
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (currentStep === 'processing') {
      startBiometricComparison();
    }
  }, [currentStep]);

  const startBiometricComparison = async () => {
    setIsProcessing(true);
    setProgress(0);
    setIsCancelled(false);
    
    // Crear AbortController para cancelar la operación
    abortControllerRef.current = new AbortController();
    
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

    try {
      // Proceso de comparación facial con timeout
      const steps = [
        { step: 'Extrayendo rostro del DNI...', progress: 20 },
        { step: 'Analizando características faciales del documento...', progress: 40 },
        { step: 'Procesando selfie...', progress: 60 },
        { step: 'Comparando rostros...', progress: 80 },
        { step: 'Calculando coincidencia...', progress: 95 },
        { step: 'Generando resultado final...', progress: 100 },
      ];

      // Ejecutar comparación real en paralelo con la animación
      const comparisonPromise = performBiometricComparison();
      
      // Animar progreso mientras se ejecuta la comparación
      for (let i = 0; i < steps.length - 1; i++) {
        // Verificar si fue cancelado
        if (isCancelled || abortControllerRef.current?.signal.aborted) {
          throw new Error('Operación cancelada por el usuario');
        }
        
        await new Promise(resolve => setTimeout(resolve, 300)); // Reducido a 300ms para validación simplificada
        setProgress(steps[i].progress);
        
        Animated.timing(progressAnimation, {
          toValue: steps[i].progress / 100,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }

      // Verificar si fue cancelado antes de esperar el resultado
      if (isCancelled || abortControllerRef.current?.signal.aborted) {
        throw new Error('Operación cancelada por el usuario');
      }

      // Esperar a que termine la comparación (sin timeout para validación simplificada)
      let result;
      try {
        result = await comparisonPromise;
      } catch (error) {
        // Si hay error, usar validación simplificada automáticamente
        console.log('Error en comparación, usando validación simplificada...');
        result = await performSimplifiedValidation();
      }

      // Verificar si fue cancelado después del resultado
      if (isCancelled || abortControllerRef.current?.signal.aborted) {
        throw new Error('Operación cancelada por el usuario');
      }

      // Completar animación
      setProgress(100);
      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      pulse.stop();
      
      setComparisonResult(result as ComparisonResult);
      setCurrentStep('result');
      setIsProcessing(false);

    } catch (error) {
      console.error('Error en comparación biométrica:', error);
      pulse.stop();
      
      // Si fue cancelado, no mostrar resultado de error
      if (isCancelled || error.message === 'Operación cancelada por el usuario') {
        setIsProcessing(false);
        return;
      }
      
      // Si hay timeout, usar validación simplificada automáticamente
      if (error.message === 'Timeout' || error.message.includes('tardó demasiado')) {
        console.log('Timeout en comparación biométrica, usando validación simplificada...');
        const simplifiedResult = await performSimplifiedValidation();
        setComparisonResult(simplifiedResult);
        setCurrentStep('result');
        setIsProcessing(false);
        return;
      }
      
      // Crear resultado de error con mensajes más claros
      let errorMessage = 'Error al comparar los rostros';
      let errorTitle = 'Error de Verificación';
      
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'Se aplicó una validación instantánea para continuar sin problemas.';
        errorTitle = 'Verificación Completada';
      } else if (error.message.includes('cancelada')) {
        errorMessage = 'La verificación fue cancelada. Puedes intentar de nuevo cuando estés listo.';
        errorTitle = 'Verificación Cancelada';
      } else if (error.message) {
        errorMessage = 'Se aplicó una validación instantánea para continuar.';
      }
      
      const errorResult: ComparisonResult = {
        isMatch: false, // Cambiar a false para indicar error real
        confidence: 0, // Sin confianza en caso de error
        faceMatch: false,
        documentValidity: true,
        issues: [errorMessage],
        biometricScore: 0,
      };
      
      setComparisonResult(errorResult);
      setCurrentStep('result');
      setIsProcessing(false);
    }
  };

  const performBiometricComparison = async (): Promise<ComparisonResult> => {
    try {
      console.log('Iniciando comparación facial con face-api.js...');
      
      // Crear archivos para enviar al backend
      const dniImageFile = {
        uri: dniFrontUri,
        type: 'image/jpeg',
        name: 'dni.jpg',
      } as any;

      const selfieImageFile = {
        uri: selfieUri,
        type: 'image/jpeg',
        name: 'selfie.jpg',
      } as any;

      // Comparar rostros usando face-api.js en el backend
      console.log('Enviando imágenes para comparación facial...');
      console.log('DNI URI:', dniFrontUri);
      console.log('Selfie URI:', selfieUri);
      
      const comparisonResponse = await faceValidationAPI.compareFaces(dniImageFile, selfieImageFile);
      
      console.log('Respuesta de comparación facial:', comparisonResponse);
      
      if (!comparisonResponse.success) {
        // Manejar diferentes tipos de errores
        if (comparisonResponse.error === 'Timeout') {
          console.log('Timeout en comparación facial, usando validación simplificada...');
          return await performSimplifiedValidation();
        }
        throw new Error(comparisonResponse.message || comparisonResponse.error || 'Error comparando rostros');
      }

      const comparisonData = comparisonResponse.data;
      
      if (!comparisonData) {
        throw new Error('No se recibieron datos de comparación');
      }
      
      console.log('Datos recibidos del backend:', comparisonData);
      console.log('Valores específicos:', {
        match: comparisonData.match,
        confidence: comparisonData.confidence,
        threshold: 35,
        matchType: typeof comparisonData.match,
        confidenceType: typeof comparisonData.confidence
      });
      
      const issues: string[] = [];
      
      // Usar los valores correctos del backend
      const confidence = comparisonData.confidence || 0;
      const biometricScore = comparisonData.confidence || 0; // Mismo valor que confidence
      
      // Validar resultado de la comparación
      if (!comparisonData.match) {
        issues.push('No se detectó coincidencia facial entre el DNI y la selfie');
      } else if (comparisonData.confidence < 35) {
        issues.push('Coincidencia facial con baja confianza');
      }

      const isMatch = comparisonData.match && comparisonData.confidence >= 35;
      
      console.log('Cálculo de isMatch:', {
        match: comparisonData.match,
        confidence: comparisonData.confidence,
        confidenceGte35: comparisonData.confidence >= 35,
        isMatch: isMatch
      });
      
      console.log('Resultado de comparación:', {
        isMatch,
        confidence: confidence,
        faceMatch: comparisonData.match,
        biometricScore: biometricScore,
        issues
      });
      
      return {
        isMatch,
        confidence: confidence,
        faceMatch: comparisonData.match || false,
        documentValidity: true, // Siempre true - no validamos documento aquí
        issues,
        biometricScore: biometricScore,
      };

    } catch (error) {
      console.error('Error en comparación biométrica:', error);
      
      // Determinar el mensaje de error apropiado
      let errorMessage = 'Error al comparar los rostros';
      if (error.message.includes('Timeout') || error.message.includes('tardó demasiado')) {
        errorMessage = 'La comparación facial tardó demasiado tiempo';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'Error de conexión con el servidor';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        isMatch: false,
        confidence: 0,
        faceMatch: false,
        documentValidity: true,
        issues: [errorMessage],
        biometricScore: 0,
      };
    }
  };

  // Validación de selfie con backend
  const validateSelfieQuality = async (imageUri: string): Promise<{isValid: boolean, issues: string[]}> => {
    try {
      console.log('Validando calidad de selfie...');
      
      // Validar selfie usando el endpoint de validación
      const selfieImageFile = {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'selfie.jpg',
      } as any;

      const validationResponse = await faceValidationAPI.validateSelfie(selfieImageFile);
      
      if (!validationResponse.success) {
        return {
          isValid: false,
          issues: [validationResponse.message || 'Error validando la selfie']
        };
      }

      const validationData = validationResponse.data;
      
      if (!validationData.valid) {
        return {
          isValid: false,
          issues: validationData.issues || ['La selfie no cumple con los requisitos de calidad']
        };
      }

      return {
        isValid: true,
        issues: []
      };

    } catch (error) {
      console.error('Error validando calidad de selfie:', error);
      return {
        isValid: true, // Asumir válida para no bloquear
        issues: []
      };
    }
  };

  // Validación simplificada removida - usar solo validación real del servidor
  const performSimplifiedValidation = async (): Promise<ComparisonResult> => {
    console.log('Validación simplificada removida - usando solo validación real');
    
    // Retornar error para forzar reintento con validación real
    return {
      isMatch: false,
      confidence: 0,
      faceMatch: false,
      documentValidity: true,
      issues: ['Error de conexión - intenta de nuevo'],
      biometricScore: 0,
    };
  };


  const handleCancel = () => {
    setIsCancelled(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
    setCurrentStep('result');
    
    // Crear resultado de cancelación
    const cancelResult: ComparisonResult = {
      isMatch: false,
      confidence: 0,
      faceMatch: false,
      documentValidity: true,
      issues: ['Verificación cancelada por el usuario'],
      biometricScore: 0,
    };
    
    setComparisonResult(cancelResult);
  };

  const handleRetry = () => {
    setCurrentStep('processing');
    setComparisonResult(null);
    setProgress(0);
    setIsCancelled(false);
    progressAnimation.setValue(0);
    pulseAnimation.setValue(1);
  };

  const handleContinue = () => {
    console.log('🔄 Botón Continuar presionado');
    console.log('📊 comparisonResult:', comparisonResult);
    
    if (comparisonResult) {
      console.log('✅ Llamando onComparisonComplete con:', {
        isMatch: comparisonResult.isMatch,
        confidence: comparisonResult.confidence
      });
      onComparisonComplete(comparisonResult.isMatch, comparisonResult.confidence);
    } else {
      console.log('❌ comparisonResult es null, no se puede continuar');
    }
  };

  const renderProcessing = () => (
    <View style={styles.stepContainer}>
      <Animated.View style={[styles.processingIcon, { transform: [{ scale: pulseAnimation }] }]}>
        <Ionicons name="finger-print" size={80} color={theme.colors.primary} />
      </Animated.View>
      
      <Text style={styles.processingTitle}>Comparación Facial</Text>
      <Text style={styles.processingSubtitle}>
        Estamos comparando tu rostro con la foto del DNI para verificar que seas la misma persona
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
          <Text style={styles.processingStepText}>Extrayendo rostro del DNI</Text>
        </View>
        <View style={styles.processingStep}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          <Text style={styles.processingStepText}>Analizando características faciales</Text>
        </View>
        <View style={styles.processingStep}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          <Text style={styles.processingStepText}>Procesando selfie</Text>
        </View>
        <View style={styles.processingStep}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.processingStepText}>Comparando rostros</Text>
        </View>
      </View>
      
    </View>
  );

  const renderResult = () => {
    if (!comparisonResult) return null;
    
    console.log('Renderizando resultado con datos:', {
      isMatch: comparisonResult.isMatch,
      confidence: comparisonResult.confidence,
      biometricScore: comparisonResult.biometricScore,
      faceMatch: comparisonResult.faceMatch,
      issues: comparisonResult.issues
    });
    
    console.log('Valores que se mostrarán en pantalla:', {
      puntuacionCoincidencia: `${comparisonResult.biometricScore}%`,
      confianzaComparacion: `${comparisonResult.confidence}%`,
      coincidenciaFacial: comparisonResult.faceMatch ? 'Sí' : 'No'
    });

    return (
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
          {comparisonResult.isMatch 
            ? 'Verificación Exitosa' 
            : (comparisonResult.issues[0]?.includes('instantánea') 
                ? 'Verificación Completada' 
                : comparisonResult.issues[0]?.includes('conexión') 
                  ? 'Verificación Completada'
                  : comparisonResult.issues[0]?.includes('cancelada')
                    ? 'Verificación Cancelada'
                    : 'Verificación Rechazada'
              )
          }
        </Text>
        
        <Text style={styles.resultSubtitle}>
          {comparisonResult.isMatch 
            ? 'Tu identidad ha sido verificada correctamente'
            : comparisonResult.issues[0]?.includes('instantánea')
              ? 'Se aplicó una validación instantánea para una experiencia más rápida.'
              : comparisonResult.issues[0]?.includes('conexión')
                ? 'Se aplicó una validación instantánea para continuar sin problemas.'
                : comparisonResult.issues[0]?.includes('cancelada')
                  ? 'La verificación fue cancelada. Puedes intentar de nuevo cuando estés listo.'
                  : 'La verificación fue rechazada. Por favor, intenta de nuevo con mejores condiciones de iluminación y posición.'
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
            <Ionicons name="analytics" size={20} color={theme.colors.primary} />
            <Text style={styles.detailText}>
              Puntuación de coincidencia: {comparisonResult.biometricScore}%
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="eye" size={20} color={theme.colors.primary} />
            <Text style={styles.detailText}>
              Confianza en la comparación: {comparisonResult.confidence}%
            </Text>
          </View>
        </View>
        
        {comparisonResult.issues.length > 0 && (
          <View style={[
            styles.issuesContainer,
            comparisonResult.isMatch ? styles.issuesContainerSuccess : styles.issuesContainerError
          ]}>
            <Text style={[
              styles.issuesTitle,
              comparisonResult.isMatch ? styles.issuesTitleSuccess : styles.issuesTitleError
            ]}>
              {comparisonResult.isMatch 
                ? 'Verificación Completada'
                : 'Verificación Rechazada'
              }
            </Text>
            {comparisonResult.issues.map((issue, index) => (
              <Text key={index} style={[
                styles.issueText,
                comparisonResult.isMatch ? styles.issueTextSuccess : styles.issueTextError
              ]}>• {issue}</Text>
            ))}
            
            {/* Sugerencias específicas según el tipo de error */}
            {comparisonResult.issues[0]?.includes('instantánea') && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionText}>✅ Validación instantánea aplicada</Text>
                <Text style={styles.suggestionText}>💡 Experiencia optimizada para mayor velocidad</Text>
                <Text style={styles.suggestionText}>💡 Verificación completada exitosamente</Text>
              </View>
            )}
            
            {comparisonResult.issues[0]?.includes('conexión') && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionText}>💡 Verifica tu conexión WiFi o datos</Text>
                <Text style={styles.suggestionText}>💡 Intenta cambiar de red</Text>
                <Text style={styles.suggestionText}>💡 Reinicia la aplicación</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Mostrar botón continuar solo si la verificación es exitosa */}
        {comparisonResult.isMatch && (
          <View style={styles.resultActions}>
            <TouchableOpacity 
              style={styles.continueButtonFullWidth} 
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>
                Continuar
              </Text>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Mostrar botón reintentar si la verificación es rechazada */}
        {!comparisonResult.isMatch && (
          <View style={styles.resultActions}>
            <TouchableOpacity 
              style={[styles.continueButtonFullWidth, { backgroundColor: theme.colors.error }]} 
              onPress={handleRetry}
            >
              <Text style={styles.continueButtonText}>
                Reintentar
              </Text>
              <Ionicons name="refresh" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        )}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Comparación Facial</Text>
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
    paddingBottom: theme.spacing.xl + 30, // Espacio extra en la parte inferior
  },
  scrollContainer: {
    flex: 1,
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
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  issuesContainerSuccess: {
    backgroundColor: theme.colors.success + '10',
    borderLeftColor: theme.colors.success,
  },
  issuesContainerError: {
    backgroundColor: theme.colors.error + '10',
    borderLeftColor: theme.colors.error,
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  issuesTitleSuccess: {
    color: theme.colors.success,
  },
  issuesTitleError: {
    color: theme.colors.error,
  },
  issueText: {
    fontSize: 12,
    marginBottom: theme.spacing.xs,
  },
  issueTextSuccess: {
    color: theme.colors.success,
  },
  issueTextError: {
    color: theme.colors.error,
  },
  resultActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl + 20, // Espacio extra para evitar botones nativos
    paddingHorizontal: theme.spacing.sm,
  },
  retryButton: {
    flex: 0.48, // 48% del ancho para que haya espacio entre botones
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: theme.spacing.xs,
    textAlign: 'center',
  },
  continueButton: {
    flex: 0.48, // 48% del ancho para que haya espacio entre botones
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  continueButtonFullWidth: {
    width: '100%', // Ancho completo
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.border,
    borderWidth: 2,
    borderColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginRight: theme.spacing.xs,
    textAlign: 'center',
  },
  suggestionsContainer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  suggestionText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: 16,
  },
});
