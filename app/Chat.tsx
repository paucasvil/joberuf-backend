import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { IPADDRESS } from './config';

type Message = {
  id: number;
  sender: string;
  text: string;
  type: 'sent' | 'received';
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userSector, setUserSector] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>(''); // Nombre del usuario
  const [userPhoto, setUserPhoto] = useState<string | null>(null); // Foto del usuario
  const [interviewQuestions, setInterviewQuestions] = useState<{ topic: string; question: string }[]>([]);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [isIntroVisible, setIsIntroVisible] = useState(true); // Estado para la introducción
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null); // Imagen del usuario
  const MAX_QUESTIONS = 10;

  const isInputEditable = () => !loading && !isInputDisabled;

  const startSimulation = () => {
    setIsIntroVisible(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Token obtenido:', token);

        if (!token) {
          Alert.alert('Error', 'Usuario no autenticado.');
          return;
        }

        const response = await axios.get(`http://${IPADDRESS}:3000/api/auth/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { id, sector, nombre, photo } = response.data.user;
        console.log('Sector:', sector, 'User ID:', id);

        setUserSector(sector);
        setUserId(id);
        setUserName(nombre);
        setUserPhoto(photo || null); // Si no hay foto, será null
        startInterview(sector, id);
      } catch (error: any) {
        console.error('Error al obtener los datos del usuario:', error.response?.data || error.message);
        Alert.alert('Error', 'No se pudo obtener la información del usuario.');
      }
    };

    fetchUserData();
  }, []);

  const startInterview = async (sector: string, id: string) => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token obtenido:', token);

      if (!token) {
        Alert.alert('Error', 'Usuario no autenticado.');
        return;
      }

      const response = await axios.post(
        `http://${IPADDRESS}:3000/api/auth/startInterview`,
        { userSector: sector, userId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const questions = response.data.questions.map((q: any) =>
        typeof q === 'string' ? { question: q, topic: 'General' } : q
      );
      setInterviewQuestions(questions);
      setMessages([
        {
          id: Date.now(),
          sender: 'Joby',
          text: `¡Hola! Soy tu entrevistador. Comencemos. ${questions[0]?.question || questions[0]}`,
          type: 'received',
        },
      ]);
    } catch (error: any) {
      console.error('Error al iniciar la entrevista:', error.message);
      Alert.alert('Error', 'No se pudieron cargar las preguntas.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'Usuario',
      text: inputText,
      type: 'sent',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Usuario no autenticado.');
        return;
      }

      const response = await axios.post(
        `http://${IPADDRESS}:3000/api/auth/nextQuestion`,
        {
          userResponse: inputText,
          currentQuestionIndex, // Enviamos el índice actual
          userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const nextQuestionObject = response.data.nextQuestion;

      if (nextQuestionObject) {
        const botMessage: Message = {
          id: Date.now(),
          sender: 'Joby',
          text: nextQuestionObject.question,
          type: 'received',
        };

        setMessages((prev) => [...prev, botMessage]);
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        finishInterview();
      }
    } catch (error) {
      console.error('Error al enviar la respuesta:', error);
      Alert.alert('Error', 'No se pudo enviar la respuesta.');
    } finally {
      setLoading(false);
    }
  };

  const finishInterview = async () => {
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'Joby',
        text: 'Generando feedback y puntuación. Por favor espera...',
        type: 'received',
      },
    ]);

    const userResponses = messages
      .filter((msg) => msg.type === 'sent' && msg.text.trim() !== '')
      .map((msg, index) => ({
        question: interviewQuestions[index]?.question || 'Pregunta no disponible',
        answer: msg.text.trim(),
      }));

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Usuario no autenticado.');
        return;
      }

      const response = await axios.post(
        `http://${IPADDRESS}:3000/api/auth/finishInterview`,
        {
          userId,
          responses: userResponses,
          userSector,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("hasta aqui bien");
      const { feedback, score } = response.data;
      await axios.post(
        `http://${IPADDRESS}:3000/api/auth/scores`,
        {
          userId,
          score, // Puntuación de la última entrevista
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("AQUI YA ?");
      // Mostrar feedback completo
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'Joby',
          text: feedback,
          type: 'received',
        },
        {
          id: Date.now() + 1,
          sender: 'Joby',
          text: `Puntaje promedio final: ${score}/100.`,
          type: 'received',
        },
      ]);
    } catch (error) {
      console.error('Error al finalizar la entrevista:', error);
      Alert.alert('Error', 'No se pudo finalizar la entrevista.');
    } finally {
      setLoading(false);
      setIsInputDisabled(true);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        style={styles.messageContainer}
      >
  {messages.map((msg) => (
    <View
      key={msg.id}
      style={[
        styles.messageRow,
        msg.type === 'sent' ? styles.sentMessageRow : styles.receivedMessageRow,
      ]}
    >
      {/* Avatar */}
      {msg.type === 'received' && (
        <View style={styles.avatarContainer}>
          <Image
            source={require('../components/img/ImagoBW.png')}
            style={styles.profileImage}
          />
        </View>
      )}
      {msg.type === 'sent' && (
        <View style={styles.avatarContainer}>
          <Image
            source={
              userProfileImage // Variable que contiene la URL de la foto del usuario
                ? { uri: userProfileImage }
                : require('../components/img/Person.png') // Imagen por defecto
            }
            style={styles.profileImage}
          />
        </View>
      )}

      {/* Mensaje */}
      <View
        style={[
          styles.messageContent,
          msg.type === 'sent' ? styles.sentMessageContent : styles.receivedMessageContent,
        ]}
      >
        <Text style={styles.messageSender}>
          {msg.sender === 'Joby' ? 'Joby' : userName}
        </Text>
        <Text style={styles.messageText}>{msg.text}</Text>
      </View>
    </View>
  ))}
</ScrollView>


      {!isInputDisabled && currentQuestionIndex < MAX_QUESTIONS && (
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Escribe tu respuesta..."
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            editable={isInputEditable()}
          />
          <TouchableOpacity onPress={sendMessage} disabled={loading}>
            <FontAwesome name="paper-plane" size={20} color="#030303" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sentMessageRow: {
    justifyContent: 'flex-end',
  },
  receivedMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  loading: {
    marginVertical: 10,
  },
  messageContent: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 12,
  },
  sentMessageContent: {
    backgroundColor: '#d9ffd9', // Verde claro
    alignSelf: 'flex-end',
  },
  receivedMessageContent: {
    backgroundColor: '#f2f2f2', // Gris claro
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 14,
    color: '#030303', // Negro oscuro para texto
  },
  messageSender: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#030303',
    marginBottom: 5,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
  },
});
