import axios from 'axios';
import {BaseUrl, appSettingURl} from '../utils/constant';

export async function mobileSettingFun() {
  //const headers = {'Content-Type': 'application/json'};
  const url = appSettingURl;
  console.log('url', url);

  try {
    const response = await axios.get(url);
    // Check if the response status code indicates success
    if (response.status === 200) {
      // console.log('mobileSettingFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'mobileSettingFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('mobileSettingFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}
