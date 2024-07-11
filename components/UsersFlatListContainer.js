import { Image, Pressable, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { DEFAULT_IMAGE_URL } from "../constants";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import {API_ENDPOINT} from '@env';

export default function UsersFlatListContainer() {
  const [users, setUsers] = useState([]);
  const { userId } = useContext(AuthContext);

  const fetchUsers = async () => {
    try {
      
    if (!userId) return;

    // const api = `${API_ENDPOINT}/users/${userId}`;
    // console.log(api);   
      const response = await axios.get(
        `${API_ENDPOINT}users/${userId}`
      );
   
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    // console.log(`UserId from UsersFlatListContainer: ${userId}`);
    fetchUsers();
  }, [userId]);

  useEffect(() => {
    // console.log(`Users in UsersFlatListContainer: ${users}`);
  }, [users]);

  return (
    users && (
    //   <View>
    // <FlatList
    //   data={users}
    //   renderItem={({ user }) => <UserFlatListRow key={user.id} user={user} />}
    //   keyExtractor={(user) => user.id}
    // />
    // </View>
    <View >
    {users.map(user => <UserFlatListRow key={user.id} user={user} />)}
    </View>
  ))
}

const UserFlatListRow = ({ user }) => {
  const navigation = useNavigation();
  if(!user) return;

  const { email, username, image, id} = user;
 

  return (
    <View className="flex flex-row items-center justify-between border-t border-gray-300 py-2">
      <View className="flex flex-row items-center justify-center gap-4">
        <View>
          <Image
            className="h-10 w-10 rounded-full"
            source={{ uri: image ? image : DEFAULT_IMAGE_URL }}
          />
        </View>

        <View className="flex gap-1 flex-col justify-center ">
          <Text className="text-gray-800">{username}</Text>
          <Text className="text-gray-800">{email}</Text>
        </View>
      </View>
      <View>
        <Pressable onPress={() =>
        navigation.navigate('ChatRoom', {
          name: username,
          receiverId: id,
          image: image,
        })} className="bg-blue-900 px-4 py-2 text-white rounded-md">
          <Text className="text-white">Chat</Text>
        </Pressable>
      </View>
    </View>
  );
};