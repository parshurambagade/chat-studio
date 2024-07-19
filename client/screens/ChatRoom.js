import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
} from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { useSocketContext } from "../context/SocketContext";
import { API_ENDPOINT } from "@env";

const ChatRoom = ({ navigation }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [deliveredMessages, setDeliveredMessages] = useState([]);
  const { userId } = useContext(AuthContext);
  const { socket } = useSocketContext();
  const route = useRoute();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View className="flex flex-row justify-between w-full px-4 ">
          <Pressable
            onPress={() => navigation.goBack()}
            className="flex-row items-center"
          >
            <Icon name="arrow-back" size={20} color="black" />
          </Pressable>
          <View className="">
            <Text className="text-slate-800">{route?.params?.name}</Text>
          </View>

          <View className="flex flex-row gap-6 ">
            <Icon name="call-outline" size={24} color="black" />
            <Icon name="videocam-outline" size={24} color="black" />
          </View>
        </View>
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
        const response = await axios.get(`${API_ENDPOINT}messages`, {
          params: { senderId, receiverId },
        });

        const fetchedMessages = response.data.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
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
    const handleNewMessage = async (newMessage) => {
      console.log("New Message Received:", newMessage, "userid is: ", userId); // Debugging log
  
      if (newMessage.receiver_id == userId) {
        console.log("Emmiting new-message-seen event!");
        await socket.emit("new-message-seen", { messageId: newMessage.id });
      }
  
      setMessages((prevMessages) => {
        // Check if the message already exists
        if (!prevMessages.some((msg) => msg.id === newMessage.id)) {
          const updatedMessages = [...prevMessages, newMessage].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
  
          return updatedMessages;
        }
        return prevMessages;
      });
    };
  
    if (socket) {
      socket.on("newMessage", handleNewMessage);
    }
  
    return () => {
      if (socket) {
        socket.off("newMessage", handleNewMessage);
      }
    };
  }, [socket, userId]);
  

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

  useEffect(() => {
    const handleNewMessageSeen = (messageId) => {
      console.log("Handling new-message-seen event");
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          messageId == (msg.id) ? { ...msg, status: "seen" } : msg
        )
      );
    };

    if (socket) {
      socket.on("new-message-seen", handleNewMessageSeen);
    }

    return () => {
      if (socket) {
        socket.off("new-message-seen", handleNewMessageSeen);
      }
    };
  }, [socket]);

  useEffect(() => {
    const handleNewMessageDelivered = (messageId) => {
      console.log("Handling new-message-delivered event");
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          messageId == (msg.id) ? { ...msg, status: "delivered" } : msg
        )
      );
    };


    if (socket) {
      socket.on("new-message-delivered", handleNewMessageDelivered);
    }

    return () => {
      if (socket) {
        socket.off("new-message-delivered", handleNewMessageDelivered);
      }
    };
  }, [socket, userId]);

  const sendMessage = async (senderId, receiverId) => {
    try {
      if (!senderId || !receiverId || !message.trim()) return;

      const newMessage = {
        sender_id: senderId,
        receiver_id: receiverId,
        message: message,
        created_at: new Date().toISOString(),
      };

      // setMessages((prevMessages) =>
      //   [...prevMessages, newMessage].sort(
      //     (a, b) => new Date(a.created_at) - new Date(b.created_at)
      //   )
      // );

      socket.emit("sendMessage", {
        senderId,
        receiverId,
        message: newMessage.message,
      });

      setMessage("");
    } catch (error) {
      console.error("Error", error);
    }
  };

  const formatTime = (time) => {
    // console.log("Time to format:", time);
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };

  return (
    <KeyboardAvoidingView className="flex flex-1 bg-white" behavior="padding">
      <ScrollView className="bg-gray-100">
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
              <Text className="text-xs text-left text-gray-800">
                {item?.message}
              </Text>
              <View className="flex flex-row gap-6 justify-between">
                <Text className="text-right text-[9px] text-gray-400 mt-1">
                  {formatTime(item?.created_at)}
                </Text>
                {item?.sender_id == userId &&
                  (item?.status == "seen" ? (
                    <Text className="text-right text-gray-400 mt-1">
                      <Icon name="checkmark-done" color="blue" size={14} />
                    </Text>
                  ) : item?.status == "delivered" ? (
                    <Text className="text-right t text-gray-400 mt-1">
                      <Icon name="checkmark-done" size={14} />
                    </Text>
                  ) : (
                    <Text className="text-right text-gray-400 mt-1">
                      <Icon name="checkmark" size={14} />
                    </Text>
                  ))}
              </View>
            </Pressable>
          ))}
      </ScrollView>
      <View className="bg-white flex-row items-center px-3 py-2.5 border-t border-t-gray-300 mb-2">
        <Icon name="happy-outline" size={24} color="black" />
        <TextInput
          placeholder="Type your message..."
          placeholderTextColor="#c0c5c5"
          value={message}
          onChangeText={setMessage}
          className="flex-1 h-10 border border-gray-300 rounded-2xl px-2.5 mx-3 text-gray-800"
        />
        {/* <View className="flex-row items-center gap-2 mx-2">
          <Icon name="camera-outline" size={24} color="black" />
          <Icon name="mic-outline" size={24} color="black" />
        </View> */}
        <Pressable
          onPress={() => sendMessage(userId, route?.params?.receiverId)}
          className=" py-2 rounded-2xl"
        >
          <Icon color="blue" size={24} name="send" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoom;
