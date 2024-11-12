import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import DataTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfileScreen() {
  const router = useRouter();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [sector, setSector] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log("Token obtenido:", token); // Verifica que el token esté presente
        if (!token) {
          Alert.alert('Error', 'No se encontró el token de autenticación.');
          return;
        }
    
        const response = await axios.get('http:/192.168.1.12:3000/api/auth/getProfile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = response.data.user;
    
        setName(user.nombre);
        setEmail(user.correo);
        setCellphone(user.telefono);
        setSector(user.sector);
        setBirthday(new Date(user.fecha));
      } catch (error:any) {
        console.error("Error al obtener el perfil del usuario:", error.response?.data || error.message);
        Alert.alert('Error', 'No se pudo cargar la información del perfil');
      }
    };
    fetchUserProfile();
  }, []);

  const handleSaveChanges = async () => {
    try {
      // Obtener el token de AsyncStorage
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No se encontró el token de autenticación.');
        return;
      }
      // Solicitud PUT para actualizar el perfil
      const response = await axios.put('http://192.168.1.12:3000/api/auth/updateProfile', {
        nombre: name,
        correo: email,
        telefono: cellphone,
        sector,
        fecha: birthday,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Éxito', response.data.message);
      router.push('/Profile');
    } catch (error:any) {
      console.error("Error al actualizar el perfil:", error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Ocurrió un error al guardar los cambios.');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Se requiere permiso para acceder a la galería.');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      await uploadImage(result.assets[0].uri);
    }
  };
  
  const uploadImage = async (uri: string | URL | Request) => {
    const token = await AsyncStorage.getItem('token');
    console.log(uri);
    if (!token) {
      Alert.alert('Error', 'No se encontró el token de autenticación.');
      return;
    }
  
    const formData = new FormData();
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append('fotoPerfil', blob, `profile-${Date.now()}.jpg`);
  
    try {
      const result = await fetch('http://192.168.1.12:3000/api/auth/uploadProfilePhoto', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      const data = await result.json();
      console.log(data.imagePath);
      setImageUri(`http://192.168.1.12:3000/${data.imagePath}`); // Actualiza imageUri para mostrar la imagen guardada
      Alert.alert('Éxito', data.message);
    } catch (error) {
      
      console.error("Error al subir la imagen con fetch:", error);
      Alert.alert('Error', 'No se pudo subir la foto de perfil');
    }
  };
 
  
  const onDateChange = (_: any, selectDate: Date | undefined) => {
    const currentDate = selectDate || birthday;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthday(currentDate);
  };

  return (
    <View style={styles.backgroundContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Editar perfil</Text>

          {/* Imagen de perfil */}
          <TouchableOpacity onPress={pickImage} style={styles.centered}>
            <View style={styles.avatarContainer}>
              <Image source={imageUri ? { uri: imageUri } : require('../components/img/FotoPerfil.jpg')} style={styles.avatar} />
            </View>
            <Text style={styles.editText}>Editar foto</Text>
          </TouchableOpacity>
        </View>

        {/* Campos de entrada de texto */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name='person-outline' size={24} color='#7c7c7c' style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder='Nombre'
              placeholderTextColor='#828282'
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons name='alternate-email' size={24} color='#7c7c7c' style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder='Correo electrónico'
              placeholderTextColor='#828282'
              keyboardType='email-address'
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons name='phone' size={24} color='#7c7c7c' style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder='Número de teléfono'
              placeholderTextColor='#828282'
              keyboardType='phone-pad'
              value={cellphone}
              onChangeText={setCellphone}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="business" size={24} color='#7c7c7c' style={styles.icon} />
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
            <MaterialIcons name='calendar-today' size={24} color='#7c7c7c' style={styles.icon} />
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateTextWrapper}>
              <Text style={styles.dateText}>{birthday.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DataTimePicker
              value={birthday}
              mode='date'
              display='default'
              onChange={onDateChange}
            />
          )}
        </View>

        {/* Botón de guardar cambios */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
            <Text style={styles.buttonText}>Guardar cambios</Text>
          </TouchableOpacity>
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
    width: '100%',
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#030303',
    marginBottom: 10,
  },
  centered: {
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editText: {
    color: '#39e991',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    paddingHorizontal: 10,
    marginBottom: 15,
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
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#39e991',
    padding: 15,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});