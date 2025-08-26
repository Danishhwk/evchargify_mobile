import axios from 'axios';
import {BaseUrl} from '../utils/constant';

export async function registerInsertFun(registerInsertData) {
  const headers = {'Content-Type': 'multipart/form-data'};
  const url = BaseUrl + '/register/insert';
  console.log('url', url);
  console.log('headers', headers);
  console.log('registerInsertData', registerInsertData);

  try {
    const response = await axios.post(url, registerInsertData, {headers});
    // Check if the response status code indicates success
    if (response.status === 200) {
      console.log('registerInsertFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'registerInsertFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('registerInsertFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function registerOtpVerifyFun(registerOtpVerifyData) {
  const headers = {'Content-Type': 'application/json'};
  const url = BaseUrl + '/register/otp/verify';
  console.log('url', url);
  console.log('headers', headers);
  console.log('registerOtpVerifyData', registerOtpVerifyData);

  try {
    const response = await axios.post(url, registerOtpVerifyData, {headers});
    // Check if the response status code indicates success
    if (response.status === 200) {
      console.log('loginSendOtpFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'loginSendOtpFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('loginSendOtpFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function loginPasswordFun(loginPasswordData) {
  const headers = {'Content-Type': 'application/json'};
  const url = BaseUrl + '/login/check';
  console.log('url', url);
  console.log('headers', headers);
  console.log('loginPasswordData', loginPasswordData);

  try {
    const response = await axios.post(url, loginPasswordData, {headers});
    // Check if the response status code indicates success
    if (response.status === 200) {
      console.log('loginSendOtpFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'loginSendOtpFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('loginSendOtpFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function RegisterReSendOtpService(data) {
  const url = `${BaseUrl}/register/otp/resend`;

  try {
    const response = await axios.post(url, data, {
      headers: {'Content-Type': 'application/json'},
    });

    if (response.status === 200) {
      console.log('ReSendOtpService response: ', response.data);
      return response.data;
    } else {
      console.error(
        'ReSendOtpService error: Unexpected status code',
        response.status,
      );
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('ReSendOtpService error: ', error);
    throw error;
  }
}
