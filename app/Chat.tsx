import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { IPADDRESS } from './config';
console.log(`CHAT = ${IPADDRESS}`);

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
  const [interviewQuestions, setInterviewQuestions] = useState<{ topic: string; question: string }[]>([]);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [isIntroVisible, setIsIntroVisible] = useState(true); // Estado para la introducción
  const scrollViewRef = useRef<ScrollView | null>(null);

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

        const { id, sector, nombre } = response.data.user;
        console.log('Sector:', sector, 'User ID:', id);

        setUserSector(sector);
        setUserId(id);
        setUserName(nombre);
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

        const { feedback, score } = response.data;

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

  if (isIntroVisible) {
    return (
      <View style={styles.introContainer}>
        <Text style={styles.introTitle}>¡Hola, {userName}!</Text>
        <Text style={styles.introText}>
          A continuación, iniciaremos una simulación de entrevista de trabajo diseñada específicamente para el área de{' '}
          <Text style={{ fontWeight: 'bold' }}>{userSector}</Text>.
        </Text>
        <Text style={styles.introText}>
          Responde cada pregunta con el mayor detalle posible. Estas respuestas serán evaluadas por un sistema de
          inteligencia artificial, que te brindará retroalimentación detallada y una puntuación final.
        </Text>
        <Text style={styles.introText}>
          Nota: Esta simulación solo incluye preguntas teóricas y conceptuales. No se realizarán preguntas prácticas ni de resolución de ejercicios de programación.
        </Text>
        <Text style={styles.introText}>
          Cuando estés listo, presiona el botón "Comenzar Simulación" para iniciar.
        </Text>
        <TouchableOpacity style={styles.startButton} onPress={startSimulation}>
          <Text style={styles.startButtonText}>Comenzar Simulación</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        style={styles.messageContainer}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.messageRow, msg.type === 'sent' ? styles.sentMessageRow : styles.receivedMessageRow]}
          >
            <View
              style={[
                styles.messageContent,
                msg.type === 'sent' ? styles.sentMessageContent : styles.receivedMessageContent,
              ]}
            >
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {loading && <ActivityIndicator size="large" color="#39e991" style={styles.loading} />}

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
            <FontAwesome name="paper-plane" size={20} color="#39e991" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#ffffff',
  },
  messageContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 10,
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  sentMessageRow: {
    justifyContent: 'flex-end',
  },
  receivedMessageRow: {
    justifyContent: 'flex-start',
  },
  messageContent: {
    maxWidth: '80%',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 10,
  },
  sentMessageContent: {
    backgroundColor: '#e1ffc7',
    marginLeft: 10,
  },
  receivedMessageContent: {
    backgroundColor: '#f2f2f2',
    marginRight: 10,
  },
  messageText: {
    fontSize: 16,
    color: '#363636',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    color: '#141414',
    paddingHorizontal: 15,
    marginRight: 10,
  },
  loading: {
    marginBottom: 10,
  },
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#363636',
    marginBottom: 20,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    color: '#606060',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  startButton: {
    marginTop: 20,
    backgroundColor: '#39e991',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    elevation: 2,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});
