import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    backgroundElements: '#1DB954',
    alerts: '#E53935',
    text: '#333333',
    secondaryText: '#FFF',
    secondary: '#FFD700',
  },
  roundness: 8, // bordes redondeados
};