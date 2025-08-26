import axios from 'axios';
import {BaseUrl} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function getInquiryListService(id) {
  const url = `${BaseUrl}/customer_inquiry/list?customer_id=${id}`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.get(url, {header});
    if (response.status !== 200) {
      const errorMessage = `getInquiryListService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('getInquiryListService error:', error);
    return error;
  }
}
export async function getInquiryTypeListService(id) {
  const url = `${BaseUrl}/inquiry_type/list`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.get(url, {header});
    if (response.status !== 200) {
      const errorMessage = `getInquiryTypeListService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('getInquiryTypeListService error:', error);
    return error;
  }
}

export async function addInquiryService(data) {
  const url = `${BaseUrl}/customer_inquiry/add`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log('data', data);
  try {
    const response = await axios.post(url, data, {header});
    if (response.status !== 200) {
      const errorMessage = `addInquiryService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('addInquiryService error:', error);
    return error;
  }
}

export async function addInquiryNoteService(data) {
  const url = `${BaseUrl}/customer_inquiry/update_note`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log('data', data);
  try {
    const response = await axios.post(url, data, {header});
    if (response.status !== 200) {
      const errorMessage = `addInquiryNoteService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('addInquiryNoteService error:', error);
    return error;
  }
}
export async function closeInquiryService(data) {
  const url = `${BaseUrl}/customer_inquiry/closed`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log('data', data);
  try {
    const response = await axios.post(url, data, {header});
    if (response.status !== 200) {
      const errorMessage = `closeInquiryService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('closeInquiryService error:', error);
    return error;
  }
}
