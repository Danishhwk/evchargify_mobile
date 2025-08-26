import axios from 'axios';
import {BaseUrl} from '../utils/constant';
import {getToken} from '../utils/getToken';

// favorite_station_status 1 = add, 2 = remove

export async function getFavListService(customer_id) {
  const url = `${BaseUrl}/favoritestation/list?customer_id=${customer_id}`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.get(url, {header});
    if (response.status !== 200) {
      const errorMessage = `getFavListService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('getFavListService error:', error);
    return error;
  }
}

export async function FavAddService(
  customer_id,
  station_id,
  favorite_station_status,
) {
  const url = `${BaseUrl}/favoritestation/add`;
  const token = await getToken();

  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);

  const data = {
    customer_id: customer_id,
    station_id: station_id,
    favorite_station_status: favorite_station_status,
  };

  console.log('data', data);

  try {
    const response = await axios.post(url, data, {header});

    if (response.status !== 200) {
      const errorMessage = `FavAddService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    console.error('FavAddService error:', error);
    return error;
  }
}
