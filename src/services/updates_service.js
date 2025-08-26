import axios from 'axios';
import {BaseUrl} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function UpdateService() {
  const url = `${BaseUrl}/updates`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };

  console.log('url', url);

  try {
    const response = await axios.get(url, {header});

    if (response.status !== 200) {
      const errorMessage = `UpdateService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    console.error('UpdateService error:', error);
    return [];
  }
}
