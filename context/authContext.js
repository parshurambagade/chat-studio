import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { createContext, useEffect, useState } from "react";

const authContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
        try{
            const token = AsyncStorage.getItem("authToken");
            const decodedToken = jwtDecode(JSON.stringify(token));
            console.log(`decoded token: ${decodedToken}`);
            const userId = decodedToken.id;
            setUserId(userId);
        }catch(e){
            console.error(e.message);
        }
    };

    fetchUser();
  }, [userId]);

  return (
    <authContext.Provider value={{ token, setToken, userId, setUserId }}>
      {children}
    </authContext.Provider>
  );
};


export {authContext, AuthContextProvider};