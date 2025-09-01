/**
 * Utilidades para formatear números de teléfono para WhatsApp
 */

export const formatPhoneForWhatsApp = (phone) => {
  if (!phone) return null;
  
  // Limpiar el número
  let cleanPhone = phone.replace(/\s+/g, '').replace(/[()-]/g, '');
  
  // Si ya tiene código de país, validar formato
  if (cleanPhone.startsWith('+')) {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(cleanPhone) ? cleanPhone : null;
  }
  
  // Detectar país basándose en el formato del número
  const countryCode = detectCountryCode(cleanPhone);
  if (countryCode) {
    return '+' + countryCode + cleanPhone;
  }
  
  return null;
};

// Función para detectar el código de país basándose en el formato
const detectCountryCode = (phone) => {
  // Argentina (+54)
  if (phone.startsWith('54')) {
    return '54';
  }
  
  // Número argentino típico (10 dígitos)
  if (phone.length === 10) {
    return '54';
  }
  
  // Número argentino con código de área (11 dígitos)
  if (phone.length === 11 && (phone.startsWith('11') || phone.startsWith('15'))) {
    return '54';
  }
  
  // Si no se puede detectar, intentar con Argentina por defecto
  if (phone.length >= 10) {
    return '54';
  }
  
  return null;
};

export const createWhatsAppUrl = (phone, message) => {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  if (!formattedPhone) return null;
  
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

// Función para probar diferentes formatos
export const testPhoneFormats = () => {
  const testNumbers = [
    '1123456789',         // Número local Argentina (Buenos Aires)
    '1534567890',         // Número local Argentina (móvil)
    '541123456789',       // Con código sin +
    '+541123456789',      // Formato correcto
    '(11) 2345-6789',     // Con paréntesis y guiones
    '11 2345 6789',       // Con espacios
    '1123456789',         // 10 dígitos
    '1534567890',         // 10 dígitos móvil
  ];
  
  console.log('=== PRUEBAS DE FORMATO DE TELÉFONO (ARGENTINA) ===');
  testNumbers.forEach(phone => {
    const formatted = formatPhoneForWhatsApp(phone);
    console.log(`${phone} -> ${formatted}`);
  });
};
