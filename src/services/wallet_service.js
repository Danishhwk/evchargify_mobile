import axios from 'axios';
import {BaseUrl} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function razorpayinitiateFun(razorpayinitiateData) {
  const url = BaseUrl + '/payment/razorpay/initiate';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log('razorpayinitiateData', razorpayinitiateData);

  try {
    const response = await axios.post(url, razorpayinitiateData, {header});
    // Check if the response status code indicates success
    if (response.status === 200) {
      console.log('razorpayinitiateFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'razorpayinitiateFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('razorpayinitiateFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function razorpayUpdateFun(razorpayUpdateData) {
  const url = BaseUrl + '/payment/razorpay/update';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  // console.log("razorpayUpdateData", razorpayUpdateData);

  try {
    const response = await axios.post(url, razorpayUpdateData, {header});
    // Check if the response status code indicates success
    if (response.status === 200) {
      console.log('razorpayUpdateFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'razorpayUpdateFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('razorpayUpdateFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function transactionList(transactionListData) {
  const url = BaseUrl + '/payment/list';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  // console.log('transactionListData', transactionListData);

  try {
    const response = await axios.post(url, transactionListData, {header});
    // Check if the response status code indicates success
    if (response.status === 200) {
      // console.log('transactionList response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'transactionList error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('transactionList error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function loginPasswordFun(loginPasswordData) {
  const url = BaseUrl + '/login/check';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log('loginPasswordData', loginPasswordData);

  try {
    const response = await axios.post(url, loginPasswordData, {header});
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
