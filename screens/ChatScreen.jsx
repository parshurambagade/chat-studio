import React, { useEffect } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PeopleContainer from "../components/PeopleContainer";
import axios from "axios";
import { API_ENDPOINT } from "@env";
import { useSocketContext } from "../context/SocketContext.js";
import { useUserContext } from "../context/UserContext.js";
import { useAuthContext } from "../context/AuthContext.jsx";
import { useNavigation } from "@react-navigation/native";

const ChatScreen = () => {
  const { setUserId, token, setToken, userId } = useAuthContext();
  const { setMessages, messages } = useUserContext();
  const { socket } = useSocketContext();

  const navigation = useNavigation();

  useEffect(() => {
    fetchUserMessages();
  }, [userId]);

  useEffect(() => {
    socket?.emit("messages-received", { data: messages });
  }, [messages]);

  const fetchUserMessages = async () => {
    try {
      if (!userId) return;
      const response = await axios.get(`${API_ENDPOINT}userMessages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userId");
      setToken("");
      setUserId("");
      Alert.alert("Logout successful!");
    } catch (e) {
      console.error(e.message);
    }
  };

  return (
    <SafeAreaView className=" flex bg-gray-200 ">
      {/* HEADER SECTION */}
      <View className="px-6 py-4 flex flex-row items-center justify-between bg-[#111827]">
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
          <Icon name="camera-outline" size={26} color="#c0c5c5" />
          <Pressable onPress={() => navigation.navigate("People")}>
            <Icon name="people-outline" size={26} color="#c0c5c5" />
          </Pressable>
        </View>
      </View>

      <View className="flex justify-between flex-col bg-gray-200 h-[85vh]">
        <View className="mx-4 h-1/2 flex-row justify-between  mt-4">
          <Text className="text-base text-gray-700">Chats</Text>
          <Icon name="chevron-down" size={22} color="gray" />
        </View>

        <PeopleContainer />
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;
