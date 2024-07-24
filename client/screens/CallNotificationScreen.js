import React from "react";
import { SafeAreaView, View, Text, Pressable, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { useSocketContext } from "../context/SocketContext";
import { DEFAULT_IMAGE_URL } from "../constants";

const CallNotificationScreen = ({ route }) => {
  const { callerId, callerName } = route.params;
  const navigation = useNavigation();
  const { socket } = useSocketContext();

  const handleAccept = () => {
    socket.emit("call-accepted", { callerId });
    navigation.navigate("VideoCallScreen", { callerId });
  };

  const handleReject = () => {
    socket.emit("call-rejected", { callerId });
    navigation.goBack();
  };

  return (
    <SafeAreaView className="justify-between items-center flex-1 flex px-8">
      <View className="my-8 flex flex-col gap-12 items-center justify-center p-8">
        <Image
          source={{ uri: DEFAULT_IMAGE_URL }}
          className="w-40 h-40 rounded-full"
        />
        <Text className="text-2xl text-black text-center">
          {callerName} is calling...
        </Text>
      </View>
      <View className="flex flex-row my-12 justify-between w-full px-8">
        <Pressable
          onPress={handleAccept}
          className="bg-green-600 p-4 rounded-full"
        >
          <Icon name="call" size={40} color="white" />
        </Pressable>
        <Pressable
          onPress={handleReject}
          className="bg-red-600 p-4 rounded-full"
        >
          <Icon name="call" size={40} color="white" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default CallNotificationScreen;
