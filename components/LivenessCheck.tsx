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
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../config/theme';
import { faceValidationAPI } from '../services/api';

interface LivenessCheckProps {
  onSelfieCaptured: (selfieUri: string) => void;
  onBack: () => void;
}

interface LivenessChallenge {
  id: string;
  instruction: string;
  icon: string;
  duration: number;
}

interface LivenessResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
}

export const LivenessCheck: React.FC<LivenessCheckProps> = ({
  onSelfieCaptured,
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState<'instructions' | 'challenge' | 'capture' | 'validation'>('instructions');
  const [currentChallenge, setCurrentChallenge] = useState<LivenessChallenge | null>(null);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [livenessResult, setLivenessResult] = useState<LivenessResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState<string>('');
  const [challengeTimer, setChallengeTimer] = useState(0);
  
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  const challenges: LivenessChallenge[] = [
    {
      id: 'blink',
      instruction: 'Parpadea lentamente',
      icon: 'eye',
      duration: 3000,
    },
    {
      id: 'smile',
      instruction: 'Sonríe ampliamente',
      icon: 'happy',
      duration: 3000,
    },
    {
      id: 'turn_left',
      instruction: 'Gira la cabeza hacia la izquierda',
      icon: 'arrow-back',
      duration: 2000,
    },
    {
      id: 'turn_right',
      instruction: 'Gira la cabeza hacia la derecha',
      icon: 'arrow-forward',
      duration: 2000,
    },
    {
      id: 'look_up',
      instruction: 'Mira hacia arriba',
      icon: 'arrow-up',
      duration: 2000,
    },
  ];

  useEffect(() => {
    if (currentStep === 'challenge' && currentChallenge) {
      startChallenge();
    }
  }, [currentStep, currentChallenge]);

  const startChallenge = () => {
    if (!currentChallenge) return;

    setChallengeTimer(currentChallenge.duration / 1000);
    setChallengeProgress(0);
    
    // Animación de pulso
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Timer del desafío
    const timer = setInterval(() => {
      setChallengeTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          pulse.stop();
          setCurrentStep('capture');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Progreso del desafío
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: currentChallenge.duration,
      useNativeDriver: false,
    }).start();

    const progressTimer = setInterval(() => {
      setChallengeProgress(prev => {
        const newProgress = prev + (100 / (currentChallenge.duration / 100));
        if (newProgress >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return newProgress;
      });
    }, 100);
  };

  const startRandomChallenge = () => {
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    setCurrentChallenge(randomChallenge);
    setCurrentStep('challenge');
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Necesitamos acceso a la cámara para la verificación de identidad',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const captureSelfie = async () => {
    console.log(`[LivenessCheck] 📷 Iniciando captura de selfie...`);
    
    const permissionStart = Date.now();
    const hasPermission = await requestCameraPermission();
    const permissionTime = Date.now() - permissionStart;
    console.log(`[LivenessCheck] 🔐 Permisos verificados en ${permissionTime}ms: ${hasPermission ? 'OK' : 'DENEGADO'}`);
    
    if (!hasPermission) {
      console.log(`[LivenessCheck] ❌ Sin permisos de cámara - abortando captura`);
      return;
    }

    try {
      console.log(`[LivenessCheck] 📸 Abriendo cámara con configuración:`, {
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });
      
      const cameraStart = Date.now();
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Selfie cuadrada
        quality: 0.8,
      });
      const cameraTime = Date.now() - cameraStart;
      
      console.log(`[LivenessCheck] 📷 Cámara cerrada después de ${cameraTime}ms`);
      console.log(`[LivenessCheck] 📊 Resultado de cámara:`, {
        canceled: result.canceled,
        hasAssets: result.assets && result.assets.length > 0,
        assetCount: result.assets ? result.assets.length : 0
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log(`[LivenessCheck] ✅ Selfie capturada exitosamente: ${imageUri}`);
        console.log(`[LivenessCheck] 📏 Detalles de la imagen:`, {
          uri: imageUri,
          width: result.assets[0].width,
          height: result.assets[0].height,
          fileSize: result.assets[0].fileSize
        });
        
        setSelfieImage(imageUri);
        setCurrentStep('validation');
        
        console.log(`[LivenessCheck] 🔄 Iniciando validación de selfie...`);
        validateLiveness(imageUri);
      } else {
        console.log(`[LivenessCheck] ❌ Captura cancelada o sin assets`);
      }
    } catch (error) {
      console.error(`[LivenessCheck] 💥 Error capturando selfie:`, error);
      Alert.alert('Error', 'Error al capturar la selfie');
    }
  };

  const validateLiveness = async (imageUri: string) => {
    console.log(`[LivenessCheck] 🚀 Validación simple de selfie`);
    
    setIsValidating(true);
    setValidationProgress('Validando selfie...');
    
    try {
      // Crear archivo para enviar al backend
      const selfieFile = {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'selfie.jpg',
      } as any;

      // Usar validación simple
      const validationResponse = await faceValidationAPI.validateSelfie(selfieFile);
      
      console.log(`[LivenessCheck] 📊 Respuesta:`, validationResponse);
      
      if (!(validationResponse as any).success) {
        throw new Error((validationResponse as any).error || 'Error validando selfie');
      }

      const validationData = (validationResponse as any).data;
      
      const result: LivenessResult = {
        isValid: validationData.valid,
        confidence: validationData.confidence,
        issues: validationData.issues || [],
      };
      
      console.log(`[LivenessCheck] ✅ Resultado:`, result);
      setLivenessResult(result);
      
      if (!result.isValid) {
        Alert.alert(
          'Verificación fallida',
          `La verificación no fue exitosa:\n\n• ${result.issues.join('\n• ')}\n\nPor favor, intenta de nuevo.`,
          [
            { text: 'Reintentar', onPress: () => retryLiveness() },
            { text: 'Cancelar', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert(
          'Verificación exitosa',
          `La verificación fue completada correctamente.\nConfianza: ${result.confidence}%`,
          [{ text: 'Continuar', onPress: () => onSelfieCaptured(imageUri) }]
        );
      }
    } catch (error) {
      const errorObj = error as Error;
      console.error(`[LivenessCheck] 💥 Error:`, error);
      
      Alert.alert(
        'Error de validación', 
        `Error al validar la selfie. Intenta de nuevo.\n\nError: ${errorObj.message}`,
        [
          { text: 'Reintentar', onPress: () => retryLiveness() },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    } finally {
      setIsValidating(false);
      setValidationProgress('');
    }
  };


  const retryLiveness = () => {
    setCurrentStep('instructions');
    setCurrentChallenge(null);
    setSelfieImage(null);
    setLivenessResult(null);
    setChallengeProgress(0);
    setChallengeTimer(0);
    progressAnimation.setValue(0);
    pulseAnimation.setValue(1);
  };

  const renderInstructions = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="person-circle" size={60} color={theme.colors.primary} />
      </View>
      
      <Text style={styles.stepTitle}>Verificación de Identidad</Text>
      <Text style={styles.stepSubtitle}>
        Para completar tu verificación, necesitamos confirmar que eres una persona real
      </Text>
      
      <View style={styles.instructionsList}>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          <Text style={styles.instructionText}>Asegúrate de estar en un lugar bien iluminado</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          <Text style={styles.instructionText}>Mantén el rostro centrado en la pantalla</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          <Text style={styles.instructionText}>Sigue las instrucciones que aparecerán</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          <Text style={styles.instructionText}>No uses gafas de sol o accesorios que cubran el rostro</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.startButton} onPress={startRandomChallenge}>
        <Text style={styles.startButtonText}>Comenzar Verificación</Text>
        <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  );

  const renderChallenge = () => (
    <View style={styles.stepContainer}>
      <View style={styles.challengeContainer}>
        <Animated.View style={[styles.challengeIcon, { transform: [{ scale: pulseAnimation }] }]}>
          <Ionicons 
            name={currentChallenge?.icon as any} 
            size={80} 
            color={theme.colors.primary} 
          />
        </Animated.View>
        
        <Text style={styles.challengeInstruction}>
          {currentChallenge?.instruction}
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
          <Text style={styles.timerText}>{challengeTimer}s</Text>
        </View>
      </View>
    </View>
  );

  const renderCapture = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="camera" size={60} color={theme.colors.primary} />
      </View>
      
      <Text style={styles.stepTitle}>Captura tu Selfie</Text>
      <Text style={styles.stepSubtitle}>
        Ahora toma una selfie clara de tu rostro
      </Text>
      
      <View style={styles.captureInstructions}>
        <Text style={styles.captureInstructionText}>
          • Mantén el rostro centrado{'\n'}
          • Mira directamente a la cámara{'\n'}
          • Asegúrate de tener buena iluminación{'\n'}
          • Mantén una expresión neutra
        </Text>
      </View>
      
      <TouchableOpacity style={styles.captureButton} onPress={captureSelfie}>
        <Ionicons name="camera" size={24} color={theme.colors.white} />
        <Text style={styles.captureButtonText}>Tomar Selfie</Text>
      </TouchableOpacity>
    </View>
  );

  const renderValidation = () => (
    <View style={styles.stepContainer}>
      {selfieImage && (
        <View style={styles.selfieContainer}>
          <Image source={{ uri: selfieImage }} style={styles.selfieImage} />
          
          {livenessResult && (
            <View style={[
              styles.validationStatus,
              livenessResult.isValid ? styles.validationSuccess : styles.validationError
            ]}>
              <Ionicons 
                name={livenessResult.isValid ? 'checkmark-circle' : 'close-circle'} 
                size={24} 
                color={livenessResult.isValid ? theme.colors.success : theme.colors.error} 
              />
              <Text style={[
                styles.validationText,
                livenessResult.isValid ? styles.validationSuccessText : styles.validationErrorText
              ]}>
                {livenessResult.isValid ? 'Verificación exitosa' : 'Verificación fallida'}
              </Text>
              <Text style={styles.confidenceText}>
                Confianza: {livenessResult.confidence}%
              </Text>
            </View>
          )}
        </View>
      )}
      
      {isValidating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Validando selfie...</Text>
          {validationProgress && (
            <Text style={styles.progressText}>{validationProgress}</Text>
          )}
        </View>
      )}
      
      {livenessResult && !livenessResult.isValid && (
        <View style={styles.issuesContainer}>
          <Text style={styles.issuesTitle}>Problemas detectados:</Text>
          {livenessResult.issues.map((issue, index) => (
            <Text key={index} style={styles.issueText}>• {issue}</Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Verificación de Vida</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {currentStep === 'instructions' && renderInstructions()}
        {currentStep === 'challenge' && renderChallenge()}
        {currentStep === 'capture' && renderCapture()}
        {currentStep === 'validation' && renderValidation()}
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
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  instructionsList: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  instructionText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  startButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
  challengeContainer: {
    alignItems: 'center',
    width: '100%',
  },
  challengeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  challengeInstruction: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
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
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  captureInstructions: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  captureInstructionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  captureButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  selfieContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  selfieImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: theme.spacing.lg,
  },
  validationStatus: {
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: 200,
  },
  validationSuccess: {
    backgroundColor: theme.colors.success + '20',
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  validationError: {
    backgroundColor: theme.colors.error + '20',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  validationText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  validationSuccessText: {
    color: theme.colors.success,
  },
  validationErrorText: {
    color: theme.colors.error,
  },
  confidenceText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  issuesContainer: {
    backgroundColor: theme.colors.error + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.error,
    width: '100%',
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
});
