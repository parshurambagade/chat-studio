import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Image,
  Alert,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import {  DEFAULT_IMAGE_URL } from "../constants";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import {API_ENDPOINT} from '@env';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");

  const {token, setToken, setUserId} = useContext(AuthContext);

  useEffect(() => {
    if(token){
      navigation.replace("MainStack", {screen: "Main"}  )
    }
  }, [token, navigation])

  const handleRegister =  async () => {
    try{
    // Place your Register logic here
    if (email && password && username && image) {

      const response = await axios.post(`${API_ENDPOINT}/register`, {
        username: username,
        password: password,
        email: email,
        image: image
      });

     
      console.log(`Response: ${response.data}`);
      const token = response?.data?.token;
      const storedToken = await AsyncStorage.setItem("authToken", JSON.stringify(token));
      const {userId} = jwtDecode(token)
      const storedUserId = await AsyncStorage.setItem("userId", JSON.stringify(userId));

      setUserId(storedUserId);
      setToken(storedToken);
      Alert.alert("Account created!");
      setUsername("");
      setEmail("");
      setPassword("");
      setImage("");
      
    } 
  }catch(e){
    console.error(e);
  };
}
  return (
    <SafeAreaView className="flex flex-1 justify-center p-6">
      <KeyboardAvoidingView>
        <View>
          <Text className="text-center text-2xl mb-8 text-gray-900">Register</Text>
          <View>
          <View className="justify-center items-center mt-4 mb-8" >
            <Image
              className="w-24 h-24 rounded-full"
              source={{
                uri: `${image.length ? image : DEFAULT_IMAGE_URL}`,
              }}
            />
            {/* <Text style={{backgroundColor: "black",textAlign: "center", color: "gray", marginTop: 4, fontSize: 12}}>Add</Text> */}
          </View>
          </View>

          <TextInput
           className="border-none border-b text-gray-800 border-gray-300 pb-2 mb-6 mt-2 px-2"
            placeholder="Username"
            placeholderTextColor="#a0a0a0"
            onChangeText={(text) => setUsername(text)}
            value={username}
          />
          {/* <TextInput
            className="border-none border-b text-gray-800 border-gray-300 pb-2 mb-6 mt-2 px-2"
            placeholder="Profile picture"
            placeholderTextColor="#a0a0a0"
            onChangeText={(text) => setImage(text)}
            value={image}
          /> */}
          <TextInput
             className="border-none border-b text-gray-800 border-gray-300 pb-2 mb-6 mt-2 px-2"
            placeholder="Email"
            placeholderTextColor="#a0a0a0"
            keyboardType="email-address"
            onChangeText={(text) => setEmail(text)}
            value={email}
          />
          <TextInput
             className="border-none border-b text-gray-800 border-gray-300 pb-2 mb-6 mt-2 px-2"
            placeholder="Password"
            placeholderTextColor="#a0a0a0"
            secureTextEntry
            onChangeText={(text) => setPassword(text)}
            value={password}
          />
          <Pressable
            onPress={handleRegister}
            className="bg-blue-900 px-4 py-3 rounded-lg shadow-md">
            <Text className="text-white text-center">Register</Text></Pressable>

          <Pressable
            className="justify-center items-center mt-8"
            onPress={() => navigation.navigate("Login")}
          >
            <Text className="text-gray-600">Already have account? login here!</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};



export default RegisterScreen;