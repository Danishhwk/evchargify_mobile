import {Image, KeyboardAvoidingView, Platform, View} from 'react-native';
import React, {useRef, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import NetworkStatus from '../network_screen';
import {images} from '../../assets/images/images';
import {Button, HelperText, Text, TextInput} from 'react-native-paper';
import {Formik} from 'formik';
import * as Yup from 'yup';
import OTPTextInput from 'react-native-otp-textinput';
import {
  forgotPasswordOtpSendFun,
  forgotPasswordOtpVerifyFun,
} from '../../services/forgot_password_service';
import {Toast} from 'react-native-toast-notifications';
import Loading from '../../utils/components/loading';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ReSendOtpService} from '../../services/login_service';
import MyAppBar from '../../utils/components/appBar';

export default function ForgotPasswordScreen({navigation}) {
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const otpInput = useRef(null);
  const [otpResendCount, setOtpResendCount] = useState(60);

  const initialOtpValues = {
    mobileNumber: '',
  };

  const otpValidationSchema = Yup.object({
    mobileNumber: Yup.string()
      .required('Mobile number is required')
      .matches(
        /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/,
        'Invalid mobile number format (10 digits required)',
      ),
  });

  const handleSubmit = async values => {
    setIsLoading(true);
    try {
      const ApiReqData = {customer_mobile_no: values.mobileNumber};
      const response = await forgotPasswordOtpSendFun(ApiReqData);

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
      setIsLoading(false);
      console.error('Error sending OTP:', error);
      Toast.show('Something went wrong. Please try again later.', {
        type: 'custom_toast',
        data: {title: 'Error'},
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

        const response = await forgotPasswordOtpVerifyFun(ApiReqData);

        if (response && response.success) {
          await AsyncStorage.setItem('iSlogin', 'true');
          await AsyncStorage.setItem(
            'customer_id',
            '' + response.data.customer_id,
          );
          await AsyncStorage.setItem('token', '' + response.data.token);
          await AsyncStorage.setItem('is_logout', 'false');

          Toast.show(response.message, {
            type: 'custom_toast',
            data: {title: 'Success'},
          });

          navigation.navigate('ForgotPasswordChangePasswordScreen', {
            customer_mobile_no: values.mobileNumber,
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
            response.message === 'Data not found..!'
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
      <View className="flex-1 bg-white">
        <MyAppBar title={'Forgot Password'} />
        <ScrollView
          contentContainerStyle={{alignItems: 'center', paddingBottom: 20}}
          automaticallyAdjustKeyboardInsets={true}
          className="flex-1 bg-white px-5">
          <NetworkStatus />
          <Image source={images.logo} className="w-64 h-64 my-5" />
          <Text variant="titleLarge" className="text-center mt-5">
            Forgot your Password?
          </Text>
          <Text variant="titleMedium" className="text-center mt-3">
            Enter your registered mobile number to receive an one-time password
            (OTP).
          </Text>
          <Formik
            onSubmit={handleSubmit}
            initialValues={initialOtpValues}
            validationSchema={otpValidationSchema}>
            {({handleChange, handleSubmit, values, errors, touched}) => (
              <>
                {otpFields(values, handleChange, errors, touched)}
                {otpSent &&
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
                      <Text variant="bodyLarge" className="text-[#1F4B99]">
                        Didn’t get the OTP? Resend it
                      </Text>
                    </Button>
                  ))}

                <Button
                  mode="contained"
                  className="w-60 bg-[#6BB14F] mt-10 mb-2 rounded-full"
                  onPress={otpSent ? () => verifyOtpFun(values) : handleSubmit}>
                  <Text variant="bodyLarge" className="text-white">
                    {otpSent ? 'Verify' : 'Send OTP'}
                  </Text>
                </Button>

                <Button
                  mode="text"
                  className="self-center"
                  onPress={() => navigation.goBack()}>
                  <Text variant="bodyLarge" className="text-[#E31E24]">
                    Already have an account?{' '}
                    <Text className="text-[#1F4B99]">Login</Text>
                  </Text>
                </Button>
              </>
            )}
          </Formik>
        </ScrollView>
        {<Loading visible={isLoading} />}
      </View>
    </KeyboardAvoidingView>
  );

  function otpFields(values, handleChange, errors, touched) {
    return (
      <View className="items-center mt-10">
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
      </View>
    );
  }
}
