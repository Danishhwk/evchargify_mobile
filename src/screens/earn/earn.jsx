import {Image, StatusBar, View} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Button, Card, Checkbox, Text} from 'react-native-paper';
import MyAppBar from '../../utils/components/appBar';
import {ScrollView} from 'react-native-gesture-handler';
import Animated, {FadeIn} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {images} from '../../assets/images/images';
import {RewardedAd, RewardedAdEventType} from 'react-native-google-mobile-ads';
import {rewardedAdUnitId} from '../../utils/constant';
import {isIos} from '../../utils/helpers';
import Loading from '../../utils/components/loading';
import {
  coinDailyCheckService,
  coinInfoService,
  completeCoinTaskService,
} from '../../services/reward_service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Toast} from 'react-native-toast-notifications';
import {SimpleGrid} from 'react-native-super-grid';

const rewardedHelper = RewardedAd.createForAdRequest(rewardedAdUnitId);

export default function EarnScreen() {
  const [earnCoin, setEarnCoin] = useState(0);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [coinInfo, setCoinInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDailyCheck, setIsDailyCheck] = useState(false);

  useEffect(() => {
    getCoinInfo();
  }, [getCoinInfo]);

  const loadAd = useCallback(() => {
    let unsubscribeLoaded;
    let unsubscribedEarn;
    setIsAdLoading(true);
    try {
      rewardedHelper.load();

      unsubscribeLoaded = rewardedHelper.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          setIsAdLoading(false);
          if (isIos) StatusBar.setHidden(true);
          rewardedHelper.show();
        },
      );
      let rewardCame = false;
      unsubscribedEarn = rewardedHelper.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        reward => {
          console.log('**********reward', reward);
          if (rewardCame) return;
          rewardCame = true;
          setEarnCoin(prev => prev + reward.amount);
          unsubscribedEarn();
          completeTaskFun();
          if (isIos) StatusBar.setHidden(false);
        },
      );
    } catch (error) {
      setIsAdLoading(false);
    }
    return () => {
      unsubscribeLoaded();
      unsubscribedEarn();
    };
  }, [setIsAdLoading, setEarnCoin]);

  const getCoinInfo = async () => {
    try {
      const customer_id = await AsyncStorage.getItem('customer_id');
      const data = {customer_id: customer_id};
      const response = await coinInfoService(data);

      if (response && response.success) {
        console.log('response', response.data);

        setCoinInfo(response.data);
        setEarnCoin(response.data.coin);
        setIsDailyCheck(response.data.checkin_data.check_done === 1);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const dailyCheckCoinFun = async () => {
    try {
      const customer_id = await AsyncStorage.getItem('customer_id');
      const data = {customer_id: customer_id};
      const response = await coinDailyCheckService(data);

      if (response && response.success) {
        Toast.show('Daily Check In Done', {
          type: 'custom_toast',
          data: {title: 'Success'},
        });
        getCoinInfo();
      }
    } catch (error) {
      console.log('error', error);
      Toast.show('Something went wrong. Please try again', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  const completeTaskFun = async () => {
    try {
      console.log('completeTaskFun');

      const customer_id = await AsyncStorage.getItem('customer_id');
      const data = {customer_id: customer_id};
      const response = await completeCoinTaskService(data);
      console.log('response', response);
      if (response && response.success) {
        Toast.show('Congratulations! Task Completed', {
          type: 'custom_toast',
          data: {title: 'Success'},
        });
        getCoinInfo();
      }
    } catch (error) {
      console.log('error', error);
      Toast.show('Something went wrong. Please try again', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  if (isLoading) {
    return <Loading visible={isLoading} />;
  }
  return (
    <View className="flex-1 h-full bg-white">
      <MyAppBar title={'Earn & Redeem'} />

      <Animated.ScrollView
        style={{
          marginTop: 10,
          paddingHorizontal: 15,
        }}
        needsOffscreenAlphaCompositing
        entering={FadeIn}
        contentContainerStyle={{paddingBottom: 20}}>
        {BalanceCard()}

        <View className="items-center">
          <Text className="mt-5" variant="titleLarge">
            Daily Tasks
          </Text>

          <View className="w-14 h-1 bg-[#79C400] rounded-full mt-2 mb-5" />
        </View>

        {dailyCheckCard()}

        <View className="h-3" />

        {taskGrid()}
      </Animated.ScrollView>
      <Loading visible={isAdLoading} />
    </View>
  );

  function taskGrid() {
    return (
      <SimpleGrid
        data={coinInfo.task_data}
        spacing={15}
        itemContainerStyle={{
          alignItems: 'center',
        }}
        renderItem={({item, index}) => {
          let isDisabled = false;
          if (item.task_done === 1) {
            isDisabled = true;
          } else if (
            index > 0 &&
            coinInfo.task_data[index - 1].task_done === 0
          ) {
            isDisabled = true;
          }
          return (
            <Card
              onPress={
                isDisabled
                  ? null
                  : () => {
                      if (isDailyCheck) {
                        loadAd();
                      } else {
                        Toast.show(
                          'You need to check in first to start the task',
                          {
                            type: 'custom_toast',
                            data: {title: 'Info'},
                          },
                        );
                      }
                    }
              }
              mode={
                isDisabled && item.task_done === 0 ? 'contained' : 'elevated'
              }
              className={`w-32 ${
                isDisabled && item.task_done === 0
                  ? 'bg-[#0c0c0c23]'
                  : 'bg-[#b5eca8]'
              }`}>
              <View className="items-center rounded-t-lg bg-[#0c0c0c23]">
                <Text variant="bodyLarge">Task {index + 1}</Text>
              </View>
              <View className="items-center">
                <Image
                  source={images.coin}
                  tintColor={
                    isDisabled && item.task_done === 0 ? '#0c0c0c23' : ''
                  }
                  className="w-14 h-14 mt-1"
                />
                <Text variant="bodySmall" className="text-center my-1">
                  Complete this task to earn {item.task_coin}{' '}
                  <Image source={images.single_coin} className="w-3 h-3" />
                </Text>
              </View>
              <View className="items-center rounded-b-lg bg-[#0c0c0c23] py-1">
                {(() => {
                  if (isDisabled && item.task_done === 1) {
                    return <Text variant="bodyLarge">Task Completed</Text>;
                  } else if (isDisabled) {
                    return <Text variant="bodyLarge">Lock</Text>;
                  } else {
                    return <Text variant="bodyLarge">Watch & Earn</Text>;
                  }
                })()}
              </View>
            </Card>
          );
        }}
      />
    );
  }

  function dailyCheckCard() {
    return (
      <LinearGradient
        className="bg-white flex-row items-center justify-between w-full mt-2 p-5 rounded-2xl shadow-lg shadow-[#72B334]"
        style={{
          shadowColor: '#72B334',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.3,
          shadowRadius: 3.84,
        }}
        start={{x: -2, y: 2}}
        end={{x: 3, y: -1}}
        colors={['#3b37db', '#b5eca8']}>
        <View>
          <Text className="text-white" variant="bodyLarge">
            Daily Check In
          </Text>
          <Text className="text-white mt-0.5" variant="labelLarge">
            Earn {coinInfo.checkin_data.check_coin}{' '}
            <Image source={images.single_coin} className="w-3 h-3" /> by
            checking in daily
          </Text>
        </View>
        <Checkbox.Android
          color="#b5eca8"
          uncheckedColor="#b5eca8"
          value={isDailyCheck}
          onPress={
            isDailyCheck === true
              ? null
              : () => {
                  setIsDailyCheck(!isDailyCheck);
                  dailyCheckCoinFun();
                }
          }
          status={isDailyCheck ? 'checked' : 'unchecked'}
        />
      </LinearGradient>
    );
  }

  function BalanceCard() {
    return (
      <LinearGradient
        className="bg-white w-full h-48 mt-2 p-5 rounded-2xl shadow-lg shadow-[#72B334]"
        style={{
          shadowColor: '#72B334',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.3,
          shadowRadius: 3.84,
        }}
        start={{x: -2, y: 2}}
        end={{x: 1.5, y: -1}}
        colors={['#40df1d', '#3b37db']}>
        <View className="flex-1 flex-row justify-between items-center">
          <Image source={images.coin} className="h-24 w-24" />

          <View className="items-end">
            <Text variant="bodyLarge" className="text-white">
              Your EVD Coins
            </Text>

            <View className="flex-row items-center mt-2">
              <Image source={images.single_coin} className="h-6 w-6 mr-1" />

              <Text variant="bodyLarge" className="text-white text-3xl">
                {earnCoin}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-5">
          <Button mode="contained" className="bg-[#C7EEA2]">
            <Text variant="bodyLarge" className="text-black">
              Coming Soon
            </Text>
          </Button>
        </View>
      </LinearGradient>
    );
  }
}
