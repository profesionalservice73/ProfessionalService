import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import { LocationMap } from './LocationMap';
import { formatDateForDisplay } from '../utils/dateUtils';

interface RequestCardProps {
  request: any;
  onAccept: (requestId: string) => void;
  onComplete?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
  onPress: (requestId: string) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onAccept,
  onComplete,
  onCancel,
  onPress,
}) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return 'Media'; // Default a 'Media' en lugar de 'Normal'
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'active_for_acceptance':
        return theme.colors.info;
      case 'accepted':
        return theme.colors.primary;
      case 'in_progress':
        return theme.colors.primary;
      case 'completed':
        return theme.colors.success;
      case 'completed_by_other':
        return theme.colors.warning;
      case 'awaiting_rating':
        return theme.colors.primary;
      case 'closed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'active_for_acceptance':
        return 'Activa para Aceptar';
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completada';
      case 'completed_by_other':
        return 'Completada por otro profesional';
      case 'awaiting_rating':
        return 'Esperando Calificación';
      case 'closed':
        return 'Cerrada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  };

  const handleAccept = () => {
    Alert.alert(
      'Aceptar Solicitud',
      '¿Estás seguro de que quieres aceptar esta solicitud?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Aceptar',
          onPress: () => onAccept(request._id || request.id),
        },
      ]
    );
  };

  const handleComplete = () => {
    if (!onComplete) return;
    Alert.alert(
      'Completar Solicitud',
      '¿Confirmas que esta solicitud fue completada?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Completar',
          onPress: () => onComplete(request._id || request.id),
        },
      ]
    );
  };

  const isPending = (request.status === 'pending' || request.status === 'in_progress' || request.status === 'active_for_acceptance') && !request.isAccepted;
  const isAccepted = request.isAccepted && request.acceptanceStatus === 'accepted';
  const isCompleted = request.status === 'completed' || request.status === 'cancelled' || request.status === 'closed';
  const isCompletedByMe = request.isCompletedByMe || request.status === 'completed';
  const isCompletedByOther = request.isCompletedByOther || request.status === 'completed_by_other';

  const handleCancel = () => {
    if (!onCancel) return;
    Alert.alert(
      'Cancelar Solicitud',
      '¿Estás seguro de cancelar esta solicitud?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: () => onCancel(request._id || request.id) },
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(request._id || request.id)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{request.title}</Text>
          <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(request.urgency) }]}>
            <Text style={styles.urgencyText}>{getUrgencyText(request.urgency)}</Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.category}>{request.category}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
            <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
          </View>
        </View>
      </View>

      {/* Descripción */}
      <Text style={styles.description} numberOfLines={3}>
        {request.description}
      </Text>

      {/* Detalles */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            {formatDateForDisplay(request.createdAt)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            {typeof request.location === 'object' && request.location?.address 
              ? request.location.address 
              : request.location || 'Ubicación no disponible'}
          </Text>
        </View>
      </View>

      {/* Mapa de ubicación */}
      <LocationMap location={request.location} size="small" />

      {/* Acciones */}
      {isPending && (
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />
          <Text style={styles.acceptButtonText}>Aceptar Solicitud</Text>
        </TouchableOpacity>
      )}

      {isAccepted && !isCompleted && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <Ionicons name="checkmark-done" size={20} color={theme.colors.white} />
            <Text style={styles.acceptButtonText}>Completar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Ionicons name="close-circle" size={20} color={theme.colors.white} />
            <Text style={styles.acceptButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {isCompletedByMe && (
        <View style={styles.statusContainer}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          <Text style={styles.statusTextLarge}>Completada por ti</Text>
        </View>
      )}

      {isCompletedByOther && (
        <View style={styles.statusContainer}>
          <Ionicons name="information-circle" size={20} color={theme.colors.warning} />
          <Text style={styles.statusTextLarge}>Completada por otro profesional</Text>
        </View>
      )}

      {request.otherProfessionalsCount > 0 && !isCompletedByOther && (
        <View style={styles.otherProfessionalsContainer}>
          <Ionicons name="people" size={16} color={theme.colors.primary} />
          <Text style={styles.otherProfessionalsText}>
            {request.otherProfessionalsCount} otro{request.otherProfessionalsCount > 1 ? 's' : ''} profesional{request.otherProfessionalsCount > 1 ? 'es' : ''} aceptó{request.otherProfessionalsCount > 1 ? 'ron' : ''}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  urgencyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.white,
  },
  category: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.white,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  details: {
    marginBottom: theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  acceptButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  completeButton: {
    backgroundColor: theme.colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flex: 1,
  },
  acceptButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusTextLarge: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
  },
  otherProfessionalsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  otherProfessionalsText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
    color: theme.colors.primary,
  },
});
