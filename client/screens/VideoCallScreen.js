import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Button, Text, Alert } from 'react-native';
import { RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import { useSocketContext } from '../context/SocketContext';
import { useVideoCallContext } from '../context/VideoCallContext';

const VideoCallScreen = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const { socket, isInitialized } = useSocketContext();
  const { pc } = useVideoCallContext();
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    let isComponentMounted = true;

    if (!pc || !socket || pc == undefined || socket == undefined) {
      console.error('PeerConnection or socket is not initialized');
      return;
    }

    const setupLocalStream = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({ video: true, audio: true });
        if (isComponentMounted) {
          setLocalStream(stream);
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        }
      } catch (error) {
        console.error('getUserMedia error:', error);
      }
    };

    setupLocalStream();

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate:', event.candidate);
        socket.emit('ice-candidate', { candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (isComponentMounted) {
        console.log('Remote stream received:', event.streams[0]);
        setRemoteStream(event.streams[0]);
      }
    };

    socket.on('offer', async ({ sdp }) => {
      try {
        console.log('Received offer:', sdp);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log('Sending answer:', answer);
        socket.emit('answer', { sdp: answer });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    socket.on('answer', ({ sdp }) => {
      try {
        console.log('Received answer:', sdp);
        pc.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    socket.on('ice-candidate', ({ candidate }) => {
      try {
        console.log('Received ICE candidate:', candidate);
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    return () => {
      isComponentMounted = false;

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      if (pc) {
        pc.close();
      }

      if (socket) {
        socket.close();
      }
    };
  }, [pc, socket]);

  const createOffer = async () => {
    if (!pc || !socket) {
      console.error('PeerConnection or socket is not initialized');
      Alert.alert('Error', 'PeerConnection or socket is not initialized. Please try again.');
      return;
    }

    try {
      const offer = await pc.createOffer();
      console.log('Created offer:', offer);

      try {
        await pc.setLocalDescription(offer);
        console.log('Local description set:', offer);
        socket.emit('offer', { sdp: offer });
        setIsCalling(true);
      } catch (setLocalDescriptionError) {
        console.error('Error setting local description:', setLocalDescriptionError);
        Alert.alert('Error', `Failed to set local description: ${setLocalDescriptionError.message}`);
      }
    } catch (createOfferError) {
      console.error('Error creating offer:', createOfferError);
      Alert.alert('Error', `Failed to create offer: ${createOfferError.message}`);
    }
  };

  if (!isInitialized) {
    return <LoadingScreen />;
  }

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
      <Button title="Start Call" onPress={createOffer} disabled={isCalling} />
    </SafeAreaView>
  );
};

const LoadingScreen = () => (
  <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Initializing...</Text>
  </SafeAreaView>
);

export default VideoCallScreen;
