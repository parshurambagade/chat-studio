import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
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
import Ionicons from '@expo/vector-icons/Ionicons';
import { authContext } from "../context/authContext";
import { jwtDecode } from "jwt-decode";
import { useNavigation } from "@react-navigation/native";
import { API_ENDPOINT } from "../constants";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {token, setToken, userId, setUserId} = useContext(authContext);

  const navigation = useNavigation();

  const fetchUser = async () => {
    if(token) {
      navigation.navigate('MainStack', {screen: 'Main'});
    }
    }

  useEffect(() => {
    fetchUser();
  }, [token, navigation])

  // useEffect(() => {
  //   console.log(`Token in LoginScreen: ${token}`);
  // },[token]);

  // useEffect(() => {
  //   console.log(`UserId in LoginScreen: ${userId}`);
  // },[userId]);
 
  const handleLogin = async () => {
    try{
      if(email && password){
        const response = await axios.post(`${API_ENDPOINT}/login`, {
          email: email,
          password: password,
        });
        // console.log(`Response in handleLogin: ${JSON.stringify(response.data)}`);
        const token = response?.data?.token;

        //setting authToken and update in context
        await AsyncStorage.setItem("authToken", token.toString());
        const storedToken = await AsyncStorage.getItem("authToken");
        setToken(storedToken);
        // console.log(`Token from handleLogin: ${token}`);

        const {userId} = jwtDecode(token);
        // console.log("Login userId decoded:", userId.toString());
        await AsyncStorage.setItem("userId", userId.toString());
        const storedUserId = await AsyncStorage.getItem("userId");
        setUserId(storedUserId);
        // console.log("stored userId:", storedUserId);

  
        Alert.alert("Login successful!");
      setEmail("");
      setPassword("");
      
      }
    }catch(e){
      console.error(e);
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
