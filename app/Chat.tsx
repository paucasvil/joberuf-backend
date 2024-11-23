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
  const [interviewQuestions, setInterviewQuestions] = useState<{ topic: string; question: string }[]>([]);
  const scrollViewRef = useRef<ScrollView | null>(null);

  const MAX_QUESTIONS = 10;

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

        const { id, sector } = response.data.user;
        console.log('Sector:', sector, 'User ID:', id);

        setUserSector(sector);
        setUserId(id);

        startInterview(sector, id);
      } catch (error:any) {
        console.error('Error al obtener los datos del usuario:', error.response?.data || error.message);
        Alert.alert('Error', 'No se pudo obtener la información del usuario.');
      }
    };

    fetchUserData();
  }, []);

  const startInterview = async (sector: string, id: string) => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    console.log(`Token en startInterview: ${token}`);
    console.log(`Sector : ${sector} y id : ${id}`);
    if (!token) {
      Alert.alert('Error', 'Usuario no autenticado.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://${IPADDRESS}:3000/api/auth/startInterview`,
        { userSector: sector, userId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const questions = response.data.questions;
      console.log('Preguntas recibidas:', questions);
      setInterviewQuestions(questions);

      const firstQuestion: Message = {
        id: Date.now(),
        sender: 'Joby',
        text: `¡Hola! Soy Joby, tu  entrevistador. Comencemos con esta entrevista. ${questions[0].question}`,
        type: 'received',
      };

      setMessages([firstQuestion]);
    } catch (error:any) {
      console.error('Error al iniciar la entrevista:', error.response?.data || error.message);
      Alert.alert('Error', 'No se pudo iniciar la entrevista.');
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
          currentQuestionIndex,
          userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const nextQuestionObject = interviewQuestions[currentQuestionIndex + 1]; 
      const nextQuestionText = nextQuestionObject?.question; 
  
      if (currentQuestionIndex + 1 < MAX_QUESTIONS && nextQuestionText) {
        const botMessage: Message = {
          id: Date.now(),
          sender: 'Joby',
          text: nextQuestionText, 
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
  
    const userResponses = messages
      .filter((msg) => msg.type === 'sent')
      .map((msg, index) => ({
        question: interviewQuestions[index],
        answer: msg.text,
      }));
  
    try {
      const response = await axios.post(`http://${IPADDRESS}:3000/api/auth/finishInterview`, {
        userId,
        responses: userResponses,
        userSector,
      });
  
      const { feedback, score } = response.data;
  
      const resultMessage: Message = {
        id: Date.now(),
        sender: 'Joby',
        text: `Entrevista finalizada. Puntuación: ${score}/100.\n\nFeedback:\n${feedback}`,
        type: 'received',
      };
  
      setMessages((prev) => [...prev, resultMessage]);
    } catch (error) {
      console.error('Error al finalizar la entrevista:', error);
      Alert.alert('Error', 'No se pudo finalizar la entrevista.');
    } finally {
      setLoading(false);
    }
  };
  

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
              style={[styles.messageContent, msg.type === 'sent' ? styles.sentMessageContent : styles.receivedMessageContent]}
            >
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {loading && <ActivityIndicator size="large" color="#39e991" style={styles.loading} />}

      {currentQuestionIndex < MAX_QUESTIONS && (
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Escribe tu respuesta..."
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            editable={!loading}
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
});
