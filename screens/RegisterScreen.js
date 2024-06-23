import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Pressable } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

const RegisterScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    // Place your Register logic here
    if (email === 'user@example.com' && password === 'password') {
      Alert.alert('Register Successful');
    } else {
      Alert.alert('Invalid Email or Password');
    }
  };

  return (
  <View style={styles.container}>
  <Text style={styles.title}>Register</Text>
    <TextInput
      style={styles.input}
      placeholder="Username"
      onChangeText={text => setUsername(text)}
      value={username}
    />
    <TextInput
      style={styles.input}
      placeholder="Email"
      keyboardType="email-address"
      onChangeText={text => setEmail(text)}
      value={email}
    />
    <TextInput
      style={styles.input}
      placeholder="Password"
      secureTextEntry
      onChangeText={text => setPassword(text)}
      value={password}
    />
    <Button title="Register" onPress={handleRegister} style={styles.button} />
  
    <Pressable style={styles.signupLink} onPress={() => navigation.navigate("Login")}>
    <Text>Already have account? login here!</Text>
    </Pressable>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#c0c5c5',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 6
  },

  button: {
    borderRadius: 6,
  },

  signupLink: {
    marginTop:20,
    // flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default RegisterScreen;
