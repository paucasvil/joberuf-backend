//Importaciones necesarias para el desarrollo de la pantalla
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPADDRESS } from './config'; //Se importa la IP para pruebas

//Declaracion del componente de pantalla ChangePasswordScreen
export default function ChangePasswordScreen() {
  //Declaracion de los estados de credenciales
  const router = useRouter(); 
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  //Funcion para manejar el cambio de contraseña
  const handleChangePassword = async () => {
    // Validación de que la nueva contraseña y la confirmación coincidan
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    try {
      //Recuperacion del token de autenticación
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No se encontró el token de autenticación.');
        return;
      }
      //Petición PUT a la API para cambiar la contraseña
      const response = await axios.put(
        `http://${IPADDRESS}:3000/api/auth/changePassword`,
        {
          oldPassword: currentPassword,//Contraseña actual
          newPassword: newPassword,//Nueva contraseña
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('Éxito', response.data.message);
      router.push('/Profile');
    } catch (error:any) {
      console.error('Error al cambiar la contraseña:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Hubo un problema al cambiar la contraseña. Inténtalo de nuevo.'
      );
    }
  };
  //Diseño de la pantalla
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cambiar Contraseña</Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <MaterialIcons name='lock-outline' size={24} color='#7c7c7c' style={styles.icon} />
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder='Contraseña actual'
            placeholderTextColor='#828282'
            secureTextEntry
          />
        </View>

        <View style={styles.inputWrapper}>
          <MaterialIcons name='vpn-key' size={24} color='#7c7c7c' style={styles.icon} />
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder='Nueva contraseña'
            placeholderTextColor='#828282'
            secureTextEntry
          />
        </View>
        
        <View style={styles.inputWrapper}>
          <MaterialIcons name='verified-user' size={24} color='#7c7c7c' style={styles.icon} />
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder='Confirmar nueva contraseña'
            placeholderTextColor='#828282'
            secureTextEntry
          />
        </View>
      </View>

      {/* Botón de guardar cambios */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Guardar cambios</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
//Estilos para los componentes
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#030303',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 24,
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
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#39e991',
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
