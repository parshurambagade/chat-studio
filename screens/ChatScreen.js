import { Alert, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect } from "react";
import { authContext } from "../context/authContext";
import { Feather, FontAwesome6 } from "@expo/vector-icons";
import { SimpleLineIcons } from "@expo/vector-icons";

import AsyncStorage from '@react-native-async-storage/async-storage';
import PeopleContainer from "../components/PeopleContainer";
import axios from "axios";
import { API_ENDPOINT } from '@env';
import { userContext } from "../context/userContext";
import { useSocketContext } from "../context/socketContext";

export default function ChatScreen({navigation}) {
  const { setUserId, token, setToken, userId } = useContext(authContext);
  const { setMessages, messages} = useContext(userContext);
  const {socket} = useSocketContext();
  useEffect(() => {
    fetchUserMessages();
  }, [userId])

  useEffect(() => {
    // Emit an event to update the message status to 'delivered'
    socket?.emit('messages-received', { data: messages });
  },[messages])

  const fetchUserMessages = async () => {
    try {
      if (!userId) return;
      const response = await axios.get(`${API_ENDPOINT}/userMessages/${userId}`);
      setMessages(response.data);
      
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

    const handleLogout = async () => {
        try{
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("userId");
        setToken("");
        setUserId("");
        // console.log("authToken from logout", AsyncStorage.getItem("authToken"));
        Alert.alert("Logout successful!");
        }catch(e){
            console.error(e.message);
        }
    }

  return (
    <SafeAreaView className="px-6 my-12 flex">

      <View className="flex flex-row items-center justify-between">
        <View>
            <Pressable onPress={handleLogout}>
          <Image
            source={{
              uri: "https://media.istockphoto.com/id/1138008134/photo/indian-man-headshot.jpg?s=2048x2048&w=is&k=20&c=dr92Z0DpohmRqf1-xgq8NiTMeFR_d9fLorGUctLGrwI=",
            }}
            className="h-10 w-10 rounded-full"
          />
          </Pressable>
        </View>

        <View>
          <Text className="font-semibold text-lg">Chats</Text>
        </View>

        <View className="flex flex-row gap-6 items-center justify-between">
          <Feather name="camera" size={24} color="black" />
          <Pressable onPress={() => navigation.navigate('People') }>
          <SimpleLineIcons name="people" size={24} color="black" />
          </Pressable>
        </View>
      </View>

      <View className="flex flex-row justify-between  mt-4 pt-4 h-80">
        <Text className="text-base">Chats</Text>
        <FontAwesome6 name="angle-down" size={22} color="black" />
      </View>
          
      <PeopleContainer />
      
    </SafeAreaView>
  );
}
