import React, {useCallback, useMemo, useRef, useState, useEffect} from 'react';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Dialog,
  Icon,
  IconButton,
  Modal,
  ProgressBar,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import MyAppBar from '../../utils/components/appBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import {Image, Keyboard, View} from 'react-native';
import {images} from '../../assets/images/images';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import SwipeButton from 'rn-swipe-button';
import {Toast} from 'react-native-toast-notifications';
import {transactionRemoteStartFun} from '../../services/transaction_service';
import {stationInfoFun} from '../../services/station_service';
import {useForeground} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import SoundPlayer from 'react-native-sound-player';
import {useFocusEffect} from '@react-navigation/native';
import {
  guideText1,
  guideText2,
  guideTextAmt,
  guideTextEnergy,
  guideTextTime,
} from '../../utils/constant';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {Easing, FadeIn, FadeInDown} from 'react-native-reanimated';
import SegmentedControl from 'react-native-segmented-control-2';

export default function ChargerInfo({navigation, route}) {
  const {
    stationInfoData,
    station_id,
    station_charger_id,
    station_charger_connector_id,
    connector_image,
    connector_type,
    charger_type,
    gun_type,
  } = route.params;

  const [startChargeDialog, setStartChargeDialog] = useState(false);

  const [selected_charger_data, set_selected_charger_data] = useState({});
  const [selected_connector_data, set_selected_connector_data] = useState({});

  //  Time : 0, Money: 1, Energy: 2
  const [type, setType] = useState('1');
  const [timeVisible, setTimeVisible] = useState(false);

  const snapPoints = useMemo(() => ['30%', '40%'], []);
  const bottomSheetRef = useRef(null);

  const [swipeSucces, setSwipeSucces] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [amount, setAmount] = useState(0);
  const [energy, setEnergy] = useState(0);
  const intervalRef = useRef(null);
  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [isRewardEnable, setIsRewardEnable] = useState(false);
  const [transaction_min_unit, setTransaction_min_unit] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const checkRewardEnable = async () => {
    const response = await AsyncStorage.getItem('coin_show_response');
    const data = JSON.parse(response);

    console.log('checkRewardEnable**************', data);

    setIsRewardEnable(data.show_coin);
    setTransaction_min_unit(data.transaction_min_unit);
  };

  const playInstructionAudio = () => {
    try {
      if (!audioPlaying) {
        const audio = require('../../assets/audio/instruction_audio_2.mp3');
        // SoundPlayer.playSoundFile('guide_narration', 'mp3');
        SoundPlayer.playAsset(audio);
        SoundPlayer.setVolume(1);
        setAudioPlaying(true);
        SoundPlayer.addEventListener('FinishedPlaying', () => {
          setAudioPlaying(false);
        });
      } else {
        SoundPlayer.stop();
        setAudioPlaying(false);
      }
    } catch (error) {
      setAudioPlaying(false);
      console.log('playInstructionAudio err', error);
    }
  };

  useEffect(() => {
    playInstructionAudio();

    const isOcpi = stationInfoData?.is_ocpi === 1;

    if (!isOcpi) {
      const chargers = stationInfoData?.chargerData;
      if (!chargers?.length) return;

      const foundCharger = chargers.find(
        charger => charger.station_charger_id === station_charger_id,
      );
      if (!foundCharger) return;

      set_selected_charger_data(foundCharger);

      const foundConnector = foundCharger.connectors?.find(
        connector =>
          connector.station_charger_connector_id ===
          station_charger_connector_id,
      );
      if (foundConnector) {
        set_selected_connector_data(foundConnector);
      }

      checkRewardEnable();
    } else {
      console.log('IS OCPI');
      const ocpiChargers = stationInfoData?.charger;
      const foundOcpiCharger = ocpiChargers?.find(
        charger => charger.ocpi_station_charger_id === station_charger_id,
      );
      if (!foundOcpiCharger) return;

      set_selected_charger_data(foundOcpiCharger);

      const foundOcpiConnector = foundOcpiCharger.connector?.find(
        connector =>
          connector.ocpi_station_charger_connector_id ===
          station_charger_connector_id,
      );
      if (foundOcpiConnector) {
        set_selected_connector_data(foundOcpiConnector);
      }
    }

    return () => {
      SoundPlayer.stop();
      setAudioPlaying(false);
    };
  }, []);

  async function SwipeSuccess() {
    if (
      type == '0' &&
      (hours == '' || hours <= 0) &&
      (minutes == '' || minutes <= 0)
    ) {
      Toast.show('Please enter time', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    } else if (type == '1' && (amount == '' || amount <= 19)) {
      Toast.show('Please enter amount', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    } else if (type == '2' && (energy == '' || energy <= 0)) {
      Toast.show('Please enter energy', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    } else {
      setStartChargeDialog(true);
    }
  }

  const startCharging = async () => {
    setStartChargeDialog(false);
    setLoading(0);
    setSwipeSucces(true);

    try {
      let charging_method_type = null;
      let charging_method_value = null;

      let typeTemp = parseInt(type);
      if (typeTemp === 0) {
        charging_method_type = 'TIME';
        charging_method_value = Number(hours) * 60 + Number(minutes);
      } else {
        if (typeTemp === 1) {
          charging_method_type = 'MONEY';
          charging_method_value = parseInt(amount);
        } else {
          if (typeTemp === 2) {
            charging_method_type = 'ENERGY';
            charging_method_value = parseFloat(energy);
          }
        }
      }

      let customer_id = await AsyncStorage.getItem('customer_id');

      let remoteStartData = {
        customer_id: customer_id,
        station_id: station_id,
        station_charger_id: station_charger_id,
        station_charger_connector_id: station_charger_connector_id,
        charging_method_type: charging_method_type,
        charging_method_value: charging_method_value,
      };
      await AsyncStorage.setItem('station_id', station_id.toString());
      const response = await transactionRemoteStartFun(remoteStartData);

      if (response && response.success) {
        var responseData = response.data;
        if (responseData && responseData.transaction_id) {
          await AsyncStorage.setItem('isCharginingStarted', 'true');
          await AsyncStorage.setItem(
            'transaction_id',
            '' + responseData.transaction_id,
          );

          let intervalId = setInterval(() => {
            setLoading(prevLoading => {
              const nextLoading = prevLoading + 0.3;
              if (nextLoading >= 1) {
                setSwipeSucces(false);
                clearInterval(intervalId);
                goToStatusScreen(
                  station_id,
                  type,
                  responseData.transaction_id,
                  customer_id,
                );
                return 1;
              }
              return nextLoading;
            });
          }, 1000);
        }
      } else {
        await AsyncStorage.setItem('isCharginingStarted', 'false');
        setSwipeSucces(false);
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Error'},
        });
      }
    } catch (error) {
      await AsyncStorage.setItem('isCharginingStarted', 'false');
      setSwipeSucces(false);
      Toast.show(error.message, {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  const goToStatusScreen = async (
    station_id,
    type,
    transaction_id,
    customer_id,
  ) => {
    await AsyncStorage.setItem('station_id', station_id.toString());
    await AsyncStorage.setItem('type_route', type);
    await AsyncStorage.setItem('transaction_id', transaction_id.toString());
    await AsyncStorage.setItem('customer_id_route', customer_id);
    navigation.replace('ChargingStatus', {
      type_route: type,
      transaction_id_route: transaction_id,
      customer_id_route: customer_id,
      stationInfoData: stationInfoData,
      from_home: 0,
    });
  };

  const renderTimeBtn = () => {
    return (
      <View className={`flex-row items-center `}>
        <Image
          source={images.timeIcon}
          className="w-5 h-5 mr-2"
          tintColor={type == '0' ? 'white' : '#6BB14F'}
        />
        <Text
          variant="bodyMedium"
          style={{
            color: type == '0' ? 'white' : '#6BB14F',
          }}>
          Time
        </Text>
      </View>
    );
  };

  const renderMoneyBtn = () => {
    return (
      <View className={`flex-row items-center`}>
        <Image
          source={images.moneyIcon}
          className="w-5 h-5 mr-2"
          tintColor={type == '1' ? 'white' : '#6BB14F'}
        />
        <Text
          variant="bodyMedium"
          style={{
            color: type == '1' ? 'white' : '#6BB14F',
          }}>
          Money
        </Text>
      </View>
    );
  };
  const renderEnergyBtn = () => {
    return (
      <View className={`flex-row items-center`}>
        <Image
          source={images.energyIcon}
          className="w-5 h-5 mr-2"
          tintColor={type == '2' ? 'white' : '#6BB14F'}
        />
        <Text
          variant="bodyMedium"
          style={{
            color: type == '2' ? 'white' : '#6BB14F',
          }}>
          Energy
        </Text>
      </View>
    );
  };

  return (
    <Animated.View
      needsOffscreenAlphaCompositing={true}
      entering={FadeIn}
      className="flex-1 h-full">
      <LinearGradient
        className={'flex-1'}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 0.7}}
        colors={
          stationInfoData.is_ocpi != 1
            ? ['#6BB14F', '#F8F8F8']
            : ['#F8F8F8', '#F8F8F8']
        }>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces
          automaticallyAdjustKeyboardInsets={true}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{paddingBottom: 20}}>
          <Appbar className="bg-transparent" mode="center-aligned">
            <IconButton
              icon={() => (
                <Image
                  source={images.back}
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: stationInfoData.is_ocpi != 1 ? 'white' : 'black',
                  }}
                />
              )}
              onPress={() => navigation.goBack()}
            />
            <Appbar.Content
              color={stationInfoData.is_ocpi != 1 ? 'white' : 'black'}
              title="Charger Info"
            />
          </Appbar>

          <View className="flex-1 px-5">
            {chargerInfo()}

            <SegmentedControl
              tabs={[renderTimeBtn(), renderMoneyBtn(), renderEnergyBtn()]}
              style={{
                alignSelf: 'center',
                marginTop: 15,
                width: '100%',
                height: 40,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: '#6BB14F',
              }}
              initialIndex={1}
              value={type}
              activeTabColor={'#6BB14F'}
              onChange={value => setType(value)}
            />

            {/* Time */}

            {type == '0' && TimeRender()}

            {/* Money */}

            {type == '1' && MoneyRender()}

            {/* Energy */}

            {type == '2' && EnergyRender()}
          </View>

          {/* Swipe button */}
          <View className="mt-5" />

          <Button
            mode="contained"
            className={'mx-8 rounded-full'}
            onPress={() => {
              SwipeSuccess();
            }}>
            <Text variant="bodyLarge" className="text-white">
              Start Charging Now
            </Text>
          </Button>
        </ScrollView>
        {connectChargerModal()}
        {TimeDialog()}
        {chargingStartDialog()}
      </LinearGradient>
    </Animated.View>
  );

  function chargingStartDialog() {
    return (
      <Dialog
        visible={startChargeDialog}
        dismissable={true}
        onDismiss={() => {
          setStartChargeDialog(false);
        }}>
        <Dialog.Title>Confirmation</Dialog.Title>
        <Dialog.Content>
          <Text>Are you sure you want to start charging?</Text>
        </Dialog.Content>

        <Dialog.Actions>
          <Button
            mode="outlined"
            contentStyle={{paddingHorizontal: 12}}
            onPress={() => setStartChargeDialog(false)}>
            <Text>No</Text>
          </Button>

          <View className="w-0.5" />

          <Button
            mode="contained"
            className="bg-[#E31E24]"
            contentStyle={{paddingHorizontal: 12}}
            onPress={async () => await startCharging()}>
            <Text className="text-white">Yes</Text>
          </Button>
        </Dialog.Actions>
      </Dialog>
    );
  }
  function TimeDialog() {
    return (
      <Dialog
        style={
          {
            // maxWidth: 400,
            // minHeight: 250,
            // alignSelf: 'center',
            // alignItems: 'center',
            // justifyContent: 'center',
          }
        }
        visible={timeVisible}
        onDismiss={() => setTimeVisible(false)}>
        <Dialog.Title>Set Charging Time</Dialog.Title>
        <Dialog.Content>
          <View className="mt-2 flex-row items-center justify-center">
            <TextInput
              mode="outlined"
              label="Hours"
              placeholder="00"
              value={hours}
              keyboardType="numeric"
              onChangeText={setHours}
              className="w-24 items-center"
              contentStyle={{
                paddingTop: 10,
                paddingBottom: 10,
              }}
              outlineStyle={{elevation: 2, borderRadius: 10, borderWidth: 0}}
            />
            <TextInput
              mode="outlined"
              label="Minutes"
              placeholder="00"
              value={minutes}
              keyboardType="numeric"
              className="ml-5 w-24 items-center"
              onChangeText={setMinutes}
              contentStyle={{paddingTop: 10, paddingBottom: 10}}
              outlineStyle={{elevation: 2, borderRadius: 10, borderWidth: 0}}
            />
          </View>

          <Button
            mode="contained"
            className="w-60 mt-5 mb-2 rounded-full self-center"
            onPress={() => {
              let hours_temp = parseInt(hours);
              let minutes_temp = parseInt(minutes);
              let total_mins = hours_temp * 60 + minutes_temp;
              if (total_mins < 10 || total_mins / 60 > 10) {
                Toast.show(
                  'Please note that the minimum charging time is 10 minutes',
                  {
                    type: 'custom_toast',
                    data: {title: 'Invalid Time'},
                  },
                );
                return false;
              }

              setTimeVisible(false);
              Keyboard.dismiss();
            }}>
            <Text variant="bodyLarge" className="text-white">
              Submit
            </Text>
          </Button>
        </Dialog.Content>
      </Dialog>
    );
  }

  function connectChargerModal() {
    return (
      <Modal
        visible={swipeSucces}
        dismissable={true}
        onDismiss={() => {
          setSwipeSucces(false);
          setLoading(0);
          clearInterval(intervalRef.current);
        }}
        contentContainerStyle={{
          backgroundColor: 'white',
          padding: 25,
          margin: 20,
          borderRadius: 20,
        }}>
        <Image
          source={images.plugCar}
          className="w-full h-60"
          resizeMode="contain"
        />
        <Text className="text-center text-xl" variant="bodyLarge">
          Session is initiated
        </Text>

        <ProgressBar
          progress={loading}
          style={{borderRadius: 10, marginTop: 20, marginHorizontal: 20}}
        />
      </Modal>
    );
  }

  function coinInfoView() {
    return (
      <View className="flex-row items-start mt-2">
        <Icon source={'information-outline'} size={16} color="#6BB14F" />
        <Text variant="bodySmall" className="ml-2 text-[#6BB14F] w-[95%]">
          To earn EVD <Image source={images.single_coin} className="w-3 h-3" />{' '}
          from a charging session, you must consume at least{' '}
          {transaction_min_unit} units ({transaction_min_unit} kWh).
        </Text>
      </View>
    );
  }

  function EnergyRender() {
    return (
      <Animated.View
        entering={FadeInDown.duration(400)}
        needsOffscreenAlphaCompositing
        className="mt-5 items-center ">
        <View className="flex-1 w-full border border-red-600 p-3 rounded-lg">
          <View className={'absolute -top-1 -right-1'}>
            <IconButton
              onPress={() => {
                playInstructionAudio();
              }}
              icon={
                audioPlaying ? 'stop-circle-outline' : 'play-circle-outline'
              }
              iconColor="#6BB14F"
              animated={true}
              size={28}
            />
          </View>
          <View className={'flex-row items-center justify-center'}>
            <Image source={images.info} className="w-6 h-6 mr-2" />
            <Text variant="bodyLarge">Important Steps</Text>
          </View>
          <View className="w-full">
            <Text className="mt-2" variant="labelMedium">
              1. {guideText1}
            </Text>

            <Text className="mt-2" variant="labelMedium">
              2. {guideTextEnergy}
            </Text>
            <Text className="mt-2" variant="labelMedium">
              3. {guideText2}
            </Text>
          </View>
        </View>

        <View className="my-1 w-[95%] self-start mb-4">
          <View className="flex-row items-center mt-2">
            <Icon source={'information-outline'} size={16} color="gray" />
            <Text variant="bodySmall" className="ml-2">
              Min Account balance to be maintained is: ₹ 50
            </Text>
          </View>

          <View className="flex-row items-start mt-2">
            <Icon source={'information-outline'} size={16} color="gray" />
            <Text variant="bodySmall" className="ml-2">
              Please note that the minimum Energy for charging is 1 kWh.{' '}
            </Text>
          </View>

          {isRewardEnable && coinInfoView()}
        </View>

        <TextInput
          mode="outlined"
          label="Enter kWh"
          value={energy}
          keyboardType="numeric"
          onEndEditing={() => {
            const numericValue = parseFloat(energy);
            if (numericValue < 0.5) {
              setEnergy(0);

              Toast.show('Minimum Energy for charging is 0.5 kWh', {
                type: 'custom_toast',
                data: {title: 'Error'},
              });
            } else if (numericValue > 500) {
              setEnergy(0);
              Toast.show('Maximum Energy for charging is 500 kWh', {
                type: 'custom_toast',
                data: {title: 'Error'},
              });
            }
          }}
          onChangeText={text => {
            setEnergy(
              text
                .replace(/[^0-9.]/g, '')
                .replace(/^(\-|\+)?(\d+)\.(\d*).*$/, '$1$2.$3'),
            ); // allow decimal numbers
          }}
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
          left={
            <TextInput.Icon
              style={{marginTop: 15}}
              icon={() => (
                <Image
                  source={images.energyIcon}
                  tintColor={'#6BB14F'}
                  className="w-6 h-6"
                />
              )}
            />
          }
        />
      </Animated.View>
    );
  }

  function MoneyRender() {
    return (
      <Animated.View
        entering={FadeInDown.duration(400)}
        needsOffscreenAlphaCompositing
        className="mt-5 items-center">
        <View className="flex-1 w-full border border-red-600 p-3 rounded-lg">
          <View className={'absolute -top-1 -right-1'}>
            <IconButton
              onPress={() => {
                playInstructionAudio();
              }}
              icon={
                audioPlaying ? 'stop-circle-outline' : 'play-circle-outline'
              }
              iconColor="#6BB14F"
              animated={true}
              size={28}
            />
          </View>
          <View className={'flex-row items-center justify-center'}>
            <Image source={images.info} className="w-6 h-6 mr-2" />
            <Text variant="bodyLarge">Important Steps</Text>
          </View>
          <View className="w-full">
            <Text className="mt-2" variant="labelMedium">
              1. {guideText1}
            </Text>

            <Text className="mt-2" variant="labelMedium">
              2. {guideTextAmt}
            </Text>
            <Text className="mt-2" variant="labelMedium">
              3. {guideText2}
            </Text>
          </View>
        </View>

        <View className="my-1 w-[95%] self-start mb-4">
          <View className="flex-row items-center mt-2">
            <Icon source={'information-outline'} size={16} color="gray" />
            <Text variant="bodySmall" className="ml-2">
              Min Account balance to be maintained is: ₹ 50
            </Text>
          </View>

          <View className="flex-row items-start mt-2">
            <Icon source={'information-outline'} size={16} color="gray" />
            <Text variant="bodySmall" className="ml-2">
              Please note that the minimum amount for charging is 20 rupees.
            </Text>
          </View>

          {isRewardEnable && coinInfoView()}
        </View>

        <TextInput
          label="Enter Amount"
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
          value={amount}
          keyboardType="numeric"
          onEndEditing={() => {
            const numericValue = parseInt(amount, 10);
            if (numericValue < 20) {
              setAmount('');
              Toast.show('Minimum amount for charging is 20 rupees.', {
                type: 'custom_toast',
                data: {title: 'Error'},
              });
            } else if (numericValue > 5000) {
              setAmount('');

              Toast.show('Maximum amount for charging is 5000 rupees.', {
                type: 'custom_toast',
                data: {title: 'Error'},
              });
            }
          }}
          onChangeText={text => {
            setAmount(text.replace(/[^0-9]/g, ''));
          }}
          left={
            <TextInput.Icon
              style={{marginTop: 15}}
              icon={() => (
                <Image
                  source={images.moneyIcon}
                  tintColor={'#6BB14F'}
                  className="w-6 h-6"
                />
              )}
            />
          }
        />
      </Animated.View>
    );
  }

  function TimeRender() {
    return (
      <Animated.View
        entering={FadeInDown.duration(400)}
        needsOffscreenAlphaCompositing
        className="mt-5 items-center">
        <View className="flex-1 w-full border border-red-600 p-3 rounded-lg">
          <View className={'absolute -top-1 -right-1'}>
            <IconButton
              onPress={() => {
                playInstructionAudio();
              }}
              icon={
                audioPlaying ? 'stop-circle-outline' : 'play-circle-outline'
              }
              iconColor="#6BB14F"
              animated={true}
              size={28}
            />
          </View>
          <View className={'flex-row items-center justify-center'}>
            <Image source={images.info} className="w-6 h-6 mr-2" />
            <Text variant="bodyLarge">Important Steps</Text>
          </View>
          <View className="w-full">
            <Text className="mt-2" variant="labelMedium">
              1. {guideText1}
            </Text>

            <Text className="mt-2" variant="labelMedium">
              2. {guideTextTime}
            </Text>
            <Text className="mt-2" variant="labelMedium">
              3. {guideText2}
            </Text>
          </View>
        </View>

        <View className="my-1 w-[100%]">
          <View className="flex-row items-center mt-2">
            <Icon source={'information-outline'} size={16} color="gray" />
            <Text variant="bodySmall" className="ml-2">
              Min Account balance to be maintained is: ₹ 50
            </Text>
          </View>

          <View className="flex-row items-start mt-2">
            <Icon source={'information-outline'} size={16} color="gray" />
            <Text variant="bodySmall" className="ml-2">
              Please note that the minimum charging time is 10 minutes, while
              the maximum charging time is 10 hours.
            </Text>
          </View>

          {isRewardEnable && coinInfoView()}
        </View>
        <View className="h-4" />
        <TouchableOpacity
          onPress={() => {
            setTimeVisible(true);
          }}
          mode="elevated"
          className="rounded-lg py-4 bg-slate-200 w-36 items-center justify-center">
          <Image
            source={images.timeIcon}
            tintColor={'#6BB14F'}
            className="w-10 h-10"
          />

          <Text className="mt-3" variant="titleLarge">
            {hours == '' ? '00' : 0 + hours}:{minutes == '' ? '00' : minutes}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  function SetTimeSheet() {
    return (
      <BottomSheet
        ref={ref => (bottomSheetRef.current = ref)}
        snapPoints={snapPoints}
        enablePanDownToClose
        android_keyboardInputMode="adjustResize"
        onClose={() => {
          bottomSheetRef.current?.close();
        }}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
          />
        )}
        index={-1}>
        <Text variant="titleLarge" className="text-center mt-5">
          Set Time
        </Text>

        <View className="mt-5 flex-row items-center justify-center">
          <TextInput
            mode="outlined"
            label="Hours"
            placeholder="00"
            value={hours}
            keyboardType="numeric"
            onChangeText={setHours}
            className="w-24 items-center"
            contentStyle={{
              paddingTop: 10,
              paddingBottom: 10,
            }}
            outlineStyle={{elevation: 2, borderRadius: 10, borderWidth: 0}}
          />
          <TextInput
            mode="outlined"
            label="Minutes"
            placeholder="00"
            value={minutes}
            keyboardType="numeric"
            className="ml-5 w-24 items-center"
            onChangeText={setMinutes}
            contentStyle={{paddingTop: 10, paddingBottom: 10}}
            outlineStyle={{elevation: 2, borderRadius: 10, borderWidth: 0}}
          />
        </View>

        <Button
          mode="contained"
          className="w-60 mt-5 mb-2 rounded-full self-center"
          onPress={() => {
            let hours_temp = parseInt(hours);
            let minutes_temp = parseInt(minutes);
            let total_mins = hours_temp * 60 + minutes_temp;
            if (total_mins < 10 || total_mins / 60 > 10) {
              Toast.show(
                'Please note that the minimum charging time is 10 minutes, and the maximum charging time is 10 hours.',
                {
                  data: {title: 'Error'},
                },
              );
              return false;
            }

            bottomSheetRef.current?.close();
            Keyboard.dismiss();
          }}>
          <Text variant="bodyLarge" className="text-white">
            Submit
          </Text>
        </Button>
      </BottomSheet>
    );
  }

  function chargingOptions() {
    //  Time : 0, Money: 1, Energy: 2

    return (
      <View className="flex-row items-center justify-evenly">
        <Button
          mode="contained"
          onPress={() => {
            setType('0');
            setAmount('');
            setEnergy('');
          }}
          icon={() => (
            <Image
              source={images.timeIcon}
              className="w-5 h-5"
              tintColor={type == '0' ? 'white' : '#6BB14F'}
            />
          )}
          className={
            type === '0'
              ? 'bg-[#6BB14F] rounded-lg w-28 h-12 justify-center'
              : 'bg-slate-200 rounded-lg w-28 h-12 justify-center'
          }>
          <Text
            variant={type === '0' ? 'bodyLarge' : 'labelLarge'}
            style={
              type === '0'
                ? {fontSize: 16, color: 'white'}
                : {fontSize: 16, color: '#6BB14F'}
            }>
            Time
          </Text>
        </Button>

        <View className="w-2" />

        <Button
          mode="contained"
          onPress={() => {
            setType('1');
            setEnergy(0);
            setHours(0);
            setMinutes(0);
          }}
          icon={() => (
            <Image
              source={images.moneyIcon}
              className="w-5 h-5"
              tintColor={type == '1' ? 'white' : '#6BB14F'}
            />
          )}
          className={
            type === '1'
              ? 'bg-[#6BB14F] rounded-lg w-28 h-12 justify-center'
              : 'bg-slate-200 rounded-lg w-28 h-12 justify-center'
          }>
          <Text
            variant={type === '1' ? 'bodyLarge' : 'labelLarge'}
            style={
              type === '1'
                ? {fontSize: 16, color: 'white'}
                : {fontSize: 16, color: '#6BB14F'}
            }>
            Money
          </Text>
        </Button>

        <View className="w-2" />

        <Button
          mode="contained"
          onPress={() => {
            setType('2');
            setAmount(0);
            setHours(0);
            setMinutes(0);
          }}
          icon={() => (
            <Image
              source={images.energyIcon}
              className="w-5 h-5"
              tintColor={type == '2' ? 'white' : '#6BB14F'}
            />
          )}
          className={
            type === '2'
              ? 'bg-[#6BB14F] rounded-lg w-28 h-12 justify-center'
              : 'bg-slate-200 rounded-lg w-28 h-12 justify-center'
          }>
          <Text
            variant={type === '2' ? 'bodyLarge' : 'labelLarge'}
            style={
              type === '2'
                ? {fontSize: 16, color: 'white'}
                : {fontSize: 16, color: '#6BB14F'}
            }>
            Energy
          </Text>
        </Button>
      </View>
    );
  }

  function vehicleInfo() {
    return (
      <Surface
        mode="flat"
        className="bg-slate-200 rounded-xl p-3 mt-4 flex-row">
        <Image source={images.carIcon} className="w-14 h-14" />

        <View className="ml-4 w-[80%]">
          <Text variant="titleLarge">Tata</Text>
          <Text numberOfLines={1} ellipsizeMode="tail" variant="titleMedium">
            Punch EV Smart 3.3
          </Text>
        </View>
      </Surface>
    );
  }

  function chargerInfo() {
    return (
      <>
        {stationInfo()}
        <View className="flex-row mt-1 justify-between">
          <Surface
            mode="flat"
            className="bg-slate-200 rounded-xl w-[19%] h-14 items-center justify-center">
            {selected_connector_data && (
              <Image
                className="w-8 h-8"
                tintColor={'black'}
                source={
                  stationInfoData.is_ocpi != 1
                    ? images[selected_connector_data.connector_type_icon]
                    : connector_image
                }
              />
            )}
          </Surface>
          <Surface
            mode="flat"
            className="bg-slate-200 w-[80%] h-14 rounded-xl p-3 items-center justify-center">
            {(() => {
              if (stationInfoData.is_ocpi == 1) {
                return (
                  <>
                    <Text className="mb-1" variant="bodySmall">
                      {connector_type} ({charger_type})
                    </Text>
                    <Text className="text-center w-[70%]" variant="titleLarge">
                      {gun_type} ({connector_type})
                    </Text>
                  </>
                );
              } else {
                return (
                  <>
                    <Text className="mb-1" variant="bodySmall">
                      {selected_charger_data.charger_name} (
                      {selected_charger_data.charger_power_type})
                    </Text>
                    <Text className="text-center w-[70%]" variant="titleLarge">
                      {selected_connector_data.connector_name} (
                      {selected_connector_data.connector_type_name})
                    </Text>
                  </>
                );
              }
            })()}
          </Surface>
        </View>

        <Surface mode="flat" className="bg-slate-200 rounded-xl p-3 mt-1">
          <View className="flex-1 flex-row justify-between items-center">
            <Text variant="titleSmall">Charging Charges</Text>
            <Text variant="titleSmall">
              {stationInfoData.is_ocpi != 1
                ? selected_charger_data.charger_charges
                : selected_connector_data.charger_charges}{' '}
              Rs/kWh
            </Text>
          </View>

          <View className="h-1" />
        </Surface>
      </>
    );
  }

  function stationInfo() {
    return (
      <Surface
        mode="flat"
        className="bg-slate-200 rounded-xl flex-row px-1 py-3">
        <View className="ml-2 w-[96%]">
          <Text variant="titleSmall">{stationInfoData.station_name}</Text>
        </View>
      </Surface>
    );
  }
}
