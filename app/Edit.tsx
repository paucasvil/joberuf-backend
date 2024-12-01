import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { IPADDRESS } from './config';
console.log(`EDIT = ${IPADDRESS}`);

const techSkills = ['Programación en Python', 'Desarrollo Web', 'Inteligencia Artificial', 'Machine Learning', 'Redes', 'Bases de Datos', 'Desarrollo Móvil', 'Ciberseguridad', 'Análisis de Datos', 'Algoritmos', 'Otra'];
const softSkills = ['Comunicación', 'Trabajo en Equipo', 'Liderazgo', 'Adaptabilidad', 'Pensamiento Crítico', 'Creatividad', 'Resolución de Problemas', 'Ética Profesional', 'Otra'];


export default function EditProfileScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [sector, setSector] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedTechSkill, setSelectedTechSkill] = useState('');
  const [selectedSoftSkill, setSelectedSoftSkill] = useState('');
  const [selectedTechSkills, setSelectedTechSkills] = useState<string[]>([]);
  const [selectedSoftSkills, setSelectedSoftSkills] = useState<string[]>([]);
  const [customTechSkill, setCustomTechSkill] = useState('');
  const [customSoftSkill, setCustomSoftSkill] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No se encontró el token de autenticación.');
          return;
        }

        const response = await axios.get(`http://${IPADDRESS}:3000/api/auth/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        
        const user = response.data.user;

        setName(user.nombre);        
        setEmail(user.correo);
        setCellphone(user.telefono);
        setSector(user.sector);
        setBirthday(new Date(user.fecha));
        // Configura la URL completa de la imagen si existe
        const profileImageUri = user.photo;
        //setImageUri(profileImageUri);
        setImageUri(require('../assets/images/images5/J.png')); // Imagen por defecto
        setSelectedTechSkills(user.habilidadesTecnicas.map((skill: { nombre: any; }) => skill.nombre));
        setSelectedSoftSkills(user.habilidadesBlandas.map((skill: { nombre: any; }) => skill.nombre));

      } catch (error:any) {
        console.error("Error al obtener el perfil del usuario:", error.response?.data || error.message);
        Alert.alert('Error', 'No se pudo cargar la información del perfil');
      }
    };
    fetchUserProfile();
}, []);


  const handleSaveChanges = async () => {
    try {
       const token = await AsyncStorage.getItem('token');
       if (!token) {
          Alert.alert('Error', 'No se encontró el token de autenticación.');
          return;
       }
       /*
       if (imageUri) {
        const formData = new FormData();     
        formData.append('fotoPerfil', {
            uri: imageUri,
            type: 'image/jpeg',
            name: `profile-${Date.now()}.jpg`
        });      
        const imageUploadResponse = await fetch(`http://${IPADDRESS}:3000/api/auth/uploadProfilePhoto`, {
           method: 'POST',
           headers: {
              'Content-Type': 'multipart/form-data', 
              Authorization: `Bearer ${token}`,
           },
           body: formData,
        });
     
        if (!imageUploadResponse.ok) {
           throw new Error('Error al subir la imagen. Por favor, intenta nuevamente.');
        }
     }*/

     
       await axios.put(`http://${IPADDRESS}:3000/api/auth/updateProfile`, {
          nombre: name,
          correo: email,
          telefono: cellphone,
          //sector,
          //fecha: birthday,
          habilidadesTecnicas: selectedTechSkills,
          habilidadesBlandas: selectedSoftSkills,
       }, {
          headers: { Authorization: `Bearer ${token}` },
       });

       Alert.alert('Cambios guardados', 'Tu perfil se ha actualizado con exito');
       router.push('/Profile');
    } catch (error:any) {
       console.error("Error al actualizar el perfil:", error.message);
       Alert.alert('Error', error.message || 'Ocurrió un error al guardar tus cambios.');
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
      quality: 0.5,  // Reduce el tamaño del archivo de imagen
    });
  

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onDateChange = (_: any, selectDate: Date | undefined) => {
    const currentDate = selectDate || birthday;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthday(currentDate);
  };

  const addTechSkill = () => {
    if (selectedTechSkill && selectedTechSkill !== 'Otra' && !selectedTechSkills.includes(selectedTechSkill)) {
      setSelectedTechSkills([...selectedTechSkills, selectedTechSkill]);
    }
    setSelectedTechSkill('');
  };

  const addCustomTechSkill = () => {
    if (customTechSkill && !selectedTechSkills.includes(customTechSkill)) {
      setSelectedTechSkills([...selectedTechSkills, customTechSkill]);
    }
    setCustomTechSkill('');
  };

  const addSoftSkill = () => {
    if (selectedSoftSkill && selectedSoftSkill !== 'Otra' && !selectedSoftSkills.includes(selectedSoftSkill)) {
      setSelectedSoftSkills([...selectedSoftSkills, selectedSoftSkill]);
    }
    setSelectedSoftSkill('');
  };

  const addCustomSoftSkill = () => {
    if (customSoftSkill && !selectedSoftSkills.includes(customSoftSkill)) {
      setSelectedSoftSkills([...selectedSoftSkills, customSoftSkill]);
    }
    setCustomSoftSkill('');
  };

  const removeTechSkill = (skill: string) => {
    setSelectedTechSkills(selectedTechSkills.filter((item: string) => item !== skill));
  };

  const removeSoftSkill = (skill: string) => {
    setSelectedSoftSkills(selectedSoftSkills.filter((item: string) => item !== skill));
  };
  
  return (
    <View style={styles.backgroundContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Editar perfil</Text>
          <TouchableOpacity onPress={pickImage} style={styles.centered}>
            <View style={styles.avatarContainer}>              
            <Image source={imageUri || require('../assets/images/Imago.png')} style={styles.avatar} />
            </View>            
          </TouchableOpacity>
        </View>

        {/* Información básica */}
        <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="#828282" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Correo electrónico" placeholderTextColor="#828282" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Número de teléfono" placeholderTextColor="#828282" keyboardType="phone-pad" value={cellphone} onChangeText={setCellphone} />

        <Text style={styles.label}>Habilidades Técnicas</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={selectedTechSkill} onValueChange={(itemValue: any) => setSelectedTechSkill(itemValue)} style={styles.picker}>
            <Picker.Item label="Selecciona una habilidad técnica" value="" />
            {techSkills.map(skill => (
              <Picker.Item key={skill} label={skill} value={skill} />
            ))}
          </Picker>
        </View>
        <TouchableOpacity style={styles.button} onPress={addTechSkill}>
          <Text style={styles.buttonText}>Agregar habilidad técnica</Text>
        </TouchableOpacity>

        {selectedTechSkill === 'Otra' && (
          <>
            <TextInput style={styles.input} placeholder="Escribe una habilidad técnica personalizada..." value={customTechSkill} onChangeText={setCustomTechSkill} />
            <TouchableOpacity style={styles.button} onPress={addCustomTechSkill}>
              <Text style={styles.buttonText}>Agregar habilidad personalizada</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.selectedSkillsContainer}>
          {selectedTechSkills.map((skill: string, index: number) => (
            <View key={`${skill}-${index}`} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
              <TouchableOpacity onPress={() => removeTechSkill(skill)}>
                <Text style={styles.removeSkillText}>x</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Habilidades blandas */}
        <Text style={styles.label}>Habilidades Blandas</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={selectedSoftSkill} onValueChange={(itemValue: any) => setSelectedSoftSkill(itemValue)} style={styles.picker}>
            <Picker.Item label="Selecciona una habilidad blanda" value="" />
            {softSkills.map(skill => (
              <Picker.Item key={skill} label={skill} value={skill} />
            ))}
          </Picker>
        </View>
        <TouchableOpacity style={styles.button} onPress={addSoftSkill}>
          <Text style={styles.buttonText}>Agregar habilidad blanda</Text>
        </TouchableOpacity>

        {selectedSoftSkill === 'Otra' && (
          <>
            <TextInput style={styles.input} placeholder="Escribe una habilidad blanda personalizada..." value={customSoftSkill} onChangeText={setCustomSoftSkill} />
            <TouchableOpacity style={styles.button} onPress={addCustomSoftSkill}>
              <Text style={styles.buttonText}>Agregar habilidad personalizada</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.selectedSkillsContainer}>
          {selectedSoftSkills.map((skill: string, index: number) => (
            <View key={`${skill}-${index}`} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
              <TouchableOpacity onPress={() => removeSoftSkill(skill)}>
                <Text style={styles.removeSkillText}>x</Text>
              </TouchableOpacity>
            </View>
          ))}
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
    height: 50,
    fontSize: 16,
    color: '#030303',
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    color: '#333333',
    marginVertical: 10,
  },
  pickerContainer: {
    backgroundColor: '#f7f7f7',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    color: '#030303',
  },
  button: {
    backgroundColor: '#39e991',
    padding: 15,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  selectedSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  skillTag: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 5,
    alignItems: 'center',
  },
  skillText: {
    color: '#333333',
    fontSize: 14,
    marginRight: 5,
  },
  removeSkillText: {
    color: '#ff4d4d',
    fontWeight: 'bold',
    marginLeft: 5,
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
});
