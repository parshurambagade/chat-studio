import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AuthContext, useAuthContext } from "../context/AuthContext.jsx";
import { jwtDecode } from "jwt-decode";
import { useNavigation } from "@react-navigation/native";
import { API_ENDPOINT } from "@env";

const LoginScreen = () => {
  const { token, setToken, userId, setUserId } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const navigation = useNavigation();

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem("authToken");
      if(typeof storedToken == 'string'){
        setToken(storedToken);
      }
    };
    fetchToken();
  }, []);
  
  const fetchUser = async () => {
    // await AsyncStorage.removeItem("authToken");
    // await AsyncStorage.removeItem("userId");
    //console.log('Token in login screen', await AsyncStorage.getItem("authToken"));

    if (token) {
      // console.log("Token in login screen", token);
      navigation.navigate("MainStack", { screen: "Main" });
    } else {
      console.log("Token not found in login screen");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token, navigation]);

  useEffect(() => {
    console.log(`Token in LoginScreen: ${token}`);
  }, [token]);

  useEffect(() => {
    console.log(`UserId in LoginScreen: ${userId}`);
  }, [userId]);

  const handleLogin = async () => {
    try {
      if (email && password) {
        const response = await axios.post(`${API_ENDPOINT}login`, {
          email: email,
          password: password,
        });
        console.log(`Response in handleLogin: ${JSON.stringify(response.data)}`);
        const token = response?.data?.token;
        console.log("Token in handleLogin: ", token, " type of setToken: ", typeof setToken);
        //setting authToken and update in context
        await AsyncStorage.setItem("authToken", JSON.stringify(token));
        const storedToken = await AsyncStorage.getItem("authToken");
        // console.log(typeof storedToken, storedToken);
       setToken(storedToken);
        // console.log(`Token from handleLogin: ${storedToken}`);

        const { userId } = jwtDecode(token);
        // console.log("Login userId decoded:", userId.toString());
        await AsyncStorage.setItem("userId", userId.toString());
        const storedUserId = await AsyncStorage.getItem("userId");
        setUserId(storedUserId);
        // console.log("stored userId:", storedUserId);

        Alert.alert("Login successful!");
        setEmail("");
        setPassword("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView className="flex flex-1 justify-center p-6">
      <KeyboardAvoidingView>
        <View>
          <Text className="text-center text-2xl mb-8 text-gray-900">Login</Text>
          <TextInput
            className="border-none border-b border-gray-300 text-gray-800 pb-2 mb-6 mt-2 px-2"
            placeholder="Email"
            placeholderTextColor="#a0a0a0"
            keyboardType="email-address"
            onChangeText={(text) => setEmail(text)}
            value={email}
          />
          <TextInput
            className="border-none border-b border-gray-300 text-gray-800 pb-2 mb-6 mt-2 px-2"
            placeholder="Password"
            placeholderTextColor="#a0a0a0"
            secureTextEntry
            onChangeText={(text) => setPassword(text)}
            value={password}
          />
          <Pressable
            onPress={handleLogin}
            className="bg-blue-900 px-4 py-3 rounded-lg shadow-md"
          >
            <Text className="text-white text-center">Login</Text>
          </Pressable>

          <Pressable
            className="justify-center items-center mt-8"
            onPress={() => navigation.navigate("Register")}
          >
            <Text className="text-center text-gray-600">New here? Create account!</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
