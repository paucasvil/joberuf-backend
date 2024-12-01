import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Modal, Text, Linking } from 'react-native';
import { useRouter, Link } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HeaderComponent() {
  const logoBW = require('../components/img/LogoBW.png');
  const router = useRouter();
  
  // Estado para mostrar el modal
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Función para abrir el enlace
  const openTechessWebsite = () => {
    Linking.openURL('https://pagina-web-azure.vercel.app/index.html');
  };

  return (
    <View style={styles.headerContainer}>
      {/* Botón para regresar */}
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back-circle" size={24} color="#6d6d6d" style={styles.icon} />
      </TouchableOpacity>

      {/* Logo */}
      <Image source={logoBW} style={styles.logo} />

      {/* Botón para "Acerca de" */}
      <TouchableOpacity onPress={() => setIsModalVisible(true)}>
        <Ionicons name="information-circle" size={24} color="#6d6d6d" style={styles.icon} />
      </TouchableOpacity>

      {/* Modal de Acerca de */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Acerca de</Text>
            <Text style={styles.modalText}>Joberuf V1.0</Text>
            <Text style={styles.modalText}>Desarrollado por: Techess Code</Text>
            <Text
              style={styles.modalLink}
              onPress={openTechessWebsite}
            >
              Visita nuestro sitio web
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    height: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 15,
  },
  logo: {
    width: 96,
    height: 24,
  },
  icon: {
    padding: 10,
  },
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro con opacidad
  },
  modalContent: {
    width: 300,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalLink: {
    fontSize: 16,
    color: '#0066cc', // Color azul para el enlace
    marginBottom: 15,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  closeButton: {
    backgroundColor: '#39e991',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
