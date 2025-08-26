import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Image, Linking, Platform, Share, View} from 'react-native';
import {useForeground} from 'react-native-google-mobile-ads';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Divider,
  IconButton,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import Animated, {FadeIn} from 'react-native-reanimated';
import {Toast} from 'react-native-toast-notifications';
import {images} from '../../assets/images/images';
import {ocpiStationInfoFun} from '../../services/station_service';
import MyBannerAd from '../../utils/components/banner_ad';
import {isIos} from '../../utils/helpers';

const OcpiStationDetail = ({navigation, route}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [station_id, setStationId] = useState(null);
  const [stationInfoData, setStationInfoData] = useState({});
  const [address, setAddress] = useState('');
  const [latLong, setLatLong] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState(0);
  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [chargerList, setChargerList] = useState([]);
  const [chargerType, setChargerType] = useState('');

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  useEffect(() => {
    if (route.params?.station_id) {
      setStationId(route.params.station_id);
      fetchStationInfo(route.params.station_id);
    } else {
      Toast.show('Something went wrong..!!', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  }, [route.params]);

  useEffect(() => {
    let intervalId;
    const intervalFun = async () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(async () => {
        const response = await ocpiStationInfoFun(route.params.station_id);
        if (response?.success) {
          const stationData = response.data[0];
          setStationInfoData(stationData);
          setAddress(formatAddress(stationData));
          setLatLong(
            `${stationData.coordinates_lat},${stationData.coordinates_long}`,
          );
        }
      }, 60000);
    };
    intervalFun();
    return () => clearInterval(intervalId);
  }, [route.params.station_id]);

  const fetchStationInfo = async stationId => {
    try {
      setIsLoading(true);
      const response = await ocpiStationInfoFun(stationId);

      if (response?.success) {
        const stationData = response.data[0];

        // console.log('stationData', stationData);

        const stationCharger = stationData.charger;
        console.log('stationCharger', stationCharger);

        if (stationCharger.length > 0) {
          const chargerType = stationCharger[0].connector[0].power_type;
          setChargerType(chargerType);
        }

        setStationInfoData(stationData);
        setChargerList(stationCharger);
        setAddress(formatAddress(stationData));
        setLatLong(
          `${stationData.coordinates_lat},${stationData.coordinates_long}`,
        );

        const distanceData = await AsyncStorage.getItem('station_distance');
        const foundDistance = JSON.parse(distanceData)?.find(station => {
          return station.station_id === stationData.ocpi_station_id;
        });
        setDistance(foundDistance?.distance || 0);

        setIsLoading(false);
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
        setIsRefreshing(false);
        Toast.show(response?.message, {
          type: 'custom_toast',
          data: {title: 'Info'},
        });
      }
    } catch (error) {
      setIsRefreshing(false);
      setIsLoading(false);
      Toast.show('Error fetching station info. Please try again.', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  const formatAddress = data => {
    return `${data.address}, ${data.city},  ${data.state}, ${data.country}, ${data.postal_code}`;
  };

  const handleShareLocation = async () => {
    try {
      const result = await Share.share({
        message: `${stationInfoData.station_name} \n\n ${address} \n\n https://www.google.com/maps/search/?api=1&query=${latLong}`,
        url: `https://www.google.com/maps/search/?api=1&query=${latLong}`,
        title: 'EV Chargify APP',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // handle activityType
        }
      } else if (result.action === Share.dismissedAction) {
        // handle dismissal
      }
    } catch (error) {
      Toast.show(error.message || 'Error sharing location', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  const handleNavigation = () => {
    const url = Platform.select({
      ios: `maps:${latLong}?q=${address}`,
      android: `google.navigation:q=${latLong}`,
    });
    Linking.openURL(url);
  };

  const Header = useMemo(() => {
    return (
      <View pointerEvents="box-none">
        <Appbar className="bg-transparent" mode="center-aligned">
          <IconButton
            icon={() => (
              <Image source={images.back} style={{width: 24, height: 24}} />
            )}
            onPress={() => navigation.goBack()}
          />
          <Appbar.Content title="Station Info" />
          <Appbar.Action icon="share-variant" onPress={handleShareLocation} />
        </Appbar>

        <Image
          className="w-[95%] h-32 rounded-3xl self-center bg-white"
          resizeMode="contain"
          source={{uri: stationInfoData.mst_emsp_logo}}
        />

        <View className="px-4 pt-4">
          <View className="flex-row items-start justify-between">
            <Text
              className="w-[90%]"
              variant="titleLarge"
              ellipsizeMode="tail"
              numberOfLines={3}>
              {stationInfoData.name}
            </Text>
          </View>
          <View className="flex-row items-start justify-between mt-2">
            <Text
              variant="titleMedium"
              className="text-[#79747E] w-[89%] mr-1"
              ellipsizeMode="tail"
              numberOfLines={5}>
              {address}
            </Text>
            <TouchableRipple
              onPress={handleNavigation}
              className={`bg-[#6BB14F] h-10 w-10 rounded-full shadow-sm shadow-gray-400 justify-center items-center`}>
              <Image source={images.direction} className="w-5 h-5" />
            </TouchableRipple>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center my-3">
              <View className="rounded-lg bg-[#6BB14F] p-1 px-3">
                <Text variant="titleSmall" className="text-white">
                  {stationInfoData.publish != 1 ? 'Restricted' : 'Public'}
                </Text>
              </View>
              <View className="rounded-lg bg-[#6BB14F] p-1 px-3 ml-2">
                <Text variant="titleSmall" className="text-white">
                  {chargerType}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center ml-2">
              <Image source={images.map_pin} style={{width: 24, height: 24}} />
              <Text variant="titleSmall" className="text-[#79747E] ml-1">
                {Number(distance).toFixed(2)} km
              </Text>
            </View>
          </View>
          <View className="flex-row items-center ml-2 mt-1">
            <Image
              source={images.chargingStation}
              style={{width: 28, height: 28}}
            />
            <Text variant="bodyLarge" className="text-[#79747E] font-bold ml-1">
              {stationInfoData.mst_emsp_name}
            </Text>
          </View>
          <Divider className="mt-4" bold />
        </View>
      </View>
    );
  }, [stationInfoData, address, latLong, distance]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center h-48">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Animated.ScrollView
        needsOffscreenAlphaCompositing={true}
        entering={FadeIn}
        className="flex-1 h-full">
        {Header}

        <View className="p-4 ">
          {chargerList.map((chargerItem, index) =>
            chargerItem.connector.map((connectorItem, index) => {
              const statusMap = {
                AVAILABLE: 'Available',
                BLOCKED: 'Available',
                CHARGING: 'Busy',
                RESERVED: 'Busy',
                PLANNED: 'Maintenance',
                UNKNOWN: 'Maintenance',
                INOPERATIVE: 'Maintenance',
                OUTOFORDER: 'Maintenance',
                REMOVED: 'Maintenance',
              };
              const connectorStatus = statusMap[chargerItem.ocpi_status] || '';
              const connectorStatusColor =
                connectorStatus === 'Available' ? '#6BB14F' : '#E31E24';
              const connectorTypeMap = {
                IEC_62196_T2_COMBO: 'CCS2',
                IEC_62196_T2: 'Type 2',
              };
              const connectorType =
                connectorTypeMap[connectorItem.standard] || 'Domestic';

              const connectorMap = {
                'Type 2': images.Type2,
                CCS2: images.CCS2,
              };

              const connectorImage = connectorMap[connectorType] || images.IEC;

              return (
                <Card
                  style={{
                    borderStartWidth: 6,
                    borderRadius: 10,
                    margin: 4,
                    backgroundColor: 'white',
                    marginBottom: 8,
                    borderStartColor: connectorStatusColor,
                  }}
                  // disabled={connectorStatus !== 'Available'}
                  onPress={() => {
                    const data = {
                      stationInfoData,
                      station_id: station_id,
                      station_charger_id: chargerItem.ocpi_station_charger_id,
                      station_charger_connector_id:
                        connectorItem.ocpi_station_charger_connector_id,
                      connector_image: connectorImage,
                      connector_type: connectorType,
                      charger_type: chargerType,
                      gun_type: chargerItem.physical_reference,
                    };

                    navigation.navigate('ChargerInfo', data);
                  }}>
                  <Card.Content>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          backgroundColor: '#99D9D9',
                          paddingHorizontal: 15,
                          paddingVertical: 5,
                          borderRadius: 5,
                        }}>
                        <Text variant="bodyMedium">
                          {connectorItem.power_type}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Text variant="bodyMedium">{connectorStatus}</Text>
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            marginLeft: 8,
                            backgroundColor: connectorStatusColor,
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 4,
                      }}>
                      <Text variant="bodyLarge" className="text-[#6BB14F]">
                        {connectorType} - {chargerItem.physical_reference}
                      </Text>
                      <Image
                        source={connectorImage}
                        className="w-16 h-16"
                        style={{
                          width: 54,
                          height: 54,
                          tintColor: '#6BB14F',
                        }}
                      />
                    </View>

                    <Button
                      disabled={connectorStatus !== 'Available'}
                      onPress={() => {
                        const data = {
                          stationInfoData,
                          station_id: station_id,
                          station_charger_id:
                            chargerItem.ocpi_station_charger_id,
                          station_charger_connector_id:
                            connectorItem.ocpi_station_charger_connector_id,
                          connector_image: connectorImage,
                          connector_type: connectorType,
                          charger_type: chargerType,
                          gun_type: chargerItem.physical_reference,
                        };

                        navigation.navigate('ChargerInfo', data);
                      }}
                      className={'mt-4'}
                      mode="contained">
                      Charge Now
                    </Button>
                  </Card.Content>
                </Card>
              );
            }),
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default OcpiStationDetail;
