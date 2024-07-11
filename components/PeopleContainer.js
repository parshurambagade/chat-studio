import { View, Text } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import UsersFlatListContainer from './UsersFlatListContainer';

const PeopleContainer = () => {
  return (
    <SafeAreaView className="flex-1 mx-4 h-1/2">
    <View className="flex flex-row justify-between border-t-gray-400  py-2 pr-2">
        <Text className="text-base text-gray-700">People</Text>
        <Icon name="chevron-down" size={22} color="gray" />
    </View>
    <UsersFlatListContainer />
    </SafeAreaView>
  )
}

export default PeopleContainer