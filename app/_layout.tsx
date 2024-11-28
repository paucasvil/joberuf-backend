// Importaciones necesarias
import { Stack, useSegments } from 'expo-router'; 
import HeaderComponent from '../components/Header';
import FooterComponent from '../components/Footer';

// Función Layout que maneja la estructura general de la app y su visibilidad (Header y Footer)
export default function Layout() {
  // Declaración de constantes
  const segments = useSegments(); // Obtiene las rutas actuales de la aplicación.

  // Determina si se debe mostrar el Header dependiendo de las rutas activas.
  const showHeader = segments.some(segment => ['menu', 'profile', 'curriculum','chat', 'edit', 'changepassword'].includes(segment.toLowerCase()));

  // Determina si se debe mostrar el Footer dependiendo de las rutas activas.
  const showFooter = segments.some(segment => ['menu', 'profile', 'curriculum', 'edit', 'changepassword'].includes(segment.toLowerCase()));

  return (
    <>
      {showHeader && <HeaderComponent />}
      <Stack screenOptions={{ headerShown: false }} />
      {showFooter && <FooterComponent />}
    </>
  );
}
