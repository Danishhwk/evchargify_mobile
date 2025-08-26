import axios from 'axios';
import {BaseUrl} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function getQrData(data) {
  const url = BaseUrl + `/station/scan?qr_data_str=${data}`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.get(url, {header});
    if (response.status === 200) {
      return response.data['data'];
    } else {
      console.log('getQrData error: Unexpected status code', response.status);
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    console.log('getQrData error: ', error);
    throw error;
  }
}
