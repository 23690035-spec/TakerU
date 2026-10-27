import { useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import { buscarActualizacion } from '../services/updateService';

export default function UpdateChecker() {
  useEffect(() => {
    let activo = true;
    buscarActualizacion()
      .then((nueva) => {
        if (!activo || !nueva) return;
        Alert.alert(
          'Actualización disponible',
          `Hay una nueva versión de TecSolv (${nueva.nombre}). ¿Quieres descargarla ahora?`,
          [
            { text: 'Más tarde', style: 'cancel' },
            {
              text: 'Descargar',
              onPress: () => {
                Linking.openURL(nueva.url).catch(() => {});
              },
            },
          ]
        );
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  return null;
}
