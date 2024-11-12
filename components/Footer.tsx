import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Link } from 'expo-router';

export default function FooterComponent() {
  const home = require('../components/img/Home.png');
  const person = require('../components/img/Person.png');
  const logout = require('../components/img/LogOut.png');

  return (
    <View style = {styles.footerContainer}>
        <Link href = '/Menu' asChild>
          <TouchableOpacity>
            <Image source = {home} style = {styles.footerIcon} />
          </TouchableOpacity>
        </Link>
        
        <Link href = '/Profile' asChild>
          <TouchableOpacity>
            <Image source = {person} style = {styles.footerIcon} />
          </TouchableOpacity>
        </Link>

        <Link href = '/Login' asChild>
          <TouchableOpacity>
            <Image source = {logout} style = {styles.footerIcon} />
          </TouchableOpacity>
        </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#ffffff',
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    bottom: 0,
    paddingVertical: 20,
    position: 'absolute',
  },
  footerIcon: {
    width: 28,
    height: 28,
  },
});