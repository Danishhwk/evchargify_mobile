import axios from 'axios';
import {BaseUrl} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function subscriptionList(customer_id) {
  const url = BaseUrl + '/subscription/info';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);

  let data = {customer_id: customer_id};

  console.log('data', data);

  try {
    const response = await axios.post(url, data, {header});
    // Check if the response status code indicates success
    if (response.status === 200) {
      return response.data;
    } else {
      console.log(
        'subscriptionList error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('subscriptionList error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function subscriptionAssign(customer_id, coupon_code) {
  const url = BaseUrl + '/subscription/assignsubscription';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);

  let data = {customer_id: customer_id, coupon_code: coupon_code};

  console.log('data', data);

  try {
    const response = await axios.post(url, data, {header});
    // Check if the response status code indicates success
    if (response.status === 200) {
      return response.data;
    } else {
      console.log(
        'subscriptionAssign error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('subscriptionAssign error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function subscriptionAdd(customer_id, coupon_code) {
  const url = BaseUrl + '/subscription/add';
  const token = await getToken();

  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);

  let data = {customer_id: customer_id, coupon_code: coupon_code};

  console.log('data', data);

  try {
    const response = await axios.post(url, data, {header});

    console.log('response', response);
    // Check if the response status code indicates success
    if (response.status === 200) {
      return response.data;
    } else {
      console.log(
        'subscriptionAdd error: Unexpected status code',
        response.status,
      );
      return new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    console.log('subscriptionAdd error: ', error);
    return error;
  }
}
