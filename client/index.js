import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

const Root = () => (
  // <SocketContextProvider>
    <App />
  // </SocketContextProvider> );
);

AppRegistry.registerComponent(appName, () => Root);
