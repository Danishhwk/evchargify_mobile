import {
  Image,
  View,
  Share,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Appbar,
  Card,
  Divider,
  IconButton,
  List,
  Surface,
  Text,
  Button,
  Dialog,
  TextInput,
  HelperText,
  Icon,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ScrollView} from 'react-native-gesture-handler';
import {images} from '../../assets/images/images';
import Animated, {FadeIn, FadeInDown, FadeOut} from 'react-native-reanimated';
import {
  CommonActions,
  StackActions,
  useFocusEffect,
} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import {userInfoFun} from '../../services/user_service';
import {Toast} from 'react-native-toast-notifications';
import {FlashList} from '@shopify/flash-list';
import NetworkStatus from '../network_screen';
import {isRewardEnableService} from '../../services/reward_service';
import {isIos} from '../../utils/helpers';
import Loading from '../../utils/components/loading';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {
  razorpayinitiateFun,
  razorpayUpdateFun,
} from '../../services/wallet_service';
import {RazorpayProductionKey} from '../../utils/constant';
import RazorpayCheckout from 'react-native-razorpay';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

export default function Setting({navigation}) {
  const [customer_first_name, setcustomer_first_name] = useState(null);
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [customer_profile, setcustomer_profile] = useState(null);
  const [customer_current_wallet_amt, setcustomer_current_wallet_amt] =
    useState(null);
  const [customer_mobile_no, setcustomer_mobile_no] = useState(null);
  const [referral_code, setreferral_code] = useState(null);
  const [appVersion, setAppVersion] = useState('');
  const [settingList, setSettingList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletVisible, setWalletVisible] = useState(false);
  const formRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      const appVersion = DeviceInfo.getVersion();
      setAppVersion(appVersion);
      fetchSessionData();
      const fetchSessionDataInterval = setInterval(() => {
        fetchSessionData();
      }, 60000);

      setSettingList(settingListArray);

      return () => {
        clearInterval(fetchSessionDataInterval);
      };
    }, []),
  );

  const settingListArray = [
    {
      id: 1,
      title: 'Session History',
      icon: images.trans_history,
      onPress: () => navigation.navigate('Session'),
    },
    {
      id: 2,
      title: 'My Wallet',
      icon: images.my_wallet,
      onPress: () => navigation.navigate('Wallet'),
    },
    {
      id: 3,
      title: 'My Subscriptions',
      icon: images.offer,
      onPress: () => navigation.navigate('Subscription'),
    },

    {
      id: 4,
      title: 'My Vehicles',
      icon: images.my_vehicles,
      onPress: () => navigation.navigate('VehicleList'),
    },

    {
      id: 6,
      title: 'My RFID',
      icon: images.rfid,
      onPress: () => navigation.navigate('RfidList'),
    },
    {
      id: 7,
      title: 'My Tickets',
      icon: images.ticket,
      onPress: () => navigation.navigate('TicketScreen'),
    },
    {
      id: 8,
      title: 'My Inquiries',
      icon: images.inquiry,
      onPress: () => navigation.navigate('InquiryList'),
    },
    {
      id: 9,
      title: 'Change Password',
      icon: images.change_password,
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      id: 10,
      title: 'User Guide',
      icon: images.instruction,
      onPress: () => navigation.navigate('Instruction'),
    },
    {
      id: 11,
      title: 'FAQs',
      icon: images.faq,
      onPress: () => navigation.navigate('Faq'),
    },
    {
      id: 12,
      title: 'Contact Support',
      icon: images.support,
      onPress: () => navigation.navigate('Support'),
    },
    {
      id: 13,
      title: 'Share',
      icon: images.share,
      onPress: async () => {
        try {
          await Share.share({
            message:
              'Check out this awesome app!EV Chargify APP\nLocate Charging Stations, Charge EVs & Pay seamlessly at EV Chargify\nhttps://play.google.com/store/apps/details?id=app.evdock.evdock\nhttps://evdock.app/',
            url: 'https://play.google.com/store/apps/details?id=com.evchargify',
            title: 'EV Chargify APP',
          });
        } catch (error) {
          Toast.show(error, {
            type: 'custom_toast',
            data: {title: 'Error'},
          });
        }
      },
    },
  ];

  const footerList = [
    {
      id: 1,
      title: 'Logout',
      icon: images.logout,
      onPress: async () => {
        setLogoutAlert(true);
      },
    },
    {
      id: 2,
      title: 'Delete Account',
      icon: images.deleteUser,
      onPress: async () => {
        navigation.navigate('Delete');
      },
    },
  ];

  const [logoutAlert, setLogoutAlert] = useState(false);

  const initialValues = {
    amount: '',
  };

  const validationSchema = Yup.object({
    amount: Yup.number()
      .required('Amount is required')
      .min(50, 'Amount should be greater than 49'),
  });

  const logoutFun = async () => {
    console.log('LogoutFun: ');
    await AsyncStorage.removeItem('iSlogin');
    await AsyncStorage.removeItem('customer_id');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('customer_first_name');
    await AsyncStorage.removeItem('customer_profile');
    await AsyncStorage.removeItem('customer_current_wallet_amt');
    await AsyncStorage.removeItem('customer_mobile_no');
    await AsyncStorage.removeItem('customer_mail_id');
    await AsyncStorage.removeItem('referral_code');
    await AsyncStorage.setItem('is_logout', 'true');
    // await AsyncStorage.clear();

    navigation.dispatch(
      CommonActions.reset({index: 0, routes: [{name: 'LoginScreen'}]}),
    );
  };

  const checkRewardEnable = async () => {
    try {
      const response = await AsyncStorage.getItem('coin_show_response');
      const data = JSON.parse(response);

      const temp = {
        id: 5,
        title: 'Earn & Redeem',
        icon: images.coins_setting,
        onPress: () => {
          navigation.navigate('Earn');
        },
      };

      if (data.show_coin === true) {
        const settingListArrayCopy = [...settingListArray];
        settingListArrayCopy.splice(4, 0, temp);
        setSettingList(settingListArrayCopy);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const fetchSessionData = async () => {
    setIsWalletLoading(true);
    try {
      checkRewardEnable();
      let customer_id = await AsyncStorage.getItem('customer_id');
      console.log(
        'user wallet fecthsession screen fetchData customer_id: ',
        customer_id,
      );

      let userInfoData = {customer_id: customer_id};
      const response = await userInfoFun(userInfoData);

      // console.log('response', response.data);

      if (response && response.success) {
        if (response.data.customer_first_name) {
          await AsyncStorage.setItem(
            'customer_first_name',
            '' + response.data.customer_first_name,
          );
          setcustomer_first_name(response.data.customer_first_name);
        }
        if (response.data.customer_profile) {
          await AsyncStorage.setItem(
            'customer_profile',
            '' + response.data.customer_profile,
          );
          setcustomer_profile(response.data.customer_profile);
        }
        if (response.data.wallet_amt) {
          await AsyncStorage.setItem(
            'customer_current_wallet_amt',
            '' + response.data.wallet_amt,
          );
          console.log('response.data.wallet_amt', response.data.wallet_amt);

          setcustomer_current_wallet_amt(response.data.wallet_amt);
        }
        if (response.data.customer_mobile_no) {
          await AsyncStorage.setItem(
            'customer_mobile_no',
            '' + response.data.customer_mobile_no,
          );
          setcustomer_mobile_no(response.data.customer_mobile_no);
        }
        if (response.data.customer_mail_id) {
          await AsyncStorage.setItem(
            'customer_mail_id',
            '' + response.data.customer_mail_id,
          );
        }
      } else {
        setTimeout(() => {
          setIsLoading(false);
          setIsWalletLoading(false);
        }, 200);
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Error'},
        });
      }
      setTimeout(() => {
        setIsLoading(false);
        setIsWalletLoading(false);
      }, 200);
    } catch (error) {
      setTimeout(() => {
        setIsLoading(false);
        setIsWalletLoading(false);
      }, 200);
      console.error('Error fetching user info:', error);
    }
  };

  const shareReferralCode = async referral_code => {
    console.log('shareReferralCode: referral_code', referral_code);
    try {
      const result = await Share.share({
        message:
          'My referral code is: ' +
          referral_code +
          ' . Use while Registration.\nCheck out this awesome app!\nEV Chargify APP\nLocate Charging Stations, Charge EVs & Pay seamlessly at EV Chargify\nhttps://play.google.com/store/apps/details?id=app.evdock.evdock\nhttps://evdock.app/',
        url: 'https://play.google.com/store/apps/details?id=app.evdock.evdock',
        title: 'EV Chargify APP',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Toast.show(error.message, {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  const RazorpayUpdateFun = async (
    type,
    order_id,
    payment_id,
    razorpay_response,
  ) => {
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');

      let ApiReqData = {
        customer_id: customer_id,
        type: type,
        order_id: order_id,
        payment_id: payment_id,
        razorpay_response: razorpay_response,
      };

      await razorpayUpdateFun(ApiReqData)
        .then(async response => {
          if (response && response.success) {
            await fetchSessionData();
          } else {
            Toast.show(response.message, {
              type: 'custom_toast',
              data: {title: 'Info'},
            });
          }
        })
        .catch(error => {
          if (error.response) {
            if (error.response.status !== 200) {
              Toast.show('Payment Failed', {
                type: 'custom_toast',
                data: {title: 'Error'},
              });
            }
            console.log(
              'Request failed with status code:',
              error.response.status,
            );
            console.log('Error response data:', error.response.data);

            // Handle error response status codes here
          } else if (error.request) {
            // The request was made but no response was received
            console.log('No response received:', error.request);
          } else {
            // Something happened in setting up the request that triggered an error
            console.log('Error setting up the request:', error.message);
          }
          console.log('handleOtpEditable error', error);
        });
    } catch (error) {
      Toast.show(error, {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  const RazorpaySubmitButton = async (value, {resetForm}) => {
    console.log('RazorpaySubmitButton :', value);
    setIsLoading(true);
    setWalletVisible(false);
    const customer_id = await AsyncStorage.getItem('customer_id');
    const customer_mail_id = await AsyncStorage.getItem('customer_mail_id');
    const customer_mobile_no = await AsyncStorage.getItem('customer_mobile_no');

    if (value.amount < 50 || value.amount > 5000) {
      setIsLoading(false);
      Toast.show('Amount should be between 50 and 5000 INR', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
      return;
    }

    const ApiReqData = {customer_id, wallet_amount: value.amount};

    try {
      const response = await razorpayinitiateFun(ApiReqData);
      console.log('response razorpayinitiateFun', response);

      if (!response || !response.success) {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Info'},
        });
        return;
      }

      setIsLoading(false);
      const order_id_temp = response.data.order_id;
      const options = {
        description: 'Top up EV Chargify Wallet',
        image:
          'https://thevchargify.com/wp-content/uploads/2024/12/ev_logo.png',
        currency: 'INR',
        name: 'EV Chargify',
        key: RazorpayProductionKey,
        order_id: order_id_temp,
        amount: '' + value.amount,
        theme: {color: '#6BB14F'},
        prefill: {
          email: customer_mail_id,
          contact: customer_mobile_no,
          name: customer_first_name,
        },
      };

      RazorpayCheckout.open(options)
        .then(data => {
          Toast.show('Amount Added to Wallet', {
            type: 'custom_toast',
            data: {title: 'Success'},
          });

          RazorpayUpdateFun(
            'success',
            data.razorpay_order_id,
            data.razorpay_payment_id,
            JSON.stringify(data),
          );
        })
        .catch(error => {
          handleRazorpayError(error, order_id_temp);
        });
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      resetForm({values: initialValues});
    }
  };

  const handleRazorpayError = (error, order_id_temp) => {
    setIsLoading(false);
    console.log('catch error', error);

    Toast.show('Payment Failed', {
      type: 'custom_toast',
      data: {title: 'Failed'},
    });

    const {error: {metadata} = {}} = error;
    const order_id = metadata?.order_id || order_id_temp;
    const payment_id = metadata?.payment_id || null;

    RazorpayUpdateFun('failure', order_id, payment_id, JSON.stringify(error));
  };

  const handleError = error => {
    setIsLoading(false);

    if (error.response) {
      if (error.response.status !== 200) {
        Toast.show(error.response.data.message, {
          type: 'custom_toast',
          data: {title: 'Error'},
        });
      }
      console.log('Request failed with status code:', error.response.status);
      console.log('Error response data:', error.response.data);
    } else if (error.request) {
      console.log('No response received:', error.request);
    } else {
      console.log('Error setting up the request:', error.message);
    }
  };

  if (isLoading) {
    return (
      <Animated.View
        needsOffscreenAlphaCompositing
        entering={FadeIn}
        exiting={FadeOut}
        className="flex-1">
        <Loading visible={isLoading} />
      </Animated.View>
    );
  }

  return (
    <Surface mode="flat" className="flex-1 h-full bg-white">
      <NetworkStatus />
      <Appbar className="bg-transparent">
        <Appbar.Content
          title="Your Settings"
          mode="center-aligned"
          titleStyle={{textAlign: 'center'}}
        />
      </Appbar>

      <ScrollView
        showsHorizontalScrollIndicator
        className="p-5"
        contentContainerStyle={{paddingBottom: 30}}>
        <Animated.View
          entering={FadeInDown}
          className={`m-2 bg-white p-1 rounded-xl justify-between border border-[#6BB14F] ${
            isIos ? 'shadow-sm' : 'shadow-lg'
          } shadow-[#6BB14F] `}>
          <IconButton
            icon={'pencil'}
            style={{
              margin: 0,
              position: 'absolute',
              right: 5,
              zIndex: 20,
            }}
            iconColor="#6BB14F"
            onPress={() => {
              navigation.navigate('Profile');
            }}
          />
          <View className="m-2 flex-1 flex-row items-center justify-between h-28">
            <View className="flex-1 flex-row items-end justify-between">
              <View>
                <Text variant="titleLarge">{customer_first_name}</Text>
                <Text variant="titleSmall">{customer_mobile_no}</Text>
                <Text className="text-gray-500 mt-2" variant="labelLarge">
                  Your Current Balance
                </Text>
                <ShimmerPlaceHolder
                  LinearGradient={LinearGradient}
                  style={{marginTop: 2}}
                  width={110}
                  visible={!isWalletLoading}
                  height={30}>
                  <Text className="text-gray-800 mt-0.5" variant="titleLarge">
                    ₹ {customer_current_wallet_amt}/-
                  </Text>
                </ShimmerPlaceHolder>
              </View>

              <Button
                onPress={() => setWalletVisible(true)}
                uppercase
                mode="elevated"
                textColor="#1E1E1E"
                labelStyle={{fontSize: 14, fontFamily: 'Exo2-SemiBold'}}
                icon={() => (
                  <Image
                    source={images.add_money_fill}
                    className="h-7 w-7"
                    resizeMode="contain"
                    tintColor={'#6BB14F'}
                  />
                )}>
                Top up
              </Button>
            </View>
          </View>
        </Animated.View>

        <Text variant="bodyLarge" className="text-center my-2">
          Version: {appVersion}
        </Text>

        <View className="flex-1 flex-wrap flex-row">
          {settingList.map((item, index) => {
            return (
              <Animated.View
                key={index}
                entering={FadeInDown}
                style={{
                  height: 100,
                  width: '50%',
                }}>
                <TouchableOpacity
                  onPress={item.onPress}
                  className={`flex-1 rounded-lg ${
                    isIos ? 'shadow-sm' : 'shadow-lg'
                  } shadow-[#6BB14F] m-2 bg-white items-center justify-center py-2`}>
                  <Image
                    className="w-6 h-6"
                    source={item.icon}
                    resizeMode="contain"
                  />
                  <Text className="text-center mt-1" variant="bodyLarge">
                    {item.title}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
        <View className="flex-1 flex-wrap flex-row">
          {footerList.map((item, index) => {
            return (
              <Animated.View
                style={{
                  height: 100,
                  width: '50%',
                }}
                key={index}
                entering={FadeInDown}>
                <TouchableOpacity
                  onPress={item.onPress}
                  className={`flex-1 rounded-lg ${
                    isIos ? 'shadow-sm' : 'shadow-lg'
                  } shadow-[#6BB14F] m-2 bg-white items-center justify-center py-2`}>
                  <Image
                    className="w-8 h-8 ml-3"
                    source={item.icon}
                    resizeMode="contain"
                  />
                  <Text
                    variant="bodyLarge"
                    className="text-center mt-1 text-red-500">
                    {item.title}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
      <Dialog visible={logoutAlert} onDismiss={() => setLogoutAlert(false)}>
        <Dialog.Title className="text-center">Confirmation</Dialog.Title>

        <Dialog.Content className="items-center">
          <Image source={images.logout} className="w-16 h-16" />
          <Text variant="bodyLarge">Are you sure you want to logout?</Text>

          <View className="flex-row w-full mt-5 items-center justify-evenly">
            <Button mode="outlined" onPress={() => setLogoutAlert(false)}>
              <Text>Cancel</Text>
            </Button>

            <Button
              mode="contained"
              className="bg-[#E31E24]"
              onPress={async () => await logoutFun()}>
              <Text className="text-white">Logout</Text>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog>
      {TopUpWallet()}
    </Surface>
  );
  function TopUpWallet() {
    return (
      <Dialog visible={walletVisible} onDismiss={() => setWalletVisible(false)}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}>
          <View>
            <Dialog.Title className="text-center text-lg">
              Add Amount to Top up
            </Dialog.Title>
            <Dialog.Content className="mt-2 items-center">
              <Formik
                initialValues={initialValues}
                innerRef={ref => (formRef.current = ref)}
                validationSchema={validationSchema}
                onSubmit={RazorpaySubmitButton}>
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                }) => (
                  <>
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
                      keyboardType="numeric"
                      value={values.amount}
                      error={errors.amount && touched.amount}
                      onChangeText={handleChange('amount')}
                      left={
                        <TextInput.Icon
                          style={{marginTop: 15}}
                          icon={() => (
                            <Image source={images.rupess} className="w-5 h-5" />
                          )}
                        />
                      }
                      maxLength={10}
                    />
                    {errors.amount && touched.amount && (
                      <HelperText
                        className="self-start"
                        type="error"
                        variant="bodyMedium">
                        {errors.amount}
                      </HelperText>
                    )}

                    <View className="flex-row items-center mt-3">
                      <Icon
                        source={'information-outline'}
                        size={18}
                        color="gray"
                      />
                      <Text className="ml-2">
                        The amount added to the wallet is non-refundable unless
                        a charger technical issue occurs.
                      </Text>
                    </View>

                    <Button
                      mode="contained"
                      className="w-[80%] mt-5"
                      onPress={handleSubmit}>
                      Add
                    </Button>
                  </>
                )}
              </Formik>
            </Dialog.Content>
          </View>
        </TouchableWithoutFeedback>
      </Dialog>
    );
  }
}
