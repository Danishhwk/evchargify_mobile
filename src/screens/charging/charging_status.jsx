import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackActions} from '@react-navigation/native';
import {differenceInMilliseconds, format} from 'date-fns';
import React, {useEffect, useRef, useState} from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {RefreshControl, ScrollView} from 'react-native-gesture-handler';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Dialog,
  Icon,
  IconButton,
  Modal,
  Surface,
  Text,
} from 'react-native-paper';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {Toast} from 'react-native-toast-notifications';
import SwipeButton from 'rn-swipe-button';
import {images} from '../../assets/images/images';
import {
  transactionRemoteStopFun,
  transactionSessionInfoFun,
} from '../../services/transaction_service';
import NetworkStatus from '../network_screen';
import {useForeground} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';
import LinearGradient from 'react-native-linear-gradient';

export default function ChargingStatus({navigation, route}) {
  const {transaction_id_route, customer_id_route, from_home} = route.params;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [customer_id, setcustomer_id] = useState(0);
  const [transaction_id, settransaction_id] = useState(0);
  const [charging_time, setcharging_time] = useState('00:00:00');
  const [current_kwh, setcurrent_kwh] = useState(0);
  const [chargingPercent, setChargingPercent] = useState(0);
  const [selectType, setSelectType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stopChargeDialog, setStopChargeDialog] = useState(false);
  const intervalRef = useRef(null);
  const [stationName, setStationName] = useState('');
  const [chargerName, setChargerName] = useState('');
  const [connectorName, setConnectorName] = useState('');
  const [isDataAvailble, setIsDataAvailble] = useState(false);
  const [chargingAmount, setChargingAmount] = useState(0);
  const [blockAmount, setBlockAmount] = useState(0);
  const [waitPopupText, setWaitPopupText] = useState('');
  const [chargerType, setChargerType] = useState('');
  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [isRewardEnable, setIsRewardEnable] = useState(false);
  const [transaction_min_unit, setTransaction_min_unit] = useState(0);
  const [stationId, setStationId] = useState(0);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  const fetchSessionData = async () => {
    setIsLoading(true);

    try {
      let transaction_id_temp = transaction_id;
      if (
        transaction_id_route &&
        typeof transaction_id_route !== undefined &&
        transaction_id_route !== ''
      ) {
        transaction_id_temp = transaction_id_route;
        settransaction_id(transaction_id_route);
      }
      let customer_id_temp = customer_id;
      if (
        customer_id_route &&
        typeof customer_id_route !== undefined &&
        customer_id_temp !== ''
      ) {
        customer_id_temp = customer_id_route;
        setcustomer_id(customer_id_route);
      }
      let sessionInfoData = {
        customer_id: customer_id_temp,
        transaction_id: transaction_id_temp,
      };
      const response = await transactionSessionInfoFun(sessionInfoData);

      if (response && response.success) {
        var responseData = response.data;

        var is_session_over = responseData.is_session_over;
        if (is_session_over === 1) {
          if (response.message != waitPopupText) {
            setWaitPopupText(response.message);
          }
        } else {
          setWaitPopupText('');

          if (is_session_over === 3) {
            console.log('is_session_over', is_session_over);

            await AsyncStorage.setItem(
              'transaction_id',
              transaction_id.toString(),
            );

            const stationId =
              route.params.stationInfoData == undefined
                ? 0
                : route.params.stationInfoData.station_id;

            if (stationId == 0) {
              navigation.goBack();
              isLoading(false);
              setIsRefreshing(false);
            } else {
              if (stationId == 0) {
                navigation.replace('bottomNav');
              } else {
                navigation.replace('StationDetail', {
                  station_id: stationId,
                });
              }
            }

            Toast.show(response.message, {
              type: 'custom_toast',
              data: {title: 'Info'},
            });
          } else {
            if (is_session_over === 2) {
              setIsLoading(false);
              setIsRefreshing(false);
              let sessionData = responseData.data;
              console.log('log 1', isDataAvailble);

              setIsDataAvailble(true);
              console.log('log 2', isDataAvailble);

              const currentDate = new Date();
              const formattedDateTime = format(
                currentDate,
                'yyyy-MM-dd HH:mm:ss',
              );

              let start_dt = sessionData.start_dt;

              const date2 = new Date(start_dt);
              const date1 = new Date(formattedDateTime);

              const differenceMs = differenceInMilliseconds(date1, date2);

              const hours = Math.floor(differenceMs / (1000 * 60 * 60));
              const minutes = Math.floor(
                (differenceMs % (1000 * 60 * 60)) / (1000 * 60),
              );
              const seconds = Math.floor((differenceMs % (1000 * 60)) / 1000);

              const formattedDifference = `${hours
                .toString()
                .padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

              setcharging_time(formattedDifference);

              setSelectType(sessionData.charging_method_type);
              if (sessionData.soc && typeof sessionData.soc !== undefined) {
                setChargingPercent(parseFloat(sessionData.soc));
              }

              let start_energy = 0;
              let current_energy = 0;

              if (sessionData.start_energy_value) {
                start_energy = parseFloat(sessionData.start_energy_value);
              }

              if (sessionData.current_energy_value) {
                current_energy = parseFloat(sessionData.current_energy_value);
              }

              let current_energy_unit = sessionData.current_energy_unit;

              if (
                current_energy_unit === 'kWh' ||
                current_energy_unit === 'kwh'
              ) {
                if (current_energy >= 0) {
                  current_energy = current_energy * 1000;
                }
              }

              let cal_energy = current_energy - start_energy;
              cal_energy = cal_energy / 1000;

              setcurrent_kwh(cal_energy);
              setStationName(sessionData.station_name);
              setChargerName(sessionData.charger_name);
              setConnectorName(sessionData.connector_name);
              setChargingAmount(sessionData.charging_method_value);
              setBlockAmount(sessionData.block_amount);
              setChargerType(sessionData.charger_power_type);
            }
          }
        }
      } else {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Error'},
        });
        navigation.goBack();
        isLoading(false);
        setIsRefreshing(false);
      }
    } catch (error) {
      Toast.show(response.message, {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
      navigation.goBack();
      setIsRefreshing(false);
      isLoading(false);
    }
  };

  const checkRewardEnable = async () => {
    const response = await AsyncStorage.getItem('coin_show_response');
    const data = JSON.parse(response);

    console.log('checkRewardEnable**************', data);

    setIsRewardEnable(data.show_coin);
    setTransaction_min_unit(data.transaction_min_unit);
  };

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        let customer_id = await AsyncStorage.getItem('customer_id');
        let transaction_id = parseInt(
          await AsyncStorage.getItem('transaction_id'),
        );

        setcustomer_id(customer_id);
        settransaction_id(transaction_id);

        setChargingPercent(0);

        await fetchSessionData();
      } catch (error) {}
    };

    fetchTransactionData();
    setTimeout(() => {
      checkRewardEnable();
    }, 1000);

    const intervalId = setInterval(
      fetchSessionData,
      isDataAvailble ? 30000 : 7000,
    );

    return () => clearInterval(intervalId);
  }, [isDataAvailble]);

  async function SwipeSuccess() {
    setStopChargeDialog(false);
    const stationId =
      route.params.stationInfoData == undefined
        ? 0
        : route.params.stationInfoData.station_id;
    try {
      let transaction_id_temp = transaction_id;
      if (transaction_id_route && typeof transaction_id_route !== undefined) {
        transaction_id_temp = transaction_id_route;
        settransaction_id(transaction_id_route);
      }
      let customer_id_temp = customer_id;
      if (customer_id_route && typeof customer_id_route !== undefined) {
        customer_id_temp = customer_id_route;
        setcustomer_id(customer_id_route);
      }
      let remoteStopData = {
        customer_id: customer_id_temp,
        transaction_id: transaction_id_temp,
      };
      const response = await transactionRemoteStopFun(remoteStopData);
      console.log('res: ', response);

      if (response && response.success) {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Success'},
        });
        navigation.dispatch(StackActions.replace('FeedBack'));
      } else {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Error'},
        });
        console.log('1');

        if (stationId == 0) {
          navigation.replace('bottomNav');
        } else {
          navigation.replace('StationDetail', {
            station_id: stationId,
          });
        }
      }
    } catch (error) {
      Toast.show(error, {
        type: 'custom_toast',
        data: {title: 'Error'},
      });

      if (stationId == 0) {
        navigation.replace('bottomNav');
      } else {
        navigation.replace('StationDetail', {
          station_id: stationId,
        });
      }
      console.log('2');
    }
  }

  return (
    <Animated.View
      needsOffscreenAlphaCompositing={true}
      entering={FadeIn}
      className="flex-1 h-full">
      <LinearGradient
        className={'flex-1'}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 0.7}}
        colors={['#6BB14F', '#F8F8F8']}>
        <NetworkStatus />

        <Appbar className="bg-transparent" mode="center-aligned">
          <IconButton
            icon={() => (
              <Image
                tintColor={'white'}
                source={images.back}
                className="w-6 h-6"
              />
            )}
            onPress={() =>
              from_home == 1
                ? navigation.goBack()
                : navigation.replace('StationDetail', {
                    station_id: route.params.stationInfoData.station_id,
                  })
            }
          />
          <Appbar.Content color="white" title={'Charging'} />
        </Appbar>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={fetchSessionData}
            />
          }
          contentContainerStyle={{paddingBottom: 20, paddingHorizontal: 20}}>
          {(() => {
            if (!isLoading) {
              return (
                <View className="w-[100%] my-2">
                  <Text className="text-lg" variant="titleMedium">
                    {stationName}
                  </Text>

                  <View className="flex-row items-center justify-between w-full mt-2">
                    <Text className="text-lg w-[60%]" variant="titleMedium">
                      Charger: {chargerName}
                    </Text>
                    <Text
                      className="text-lg w-[30%] text-right"
                      variant="titleMedium">
                      Connector {connectorName}
                    </Text>
                  </View>
                </View>
              );
            }
          })()}

          {chargerType === 'DC' && chargingPercentRender()}

          {chargerType === 'AC' && (
            <View className="rounded-xl p-2 mt-10 items-center flex-row border border-[#6BB14F]">
              <Icon source={'information-outline'} size={24} color="black" />
              <Text className="ml-3 w-[92%]" variant="titleMedium">
                Check your vehicle's dashboard screen to see the charging
                percentage.
              </Text>
            </View>
          )}

          {(() => {
            if (selectType.toLowerCase() === 'money') {
              return MoneyRender();
            }
            if (selectType.toLowerCase() === 'energy') {
              return EnergyRender();
            }
            if (selectType.toLowerCase() === 'time') {
              return TimeRender();
            }
            if (selectType.toLowerCase() === 'rfid') {
              return otherCardRender('RFID');
            }
            if (selectType.toLowerCase() === 'vin') {
              return otherCardRender('AutoCharge');
            }
          })()}
          <View className="h-5" />

          {(() => {
            if (
              isRewardEnable === true &&
              current_kwh >= transaction_min_unit
            ) {
              return coinCard();
            }
          })()}

          {/* Swipe button */}
          <View className="h-10" />
          {/* <SwipeToStop onSwipeSuccess={SwipeSuccess} /> */}

          {(() => {
            if (!isLoading) {
              return (
                <Button
                  className={`bg-[#6BB14F] rounded-full w-[90%] self-center`}
                  onPress={() => {
                    setStopChargeDialog(true);
                  }}>
                  <Text variant="bodyLarge" className="text-white">
                    Stop Charging Now
                  </Text>
                </Button>
              );
            }
          })()}
        </ScrollView>

        {chargingStopDialog()}

        {waitPopupText != '' ? waitPopup(waitPopupText) : <></>}

        <Modal
          visible={isLoading}
          dismissable={false}
          contentContainerStyle={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            className="bg-white rounded-xl justify-center items-center p-6">
            <ActivityIndicator />
          </Animated.View>
        </Modal>
      </LinearGradient>
    </Animated.View>
  );

  function coinCard() {
    const coinEarned = Math.round(parseInt(current_kwh));
    return (
      <LinearGradient
        className="bg-white w-full h-auto mt-2 py-2 px-4 rounded-2xl shadow-lg shadow-[#72B334]"
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
        <View className="flex-1 flex-row-reverse justify-between items-center">
          <Image source={images.coin} className="h-20 w-20" />

          <View className="w-[70%] items-start flex-1">
            <Text variant="bodyLarge" className="text-white">
              Keep Charging to Earn More!
            </Text>
            <View className="flex-row items-center justify-center">
              <Text variant="bodyLarge" className="text-white ">
                Current Rewards:
              </Text>
              <Image source={images.single_coin} className="h-4 w-4 mx-1" />
              <Text variant="bodyLarge" className="text-white ">
                {coinEarned} EVD Coins
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          className="my-2 self-center w-full"
          onPress={() => {
            navigation.navigate('Earn');
          }}>
          <Text
            variant="titleLarge"
            className="text-slate-100 text-center text-sm">
            Tap to join daily tasks and earn additional EVD Coins!
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  function waitPopup(title) {
    return (
      <View
        style={{
          flex: 1,
          position: 'absolute',
          left: 50,
          right: 50,
          bottom: 100,
        }}>
        <Card
          elevation={1}
          style={{minHeight: 50}}
          className={`w-full bg-white border-l-8 border-gray-600 justify-center`}>
          <View className="flex-row items-center justify-between">
            <Text className="ml-4 w-[80%]" variant="titleLarge">
              {title}
            </Text>
            <ActivityIndicator className="mr-5" />
          </View>
        </Card>
      </View>
    );
  }

  function chargingStopDialog() {
    return (
      <Dialog
        visible={stopChargeDialog}
        dismissable={true}
        onDismiss={() => {
          setStopChargeDialog(false);
        }}>
        <Dialog.Title>Confirmation</Dialog.Title>
        <Dialog.Content>
          <Text>Are you sure you want to stop charging?</Text>
        </Dialog.Content>

        <Dialog.Actions>
          <Button
            mode="outlined"
            contentStyle={{paddingHorizontal: 12}}
            onPress={() => setStopChargeDialog(false)}>
            <Text>No</Text>
          </Button>

          <View className="w-0.5" />

          <Button
            mode="contained"
            className="bg-[#E31E24]"
            contentStyle={{paddingHorizontal: 12}}
            onPress={async () => await SwipeSuccess()}>
            <Text className="text-white">Yes</Text>
          </Button>
        </Dialog.Actions>
      </Dialog>
    );
  }

  function otherCardRender(title) {
    return (
      <Surface
        mode="elevated"
        className="bg-slate-100 rounded-xl p-4 mt-8 items-center shadow-sm shadow-black">
        <Surface
          mode="flat"
          className="w-[90%] bg-[#6BB14F] rounded-lg py-1 items-center justify-center">
          <Text className="text-white text-lg py-1" variant="titleMedium">
            {title}
          </Text>
        </Surface>
        <View className="flex-wrap flex-row justify-between w-[90%] gap-5 my-2">
          <View className="items-center w-[40%]">
            <Text className="text-lg" variant="bodyLarge">
              {charging_time}
            </Text>
            <Text className="text-gray-500" variant="titleMedium">
              Charging Time
            </Text>
          </View>

          <View className="items-center w-[40%]">
            <Text className="text-lg" variant="bodyLarge">
              {current_kwh.toString().slice(0, 6)} kWh
            </Text>
            <Text className="text-gray-500" variant="titleMedium">
              Current kWh
            </Text>
          </View>
        </View>
      </Surface>
    );
  }

  function EnergyRender() {
    return (
      <Surface
        mode="elevated"
        className="bg-slate-100 rounded-xl p-4 mt-8 items-center shadow-sm shadow-black">
        <Surface
          mode="flat"
          className="w-[90%] bg-[#6BB14F] rounded-lg py-1 items-center justify-center">
          <Text className="text-white text-lg py-1" variant="titleMedium">
            Energy
          </Text>
        </Surface>
        <View className="flex-wrap flex-row justify-between w-[90%] gap-5 my-2">
          <View className="items-center w-[40%]">
            <Text className="text-lg" variant="bodyLarge">
              {charging_time}
            </Text>
            <Text className="text-gray-500" variant="titleMedium">
              Charging Time
            </Text>
          </View>

          <View className="items-center w-[40%]">
            <Text className="text-lg" variant="bodyLarge">
              {current_kwh.toString().slice(0, 6)} kWh
            </Text>
            <Text className="text-gray-500" variant="titleMedium">
              Current kWh
            </Text>
          </View>
          <View className="items-center w-[40%]">
            <Text className="text-lg" variant="bodyLarge">
              {chargingAmount} kWh
            </Text>
            <Text className="text-gray-500" variant="titleMedium">
              Requested Energy
            </Text>
          </View>
          <View className="items-center w-[40%]">
            <Text className="text-lg" variant="bodyLarge">
              {blockAmount} /-
            </Text>
            <Text className="text-gray-500" variant="titleMedium">
              Block Amount
            </Text>
          </View>
        </View>
      </Surface>
    );
  }

  function MoneyRender() {
    return (
      <Surface
        mode="elevated"
        className="bg-slate-100 rounded-xl p-4 mt-8 items-center shadow-sm shadow-black">
        <Surface
          mode="flat"
          className="w-[90%] bg-[#6BB14F] rounded-lg py-1 items-center justify-center">
          <Text className="text-white text-lg py-1" variant="titleMedium">
            Money
          </Text>
        </Surface>
        <View className="flex-wrap flex-row justify-between w-[90%] gap-5 my-2">
          <View className="items-center w-[40%]">
            <Text className="text-lg" variant="bodyLarge">
              {charging_time}
            </Text>
            <Text className="text-gray-500" variant="titleMedium">
              Charging Time
            </Text>
          </View>

          <View className="items-center w-[40%]">
            <Text className="text-lg" variant="bodyLarge">
              {current_kwh} kWh
            </Text>
            <Text className="text-gray-500" variant="titleMedium">
              Current kWh
            </Text>
          </View>
          <View className="items-center w-[40%]">
            <Text className="text-lg" variant="bodyLarge">
              {chargingAmount} /-
            </Text>
            <Text className="text-gray-500" variant="titleMedium">
              Requested Amount
            </Text>
          </View>
          <View className="items-center w-[40%]">
            <Text className="text-lg" variant="bodyLarge">
              {blockAmount} /-
            </Text>
            <Text className="text-gray-500" variant="titleMedium">
              Block Amount
            </Text>
          </View>
        </View>
      </Surface>
    );
  }

  function TimeRender() {
    return (
      <Surface
        mode="elevated"
        className="bg-slate-100 rounded-xl p-4 mt-8 items-center shadow-sm shadow-black">
        <Surface
          mode="flat"
          className="w-[90%] bg-[#6BB14F] rounded-lg py-1 items-center justify-center">
          <Text className="text-white text-lg py-1" variant="titleMedium">
            Time
          </Text>
        </Surface>
        <View className="flex-wrap flex-row justify-between w-[90%] gap-5 my-2">
          <View className="items-center w-[40%]">
            <Text className="text-lg" variant="bodyLarge">
              {charging_time}
            </Text>
            <Text className="text-gray-500" variant="titleMedium">
              Charging Time
            </Text>
          </View>

          <View className="items-center w-[40%]">
            <Text className="text-lg" variant="bodyLarge">
              {current_kwh} kWh
            </Text>
            <Text className="text-gray-500" variant="titleMedium">
              Current kWh
            </Text>
          </View>
          <View className="items-center w-[40%]">
            <Text className="text-lg" variant="bodyLarge">
              {chargingAmount} mins
            </Text>
            <Text className="text-gray-500" variant="titleMedium">
              Requested Time
            </Text>
          </View>
          <View className="items-center w-[40%]">
            <Text className="text-lg" variant="bodyLarge">
              {blockAmount} /-
            </Text>
            <Text className="text-gray-500" variant="titleMedium">
              Block Amount
            </Text>
          </View>
        </View>
      </Surface>
    );
  }

  function chargingPercentRender() {
    return (
      <View className="items-center mt-5">
        <AnimatedCircularProgress
          size={200}
          width={10}
          fill={chargingPercent}
          lineCap="round"
          rotation={0}
          tintColor="#6BB14F"
          fillLineCap="round"
          onAnimationComplete={e => {}}
          backgroundColor="#99D9D9">
          {fill => (
            <>
              <Image
                source={images.charging}
                resizeMode="contain"
                className="w-16 h-16"
              />
              <Text className="mt-5" variant="displayMedium">
                {fill.toFixed(0) + '%'}
              </Text>
            </>
          )}
        </AnimatedCircularProgress>
      </View>
    );
  }
}
function SwipeToStop({onSwipeSuccess}) {
  return (
    <SwipeButton
      onSwipeSuccess={onSwipeSuccess}
      title={
        <View className="flex-row h-8 items-center self-center justify-between">
          <Text variant="bodyLarge" className="text-white ml-24">
            Swipe to Stop
          </Text>
          <Image source={images.swipe} className="w-16 h-4 ml-14" />
        </View>
      }
      resetAfterSuccessAnimDuration={1000}
      shouldResetAfterSuccess={true}
      thumbIconBackgroundColor="#fff"
      railBackgroundColor="#6BB14F"
      titleColor="white"
      railFillBackgroundColor="#99D9D9"
      railBorderColor="#6BB14F"
      thumbIconBorderColor="#6BB14F"
      railFillBorderColor="#6BB14F"
      thumbIconComponent={() => (
        <Image source={images.bolt} className="w-8 h-8" />
      )}
    />
  );
}
