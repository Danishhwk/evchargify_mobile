import axios from 'axios';
import {BaseUrl} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function getTicketCategoryService() {
  const url = `${BaseUrl}/ticketcategory/list`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.get(url, {header});
    if (response.status !== 200) {
      const errorMessage = `getTicketCategoryService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('getTicketCategoryService error:', error);
    return error;
  }
}

export async function getTicketListService(id) {
  const url = `${BaseUrl}/customerticket/list?customer_id=${id}`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.get(url, {header});
    if (response.status !== 200) {
      const errorMessage = `getTicketListService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('getTicketListService error:', error);
    return error;
  }
}

export async function addTicketService(data) {
  const url = `${BaseUrl}/customerticket/add`;
  const token = await getToken();
  const header = {
    'Content-Type': 'multipart/form-data',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log('data', data);
  try {
    const response = await axios.post(url, data, {header});
    if (response.status !== 200) {
      const errorMessage = `addTicketService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('addTicketService error:', error);
    return error;
  }
}

export async function updateTicketStatusService(data) {
  const url = `${BaseUrl}/customerticket/updatecustomerticketstatus`;
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
      const errorMessage = `updateTicketStatusService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('updateTicketStatusService error:', error);
    return error;
  }
}
