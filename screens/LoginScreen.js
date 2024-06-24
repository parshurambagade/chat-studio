import axios from "axios";
import React, { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try{
      if(email && password){
        const response = await axios.post("http://192.168.1.13:5000/login", {
          email: email,
          password: password,
        });
        await AsyncStorage.setItem("token", response?.data?.token);
        Alert.alert("Login successful!");
      setEmail("");
      setPassword("");
      
      }
    }catch(e){
      console.error(e?.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView>
        <View>
          <Text style={styles.title}>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            onChangeText={(text) => setEmail(text)}
            value={email}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            onChangeText={(text) => setPassword(text)}
            value={password}
          />
          <Pressable onPress={handleLogin} style={styles.button}>
            <Text style={{ color: "white", textAlign: "center" }}>
              Login
            </Text>
          </Pressable>

          <Pressable
            style={styles.signupLink}
            onPress={() => navigation.navigate("Register")}
          >
            <Text>New here? Create account!</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#c0c5c5",
    marginBottom: 28,
    paddingBottom: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  button: {
    borderRadius: 6,
    padding: 14,
    backgroundColor: "#2C549F",
  },

  signupLink: {
    marginTop: 20,
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginScreen;
