import axios from 'axios';
import {BaseUrl} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function posterService() {
  try {
    const token = await getToken();
    const header = {
      'Content-Type': 'application/json',
      Authorization: 'Token ' + token,
    };
    const response = await axios.get(`${BaseUrl}/poster/list`, {header});
    if (response.status === 200) {
      return response.data;
    }
    throw new Error(
      `posterService error: Unexpected status code ${response.status}`,
    );
  } catch (error) {
    console.error('posterService error:', error);
    throw error;
  }
}
