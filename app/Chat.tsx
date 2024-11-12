import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import * as Network from 'expo-network';

export default function ChatScreen() {
  const fotoPerfil = require('../components/img/FotoPerfil.jpg');
  const imagoBW = require('../components/img/ImagoBW.png');
  const messageIcon = require('../components/img/Message_v2.png');
  const dots = require('../components/img/Dots.png');

  const [messages, setMessages] = useState([
    { id: 1, sender: 'Joby', text: '¿Listo para iniciar la simulación de entrevista?', type: 'received' },
    { id: 2, sender: 'Pablo', text: 'Acceso a simulación de entrevista', type: 'sent' },
  ]);

  const [inputText, setInputText] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Obtener IP local en tiempo de ejecución
  useEffect(() => {
    const fetchIpAddress = async () => {
      const ip = await Network.getIpAddressAsync();
      setIpAddress(ip);
      console.log('IP Address:', ip);
    };
    fetchIpAddress();
  }, []);

  // Función para enviar el mensaje al backend y obtener respuesta
  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    // Añadir mensaje del usuario
    const newMessage = { id: Date.now(), sender: 'Pablo', text: inputText, type: 'sent' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText('');

    try {
      // Llamada al backend para simular la entrevista
      const response = await axios.post(`http:// 192.168.1.12:3000/api/chat`, {
        pregunta: inputText,
      });

      const botMessage = {
        id: Date.now() + 1,
        sender: 'Joby',
        text: response.data.respuesta,
        type: 'received',
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Error al obtener respuesta del backend:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'Joby',
        text: 'Error al procesar la solicitud. Inténtalo de nuevo.',
        type: 'received',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  return (
    <View style={styles.container}>

      {/* Iconos superiores flotantes */}
      <View style={styles.topIconContainer}>
        <Image source={dots} style={styles.icon} />
        <Image source={messageIcon} style={styles.icon} />
      </View>

      {/* Área de mensajes */}
      <ScrollView
        style={styles.messageContainer}
        contentContainerStyle={styles.messageContentContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.type === 'sent' ? styles.sentMessageRow : styles.receivedMessageRow,
            ]}
          >
            {message.type === 'received' && <Image source={imagoBW} style={styles.profileImage} />}
            <View
              style={[
                styles.messageContent,
                message.type === 'sent' ? styles.sentMessageContent : styles.receivedMessageContent,
              ]}
            >
              <Text style={styles.senderName}>
                {message.sender}{' '}
                <Text style={styles.jobLabel}>
                  {message.sender === 'Pablo' ? 'Recién egresado' : 'Joberuf'}
                </Text>
              </Text>
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
            {message.type === 'sent' && <Image source={fotoPerfil} style={styles.profileImage} />}
          </View>
        ))}
      </ScrollView>

      {/* Input para nuevo mensaje */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Escribe un nuevo mensaje"
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity onPress={sendMessage}>
          <FontAwesome name="paper-plane" size={16} color="#030303" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  topIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  messageContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 10,
  },
  messageContentContainer: {
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  receivedMessageRow: {
    justifyContent: 'flex-start',
  },
  sentMessageRow: {
    justifyContent: 'flex-end',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 100,
    marginRight: 10,
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
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  jobLabel: {
    fontSize: 12,
    color: '#727272',
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
});
