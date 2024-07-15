import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_ENDPOINT } from '@env';
import { useAuthContext } from './AuthContext';

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const {userId} = useAuthContext();

  useEffect(() => {
    const socketConnection = io(API_ENDPOINT, { 
      transports: ['websocket'], 
      query: { userId }  // Add userId to the connection options
    });
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
  }, [userId]); // Add userId as a dependency to the useEffect

  return (
    <SocketContext.Provider value={{ socket, isInitialized }}>
      {children}
    </SocketContext.Provider>
  );
};
