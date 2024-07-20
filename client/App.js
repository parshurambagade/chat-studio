import "react-native-gesture-handler";
// import { View, Text } from 'react-native'
import React from "react";
import { SocketContextProvider } from "./context/SocketContext";
import { StackNavigator } from "./navigators/StackNavigator";
import { AuthContextProvider } from "./context/AuthContext";
import { UserContextProvider } from "./context/UserContext";
import { ChatContextProvider } from "./context/ChatContext";
import { VideoCallContextProvider } from "./context/VideoCallContext";
import { NavigationContainer } from "@react-navigation/native";

const App = () => {
  return (
    // <NavigationContainer>
      <AuthContextProvider>
        <SocketContextProvider>
          <UserContextProvider>
            <ChatContextProvider>
              <VideoCallContextProvider>
                <StackNavigator />
              </VideoCallContextProvider>
            </ChatContextProvider>
          </UserContextProvider>
        </SocketContextProvider>
      </AuthContextProvider>
    /* </NavigationContainer> */
  );
};

export default App;
