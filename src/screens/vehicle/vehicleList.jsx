import React, {useEffect, useRef, useState} from 'react';
import {
  Appbar,
  Button,
  Card,
  Checkbox,
  Dialog,
  IconButton,
  Surface,
  Switch,
  Text,
} from 'react-native-paper';
import {images} from '../../assets/images/images';
import {Image, View} from 'react-native';
import {
  deleteVehicleService,
  getVehicleListService,
  setActiveVehicleService,
  setDefaultVehicleService,
} from '../../services/vehicle_service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FlatList, RefreshControl} from 'react-native-gesture-handler';
import {Toast} from 'react-native-toast-notifications';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {useForeground} from 'react-native-google-mobile-ads';
import {getWindowHeight, isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';

export default function VehicleListScreen({
  navigation,
  vehicleData,
  vehicleFun,
}) {
  const [vehicleList, setVehicleList] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activedialog, setActivedialog] = useState(false);
  const [vehicleId, setVehicleId] = useState(0);

  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  const [activeVechicleData, setActiveVechicleData] = useState({
    customer_vehicle_id: 0,
    is_active: 1,
  });

  const getVehicleList = async () => {
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');
      await getVehicleListService(customer_id)
        .then(response => {
          // console.log('response', response);
          setVehicleList(response.data);

          setRefreshing(false);
        })
        .catch(error => {
          console.log('error', error);
          setRefreshing(false);
        });
    } catch (error) {
      console.log('error', error);
      setRefreshing(false);
    }
  };

  const setDefaultFun = async (id, is_default) => {
    try {
      const data = {
        customer_vehicle_id: id,
        is_default: is_default,
      };
      await setDefaultVehicleService(data)
        .then(response => {
          // console.log('response', response);
          vehicleFun();
        })
        .catch(error => {
          console.log('error', error);
        });
    } catch (error) {
      console.log('error', error);
    }
  };
  const setActiveFun = async (id, is_active) => {
    try {
      const data = {
        customer_vehicle_id: id,
        is_active: is_active,
      };
      console.log('data', data);

      await setActiveVehicleService(data)
        .then(response => {
          // console.log('response', response);
          Toast.show('Vehicle Status Updated', {
            type: 'custom_toast',
            data: {title: 'Success'},
          });
          vehicleFun();
        })
        .catch(error => {
          Toast.show('Something went wrong. Please try again', {
            type: 'custom_toast',
            data: {title: 'Error'},
          });
          console.log('error', error);
        });
    } catch (error) {
      Toast.show('Something went wrong. Please try again', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
      console.log('error', error);
    }
    setActivedialog(false);
  };

  const deleteFun = async () => {
    try {
      await deleteVehicleService(vehicleId)
        .then(response => {
          console.log('response', response);
          Toast.show(response.message, {
            type: 'custom_toast',
            data: {title: 'Success'},
          });
          vehicleFun();
          setVisible(false);
        })
        .catch(error => {
          console.log('error', error);
          Toast.show('Something went wrong. Please try again', {
            type: 'custom_toast',
            data: {title: 'Error'},
          });
          setVisible(false);
        });
    } catch (error) {
      console.log('error', error);
      Toast.show('Something went wrong. Please try again', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
      setVisible(false);
    }
  };

  return (
    <Surface mode="flat" className="flex-1 h-full bg-white">
      <Appbar className="bg-transparent" mode="center-aligned">
        <IconButton
          icon={() => <Image source={images.back} className="w-6 h-6" />}
          onPress={() => navigation.goBack()}
        />
        <Appbar.Content title={'My Vehicles'} />

        <Appbar.Action
          icon="plus"
          onPress={() => {
            navigation.navigate('VehicleAdd');
          }}
        />
      </Appbar>
      <FlatList
        data={vehicleData}
        contentContainerStyle={{padding: 20}}
        keyExtractor={(item, index) => index}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={getVehicleList} />
        }
        renderItem={({item, index}) => {
          return (
            <Animated.View entering={FadeInDown}>
              <Card className="px-4 py-2 mt-5">
                <View className="flex-row justify-between items-center">
                  <View className="w-72">
                    <Text variant="titleMedium">
                      {item.vehicle_make_name} ({item.vehicle_model_name})
                    </Text>
                    <Text variant="labelLarge" className="mt-2">
                      {item.vehicle_number} ({item.vehicle_type})
                    </Text>
                  </View>
                  <View>
                    <IconButton
                      icon="pencil"
                      size={20}
                      borderless
                      style={{margin: 0}}
                      onPress={() => {
                        navigation.navigate('VehicleEdit', {
                          data: item,
                        });
                      }}
                    />
                    <IconButton
                      size={20}
                      style={{margin: 0}}
                      icon="trash-can"
                      onPress={() => {
                        setVisible(true);
                        setVehicleId(item.customer_vehicle_id);
                      }}
                    />
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Checkbox.Android
                      disabled={item.is_default == 1}
                      status={item.is_default == 1 ? 'checked' : 'unchecked'}
                      onPress={() => {
                        for (let i = 0; i < vehicleList.length; i++) {
                          vehicleList[i].is_default = 1;

                          if (i != index) {
                            vehicleList[i].is_default = 2;
                          }
                        }

                        setVehicleList([...vehicleList]);
                        setDefaultFun(item.customer_vehicle_id, 1);
                      }}
                    />
                    <Text variant="labelLarge" className="ml-1">
                      Default
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Text className="mr-2" variant="titleMedium">
                      {item.is_active == 1 ? 'Active' : 'Inactive'}
                    </Text>
                    <Switch
                      value={item.is_active == 1 ? true : false}
                      onChange={() => {
                        let data = {
                          customer_vehicle_id: item.customer_vehicle_id,
                          is_active: item.is_active == 1 ? 2 : 1,
                        };
                        setActiveVechicleData(data);
                        setActivedialog(true);
                      }}
                    />
                  </View>
                </View>
              </Card>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View
            style={{height: getWindowHeight() - 200}}
            className="flex-1 items-center justify-center mx-5">
            <Text variant="bodyLarge" className="text-center text-lg">
              You currently don't have any registered vehicles.
            </Text>
          </View>
        }
      />
      <Dialog visible={visible}>
        <Dialog.Content>
          <Text variant="titleMedium">Confirm Delete</Text>
          <Text variant="labelLarge" className="mt-2">
            Are you sure you want to delete this vehicle?
          </Text>
          <View className="flex-row justify-end mt-5">
            <Button onPress={() => setVisible(false)}>No</Button>
            <Button onPress={() => deleteFun()}>Yes</Button>
          </View>
        </Dialog.Content>
      </Dialog>

      <Dialog visible={activedialog} onDismiss={() => setActivedialog(false)}>
        <Dialog.Content>
          <Text variant="titleMedium">Confirm Status</Text>
          <Text variant="labelLarge" className="mt-2">
            Are you sure you want to change the status of this vehicle?
          </Text>
          <View className="flex-row justify-end mt-5">
            <Button onPress={() => setActivedialog(false)}>No</Button>
            <Button
              onPress={() =>
                setActiveFun(
                  activeVechicleData.customer_vehicle_id,
                  activeVechicleData.is_active,
                )
              }>
              Yes
            </Button>
          </View>
        </Dialog.Content>
      </Dialog>
    </Surface>
  );
}
