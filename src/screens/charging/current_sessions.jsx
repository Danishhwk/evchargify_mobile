import React, {useEffect, useRef, useState} from 'react';
import {
  Appbar,
  Button,
  Surface,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import {transactionSessionListFun} from '../../services/transaction_service';
import {Image, View} from 'react-native';
import {FlatList, RefreshControl} from 'react-native-gesture-handler';
import Animated, {Easing, FadeIn} from 'react-native-reanimated';
import MyAppBar from '../../utils/components/appBar';
import {Toast} from 'react-native-toast-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetworkStatus from '../network_screen';
import {useNavigation} from '@react-navigation/native';
import {useForeground} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';
import {images} from '../../assets/images/images';
import {FlashList} from '@shopify/flash-list';

export default function CurrentSessions() {
  const navigation = useNavigation();
  const [sessionData, setSessionData] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('focus');
      fetchData();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchData = async () => {
    try {
      const customer_id = await AsyncStorage.getItem('customer_id');
      setIsRefreshing(true);
      transactionSessionListFun({customer_id: customer_id})
        .then(response => {
          if (response && response.success) {
            setSessionData(response.data);
            setIsRefreshing(false);
          }
        })
        .catch(error => {
          setIsRefreshing(false);
          Toast.show(error, {
            type: 'custom_toast',
            data: {title: 'Error'},
          });
        });
    } catch (error) {
      setIsRefreshing(false);
      Toast.show(error, {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  return (
    <Surface mode="flat" className="flex-1 h-full bg-white">
      <NetworkStatus />

      <Appbar className="bg-transparent">
        <Appbar.Content
          title="Active Sessions"
          mode="center-aligned"
          titleStyle={{textAlign: 'center'}}
        />
      </Appbar>
      <FlashList
        estimatedItemSize={155}
        keyExtractor={item => item.transaction_id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchData} />
        }
        data={sessionData}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-[50%] mx-5">
            <Image
              source={images.current}
              style={{height: 80, width: 80}}
              tintColor={'red'}
            />
            <Text variant="bodyLarge" className={'text-center'}>
              You don't have any active sessions. Please start a new session to
              see it here.
            </Text>
          </View>
        }
        renderItem={({item, index}) => {
          return (
            <Animated.View
              entering={FadeIn.duration(300).easing(Easing.linear)}
              exiting={FadeIn.duration(300).easing(Easing.linear)}
              needsOffscreenAlphaCompositing
              key={index}
              className={'p-3 w-fit'}>
              <View
                className={`h-[36%] rounded-xl ${
                  isIos ? 'shadow-sm' : 'shadow-lg'
                } shadow-gray-500 p-2 px-3 flex-1 bg-white`}>
                <View className="flex-1">
                  <View className="flex-1 flex-row items-center">
                    <Image
                      source={images.chargingStation}
                      style={{height: 24, width: 24, marginRight: 5}}
                      resizeMode="contain"
                    />

                    <Text
                      variant="titleLarge"
                      ellipsizeMode="tail"
                      numberOfLines={1}>
                      {item.station_name}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <Text
                      variant="titleMedium"
                      className="text-[#79747E] mt-1"
                      ellipsizeMode="tail"
                      numberOfLines={1}>
                      Charging Status: {item.transaction_status}
                    </Text>

                    <Text
                      variant="labelLarge"
                      className="text-[#79747E] mt-1"
                      ellipsizeMode="tail"
                      numberOfLines={1}>
                      Connector: {item.connector_name}
                    </Text>
                  </View>
                </View>

                <Button
                  className="my-2 mt-3"
                  onPress={() => {
                    navigation.navigate('ChargingStatus', {
                      type_route: item.charging_method_type,
                      transaction_id_route: item.transaction_id,
                      customer_id_route: item.customer_id,
                      from_home: 1,
                    });
                  }}
                  mode="contained">
                  View Details
                </Button>
              </View>
            </Animated.View>
          );
        }}
      />
    </Surface>
  );
}
