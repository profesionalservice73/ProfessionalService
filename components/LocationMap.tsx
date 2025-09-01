import React from 'react';
import { RealMap } from './RealMap';

interface LocationMapProps {
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  } | string;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export const LocationMap: React.FC<LocationMapProps> = ({
  location,
  size = 'medium'
}) => {
  // Usar el mapa real con react-native-maps
  return <RealMap location={location} size={size} />;
};
