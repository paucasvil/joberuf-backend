//Importaciones necesarias para la pantalla Chat
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { IPADDRESS } from './config';
//Definir interfaz de mensaje y su formato
type Message = {
  id: number;
  sender: string;
  text: string;
  type: 'sent' | 'received';
};

//Declarar constantes y sus estados necesarios durante la implementacion de la pantalla
export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userSector, setUserSector] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null); 
  const [interviewQuestions, setInterviewQuestions] = useState<{ topic: string; question: string }[]>([]);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [isIntroVisible, setIsIntroVisible] = useState(true); 
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null); 
  const MAX_QUESTIONS = 10; //Definir maximo de preguntas

  const isInputEditable = () => !loading && !isInputDisabled;
  //Inicio de la simulación de entrevista
  const startSimulation = () => {
    setIsIntroVisible(false); //Iniciar con una introducción antes de la simulación
  };

  //Inicio de la simulación 
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Token obtenido:', token);

        if (!token) {
          Alert.alert('Error', 'Usuario no autenticado.');
          return;
        }
        //Llamar los datos del usuario
        const response = await axios.get(`http://${IPADDRESS}:3000/api/auth/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { id, sector, nombre, photo } = response.data.user;
        console.log('Sector:', sector, 'User ID:', id);

        setUserSector(sector);
        setUserId(id);
        setUserName(nombre);
        setUserPhoto(photo || null); 
        startInterview(sector, id); //Inicia la entrevista
      } catch (error: any) {
        console.error('Error al obtener los datos del usuario:', error.response?.data || error.message);
        Alert.alert('Error', 'No se pudo obtener la información del usuario.');
      }
    };

    fetchUserData();
  }, []);


  //Funcion para iniciar la entrevista, con un saludo y la primera pregunta
  const startInterview = async (sector: string, id: string) => {
    setLoading(true); //Animacion de carga

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

      //Definir las preguntas para la simuacion de entrevista
      const questions = response.data.questions.map((q: any) =>
        typeof q === 'string' ? { question: q, topic: 'General' } : q
      );
      setInterviewQuestions(questions);
      //Iniciar con la primera pregunta
      setMessages([
        {
          id: Date.now(),
          sender: 'Joby',
          text: `¡Hola! Soy tu Joby, tu entrevistador. Comencemos. ${questions[0]?.question || questions[0]}`,
          type: 'received',
        },
      ]);
    } catch (error: any) { 
      console.error('Error al iniciar la entrevista:', error.message);
      Alert.alert('Error', 'No se pudieron cargar las preguntas.'); //Alertas para errores
    } finally {
      setLoading(false);
    }
  };

  //Funcion para enviar los mensajes y mantener la conversacion con la IA
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'Usuario',
      text: inputText,
      type: 'sent',
    };
    //Guarda todos los mensajes previos
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Usuario no autenticado.');
        return;
      }

      //Usar la ruta para la siguiente pregunta
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
      // Intercalar los mensajes de respuesta y de pregunta de la IA
      if (nextQuestionObject) {
        const botMessage: Message = {
          id: Date.now(),
          sender: 'Joby',
          text: nextQuestionObject.question,
          type: 'received',
        };
        //Guardar las preguntas del bot de IA
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

  //Funcion para finalizar la entrevista
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
      // Usa las respuestas de la entrevista para un analisis a profundidad
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
      //Guardar en la base de datos la puntuacion promedio de la entrevista
      const { feedback, score } = response.data;
      await axios.post(
        `http://${IPADDRESS}:3000/api/auth/scores`,
        {
          userId,
          score,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Mostrar feedback completo
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'Joby',
          text: feedback, //Muestra el feedback final
          type: 'received',
        },
        {
          id: Date.now() + 1,
          sender: 'Joby',
          text: `Puntaje promedio final: ${score}/100.`, //Muestra el puntaje promedio final
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

  //Introducción antes de la simulacion
  if (isIntroVisible) {
    return (
      <View style={styles.introContainer}>
        <Text style={styles.introTitle}>!Hola, {userName}!</Text>
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
          Recuerda que el objetivo de esta simulación es ayudarte a mejorar en tus entrevistas laborales. ¡Sé honesto en
          tus respuestas y da lo mejor de ti!
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
  //Diseño de pantalla
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

//Estilos de la pantalla
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 15,
    paddingBottom: 80,
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
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff', // Fondo blanco para claridad
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#39e991', // Verde destacado para el título
    marginBottom: 20,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    color: '#333333', // Gris oscuro para legibilidad
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24, // Espaciado cómodo entre líneas
  },
  startButton: {
    marginTop: 20,
    backgroundColor: '#39e991', // Verde para el botón
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10, // Bordes redondeados
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, // Sombra para dar efecto elevado
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff', // Texto blanco para contraste
  },
});
