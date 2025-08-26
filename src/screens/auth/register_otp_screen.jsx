import {View, Image, ScrollView} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {images} from '../../assets/images/images';
import {Button, HelperText, Text, TextInput} from 'react-native-paper';
import {Formik} from 'formik';
import * as Yup from 'yup';
import OTPTextInput from 'react-native-otp-textinput';
import {
  registerOtpVerifyFun,
  RegisterReSendOtpService,
} from '../../services/register_service';
import {userInfoFun} from '../../services/user_service';
import NetworkStatus from '../network_screen';
import {Toast} from 'react-native-toast-notifications';
import Loading from '../../utils/components/loading';
import messaging from '@react-native-firebase/messaging';
import {notificationAddService} from '../../services/notification_service';
import {ReSendOtpService} from '../../services/login_service';

export default function RegisterOtpScreen({navigation, route}) {
  const otpInput = useRef(null);
  const [otpeditable, setotpeditable] = useState(true);
  const [customer_mobile_no, setcustomer_mobile_no] = useState(null);
  const [customer_mail_id, setcustomer_mail_id] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpResendCount, setOtpResendCount] = useState(60);

  useEffect(() => {
    if (route.params && route.params.customer_mobile_no) {
      setcustomer_mobile_no(route.params.customer_mobile_no);
    }
    if (route.params && route.params.customer_mail_id) {
      setcustomer_mail_id(route.params.customer_mail_id);
    }
    otpResendCountFun();
    return () => {};
  }, []);

  const goToLogin = () => {
    navigation.navigate('LoginScreen');
  };

  const modeSelect = value => {
    setMode(value);
  };

  const initialPasswordValues = {
    mobileNo: '',
    password: '',
  };

  const initialOtpValues = {
    mobileNumber: '',
    otp: '',
  };

  const passwordValidationSchema = Yup.object({
    mobileNo: Yup.string()
      .required('Mobile number is required')
      .matches(
        /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/,
        'Invalid mobile number format (10 digits required)',
      ),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
        'Password must contain 1 uppercase, 1 lowercase, 1 special character and 1 number',
      ),
  });

  const fetchData = async customer_id => {
    try {
      let userInfoData = {customer_id: customer_id};
      const response = await userInfoFun(userInfoData);

      if (response && response.success) {
        await AsyncStorage.removeItem('customer_first_name');
        await AsyncStorage.removeItem('customer_profile');
        await AsyncStorage.removeItem('customer_current_wallet_amt');
        await AsyncStorage.removeItem('customer_mobile_no');
        await AsyncStorage.removeItem('customer_mail_id');
        await AsyncStorage.removeItem('referral_code');

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
      } else {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {
            title: 'Error',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const getFCMToken = async () => {
    var fcmToken = '';
    // await messaging().registerDeviceForRemoteMessages();
    if (Platform.OS === 'ios') {
      fcmToken = await messaging().getToken();

      console.log('ios fcmToken', await messaging().getToken());
    }
    if (Platform.OS === 'android') {
      fcmToken = await messaging().getToken();
      console.log('android fcmToken', await messaging().getToken());
    }

    notificationAddFun(fcmToken);
  };

  const notificationAddFun = async fcmToken => {
    const customer_id = (await AsyncStorage.getItem('customer_id')) || '0';

    const device_platform = Platform.OS;
    try {
      await notificationAddService(customer_id, device_platform, fcmToken)
        .then(response => {})
        .catch(error => {});
    } catch (error) {}
  };

  const handleSubmit = async values => {
    try {
      setIsLoading(true);
      let ApiReqData = {};
      if (customer_mobile_no && values.otp) {
        ApiReqData = {
          customer_mobile_no: customer_mobile_no,
          otp: parseInt(values.otp),
        };

        await registerOtpVerifyFun(ApiReqData)
          .then(async response => {
            if (response && response.success) {
              await AsyncStorage.setItem('iSlogin', 'true');
              if (response.data.customer_id) {
                await AsyncStorage.setItem(
                  'customer_id',
                  '' + response.data.customer_id,
                );
              }

              if (response.data.token) {
                await AsyncStorage.setItem('token', '' + response.data.token);
              }
              setIsLoading(false);
              await fetchData(response.data.customer_id);
              getFCMToken();
              navigation.reset({
                index: 0,
                routes: [{name: 'bottomNav'}],
              });
              Toast.show(response.message, {
                type: 'custom_toast',
                data: {
                  title: 'Success',
                },
              });
            } else {
              setIsLoading(false);
              Toast.show(response.message, {
                type: 'custom_toast',
                data: {
                  title: 'Error',
                },
              });
            }
          })
          .catch(error => {
            setIsLoading(false);
            if (error.response) {
              if (error.response.status !== 200) {
                Toast.show(error.response.data.message, {
                  type: 'custom_toast',
                  data: {
                    title: 'Error',
                  },
                });
              }
            } else if (error.request) {
            } else {
            }
          });
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const otpValidationSchema = Yup.object({
    otp: Yup.string().required('OTP is required').length(6, 'Enter valid OTP'),
  });

  const otpResendCountFun = () => {
    setOtpResendCount(60);
    let otpResendCountIntervalId;
    const startOtpResendCountDown = () => {
      otpResendCountIntervalId = setInterval(() => {
        setOtpResendCount(prevCount => (prevCount <= 0 ? 0 : prevCount - 1));
        if (otpResendCount <= 0) {
          clearInterval(otpResendCountIntervalId);
        }
      }, 1000);
    };

    const clearOtpResendCountDown = () =>
      clearInterval(otpResendCountIntervalId);

    startOtpResendCountDown();

    return clearOtpResendCountDown;
  };

  const resendOtpFun = async () => {
    setIsLoading(true);
    try {
      const ApiReqData = {customer_mobile_no: customer_mobile_no};
      const response = await RegisterReSendOtpService(ApiReqData);

      if (response && response.success) {
        setIsLoading(false);
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Success'},
        });
        otpResendCountFun();
      } else {
        setIsLoading(false);
        const errorMessage =
          response.message === 'OTP data not found..!'
            ? 'Invalid mobile number, Please enter a registered mobile number'
            : response.message;
        Toast.show(errorMessage, {
          type: 'custom_toast',
          data: {title: 'Error'},
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setIsLoading(false);
      Toast.show('Something went wrong. Please try again later.', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerStyle={{alignItems: 'center', paddingBottom: 20}}
        className="flex-1 bg-white px-5">
        <NetworkStatus />
        <Image source={images.logo} className="w-64 h-64 my-5" />

        <Text variant="titleLarge" className="text-center my-10">
          {'A 6 digit code has been sent to ' +
            customer_mobile_no +
            ' and ' +
            customer_mail_id}
        </Text>

        <Formik
          enableReinitialize
          initialValues={initialOtpValues}
          validationSchema={otpValidationSchema}
          onSubmit={handleSubmit}>
          {({handleChange, handleSubmit, values, errors, touched}) => (
            <>
              {otpFields(values, handleChange, errors, touched)}
              {otpResendCount > 0 ? (
                <Text
                  variant="bodyLarge"
                  className="text-center text-[#6BB14F] mt-5">
                  Resend OTP in {otpResendCount} seconds
                </Text>
              ) : (
                <Button
                  mode="text"
                  className="self-center mt-1"
                  onPress={() => resendOtpFun()}>
                  <Text variant="bodyLarge" className="text-[#1F4B99]">
                    Didn’t get the OTP? Resend it
                  </Text>
                </Button>
              )}
              <Button
                mode="contained"
                className="w-60 mt-5 mb-2"
                onPress={handleSubmit}>
                Verify
              </Button>
              <Button mode="text" className="self-center" onPress={goToLogin}>
                <Text variant="bodyMedium" className="text-[#E31E24]">
                  You already have an account?{' '}
                  <Text className="text-[#1F4B99]">Login</Text>
                </Text>
              </Button>
            </>
          )}
        </Formik>
      </ScrollView>
      {Loading({visible: isLoading})}
    </View>
  );

  function otpFields(values, handleChange, errors, touched) {
    return (
      <View className="items-center">
        <OTPTextInput
          ref={otpInput}
          editable={otpeditable}
          defaultValue={values.otp}
          containerStyle={{marginTop: 10}}
          handleTextChange={handleChange('otp')}
          inputCount={6}
          tintColor={'#6BB14F'}
          textInputStyle={{
            borderWidth: 2,
            backgroundColor: '#F6F6F6',
            elevation: 2,
            borderRadius: 10,
            width: 45,
            height: 50,
            fontSize: 18,
          }}
        />

        {errors.otp && touched.otp && (
          <HelperText className="self-start" type="error" variant="bodyMedium">
            {errors.otp}
          </HelperText>
        )}
      </View>
    );
  }
}
