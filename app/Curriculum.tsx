import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export default function UploadCvScreen() {
  const [cvFile, setCvFile] = useState<string | null>(null);

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

  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>Carga tu CV</Text>
      <Text style = {styles.subText}>
        Sube tu CV en formato PDF para que podamos revisarlo.
      </Text>

      {/* Botón para seleccionar archivo */}
      <TouchableOpacity style = {styles.uploadButton} onPress = {pickDocument}>
        <Text style = {styles.uploadButtonText}>Seleccionar archivo</Text>
      </TouchableOpacity>

      {/* Vista previa del archivo seleccionado */}
      {cvFile && (
        <View style = {styles.previewContainer}>
          <Text style = {styles.fileName}>Archivo seleccionado: {cvFile.split('/').pop()}</Text>
          <TouchableOpacity style = {styles.clearButton} onPress = {() => setCvFile(null)}>
            <Text style = {styles.clearButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    marginTop: 30,
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
});