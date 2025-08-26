import axios from 'axios';
import {BaseUrl} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function getRfidListService(id) {
  const url = `${BaseUrl}/customer_rfid/list?customer_id=${id}`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.get(url, {header});
    if (response.status !== 200) {
      const errorMessage = `getRfidListService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('getRfidListService error:', error);
    return error;
  }
}

export async function setActiveRfidService(data) {
  const url = `${BaseUrl}/customer_rfid/active`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.post(url, data, {header});
    if (response.status !== 200) {
      const errorMessage = `setActiveRfidService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('setActiveRfidService error:', error);
    return error;
  }
}
