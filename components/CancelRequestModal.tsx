import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import { clientAPI } from '../services/api';

interface CancelRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requestId: string;
  clientId: string;
  serviceTitle: string;
}

export const CancelRequestModal: React.FC<CancelRequestModalProps> = ({
  visible,
  onClose,
  onSuccess,
  requestId,
  clientId,
  serviceTitle,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (reason.trim().length < 5) {
      Alert.alert('Error', 'Por favor proporciona una razón para cancelar (mínimo 5 caracteres)');
      return;
    }

    Alert.alert(
      'Confirmar Cancelación',
      '¿Estás seguro de que quieres cancelar esta solicitud? Esta acción no se puede deshacer.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await clientAPI.cancelRequest(requestId, clientId, reason.trim());
              
              if (response.success) {
                Alert.alert(
                  'Solicitud Cancelada',
                  'La solicitud ha sido cancelada exitosamente.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        onSuccess();
                        onClose();
                        resetForm();
                      }
                    }
                  ]
                );
              } else {
                Alert.alert('Error', response.error || 'Error al cancelar la solicitud');
              }
            } catch (error) {
              console.error('Error canceling request:', error);
              Alert.alert('Error', 'Error al cancelar la solicitud');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setReason('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const predefinedReasons = [
    'Ya no necesito el servicio',
    'Encontré otro profesional',
    'Cambié de opinión',
    'Problema de horario',
    'Problema de presupuesto',
    'Otro motivo'
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Cancelar Solicitud</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={24} color={theme.colors.warning} />
              <Text style={styles.warningText}>
                Estás a punto de cancelar la siguiente solicitud:
              </Text>
            </View>

            <Text style={styles.serviceTitle}>{serviceTitle}</Text>

            <View style={styles.reasonSection}>
              <Text style={styles.reasonLabel}>Motivo de cancelación</Text>
              
              <View style={styles.predefinedReasons}>
                {predefinedReasons.map((predefinedReason, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.reasonChip,
                      reason === predefinedReason && styles.selectedReasonChip
                    ]}
                    onPress={() => setReason(predefinedReason)}
                  >
                    <Text style={[
                      styles.reasonChipText,
                      reason === predefinedReason && styles.selectedReasonChipText
                    ]}>
                      {predefinedReason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.reasonInput}
                value={reason}
                onChangeText={setReason}
                placeholder="O escribe tu propio motivo..."
                multiline
                numberOfLines={3}
                maxLength={200}
              />
              <Text style={styles.characterCount}>{reason.length}/200</Text>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>No Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  reason.trim().length < 5 && styles.disabledButton
                ]}
                onPress={handleCancel}
                disabled={loading || reason.trim().length < 5}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.white} size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Cancelar Solicitud</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  content: {
    padding: theme.spacing.lg,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  warningText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  reasonSection: {
    marginBottom: theme.spacing.lg,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  predefinedReasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  reasonChip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  selectedReasonChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  reasonChipText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  selectedReasonChipText: {
    color: theme.colors.white,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  confirmButton: {
    backgroundColor: theme.colors.error,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.white,
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
  },
});
