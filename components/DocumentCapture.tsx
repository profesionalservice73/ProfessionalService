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
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { theme } from '../config/theme';
import { documentAPI } from '../services/api';

interface DocumentCaptureProps {
  onDocumentCaptured: (frontUri: string, backUri: string) => void;
  onBack: () => void;
}

interface DocumentValidation {
  isValid: boolean;
  issues: string[];
  score: number;
  confidence?: 'low' | 'medium' | 'high';
  recommendations?: string[];
}

interface DocumentValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  confidence: 'low' | 'medium' | 'high';
  documentType: string;
  side: string;
  recommendations: string[];
}

export const DocumentCapture: React.FC<DocumentCaptureProps> = ({
  onDocumentCaptured,
  onBack,
}) => {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [frontValidation, setFrontValidation] = useState<DocumentValidation | null>(null);
  const [backValidation, setBackValidation] = useState<DocumentValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Resetear estado de validación cuando se cambia de documento
  useEffect(() => {
    // Resetear validaciones cuando se monta el componente
    setFrontValidation(null);
    setBackValidation(null);
    setIsValidating(false);
  }, []);

  const validateDocument = async (imageUri: string, type: 'front' | 'back'): Promise<DocumentValidation> => {
    try {
      console.log(`[DocumentCapture] Iniciando validación con Gemini AI para DNI ${type}`);
      
      // Convertir imagen a base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Usar API del backend para validación con OCR
      const response: any = await documentAPI.validateDNI(base64Image, type); // Call new backend API
      
      if (!response.success) {
        throw new Error(response.error || 'Error en la validación');
      }
      
      const validationResult = response.data;
      
      console.log(`[DocumentCapture] Resultado validación Gemini:`, {
        isValid: validationResult.isValid,
        score: validationResult.score,
        issues: validationResult.issues,
        confidence: validationResult.confidence,
        documentType: validationResult.documentType
      });
      
      return {
        isValid: validationResult.isValid,
        issues: validationResult.issues,
        score: validationResult.score,
        confidence: validationResult.confidence,
        recommendations: validationResult.recommendations
      };
      
    } catch (error) {
      console.error('[DocumentCapture] Error en validación con Gemini:', error);
      return {
        isValid: false,
        issues: ['Error al validar el documento con IA. Intenta nuevamente.'],
        score: 0,
        confidence: 'low',
        recommendations: ['Verifica que la imagen sea clara y completa']
      };
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Necesitamos acceso a la cámara para capturar el documento',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const captureDocument = async (type: 'front' | 'back') => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10], // Proporción ideal para documentos
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Resetear estado de validación anterior
        if (type === 'front') {
          setFrontValidation(null);
        } else {
          setBackValidation(null);
        }
        
        setIsValidating(true);
        
        try {
          const validation = await validateDocument(imageUri, type);
          
          if (type === 'front') {
            setFrontImage(imageUri);
            setFrontValidation(validation);
          } else {
            setBackImage(imageUri);
            setBackValidation(validation);
          }
          
          if (!validation.isValid) {
            const sideText = type === 'front' ? 'frente' : 'dorso';
            const sideTextUpper = type === 'front' ? 'FRENTE' : 'DORSO';
            
            Alert.alert(
              'Documento no válido',
              `🔍 El sistema detectó que esta imagen no es el ${sideText} de un DNI argentino válido.\n\nPor favor, captura una imagen del ${sideText} del documento de identidad.`,
              [{ text: 'Entendido' }]
            );
          } else {
            const sideText = type === 'front' ? 'frente' : 'dorso';
            
            Alert.alert(
              'Documento válido',
              `✅ ${sideText.toUpperCase()} del DNI argentino detectado correctamente.`,
              [{ text: 'Continuar' }]
            );
          }
        } catch (error) {
          Alert.alert('Error', 'Error al validar el documento. Intenta de nuevo.');
        } finally {
          setIsValidating(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Error al capturar la imagen');
    }
  };

  const selectFromGallery = async (type: 'front' | 'back') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Resetear estado de validación anterior
        if (type === 'front') {
          setFrontValidation(null);
        } else {
          setBackValidation(null);
        }
        
        setIsValidating(true);
        
        try {
          const validation = await validateDocument(imageUri, type);
          
          if (type === 'front') {
            setFrontImage(imageUri);
            setFrontValidation(validation);
          } else {
            setBackImage(imageUri);
            setBackValidation(validation);
          }
          
          if (!validation.isValid) {
            const sideText = type === 'front' ? 'frente' : 'dorso';
            
            Alert.alert(
              'Documento no válido',
              `🔍 El sistema detectó que esta imagen no es el ${sideText} de un DNI argentino válido.\n\nPor favor, selecciona una imagen del ${sideText} del documento de identidad.`,
              [{ text: 'Entendido' }]
            );
          } else {
            const sideText = type === 'front' ? 'frente' : 'dorso';
            
            Alert.alert(
              'Documento válido',
              `✅ ${sideText.toUpperCase()} del DNI argentino detectado correctamente.`,
              [{ text: 'Continuar' }]
            );
          }
        } catch (error) {
          Alert.alert('Error', 'Error al validar el documento. Intenta de nuevo.');
        } finally {
          setIsValidating(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Error al seleccionar la imagen');
    }
  };

  const retakeDocument = (type: 'front' | 'back') => {
    Alert.alert(
      'Retomar foto',
      '¿Cómo quieres capturar el documento?',
      [
        { text: 'Cámara', onPress: () => captureDocument(type) },
        { text: 'Galería', onPress: () => selectFromGallery(type) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleContinue = () => {
    if (frontImage && backImage && frontValidation?.isValid && backValidation?.isValid) {
      onDocumentCaptured(frontImage, backImage);
    } else {
      Alert.alert(
        'Documentos requeridos',
        'Debes capturar y validar tanto el frente como el dorso del DNI para continuar.'
      );
    }
  };

  const renderDocumentSection = (
    type: 'front' | 'back',
    image: string | null,
    validation: DocumentValidation | null
  ) => {
    const isFront = type === 'front';
    const title = isFront ? 'DNI - Frente' : 'DNI - Dorso';
    const instructions = isFront 
      ? 'Captura el frente de tu DNI donde aparecen tus datos personales'
      : 'Captura el dorso de tu DNI donde aparece la información adicional';

    return (
      <View style={styles.documentSection}>
        <View style={styles.documentHeader}>
          <Ionicons 
            name="card" 
            size={30} 
            color={theme.colors.primary} 
          />
          <Text style={styles.documentTitle}>{title}</Text>
        </View>
        
        <Text style={styles.documentInstructions}>{instructions}</Text>
        
        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.documentImage} />
            
            {validation && (
              <View style={[
                styles.validationStatus,
                validation.isValid ? styles.validationSuccess : styles.validationError
              ]}>
                <Ionicons 
                  name={validation.isValid ? 'checkmark-circle' : 'close-circle'} 
                  size={20} 
                  color={validation.isValid ? theme.colors.success : theme.colors.error} 
                />
                <Text style={[
                  styles.validationText,
                  validation.isValid ? styles.validationSuccessText : styles.validationErrorText
                ]}>
                  {validation.isValid ? 'Válido' : 'No válido'} ({validation.score}%)
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => retakeDocument(type)}
            >
              <Ionicons name="camera" size={16} color={theme.colors.primary} />
              <Text style={styles.retakeButtonText}>Retomar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.captureButtons}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={() => captureDocument(type)}
              disabled={isValidating}
            >
              <Ionicons name="camera" size={24} color={theme.colors.white} />
              <Text style={styles.captureButtonText}>Cámara</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.captureButton}
              onPress={() => selectFromGallery(type)}
              disabled={isValidating}
            >
              <Ionicons name="images" size={24} color={theme.colors.white} />
              <Text style={styles.captureButtonText}>Galería</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {validation && !validation.isValid && (
          <View style={styles.issuesContainer}>
            <Text style={styles.issuesTitle}>🔍 Validación por OCR:</Text>
            <Text style={styles.issueText}>• Esta imagen no es el {type === 'front' ? 'frente' : 'dorso'} de un DNI argentino válido</Text>
            <Text style={styles.issueText}>• Por favor, captura una imagen del {type === 'front' ? 'frente' : 'dorso'} del documento de identidad</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Captura de Documento</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={styles.instructionsContainer}>
          <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          <Text style={styles.instructionsText}>
            Para completar tu verificación, necesitamos capturar el frente y dorso de tu DNI.
            Asegúrate de que el documento esté bien iluminado y sin reflejos.
          </Text>
        </View>

        {renderDocumentSection('front', frontImage, frontValidation)}
        {renderDocumentSection('back', backImage, backValidation)}

        {isValidating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>🔍 Verificando documento del DNI...</Text>
            <Text style={styles.loadingSubtext}>Analizando imagen con OCR</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!frontImage || !backImage || !frontValidation?.isValid || !backValidation?.isValid) && 
            styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!frontImage || !backImage || !frontValidation?.isValid || !backValidation?.isValid}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
        </TouchableOpacity>
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
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  instructionsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    lineHeight: 20,
  },
  documentSection: {
    marginBottom: theme.spacing.xl,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  documentInstructions: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  documentImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  validationStatus: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  validationSuccess: {
    borderColor: theme.colors.success,
  },
  validationError: {
    borderColor: theme.colors.error,
  },
  validationText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  validationSuccessText: {
    color: theme.colors.success,
  },
  validationErrorText: {
    color: theme.colors.error,
  },
  retakeButton: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  retakeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  captureButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.md,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    minWidth: 120,
    justifyContent: 'center',
  },
  captureButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  issuesContainer: {
    backgroundColor: theme.colors.error + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.error,
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  issueText: {
    fontSize: 12,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  recommendationText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 50,
  },
  continueButton: {
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