import "react-native-gesture-handler";
// import { View, Text } from 'react-native'
import React from "react";
import { SocketContextProvider } from "./context/SocketContext";
import { StackNavigator } from "./navigators/StackNavigator";
import { AuthContextProvider } from "./context/AuthContext";
import { UserContextProvider } from "./context/UserContext";
import { ChatContextProvider } from "./context/ChatContext";
import { VideoCallContextProvider } from "./context/VideoCallContext";

const App = () => {
  return (
    <SocketContextProvider>
      <AuthContextProvider>
        <UserContextProvider>
          <ChatContextProvider>
            <VideoCallContextProvider>
          <StackNavigator />
          </VideoCallContextProvider>
          </ChatContextProvider>
        </UserContextProvider>
      </AuthContextProvider>
    </SocketContextProvider>
  );
};

export default App;
