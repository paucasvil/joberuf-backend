//Importaciones necesarias para la pantalla Menu
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as Progress from 'react-native-progress';
import { Link } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import { IPADDRESS } from './config'; //Importar IP para pruebas

//Definir la pantalla PlanJoberufScreen
export default function PlanJoberufScreen() {
  //Declarar las imagenes utilziadas  
  const cv = require('../components/img/CV.png');
  const message = require('../components/img/Message.png');

  //Declarar las constantes necesarias para el funcionamiento de la pantalla
  const [userSector, setUserSector] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [lastScore, setLastScore] = useState<number>(0);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  //Definir la funcion para manejo de los datos del usuario
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Usuario no autenticado.');
        return;
      }
      //Mandar llamar la informacion del usuario
      const profileResponse = await axios.get(`http://${IPADDRESS}:3000/api/auth/getProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { id, sector, nombre, photo } = profileResponse.data.user;
      setUserSector(sector);
      setUserId(id);
      setUserName(nombre);
      //setFotoPerfil(photo);
      setFotoPerfil(require('../assets/images/images5/J.png')); // Imagen por defecto
      //Traer las puntuaciones del usuario para las barras de progreso
      const scoresResponse = await axios.get(`http://${IPADDRESS}:3000/api/auth/getScores`, {
        params: { userId: id },
        headers: { Authorization: `Bearer ${token}` },
      });

      //Guarda las puntuaciones del usuario para su uso posterior
      const { lastScore, averageScore } = scoresResponse.data;
      setLastScore(lastScore);
      setAverageScore(averageScore);


    } catch (error: any) {
      //Manejo de errores
      if ( error.response ) {
        Alert.alert( 'Error', `Error del servidor: ${error.response.data.message}` );
      } else if ( error.request ) {
        Alert.alert( 'Error', 'No se recibió respuesta del servidor.' );
      } else {        
        Alert.alert( 'Error', `Error al configurar la solicitud: ${error.message}` );
      }
    } finally {
      setLoading( false ); 
    }
  };

  //Uso de focus de la pantalla, para que se actualice cada vez que se fije la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchUserData();

      return () => {
        
      };
    }, [])
  );

  //Animacion de carga de la pantalla
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#39e991" />
      </View>
    );
  }

  return (
    <View style={styles.backgroundContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Encabezado */}
        <Image source={fotoPerfil} style={styles.profileImage} />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Bienvenido,</Text>
          <Text style={styles.subtitle}>Maximiza tu potencial</Text>
        </View>

        {/* Programa de mejora */}
        <View style={styles.programContainer}>
          <Text style={styles.programTitle}>Simulación de entrevistas</Text>

          {/* Última puntuación */}
          <View style={styles.skillContainer}>
            <Text style={styles.skillText}>Última puntuación:</Text>
            <Text style={styles.progressText}>{lastScore}/10</Text>
            <Progress.Bar
              style={styles.progressBarContainer}
              width={null}
              height={8}
              color="#9300da"
              borderRadius={6}
              progress={lastScore / 10}
              borderWidth={0}
              unfilledColor="#f2f2f2"
            />
          </View>

          {/* Promedio últimas 3 simulaciones */}
          <View style={styles.skillContainer}>
            <Text style={styles.skillText}>Promedio últimas 3 entrevistas:</Text>
            <Text style={styles.progressText}>{averageScore.toFixed(2)}/10</Text>
            <Progress.Bar
              style={styles.progressBarContainer}
              width={null}
              height={8}
              color="#c141ff"
              borderRadius={6}
              progress={averageScore / 10}
              borderWidth={0}
              unfilledColor="#f2f2f2"
            />
          </View>
        </View>

        {/* Botones */}
        <Link href="/Curriculum" asChild>
          <TouchableOpacity style={styles.buttonCV}>
            <Image source={cv} style={styles.icon} />
            <Text style={styles.buttonText}>Optimizar curriculum</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/Chat" asChild>
          <TouchableOpacity style={styles.buttonInterview}>
            <Image source={message} style={styles.icon} />
            <Text style={styles.buttonText}>Chatbot de entrevista</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </View>
  );
}
//Diseño de la pantalla
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    width: '100%',
    padding: 20,
    paddingBottom: 80,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 100,
  },
  titleContainer: {
    backgroundColor: '#ffffff',
    marginLeft: 80,
    marginTop: -50,
    marginBottom: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#030303',
  },
  subtitle: {
    fontSize: 16,
    color: '#030303',
  },
  programContainer: {
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 24,
    marginBottom: 50,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  programTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  skillText: {
    fontSize: 14,
    color: '#030303',
  },
  progressText: {
    fontSize: 13,
    color: '#030303',
    marginBottom: 5,
  },
  skillContainer: {
    width: '100%',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 10,
  },
  buttonCV: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#39e991',
    padding: 15,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonInterview: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#39e991',
    padding: 15,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
});
