//Importaciones necesarias para la pantalla Login
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { IPADDRESS } from './config'; //Importar la IP para las pruebas

//Definir la pantalla LoginScreen
export default function LoginScreen() {
  //Declarar constantes y estados 
  const logoBW = require('../components/img/LogoBW.png');

  const [correo, setCorreo] = useState('');
  const [contra, setContra] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  // Cargar correo y contraseña si "Recordarme" está activado
  useEffect(() => {
    const loadRememberedCredentials = async () => {
      const storedRememberMe = await AsyncStorage.getItem('rememberMe');
      if (storedRememberMe === 'true') {
        setRememberMe(true);
        const storedEmail = await AsyncStorage.getItem('userEmail');
        const storedPassword = await AsyncStorage.getItem('userPassword');
        if (storedEmail) setCorreo(storedEmail);
        if (storedPassword) setContra(storedPassword);
      }
    };
    loadRememberedCredentials();
  }, []);
  //Función para controlar el Login
  const handleLogin = async () => {    
    if (!correo || !contra) {
      Alert.alert('Error', 'Por favor, ingresa el correo y la contraseña.');
      return;
    }
    
    try {
      //Manda llamar la ruta para Login con una peticion post
      const response = await fetch(`http://${IPADDRESS}:3000/api/auth/login`, {        
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, contra }),
      });
      //Confirmar que el usuario es correcto
      const data = await response.json();
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        if (rememberMe) {
          await AsyncStorage.setItem('rememberMe', 'true');
          await AsyncStorage.setItem('userEmail', correo);
          await AsyncStorage.setItem('userPassword', contra);
        } else {
          await AsyncStorage.removeItem('userEmail');
          await AsyncStorage.removeItem('userPassword');
          await AsyncStorage.setItem('rememberMe', 'false');
        }
        router.push('/Menu');
      } else {
        Alert.alert('Error', data.message || 'No se pudo iniciar sesión.');
      }
    } catch (error) { //Manejo de errores
      console.error('Error en la solicitud de inicio de sesión:', error);
      Alert.alert('Error', 'Hubo un problema al intentar iniciar sesión. Inténtalo de nuevo.');
    }
  };
  //Funcion para manejar el checkBox "Remember Me"
  const handleRememberMeToggle = () => {
    setRememberMe(!rememberMe);
  };

//Diseño de la pantalla
  return (
    <View style={styles.container}>
      <Image source={logoBW} style={styles.logo} />

      <View style={styles.inputWrapper}>
        <MaterialIcons name='person-outline' size={24} color='#7c7c7c' style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder='Correo'
          placeholderTextColor='#828282'
          keyboardType='email-address'
          autoCapitalize='none'
          value={correo}
          onChangeText={setCorreo}
        />
      </View>

      <View style={styles.inputWrapper}>
        <MaterialIcons name='lock-outline' size={24} color='#7c7c7c' style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder='Contraseña'
          placeholderTextColor='#828282'
          secureTextEntry={true}
          value={contra}
          onChangeText={setContra}
        />
      </View>

      <View style={styles.optionsContainer}>
        <View style={styles.rememberMe}>
          <TouchableOpacity onPress={handleRememberMeToggle}>
            <MaterialIcons
              name={rememberMe ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={rememberMe ? '#39e991' : '#39e991'}
            />
          </TouchableOpacity>
          <Text style={styles.rememberMeText}>Recordarme</Text>
        </View>
        <Link href={{ pathname: '/ForgotPassword', params: { email: correo } }} asChild>
          <TouchableOpacity>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <View style={styles.footerTextContainer}>
        <Text style={styles.footerText}>¿No tienes cuenta? </Text>
        <Link href='/Signup' asChild>
          <TouchableOpacity>
            <Text style={styles.footerLinkText}>Regístrate ahora</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
//Estilos de la pantalla
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 270,
    height: 80,
    marginBottom: 40,
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#030303',
  },
  optionsContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#030303',
    marginLeft: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#030303',
    marginRight: 8,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#39e991',
    borderRadius: 24,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  footerTextContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  footerText: {
    color: '#7c7c7c',
    fontSize: 14,
  },
  footerLinkText: {
    color: '#39e991',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
