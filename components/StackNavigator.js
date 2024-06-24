import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ChatScreen from "../screens/ChatScreen";
import { Ionicons } from "@expo/vector-icons";
import ProfileScreen from "../screens/ProfileScreen";
import PeopleScreen from "../screens/PeopleScreen";
import { useContext } from "react";
import { authContext } from "../context/authContext";


export const StackNavigator = () => {
  const Stack = createStackNavigator();
  const Tab = createBottomTabNavigator();
  const {token} = useContext(authContext);
  const BottomTabs = () => {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="Chats"
          component={ChatScreen}
          options={{
            tabBarStyle: { backgroundColor: "#101010", padding: 4, height: 60 },
            headerShown: false,
            tabBarIcon: (({ focused }) => { 
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
                  color="gray"
                />
              );
            }),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarStyle:{backgroundColor: "#101010", padding: 4, height: 60},
            headerShown: false,
            tabBarIcon: ({ focused }) => {
              return focused ? (
                <Ionicons name="person-add-outline" size={24} color="white" />
              ) : (
                <Ionicons name="person-add-outline" size={24} color="gray" />
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
      </Stack.Navigator>
    );
  };

  return (
    <NavigationContainer>
    {token === null || token === "" ? <AuthStack /> : <MainStack />}
    </NavigationContainer>
  );
};
