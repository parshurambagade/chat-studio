import React, { createContext, useContext, useEffect, useState } from 'react';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices } from 'react-native-webrtc';
import { useSocketContext } from './SocketContext';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

const VideoCallContext = createContext();

export const useVideoCallContext = () => {
  return useContext(VideoCallContext);
};

export const VideoCallContextProvider = ({ children }) => {
  const { socket } = useSocketContext();
  const navigation = useNavigation();
  const [pc, setPc] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    if(!socket) return;

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate', event.candidate);
        socket.emit('ice-candidate', { candidate: event.candidate });
      } else {
        console.log('All ICE candidates have been sent');
      }
    };
    

    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        console.log('Remote stream received', event.streams[0]);
      } else {
        console.error('No streams in ontrack event');
      }
    };
    

    setPc(peerConnection);

    socket.on('offer', async ({ sdp }) => {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', { sdp: answer });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    socket.on('answer', async ({ sdp }) => {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    socket.on('incoming-call', ({ callerId, callerName }) => {
      console.log('incoming-call', { callerId, callerName });
      navigation?.navigate('CallNotificationScreen', { callerId, callerName });
    });

    socket.on('call-accepted', () => {
      console.log("call got accepted!")
      createOffer();
    });

    socket.on('call-rejected', () => {
      Alert.alert('Call Rejected', 'The receiver has rejected the call.');
      navigation.goBack();
    });

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('call-rejected');
      peerConnection.close();
    };
  }, [socket, navigation]);

  const createOffer = async () => {
    if (!pc || !socket) {
      Alert.alert('Error', 'PeerConnection or socket is not initialized. Please try again.');
      return;
    }
  
    try {
      console.log("Creating offer...");
      const offer = await pc.createOffer();
      console.log("Offer created: ", offer);
      await pc.setLocalDescription(offer);
      console.log("Local description set");
      socket.emit('offer', { sdp: offer });
      console.log("Offer sent");
    } catch (error) {
      console.error('Error in createOffer:', error.message);
      Alert.alert('Offer Error', `Failed to create or send offer: ${error.message}`);
    }
  };
  
  

  const createPeerConnection = async () => {
    try {
      console.log('Requesting media devices');
      const stream = await mediaDevices.getUserMedia({ video: true, audio: true });
      console.log('Media devices obtained');
      setLocalStream(stream);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    } catch (error) {
      console.error('getUserMedia error:', error.message);
      Alert.alert('Media Error', `Failed to access media devices: ${error.message}`);
    }
  };

  

  const closePeerConnection = () => {
    if (pc) {
      pc.getSenders().forEach(sender => pc.removeTrack(sender));
      pc.close();
      setPc(null);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      setLocalStream(null);
      setRemoteStream(null);  
    }
  };
  
  

  return (
    <VideoCallContext.Provider value={{ pc, createOffer, createPeerConnection, closePeerConnection, localStream, remoteStream }}>
      {children}
    </VideoCallContext.Provider>
  );
};
