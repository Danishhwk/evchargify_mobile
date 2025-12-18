import axios from 'axios';
import {BaseUrlTransaction} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function ocpiTransactionRemoteStartFun(remoteStartData) {
  const url = BaseUrlTransaction + '/remotestart_ocpi';
  const token = await getToken();

  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log('remotestart_ocpi', remoteStartData);

  try {
    const response = await axios.post(url, remoteStartData, {header});
    // Check if the response status code indicates success
    if (response.status === 200) {
      console.log('OCPI transactionRemoteStartFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'OCPI transactionRemoteStartFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('OCPI transactionRemoteStartFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function ocpiTransactionRemoteStopFun(remoteStopData) {
  const url = BaseUrlTransaction + '/remotestop_ocpi';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log('OCPI remoteStopData', remoteStopData);

  try {
    const response = await axios.post(url, remoteStopData, {header});
    // Check if the response status code indicates success
    if (response.status === 200) {
      console.log('OCPI transactionRemoteStopFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'OCPI transactionRemoteStopFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('OCPI transactionRemoteStopFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function ocpiTransactionSessionInfoFun(sessionInfoData) {
  const url = BaseUrlTransaction + '/session_info_ocpi';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  //   console.log('OCPI sessionInfoData', sessionInfoData);

  try {
    const response = await axios.post(url, sessionInfoData, {header});
    // Check if the response status code indicates success
    if (response.status === 200) {
      //   console.log('OCPI transactionSessionInfoFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'OCPI transactionSessionInfoFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('OCPI transactionSessionInfoFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}
