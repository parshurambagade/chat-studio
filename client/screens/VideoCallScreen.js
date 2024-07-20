import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Alert, Pressable } from 'react-native';
import { RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import { useSocketContext } from '../context/SocketContext';
import { useVideoCallContext } from '../context/VideoCallContext';
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from '@react-navigation/native';

const VideoCallScreen = ({ route }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const { socket } = useSocketContext();
  const { pc, createPeerConnection, closePeerConnection } = useVideoCallContext();
  const [isCalling, setIsCalling] = useState(false);
  const { receiverId } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    let isComponentMounted = true;
    const peerConnection = createPeerConnection();
  
    const setupLocalStream = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({ video: true, audio: true });
        if (isComponentMounted) {
          setLocalStream(stream);
          stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
        }
      } catch (error) {
        console.error('getUserMedia error:', error);
      }
    };
  
    setupLocalStream();
  
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { candidate: event.candidate });
      }
    };
  
    peerConnection.ontrack = (event) => {
      if (isComponentMounted) {
        setRemoteStream(event.streams[0]);
      }
    };
  
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
  
    socket.on('answer', ({ sdp }) => {
      try {
        peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });
  
    socket.on('ice-candidate', ({ candidate }) => {
      try {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });
  
    socket.on('call-accepted', () => {
      // Receiver accepted the call, proceed with setting up the peer connection
      createOffer(peerConnection);
    });
  
    socket.on('call-rejected', () => {
      Alert.alert('Call Rejected', 'The receiver has rejected the call.');
      navigation.goBack();
    });
  
    createOffer(peerConnection);
  
    return () => {
      isComponentMounted = false;
  
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
  
      closePeerConnection();
  
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('call-accepted');
      socket.off('call-rejected');
    };
  }, [socket]);
  

  const createOffer = async (peerConnection) => {
    if (!peerConnection || !socket) {
      Alert.alert('Error', 'PeerConnection or socket is not initialized. Please try again.');
      return;
    }

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit('offer', { sdp: offer });
      socket.emit('incoming-call', { receiverId, callerId: socket.id, callerName: 'Caller Name' });
      setIsCalling(true);
    } catch (error) {
      Alert.alert('Error', `Failed to create offer: ${error.message}`);
    }
  };

  const toggleMute = () => {
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsVideoMuted(!isVideoMuted);
  };

  const switchCamera = () => {
    localStream.getVideoTracks().forEach((track) => {
      track._switchCamera();
    });
  };

  const hangUp = () => {
    if (pc) {
      pc.close();
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    socket.emit('hangup');
    setLocalStream(null);
    setRemoteStream(null);
    setIsCalling(false);
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
