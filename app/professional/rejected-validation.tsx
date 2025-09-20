import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { useAuth } from '../../contexts/AuthContext';

interface RejectedValidationScreenProps {
  rejectionReason?: string;
  validationNotes?: string;
}

export default function RejectedValidationScreen({ 
  rejectionReason, 
  validationNotes 
}: RejectedValidationScreenProps) {
  const { logout } = useAuth();

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

  const handleContactSupport = () => {
    Alert.alert(
      'Contactar Soporte',
      'Para resolver tu situación, contáctanos por correo electrónico:\n\nprofesionalservice73@gmail.com',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="close-circle-outline" size={80} color={theme.colors.error} />
        </View>
        
        <Text style={styles.title}>Perfil Rechazado</Text>
        
        <Text style={styles.subtitle}>
          Lamentamos informarte que tu perfil no ha sido aprobado
        </Text>
        
        {rejectionReason && (
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonTitle}>Motivo del rechazo:</Text>
            <Text style={styles.reasonText}>{rejectionReason}</Text>
          </View>
        )}
        
        {validationNotes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>Notas adicionales:</Text>
            <Text style={styles.notesText}>{validationNotes}</Text>
          </View>
        )}
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="refresh-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.infoText}>Puedes volver a registrarte</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.infoText}>Contacta soporte para ayuda</Text>
          </View>
        </View>
        
        <Text style={styles.description}>
          Si crees que esto es un error o necesitas ayuda para completar tu registro, 
          no dudes en contactarnos.
        </Text>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
          <Ionicons name="mail-outline" size={20} color={theme.colors.white} />
          <Text style={styles.supportButtonText}>Contactar Soporte</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
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
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  reasonContainer: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  notesContainer: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 24,
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
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  supportButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  supportButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
