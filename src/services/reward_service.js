import axios from 'axios';
import {BaseUrl} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function isRewardEnableService() {
  try {
    const token = await getToken();
    const header = {
      'Content-Type': 'application/json',
      Authorization: 'Token ' + token,
    };
    const response = await axios.get(`${BaseUrl}/coin/is_show`, {header});
    if (response.status === 200) {
      return response.data;
    }
    throw new Error(
      `Reward Enable error: Unexpected status code ${response.status}`,
    );
  } catch (error) {
    console.error('Reward Enable error:', error);
    throw error;
  }
}

export async function coinInfoService(data) {
  try {
    const token = await getToken();
    const header = {
      'Content-Type': 'application/json',
      Authorization: 'Token ' + token,
    };
    const response = await axios.post(`${BaseUrl}/coin/info`, data, {header});
    if (response.status === 200) {
      return response.data;
    }
    throw new Error(
      `Coin Info error: Unexpected status code ${response.status}`,
    );
  } catch (error) {
    console.error('Coin Info error:', error);
    throw error;
  }
}

export async function coinDailyCheckService(data) {
  try {
    const token = await getToken();
    const header = {
      'Content-Type': 'application/json',
      Authorization: 'Token ' + token,
    };
    const response = await axios.post(`${BaseUrl}/coin/check_in`, data, {
      header,
    });
    if (response.status === 200) {
      return response.data;
    }
    throw new Error(
      `Coin Daily Check error: Unexpected status code ${response.status}`,
    );
  } catch (error) {
    console.error('Coin Daily Check error:', error);
    throw error;
  }
}
export async function completeCoinTaskService(data) {
  try {
    const token = await getToken();
    const header = {
      'Content-Type': 'application/json',
      Authorization: 'Token ' + token,
    };
    const response = await axios.post(`${BaseUrl}/coin/task_completed`, data, {
      header,
    });
    if (response.status === 200) {
      return response.data;
    }
    throw new Error(
      `Coin Task Complete error: Unexpected status code ${response.status}`,
    );
  } catch (error) {
    console.error('Coin Task Complete error:', error);
    throw error;
  }
}
