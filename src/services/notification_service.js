import axios from 'axios';
import {BaseUrl} from '../utils/constant';

export async function notificationAddService(
  customer_id,
  device_platform,
  fcm_token,
) {
  const url = BaseUrl + `/notification/add`;

  const data = {
    customer_id: customer_id,
    device_platform: device_platform,
    fcm_token: fcm_token,
  };
  console.log('url', url);
  console.log('data', data);

  try {
    const response = await axios.post(url, data);
    if (response.status === 200) {
      console.log('notificationAddService response: ', response.data);
      return response.data;
    } else {
      console.log(
        'notificationAddService error: Unexpected status code',
        response.data,
      );
    }
  } catch (error) {
    console.log('notificationAddService error: ', error);
    return error;
  }
}
