import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { StackNavigator } from './components/StackNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContextProvider } from './context/authContext';
import { SocketContextProvider } from './context/socketContext';

export default function App() {
  return (
    <AuthContextProvider>
      <SocketContextProvider>
    <StackNavigator />
    </SocketContextProvider>
    </AuthContextProvider>
  );
}
