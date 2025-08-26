import axios from 'axios';
import {BaseUrl} from '../utils/constant';

export async function loginSendOtpFun(loginData) {
  const headers = {'Content-Type': 'application/json'};
  const url = BaseUrl + '/login/otp/send';
  console.log('url', url);
  console.log('headers', headers);
  console.log('loginData', loginData);

  try {
    const response = await axios.post(url, loginData, {headers});
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
export async function loginOtpFun(loginOtpData) {
  const headers = {'Content-Type': 'application/json'};
  const url = BaseUrl + '/login/otp/verify';
  console.log('url', url);
  console.log('headers', headers);
  console.log('loginOtpData', loginOtpData);

  try {
    const response = await axios.post(url, loginOtpData, {headers});
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
  //   console.log('loginPasswordData', loginPasswordData);

  try {
    const response = await axios.post(url, loginPasswordData, {headers});
    // Check if the response status code indicates success
    if (response.status === 200) {
      console.log('loginPasswordFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'loginPasswordFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('loginPasswordFun catch error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function userSessionService(customer_id) {
  const headers = {'Content-Type': 'application/json'};
  const url = BaseUrl + '/customer/profile/status';
  console.log('url', url);
  console.log('headers', headers);
  let data = {customer_id: customer_id};

  try {
    const response = await axios.post(url, data, {
      headers,
      timeout: 5000,
      timeoutErrorMessage: 'Request timed out',
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.log(
        'userSessionService error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    console.log('userSessionService error: ', error);
    throw error;
  }
}

export async function ReSendOtpService(data) {
  const url = `${BaseUrl}/login/otp/resend`;

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
