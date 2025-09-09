import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { OTPVerification } from './OTPVerification';
import { DocumentCaptureOptimized as DocumentCapture } from './DocumentCaptureOptimized';
import { LivenessCheck } from './LivenessCheck';
import { KYCReview } from './KYCReview';
import { KYCResult } from './KYCResult';
import { theme } from '../config/theme';
import { authAPI } from '../services/api';

interface KYCFlowProps {
  userData: {
    fullName: string;
    email: string;
    phone: string;
  };
  onKYCComplete: (isApproved: boolean, kycData: any) => void;
  onBack: () => void;
}

type KYCStep = 
  | 'otp_email'
  // | 'otp_phone'  // Comentado temporalmente
  | 'documents' 
  | 'liveness' 
  | 'result';

interface KYCData {
  otpEmailVerified: boolean;
  otpPhoneVerified: boolean;
  dniFrontUri: string | null;
  dniBackUri: string | null;
  selfieUri: string | null;
  reviewResult: any;
}

export const KYCFlow: React.FC<KYCFlowProps> = ({
  userData,
  onKYCComplete,
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState<KYCStep>('otp_email');
  const [kycData, setKycData] = useState<KYCData>({
    otpEmailVerified: false,
    otpPhoneVerified: false,
    dniFrontUri: null,
    dniBackUri: null,
    selfieUri: null,
    reviewResult: null,
  });

  const sendOTP = async (type: 'email' | 'phone'): Promise<boolean> => {
    try {
      // Validar que hay datos antes de enviar
      const contactInfo = type === 'email' ? userData.email : userData.phone;
      if (!contactInfo || contactInfo.trim() === '') {
        Alert.alert(
          'Datos Faltantes',
          `No se ha proporcionado ${type === 'email' ? 'email' : 'teléfono'}. Por favor, completa tus datos básicos primero.`,
          [{ text: 'OK' }]
        );
        return false;
      }

      console.log(`[OTP] Enviando código ${type} a: ${contactInfo}`);
      
      // Llamada real a la API - usar el email del usuario que recibe la verificación
      const emailFrom = type === 'email' ? contactInfo : null;
      const response = await authAPI.sendOTP(type, contactInfo, 'kyc_verification', emailFrom);
      
      if (response.success) {
        const maskedInfo = response.data?.data?.maskedContact || response.data?.maskedContact || "tu contacto";
        Alert.alert(
          'Código Enviado',
          `Se ha enviado un código de verificación a ${maskedInfo}`,
          [{ text: 'OK' }]
        );
        return true;
      } else {
        throw new Error(response.error || 'Error enviando código');
      }
    } catch (error) {
      console.error('Error enviando OTP:', error);
      Alert.alert('Error', 'No se pudo enviar el código. Intenta de nuevo.');
      return false;
      }
  };

  const handleOTPComplete = (isVerified: boolean, type: 'email' | 'phone') => {
    if (isVerified) {
      if (type === 'email') {
        setKycData(prev => ({ ...prev, otpEmailVerified: true }));
        setCurrentStep('documents'); // Ir directamente a documentos (SMS comentado)
      } else {
        setKycData(prev => ({ ...prev, otpPhoneVerified: true }));
        setCurrentStep('documents');
      }
    }
  };

  const handleDocumentCapture = (frontUri: string, backUri: string) => {
    setKycData(prev => ({
      ...prev,
      dniFrontUri: frontUri,
      dniBackUri: backUri,
    }));
    setCurrentStep('liveness');
  };

  const handleLivenessComplete = (selfieUri: string) => {
    setKycData(prev => ({
      ...prev,
      selfieUri: selfieUri,
    }));
    
    // Después de validar la selfie, completar el KYC directamente
    const reviewResult = {
      isApproved: true, // Siempre aprobado para continuar
      reviewType: 'automatic' as const,
      timestamp: new Date().toISOString(),
    };
    
    setKycData(prev => ({
      ...prev,
      reviewResult,
    }));
    
    // Completar el KYC directamente sin comparación biométrica
    const finalKYCData = {
      ...kycData,
      selfieUri: selfieUri,
      reviewResult,
      userData,
      completedAt: new Date().toISOString(),
    };
    
    onKYCComplete(true, finalKYCData);
  };


  const handleReviewComplete = (isApproved: boolean, reviewType: 'automatic' | 'manual') => {
    const reviewResult = {
      isApproved,
      reviewType,
      timestamp: new Date().toISOString(),
    };
    
    setKycData(prev => ({
      ...prev,
      reviewResult,
    }));
    setCurrentStep('result');
  };

  const handleKYCResultComplete = () => {
    const finalKYCData = {
      ...kycData,
      userData,
      completedAt: new Date().toISOString(),
    };
    
    onKYCComplete(kycData.reviewResult?.isApproved || false, finalKYCData);
  };

  const handleRetry = () => {
    // Reiniciar el flujo desde el paso actual
    switch (currentStep) {
      case 'result':
        setCurrentStep('liveness');
        break;
      case 'liveness':
        setCurrentStep('documents');
        break;
      case 'documents':
        onBack(); // No hay paso anterior, volver al inicio
        break;
      // case 'otp_phone': // Comentado temporalmente
      //   setCurrentStep('otp_email');
      //   break;
      default:
        onBack(); // Volver al inicio del flujo
    }
  };

  const handleStepBack = () => {
    switch (currentStep) {
      // case 'otp_phone': // Comentado temporalmente
      //   setCurrentStep('otp_email');
      //   break;
      case 'documents':
        // No hay paso anterior, ir al inicio del flujo
        onBack();
        break;
      case 'liveness':
        setCurrentStep('documents');
        break;
      case 'result':
        setCurrentStep('liveness');
        break;
      default:
        onBack(); // Volver al inicio del flujo
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'otp_email':
        return (
          <OTPVerification
            email={userData.email}
            onVerificationComplete={(isVerified) => handleOTPComplete(isVerified, 'email')}
            onResendCode={() => sendOTP('email')}
            verificationType="email"
          />
        );

      // case 'otp_phone': // Comentado temporalmente
      //   return (
      //     <OTPVerification
      //       phone={userData.phone}
      //       onVerificationComplete={(isVerified) => handleOTPComplete(isVerified, 'phone')}
      //       onResendCode={() => sendOTP('phone')}
      //       verificationType="phone"
      //     />
      //   );

      case 'documents':
        return (
          <DocumentCapture
            onDocumentCaptured={handleDocumentCapture}
            onBack={handleStepBack}
          />
        );

      case 'liveness':
        return (
          <LivenessCheck
            onSelfieCaptured={handleLivenessComplete}
            onBack={handleStepBack}
          />
        );



      case 'result':
        return (
          <KYCResult
            isApproved={kycData.reviewResult?.isApproved || false}
            reviewType={kycData.reviewResult?.reviewType || 'automatic'}
            confidence={0}
            issues={kycData.reviewResult?.issues || []}
            onComplete={handleKYCResultComplete}
            onRetry={handleRetry}
          />
        );

      default:
        return null;
    }
  };

  const getStepTitle = (): string => {
    switch (currentStep) {
      // case 'otp_email': // Comentado temporalmente
      //   return 'Verificación de Email';
      // case 'otp_phone': // Comentado temporalmente
      //   return 'Verificación de Teléfono';
      case 'documents':
        return 'Captura de Documento';
      case 'liveness':
        return 'Verificación de Vida';
      case 'result':
        return 'Resultado';
      default:
        return 'Verificación KYC';
    }
  };

  const getStepProgress = (): number => {
    const steps: KYCStep[] = ['documents', 'liveness', 'result']; // Excluidos otp_email, otp_phone y biometric
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <View style={styles.container}>
      {renderCurrentStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
});
