import { View, Text } from 'react-native'
import React from 'react'
import { FontAwesome6 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import UsersFlatListContainer from './UsersFlatListContainer';

const PeopleContainer = () => {
  return (
    <SafeAreaView className="h-80">
    <View className="flex flex-row justify-between  border-t-gray-300 mb-2 pt-4 ">
        <Text className="text-base">People</Text>
        <FontAwesome6 name="angle-down" size={22} color="black" />
    </View>
    <UsersFlatListContainer />
    </SafeAreaView>
  )
}

export default PeopleContainer