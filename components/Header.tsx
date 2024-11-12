import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HeaderComponent() {
  const logoBW = require('../components/img/LogoBW.png');

  const router = useRouter();

  return (
    <View style = {styles.headerContainer}>
      {/* Botón para regresar */}
      <TouchableOpacity onPress = {() => router.back()}>
        <Ionicons name = 'arrow-back-circle' size = {24} color = '#6d6d6d' style = {styles.icon} />
      </TouchableOpacity>
      
      {/* Logo */}
      <Image source = {logoBW} style = {styles.logo} />
      
      {/* Botón para "Techess Code" */}
      <Link href = '/Signup' asChild>
        <TouchableOpacity>
          <Ionicons name = 'information-circle' size = {24} color = '#6d6d6d' style = {styles.icon} />
        </TouchableOpacity>
      </Link>
      
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
});