import React from 'react';
import { SafeAreaView, View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSocketContext } from '../context/SocketContext';

const CallNotificationScreen = ({ route }) => {
  const { callerId, callerName } = route.params;
  const navigation = useNavigation();
  const { socket } = useSocketContext();

  const handleAccept = () => {
    socket.emit('call-accepted', { callerId });
    navigation.navigate('VideoCallScreen', { callerId });
  };

  const handleReject = () => {
    socket.emit('call-rejected', { callerId });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{callerName} is calling...</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10 }}>
        <Pressable onPress={handleAccept}>
          <Icon name="call" size={24} color="green" />
        </Pressable>
        <Pressable onPress={handleReject}>
          <Icon name="call" size={24} color="red" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default CallNotificationScreen;
