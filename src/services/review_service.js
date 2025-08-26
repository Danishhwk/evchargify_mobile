import AsyncStorage from '@react-native-async-storage/async-storage';
import {BaseUrl} from '../utils/constant';
import axios from 'axios';
import {getToken} from '../utils/getToken';

export async function getStationReview(stationId) {
  const url = BaseUrl + `/stationreview/rivewcount?station_id=${stationId}`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.get(url, {header});
    if (response.status === 200) {
      console.log('response status 200 review count *****');

      return response.data['data'];
    } else {
      console.log(
        'getStationReview error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    console.log('getStationReview error: ', error);
    throw error;
  }
}

export async function getStationReviewComments(stationId) {
  const url = BaseUrl + `/stationreview/list?station_id=${stationId}`;
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
      console.log(
        'getStationReviewComments error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    console.log('getStationReviewComments error: ', error);
    throw error;
  }
}

export async function addFeedbackService({
  stationId,
  customer_rating,
  customer_review,
}) {
  console.log('station id', stationId);
  const url = BaseUrl + `/stationreview/add`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);

  const customer_id = await AsyncStorage.getItem('customer_id');
  const transaction_id = await AsyncStorage.getItem('transaction_id');

  const data = {
    station_id: stationId,
    customer_id: customer_id,
    charging_transaction_id: 1,
    customer_rating: customer_rating,
    customer_review: customer_review,
  };

  console.log('data', data);

  try {
    const response = await axios.post(url, data, {header});
    if (response.status === 200) {
      return response.data;
    } else {
      console.log(
        'addFeedbackService error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    console.log('addFeedbackService error: ', error);
    throw error;
  }
}
