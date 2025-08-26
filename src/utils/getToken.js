import AsyncStorage from '@react-native-async-storage/async-storage';
import {CommonActions, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {navigationRef} from './rootNavigation';
import {BaseUrl} from './constant';

export const getToken = async () => {
  try {
    const token = await verifyToken();
    console.log('get token', token);

    return token;
  } catch (error) {
    console.error('Error getting token:', error);
  }
};

const verifyToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');

    const header = {
      'Content-Type': 'application/json',
      Authorization: 'Token ' + token,
    };
    const url = `${BaseUrl}/station/marker/list`;

    const response = await axios.get(url, {header});

    if (response.status === 401) {
      setTimeout(() => {
        navigationRef.current?.dispatch(
          CommonActions.reset({index: 0, routes: [{name: 'LoginScreen'}]}),
        );
      }, 500);
      throw new Error('Unauthorized');
    } else {
      return token;
    }
  } catch (error) {
    console.log('Error verifying token:', error);
    throw new Error('Error verifying token');
  }
};
