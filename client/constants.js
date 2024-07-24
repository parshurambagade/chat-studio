// permissions.js
import { PermissionsAndroid, Platform } from 'react-native';

export async function requestPermissions() {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);

      if (
        granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Camera and microphone permissions granted');
      } else {
        console.log('Camera and microphone permissions denied');
      }
    }
  } catch (err) {
    console.warn(err);
  }
}

export const DEFAULT_IMAGE_URL = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";    

