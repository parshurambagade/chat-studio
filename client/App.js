import "react-native-gesture-handler";
// import { View, Text } from 'react-native'
import React, { useEffect } from "react";
import { SocketContextProvider } from "./context/SocketContext";
import { StackNavigator } from "./navigators/StackNavigator";
import { AuthContextProvider } from "./context/AuthContext";
import { UserContextProvider } from "./context/UserContext";
import { ChatContextProvider } from "./context/ChatContext";
import { VideoCallContextProvider } from "./context/VideoCallContext";
import { NavigationContainer } from "@react-navigation/native";
import { requestPermissions } from "./constants";

const App = () => {

  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <AuthContextProvider>
      <SocketContextProvider>
        <UserContextProvider>
          <ChatContextProvider>
            <NavigationContainer>
              <VideoCallContextProvider>
                <StackNavigator />
              </VideoCallContextProvider>
            </NavigationContainer>
          </ChatContextProvider>
        </UserContextProvider>
      </SocketContextProvider>
    </AuthContextProvider>
  );
};

export default App;
