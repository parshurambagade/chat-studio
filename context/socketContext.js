import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { authContext } from './authContext';
import { SOCKET_CONNECTION_ENDPOINT } from '@env';

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { authUser, userId } = useContext(authContext);

  useEffect(() => {
    if (authUser) {
      console.log(`Connecting socket for user: ${userId}`);
      const socket = io(`${SOCKET_CONNECTION_ENDPOINT}/`, { // Update the port if needed
        query: {
          userId: userId,
        },
      });
      

      setSocket(socket);

      socket.on('connect', () => {
        console.log(`Socket connected with ID: ${socket.id}`);
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected for user: ${userId}`);
      });

      return () => {
        console.log(`Disconnecting socket for user: ${userId}`);
        socket.close();
      };
    } else {
      if (socket) {
        console.log('Closing existing socket due to missing authUser');
        socket.close();
        setSocket(null);
      }
    }
  }, [authUser, userId]); // Add authUser and userId as dependencies

  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
