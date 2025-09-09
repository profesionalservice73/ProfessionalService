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
  
  // Si no tiene + pero tiene código de país, agregar +
  if (cleanPhone.length >= 10) {
    return '+' + cleanPhone;
  }
  
  // Si es muy corto, asumir que es un número local y agregar +54 (Argentina)
  return '+54' + cleanPhone;
};


export const createWhatsAppUrl = (phone, message) => {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  if (!formattedPhone) return null;
  
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

