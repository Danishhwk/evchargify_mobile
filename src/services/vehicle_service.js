import axios from 'axios';
import {BaseUrl} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function getVehicleTypeService() {
  const url = `${BaseUrl}/vehicle/typelist`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.get(url, {header});
    if (response.status !== 200) {
      const errorMessage = `getVehicleTypeService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('getVehicleTypeService error:', error);
    return error;
  }
}

export async function getVehicleMakeService() {
  const url = `${BaseUrl}/vehicle/makelist`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.get(url, {header});
    if (response.status !== 200) {
      const errorMessage = `getVehicleMakeService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('getVehicleMakeService error:', error);
    return error;
  }
}

export async function getVehicleModelService(make_id) {
  const url = `${BaseUrl}/vehicle/modelList?vehicle_make_id=${make_id}`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.get(url, {header});
    if (response.status !== 200) {
      const errorMessage = `getVehicleModelService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('getVehicleModelService error:', error);
    return error;
  }
}

export async function addVehicleService(data) {
  const url = `${BaseUrl}/customervehicle/add`;
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
      const errorMessage = `addVehicleService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('addVehicleService error:', error);
    return error;
  }
}

export async function getVehicleListService(id) {
  const url = `${BaseUrl}/customervehicle/info?customer_id=${id}`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.get(url, {header});
    if (response.status !== 200) {
      const errorMessage = `getVehicleListService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('getVehicleListService error:', error);
    return error;
  }
}

export async function setDefaultVehicleService(data) {
  const url = `${BaseUrl}/customervehicle/changevehicledefault`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.post(url, data, {header});
    if (response.status !== 200) {
      const errorMessage = `setDefaultVehicleService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('setDefaultVehicleService error:', error);
    return error;
  }
}
export async function setActiveVehicleService(data) {
  const url = `${BaseUrl}/customervehicle/vehicleactive`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.post(url, data, {header});
    if (response.status !== 200) {
      const errorMessage = `setActiveVehicleService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('setActiveVehicleService error:', error);
    return error;
  }
}

export async function deleteVehicleService(id) {
  const url = `${BaseUrl}/customervehicle/delete`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  try {
    const response = await axios.post(
      url,
      {
        customer_vehicle_id: id,
      },
      {header},
    );
    if (response.status !== 200) {
      const errorMessage = `deleteVehicleService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('deleteVehicleService error:', error);
    return error;
  }
}

export async function updateVehicleService(data) {
  const url = `${BaseUrl}/customervehicle/update`;
  const token = await getToken();
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };
  console.log('url', url);
  console.log('data', data);
  try {
    const response = await axios.post(url, data, {header});
    console.log('response', response.data);
    if (response.status !== 200) {
      const errorMessage = `updateVehicleService error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    console.error('updateVehicleService error:', error);
    return error;
  }
}
