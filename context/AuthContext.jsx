import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from "jwt-decode";

const AuthContext = createContext(null);

const useAuthContext = () => {
  return useContext(AuthContext);
};

const AuthContextProvider = ({ children }) => {
  const [token, setToken] = useState(
    AsyncStorage.getItem("authToken") || null
  );
  const [userId, setUserId] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("authToken");
      const storedUserId = await AsyncStorage.getItem("userId");

      if (storedToken) {
        setToken(storedToken);
        setAuthUser(jwtDecode(storedToken));
      }

      if (storedUserId) {
        setUserId(storedUserId);
      }
    } catch (error) {
      console.error("Error fetching token or userid from AsyncStorage:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken, userId, setUserId, authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider, useAuthContext };
