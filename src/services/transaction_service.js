import axios from 'axios';
import {BaseUrl, BaseUrlTransaction} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function transactionRemoteStartFun(remoteStartData) {
  const url = BaseUrlTransaction + '/remotestart';
  const token = await getToken();

  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log('remoteStartData', remoteStartData);

  try {
    const response = await axios.post(url, remoteStartData, {header});
    // Check if the response status code indicates success
    if (response.status === 200) {
      console.log('transactionRemoteStartFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'transactionRemoteStartFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('transactionRemoteStartFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function transactionRemoteStopFun(remoteStopData) {
  const url = BaseUrlTransaction + '/remotestop';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log('remoteStopData', remoteStopData);

  try {
    const response = await axios.post(url, remoteStopData, {header});
    // Check if the response status code indicates success
    if (response.status === 200) {
      console.log('transactionRemoteStopFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'transactionRemoteStopFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('transactionRemoteStopFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function transactionSessionListFun(sessionInfoData) {
  const url = BaseUrlTransaction + '/session_list';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log('sessionInfoData', sessionInfoData);

  try {
    const response = await axios.post(url, sessionInfoData, {header});
    if (response.status === 200) {
      return response.data;
    } else {
      console.log(
        'transactionSessionListFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    console.log('transactionSessionListFun error: ', error);
  }
}

export async function transactionSessionInfoFun(sessionInfoData) {
  const url = BaseUrlTransaction + '/session_info';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log('sessionInfoData', sessionInfoData);

  try {
    const response = await axios.post(url, sessionInfoData, {header});
    // Check if the response status code indicates success
    if (response.status === 200) {
      console.log('transactionSessionInfoFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'transactionSessionInfoFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('transactionSessionInfoFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function transactionFailCheckService(customer_id, station_id) {
  const url = `${BaseUrl}/station/check_fail_transaction?customer_id=${customer_id}&station_id=${station_id}`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);

  try {
    const response = await axios.get(url, {header});
    if (response.status !== 200) {
      throw new Error('Unexpected status code: ' + response.status);
    }
    return response.data;
  } catch (error) {
    console.log('transactionFailCheckService error: ', error);
    throw error;
  }
}
