import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { theme } from '../config/theme';
import { documentAPI } from '../services/api';

interface DocumentValidationFlowProps {
  onValidationComplete: (isValid: boolean, frontImage: string, backImage: string, profileImage: string) => void;
}

type ValidationStep = 'front-capture' | 'front-validating' | 'front-validated' | 'back-capture' | 'back-validating' | 'back-validated' | 'profile-capture' | 'completed';

export const DocumentValidationFlow: React.FC<DocumentValidationFlowProps> = ({
  onValidationComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<ValidationStep>('front-capture');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    details: string[];
  } | null>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos Requeridos',
        'Necesitamos acceso a tu cámara para capturar el documento de identidad.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async (side: 'front' | 'back' | 'profile') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: side === 'profile' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        if (side === 'front') {
          setFrontImage(result.assets[0].uri);
          setCurrentStep('front-validating');
          validateFrontDocument(result.assets[0].uri);
        } else if (side === 'back') {
          setBackImage(result.assets[0].uri);
          setCurrentStep('back-validating');
          validateBackDocument(result.assets[0].uri);
        } else if (side === 'profile') {
          setProfileImage(result.assets[0].uri);
          setCurrentStep('completed');
          setTimeout(() => {
            if (frontImage && backImage && result.assets[0].uri) {
              onValidationComplete(true, frontImage, backImage, result.assets[0].uri);
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const selectFromGallery = async (side: 'front' | 'back' | 'profile') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: side === 'profile' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        if (side === 'front') {
          setFrontImage(result.assets[0].uri);
          setCurrentStep('front-validating');
          validateFrontDocument(result.assets[0].uri);
        } else if (side === 'back') {
          setBackImage(result.assets[0].uri);
          setCurrentStep('back-validating');
          validateBackDocument(result.assets[0].uri);
        } else if (side === 'profile') {
          setProfileImage(result.assets[0].uri);
          setCurrentStep('completed');
          setTimeout(() => {
            if (frontImage && backImage && result.assets[0].uri) {
              onValidationComplete(true, frontImage, backImage, result.assets[0].uri);
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const validateFrontDocument = async (imageUri: string) => {
    try {
      console.log('Validando documento frontal con OCR...');
      
      // Convertir imagen a base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Usar API del backend para validación con OCR
      const response = await documentAPI.validateDNI(base64Image, 'front');
      
      console.log('Respuesta de validación frontal:', response);
      
      const result = {
        isValid: response.valid,
        message: response.valid 
          ? 'Documento frontal validado exitosamente' 
          : response.message || 'Error en la validación del documento frontal',
        details: response.valid 
          ? [
              '✓ Foto frontal clara y legible',
              '✓ Información del documento visible',
              '✓ Documento no expirado',
              `✓ Confianza: ${response.confidence}%`
            ]
          : [
              '✗ Foto frontal borrosa o ilegible',
              '✗ Información del documento no visible',
              '✗ Documento expirado o inválido'
            ]
      };
      
      setValidationResult(result);
      
      if (response.valid) {
        setCurrentStep('front-validated');
        // Continuar automáticamente al siguiente paso
        setTimeout(() => {
          setCurrentStep('back-capture');
        }, 2000);
      } else {
        setCurrentStep('front-capture');
      }
    } catch (error) {
      console.error('Error validando documento frontal:', error);
      
      const result = {
        isValid: false,
        message: 'Error al validar el documento frontal',
        details: [
          '✗ Error de conexión con el servidor',
          '✗ No se pudo procesar la imagen',
          '✗ Intenta de nuevo'
        ]
      };
      
      setValidationResult(result);
      setCurrentStep('front-capture');
    }
  };

  const validateBackDocument = async (imageUri: string) => {
    try {
      console.log('Validando documento trasero con OCR...');
      
      // Convertir imagen a base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Usar API del backend para validación con OCR
      const response = await documentAPI.validateDNI(base64Image, 'back');
      
      console.log('Respuesta de validación trasera:', response);
      
      const result = {
        isValid: response.valid,
        message: response.valid 
          ? 'Documento trasero validado exitosamente' 
          : response.message || 'Error en la validación del documento trasero',
        details: response.valid 
          ? [
              '✓ Foto trasera clara y legible',
              '✓ Información del documento visible',
              '✓ Documento no expirado',
              `✓ Confianza: ${response.confidence}%`
            ]
          : [
              '✗ Foto trasera borrosa o ilegible',
              '✗ Información del documento no visible',
              '✗ Documento expirado o inválido'
            ]
      };
      
      setValidationResult(result);
      
      if (response.valid) {
        setCurrentStep('back-validated');
        // Continuar automáticamente al siguiente paso
        setTimeout(() => {
          setCurrentStep('profile-capture');
        }, 2000);
      } else {
        setCurrentStep('back-capture');
      }
    } catch (error) {
      console.error('Error validando documento trasero:', error);
      
      const result = {
        isValid: false,
        message: 'Error al validar el documento trasero',
        details: [
          '✗ Error de conexión con el servidor',
          '✗ No se pudo procesar la imagen',
          '✗ Intenta de nuevo'
        ]
      };
      
      setValidationResult(result);
      setCurrentStep('back-capture');
    }
  };

  const retryValidation = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontImage(null);
      setCurrentStep('front-capture');
    } else {
      setBackImage(null);
      setCurrentStep('back-capture');
    }
    setValidationResult(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'front-capture':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Captura del Frente del DNI</Text>
            </View>
            
            <Text style={styles.stepDescription}>
              Toma una foto clara del frente de tu documento de identidad
            </Text>

            <View style={styles.imageCaptureContainer}>
              {frontImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: frontImage }} style={styles.capturedImage} />
                  <TouchableOpacity 
                    style={styles.retakeButton} 
                    onPress={() => retryValidation('front')}
                  >
                    <Ionicons name="refresh" size={20} color={theme.colors.primary} />
                    <Text style={styles.retakeButtonText}>Volver a tomar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageSelectorContainer}>
                  <TouchableOpacity 
                    style={styles.imageSelector} 
                    onPress={() => takePhoto('front')}
                  >
                    <Ionicons name="camera" size={48} color={theme.colors.primary} />
                    <Text style={styles.imageSelectorText}>Tomar Foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.imageSelector} 
                    onPress={() => selectFromGallery('front')}
                  >
                    <Ionicons name="images" size={48} color={theme.colors.primary} />
                    <Text style={styles.imageSelectorText}>Galería</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        );

      case 'front-validating':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Validando Documento Frontal</Text>
            </View>
            
            <View style={styles.validatingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.validatingText}>Analizando documento...</Text>
              <Text style={styles.validatingSubtext}>
                Estamos verificando la información del documento
              </Text>
            </View>
          </View>
        );

      case 'front-validated':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNumber, styles.stepNumberCompleted]}>
                <Text style={styles.stepNumberText}>✓</Text>
              </View>
              <Text style={styles.stepTitle}>Documento Frontal Validado</Text>
            </View>
            
            <View style={styles.validatedContainer}>
              <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
              <Text style={styles.validatedText}>¡Documento frontal validado!</Text>
              <Text style={styles.validatedSubtext}>
                Continuando al siguiente paso...
              </Text>
            </View>
          </View>
        );

      case 'back-capture':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Captura del Reverso del DNI</Text>
            </View>
            
            <Text style={styles.stepDescription}>
              Ahora toma una foto clara del reverso de tu documento
            </Text>

            <View style={styles.imageCaptureContainer}>
              {backImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: backImage }} style={styles.capturedImage} />
                  <TouchableOpacity 
                    style={styles.retakeButton} 
                    onPress={() => retryValidation('back')}
                  >
                    <Ionicons name="refresh" size={20} color={theme.colors.primary} />
                    <Text style={styles.retakeButtonText}>Volver a tomar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageSelectorContainer}>
                  <TouchableOpacity 
                    style={styles.imageSelector} 
                    onPress={() => takePhoto('back')}
                  >
                    <Ionicons name="camera" size={48} color={theme.colors.primary} />
                    <Text style={styles.imageSelectorText}>Tomar Foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.imageSelector} 
                    onPress={() => selectFromGallery('back')}
                  >
                    <Ionicons name="images" size={48} color={theme.colors.primary} />
                    <Text style={styles.imageSelectorText}>Galería</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        );

      case 'back-validating':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Validando Documento Trasero</Text>
            </View>
            
            <View style={styles.validatingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.validatingText}>Analizando documento...</Text>
              <Text style={styles.validatingSubtext}>
                Estamos verificando la información del documento
              </Text>
            </View>
          </View>
        );

      case 'back-validated':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNumber, styles.stepNumberCompleted]}>
                <Text style={styles.stepNumberText}>✓</Text>
              </View>
              <Text style={styles.stepTitle}>Documento Trasero Validado</Text>
            </View>
            
            <View style={styles.validatedContainer}>
              <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
              <Text style={styles.validatedText}>¡Documento trasero validado!</Text>
              <Text style={styles.validatedSubtext}>
                Continuando al siguiente paso...
              </Text>
            </View>
          </View>
        );

      case 'profile-capture':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepTitle}>Foto de Perfil</Text>
            </View>
            
            <Text style={styles.stepDescription}>
              Toma una foto clara de tu rostro para tu perfil profesional
            </Text>

            <View style={styles.imageCaptureContainer}>
              {profileImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: profileImage }} style={styles.capturedImage} />
                  <TouchableOpacity 
                    style={styles.retakeButton} 
                    onPress={() => {
                      setProfileImage(null);
                      setCurrentStep('profile-capture');
                    }}
                  >
                    <Ionicons name="refresh" size={20} color={theme.colors.primary} />
                    <Text style={styles.retakeButtonText}>Volver a tomar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageSelectorContainer}>
                  <TouchableOpacity 
                    style={styles.imageSelector} 
                    onPress={() => takePhoto('profile')}
                  >
                    <Ionicons name="camera" size={48} color={theme.colors.primary} />
                    <Text style={styles.imageSelectorText}>Tomar Foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.imageSelector} 
                    onPress={() => selectFromGallery('profile')}
                  >
                    <Ionicons name="images" size={48} color={theme.colors.primary} />
                    <Text style={styles.imageSelectorText}>Galería</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        );

      case 'completed':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNumber, styles.stepNumberCompleted]}>
                <Text style={styles.stepNumberText}>✓</Text>
              </View>
              <Text style={styles.stepTitle}>Validación Exitosa</Text>
            </View>
            
            <View style={styles.validatedContainer}>
              <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
              <Text style={styles.validatedText}>¡Documentos validados!</Text>
              <Text style={styles.validatedSubtext}>
                Ahora puedes completar tu registro
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const renderProgressBar = () => {
    const steps = ['front-capture', 'front-validating', 'front-validated', 'back-capture', 'back-validating', 'back-validated', 'profile-capture', 'completed'];
    const currentIndex = steps.indexOf(currentStep);
    const progress = ((currentIndex + 1) / steps.length) * 100;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Paso {Math.min(Math.floor(currentIndex / 2) + 1, 3).toString()} de 3
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderProgressBar()}
      
      <View style={styles.content}>
        {renderStepContent()}
      </View>

      {/* Modal de resultado de validación */}
      <Modal
        visible={validationResult !== null && !validationResult.isValid}
        transparent
        animationType="slide"
        onRequestClose={() => setValidationResult(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="close-circle" size={32} color={theme.colors.error} />
              <Text style={styles.modalTitle}>Error de Validación</Text>
            </View>

            <Text style={styles.modalMessage}>
              {validationResult?.message}
            </Text>

            <View style={styles.validationDetails}>
              {validationResult?.details.map((detail, index) => (
                <Text key={index} style={styles.validationDetail}>
                  {detail}
                </Text>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonError}
                onPress={() => {
                  setValidationResult(null);
                  retryValidation(currentStep.includes('front') ? 'front' : 'back');
                }}
              >
                <Text style={styles.modalButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  progressContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  stepNumber: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  stepNumberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  stepNumberCompleted: {
    backgroundColor: theme.colors.success,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  stepDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  imageCaptureContainer: {
    width: '100%',
    alignItems: 'center',
  },
  imageSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
  },
  imageSelector: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    minWidth: 120,
  },
  imageSelectorText: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
  },
  capturedImage: {
    width: 200,
    height: 150,
    borderRadius: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  retakeButtonText: {
    marginLeft: theme.spacing.xs,
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  validatingContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  validatingText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  validatingSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  validatedContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  validatedText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.success,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  validatedSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.lg,
    padding: theme.spacing.xl,
    margin: theme.spacing.lg,
    maxWidth: '90%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginTop: theme.spacing.sm,
  },
  modalMessage: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  validationDetails: {
    marginBottom: theme.spacing.lg,
  },
  validationDetail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    paddingLeft: theme.spacing.sm,
  },
  modalButtons: {
    alignItems: 'center',
  },
  modalButtonError: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.spacing.md,
  },
  modalButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
