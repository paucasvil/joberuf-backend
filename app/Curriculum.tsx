import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { OpenAI } from 'openai';

import { IPADDRESS } from './config';
console.log(`CV = ${IPADDRESS}`);


export default function UploadCvScreen() {
  const [cvFile, setCvFile] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      setCvFile(result.assets[0].uri);
    } else {
      console.log("Selección de archivo cancelada");
    }
  };

  const analyzeCv = async () => {
    if (!cvFile) {
      console.log("No hay archivo seleccionado para analizar");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('cv', {
        uri: cvFile,
        type: 'application/pdf',
        name: 'documento.pdf',
      });

      const response = await axios.post(`http://${IPADDRESS}:3000/api/uploadCv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const cvText = response.data.text;
      const openaiResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Eres un experto en optimización de currículums.' },
          { role: 'user', content: `Revisa el siguiente CV y proporciona sugerencias de optimización para mejorar las oportunidades de contratación. Sé conciso y específico en las áreas de experiencia laboral, habilidades y logros (logra resumirlo en 300 palabras maximo):\n\n${cvText}` },
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const suggestionsText = openaiResponse.choices[0].message?.content?.trim() || 'No se pudo generar sugerencias.';
      setSuggestions(suggestionsText);
    } catch (error) {
      console.error('Error al analizar el CV:', error);
      setSuggestions('Error al analizar el CV.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Carga tu CV</Text>
        <Text style={styles.subText}>
          Sube tu CV en formato PDF para que podamos analizarlo.
        </Text>

        {/* Botón para seleccionar archivo */}
        <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
          <Text style={styles.uploadButtonText}>Seleccionar archivo</Text>
        </TouchableOpacity>

        {/* Vista previa del archivo seleccionado */}
        {cvFile && (
          <View style={styles.previewContainer}>
            <Text style={styles.fileName}>Archivo seleccionado: {cvFile.split('/').pop()}</Text>
            <TouchableOpacity style={styles.clearButton} onPress={() => setCvFile(null)}>
              <Text style={styles.clearButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botón de Analizar */}
        {cvFile && !loading && (
          <TouchableOpacity style={styles.analyzeButton} onPress={analyzeCv}>
            <Text style={styles.analyzeButtonText}>Analizar</Text>
          </TouchableOpacity>
        )}

        {/* Indicador de carga */}
        {loading && (
          <ActivityIndicator size="large" color="#39e991" style={styles.loadingIndicator} />
        )}

        {/* Área de sugerencias */}
        {suggestions && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsText}>{suggestions}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  subText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  uploadButton: {
    backgroundColor: '#39e991',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  fileName: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  analyzeButton: {
    backgroundColor: '#0077cc',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 30, // Espacio extra
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  suggestionsContainer: {
    marginTop: 20,
    padding: 15,
    width: '100%',
    backgroundColor: '#e8f4fc',
    borderRadius: 10,
    marginBottom: 30,
  },
  suggestionsText: {
    fontSize: 14,
    color: '#333333',
  },
});
