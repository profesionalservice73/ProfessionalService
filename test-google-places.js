// Archivo de prueba para verificar Google Places API
import googlePlacesService from './services/googlePlacesService';

export const testGooglePlaces = async () => {
  console.log('🧪 Iniciando pruebas de Google Places API...');

  try {
    // 1. Probar autocompletado
    console.log('1️⃣ Probando autocompletado...');
    const predictions = await googlePlacesService.getPlacePredictions('Av. Corrientes');
    console.log('✅ Predicciones obtenidas:', predictions);

    if (predictions.length > 0) {
      // 2. Probar detalles del primer lugar
      console.log('2️⃣ Probando detalles del lugar...');
      const details = await googlePlacesService.getPlaceDetails(predictions[0].placeId);
      console.log('✅ Detalles obtenidos:', details);

      // 3. Probar geocodificación
      console.log('3️⃣ Probando geocodificación...');
      const geocode = await googlePlacesService.geocodeAddress('Buenos Aires, Argentina');
      console.log('✅ Geocodificación exitosa:', geocode);
    }

    console.log('🎉 Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
};

// Función para probar desde la consola
export const quickTest = async () => {
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Av. Corrientes&key=AIzaSyCMC6Hjca0wTD8tm9fc9X30bthRaOmTUog&language=es&components=country:ar`);
    const data = await response.json();
    console.log('🔍 Respuesta directa de Google Places:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en prueba directa:', error);
  }
};

export default {
  testGooglePlaces,
  quickTest
};






