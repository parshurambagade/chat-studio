import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Alert, Pressable } from 'react-native';
import { RTCView, mediaDevices } from 'react-native-webrtc';
import { useVideoCallContext } from '../context/VideoCallContext';
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from '@react-navigation/native';
// import { Socket } from 'socket.io-client';
import { useAuthContext } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { useUserContext } from '../context/UserContext';

const VideoCallScreen = ({ route }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const { createOffer, createPeerConnection, closePeerConnection, localStream, remoteStream } = useVideoCallContext();
  const {userId} = useAuthContext();
  const {socket} = useSocketContext();
  const {userInfo} = useUserContext();
  const { receiverId } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    socket.emit("initialise-call", {
      callerId: userId,
      callerName:userInfo.username, 
      to: receiverId });
  }, [])  

  useEffect(() => {
    createPeerConnection();

    return () => {
      closePeerConnection();
    };
  }, []);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const switchCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track._switchCamera();
      });
    }
  };

  const hangUp = () => {
    closePeerConnection();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {localStream ? (
          <RTCView streamURL={localStream.toURL()} style={{ flex: 1 }} />
        ) : (
          <Text>Waiting for local stream...</Text>
        )}
        {remoteStream ? (
          <RTCView streamURL={remoteStream.toURL()} style={{ flex: 1 }} />
        ) : (
          <Text>Waiting for remote stream...</Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10 }}>
        <Pressable onPress={toggleMute}>
          <Icon name={isMuted ? "mic-off" : "mic"} size={24} color="black" />
        </Pressable>
        <Pressable onPress={toggleVideo}>
          <Icon name={isVideoMuted ? "videocam-off" : "videocam"} size={24} color="black" />
        </Pressable>
        <Pressable onPress={switchCamera}>
          <Icon name="camera-reverse" size={24} color="black" />
        </Pressable>
        <Pressable onPress={hangUp}>
          <Icon name="call" size={24} color="red" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default VideoCallScreen;
