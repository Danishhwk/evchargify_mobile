import React, {useEffect, useRef, useState} from 'react';
import {
  Button,
  Checkbox,
  HelperText,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';

import MyAppBar from '../../utils/components/appBar';
import {ScrollView} from 'react-native-gesture-handler';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {
  addVehicleService,
  getVehicleMakeService,
  getVehicleModelService,
  getVehicleTypeService,
  updateVehicleService,
} from '../../services/vehicle_service';
import {Toast} from 'react-native-toast-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyBannerAd from '../../utils/components/banner_ad';
import {InterstitialAd, useForeground} from 'react-native-google-mobile-ads';
import {interstitialAdUnitId} from '../../utils/constant';

export const interstitialAdHelper =
  InterstitialAd.createForAdRequest(interstitialAdUnitId);

export default function VehicleEdit({navigation, route}) {
  const data = route.params.data;
  const [vehicleType, setVehicleType] = useState([]);
  const [vehicleMake, setVehicleMake] = useState([]);
  const [vehicleModel, setVehicleModel] = useState([]);
  const vehicleId = data.customer_vehicle_id;

  const [typeList, setTypeList] = useState([]);
  const [makeList, setMakeList] = useState([]);
  const [modelList, setModelList] = useState([]);

  const [typeError, setTypeError] = useState(false);
  const [makeError, setMakeError] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [is_default, setIsDefault] = useState(false);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const bannerRef = useRef(null);

  const initialValues = {
    battery_capacity: data.battery_capacity.toString(),
    vehicle_number: data.vehicle_number,
    // vin: data.vin,
  };

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  const onSubmit = async (value, {resetForm}) => {
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');
      const data = {
        customer_id: customer_id,
        customer_vehicle_id: vehicleId,
        battery_capacity: value.battery_capacity,
        vehicle_number: value.vehicle_number,
        vin: '',
        vehicle_type_id: vehicleType.value,
        vehicle_make_id: vehicleMake.value,
        vehicle_model_id: vehicleModel.value,
        is_default: is_default ? 1 : 2,
      };

      const response = await updateVehicleService(data);
      // console.log('response', response);
      if (response && response.success) {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Success'},
        });

        navigation.goBack();
      } else {
        Toast.show('Something went wrong. Please try again', {
          type: 'custom_toast',
          data: {title: 'Error'},
        });

        navigation.goBack();
      }
    } catch (error) {
      setVehicleType([]);
      setVehicleMake([]);
      setVehicleModel([]);
      console.log(error);
      navigation.goBack();
    }
  };

  const onValidation = () =>
    Yup.object().shape({
      battery_capacity: Yup.string()
        .required('Required')
        .matches(/^[0-9]+$/, 'Must be only digits'),
      vehicle_number: Yup.string().required('Required'),
      // vin: Yup.string().required('Required'),
    });

  useEffect(() => {
    getVehicleType();
    getVehicleMake();

    setIsDefault(data.is_default == 1 ? true : false);
  }, []);

  const getVehicleType = async () => {
    await getVehicleTypeService()
      .then(response => {
        const resData = response.data;

        let temp = [];

        for (let i = 0; i < resData.length; i++) {
          temp.push({
            label: resData[i].vehicle_type,
            value: resData[i].vehicle_type_id,
          });
        }

        setTypeList(temp);

        setVehicleType({
          label: data.vehicle_type,
          value: data.vehicle_type_id,
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getVehicleMake = async () => {
    await getVehicleMakeService()
      .then(response => {
        const resData = response.data;

        let temp = [];

        for (let i = 0; i < resData.length; i++) {
          temp.push({
            label: resData[i].vehicle_make_name,
            value: resData[i].vehicle_make_id,
          });
        }

        console.log(temp);

        setMakeList(temp);

        setVehicleMake({
          label: data.vehicle_make_name,
          value: data.vehicle_make_id,
        });

        getVehicleModel(data.vehicle_make_id);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getVehicleModel = async make_id => {
    await getVehicleModelService(make_id)
      .then(response => {
        const resData = response.data;

        let temp = [];

        for (let i = 0; i < resData.length; i++) {
          temp.push({
            label: resData[i].vehicle_model_name,
            value: resData[i].vehicle_model_id,
          });
        }

        console.log(temp);

        setModelList(temp);

        setVehicleModel({
          label: data.vehicle_model_name,
          value: data.vehicle_model_id,
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  return (
    <Surface mode="flat" className="flex-1 h-full">
      <MyAppBar title={'Edit Vehicle'} />

      <ScrollView
        contentContainerStyle={{alignItems: 'center', paddingBottom: 20}}>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={onValidation}
          onSubmit={onSubmit}>
          {({handleChange, handleSubmit, values, errors, touched}) => (
            <View className="items-center">
              <Dropdown
                data={typeList}
                labelField="label"
                valueField="value"
                placeholder="Vehicle Type"
                mode="default"
                value={vehicleType}
                itemTextStyle={{color: 'black'}}
                placeholderStyle={{color: 'black'}}
                selectedTextStyle={{color: 'black'}}
                className="w-80 h-11 px-4 rounded-lg mt-5"
                style={{
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: typeError ? 'red' : '#6BB14F',
                  elevation: 3,
                  shadowColor: '#6BB14F',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.7,
                  shadowRadius: 1.41,
                }}
                itemContainerStyle={{
                  borderRadius: 10,
                }}
                containerStyle={{
                  borderRadius: 10,
                  marginTop: 2,
                }}
                onChange={item => {
                  setVehicleType(item);
                }}
                fontFamily="Exo2-Medium"
              />

              {typeError && (
                <HelperText
                  className="self-start"
                  type="error"
                  variant="bodyMedium">
                  Required
                </HelperText>
              )}

              <Dropdown
                data={makeList}
                labelField="label"
                valueField="value"
                placeholder="Vehicle Make"
                mode="default"
                value={vehicleMake}
                itemTextStyle={{color: 'black'}}
                placeholderStyle={{color: 'black'}}
                selectedTextStyle={{color: 'black'}}
                className="w-80 h-11 px-4 rounded-lg mt-5"
                style={{
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: makeError ? 'red' : '#6BB14F',
                  elevation: 3,
                  shadowColor: '#6BB14F',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.7,
                  shadowRadius: 1.41,
                }}
                itemContainerStyle={{
                  borderRadius: 10,
                }}
                containerStyle={{
                  borderRadius: 10,
                  marginTop: 2,
                }}
                onChange={item => {
                  setVehicleMake(item);
                  getVehicleModel(item.value);
                }}
                fontFamily="Exo2-Medium"
              />
              {makeError && (
                <HelperText
                  className="self-start"
                  type="error"
                  variant="bodyMedium">
                  Required
                </HelperText>
              )}

              <Dropdown
                data={modelList}
                labelField="label"
                valueField="value"
                placeholder="Vehicle Model"
                mode="default"
                itemTextStyle={{color: 'black'}}
                placeholderStyle={{color: 'black'}}
                selectedTextStyle={{color: 'black'}}
                value={vehicleModel}
                className="w-80 h-11 px-4 rounded-lg mt-5"
                style={{
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: modelError ? 'red' : '#6BB14F',
                  elevation: 3,
                  shadowColor: '#6BB14F',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.7,
                  shadowRadius: 1.41,
                }}
                itemContainerStyle={{
                  borderRadius: 10,
                }}
                containerStyle={{
                  borderRadius: 10,
                  marginTop: 2,
                }}
                onChange={item => {
                  setVehicleModel(item);
                }}
                fontFamily="Exo2-Medium"
              />
              {modelError && (
                <HelperText
                  className="self-start"
                  type="error"
                  variant="bodyMedium">
                  Required
                </HelperText>
              )}

              <TextInput
                label="Battery Capacity (kWh)"
                mode="outlined"
                className="w-80 h-10 mt-4"
                outlineStyle={{
                  elevation: 3,
                  borderRadius: 10,
                  shadowColor: '#6BB14F',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.7,
                  shadowRadius: 1.41,
                }}
                keyboardType="numeric"
                value={values.battery_capacity}
                onChangeText={handleChange('battery_capacity')}
                error={errors.battery_capacity && touched.battery_capacity}
              />

              {errors.battery_capacity && touched.battery_capacity && (
                <HelperText
                  className="self-start"
                  type="error"
                  variant="bodyMedium">
                  {errors.battery_capacity}
                </HelperText>
              )}

              <TextInput
                label="Vehicle Number"
                mode="outlined"
                className="w-80 h-10 mt-4"
                outlineStyle={{
                  elevation: 3,
                  borderRadius: 10,
                  shadowColor: '#6BB14F',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.7,
                  shadowRadius: 1.41,
                }}
                autoCapitalize="characters"
                value={values.vehicle_number}
                onChangeText={handleChange('vehicle_number')}
                error={errors.vehicle_number && touched.vehicle_number}
              />

              {errors.vehicle_number && touched.vehicle_number && (
                <HelperText
                  className="self-start"
                  type="error"
                  variant="bodyMedium">
                  {errors.vehicle_number}
                </HelperText>
              )}

              {/* <TextInput
                placeholder="VIN"
                mode="outlined"
                className="w-80 h-11 bg-[#E2EFD6] mt-5"
                contentStyle={{paddingTop: 10, paddingBottom: 10}}
                outlineStyle={{
                  elevation: 2,
                  borderRadius: 10,
                  borderWidth: 0,
                }}
                value={values.vin}
                autoCapitalize="characters"
                onChangeText={handleChange('vin')}
              />

              {errors.vin && touched.vin && (
                <HelperText
                  className="self-start"
                  type="error"
                  variant="bodyMedium">
                  {errors.vin}
                </HelperText>
              )} */}

              <View className="w-80 flex-row justify-between items-center mt-5">
                <Text>Set as default</Text>
                <Checkbox.Android
                  status={is_default ? 'checked' : 'unchecked'}
                  onPress={() => setIsDefault(!is_default)}
                />
              </View>

              <Button
                mode="contained"
                className="w-60  my-8"
                onPress={() => {
                  if (vehicleType.length === 0) {
                    setTypeError(true);
                  } else {
                    setTypeError(false);
                  }
                  if (vehicleMake.length === 0) {
                    setMakeError(true);
                  } else {
                    setMakeError(false);
                  }
                  if (vehicleModel.length === 0) {
                    setModelError(true);
                  } else {
                    setModelError(false);
                  }
                  handleSubmit();
                }}>
                Update
              </Button>
            </View>
          )}
        </Formik>
      </ScrollView>
    </Surface>
  );
}
