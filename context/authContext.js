import { createContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";

const authContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [token, setToken] = useState(''); 
  const [userId, setUserId] = useState(''); 
  const [authUser, setAuthUser] = useState(
    AsyncStorage.getItem('authToken') || null,
  );

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("authToken");
      const storedUserId = await AsyncStorage.getItem("userId");
        setToken(storedToken);
        console.log(`Stored UserId from authcontext: ${storedUserId}`);
        setUserId(storedUserId);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  return (
    <authContext.Provider value={{ token, setToken, userId, setUserId, authUser, setAuthUser }}>
      {children}
    </authContext.Provider>
  );
};

export { authContext, AuthContextProvider };
