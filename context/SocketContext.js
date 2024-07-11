import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
// import dotenv from 'react-native-dotenv';
import { API_ENDPOINT } from '@env';

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const socketConnection = io(API_ENDPOINT, { transports: ['websocket'] }); // Adjust the URL as needed
    setSocket(socketConnection);

    socketConnection.on('connect', () => {
      console.log(`Socket connected with ID: ${socketConnection.id}`);
      setIsInitialized(true);
    });

    socketConnection.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      if (socketConnection && typeof socketConnection.close === 'function') {
        socketConnection.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isInitialized }}>
      {children}
    </SocketContext.Provider>
  );
};
