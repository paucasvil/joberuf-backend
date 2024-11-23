import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { IPADDRESS } from './config';
console.log(`FP = ${IPADDRESS}`);
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const handleSendEmail = async () => {
    try {
      const response = await axios.post(`http://${IPADDRESS}:3000/api/auth/forgotPassword`, { email });
      Alert.alert('Correo Enviado', `Se ha enviado una contraseña temporal a ${email}.`);
      router.push('/Login');
    } catch (error) {
      console.error("Error al enviar el correo de restablecimiento:", error);
      Alert.alert('Error', 'Hubo un problema al enviar el correo de restablecimiento. Inténtalo nuevamente.');
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperación de Contraseña</Text>
      <Text style={styles.instructions}>
        Enviaremos un enlace de recuperación al siguiente correo:
      </Text>

      {/* Muestra el correo asociado */}
      <View style={styles.emailContainer}>
        <Text style={styles.emailText}>{email}</Text>
      </View>

      {/* Botón de Enviar Correo */}
      <TouchableOpacity style={styles.sendButton} onPress={handleSendEmail}>
        <Text style={styles.sendButtonText}>Enviar correo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#030303',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#8b8b8b',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  emailContainer: {
    backgroundColor: '#f7f7f7',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    padding: 12,
    marginBottom: 30,
    alignItems: 'center',
    width: '100%',
  },
  emailText: {
    fontSize: 16,
    color: '#030303',
  },
  sendButton: {
    width: '100%',
    backgroundColor: '#39e991',
    borderRadius: 24,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
