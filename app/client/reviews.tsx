import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Header } from '../../components/Header';
import { ReviewsSection } from '../../components/ReviewsSection';
import { theme } from '../../config/theme';

export default function ReviewsScreen({ route, navigation }: any) {
  const { professionalId, professionalName, professionalImage } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Valoraciones" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <ReviewsSection
        professionalId={professionalId}
        professionalName={professionalName}
        professionalImage={professionalImage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
