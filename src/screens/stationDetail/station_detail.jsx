import {Rating} from '@kolking/react-native-rating';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Share,
  View,
} from 'react-native';
import {useForeground} from 'react-native-google-mobile-ads';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Dialog,
  Divider,
  IconButton,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import Animated, {Easing, FadeIn} from 'react-native-reanimated';
import {Toast} from 'react-native-toast-notifications';
import {images} from '../../assets/images/images';
import {FavAddService} from '../../services/favourite_service';
import {getStationReview} from '../../services/review_service';
import {
  stationInfoFun,
  stationMaintenaceService,
} from '../../services/station_service';
import {transactionFailCheckService} from '../../services/transaction_service';
import MyBannerAd from '../../utils/components/banner_ad';
import {isIos} from '../../utils/helpers';
import ChargerInfoList from './charger_info_list';
import {ImageSlider} from './image_slider';
import ReviewInfo from './review_info';
import StationInfo from './station_info';
import StepsInfo from './steps_info';
import LinearGradient from 'react-native-linear-gradient';
import SegmentedControl from 'react-native-segmented-control-2';

const StationDetail = ({navigation, route}) => {
  const [isFav, setIsFav] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [station_id, setStationId] = useState(null);
  const [stationInfoData, setStationInfoData] = useState({});
  const [address, setAddress] = useState('');
  const [latLong, setLatLong] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState(0);
  const [maintnStatus, setMaintnStatus] = useState('');
  const [maintnStartDate, setMaintnStartDate] = useState('');
  const [maintnEndDate, setMaintnEndDate] = useState('');

  const [rating, setRating] = useState(0);
  const [reviewData, setReviewData] = useState([]);
  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [failCheckData, setFailCheckData] = useState({});
  const [showFailCheckDialog, setShowFailCheckDialog] = useState(false);
  const [chargerErrInfoData, setChargerErrInfoData] = useState([]);
  const [chargeErrDialog, setChargerErrDialog] = useState(false);
  const [energyDialog, setEnergyDialog] = useState(false);
  const [values, setValues] = useState({
    currentPercentage: 0,
    batteryCapacity: 0,
  });
  const [requiredEnergy, setRequiredEnergy] = useState(0);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  useEffect(() => {
    if (route.params?.station_id) {
      setStationId(route.params.station_id);
      fetchStationInfo(route.params.station_id);
      failCheck(route.params.station_id);
    } else {
      Toast.show('Something went wrong..!!', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  }, [route.params]);

  const failCheck = async stationId => {
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');

      const response = await transactionFailCheckService(
        customer_id,
        stationId,
      );

      if (response.success) {
        console.log('******************* failCheck response', response);
        setShowFailCheckDialog(true);
        setFailCheckData(response);
      }
    } catch (error) {
      console.log('failCheck error', error);
    }
  };

  useEffect(() => {
    let intervalId;
    const intervalFun = async () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(async () => {
        const response = await stationInfoFun(route.params.station_id);
        if (response?.success) {
          const stationData = response.data[0];
          setStationInfoData(stationData);
          setIsFav(stationData.favorite_station_status === 1);
          setAddress(formatAddress(stationData));
          setLatLong(`${stationData.station_lat},${stationData.station_long}`);
        }
      }, 60000);
    };
    intervalFun();
    return () => clearInterval(intervalId);
  }, [route.params.station_id]);

  const fetchStationInfo = async stationId => {
    try {
      setIsLoading(true);
      const response = await stationInfoFun(stationId);
      const maintenanceResponse = await stationMaintenaceService(stationId);

      if (maintenanceResponse?.data?.length) {
        const {start_dt, end_dt, maintenance_status} =
          maintenanceResponse.data[0];
        setMaintnStartDate(start_dt);
        setMaintnEndDate(end_dt);
        setMaintnStatus(maintenance_status);
      }

      await fetchReviews(stationId);
      if (response?.success) {
        const stationData = response.data[0];

        const chargerErrData = stationData['chargerData'].filter(
          charger => charger.is_information == 1,
        );

        setChargerErrInfoData(chargerErrData);

        if (chargerErrData.length > 0) {
          setTimeout(() => {
            setChargerErrDialog(true);
          }, 500);
        }

        setStationInfoData(stationData);
        setIsFav(stationData.favorite_station_status === 1);
        setAddress(formatAddress(stationData));
        setLatLong(`${stationData.station_lat},${stationData.station_long}`);

        const distanceData = await AsyncStorage.getItem('station_distance');
        const foundDistance = JSON.parse(distanceData)?.find(
          station => station.station_id === stationData.station_id,
        );
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
    return `${data.station_address_one}, ${data.station_address_two}, ${data.station_address_landmark}, ${data.location_name}, ${data.city_name}, ${data.state_name}, ${data.country_name}, ${data.pin_code}`;
  };

  const fetchReviews = async stationId => {
    try {
      const reviews = await getStationReview(stationId);
      if (reviews?.[0]) {
        setReviewData(reviews);
        setRating(parseFloat(reviews[0].average_rating));
      }
    } catch (error) {
      console.error('Error fetching reviews', error);
    }
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

  const handleFavToggle = async () => {
    try {
      let customerId = await AsyncStorage.getItem('customer_id');
      await FavAddService(
        customerId,
        stationInfoData.station_id,
        isFav ? 2 : 1,
      );
      setIsFav(!isFav);
      Toast.show(isFav ? 'Removed from Favourites' : 'Added to Favourites', {
        type: 'custom_toast',
        data: {title: 'Info'},
      });
    } catch (error) {
      Toast.show('Error updating favourites. Please try again.', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  const handleNavigation = () => {
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
  };

  const Header = useMemo(() => {
    return (
      <View pointerEvents="box-none">
        <Appbar className="bg-transparent" mode="center-aligned">
          <IconButton
            icon={() => (
              <Image
                source={images.back}
                style={{width: 24, height: 24, tintColor: 'white'}}
              />
            )}
            onPress={() => navigation.goBack()}
          />
          <Appbar.Content color="white" title="EV Chargify Station Info" />
          <Appbar.Action
            color="white"
            icon="share-variant"
            onPress={handleShareLocation}
          />
        </Appbar>

        <ImageSlider
          handleFavToggle={handleFavToggle}
          isFav={isFav}
          imageList={stationInfoData.imgData}
        />

        {maintnStatus && (
          <Surface mode="flat" className="px-4 pt-2 bg-transparent">
            <Text
              className="text-red-700"
              variant="bodyLarge"
              ellipsizeMode="tail"
              numberOfLines={3}>
              Scheduled Maintenance
            </Text>
            <Text
              className="text-red-500 mt-2"
              variant="bodyMedium"
              ellipsizeMode="tail"
              numberOfLines={3}>
              From {maintnStartDate} to {maintnEndDate}
            </Text>
            <Text
              className="text-red-500 mt-1"
              variant="bodyMedium"
              ellipsizeMode="tail"
              numberOfLines={3}>
              Status: {maintnStatus}
            </Text>
          </Surface>
        )}

        <View className="px-4 pt-1">
          <Text
            className="w-[100%]"
            variant="titleLarge"
            ellipsizeMode="tail"
            numberOfLines={3}>
            {stationInfoData.station_name}
          </Text>
          <View className="flex-row items-start justify-between mt-1">
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
          <View className="flex-row flex-wrap gap-1  items-center justify-between my-2">
            <View className="flex-row items-center">
              <View className="rounded-lg bg-[#6BB14F] p-1 px-3">
                <Text variant="titleSmall" className="text-white">
                  {stationInfoData.station_visibility === 'Private'
                    ? 'Restricted'
                    : 'Public'}
                </Text>
              </View>
              <View className="rounded-lg bg-[#6BB14F] p-1 px-3 ml-2">
                <Text variant="titleSmall" className="text-white">
                  {stationInfoData.charger_type}
                </Text>
              </View>
              <View className="flex-row items-center ml-2">
                <Image
                  source={images.map_pin}
                  style={{width: 24, height: 24}}
                />
                <Text variant="titleSmall" className="text-[#79747E] ml-1">
                  {Number(distance).toFixed(2)} km
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Text variant="titleMedium" className="text-[#79747E] mr-2">
                {parseFloat(rating).toFixed(1)}
              </Text>
              <Rating
                size={15}
                fillColor="#6BB14F"
                disabled={true}
                rating={rating}
                fillSymbol={images.star_fill}
                baseSymbol={images.star}
                baseColor="#6BB14F"
              />
            </View>
          </View>
          <View className="flex-row items-center ml-2 mt-1">
            <Image
              source={images.chargingStation}
              style={{width: 28, height: 28}}
            />
            <Text variant="bodyLarge" className="text-[#79747E] font-bold ml-1">
              EV Chargify
            </Text>
          </View>
          <Divider className="mt-4" bold />
        </View>
      </View>
    );
  }, [
    stationInfoData,
    isFav,
    address,
    latLong,
    maintnStatus,
    maintnStartDate,
    maintnEndDate,
    rating,
    distance,
  ]);

  const tabs = ['Steps', 'Info', 'Chargers', 'Reviews'];
  const [selectedIndex, setSelectedIndex] = useState(2);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center h-48">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Animated.View
        needsOffscreenAlphaCompositing={true}
        entering={FadeIn}
        className="flex-1 h-full">
        <LinearGradient
          className={'flex-1'}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 0.7}}
          colors={['#6BB14F', '#F8F8F8']}>
          <ScrollView style={{flex: 1}}>
            {Header}
            <SegmentedControl
              tabs={tabs}
              onChange={index => setSelectedIndex(index)}
              value={selectedIndex}
              initialIndex={3}
              textStyle={{
                fontSize: 14,
                fontFamily: 'Exo2-Bold',
                color: '#6BB14F',
              }}
              activeTabColor="#6BB14F"
              activeTextColor="white"
              tabStyle={{
                height: 40,
              }}
              style={{
                backgroundColor: 'transparent',
                alignSelf: 'center',
                marginTop: 15,
              }}
            />
            {selectedIndex === 0 && <StepsInfo stationInfo={stationInfoData} />}
            {selectedIndex === 1 && (
              <StationInfo stationInfoData={stationInfoData} />
            )}
            {selectedIndex === 2 && (
              <ChargerInfoList stationInfoData={stationInfoData} />
            )}
            {selectedIndex === 3 && (
              <ReviewInfo stationId={station_id} reviewData={reviewData} />
            )}
          </ScrollView>
          {failCheckDialog()}
          {chargerInfoErrorDialog()}
          {energyCalculatorDialog()}
          <View className="absolute bottom-10 right-10">
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
          </View>
        </LinearGradient>
      </Animated.View>
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

  function chargerInfoErrorDialog() {
    return (
      <Dialog
        dismissable
        onDismiss={() => setChargerErrDialog(false)}
        style={{maxHeight: '80%'}}
        visible={chargeErrDialog}>
        <Dialog.Title className="self-center">Alert</Dialog.Title>
        <Dialog.Content style={{maxHeight: '90%'}}>
          <ScrollView indicatorStyle="black">
            {chargerErrInfoData.map((item, index) => (
              <>
                <View key={index} className="mb-2 mr-2 flex-row">
                  <Text className="mr-2" variant="labelLarge">
                    {index + 1}.
                  </Text>
                  <Text variant="labelLarge">{item.is_information_note}</Text>
                </View>
                {chargerErrInfoData.length - 1 !== index && (
                  <Divider
                    bold
                    horizontalInset
                    style={{
                      width: '90%',
                      alignSelf: 'center',
                      marginVertical: 5,
                    }}
                  />
                )}
              </>
            ))}
          </ScrollView>
          <Button
            mode="contained"
            className="bg-[#E31E24] self-end mt-5"
            contentStyle={{paddingHorizontal: 12}}
            onPress={() => {
              setChargerErrDialog(false);
              setChargerErrInfoData([]);
            }}>
            <Text className="text-white">Close</Text>
          </Button>
        </Dialog.Content>
      </Dialog>
    );
  }

  function failCheckDialog() {
    return (
      <Dialog
        dismissable
        onDismiss={() => setShowFailCheckDialog(false)}
        visible={showFailCheckDialog}>
        <Dialog.Title className="self-center">Alert</Dialog.Title>
        <Dialog.Content>
          <Text>{failCheckData.message}</Text>
          <Dialog.Actions
            style={{justifyContent: 'center', gap: 8, marginTop: 16}}>
            <Button
              mode="contained"
              className="bg-[#E31E24]"
              contentStyle={{paddingHorizontal: 12}}
              onPress={() => {
                setShowFailCheckDialog(false);
                setFailCheckData({});
              }}>
              <Text className="text-white">No Thanks</Text>
            </Button>
            <Button
              mode="contained"
              contentStyle={{paddingHorizontal: 12}}
              onPress={() => {
                Linking.openURL(
                  `tel:${failCheckData.data[0].customer_support_number}`,
                );
                setShowFailCheckDialog(false);
                setFailCheckData({});
              }}>
              <Text className="text-white">Contact Support Now</Text>
            </Button>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog>
    );
  }
};

export default StationDetail;
function tabButton(setSelectedIndex, index, tab, selectedIndex) {
  return (
    <TouchableRipple
      onPress={() => setSelectedIndex(index)}
      borderless
      key={tab}
      className={
        selectedIndex === index
          ? 'px-4 py-2 border-b-2 border-[#6BB14F] rounded-md'
          : 'px-4 py-2'
      }>
      <Text
        className={
          selectedIndex === index ? 'text-[#6BB14F]' : 'text-[#79747E]'
        }
        variant="titleLarge">
        {tab}
      </Text>
    </TouchableRipple>
  );
}
