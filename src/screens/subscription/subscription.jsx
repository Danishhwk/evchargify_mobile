import {Image, RefreshControl, StatusBar, View} from 'react-native';
import React, {useRef, useEffect, useState} from 'react';
import {
  Button,
  Card,
  Dialog,
  HelperText,
  Text,
  TextInput,
} from 'react-native-paper';
import MyAppBar from '../../utils/components/appBar';
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {images} from '../../assets/images/images';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {userInfoFun} from '../../services/user_service';
import {Toast} from 'react-native-toast-notifications';
import Animated, {FadeIn, FadeInDown, FadeOut} from 'react-native-reanimated';
import {
  subscriptionAdd,
  subscriptionAssign,
  subscriptionList,
} from '../../services/subscription';
import moment from 'moment';
import {
  AdEventType,
  InterstitialAd,
  useForeground,
} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';
import Loading from '../../utils/components/loading';
import {interstitialAdUnitId} from '../../utils/constant';
import {initInnterstitialAd} from '../../utils/interstitial_ad_init';

export default function Subscription() {
  const [customer_id, setcustomer_id] = useState(null);
  const [customer_first_name, setcustomer_first_name] = useState(null);
  const [transactionListData, settransactionListData] = useState([]);
  const [walletVisible, setWalletVisible] = useState(false);
  const formRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedList, setSelectedList] = useState([]);

  const initialValues = {
    amount: '',
  };

  const validationSchema = Yup.object({
    amount: Yup.mixed().required('Code is required'),
  });

  useEffect(() => {
    fetchSessionData();
    return () => {};
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchSessionData();
    setIsRefreshing(false);
  };

  const fetchSessionData = async () => {
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');
      console.log(
        'user wallet fecthsession screen fetchData customer_id: ',
        customer_id,
      );

      setcustomer_id(customer_id);

      let userInfoData = {customer_id: customer_id};
      const response = await userInfoFun(userInfoData);

      if (response && response.success) {
        if (response.data.customer_first_name) {
          await AsyncStorage.setItem(
            'customer_first_name',
            '' + response.data.customer_first_name,
          );
          setcustomer_first_name(response.data.customer_first_name);
          fetchSubscriptionList();
        }
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

  const fetchSubscriptionList = async () => {
    setIsLoading(true);

    try {
      let customer_id = await AsyncStorage.getItem('customer_id');
      const response = await subscriptionList(customer_id);
      if (response && response.success) {
        console.log('fetchSubscriptionList response', response);
        settransactionListData(response.customerCoupons);
        setSelectedList(response.selectedCoupons);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const add = async (value, {resetForm}) => {
    console.log('top_up_amt', value.amount);
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');
      const response = await subscriptionAdd(customer_id, value.amount);

      console.log('response', response);

      if (response && response.success) {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Success'},
        });
        fetchSubscriptionList();
        resetForm({values: ''});
        setWalletVisible(false);
      } else {
        Toast.show('Invalid Code', {
          type: 'custom_toast',
          data: {title: 'Error'},
        });
        setWalletVisible(false);
        resetForm({values: ''});
      }
    } catch (error) {
      setWalletVisible(false);
    }
  };

  const assign = async code => {
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');
      const response = await subscriptionAssign(customer_id, code);

      console.log('response', response);

      if (response && response.success) {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Success'},
        });
        fetchSubscriptionList();
      } else {
        Toast.show('Something went wrong', {
          type: 'custom_toast',
          data: {title: 'Error'},
        });
      }
    } catch (error) {}
  };

  return (
    <View className="flex-1 h-full bg-white">
      <MyAppBar title={'My Subscription'} />

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

          <View className="w-14 h-1 bg-[#6a6f63] rounded-full mt-5" />

          {RegularCard()}

          {!isLoading &&
            transactionListData.map((item, index) =>
              recentTransCard(item, index),
            )}
          {transactionListData.length === 0 && <View />}
        </Animated.View>
      </ScrollView>

      {TopUpWallet()}
    </View>
  );

  function RegularCard() {
    const isSelect = selectedList.length <= 0;

    const borderColor = isSelect ? 'border-l-green-400' : 'border-l-gray-500';

    return (
      <Animated.View
        needsOffscreenAlphaCompositing
        entering={FadeInDown}
        className="flex-1 w-full px-3 mt-4 items-center">
        <Card
          elevation={1}
          onPress={
            isSelect
              ? null
              : () => {
                  assign('');
                }
          }
          className={`w-full bg-white border-l-8 ${borderColor}`}>
          <View className="flex-row m-3 items-center">
            <View className="w-[60%]">
              <View className="flex-row flex-1 items-center">
                <Text
                  numberOfLines={1}
                  style={{flex: 1}}
                  className="ml-2 text-lg"
                  variant="bodyLarge">
                  Regular
                </Text>
              </View>
            </View>
            <View className="flex-1">
              <Text
                variant="bodyLarge"
                numberOfLines={1}
                className="text-[#6BB14F] text-right w-[100%] text-lg mt-2">
                ₹ 20
              </Text>
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  }

  function TopUpWallet() {
    return (
      <Dialog
        style={{
          maxWidth: 400,
          minHeight: 250,
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        visible={walletVisible}
        onDismiss={() => setWalletVisible(false)}>
        <Dialog.Title className="text-center text-lg">
          Add Coupon Code
        </Dialog.Title>
        <Dialog.Content className="mt-2 items-center">
          <Formik
            initialValues={initialValues}
            innerRef={ref => (formRef.current = ref)}
            validationSchema={validationSchema}
            onSubmit={add}>
            {({handleChange, handleSubmit, values, errors, touched}) => (
              <>
                <TextInput
                  label="Enter Code"
                  mode="outlined"
                  className="w-80 h-10"
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
                  keyboardType="ascii-capable"
                  value={values.amount}
                  autoCapitalize="characters"
                  onChangeText={handleChange('amount')}
                  error={errors.amount && touched.amount}
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

                <Button
                  mode="contained"
                  className="w-60 mt-5"
                  onPress={handleSubmit}>
                  Add
                </Button>
              </>
            )}
          </Formik>
        </Dialog.Content>
      </Dialog>
    );
  }

  function recentTransCard(item, index) {
    const epxireDate = moment(item.expiry_date).format('DD MMM YYYY');
    const currentDate = new Date();
    const expireCheck = new Date(item.expiry_date);

    const isExpire = currentDate > expireCheck;

    const selectedId = selectedList <= 0 ? 0 : selectedList[0].is_selected;

    const selected = selectedId == item.subscription_id;

    const borderColor = selected ? 'border-l-green-400' : 'border-l-gray-500';

    return (
      <Animated.View
        key={index}
        needsOffscreenAlphaCompositing
        entering={FadeInDown}
        className="flex-1 w-full px-3 mt-4 items-center">
        <Card
          onPress={
            isExpire || selected
              ? null
              : () => {
                  assign(item.coupon_code);
                }
          }
          elevation={1}
          className={`w-full bg-white border-l-8 ${borderColor}`}>
          <View className="flex-row m-3 items-start">
            <View className="w-[60%]">
              <View className="flex-col flex-1 items-start">
                <Text
                  numberOfLines={1}
                  style={{flex: 1}}
                  className="text-lg"
                  variant="bodyLarge">
                  {item.subscription_name}
                </Text>

                <Text variant="labelMedium" className="mt-1">
                  {epxireDate} {isExpire ? '- Expired' : ''}
                </Text>
              </View>
            </View>
            <View className="flex-1">
              <Text
                variant="bodyLarge"
                numberOfLines={1}
                className="text-[#6BB14F] text-right w-[100%] text-lg mt-2">
                ₹ {item.amount}
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
        <View className="flex-row items-center justify-between">
          <Text variant="bodyLarge" className="text-[#f5f5f5] text-xl">
            {customer_first_name}
          </Text>
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
            Add
          </Button>
        </View>
      </LinearGradient>
    );
  }
}
