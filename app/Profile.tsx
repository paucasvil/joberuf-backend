import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import * as Font from 'expo-font';
import Constants from 'expo-constants';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { IPADDRESS } from './config';
import suggestionsData from '../back/data/suggestions.json'; // Importar JSON

export default function UserProfileScreen() {
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [nombre, setNombre] = useState('Nombre');
  const [correo, setCorreo] = useState('Correo');
  const [telefono, setTelefono] = useState('Telefono');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const response = await axios.get(`http://${IPADDRESS}:3000/api/auth/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = response.data.user;

        // Asignar datos del perfil
        setNombre(user.nombre);
        setCorreo(user.correo);
        setTelefono(user.telefono);
        //setFotoPerfil(`http://${IPADDRESS}:3000/${user.fotoPerfil}`);        
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
      }
    };

    // Obtener 3 sugerencias aleatorias
    const randomSuggestions = () => {
      const shuffled = [...suggestionsData.suggestions].sort(() => 0.5 - Math.random());
      setSuggestions(shuffled.slice(0, 3));
    };

    fetchUserProfile();
    randomSuggestions();
  }, []);

  return (
    <View style = {styles.backgroundContainer}>
      <ScrollView contentContainerStyle = {styles.scrollContainer}>
        <StatusBar style = 'dark' />
        
        {/* Encabezado con imagen, nombre y correo */}
        <View style = {styles.header}>
          <Image source={{ uri: fotoPerfil || 'default_profile_image_url' }} style={styles.profileImage} />
          <Text style={styles.name}>{nombre}</Text>
          <Text style={styles.email}>{correo}</Text>
          <Text style={styles.phone}>{telefono}</Text>
        </View>
  
        {/* Botón de Editar perfil */}
        <Link href = '/Edit' asChild>
          <TouchableOpacity style = {styles.buttonEdit}>
            <Text style = {styles.buttonText}>Editar perfil</Text>
          </TouchableOpacity>
        </Link>

        {/* Botón de Cambiar contraseña */}
        <Link href = '/ChangePassword' asChild>
          <TouchableOpacity style = {styles.buttonEdit}>
            <Text style = {styles.buttonText}>Cambiar contraseña</Text>
          </TouchableOpacity>
        </Link>
  
        {/* Sección de sugerencias */}
        <Text style = {styles.suggestionsTitle}>Sugerencias para mejorar tu Curriculum</Text>
        
        {suggestions.map((suggestion, index) => (
          <View key={index} style={styles.suggestionBox}>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    // marginTop: Constants.statusBarHeight,
  },
  scrollContainer: {
    width: '100%',
    padding: 20,
    paddingBottom: 80,
  },
  logo: {
    width: 17,
    height: 17,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 100,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    color: '#030303',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#8b8b8b',
    marginBottom: 5,
  },
  phone: {
    fontSize: 14,
    color: '#8b8b8b',
  },
  buttonEdit: {
    width: '100%',
    backgroundColor: '#b10eff',
    padding: 12,
    borderRadius: 24,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsTitle: {
    fontSize: 18,
    color: '#030303',
    marginBottom: 10,
  },
  suggestionBox: {
    backgroundColor: '#67eeaa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  suggestionText: {
    color: '#030303',
    fontSize: 14,
  },
});