import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import * as Progress from 'react-native-progress';
import { Link } from 'expo-router';

export default function PlanJoberufScreen() {
  const fotoPerfil = require('../components/img/FotoPerfil.jpg');
  const cv = require('../components/img/CV.png');
  const message = require('../components/img/Message.png');

  return (
    <View style = {styles.backgroundContainer}>
      <ScrollView contentContainerStyle = {styles.scrollContainer}>

        {/* Encabezado */}
        <Image source = {fotoPerfil} style = {styles.profileImage} />
        <View style = {styles.titleContainer}>
          <Text style = {styles.title}>Bienvenido,</Text>
          <Text style = {styles.subtitle}>Maximiza tu potencial</Text>
        </View>

        {/* Programa de mejora de habilidades */}
        <View style = {styles.programContainer}>
        <Text style = {styles.programTitle}>Programa de mejora de habilidades</Text>
          <View style = {styles.skillContainer}>
            <Text style = {styles.skillText}>Certificación en progreso</Text>
            <Text style = {styles.progressText}>Certificaciones en curso: 3</Text>
            <Progress.Bar
              style = {styles.progressBarContainer}
              width = {null}
              height = {8}
              color = '#9300da'
              borderRadius = {6}
              progress = {0.7}
              borderWidth = {0}
              unfilledColor = '#f2f2f2'
            />
          </View>

          <View style = {styles.skillContainer}>
            <Text style = {styles.skillText}>Formación en habilidades blandas</Text>
            <Text style = {styles.progressText}>45% completado</Text>
            <Progress.Bar
              style = {styles.progressBarContainer}
              width = {null}
              height = {8}
              color = '#c141ff'
              borderRadius = {6}
              progress = {0.45}
              borderWidth = {0}
              unfilledColor = '#f2f2f2'
            />
          </View>

          <View style = {styles.skillContainer}>
            <Text style = {styles.skillText}>Desarrollo de habilidades técnicas</Text>
            <Text style = {styles.progressText}>60% completado</Text>
            <Progress.Bar
              style = {styles.progressBarContainer}
              width = {null}
              height = {8}
              color = '#9300da'
              borderRadius = {6}
              progress = {0.6}
              borderWidth = {0}
              unfilledColor = '#f2f2f2'
            />
          </View>

          <View style = {styles.skillContainer}>
            <Text style = {styles.skillText}>Enfoque de crecimiento profesional</Text>
            <Text style = {styles.progressText}>20% mejora</Text>
            <Progress.Bar
              style = {styles.progressBarContainer}
              width = {null}
              height = {8}
              color = '#c141ff'
              borderRadius = {6}
              progress = {0.2}
              borderWidth = {0}
              unfilledColor = '#f2f2f2'
            />
          </View>
        </View>

        {/* Botones */}
        <Link href = '/Curriculum' asChild>
          <TouchableOpacity style = {styles.buttonCV}>
            <Image source = {cv} style = {styles.icon} />
            <Text style = {styles.buttonText}>Optimizar curriculum</Text>
          </TouchableOpacity>
        </Link>

        <Link href = '/Chat' asChild>
          <TouchableOpacity style = {styles.buttonInterview}>
            <Image source = {message} style = {styles.icon} />
            <Text style = {styles.buttonText}>Chatbot de entrevista</Text>
          </TouchableOpacity>
        </Link>
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
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 100,
  },
  titleContainer: {
    backgroundColor: '#ffffff',
    marginLeft: 80,
    marginTop: -50,
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#030303',
  },
  subtitle: {
    fontSize: 16,
    color: '#030303',
  },
  programContainer: {
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 24,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  programTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  skillText: {
    fontSize: 14,
    color: '#030303',
  },
  progressText: {
    fontSize: 13,
    color: '#030303',
    marginBottom: 5,
  },
  skillContainer: {
    width: '100%',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 10,
  },
  buttonCV: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#39e991',
    padding: 15,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonInterview: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#39e991',
    padding: 15,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  row:{
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
});