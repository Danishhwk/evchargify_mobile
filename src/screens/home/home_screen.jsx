import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import {FlashList} from '@shopify/flash-list';
import {formatDate} from 'date-fns';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import {checkVersion} from 'react-native-check-version';
import {useForeground} from 'react-native-google-mobile-ads';
import {
  Animated as AnimatedMap,
  Marker,
  MarkerAnimated,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import {
  ActivityIndicator,
  Button,
  Dialog,
  Divider,
  IconButton,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutUp,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Toast} from 'react-native-toast-notifications';
import {images} from '../../assets/images/images';
import {posterService} from '../../services/poster_service';
import {stationMarkerListFun} from '../../services/station_service';
import MyBannerAd from '../../utils/components/banner_ad';
import {isIos} from '../../utils/helpers';
import NetworkStatus from '../network_screen';
import {stationCard} from './station_card';
import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';

const mapStyle = [
  {
    elementType: 'labels',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'administrative.neighborhood',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
];

Geolocation.setRNConfiguration({
  locationProvider: 'playServices',
});

export default function HomeScreen({navigation}) {
  const [searchText, setSearchText] = useState('');
  const [filterStation, setFilterStation] = useState([]);
  const [locationDialog, setLocationDialog] = useState(false);
  const [noficationDialog, setNotificationDialog] = useState(false);
  const [mapFocused, setMapFocused] = useState(true);
  const mapRef = useRef();
  const [region, setRegion] = useState({
    latitude: 22.856362192292117,
    longitude: 79.26168438252743,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
    // longitudeDelta: 20,
  });
  const [gettingLocation, setGettingLocation] = useState(true);
  const [stationCardInfo, setStationCardInfo] = useState({});
  const [stationCardDistance, setStationCardDistance] = useState({});

  const [markers, setMarkers] = useState([]);
  const [savedmarkers, setSavedMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  const [animatedBottom] = useState(useSharedValue(130));

  const [showStations, setShowStations] = useState(false);

  const [nearbyStationsList, setNearbyStationsList] = useState([]);
  const [nearbyVal, setNearbyVal] = useState(0);

  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [utilityPoster, setUtilityPoster] = useState('');
  const [energyDialog, setEnergyDialog] = useState(false);
  const [values, setValues] = useState({
    currentPercentage: 0,
    batteryCapacity: 0,
  });
  const [requiredEnergy, setRequiredEnergy] = useState(0);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  const animatedStyle = useAnimatedStyle(() => ({
    bottom: animatedBottom.value,
  }));

  const changeLocationPosition = value => {
    animatedBottom.value = withTiming(value, {
      duration: 300,
      easing: Easing.linear,
    });
  };
  const width = useWindowDimensions().width;

  const markerOnTap = async selected_station_id => {
    changeLocationPosition(animatedBottom.value == 130 ? 220 : 130);
    setShowStations(prev => !prev);

    const foundData = markers.find(
      station => station.station_id === selected_station_id,
    );
    const distanceData = await AsyncStorage.getItem('station_distance');

    const foundDistance = JSON.parse(distanceData).find(
      station => station.station_id === selected_station_id,
    );

    setStationCardInfo(foundData || {});
    setStationCardDistance(foundDistance.distance || {});
  };

  const [isMapReady, setIsMapReady] = useState(false);

  const onMapReadyFun = async () => {
    const fetchLocation = async () => {
      try {
        setTimeout(async () => {
          await checkLocationPermission();
          setIsMapReady(true);
        }, 300);
      } catch (error) {
        console.log('Error requesting location permissions:', error);
      }
    };

    fetchLocation();
  };

  const getPosterFun = async () => {
    try {
      const response = await posterService();

      if (response.success == true) {
        setUtilityPoster(response.data[0].utility_poster_file);
        const currentDate = formatDate(new Date(), 'yyyy-MM-dd');
        await AsyncStorage.setItem('poster_show_date', `${currentDate}`);
        setTimeout(() => {
          setUtilityPoster('');
        }, 10000);
      }
    } catch (error) {
      console.log('catch error', error);
    }
  };

  useEffect(() => {
    const fetchMarkerListData = async () => {
      try {
        const response = await stationMarkerListFun();

        const processResponseData = data =>
          data.map(element => ({
            station_id: element.station_id,
            station_no: element.station_no,
            station_name: element.station_name,
            latitude: parseFloat(element.station_lat),
            longitude: parseFloat(element.station_long),
            location_name: element.location_name || '',
            station_address_one: element.station_address_one,
            station_address_two: element.station_address_two,
            station_address_landmark: element.station_address_landmark,
            station_visibility: element.station_visibility,
            station_status: element.station_status,
            station_visibility_temp: element.station_visibility_temp,
            country_name: element.country_name,
            state_name: element.state_name,
            city_name: element.city_name,
            pin_code: element.pin_code,
            stationreview: element.stationreview,
            charger_type: element.charger_type,
            is_ocpi: element.is_ocpi ?? 0,
            ocpi_location_id: element.ocpi_location_id ?? 0,
          }));

        const tempData =
          response?.success && response.data?.length > 0
            ? processResponseData(response.data)
            : [];

        setMarkers(tempData);
        setSavedMarkers(tempData);

        !response?.success &&
          Toast.show(response?.message || 'No Station Found', {
            type: 'custom_toast',
            data: {title: 'Info'},
          });
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchMarkerListData();

    const callPoster = async () => {
      const posterDate = await AsyncStorage.getItem('poster_show_date');
      const currentDate = formatDate(new Date(), 'yyyy-MM-dd');

      if (posterDate != currentDate) {
        setTimeout(() => {
          getPosterFun();
        }, 2000);
      }
    };

    callPoster();
  }, [userLocation]);

  useEffect(() => {
    requestNotificationPermission();
    setNearby();

    return () => {};
  }, [savedmarkers, userLocation]);

  const setNearby = useCallback(async () => {
    if (
      savedmarkers.length === 0 ||
      !userLocation.latitude ||
      !userLocation.longitude
    )
      return;

    const myLocation = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    };

    filterNearbyStations(savedmarkers, myLocation);
  }, [savedmarkers, userLocation.latitude, userLocation.longitude]);

  async function requestNotificationPermission() {
    try {
      await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then(
        async status => {
          if (Platform.OS === 'android') {
            if (status == 'denied' || status == 'blocked') {
              setNotificationDialog(true);
            }
          } else {
            const settings = await notifee.requestPermission({
              alert: true,
              badge: true,
              sound: true,
              announcement: true,
              criticalAlert: true,
            });

            if (settings.authorizationStatus) {
              console.log('User has notification permissions enabled');
            } else {
              console.log('User has notification permissions disabled');
              setNotificationDialog(true);
            }
          }
        },
      );
    } catch (error) {
      console.log('Error requesting notification permission:', error);
    }
  }

  const checkLocationPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const result = await check(permission);

    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log('This feature is not available on this device or OS.');
        setGettingLocation(false);
        break;
      case RESULTS.DENIED:
        console.log('Permission has not been requested / is denied.');
        requestLocationPermissions();
        setGettingLocation(false);
        break;
      case RESULTS.GRANTED:
        console.log('Permission is granted.');
        await requestLocationPermissions();
        setGettingLocation(false);
        break;
      case RESULTS.BLOCKED:
        console.log('Permission is denied and cannot be requested (blocked).');
        requestLocationPermissions();
        setGettingLocation(false);
        break;
    }
  };

  const requestLocationPermissions = async () => {
    try {
      console.log('requestLocationPermissions');

      if (Platform.OS === 'ios') {
        const status = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (status === RESULTS.GRANTED) {
          console.log('Location permission granted.');
          await getCurrentPosition();
        } else {
          console.log('Location permission denied.');
          setLocationDialog(true);
          setGettingLocation(false);
        }
      } else if (Platform.OS === 'android') {
        const granted = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        const isEnable = await isLocationEnabled();

        if (granted === RESULTS.GRANTED) {
          console.log('Location permission granted.');
          await getCurrentPosition();
        } else {
          console.log('Location permission denied.');
          setLocationDialog(true);
          setGettingLocation(false);
        }
        if (granted === RESULTS.GRANTED && !isEnable) {
          await promptForEnableLocationIfNeeded();
          await getCurrentPosition();
        }
      }
    } catch (error) {
      setGettingLocation(false);
      console.log('Error requesting location permissions:', error);
    }
  };

  const getCurrentPosition = async () => {
    console.log('Getting location');

    Geolocation.getCurrentPosition(
      async position => {
        setRegion(prevRegion => ({
          ...prevRegion,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        // console.log('Current position:', position.coords);

        if (mapRef.current) {
          setTimeout(() => {
            mapRef.current.animateCamera({
              center: position.coords,
              zoom: 18,
              heading: 0,
              pitch: 0,
            });
          }, 50);
        }

        setUserLocation(position.coords);

        setGettingLocation(false);
        await setNearby();
      },
      error => {
        setGettingLocation(false);
        if (error.code === 2) {
          console.log('Location not available, please try again later');
          getCurrentPosition();
        } else if (error.PERMISSION_DENIED === 1) {
          // setLocationDialog(true);
        }
        console.log('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        useSignificantChanges: Platform.OS === 'ios' ? false : true,
        timeout: 5000,
      },
    );
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180); // Convert degrees to radians
    const dLon = (lon2 - lon1) * (Math.PI / 180); // Convert degrees to radians
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return distance;
  };

  const filterNearbyStations = async (chargingStations, userLocation) => {
    let nearby_distance = await AsyncStorage.getItem('nearby_distance');
    setNearbyVal(nearby_distance);

    const nearbyStations = chargingStations
      .map(station => ({
        ...station,
        distance: getDistance(
          userLocation.latitude,
          userLocation.longitude,
          station.latitude,
          station.longitude,
        ),
      }))
      .filter(station => station.distance <= parseFloat(nearby_distance))
      .sort((a, b) => a.distance - b.distance);
    setNearbyStationsList(nearbyStations);
    return nearbyStations;
  };

  useEffect(() => {
    storeDistance();

    return () => {};
  }, [savedmarkers]);

  const storeDistance = async () => {
    let station_distance = [];

    station_distance = savedmarkers.map(marker => {
      const markerDistance = getDistance(
        userLocation.latitude,
        userLocation.longitude,
        marker.latitude,
        marker.longitude,
      );

      return {
        station_name: marker.station_name,
        latitude: marker.latitude,
        longitude: marker.longitude,
        station_id: marker.station_id,
        distance: markerDistance,
      };
    });

    await AsyncStorage.setItem(
      'station_distance',
      JSON.stringify(station_distance),
    );
  };

  function PosterModel() {
    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,

          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
        }}>
        <View
          style={{
            height: 400,
            width: 400,
          }}>
          <Image
            onTouchEnd={() => {
              navigation.navigate('Updates');
              setUtilityPoster('');
            }}
            source={{uri: utilityPoster}}
            className="h-[90%] w-[90%] self-center"
            resizeMode="cover"
          />
          <IconButton
            onPress={() => {
              setUtilityPoster('');
            }}
            icon={'close'}
            mode="contained-tonal"
            style={{position: 'absolute', right: 20, top: 0, zIndex: 1}}
          />
        </View>
      </Animated.View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="flex-1">
        <NetworkStatus />
        <Surface
          mode="flat"
          className="flex-1 h-full self-stretch bg-[#E2EFD6]">
          <View
            style={{
              width: '100%',
              height: '99%',
              overflow: 'hidden',
              backgroundColor: 'white',
              elevation: 2,
              borderBottomStartRadius: 35,
              borderBottomEndRadius: 35,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.2,
              shadowRadius: 1.41,
            }}>
            {renderMapView()}
          </View>
          {renderHeader()}
        </Surface>

        {nearbyStationsList && nearbyStationsList.length > 0 && (
          <Animated.ScrollView
            entering={FadeInDown.duration(500).easing(Easing.linear)}
            horizontal
            style={{
              position: 'absolute',
              bottom: 25,
              left: 15,
              right: 15,
            }}
            showsHorizontalScrollIndicator={false}>
            {nearbyStationsList.map((item, index) => {
              return nearbyCard(item, index);
            })}
          </Animated.ScrollView>
        )}

        {nearbyStationsList && nearbyStationsList.length === 0 && (
          <Animated.View
            entering={FadeInDown.duration(500).easing(Easing.linear)}
            style={{
              position: 'absolute',
              bottom: 25,
              left: 15,
              right: 15,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 10,
              borderRadius: 12,
              backgroundColor: '#ffffff',
              zIndex: 1000,
              shadowColor: '#6BB14F',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}>
            <Text variant="bodyLarge" className="text-center text-[#6BB14F]">
              No station found in your area with in {nearbyVal} km
            </Text>
          </Animated.View>
        )}

        {showStations &&
          stationCard({
            data: stationCardInfo,
            distance: stationCardDistance,
            style: {
              position: 'absolute',
              bottom: 18,
              right: 20,
              left: 20,
              zIndex: 1000,
              padding: 2,
              borderRadius: 12,
            },
            navigation,
            enterAnimation: SlideInDown.duration(300).easing(Easing.linear),
            exitAnimation: SlideOutDown.duration(300).easing(Easing.linear),
          })}

        {isMapReady && footer()}

        {locDialog()}
        {notificationDialog()}
        {energyCalculatorDialog()}
        {utilityPoster !== '' ? PosterModel() : <></>}
      </View>
    </KeyboardAvoidingView>
  );

  function energyCalculatorDialog() {
    return (
      <Dialog
        visible={energyDialog}
        onDismiss={() => {
          setEnergyDialog(false);
          setValues({currentPercentage: '', batteryCapacity: ''});
          setRequiredEnergy(0);
        }}>
        <Text className="mx-5" variant="titleLarge">
          Energy Calculator
        </Text>
        <Text className=" mx-5 my-2" variant="labelMedium">
          Calculate estimate energy required to fully charge your vehicle
        </Text>
        <Dialog.Content>
          <Animated.View
            needsOffscreenAlphaCompositing
            entering={FadeIn}
            className="items-center w-full">
            <TextInput
              label="Enter Current Percentage (%)"
              mode="outlined"
              className="w-full h-10"
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
              value={values.currentPercentage}
              onChangeText={text => {
                setValues({
                  ...values,
                  currentPercentage: Number(text),
                });
              }}
            />

            <View className="h-3" />

            <TextInput
              label="Enter Battery Capacity (kWh)"
              value={values.batteryCapacity}
              onChangeText={text => {
                setValues({
                  ...values,
                  batteryCapacity: Number(text),
                });
              }}
              keyboardType="numeric"
              mode="outlined"
              className="w-full h-10"
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
            />
          </Animated.View>

          {requiredEnergy > 0 && (
            <Animated.View
              needsOffscreenAlphaCompositing
              entering={FadeIn}
              className="items-center my-2">
              <Text variant="bodyLarge" className="text-center text-[#6BB14F]">
                The estimated energy required to fully charge your vehicle from{' '}
                {values.currentPercentage}% to 100% is approximately{'\n'}
                {requiredEnergy} kWh
              </Text>
            </Animated.View>
          )}

          <View className="flex-row w-full mt-3 items-center justify-between">
            <Button
              mode="elevated"
              textColor="red"
              className="w-[35%]"
              onPress={() => {
                setEnergyDialog(false);
                setValues({currentPercentage: '', batteryCapacity: ''});
                setRequiredEnergy(0);
              }}>
              Close
            </Button>
            <Button
              mode="contained"
              className="w-[60%]"
              onPress={() => {
                if (
                  values.currentPercentage === 0 ||
                  values.currentPercentage === '' ||
                  values.batteryCapacity === 0 ||
                  values.batteryCapacity === ''
                ) {
                  Toast.show('Please enter both current and battery capacity', {
                    type: 'custom_toast',
                    data: {
                      title: 'Error',
                    },
                  });
                } else {
                  const calculation =
                    (values.batteryCapacity *
                      (100 - values.currentPercentage)) /
                    100;

                  setRequiredEnergy(calculation);
                }
              }}>
              Calculate
            </Button>
          </View>
        </Dialog.Content>
      </Dialog>
    );
  }

  function notificationDialog() {
    return (
      <Dialog
        visible={noficationDialog}
        onDismiss={() => setNotificationDialog(false)}>
        <Dialog.Title className="text-center">Alert</Dialog.Title>

        <Dialog.Content className="items-center">
          <Image source={images.info} className="w-16 h-16" />
          <Text className="text-center" variant="bodyLarge">
            To receive notifications about your charging status and other
            updates, please enable notifications in your device settings.
          </Text>

          <View className="flex-row w-full mt-5 items-center justify-evenly">
            <Button
              mode="outlined"
              onPress={() => setNotificationDialog(false)}>
              <Text>Cancel</Text>
            </Button>

            <Button
              mode="contained"
              className="bg-[#6BB14F]"
              onPress={async () => {
                Linking.openSettings();
                setNotificationDialog(false);
              }}>
              <Text className="text-white">Settings</Text>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog>
    );
  }

  function locDialog() {
    return (
      <Dialog
        visible={locationDialog}
        onDismiss={() => setLocationDialog(false)}>
        <Dialog.Title className="text-center">Alert</Dialog.Title>

        <Dialog.Content className="items-center">
          <Image source={images.info} className="w-16 h-16" />
          <Text className="text-center" variant="bodyLarge">
            To find nearby stations, we need access to your device's location.
            Please enable location permissions in your device settings.
          </Text>

          <View className="flex-row w-full mt-5 items-center justify-evenly">
            <Button mode="outlined" onPress={() => setLocationDialog(false)}>
              <Text>Cancel</Text>
            </Button>

            <Button
              mode="contained"
              className="bg-[#6BB14F]"
              onPress={async () => {
                Linking.openSettings();
                setLocationDialog(false);
              }}>
              <Text className="text-white">Settings</Text>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog>
    );
  }

  function nearbyCard(item, index) {
    const address =
      item['station_address_one'] +
      ',' +
      item['station_address_two'] +
      ',' +
      item['station_address_landmark'] +
      ',' +
      item['location_name'] +
      ',' +
      item['city_name'] +
      ',' +
      item['state_name'] +
      ',' +
      item['country_name'] +
      ',' +
      item['pin_code'];

    const latLong = item['latitude'] + ',' + item['longitude'];
    return (
      <TouchableRipple
        key={index}
        borderless={false}
        style={{
          width: width - 90,
          borderRadius: 10,
          marginRight: 10,
          marginVertical: 5,
          shadowColor: '#6BB14F',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 5,
          backgroundColor: 'white',
        }}
        onPress={() => {
          if (item['is_ocpi'] === 1) {
            navigation.navigate('OcpiStationDetail', {
              station_id: item['station_id'],
            });
          } else {
            navigation.navigate('StationDetail', {
              station_id: item['station_id'],
            });
          }
        }}>
        <LinearGradient
          style={{borderRadius: 10}}
          className={'flex-1 p-1'}
          useAngle={true}
          angle={140}
          angleCenter={{x: 0, y: 0.5}}
          colors={
            item.is_ocpi === 1 ? ['#F8F8F8', '#F8F8F8'] : ['#6BB14F', '#F8F8F8']
          }>
          <View className="flex-row justify-between items-center px-1">
            <Text variant="bodySmall">Nearby Station</Text>
            <View className="flex-row">
              <View className="mr-1">
                <View className="rounded-lg bg-[#6BB14F] px-2 py-1">
                  <Text variant="labelSmall" className="text-white">
                    {item.charger_type}
                  </Text>
                </View>
              </View>
              <View>
                <View className="rounded-lg bg-[#6BB14F] px-2 py-1">
                  <Text variant="labelSmall" className="text-white">
                    {item.station_visibility === 'Private'
                      ? 'Restricted'
                      : 'Public'}
                  </Text>
                </View>
              </View>
              <View className="w-1" />
              <View className="flex-row items-center">
                <Image
                  source={images.map_pin}
                  style={{width: 20, height: 20}}
                />
                <View className="w-1" />

                <Text variant="titleSmall" className="text-[#79747E]">
                  {Number(item['distance']).toFixed(2)} km
                </Text>
              </View>
            </View>
          </View>
          <View className="flex-1 flex-row  justify-between items-center p-1">
            <View className="flex-1">
              <Text className="text-sm mb-0.5" numberOfLines={1}>
                {item['station_name']}
              </Text>
              <Text
                variant="labelSmall"
                className="text-[#79747E]"
                numberOfLines={2}>
                {address}
              </Text>
            </View>

            <TouchableRipple
              onPress={() => {
                const url = Platform.select({
                  ios: `google.navigation:q=${latLong}`,
                  android: `google.navigation:q=${latLong}`,
                });

                Linking.openURL(url).catch(e => {
                  const errText = 'Unable to open URL';
                  if (e.message.includes(errText)) {
                    Linking.openURL(`https://maps.google.com/?q=${latLong}`);
                  }
                });
              }}
              className={`bg-[#6BB14F] h-10 w-10 rounded-full shadow-sm shadow-gray-400 justify-center items-center`}>
              <Image source={images.direction} className="w-5 h-5" />
            </TouchableRipple>
          </View>
        </LinearGradient>
      </TouchableRipple>
    );
  }

  function footer() {
    return (
      <Animated.View
        style={[
          animatedStyle,
          {
            position: 'absolute',
            right: 20,
          },
        ]}>
        <TouchableRipple
          onPress={() => {
            setEnergyDialog(true);
          }}
          className={` bg-[#6BB14F] h-12 w-12 rounded-2xl shadow-sm shadow-black justify-center items-center`}>
          <Image
            source={images.batteryEv}
            className="w-7 h-7"
            tintColor={'white'}
          />
        </TouchableRipple>
        <View className="h-4" />

        <TouchableRipple
          disabled={gettingLocation}
          onPress={() => {
            setGettingLocation(true);
            setTimeout(() => {
              requestLocationPermissions();
            }, 200);
          }}
          className={` bg-[#6BB14F] h-12 w-12 rounded-2xl shadow-sm shadow-black justify-center items-center`}>
          {gettingLocation ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Image source={images.location_icon} className="w-7 h-7" />
          )}
        </TouchableRipple>
      </Animated.View>
    );
  }

  function renderHeader() {
    return (
      <View className="absolute top-8 left-5 right-5 flex-row item-center justify-between">
        <View className="flex-1 w-[100%]">
          <TextInput
            placeholder="Search Stations"
            mode="outlined"
            className="w-[93%] h-11 bg-[#ffffff] shadow-sm shadow-gray-400"
            contentStyle={{paddingTop: 10, paddingBottom: 10}}
            outlineStyle={{
              elevation: 4,
              borderRadius: 30,
              borderWidth: 0,
              backgroundColor: 'white',
            }}
            value={searchText}
            onChangeText={text => {
              setSearchText(text);

              const newFilterStation = savedmarkers.filter(item => {
                const nameMatch =
                  item.station_name
                    .toLowerCase()
                    .includes(text.toLowerCase()) ||
                  item.location_name.toLowerCase().includes(text.toLowerCase());
                return nameMatch;
              });

              setFilterStation(newFilterStation);
              if (text.length == 0) {
                setFilterStation([]);
              }
            }}
            left={
              <TextInput.Icon
                forceTextInputFocus={false}
                icon={() => (
                  <Image className="w-6 h-6" source={images.search} />
                )}
              />
            }
            right={
              searchText.length > 0 ? (
                <TextInput.Icon
                  forceTextInputFocus={false}
                  onPress={() => {
                    setSearchText('');
                    getCurrentPosition();
                    Keyboard.dismiss();
                  }}
                  icon={() => (
                    <Animated.Image
                      entering={FadeIn}
                      exiting={FadeOut}
                      className="w-6 h-6"
                      source={images.close}
                    />
                  )}
                />
              ) : (
                <></>
              )
            }
          />
          {searchText.length > 0 ? (
            <Animated.View
              entering={FadeInUp}
              exiting={FadeOutUp}
              style={{elevation: 5}}
              className={`flex-1 h-40 mt-1 w-[93%] bg-white rounded-2xl shadow-sm shadow-gray-400`}>
              <FlashList
                estimatedItemSize={55}
                data={filterStation}
                ItemSeparatorComponent={() => <Divider bold />}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={true}
                indicatorStyle="black"
                renderItem={({item}) => {
                  return (
                    <TouchableRipple
                      onPress={() => {
                        const coords = {
                          latitude: item.latitude,
                          longitude: item.longitude,
                        };
                        mapRef.current.animateCamera({
                          center: coords,
                          zoom: 20,
                          heading: 0,
                          pitch: 0,
                        });
                        Keyboard.dismiss();
                        setSearchText('');

                        markerOnTap(item.station_id);
                      }}>
                      <Text variant="labelMedium" className={'p-2'}>
                        {item.station_name}
                      </Text>
                    </TouchableRipple>
                  );
                }}
                keyExtractor={item => item['station_id']}
                ListEmptyComponent={
                  <View className="flex-1 h-40 justify-center items-center">
                    <Animated.Text
                      className="text-gray-400"
                      style={{
                        fontFamily: 'Exo2-Medium',
                        fontSize: 16,
                      }}
                      entering={FadeIn}
                      exiting={FadeOut}>
                      No stations found
                    </Animated.Text>
                  </View>
                }
              />
            </Animated.View>
          ) : null}
        </View>

        <TouchableRipple
          onPress={() => {
            navigation.navigate('QRScanner');
          }}
          className="bg-[#6BB14F] h-12 w-12 rounded-full shadow-xl justify-center items-center">
          <Image source={images.scan} className="w-7 h-7" />
        </TouchableRipple>
      </View>
    );
  }

  function renderMapView() {
    return (
      <AnimatedMap
        showsCompass={false}
        initialCamera={{
          center: region,
          zoom: 0,
          heading: 0,
          pitch: 0,
        }}
        scrollEnabled={mapFocused}
        provider={PROVIDER_GOOGLE}
        onMapReady={e => {
          onMapReadyFun();
        }}
        onPanDrag={() => {
          if (showStations) {
            setShowStations(false);
            setStationCardInfo({});
            changeLocationPosition(animatedBottom.value === 130 ? 300 : 130);
            setMarkers(savedmarkers);
          }
        }}
        onPress={() => {
          if (showStations) {
            setShowStations(false);
            setStationCardInfo({});
            changeLocationPosition(animatedBottom.value === 130 ? 300 : 130);
            setMarkers(savedmarkers);
          }
        }}
        ref={ref => (mapRef.current = ref)}
        customMapStyle={mapStyle}
        mapPadding={{bottom: 20, left: 20}}
        showsScale={false}
        showsBuildings={false}
        showsMyLocationButton={false}
        showsTraffic={false}
        showsIndoors={false}
        showsIndoorLevelPickers={false}
        showsPointsOfInterest={false}
        mapType="standard"
        style={{flex: 1}}
        followsUserLocation={true}
        loadingEnabled={true}
        renderToHardwareTextureAndroid={true}
        showsUserLocation={false}
        toolbarEnabled={false}
        camera={{center: region, zoom: 17, heading: 0, pitch: 0}}
        region={region}>
        {markers.map((mark, index) => {
          return (
            <MarkerAnimated
              key={index}
              coordinate={mark}
              image={
                mark.is_ocpi === 1
                  ? require('../../assets/images/otherMarkerPin.png')
                  : require('../../assets/images/markerPin.png')
              }
              // image={require('../../assets/images/icons/marker.png')}
              onPress={() => {
                markerOnTap(mark.station_id);
              }}
            />
          );
        })}

        {userLocation && userLocation.latitude !== 0 && (
          <Marker
            coordinate={userLocation}
            image={require('../../assets/images/icons/user_location.png')}
          />
        )}
      </AnimatedMap>
    );
  }
}
