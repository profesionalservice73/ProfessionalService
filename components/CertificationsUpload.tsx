import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { theme } from '../config/theme';

interface Certification {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  uri: string;
  size?: number;
  uploadDate: Date;
}

interface CertificationsUploadProps {
  certifications: Certification[];
  onCertificationsChange: (certifications: Certification[]) => void;
  maxCertifications?: number;
  maxFileSize?: number; // en MB
}

export const CertificationsUpload: React.FC<CertificationsUploadProps> = ({
  certifications,
  onCertificationsChange,
  maxCertifications = 10,
  maxFileSize = 10, // 10MB por defecto
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const requestPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus.status !== 'granted' || mediaStatus.status !== 'granted') {
      Alert.alert(
        'Permisos Requeridos',
        'Necesitamos acceso a tu cámara y galería para subir certificaciones.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const validateFileSize = (size: number): boolean => {
    const maxSizeBytes = maxFileSize * 1024 * 1024; // Convertir MB a bytes
    if (size > maxSizeBytes) {
      Alert.alert(
        'Archivo Demasiado Grande',
        `El archivo excede el tamaño máximo permitido de ${maxFileSize}MB.`,
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const addCertification = (certification: Omit<Certification, 'id' | 'uploadDate'>) => {
    if (certifications.length >= maxCertifications) {
      Alert.alert(
        'Límite Alcanzado',
        `Puedes subir máximo ${maxCertifications} certificaciones.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const newCertification: Certification = {
      ...certification,
      id: Date.now().toString(),
      uploadDate: new Date(),
    };

    onCertificationsChange([...certifications, newCertification]);
  };

  const removeCertification = (id: string) => {
    Alert.alert(
      'Eliminar Certificación',
      '¿Estás seguro de que quieres eliminar esta certificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            onCertificationsChange(certifications.filter(c => c.id !== id));
          },
        },
      ]
    );
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        if (asset.fileSize && !validateFileSize(asset.fileSize)) {
          return;
        }

        addCertification({
          name: `Certificación_${Date.now()}.jpg`,
          type: 'image',
          uri: asset.uri,
          size: asset.fileSize,
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const selectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        if (asset.fileSize && !validateFileSize(asset.fileSize)) {
          return;
        }

        addCertification({
          name: `Certificación_${Date.now()}.jpg`,
          type: 'image',
          uri: asset.uri,
          size: asset.fileSize,
        });
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const selectPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        if (asset.size && !validateFileSize(asset.size)) {
          return;
        }

        addCertification({
          name: asset.name || `Certificación_${Date.now()}.pdf`,
          type: 'pdf',
          uri: asset.uri,
          size: asset.size,
        });
      }
    } catch (error) {
      console.error('Error selecting PDF:', error);
      Alert.alert('Error', 'No se pudo seleccionar el PDF');
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    }
    
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderCertificationItem = (certification: Certification) => (
    <View key={certification.id} style={styles.certificationItem}>
      <View style={styles.certificationInfo}>
        <View style={styles.certificationHeader}>
          <Ionicons 
            name={certification.type === 'pdf' ? 'document-text' : 'image'} 
            size={24} 
            color={theme.colors.primary} 
          />
          <View style={styles.certificationDetails}>
            <Text style={styles.certificationName} numberOfLines={1}>
              {certification.name}
            </Text>
            <Text style={styles.certificationMeta}>
              {certification.type.toUpperCase()} • {formatFileSize(certification.size)} • {formatDate(certification.uploadDate)}
            </Text>
          </View>
        </View>
        
        {certification.type === 'image' && (
          <Image source={{ uri: certification.uri }} style={styles.certificationThumbnail} />
        )}
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeCertification(certification.id)}
      >
        <Ionicons name="trash" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderUploadModal = () => (
    <Modal
      visible={showUploadModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowUploadModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Subir Certificación</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowUploadModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.uploadOptions}>
            <TouchableOpacity
              style={styles.uploadOption}
              onPress={() => {
                takePhoto();
                setShowUploadModal(false);
              }}
            >
              <Ionicons name="camera" size={32} color={theme.colors.primary} />
              <Text style={styles.uploadOptionText}>Tomar Foto</Text>
              <Text style={styles.uploadOptionSubtext}>Capturar con cámara</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadOption}
              onPress={() => {
                selectFromGallery();
                setShowUploadModal(false);
              }}
            >
              <Ionicons name="images" size={32} color={theme.colors.primary} />
              <Text style={styles.uploadOptionText}>Galería</Text>
              <Text style={styles.uploadOptionSubtext}>Seleccionar imagen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadOption}
              onPress={() => {
                selectPDF();
                setShowUploadModal(false);
              }}
            >
              <Ionicons name="document-text" size={32} color={theme.colors.primary} />
              <Text style={styles.uploadOptionText}>PDF</Text>
              <Text style={styles.uploadOptionSubtext}>Seleccionar archivo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.uploadInfo}>
            <Text style={styles.uploadInfoTitle}>Información Importante:</Text>
            <Text style={styles.uploadInfoText}>
              • Tamaño máximo: {maxFileSize}MB por archivo{'\n'}
              • Formatos soportados: JPG, PNG, PDF{'\n'}
              • Asegúrate de que el documento sea legible{'\n'}
              • Puedes subir hasta {maxCertifications} certificaciones
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>Certificaciones</Text>
          <Text style={styles.sectionDescription}>
            Sube tus certificaciones, diplomas y documentos que acrediten tu experiencia profesional.
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.addButton,
            certifications.length >= maxCertifications && styles.addButtonDisabled
          ]}
          onPress={() => setShowUploadModal(true)}
          disabled={certifications.length >= maxCertifications}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.certificationsContainer}>
        <Text style={styles.certificationsCount}>
          {certifications.length} de {maxCertifications} certificaciones
        </Text>
        
        {certifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyStateText}>No hay certificaciones subidas</Text>
            <Text style={styles.emptyStateSubtext}>
              Toca "Agregar" para subir tu primera certificación
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.certificationsList} showsVerticalScrollIndicator={false}>
            {certifications.map(renderCertificationItem)}
          </ScrollView>
        )}
      </View>

      {renderUploadModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    maxWidth: '70%',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  addButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  certificationsContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  certificationsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  certificationsList: {
    maxHeight: 300,
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  certificationInfo: {
    flex: 1,
  },
  certificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  certificationDetails: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  certificationName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  certificationMeta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  certificationThumbnail: {
    width: 60,
    height: 45,
    borderRadius: theme.borderRadius.sm,
    marginLeft: 40,
  },
  removeButton: {
    padding: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    margin: theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  uploadOptions: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
  },
  uploadOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  uploadOptionSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 'auto',
  },
  uploadInfo: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  uploadInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  uploadInfoText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});

