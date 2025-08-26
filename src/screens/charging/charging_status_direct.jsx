import {Image, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Surface, Text} from 'react-native-paper';
import {ScrollView} from 'react-native-gesture-handler';
import MyAppBar from '../../utils/components/appBar';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {images} from '../../assets/images/images';
import SwipeButton from 'rn-swipe-button';
import {Toast} from 'react-native-toast-notifications';
import {differenceInMilliseconds, format} from 'date-fns';
import {
  transactionSessionInfoFun,
  transactionRemoteStopFun,
} from '../../services/transaction_service';

export default function ChargingStatus({navigation, route}) {
  const {type_route, transaction_id_route, customer_id_route} = route.params;

  const [customer_id, setcustomer_id] = useState(0);
  const [transaction_id, settransaction_id] = useState(0);
  const [isCharginingStarted, setisCharginingStarted] = useState('');
  const [charging_time, setcharging_time] = useState('00:00:00');
  const [current_kwh, setcurrent_kwh] = useState(0);
  const [chargingPercent, setChargingPercent] = useState(0);
  const [selectType, setSelectType] = useState('');
  const intervalRef = useRef(null);

  const fetchSessionData = async () => {
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
      let sessionInfoData = {
        customer_id: customer_id_temp,
        transaction_id: transaction_id_temp,
      };
      const response = await transactionSessionInfoFun(sessionInfoData);

      if (response && response.success) {
        var responseData = response.data;
        var is_session_over = responseData.is_session_over;
        if (is_session_over === 1) {
          Toast.show(response.message, {
            type: 'custom_toast',
            data: {title: 'Info'},
          });
        } else {
          if (is_session_over === 3) {
            await AsyncStorage.setItem('isCharginingStarted', 'false');

            Toast.show(response.message, {
              type: 'custom_toast',
              data: {title: 'Info'},
            });
            navigation.navigate('bottomNav');
          } else {
            if (is_session_over === 2) {
              let sessionData = responseData.data;

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
            }
          }
        }
      } else {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Error'},
        });
      }
    } catch (error) {
      Toast.show(error, {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
      console.error('Error fetching info:', error);
    }
  };

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        let customer_id = parseInt(await AsyncStorage.getItem('customer_id'));
        let transaction_id = parseInt(
          await AsyncStorage.getItem('transaction_id'),
        );
        let isCharginingStarted = await AsyncStorage.getItem(
          'isCharginingStarted',
        );

        setcustomer_id(customer_id);
        settransaction_id(transaction_id);
        setisCharginingStarted(isCharginingStarted);
        setChargingPercent(0);

        if (isCharginingStarted === true || isCharginingStarted === 'true') {
          await fetchSessionData();
        } else {
          navigation.dispatch(StackActions.replace('bottomNav'));
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchTransactionData();

    const intervalId = setInterval(fetchSessionData, 60000);

    return () => clearInterval(intervalId);
  }, []);

  async function SwipeSuccess() {
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

      if (response && response.success) {
        await AsyncStorage.setItem('isCharginingStarted', 'false');
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Success'},
        });
        navigation.navigate('bottomNav');
      } else {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Error'},
        });
      }
    } catch (error) {
      Toast.show(error, {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  }

  return (
    <Surface mode="flat" className="flex-1 px-4">
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={{paddingBottom: 20}}>
        <MyAppBar title={'Charging'} />

        {chargingPercentRender()}

        {/* Time Render */}

        {selectType == 'TIME' && TimeRender()}

        {/* Money Render */}
        {selectType == 'MONEY' && MoneyRender()}

        {/* Energy Render */}

        {selectType == 'ENERGY' && EnergyRender()}

        {/* Swipe button */}
        <View className="h-10" />
        <SwipeToStop onSwipeSuccess={SwipeSuccess} />
      </ScrollView>
    </Surface>
  );

  function EnergyRender() {
    return (
      <Surface
        mode="flat"
        className="bg-[#99D9D9] rounded-xl p-4 mt-10 items-center shadow-sm shadow-black">
        <Surface
          mode="flat"
          className="w-[90%] bg-[#6BB14F] rounded-lg py-1 items-center justify-center">
          <Text className="text-white text-lg" variant="titleMedium">
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
              {current_kwh} kWh
            </Text>
            <Text className="text-gray-500" variant="titleMedium">
              Current kWh
            </Text>
          </View>
        </View>
      </Surface>
    );
  }

  function MoneyRender() {
    return (
      <Surface
        mode="flat"
        className="bg-[#99D9D9] rounded-xl p-4 mt-10 items-center shadow-sm shadow-black">
        <Surface
          mode="flat"
          className="w-[90%] bg-[#6BB14F] rounded-lg py-1 items-center justify-center">
          <Text className="text-white text-lg" variant="titleMedium">
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
        </View>
      </Surface>
    );
  }

  function TimeRender() {
    return (
      <Surface
        mode="flat"
        className="bg-[#99D9D9] rounded-xl p-4 mt-10 items-center shadow-sm shadow-black">
        <Surface
          mode="flat"
          className="w-[90%] bg-[#6BB14F] rounded-lg py-1 items-center justify-center">
          <Text className="text-white text-lg" variant="titleMedium">
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
        </View>
      </Surface>
    );
  }

  function chargingPercentRender() {
    return (
      <View className="items-center mt-5">
        <AnimatedCircularProgress
          size={280}
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
                className="w-20 h-20"
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
