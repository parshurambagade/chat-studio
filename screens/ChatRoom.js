import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    KeyboardAvoidingView,
  } from 'react-native';
  import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
  import { authContext } from "../context/authContext";
  import {useNavigation, useRoute} from '@react-navigation/native';
  import { Entypo, Ionicons } from '@expo/vector-icons';
  import { Feather } from '@expo/vector-icons';
  import axios from 'axios';
  import {useSocketContext} from '../context/socketContext';
  
  const ChatRoom = ({navigation}) => {

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const {token, userId, setToken, setUserId} = useContext(authContext);
    const {socket} = useSocketContext();
    const route = useRoute();
    useLayoutEffect(() => {
      return navigation.setOptions({
        headerTitle: '',
        headerLeft: () => (
          <View className="flex-row items-center gap-2.5">
            <Ionicons name="arrow-back" size={24} color="black" />
            <View>
              <Text>{route?.params?.name}</Text>
            </View>
          </View>
        ),
      });
    }, []);

    const listeMessages = () => {
      const {socket} = useSocketContext();
  
      useEffect(() => {
        socket?.on('newMessage', newMessage => {
          newMessage.shouldShake = true;
          setMessages([...messages, newMessage]);
        });
  
        return () => socket?.off('newMessage');
      }, [socket, messages, setMessages]);
    };
  
    listeMessages();

    const sendMessage = async (senderId, receiverId) => {
      try {
        await axios.post('http://192.168.1.13:5000/sendMessage', {
          senderId,
          receiverId,
          message,
        });
  
        socket?.emit('sendMessage', {senderId, receiverId, message});
  
        setMessage('');
  
        setTimeout(() => {
          fetchMessages();
        }, 100);
      } catch (error) {
        console.log('Error', error);
      }
    };
    const fetchMessages = async () => {
      try {
        const senderId = userId;
        const receiverId = route?.params?.receiverId;
        console.log(`Receiver Id from fetchMessages: ${receiverId}`);
        const response = await axios.get('http://192.168.1.13:5000/messages', {
          params: {senderId, receiverId},
        });
  
        setMessages(response.data[0]);
      } catch (error) {
        console.log('Error', error);
      }
    };
    useEffect(() => {
      fetchMessages();
    }, []);

    console.log('messages', messages);
    const formatTime = time => {
      const options = {hour: 'numeric', minute: 'numeric'};
      return new Date(time).toLocaleString('en-US', options);
    };
    return (
      <KeyboardAvoidingView className="flex flex-1 bg-white">
        <ScrollView className=" bg-slate-50">
          {messages?.map((item, index) => {
            // console.log(item);
            return (
              <Pressable
              style={[
                item?.sender_id == userId
                  ? {
                      alignSelf: 'flex-end',
                      backgroundColor: '#DCF8C6',
                      padding: 8,
                      maxWidth: '60%',
                      borderRadius: 7,
                      margin: 10,
                    }
                  : {
                      alignSelf: 'flex-start',
                      backgroundColor: 'white',
                      padding: 8,
                      margin: 10,
                      borderRadius: 7,
                      maxWidth: '60%',
                    },
              ]}
              key={index} >
                <Text className="text-xs text-left">{item?.message}</Text>
                <Text className="text-right text-[9px] text-gray-400 mt-1">{formatTime(item?.timestamp)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
  
        <View 
          className="bg-white flex-row items-center p-2.5 border-t border-t-gray-300 mb-5">
          <Entypo name="emoji-happy" size={24} color="black" />
          <TextInput
            placeholder="type your message..."
            value={message}
            onChangeText={setMessage}
         className="flex-1 h-10 border border-gray-300 rounded-2xl px-2.5 ml-2.5"
          />
  
          <View
             className="flex-row items-center gap-2 mx-2">
             <Feather name="camera" size={24} color="black" />
  
            <Feather name="mic" size={24} color="black" />
          </View>
  
          <Pressable
            onPress={() => sendMessage(userId, route?.params?.receiverId)}
           className="bg-blue-900 px-3 py-2 rounded-2xl ">
            <Text className="text-center text-white">Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  };
  
  export default ChatRoom;
  
