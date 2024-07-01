import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {API_ENDPOINT} from "@env";
import { useSocketContext } from "./socketContext";

const userContext = createContext();

const UserContextProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [messages, setMessages] = useState(null);

  const {socket} = useSocketContext();

  useEffect(() => {
    fetchUserInfo();
    fetchUserMessages();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const storedUserId = (await AsyncStorage.getItem("userId") || null);
      if (!storedUserId) return;
        const response = await axios.get(`${API_ENDPOINT}/userInfo/${storedUserId}`);
        // console.log(`Response from fetchUserInfo: ${JSON.stringify(response.data[0])}`);
        setUserInfo(response.data[0]);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchUserMessages = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId") || null;
      if (!storedUserId) return;
        const response = await axios.get(`${API_ENDPOINT}/userMessages/${storedUserId}`);
        // console.log(`Response from fetchUserMessages: ${JSON.stringify(response.data)}`);
        setMessages(response.data);
        
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  return (
    <userContext.Provider
      value={{ userInfo, messages, setMessages }}
    >
      {children}
    </userContext.Provider>
  );
};

export { userContext, UserContextProvider };
