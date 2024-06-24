import axios from "axios";
import React, { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
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
    <SafeAreaView className="flex flex-1 justify-center p-6">
      <KeyboardAvoidingView>
        <View>
          <Text className="text-center text-2xl mb-8">Login</Text>
          <TextInput
            className="border-none border-b border-gray-300 pb-2 mb-6 mt-2 px-2"
            placeholder="Email"
            keyboardType="email-address"
            onChangeText={(text) => setEmail(text)}
            value={email}
          />
          <TextInput
            className="border-none border-b border-gray-300 pb-2 mb-6 mt-2 px-2"
            placeholder="Password"
            secureTextEntry
            onChangeText={(text) => setPassword(text)}
            value={password}
          />
          <Pressable onPress={handleLogin} className="bg-blue-900 px-4 py-3 rounded-lg shadow-md">
            <Text className="text-white text-center">
              Login
            </Text>
          </Pressable>

          <Pressable
            className="justify-center items-center mt-8"
            onPress={() => navigation.navigate("Register")}
          >
            <Text>New here? Create account!</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
