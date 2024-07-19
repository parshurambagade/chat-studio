import React, { createContext, useContext, useEffect } from "react";
import { useSocketContext } from "./SocketContext";
import { AuthContext } from "./AuthContext";

const ChatContext = createContext();

export const useChatContext = () => {
  return useContext(ChatContext);
};

export const ChatContextProvider = ({ children }) => {
  const { socket } = useSocketContext();
  const { authUser, userId } = useContext(AuthContext);

  useEffect(() => {
    if (authUser && socket) {
      console.log(`Connecting socket for user: ${userId}`);
      socket.emit("join", { userId: userId });

      socket.on("message", (message) => {
        console.log("Received message:", message);
      });

      return () => {
        console.log(`Disconnecting socket for user: ${userId}`);
        socket.emit("leave", { userId: userId });
      };
    }
  }, [authUser, socket, userId]);

  useEffect(() => {
    const handleNewMessage = async (newMessage) => {
      console.log("New Message Received:", newMessage, "userid is: ", userId); // Debugging log

      if (newMessage.receiver_id == userId) {
        console.log("Emmiting new-message-delivered event!");
        await socket.emit("new-message-delivered", {
          messageId: newMessage.id,
        });
      }
    };

    if (socket) {
      socket.on("newMessage", handleNewMessage);
    }

    return () => {
      if (socket) {
        socket.off("newMessage", handleNewMessage);
      }
    };
  }, [socket, userId]);



  return (
    <ChatContext.Provider value={{ socket }}>{children}</ChatContext.Provider>
  );
};
