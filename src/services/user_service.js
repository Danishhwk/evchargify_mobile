import axios from 'axios';
import {BaseUrl} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function getUserList() {
  const url = BaseUrl + '/users';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  try {
    const res = await axios
      .get(url, {header})
      .then(response => {
        return response.data;
      })
      .catch(error => {
        return error;
      });
    return res;
  } catch (error) {
    console.log('catch err ', error);
    return error;
  }
}

export async function userInfoFun(userInfoData) {
  const url = BaseUrl + '/customer/profile/info';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    // console.log('userInfoData', userInfoData);
    const response = await axios.post(url, userInfoData, {header});
    // Check if the response status code indicates success
    if (response.status === 200) {
      // console.log('userInfoFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log('userInfoFun error: Unexpected status code', response.status);
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('userInfoFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function changePasswordFun(changePasswordData) {
  const url = BaseUrl + '/customer/profile/change_password';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    console.log('changePasswordData', changePasswordData);
    const response = await axios.post(url, changePasswordData, {header});
    // Check if the response status code indicates success
    if (response.status === 200) {
      console.log('changePasswordFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'changePasswordFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('changePasswordFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}
export async function userUpdateFun(updateData) {
  const url = BaseUrl + '/customer/profile/update';
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    console.log('userUpdateFun', updateData);
    const response = await axios.post(url, updateData, {header});
    if (response.status === 200) {
      console.log('userUpdateFun response: ', response.data);
      return response.data;
    } else {
      console.log(
        'userUpdateFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    console.log('userUpdateFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}
