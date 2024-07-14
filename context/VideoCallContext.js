import React, { createContext, useContext, useEffect, useState } from 'react';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import { useSocketContext } from './SocketContext';

const VideoCallContext = createContext();

export const useVideoCallContext = () => {
  return useContext(VideoCallContext);
};

export const VideoCallContextProvider = ({ children }) => {
  const { socket } = useSocketContext();
  const [pc, setPc] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    setPc(peerConnection);

    socket.on('offer', async ({ sdp }) => {
      try {
        console.log('Received offer:', sdp);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        console.log('Sending answer:', answer);
        socket.emit('answer', { sdp: answer });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    socket.on('answer', ({ sdp }) => {
      try {
        console.log('Received answer:', sdp);
        peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    socket.on('ice-candidate', ({ candidate }) => {
      try {
        console.log('Received ICE candidate:', candidate);
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    return () => {
      if (peerConnection && typeof peerConnection.close === 'function') {
        peerConnection.close();
      }
    };
  }, [socket]);

  return (
    <VideoCallContext.Provider value={{ pc }}>
      {children}
    </VideoCallContext.Provider>
  );
};
