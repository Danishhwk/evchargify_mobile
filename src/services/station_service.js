import axios from 'axios';
import {BaseUrl} from '../utils/constant';
import {getToken} from '../utils/getToken';

export async function stationMarkerListFun() {
  const url = `${BaseUrl}/station/marker/list`;
  const ocpUrl = `${BaseUrl}/ocpi/station/marker/list`;
  const token = await getToken();

  console.log('url', url);
  console.log('ocpUrl', ocpUrl);
  console.log('token', token);

  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };

  try {
    const response = await axios.get(url, {header});
    const ocpiResponse = await axios.get(ocpUrl);

    if (response.status !== 200) {
      const errorMessage = `stationMarkerListFun error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (ocpiResponse.status !== 200) {
      const errorMessage = `ocpiResponse error: Unexpected status code ${ocpiResponse.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    let allData = {
      data: [],
      status: 200,
      success: true,
    };

    allData.data = [...ocpiResponse.data.data, ...response.data.data];

    return allData;
  } catch (error) {
    console.error('stationMarkerListFun error:', error);
    throw error;
  }
}

export async function stationListFun() {
  const url = BaseUrl + '/station/list';
  const ocpiUrl = BaseUrl + '/ocpi/station/list';
  const token = await getToken();
  console.log('url', url);
  console.log('ocpiUrl', ocpiUrl);
  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };

  try {
    const response = await axios.get(url, {header});
    const ocpiResponse = await axios.get(ocpiUrl, {header});
    if (response.status !== 200) {
      const errorMessage = `stationListFun error: Unexpected status code ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (ocpiResponse.status !== 200) {
      const errorMessage = `ocpiResponse error: Unexpected status code ${ocpiResponse.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    let allData = {
      data: [],
      status: 200,
      success: true,
    };

    allData.data = [...ocpiResponse.data.data, ...response.data.data];

    return allData;
  } catch (error) {
    console.log('stationListFun error: ', error);
    throw error;
  }
}

export async function stationInfoFun(station_id) {
  const url = BaseUrl + '/station/info?station_id=' + station_id;
  const token = await getToken();
  console.log('url', url);
  console.log('station_id', station_id);

  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };

  try {
    const response = await axios.get(url, {header});
    // Check if the response status code indicates success
    if (response.status === 200) {
      // console.log('stationInfoFun response: ', response.data);
      return response.data;
    } else {
      // Handle other status codes (e.g., 400, 404, 500, etc.) here
      console.log(
        'stationInfoFun error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.log('stationInfoFun error: ', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

export async function ocpiStationInfoFun(station_id) {
  const url = BaseUrl + '/ocpi/station/info?station_id=' + station_id;
  const token = await getToken();
  console.log('url', url);
  console.log('station_id', station_id);

  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };

  try {
    const response = await axios.get(url, {header});

    if (response.status === 200) {
      return response.data;
    } else {
      console.log(
        'ocpi stationInfoFun error: Unexpected status code',
        response.status,
      );
      throw new Error(
        'ocpi station info Unexpected status code: ' + response.status,
      );
    }
  } catch (error) {
    console.log('ocpi stationInfoFun error: ', error);
    throw error;
  }
}

export async function stationMaintenaceService(station_id) {
  const url = BaseUrl + '/maintenance/list?station_id=' + station_id;
  const token = await getToken();
  console.log('url', url);

  const header = {
    'Content-Type': 'application/json',
    Authorization: 'Token ' + token,
  };

  try {
    const response = await axios.get(url, {header});
    if (response.status === 200) {
      return response.data;
    } else {
      console.log(
        'stationMaintenaceService error: Unexpected status code',
        response.status,
      );
      throw new Error('Unexpected status code: ' + response.status);
    }
  } catch (error) {
    console.log('stationMaintenaceService error: ', error);
    throw error;
  }
}
