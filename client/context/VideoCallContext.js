import React, { createContext, useContext, useEffect, useState } from 'react';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import { useSocketContext } from './SocketContext';
import { useNavigation } from '@react-navigation/native';

const VideoCallContext = createContext();

export const useVideoCallContext = () => {
  return useContext(VideoCallContext);
};

export const VideoCallContextProvider = ({ children, navigation }) => {
  const { socket } = useSocketContext();
  // const navigation = useNavigation();
  const [pc, setPc] = useState(null);

  useEffect(() => {
    if(socket){
      socket.on('incoming-call', ({ callerId, callerName }) => {
        navigation.navigate('CallNotificationScreen', { callerId, callerName });
      });
    
  
    return () => {
      socket.off('incoming-call');
    };
  }
  }, [socket, navigation]);

  useEffect(() => {
    return () => {
      if (pc) {
        pc.close();
      }
    };
  }, [pc]);

  const createPeerConnection = () => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    setPc(peerConnection);

    return peerConnection;
  };

  const closePeerConnection = () => {
    if (pc) {
      pc.close();
      setPc(null);
    }
  };

  return (
    <VideoCallContext.Provider value={{ pc, createPeerConnection, closePeerConnection }}>
      {children}
    </VideoCallContext.Provider>
  );
};