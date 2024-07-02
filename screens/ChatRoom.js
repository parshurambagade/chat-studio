import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
} from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { authContext } from "../context/authContext";
import { useRoute } from "@react-navigation/native";
import { Entypo, Ionicons, Feather, FontAwesome6 } from "@expo/vector-icons";
import axios from "axios";
import { useSocketContext } from "../context/socketContext";
import { API_ENDPOINT } from "@env";

const ChatRoom = ({ navigation }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [deliveredMessages, setDeliveredMessages] = useState([]);
  const { userId } = useContext(authContext);
  const { socket } = useSocketContext();
  const route = useRoute();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.goBack()}
          className="flex-row items-center gap-2.5"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
          <View>
            <Text>{route?.params?.name}</Text>
          </View>
        </Pressable>
      ),
    });
  }, [navigation, route?.params?.name]);

  useEffect(() => {
    console.log("Emmiting messages-seen");
    if (!deliveredMessages.length) {
      console.log("deliveredMessages is empty!");
      return;
    }

    socket.emit("messages-seen", { data: deliveredMessages });
  }, [deliveredMessages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const senderId = userId;
        const receiverId = route?.params?.receiverId;
        const response = await axios.get(`${API_ENDPOINT}/messages`, {
          params: { senderId, receiverId },
        });

        const fetchedMessages = response.data.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(fetchedMessages);

        // Only emit messages-seen if the current user is the receiver
        if (
          fetchedMessages.some(
            (msg) => msg.receiver_id == userId && msg.status == "delivered"
          )
        ) {
          const result = fetchedMessages.filter(
            (msg) => msg.receiver_id == userId && msg.status == "delivered"
          );
          console.log("Delivered Messages:", result);
          setDeliveredMessages(result);
        }
      } catch (error) {
        console.error("Error", error);
      }
    };

    fetchMessages();
  }, [route?.params?.receiverId, userId, socket]);

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      setMessages((prevMessages) =>
        [...prevMessages, newMessage].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        )
      );
    };

    if (socket) {
      socket.on("newMessage", handleNewMessage);
    }

    return () => {
      if (socket) {
        socket.off("newMessage", handleNewMessage);
      }
    };
  }, [socket]);

  useEffect(() => {
    const handleMessagesSeen = (updatedMessages) => {
      console.log("Handling messages-seen event");
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          updatedMessages.includes(msg.id) ? { ...msg, status: "seen" } : msg
        )
      );
    };

    if (socket) {
      socket.on("messages-seen", handleMessagesSeen);
    }

    return () => {
      if (socket) {
        socket.off("messages-seen", handleMessagesSeen);
      }
    };
  }, [socket]);

  const sendMessage = async (senderId, receiverId) => {
    try {
      if (!senderId || !receiverId || !message.trim()) return;

      const newMessage = {
        sender_id: senderId,
        receiver_id: receiverId,
        message: message,
        timestamp: new Date().toISOString(),
        status: "sent",
      };

      setMessages((prevMessages) =>
        [...prevMessages, newMessage].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        )
      );

      socket.emit("sendMessage", { senderId, receiverId, message });

      setMessage("");
    } catch (error) {
      console.error("Error", error);
    }
  };

  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };

  return (
    <KeyboardAvoidingView className="flex flex-1 bg-white" behavior="padding">
      <ScrollView className="bg-slate-50">
        {Array.isArray(messages) &&
          messages.map((item, index) => (
            <Pressable
              style={[
                item?.sender_id == userId
                  ? {
                      alignSelf: "flex-end",
                      backgroundColor: "#DCF8C6",
                      padding: 8,
                      maxWidth: "60%",
                      borderRadius: 7,
                      margin: 10,
                    }
                  : {
                      alignSelf: "flex-start",
                      backgroundColor: "white",
                      padding: 8,
                      margin: 10,
                      borderRadius: 7,
                      maxWidth: "60%",
                    },
              ]}
              key={index}
            >
              <Text className="text-xs text-left">{item?.message}</Text>
              <View className="flex flex-row gap-6 justify-between">
                <Text className="text-right text-[9px] text-gray-400 mt-1">
                  {formatTime(item?.timestamp)}
                </Text>
                {item?.sender_id == userId &&
                  (item?.status == "sent" ? (
                    <Text className="text-right text-[9px] text-gray-400 mt-1">
                      <FontAwesome6 name="check" />
                    </Text>
                  ) : item?.status == "delivered" ? (
                    <Text className="text-right text-[9px] text-gray-400 mt-1">
                      <FontAwesome6 name="check-double" />{" "}
                    </Text>
                  ) : (
                    <Text className="text-right text-[9px] text-gray-400 mt-1">
                      <FontAwesome6 name="check-double" color="blue" size={9} />
                    </Text>
                  ))}
              </View>
            </Pressable>
          ))}
      </ScrollView>
      <View className="bg-white flex-row items-center p-2.5 border-t border-t-gray-300 mb-5">
        <Entypo name="emoji-happy" size={24} color="black" />
        <TextInput
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          className="flex-1 h-10 border border-gray-300 rounded-2xl px-2.5 ml-2.5"
        />
        <View className="flex-row items-center gap-2 mx-2">
          <Feather name="camera" size={24} color="black" />
          <Feather name="mic" size={24} color="black" />
        </View>
        <Pressable
          onPress={() => sendMessage(userId, route?.params?.receiverId)}
          className="bg-blue-900 px-3 py-2 rounded-2xl"
        >
          <Text className="text-center text-white">Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoom;
