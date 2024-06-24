import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Image,
  Alert,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { DEFAULT_IMAGE_URL } from "../constants";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");

  const handleRegister =  async () => {
    try{
    // Place your Register logic here
    if (email && password && username && image) {
      const response = await axios.post("http://192.168.1.13:5000/register", {
        username: username,
        password: password,
        email: email,
        image: image
      });
      // console.log(`token: ${JSON.stringify(response.data) }`);
      await AsyncStorage.setItem("token", response?.data?.token);
      Alert.alert("Account created!");
      setUsername("");
      setEmail("");
      setPassword("");
      setImage("");
      
    } 
  }catch(e){
    console.error(e?.message);
  };
}
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView>
        <View>
          <Text style={styles.title}>Register</Text>
          <View>
          <Pressable style={styles.proileImgContainer}>
            <Image
              style={styles.profileImg}
              source={{
                uri: image ? image : DEFAULT_IMAGE_URL,
              }}
            />
            <Text style={{backgroundColor: "black",textAlign: "center", color: "gray", marginTop: 4, fontSize: 12}}>Add</Text>
          </Pressable>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Username"
            onChangeText={(text) => setUsername(text)}
            value={username}
          />
          <TextInput
            style={styles.input}
            placeholder="Profile picture"
            onChangeText={(text) => setImage(text)}
            value={image}
          />
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
          <Pressable
            onPress={handleRegister}
            style={styles.button}
          >
            <Text style={{color:"white", textAlign: "center"}}>Register</Text></Pressable>

          <Pressable
            style={styles.signupLink}
            onPress={() => navigation.navigate("Login")}
          >
            <Text>Already have account? login here!</Text>
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
  proileImgContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 48,
    padding:4,
  },
  profileImg: {
    height: 50,
    width: 50,
    borderRadius: 25,
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
    padding:14,
    backgroundColor: '#2C549F',
  },

  signupLink: {
    marginTop: 20,
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RegisterScreen;
