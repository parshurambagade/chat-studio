import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ChatScreen from "../screens/ChatScreen";
import Ionicons from "react-native-vector-icons/Ionicons";
import ProfileScreen from "../screens/ProfileScreen";
import PeopleScreen from "../screens/PeopleScreen";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ChatRoom from "../screens/ChatRoom";
import VideoCallScreen from "../screens/VideoCallScreen";

export const StackNavigator = () => {
  const Stack = createStackNavigator();
  const Tab = createBottomTabNavigator();
  const { token } = useContext(AuthContext) || { token: "123" };
  const BottomTabs = () => {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="Chats"
          component={ChatScreen}
          options={{
            tabBarStyle: { backgroundColor: "#111827", padding: 4, height: 60 },
            headerShown: false,
            tabBarIcon: ({ focused }) => {
              return focused ? (
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={24}
                  color="white"
                />
              ) : (
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={24}
                  color="#c0c5c5"
                />
              );
            },
          }}
        />
        <Tab.Screen
          name="Calls"
          component={VideoCallScreen}
          options={{
            tabBarStyle: { backgroundColor: "#101010", padding: 4, height: 60 },
            headerShown: false,
            tabBarIcon: ({ focused }) => {
              return focused ? (
                <Ionicons name="call-outline" size={24} color="white" />
              ) : (
                <Ionicons name="call-outline" size={24} color="#c0c5c5" />
              );
            },
          }}
        />

        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarStyle: { backgroundColor: "#101010", padding: 4, height: 60 },
            headerShown: false,
            tabBarIcon: ({ focused }) => {
              return focused ? (
                <Ionicons name="person-add-outline" size={24} color="white" />
              ) : (
                <Ionicons name="person-add-outline" size={24} color="#c0c5c5" />
              );
            },
          }}
        />
      </Tab.Navigator>
    );
  };

  const AuthStack = () => {
    return (
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  };

  const MainStack = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="People"
          component={PeopleScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="ChatRoom" component={ChatRoom} />
        <Stack.Screen name="VideoCallScreen" component={VideoCallScreen} />
      </Stack.Navigator>
    );
  };

  return (
    <NavigationContainer>
      {token === null || token === "" ? <AuthStack /> : <MainStack />}
    </NavigationContainer>
  );
};
