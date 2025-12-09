import axios from 'axios';
import {BaseUrl} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function forgotPasswordOtpSendFun(forgotPasswordOtpSendData) {
  const url = BaseUrl + '/forgot_password/otp/send';
  const token = await getToken();
  console.log('url', url);
  console.log('forgotPasswordOtpSendData', forgotPasswordOtpSendData);
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };

  try {
    const response = await axios.post(url, forgotPasswordOtpSendData, {
      header,
    });
    // Check if the response status code indicates success
    if (response.status === 200) {
      console.log('forgotPasswordOtpSendFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'forgotPasswordOtpSendFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('forgotPasswordOtpSendFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function ForgotReSendOtpService(data) {
  const url = `${BaseUrl}/forgot_password/otp/resend`;

  console.log('url: ', url);

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

export async function forgotPasswordOtpVerifyFun(forgotPasswordOtpVerifyData) {
  const url = BaseUrl + '/forgot_password/otp/verify';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log('forgotPasswordOtpVerifyData', forgotPasswordOtpVerifyData);

  try {
    const response = await axios.post(url, forgotPasswordOtpVerifyData, {
      header,
    });
    // Check if the response status code indicates success
    if (response.status === 200) {
      console.log('forgotPasswordOtpVerifyFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'forgotPasswordOtpVerifyFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('forgotPasswordOtpVerifyFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function forgotPasswordChangePasswordFun(
  forgotPasswordChangePasswordData,
) {
  const url = BaseUrl + '/forgot_password/change_password';
  const token = await getToken();

  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log(
    'forgotPasswordChangePasswordData',
    forgotPasswordChangePasswordData,
  );

  try {
    const response = await axios.post(url, forgotPasswordChangePasswordData, {
      header,
    });
    // Check if the response status code indicates success
    if (response.status === 200) {
      console.log('forgotPasswordChangePasswordFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'forgotPasswordChangePasswordFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('forgotPasswordChangePasswordFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}
