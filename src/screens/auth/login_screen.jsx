import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {Formik} from 'formik';
import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  View,
} from 'react-native';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import {checkVersion} from 'react-native-check-version';
import DeviceInfo from 'react-native-device-info';
import {ScrollView} from 'react-native-gesture-handler';
import OTPTextInput from 'react-native-otp-textinput';
import {Button, Dialog, HelperText, Text, TextInput} from 'react-native-paper';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import Animated, {FadeInDown} from 'react-native-reanimated';
import SegmentedControl from 'react-native-segmented-control-2';
import {Toast} from 'react-native-toast-notifications';
import * as Yup from 'yup';
import {images} from '../../assets/images/images';
import {
  loginOtpFun,
  loginPasswordFun,
  loginSendOtpFun,
  ReSendOtpService,
} from '../../services/login_service';
import {notificationAddService} from '../../services/notification_service';
import {userInfoFun} from '../../services/user_service';
import Loading from '../../utils/components/loading';
import {isAndroid} from '../../utils/helpers';
import NetworkStatus from '../network_screen';

export default function LoginScreen({navigation}) {
  const [obsecure, setObsecure] = useState(true);
  const [mode, setMode] = useState('0'); // 0 for PASSWORD and 1 for OTP
  const [isLoading, setIsLoading] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const otpInput = useRef(null);
  const [otpResendCount, setOtpResendCount] = useState(60);
  const [versionUrl, setVersionUrl] = useState('');
  const [needUpdate, setNeedUpdate] = useState(false);
  const initialPasswordValues = {
    mobileNo: '',
    password: '',
  };
  const initialOtpValues = {
    mobileNumber: '',
  };

  const checkAppUpdate = async () => {
    console.log('checking app update');

    const version = await checkVersion({
      country: 'in',
    });

    setVersionUrl(version.url);
    if (version.needsUpdate) {
      setNeedUpdate(true);
    } else {
      setNeedUpdate(false);
    }
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

  const otpValidationSchema = Yup.object({
    mobileNumber: Yup.string()
      .required('Mobile number is required')
      .matches(
        /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/,
        'Invalid mobile number format (10 digits required)',
      ),
  });

  useEffect(() => {
    requestNotificationPermission();
    checkLocationPermission();
    // checkAppUpdate();
    const appVersion = DeviceInfo.getVersion();
    setAppVersion(appVersion);
    return () => {};
  }, []);

  async function requestNotificationPermission() {
    try {
      await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then(
        async status => {
          if (Platform.OS === 'android') {
            if (status == 'denied' || status == 'blocked') {
              // await openSettings();
            }
          } else {
            const settings = await notifee.requestPermission({
              alert: true,
              badge: true,
              sound: true,
              announcement: true,
              criticalAlert: true,
            });

            if (settings.authorizationStatus) {
              console.log('User has notification permissions enabled');
            } else {
              console.log('User has notification permissions disabled');
              // await openSettings();
            }
          }
        },
      );
    } catch (error) {
      console.log('Error requesting notification permission:', error);
    }
  }

  const checkLocationPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const result = await check(permission);

    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log('This feature is not available on this device or OS.');

        break;
      case RESULTS.DENIED:
        console.log('Permission has not been requested / is denied.');
        requestLocationPermissions();

        break;
      case RESULTS.GRANTED:
        console.log('Permission is granted.');
        await requestLocationPermissions();

        break;
      case RESULTS.BLOCKED:
        console.log('Permission is denied and cannot be requested (blocked).');
        requestLocationPermissions();

        break;
    }
  };

  const requestLocationPermissions = async () => {
    try {
      console.log('requestLocationPermissions');

      if (Platform.OS === 'ios') {
        const status = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (status === RESULTS.GRANTED) {
          console.log('Location permission granted.');
          const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
          if (result === RESULTS.DENIED) {
            await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
          }
        } else {
          console.log('Location permission denied.');
        }
      } else if (Platform.OS === 'android') {
        const granted = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        const isEnable = await isLocationEnabled();

        if (granted === RESULTS.GRANTED) {
          console.log('Location permission granted.');
        } else {
          console.log('Location permission denied.');
        }
        if (granted === RESULTS.GRANTED && !isEnable) {
          await promptForEnableLocationIfNeeded();
        }
      }
    } catch (error) {
      console.log('Error requesting location permissions:', error);
    }
  };

  async function requestUserPermission() {
    const statuses = await requestMultiple([
      PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ]);

    if (Platform.OS === 'android') {
      const deniedPermissions = Object.entries(statuses).filter(
        ([permission, status]) => status === 'denied' || status === 'blocked',
      );

      if (deniedPermissions.length > 0) {
        await openSettings();
      }
    } else {
      const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
      if (result === RESULTS.DENIED) {
        await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
      }
      const settings = await notifee.requestPermission({
        alert: true,
        badge: true,
        sound: true,
        announcement: true,
        criticalAlert: true,
      });

      if (settings.authorizationStatus !== AuthorizationStatus.AUTHORIZED) {
        console.log('User has notification permissions disabled');
        await openSettings();
      }
    }
    if (isAndroid) {
      await promptForEnableLocationIfNeeded();
    }
  }

  const modeSelect = value => {
    setMode(value);
  };

  const goToForgotPassword = () => {
    navigation.navigate('ForgotPasswordScreen');
  };

  const goToRegister = () => {
    navigation.navigate('RegisterScreen');
  };

  const fetchData = async customer_id => {
    try {
      const response = await userInfoFun({customer_id});

      if (response && response.success) {
        const {
          customer_first_name,
          customer_profile,
          wallet_amt,
          customer_mobile_no,
          customer_mail_id,
          referral_code,
        } = response.data;

        await AsyncStorage.removeItem('customer_first_name');
        await AsyncStorage.removeItem('customer_profile');
        await AsyncStorage.removeItem('customer_current_wallet_amt');
        await AsyncStorage.removeItem('customer_mobile_no');
        await AsyncStorage.removeItem('customer_mail_id');
        await AsyncStorage.removeItem('referral_code');

        if (customer_first_name)
          await AsyncStorage.setItem(
            'customer_profile',
            '' + response.data.customer_profile,
          );
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
    } catch (error) {}
  };

  const handleSubmitRedirectFun = async customer_id => {
    await fetchData(customer_id);
    navigation.reset({
      index: 0,
      routes: [{name: 'bottomNav'}],
    });
    setIsLoading(false);
  };

  const getFCMToken = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      console.log(`${Platform.OS} fcmToken`, token);
      notificationAddFun(token);
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  };

  const notificationAddFun = async fcmToken => {
    try {
      const customer_id = await AsyncStorage.getItem('customer_id');
      const device_platform = Platform.OS;
      const response = await notificationAddService(
        customer_id,
        device_platform,
        fcmToken,
      );
      return response;
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const handleSumbitFun = async values => {
    setIsLoading(true);

    try {
      if (mode === '0') {
        // PASSWORD LOGIN CODE

        const ApiReqData = {
          customer_mobile_no: values.mobileNo,
          customer_pass: values.password,
        };
        const response = await loginPasswordFun(ApiReqData);

        if (response && response.success) {
          await AsyncStorage.setItem('iSlogin', 'true');
          await AsyncStorage.setItem(
            'customer_id',
            '' + response.data.customer_id,
          );
          await AsyncStorage.setItem('token', response.data.token);
          await AsyncStorage.setItem('is_logout', 'false');
          await handleSubmitRedirectFun(response.data.customer_id);
          getFCMToken();
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
      } else {
        // SEND OTP CODE
        try {
          const ApiReqData = {customer_mobile_no: values.mobileNumber};
          const response = await loginSendOtpFun(ApiReqData);

          if (response && response.success) {
            setOtpSent(true);
            setIsLoading(false);
            Toast.show(response.message, {
              type: 'custom_toast',
              data: {title: 'Success'},
            });
            otpResendCountFun();
          } else {
            setOtpSent(false);
            setIsLoading(false);
            const errorMessage =
              response.message === 'Data not found..!'
                ? 'Invalid mobile number, Please enter a registered mobile number'
                : response.message;
            Toast.show(errorMessage, {
              type: 'custom_toast',
              data: {title: 'Error'},
            });
            if (errorMessage === 'OTP already Send..!') {
              otpResendCountFun();
            }
          }
        } catch (error) {
          setOtpSent(false);
          setIsLoading(false);
          console.error('Error sending OTP:', error);
          Toast.show('Something went wrong. Please try again later.', {
            type: 'custom_toast',
            data: {title: 'Error'},
          });
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.log('error', error);

      Toast.show('Something went wrong. Please try again later', {
        type: 'custom_toast',
        data: {
          title: 'Error',
        },
      });
    }
  };

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

  const verifyOtpFun = async values => {
    if (values.mobileNumber && values.otp) {
      setIsLoading(true);
      try {
        const ApiReqData = {
          customer_mobile_no: values.mobileNumber,
          otp: parseInt(values.otp),
        };

        const response = await loginOtpFun(ApiReqData);

        if (response && response.success) {
          await AsyncStorage.setItem('iSlogin', 'true');
          await AsyncStorage.setItem(
            'customer_id',
            '' + response.data.customer_id,
          );
          await AsyncStorage.setItem('token', '' + response.data.token);
          await AsyncStorage.setItem('is_logout', 'false');

          await handleSubmitRedirectFun(response.data.customer_id);
          getFCMToken();
          Toast.show(response.message, {
            type: 'custom_toast',
            data: {title: 'Success'},
          });
        } else {
          throw new Error(response.message || 'An unexpected error occurred');
        }
      } catch (error) {
        setIsLoading(false);
        const errorMessage =
          error.message === 'wrong OTP..!' ? 'Invalid OTP' : error.message;
        Toast.show(errorMessage, {
          type: 'custom_toast',
          data: {title: 'Error'},
        });
      }
    } else {
      Toast.show('Please enter mobile number and OTP', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  const resendOtpFun = async values => {
    if (values.mobileNumber) {
      setIsLoading(true);
      try {
        const ApiReqData = {customer_mobile_no: values.mobileNumber};
        const response = await ReSendOtpService(ApiReqData);

        if (response && response.success) {
          setOtpSent(true);
          setIsLoading(false);
          Toast.show(response.message, {
            type: 'custom_toast',
            data: {title: 'Success'},
          });
          otpResendCountFun();
        } else {
          setOtpSent(false);
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
    } else {
      Toast.show('Please enter mobile number', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="flex-1">
        <NetworkStatus />
        <ScrollView
          contentContainerStyle={{alignItems: 'center', paddingBottom: 20}}
          automaticallyAdjustKeyboardInsets={true}
          className="flex-1 bg-white px-5">
          <Image source={images.logo} className="w-64 h-64 my-5" />
          {/* {modeSelectRender()} */}
          <SegmentedControl
            tabs={['PASSWORD', 'OTP']}
            onChange={index => setMode(index.toString())}
            textStyle={{
              fontSize: 14,
              fontFamily: 'Exo2-Bold',
              color: '#6BB14F',
            }}
            activeTabColor="#6BB14F"
            activeTextColor="white"
            tabStyle={{
              height: 45,
            }}
          />
          <Text variant="titleLarge" className="text-center my-10">
            {mode === '0'
              ? 'Sign in with your registered mobile number and password.'
              : 'Enter your registered mobile number to receive an one-time password (OTP).'}
          </Text>

          <Formik
            onSubmit={handleSumbitFun}
            enableReinitialize={true}
            initialValues={
              mode === '0' ? initialPasswordValues : initialOtpValues
            }
            validationSchema={
              mode === '0' ? passwordValidationSchema : otpValidationSchema
            }>
            {({handleChange, handleSubmit, values, errors, touched}) => (
              <>
                {mode === '0' &&
                  passwordFields(values, handleChange, errors, touched)}

                {mode === '1' &&
                  otpFields(values, handleChange, errors, touched)}

                {mode === '1' &&
                  otpSent &&
                  (otpResendCount > 0 ? (
                    <Text
                      variant="bodyLarge"
                      className="text-center text-[#E31E24] mt-5">
                      Resend OTP in {otpResendCount} seconds
                    </Text>
                  ) : (
                    <Button
                      mode="text"
                      className="self-center mt-1"
                      onPress={() => resendOtpFun(values)}>
                      <Text variant="bodyLarge" className="text-[#6BB14F]">
                        Didn’t get the OTP? Resend it
                      </Text>
                    </Button>
                  ))}

                {(() => {
                  if (mode === '0') {
                    return (
                      <Button
                        mode="contained"
                        className="w-60 mt-5 mb-2"
                        onPress={handleSubmit}>
                        Login
                      </Button>
                    );
                  } else {
                    return (
                      <Button
                        mode="contained"
                        className="w-60 mt-5 mb-2"
                        onPress={
                          otpSent ? () => verifyOtpFun(values) : handleSubmit
                        }>
                        {otpSent ? 'Verify' : 'Send OTP'}
                      </Button>
                    );
                  }
                })()}
              </>
            )}
          </Formik>
          <View className="mt-1">
            <Button mode="text" className="self-center" onPress={goToRegister}>
              <Text variant="bodyLarge" className="text-[#E31E24]">
                Don’t have an account?
                <Text className="text-[#6BB14F]"> Register</Text>
              </Text>
            </Button>
            <Text variant="bodyLarge" className="text-center mt-2">
              Version: {appVersion}
            </Text>
          </View>
        </ScrollView>

        {Loading({visible: isLoading})}
        {updateDialog()}
      </View>
    </KeyboardAvoidingView>
  );

  function otpFields(values, handleChange, errors, touched) {
    return (
      <Animated.View
        entering={FadeInDown}
        needsOffscreenAlphaCompositing
        className="items-center">
        <TextInput
          label="Mobile Number"
          mode="outlined"
          dataDetectorTypes={'phoneNumber'}
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
          keyboardType="numeric"
          value={values.mobileNumber}
          onChangeText={handleChange('mobileNumber')}
          error={errors.mobileNumber && touched.mobileNumber}
          left={
            <TextInput.Icon
              style={{marginTop: 15}}
              icon={() => <Image source={images.phone} className="w-5 h-5" />}
            />
          }
          maxLength={10}
        />

        {errors.mobileNumber && touched.mobileNumber && (
          <HelperText className="self-start" type="error" variant="bodyMedium">
            {errors.mobileNumber}
          </HelperText>
        )}

        {otpSent && (
          <OTPTextInput
            ref={otpInput}
            editable={otpSent}
            defaultValue={values.otp}
            containerStyle={{marginTop: 20}}
            handleTextChange={handleChange('otp')}
            inputCount={6}
            tintColor={'#6BB14F'}
            textInputStyle={{
              borderWidth: 2,
              backgroundColor: '#fff',
              elevation: 2,
              borderRadius: 10,
              width: 45,
              height: 50,
              fontSize: 18,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.2,
              shadowRadius: 1.41,
            }}
          />
        )}
      </Animated.View>
    );
  }

  function passwordFields(values, handleChange, errors, touched) {
    return (
      <Animated.View
        entering={FadeInDown}
        needsOffscreenAlphaCompositing
        className="items-center">
        <TextInput
          label="Mobile Number"
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
          keyboardType="numeric"
          autoComplete="tel"
          value={values.mobileNo}
          onChangeText={handleChange('mobileNo')}
          error={errors.mobileNo && touched.mobileNo}
          left={
            <TextInput.Icon
              style={{marginTop: 15}}
              icon={() => <Image source={images.phone} className="w-5 h-5" />}
            />
          }
          maxLength={10}
        />

        {errors.mobileNo && touched.mobileNo && (
          <HelperText className="self-start" type="error" variant="bodyMedium">
            {errors.mobileNo}
          </HelperText>
        )}

        <View className="h-6" />

        <TextInput
          label="Password"
          value={values.password}
          onChangeText={handleChange('password')}
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
          error={errors.password && touched.password}
          left={
            <TextInput.Icon
              style={{marginTop: 15}}
              icon={() => (
                <Image source={images.password} className="w-5 h-5" />
              )}
            />
          }
          right={
            <TextInput.Icon
              style={{marginTop: 15}}
              forceTextInputFocus={false}
              onPress={() => setObsecure(!obsecure)}
              icon={() =>
                !obsecure ? (
                  <Image
                    source={images.eye}
                    tintColor={'#6BB14F'}
                    className="w-5 h-5"
                  />
                ) : (
                  <Image
                    source={images.eyeOff}
                    tintColor={'black'}
                    className="w-5 h-5"
                  />
                )
              }
            />
          }
          secureTextEntry={obsecure}
        />

        {errors.password && touched.password && (
          <HelperText className="self-start" type="error" variant="bodyMedium">
            {errors.password}
          </HelperText>
        )}

        <Button
          mode="text"
          className="self-end mt-2"
          onPress={goToForgotPassword}>
          <Text variant="bodySmall" className="text-[#E31E24]">
            Forgot Password?
          </Text>
        </Button>
      </Animated.View>
    );
  }

  function modeSelectRender() {
    return (
      <View className="flex-row justify-between items-center">
        <Button
          mode="contained"
          onPress={() => {
            modeSelect('0');
          }}
          className={
            mode === '0'
              ? 'bg-[#6BB14F] rounded-lg w-36 h-12 justify-center shadow-sm shadow-[#6BB14F]'
              : 'bg-[#fff] rounded-lg w-36 h-12 justify-center border-[#6BB14F] border-2'
          }>
          <Text
            variant={mode === '0' ? 'bodyLarge' : 'labelLarge'}
            style={
              mode === '0'
                ? {fontSize: 18, color: 'white'}
                : {fontSize: 18, color: 'black'}
            }>
            Password
          </Text>
        </Button>
        <View className="w-4" />
        <Button
          mode="contained"
          onPress={() => {
            modeSelect('1');
          }}
          labelStyle={
            mode === '1' ? {fontSize: 18} : {fontSize: 18, color: 'black'}
          }
          className={
            mode === '1'
              ? 'bg-[#6BB14F] rounded-lg w-36 h-12 justify-center shadow-sm shadow-[#6BB14F]'
              : 'bg-[#fff] rounded-lg w-36 h-12 justify-center border-[#6BB14F] border-2'
          }>
          <Text
            variant={mode === '1' ? 'bodyLarge' : 'labelLarge'}
            style={
              mode === '1'
                ? {fontSize: 18, color: 'white'}
                : {fontSize: 18, color: 'black'}
            }>
            OTP
          </Text>
        </Button>
      </View>
    );
  }

  function updateDialog() {
    return (
      <Dialog
        dismissable={false}
        visible={needUpdate}
        onDismiss={() => setNeedUpdate(false)}>
        <Dialog.Title className="text-center">Update Available</Dialog.Title>

        <Dialog.Content className="items-center">
          <Text className="text-center" variant="bodyLarge">
            A newer version of the app has been released,
          </Text>
          <Text className="text-center" variant="bodyLarge">
            Please install the update to continue using the app.
          </Text>

          <Button
            mode="contained"
            className="bg-[#6BB14F] mt-4"
            onPress={async () => {
              Linking.openURL(versionUrl);
            }}>
            <Text className="text-white">Update Now</Text>
          </Button>
        </Dialog.Content>
      </Dialog>
    );
  }
}
