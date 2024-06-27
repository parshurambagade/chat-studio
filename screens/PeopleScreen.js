import { Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { authContext } from "../context/authContext";
import UsersFlatListContainer from "../components/UsersFlatListContainer";

export default function PeopleScreen() {
  const { userId, token } = useContext(authContext);
  // State to store fetched users

  // useEffect(() => {
  //   console.log(`UserId from PeopleScreen useEffect: ${userId}`);
  //   console.log(`Token from PeopleScreen useEffect: ${token}`);
  // }, []);

  return (
    <View className="mx-4">
      <View className="my-10">
        <Text className="font-bold text-center py-6 mb-2 border-b border-b-gray-200">
          People who're using ChatStudio
        </Text>
        <UsersFlatListContainer />
      </View>
    </View>
  );
}
