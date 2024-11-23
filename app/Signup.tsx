import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Platform, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DataTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import axios from 'axios';
import { IPADDRESS } from './config';
console.log(`SIGNUP = ${IPADDRESS}`);
export default function SignUpScreen() {
  const logo = require('../components/img/Logo.png');
  const router = useRouter();

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sector, setSector] = useState('Ciencias de la Computación');
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [ipAddress, setIpAddress] = useState('');

  // Obtener la IP local en tiempo de ejecución
  useEffect(() => {
    const fetchIpAddress = async () => {
      const ip = await Network.getIpAddressAsync();
      setIpAddress(ip);
      console.log('IP Address:', ip);
    };
    fetchIpAddress();
  }, []);
  const onDateChange = (_: any, selectDate: Date | undefined) => {
    const currentDate = selectDate || birthday;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthday(currentDate);
  };
  // Función para manejar el registro
  const handleSignUp = async () => {
    if (!name || !lastName || !email || !cellphone || !password || !sector) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    
    try {
      const response = await axios.post(`http:/${IPADDRESS}:3000/api/auth/signup`, {
        nombre: name,
        apellidos: lastName,
        correo: email,
        telefono: cellphone,
        contra: password,
        sector,
        fecha: birthday.toISOString(),
      });

      Alert.alert('Confirmación', response.data.message);
      router.push('/Login');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Ocurrió un error al registrarse');
    }
  };

  return (
    <View style={styles.backgroundContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
        </View>

        <Text style={styles.title}>Regístrate,</Text>
        <Text style={styles.subtitle}>Únete a la comunidad</Text>

        {/* Campos de entrada de texto */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="person-outline" size={24} color="#7c7c7c" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor="#828282"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="person-outline" size={24} color="#7c7c7c" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Apellido"
              placeholderTextColor="#828282"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="alternate-email" size={24} color="#7c7c7c" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#828282"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="phone" size={24} color="#7c7c7c" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Número de teléfono"
              placeholderTextColor="#828282"
              keyboardType="phone-pad"
              value={cellphone}
              onChangeText={setCellphone}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="business" size={24} color="#7c7c7c" style={styles.icon} />
            <Picker
              selectedValue={sector}
              onValueChange={(itemValue) => setSector(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Ciencias de la Computación" value="Ciencias de la Computación" />
              <Picker.Item label="Administración - Gestión Empresarial" value="Administración - Gestión Empresarial" />
            </Picker>
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="calendar-today" size={24} color="#7c7c7c" style={styles.icon} />
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateTextWrapper}>
              <Text style={styles.dateText}>{birthday.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DataTimePicker
              value={birthday}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock-outline" size={24} color="#7c7c7c" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#828282"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="verified-user" size={24} color="#7c7c7c" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#828282"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Crear cuenta</Text>
        </TouchableOpacity>

        <View style={styles.footerTextContainer}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
          <Link href="/Login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLinkText}>Inicia sesión</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#030303',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#7c7c7c',
    marginBottom: 20,
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
  picker: {
    flex: 1,
    height: 50,
    color: '#030303',
  },
  dateTextWrapper: {
    flex: 1,
    justifyContent: 'center',
    height: 50,
  },
  dateText: {
    fontSize: 16,
    color: '#828282',
  },
  signUpButton: {
    width: '100%',
    backgroundColor: '#39e991',
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerTextContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },

  footerText: {
    color: '#7a7a7a',
    fontSize: 14,
  },
  footerLinkText: {
    color: '#39e991',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
