import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { useAuth } from '../../contexts/AuthContext';

interface ApprovedValidationScreenProps {
  onContinue?: () => void;
}

export default function ApprovedValidationScreen({ onContinue }: ApprovedValidationScreenProps) {
  const { user, logout } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Mostrar animación de éxito después de un breve delay
    const timer = setTimeout(() => {
      setShowSuccess(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
    // Marcar que el mensaje de aprobación fue visto
    if (user?.id) {
      const approvalMessageKey = `approval_message_seen_${user.id}`;
      await AsyncStorage.setItem(approvalMessageKey, 'true');
    }
    
    // Llamar al callback si existe
    if (onContinue) {
      onContinue();
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: logout, style: 'destructive' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={showSuccess ? "checkmark-circle" : "checkmark-circle-outline"} 
            size={80} 
            color={theme.colors.success} 
          />
        </View>
        
        <Text style={styles.title}>¡Perfil Aprobado!</Text>
        
        <Text style={styles.subtitle}>
          Felicitaciones, tu perfil ha sido aprobado por nuestro equipo
        </Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.success} />
            <Text style={styles.infoText}>Perfil verificado y aprobado</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.infoText}>Ya puedes recibir solicitudes</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="star-outline" size={24} color={theme.colors.warning} />
            <Text style={styles.infoText}>Comienza a construir tu reputación</Text>
          </View>
        </View>
        
        <Text style={styles.description}>
          Ahora puedes acceder a todas las funcionalidades de la aplicación y 
          comenzar a recibir solicitudes de clientes.
        </Text>
        
        <Text style={styles.welcomeText}>
          ¡Bienvenido a Professional Service!
        </Text>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Ionicons name="arrow-forward-outline" size={20} color={theme.colors.white} />
          <Text style={styles.continueButtonText}>Continuar a la App</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.success,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  infoText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 18,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: theme.colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
