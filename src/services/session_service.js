import axios from 'axios';
import {BaseUrl, BaseUrlTransaction} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function sessionList(sessionListData) {
  const url = BaseUrl + '/payment/transaction/list';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log('headers', header);
  // console.log("sessionListData", sessionListData);

  try {
    const response = await axios.post(url, sessionListData, {header});
    // Check if the response status code indicates success
    if (response.status === 200) {
      //   console.log('sessionList response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log('sessionList error: Unexpected status code', response.status);
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('sessionList error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function sessionDetailService(id, customer_id) {
  const url = BaseUrlTransaction + '/session_details';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);

  try {
    const response = await axios.post(
      url,
      {transaction_id: id, customer_id: customer_id},
      {header},
    );
    // Check if the response status code indicates success
    if (response.status === 200) {
      //   console.log('sessionDetail Service response: ', response.data);
      return response.data;
    } else {
      console.log(
        'sessionDetail Service error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    console.log('sessionDetail Service error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}
