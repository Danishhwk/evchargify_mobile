import {Image, RefreshControl, View} from 'react-native';
import React, {useMemo, useRef, useEffect, useState} from 'react';
import {
  Button,
  Card,
  HelperText,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import MyAppBar from '../../utils/components/appBar';
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {images} from '../../assets/images/images';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {AddTopupSheet} from '../../utils/components/add_topup_sheet';
import {sessionList} from '../../services/session_service';
import {Toast} from 'react-native-toast-notifications';
import {FlashList} from '@shopify/flash-list';
import {useForeground} from 'react-native-google-mobile-ads';
import {getWindowHeight, isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';
import Animated, {FadeInDown} from 'react-native-reanimated';
export default function Session({navigation}) {
  const [customer_id, setcustomer_id] = useState(null);
  const [sessionListListData, setsessionListListData] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['30%', '30%'], []);
  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  const fetchsessionList = async () => {
    setIsRefreshing(true);
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');
      console.log(
        'user wallet screen fetchsessionlist customer_id: ',
        customer_id,
      );
      let userInfoData = {customer_id: customer_id};
      const response = await sessionList(userInfoData);

      if (response && response.success) {
        setsessionListListData(response.data);
        setIsRefreshing(false);
      } else {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Info'},
        });
        setIsRefreshing(false);
      }
    } catch (error) {
      setIsRefreshing(false);
      Toast.show(error.toString(), {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
      console.error('Error fetching fetchsessionList:', error);
    }
  };

  useEffect(() => {
    fetchsessionList();
    // Clean-up function (optional)
    return () => {
      // Any cleanup code can go here
    };
  }, []);

  return (
    <Surface mode="flat" className="flex-1 h-full bg-white">
      <MyAppBar title={'Session History'} />

      <FlashList
        data={sessionListListData}
        estimatedItemSize={102}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              fetchsessionList();
            }}
          />
        }
        renderItem={({item, index}) => recentTransCard(item, index)}
        contentContainerStyle={{paddingBottom: 20}}
        ListEmptyComponent={() => (
          <View
            className="flex-1 items-center justify-center mx-5"
            style={{height: getWindowHeight() - 230}}>
            <Text variant="bodyLarge" className="text-center text-lg">
              You don't have any completed sessions. Please start a new session
              to see it here.
            </Text>
          </View>
        )}
      />
    </Surface>
  );

  function recentTransCard(item, index) {
    return (
      <Animated.View
        entering={FadeInDown}
        needsOffscreenAlphaCompositing
        key={index}
        className="flex-1 w-full px-3 mt-4 items-center">
        <Card
          onPress={() => {
            navigation.navigate('SessionDetail', {id: item.transaction_id});
          }}
          elevation={1}
          className="w-full bg-white">
          <View className="flex-row m-3 items-center">
            <View className="w-3/4">
              <View className="flex-row flex-1 items-center">
                <View className="rounded-lg bg-[#6BB14F] p-1 px-2">
                  <Text variant="titleSmall" className="text-white">
                    {item.transaction_status}
                  </Text>
                </View>

                <Text
                  numberOfLines={1}
                  style={{flex: 1}}
                  className="ml-2 text-lg"
                  variant="bodyLarge">
                  {item.actual_energy && item.actual_energy + ' /kWh'}
                </Text>
              </View>
              <Text className="text-gray-500 mt-2" variant="labelMedium">
                {item.dt}
              </Text>
            </View>
            <Text
              variant="bodyLarge"
              numberOfLines={1}
              className="text-[#6BB14F] text-right w-[23%] text-lg mt-2">
              ₹ {item.total_amount}/-
            </Text>
          </View>
        </Card>
      </Animated.View>
    );
  }
}
