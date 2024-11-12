import { Stack, useSegments } from 'expo-router';
import HeaderComponent from '../components/Header';
import FooterComponent from '../components/Footer';

export default function Layout() {
  const segments = useSegments();

  const showHeader = segments.some(segment => ['menu', 'profile', 'curriculum','chat', 'edit', 'changepassword'].includes(segment.toLowerCase()));
  const showFooter = segments.some(segment => ['menu', 'profile', 'curriculum',        'edit', 'changepassword'].includes(segment.toLowerCase()));

  return (
    <>
      {showHeader && <HeaderComponent />}
      <Stack screenOptions = {{headerShown: false}} />
      {showFooter && <FooterComponent />}
    </>
  );
}