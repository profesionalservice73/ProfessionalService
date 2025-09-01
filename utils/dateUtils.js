/**
 * Utilidades para manejo de fechas
 */

// Función para validar y parsear fechas en diferentes formatos
export const parseDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
    return null;
  }

  const input = dateString.trim();
  console.log('Parsing date:', input);

  // Formato: "15 de enero, 2024" o "15 enero 2024"
  const spanishDateMatch = input.match(/(\d{1,2})\s+(?:de\s+)?(\w+)\s*,?\s*(\d{4})/i);
  if (spanishDateMatch) {
    const day = parseInt(spanishDateMatch[1]);
    const month = spanishDateMatch[2].toLowerCase();
    const year = parseInt(spanishDateMatch[3]);
    
    const monthMap = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
      'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };
    
    if (monthMap[month] !== undefined) {
      const date = new Date(year, monthMap[month], day);
      if (!isNaN(date.getTime())) {
        console.log('Spanish date parsed successfully:', date);
        return date;
      }
    }
  }

  // Formato: "2024-12-25" (ISO)
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const date = new Date(input);
    if (!isNaN(date.getTime())) {
      console.log('ISO date parsed successfully:', date);
      return date;
    }
  }

  // Formato: "25/12/2024" (DD/MM/YYYY)
  const slashDateMatch = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashDateMatch) {
    const day = parseInt(slashDateMatch[1]);
    const month = parseInt(slashDateMatch[2]) - 1; // Meses van de 0-11
    const year = parseInt(slashDateMatch[3]);
    
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      console.log('Slash date parsed successfully:', date);
      return date;
    }
  }

  // Formato: "25-12-2024" (DD-MM-YYYY)
  const dashDateMatch = input.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashDateMatch) {
    const day = parseInt(dashDateMatch[1]);
    const month = parseInt(dashDateMatch[2]) - 1; // Meses van de 0-11
    const year = parseInt(dashDateMatch[3]);
    
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      console.log('Dash date parsed successfully:', date);
      return date;
    }
  }

  // Intentar con el constructor Date nativo como último recurso
  const date = new Date(input);
  if (!isNaN(date.getTime())) {
    console.log('Native Date parsed successfully:', date);
    return date;
  }

  console.log('Could not parse date:', input);
  return null;
};

// Función para formatear fecha para mostrar
export const formatDateForDisplay = (date) => {
  if (!date) return '';
  
  if (typeof date === 'string') {
    const parsedDate = parseDate(date);
    if (!parsedDate) return date;
    date = parsedDate;
  }
  
  if (date instanceof Date) {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  }
  
  return '';
};

// Función para validar si una fecha es futura
export const isFutureDate = (date) => {
  if (!date) return false;
  
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  if (!parsedDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return parsedDate > today;
};

// Función para obtener sugerencias de fechas
export const getDateSuggestions = () => {
  const today = new Date();
  const suggestions = [];
  
  // Próximos 7 días
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    suggestions.push(formatDateForDisplay(date));
  }
  
  return suggestions;
};
