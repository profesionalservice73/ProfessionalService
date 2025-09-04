import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

// Servicio para validar tipos de imágenes
export class ImageValidationService {
  
  // Validar que la imagen sea un DNI/documento escaneado
  static async validateDNIImage(imageUri) {
    try {
      console.log('🔍 Validando imagen de DNI:', imageUri);
      
      // Obtener información de la imagen
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      console.log('📁 Información del archivo:', imageInfo);
      
      if (!imageInfo.exists) {
        throw new Error('La imagen no existe');
      }

      // Verificar que sea una imagen
      if (!imageInfo.uri.toLowerCase().match(/\.(jpg|jpeg|png|heic)$/)) {
        throw new Error('Formato de imagen no válido');
      }

      // Obtener metadatos de la imagen
      const metadata = await this.getImageMetadata(imageUri);
      console.log('📊 Metadatos de la imagen:', metadata);
      
      // Validaciones específicas para DNI
      const validationResult = await this.validateDNIFormat(metadata);
      console.log('✅ Validación de DNI completada:', validationResult);
      
      return validationResult;
      
    } catch (error) {
      console.error('❌ Error validando imagen de DNI:', error);
      return {
        isValid: false,
        error: error.message,
        suggestions: [
          'Asegúrate de que la imagen sea un escaneo del DNI',
          'La imagen debe ser clara y legible',
          'Evita fotos borrosas o con reflejos'
        ]
      };
    }
  }

  // Validar que la imagen sea una selfie/retrato
  static async validateProfileImage(imageUri) {
    try {
      console.log('🔍 Validando foto de perfil:', imageUri);
      
      // Obtener información de la imagen
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      if (!imageInfo.exists) {
        throw new Error('La imagen no existe');
      }

      // Verificar que sea una imagen
      if (!imageInfo.uri.toLowerCase().match(/\.(jpg|jpeg|png|heic)$/)) {
        throw new Error('Formato de imagen no válido');
      }

      // Obtener metadatos de la imagen
      const metadata = await this.getImageMetadata(imageUri);
      
      // Validaciones específicas para selfie
      const validationResult = await this.validateSelfieFormat(metadata);
      
      console.log('✅ Validación de selfie completada:', validationResult);
      return validationResult;
      
    } catch (error) {
      console.error('❌ Error validando foto de perfil:', error);
      return {
        isValid: false,
        error: error.message,
        suggestions: [
          'Asegúrate de que sea una foto de tu rostro',
          'La imagen debe ser clara y bien iluminada',
          'Evita fotos grupales o de objetos'
        ]
      };
    }
  }

  // Obtener metadatos básicos de la imagen
  static async getImageMetadata(imageUri) {
    try {
      // Obtener información del archivo
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      
      return {
        uri: imageUri,
        size: fileInfo.size,
        exists: fileInfo.exists,
        filename: imageUri.split('/').pop()
      };
    } catch (error) {
      console.error('Error obteniendo metadatos:', error);
      throw error;
    }
  }

  // Validar formato de DNI
  static async validateDNIFormat(metadata) {
    const validations = [];
    
    console.log('🔍 Validando formato de DNI con metadatos:', metadata);
    console.log('📏 Tamaño del archivo:', metadata.size, 'bytes');
    
    // Validar que el archivo no sea muy pesado (máximo 10MB)
    if (metadata.size > 10 * 1024 * 1024) {
      console.log('❌ Archivo muy pesado:', metadata.size, 'bytes');
      validations.push({
        type: 'error',
        message: 'La imagen es demasiado pesada. Comprime la imagen o usa una resolución menor.'
      });
    }

    // Validar que el archivo no sea muy pequeño (mínimo 200KB para DNI legible)
    if (metadata.size < 200 * 1024) {
      console.log('❌ Archivo muy pequeño:', metadata.size, 'bytes (mínimo requerido: 200KB)');
      validations.push({
        type: 'error',
        message: 'La imagen del DNI es muy pequeña. Se requiere un escaneo de alta resolución (mínimo 200KB).'
      });
    }

    // Validar que el archivo tenga un tamaño razonable (entre 200KB y 5MB es ideal)
    if (metadata.size > 5 * 1024 * 1024) {
      console.log('⚠️ Archivo pesado:', metadata.size, 'bytes');
      validations.push({
        type: 'warning',
        message: 'La imagen es muy pesada. Se recomienda comprimir para mejor rendimiento.'
      });
    }

    // Si hay errores críticos, la imagen no es válida
    const hasErrors = validations.some(v => v.type === 'error');
    
    console.log('📋 Validaciones aplicadas:', validations);
    console.log('✅ Resultado final - Válida:', !hasErrors);
    
    return {
      isValid: !hasErrors,
      validations,
      suggestions: [
        'Escanea el DNI completo en alta resolución',
        'Asegúrate de que todo el texto sea legible',
        'Evita sombras, reflejos o cortes en la imagen',
        'Usa una resolución mínima de 800x600 píxeles',
        'El archivo debe tener al menos 200KB de tamaño'
      ]
    };
  }

  // Validar formato de selfie
  static async validateSelfieFormat(metadata) {
    const validations = [];
    
    // Validar que el archivo no sea muy pesado (máximo 5MB)
    if (metadata.size > 5 * 1024 * 1024) {
      validations.push({
        type: 'error',
        message: 'La imagen es demasiado pesada. Comprime la imagen o usa una resolución menor.'
      });
    }

    // Validar que el archivo no sea muy pequeño (mínimo 50KB para selfie clara)
    if (metadata.size < 50 * 1024) {
      validations.push({
        type: 'warning',
        message: 'La foto de perfil es muy pequeña. Se recomienda una resolución mínima de 400x400 píxeles.'
      });
    }

    // Si hay errores críticos, la imagen no es válida
    const hasErrors = validations.some(v => v.type === 'error');
    
    return {
      isValid: !hasErrors,
      validations,
      suggestions: [
        'Toma una foto clara de tu rostro',
        'Asegúrate de tener buena iluminación',
        'Evita fotos grupales o de objetos',
        'Usa una resolución mínima de 400x400 píxeles'
      ]
    };
  }

  // Función helper para mostrar alertas de validación
  static showValidationAlert(validationResult, imageType) {
    const title = imageType === 'dni' ? 'Validación de DNI' : 'Validación de Foto de Perfil';
    
    if (validationResult.isValid) {
      // Solo mostrar warnings si los hay
      const warnings = validationResult.validations.filter(v => v.type === 'warning');
      if (warnings.length > 0) {
        const warningMessages = warnings.map(w => `• ${w.message}`).join('\n');
        Alert.alert(
          title,
          `✅ La imagen es válida y se ha guardado correctamente.\n\n⚠️ Consideraciones:\n${warningMessages}`,
          [{ text: 'Perfecto' }]
        );
      } else {
        // Imagen perfecta
        Alert.alert(
          title,
          `🎉 ¡Excelente! La imagen cumple perfectamente con todos los requisitos y se ha guardado.`,
          [{ text: 'Genial' }]
        );
      }
      return true;
    } else {
      // Mostrar errores y sugerencias
      const errorMessages = validationResult.validations
        .filter(v => v.type === 'error')
        .map(e => `• ${e.message}`)
        .join('\n');
      
      const suggestions = validationResult.suggestions.map(s => `• ${s}`).join('\n');
      
      Alert.alert(
        title,
        `❌ La imagen no cumple con los requisitos:\n\n${errorMessages}\n\n💡 Sugerencias para mejorar:\n${suggestions}`,
        [{ text: 'Entendido' }]
      );
      return false;
    }
  }
}
