import React, {useEffect, useState, useCallback, useMemo, useRef} from 'react';
import {
  Image,
  Linking,
  Platform,
  Share,
  View,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {Tabs} from 'react-native-collapsible-tab-view';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Dialog,
  Divider,
  IconButton,
  ProgressBar,
  Surface,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import Pdf from 'react-native-pdf';
import {Toast} from 'react-native-toast-notifications';
import {images} from '../../assets/images/images';
import {FavAddService} from '../../services/favourite_service';
import {getStationReview} from '../../services/review_service';
import {
  stationInfoFun,
  stationMaintenaceService,
} from '../../services/station_service';
import ChargerInfoList from './charger_info_list';
import {ImageSlider} from './image_slider';
import ReviewInfo from './review_info';
import StationInfo from './station_info';
import {
  FlatList,
  GestureHandlerRootView,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import StepsInfo from './steps_info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Rating} from '@kolking/react-native-rating';
import Loading from '../../utils/components/loading';
import Animated, {FadeIn} from 'react-native-reanimated';
import {useForeground} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';
import {transactionFailCheckService} from '../../services/transaction_service';

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

        <ImageSlider imageList={stationInfoData.imgData} />

        {maintnStatus && (
          <Surface mode="flat" className="px-4 pt-2">
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

        <View className="px-4 pt-4">
          <View className="flex-row items-start justify-between">
            <Text
              className="w-[90%]"
              variant="titleLarge"
              ellipsizeMode="tail"
              numberOfLines={3}>
              {stationInfoData.station_name}
            </Text>
            <TouchableRipple
              className="rounded-full p-1"
              borderless
              onPress={handleFavToggle}>
              <Image
                source={isFav ? images.heart_fill : images.heart}
                style={{width: 28, height: 28}}
              />
            </TouchableRipple>
          </View>
          <Text
            variant="titleMedium"
            className="text-[#79747E]"
            ellipsizeMode="tail"
            numberOfLines={5}>
            {address}
          </Text>
          <View className="flex-row justify-between items-start mt-2">
            <View>
              <View className="flex-row items-center mb-2">
                <Text variant="titleMedium" className="text-[#79747E] mr-2">
                  {parseFloat(rating).toFixed(1)}
                </Text>
                <Rating
                  size={18}
                  fillColor="#6BB14F"
                  disabled={true}
                  rating={rating}
                  fillSymbol={images.star_fill}
                  baseSymbol={images.star}
                  baseColor="#6BB14F"
                />
              </View>
              <View className="flex-row mt-2 items-center">
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
                  <Text variant="titleSmall" className="text-[#79747E]">
                    {Number(distance).toFixed(2)} km
                  </Text>
                </View>
              </View>
            </View>
            <Button
              className="bg-[#6BB14F] rounded-full"
              onPress={handleNavigation}>
              <Image
                source={images.direction}
                style={{width: 16, height: 16}}
              />
              <View className="w-1" />
              <Text variant="bodyMedium" className="text-white">
                Get Direction
              </Text>
            </Button>
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
    <Animated.View
      needsOffscreenAlphaCompositing
      entering={FadeIn}
      className="flex-1 h-full bg-white">
      <FlatList
        ListHeaderComponent={Header}
        data={[1]}
        keyExtractor={(item, index) => item}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              fetchStationInfo(route.params.station_id);
            }}
          />
        }
        renderItem={({item, index}) => {
          return (
            <View>
              {/* Tab Navigation and Content */}
              <View className="flex-row justify-around h-12 items-center">
                {tabs.map((tab, index) => (
                  <TouchableOpacity
                    onPress={() => setSelectedIndex(index)}
                    key={tab}
                    className={
                      selectedIndex === index
                        ? 'px-4 py-2 border-b-2 border-[#6BB14F]'
                        : 'px-4 py-2'
                    }>
                    <Text
                      className={
                        selectedIndex === index
                          ? 'text-[#6BB14F]'
                          : 'text-[#79747E]'
                      }
                      variant="titleLarge">
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Render selected tab content */}
              {selectedIndex === 0 && (
                <StepsInfo stationInfo={stationInfoData} />
              )}
              {selectedIndex === 1 && (
                <StationInfo stationInfoData={stationInfoData} />
              )}
              {selectedIndex === 2 && (
                <ChargerInfoList stationInfoData={stationInfoData} />
              )}
              {selectedIndex === 3 && (
                <ReviewInfo stationId={station_id} reviewData={reviewData} />
              )}
            </View>
          );
        }}
      />
      {failCheckDialog()}
    </Animated.View>
  );

  function failCheckDialog() {
    return (
      <Dialog
        dismissable
        onDismiss={() => setShowFailCheckDialog(false)}
        visible={showFailCheckDialog}>
        <Dialog.Title>Alert</Dialog.Title>
        <Dialog.Content>
          <Text>{failCheckData.message}</Text>
          <Dialog.Actions
            style={{justifyContent: 'center', gap: 8, marginTop: 16}}>
            <Button
              mode="contained"
              className="bg-[#E31E24]"
              contentStyle={{paddingHorizontal: 12}}
              onPress={() => {
                setFailCheckData({});
                setShowFailCheckDialog(false);
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
