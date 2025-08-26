import {
  Image,
  Keyboard,
  RefreshControl,
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from 'react-native';
import React, {useRef, useEffect, useState} from 'react';
import {
  Button,
  Card,
  Dialog,
  HelperText,
  Icon,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import MyAppBar from '../../utils/components/appBar';
import LinearGradient from 'react-native-linear-gradient';
import {images} from '../../assets/images/images';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {
  razorpayinitiateFun,
  razorpayUpdateFun,
  transactionList,
} from '../../services/wallet_service';
import {userInfoFun} from '../../services/user_service';
import {RazorpayProductionKey} from '../../utils/constant';
import {Toast} from 'react-native-toast-notifications';
import Loading from '../../utils/components/loading';
import Animated, {FadeIn, FadeInDown} from 'react-native-reanimated';
import NetworkStatus from '../network_screen';
import {useForeground} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';
import moment from 'moment';

export default function Wallet({navigation}) {
  const [customer_id, setcustomer_id] = useState(null);
  const [customer_first_name, setcustomer_first_name] = useState(null);
  const [customer_profile, setcustomer_profile] = useState(null);
  const [customer_current_wallet_amt, setcustomer_current_wallet_amt] =
    useState(null);
  const [customer_mobile_no, setcustomer_mobile_no] = useState(null);
  const [customer_mail_id, setcustomer_mail_id] = useState(null);
  const [top_up_amt, settop_up_amt] = useState(0);
  const [order_id, setorder_id] = useState(null);
  const [transactionListData, settransactionListData] = useState([]);
  const [walletVisible, setWalletVisible] = useState(false);
  const formRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  const initialValues = {
    amount: '',
  };

  const validationSchema = Yup.object({
    amount: Yup.number()
      .required('Amount is required')
      .min(50, 'Amount should be greater than 49'),
  });

  const fetchData = async () => {
    let customer_id_temp = await AsyncStorage.getItem('customer_id');
    setcustomer_id(customer_id_temp);
    console.log('wallet fetchData customer_id_temp: ', customer_id_temp);
    let customer_first_name_temp = await AsyncStorage.getItem(
      'customer_first_name',
    );
    setcustomer_first_name(customer_first_name_temp);
    let customer_profile_temp = await AsyncStorage.getItem('customer_profile');
    setcustomer_profile(customer_profile_temp);
    let customer_current_wallet_amt_temp = await AsyncStorage.getItem(
      'customer_current_wallet_amt',
    );
    setcustomer_current_wallet_amt(customer_current_wallet_amt_temp);
    let customer_mobile_no_temp = await AsyncStorage.getItem(
      'customer_mobile_no',
    );
    setcustomer_mobile_no(customer_mobile_no_temp);
    let customer_mail_id_temp = await AsyncStorage.getItem('customer_mail_id');
    setcustomer_mail_id(customer_mail_id_temp);
  };

  const fetchTransactionList = async () => {
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');
      console.log(
        'user wallet screen fetchtransactionlist customer_id: ',
        customer_id,
      );
      let userInfoData = {customer_id: customer_id};
      const response = await transactionList(userInfoData);

      if (response && response.success) {
        setTimeout(() => {
          settransactionListData(response.data);
        }, 300);
      } else {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Info'},
        });
      }
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setIsLoading(false);
      navigation.goBack();
    }
  };

  useEffect(() => {
    fetchData();
    fetchSessionData();
    const fetchSessionDataInterval = setInterval(() => {
      fetchSessionData();
    }, 60000);

    return () => {
      clearInterval(fetchSessionDataInterval);
    };
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
    fetchSessionData();
    fetchTransactionList();
    setIsRefreshing(false);
  };

  const fetchSessionData = async () => {
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');
      console.log(
        'user wallet fecthsession screen fetchData customer_id: ',
        customer_id,
      );

      let userInfoData = {customer_id: customer_id};
      const response = await userInfoFun(userInfoData);

      if (response && response.success) {
        if (response.data.customer_first_name) {
          await AsyncStorage.setItem(
            'customer_first_name',
            '' + response.data.customer_first_name,
          );
        }
        if (response.data.customer_profile) {
          await AsyncStorage.setItem(
            'customer_profile',
            '' + response.data.customer_profile,
          );
        }
        if (response.data.wallet_amt) {
          await AsyncStorage.setItem(
            'customer_current_wallet_amt',
            '' + response.data.wallet_amt,
          );
        }
        if (response.data.customer_mobile_no) {
          await AsyncStorage.setItem(
            'customer_mobile_no',
            '' + response.data.customer_mobile_no,
          );
        }
        if (response.data.customer_mail_id) {
          await AsyncStorage.setItem(
            'customer_mail_id',
            '' + response.data.customer_mail_id,
          );
        }
        if (response.data.referral_code) {
          await AsyncStorage.setItem(
            'referral_code',
            '' + response.data.referral_code,
          );
        }
        fetchData();
        fetchTransactionList();
      } else {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Info'},
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleChange = inputValue => {
    settop_up_amt(inputValue);
  };

  const RazorpayUpdateFun = async (
    type,
    order_id,
    payment_id,
    razorpay_response,
  ) => {
    try {
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
            settop_up_amt('');
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
              Toast.show(error.response.data.message, {
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
        theme: {color: '#72B334'},
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
  return (
    <View className="flex-1 h-full bg-white">
      <NetworkStatus />

      <MyAppBar title={'My Wallet'} />

      <ScrollView
        style={{
          marginTop: 10,
          paddingHorizontal: 15,
        }}
        contentContainerStyle={{paddingBottom: 20}}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              onRefresh();
            }}
          />
        }>
        <Animated.View
          needsOffscreenAlphaCompositing
          entering={FadeIn}
          className="flex-1 items-center">
          {walletCard()}
          <View className="h-5" />
          {tipsCard()}
          <View className="h-5" />
          <Text variant="titleMedium" className="text-[#1E1E1E]">
            Recent Transactions
          </Text>
          <View className="w-14 h-1 bg-[#6a6f63] rounded-full mt-2" />
          {transactionListData.map((item, index) => {
            return (
              <Animated.View
                key={index}
                className="w-full"
                needsOffscreenAlphaCompositing
                entering={FadeInDown.duration(800)}>
                {recentTransCard(item, index)}
              </Animated.View>
            );
          })}

          {transactionListData.length === 0 && (
            <Text
              variant="displaySmall"
              className="text-[#1E1E1E] mt-20 text-center">
              No Transaction found
            </Text>
          )}
        </Animated.View>
      </ScrollView>

      {TopUpWallet()}

      <Loading visible={isLoading} />
    </View>
  );

  function tipsCard() {
    return (
      <Surface className="w-full bg-white p-3 rounded-lg">
        {customer_current_wallet_amt < 100 ? (
          <View className="flex-row items-center mb-2">
            <Icon source={'information'} size={18} color="red" />
            <Text className="text-red-600 text-center ml-2">
              Account Balance is low
            </Text>
          </View>
        ) : null}

        <View className="w-[97%]">
          <View className="flex-row items-center">
            <Icon source={'information-outline'} size={18} color="gray" />
            <Text className="ml-2">
              Min Account balance to be maintained is: ₹ 50
            </Text>
          </View>
          <View className="flex-row items-center mt-2">
            <Icon source={'information-outline'} size={18} color="gray" />
            <Text className="ml-2">Min Top-up amount is: ₹ 50</Text>
          </View>
          <View className="flex-row items-center mt-2">
            <Icon source={'information-outline'} size={18} color="gray" />
            <Text className="ml-2">
              The amount added to the wallet is non-refundable unless a charger
              technical issue occurs.
            </Text>
          </View>
        </View>
      </Surface>
    );
  }

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

  function recentTransCard(item, index) {
    const transactionStatus = item.transaction_status; // 1(Success)[green], 2(Failed)[red], 3(Initialize)[grey]
    var title = 'Initialize';
    var borderColor = '#00A36C';

    if (transactionStatus === 1) {
      borderColor = '#00A36C';
      title = 'Success';
    } else if (transactionStatus === 2) {
      borderColor = '#D22B2B';
      title = 'Failed';
    } else if (transactionStatus === 3) {
      borderColor = '#E5E4E2';
      title = 'Initialize';
    }
    const isCR = event => {
      return (
        event === 'recharge' ||
        event === 'charging_refund' ||
        event === 'testing' ||
        event === 'wallet' ||
        event === 'register' ||
        event === 'referral_register'
      );
    };

    let arrorColor = '#00A36C';

    if (transactionStatus === 2) {
      arrorColor = '#D22B2B';
    } else {
      arrorColor = '#00A36C';
    }

    const utcTime = moment.utc(item.created_at);

    return (
      <Animated.View
        entering={FadeInDown}
        key={index}
        className="flex-1 w-full px-3 mt-4 items-center">
        <Card
          elevation={1}
          style={{
            width: '100%',
            backgroundColor: 'white',
            borderLeftWidth: 8,
            borderLeftColor: borderColor,
          }}>
          <View
            className={`absolute top-1 right-1 ${
              isCR(item.event) ? '' : 'rotate-180'
            }`}>
            <Icon
              source={'arrow-bottom-left-thin'}
              color={arrorColor}
              size={20}
            />
          </View>
          <View className="flex-row m-3 items-center">
            <View className="w-[60%]">
              <View className="flex-row flex-1 items-center">
                <View className="rounded-lg bg-[#6BB14F] p-1 px-2">
                  <Text variant="titleSmall" className="text-white">
                    {isCR(item.event) ? 'CR' : 'DR'}
                  </Text>
                </View>

                <Text
                  numberOfLines={1}
                  style={{flex: 1}}
                  className="ml-2 text-lg"
                  variant="bodyLarge">
                  {item.event === 'wallet_transfer' && 'Wallet Transfer'}
                  {item.event === 'block' && 'Block'}
                  {item.event === 'charging' && 'Charging'}
                  {item.event === 'charging_block' && 'Charging Block'}
                  {item.event === 'charging_refund' && 'Charging Refund'}
                  {item.event === 'recharge' && 'Recharge'}
                  {item.event === 'refund' && 'Refund'}
                  {item.event === 'register' && 'Register'}
                  {item.event === 'bank_transfer' && 'Bank Transfer'}
                  {item.event === 'referral_register' && 'Referral Register'}
                </Text>
              </View>
              <Text className="text-gray-500 mt-2" variant="labelMedium">
                {utcTime.format('DD MMM YYYY・hh:mm A')}
              </Text>
            </View>
            <View className="flex-1">
              <Text
                variant="bodyLarge"
                numberOfLines={1}
                className="text-[#6BB14F] text-right w-[100%] text-lg mt-2">
                ₹ {item.amt}/-
              </Text>

              <Text
                className="text-gray-500 mt-2 text-right"
                variant="labelMedium">
                Payment {title}
              </Text>
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  }

  function walletCard() {
    return (
      <LinearGradient
        className="bg-white w-full mt-2 p-5 rounded-2xl shadow-lg shadow-[#6BB14F]"
        style={{
          shadowColor: '#6BB14F',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.3,
          shadowRadius: 3.84,
        }}
        start={{x: -1, y: -2}}
        end={{x: 1, y: -3}}
        colors={['#6BB14F', '#6BB14F', '#6ea6ff50']}>
        <View style={{flex: 1}}>
          <View className="flex-row items-center justify-between">
            <Text variant="bodyLarge" className="text-[#f5f5f5] text-xl">
              {customer_first_name}
            </Text>
            <Image source={images.logo} className="h-14 w-14" />
          </View>

          <View className="flex-row flex-wrap gap-2 items-end justify-between mt-5">
            <View>
              <Text variant="titleSmall" className="text-[#f5f5f5]">
                Your Balance
              </Text>

              <Text variant="headlineSmall" className="text-[#f5f5f5]  mt-1">
                ₹ {customer_current_wallet_amt}/-
              </Text>
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
                  tintColor={'#1E1E1E'}
                />
              )}>
              Top up
            </Button>
          </View>
        </View>
      </LinearGradient>
    );
  }
}
