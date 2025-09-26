import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { professionalAPI } from '../../services/api';
import PendingValidationScreen from './pending-validation';
import RejectedValidationScreen from './rejected-validation';
import ApprovedValidationScreen from './approved-validation';
import ProfessionalLayout from './__layout';

export default function ValidationWrapper() {
  const { user } = useAuth();
  const [validationStatus, setValidationStatus] = useState<string | null>(null);
  const [professionalData, setProfessionalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApprovalMessage, setShowApprovalMessage] = useState(false);

  useEffect(() => {
    checkValidationStatus();
  }, [user]);

  // Refrescar estado cuando la pantalla se enfoque (útil cuando regresa de la pantalla de aprobación)
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        checkValidationStatus();
      }
    }, [user])
  );

  const checkValidationStatus = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 ValidationWrapper - Verificando estado de validación para user:', user.id);
      
      // Crear un timeout para evitar carga infinita
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La validación tardó demasiado')), 10000); // 10 segundos
      });
      
      // Obtener datos del profesional por userId con timeout
      const apiPromise = professionalAPI.getProfileByUserId(user.id);
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      console.log('🔍 ValidationWrapper - Respuesta del API:', response);
      
      if (response.success && response.data) {
        const professional = response.data;
        setProfessionalData(professional);
        const status = professional.validationStatus || 'pending';
        setValidationStatus(status);
        
        console.log('🔍 ValidationWrapper - Estado de validación:', status);
        
        // Si el profesional fue aprobado, verificar si debe mostrar mensaje de aprobación
        if (status === 'approved' && professional.validatedAt) {
          const validationDate = new Date(professional.validatedAt);
          const now = new Date();
          const hoursSinceValidation = (now.getTime() - validationDate.getTime()) / (1000 * 60 * 60);
          
          // Mostrar mensaje de aprobación si fue validado en las últimas 24 horas
          if (hoursSinceValidation < 24) {
            // Verificar si ya vio el mensaje de aprobación
            const approvalMessageKey = `approval_message_seen_${user.id}`;
            const seen = await AsyncStorage.getItem(approvalMessageKey);
            if (!seen) {
              setShowApprovalMessage(true);
            }
          }
        }
      } else {
        // Si no hay perfil profesional, asumir pending
        console.log('🔍 ValidationWrapper - No se encontró perfil profesional, asumiendo pending');
        setValidationStatus('pending');
      }
    } catch (error) {
      console.error('❌ ValidationWrapper - Error verificando estado de validación:', error);
      // En caso de error, asumir pending
      setValidationStatus('pending');
    } finally {
      console.log('🔍 ValidationWrapper - Finalizando carga, estableciendo loading: false');
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.loadingContainer} />;
  }

  // Mostrar pantalla según el estado de validación
  switch (validationStatus) {
    case 'pending':
      return <PendingValidationScreen />;
    
    case 'rejected':
      return (
        <RejectedValidationScreen 
          rejectionReason={professionalData?.rejectionReason}
          validationNotes={professionalData?.validationNotes}
        />
      );
    
    case 'approved':
      // Si debe mostrar el mensaje de aprobación, mostrarlo
      if (showApprovalMessage) {
        return (
          <ApprovedValidationScreen 
            onContinue={() => {
              setShowApprovalMessage(false);
            }}
          />
        );
      }
      // Si no, ir directamente al layout principal
      return <ProfessionalLayout />;
    
    default:
      return <ProfessionalLayout />;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
