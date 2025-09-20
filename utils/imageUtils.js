import * as FileSystem from 'expo-file-system';

/**
 * Convierte una imagen local a base64
 * @param {string} imageUri - URI de la imagen local
 * @returns {Promise<string|null>} - Base64 string o null si hay error
 */
export const convertImageToBase64 = async (imageUri) => {
  try {
    if (!imageUri) {
      console.log('⚠️ No hay URI de imagen para convertir');
      return null;
    }

    console.log('🔄 Convirtiendo imagen a base64:', imageUri.substring(0, 50) + '...');
    
    // Leer el archivo como base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Crear el data URL completo
    const base64DataUrl = `data:image/jpeg;base64,${base64}`;
    
    console.log('✅ Imagen convertida a base64 exitosamente');
    console.log('📏 Tamaño del base64:', base64DataUrl.length, 'caracteres');
    
    return base64DataUrl;
  } catch (error) {
    console.error('❌ Error convirtiendo imagen a base64:', error);
    return null;
  }
};

/**
 * Convierte múltiples imágenes a base64
 * @param {Object} images - Objeto con las imágenes a convertir
 * @returns {Promise<Object>} - Objeto con las imágenes convertidas
 */
export const convertImagesToBase64 = async (images) => {
  const convertedImages = {
    profileImage: null,
    selfieImage: null,
    dniFrontImage: null,
    dniBackImage: null,
  };
  
  for (const [key, imageUri] of Object.entries(images)) {
    if (imageUri) {
      console.log(`🔄 Convirtiendo ${key} a base64...`);
      convertedImages[key] = await convertImageToBase64(imageUri);
    } else {
      convertedImages[key] = null;
    }
  }
  
  return convertedImages;
};

/**
 * Verifica si una string es una URL de datos base64
 * @param {string} str - String a verificar
 * @returns {boolean} - True si es base64 data URL
 */
export const isBase64DataUrl = (str) => {
  return typeof str === 'string' && str.startsWith('data:image/');
};

/**
 * Verifica si una string es una URI local
 * @param {string} str - String a verificar
 * @returns {boolean} - True si es URI local
 */
export const isLocalUri = (str) => {
  return typeof str === 'string' && (str.startsWith('file://') || str.startsWith('content://'));
};
