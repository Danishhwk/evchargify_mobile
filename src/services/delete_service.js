import axios from 'axios';
import {BaseUrl} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function deleteServiceFun(customer_id, customer_pass, reason) {
  const url = BaseUrl + `/customer/profile/deleteProfile`;
  const token = await getToken();
  console.log('url', url);
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };

  const data = {
    customer_id: customer_id,
    customer_pass: customer_pass,
    reason: reason,
  };

  console.log('data', data);

  try {
    const response = await axios.post(url, data, {header});
    if (response.status === 200) {
      console.log('deleteServiceFun response: ', response.data);
      return response.data;
    } else {
      console.log(
        'deleteServiceFun error: Unexpected status code',
        response.data,
      );
    }
  } catch (error) {
    console.log('deleteServiceFun error: ', error);
    return error;
  }
}
