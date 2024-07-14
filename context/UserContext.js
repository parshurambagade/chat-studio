import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_ENDPOINT } from "@env";

const UserContext = createContext();

export const useUserContext = () => {
  return useContext(UserContext);
};
  
const UserContextProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [messages, setMessages] = useState(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId || userId == "undefined") return;

      const response = await axios.get(`${API_ENDPOINT}userInfo/${userId}`);
      console.log(
        `Response from fetchUserInfo: ${JSON.stringify(response.data[0])}`
      );
      setUserInfo(response.data[0]);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  return (
    <UserContext.Provider value={{ userInfo, messages, setMessages }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };
