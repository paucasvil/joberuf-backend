//Importaciones del index, para iniciar la aplicación
import { Redirect } from 'expo-router';
import React from 'react';

//Inicializar con la pantalla Login
export default function Index() {
  return <Redirect href="/Login" />;
}