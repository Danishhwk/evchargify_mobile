import {
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {images} from '../../assets/images/images';
import {Button, HelperText, Text, TextInput} from 'react-native-paper';
import {Formik} from 'formik';
import * as Yup from 'yup';
import OTPTextInput from 'react-native-otp-textinput';
import {forgotPasswordChangePasswordFun} from '../../services/forgot_password_service';
import NetworkStatus from '../network_screen';
import {Toast} from 'react-native-toast-notifications';

export default function ForgotPasswordChangePasswordScreen({
  navigation,
  route,
}) {
  const [passSecure, setPassSecure] = useState(true);
  const [conPassSecure, setConPassSecure] = useState(true);
  const [mode, setMode] = useState('1'); // 0 for PASSWORD and 1 for OTP
  const [obsecure, setObsecure] = useState(true);
  const otpInput = useRef(null);
  const [otpeditable, setotpeditable] = useState(true);
  const [customer_mobile_no, setcustomer_mobile_no] = useState(null);
  const [customer_mail_id, setcustomer_mail_id] = useState(null);

  useEffect(() => {
    // This code block will execute once the component has mounted (screen loaded)

    if (route.params && route.params.customer_mobile_no) {
      setcustomer_mobile_no(route.params.customer_mobile_no);
    }
    if (route.params && route.params.customer_mail_id) {
      setcustomer_mail_id(route.params.customer_mail_id);
    }

    // Ensure to return a cleanup function if necessary
    return () => {
      // This code block will execute when the component unmounts
    };
  }, []);

  const goToLogin = () => {
    navigation.navigate('LoginScreen');
  };

  const modeSelect = value => {
    setMode(value);
  };

  const initialPasswordValues = {
    password: '',
    confirmPassword: '',
  };

  const initialOtpValues = {
    otp: '',
  };

  const passwordValidationSchema = Yup.object({
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
        'Password must contain 1 uppercase, 1 lowercase, 1 special character and 1 number',
      ),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
  });

  const handleSubmit = async values => {
    try {
      // Handle form submission here

      let ApiReqData = {};
      if (customer_mobile_no && values.password) {
        ApiReqData = {
          customer_mobile_no: customer_mobile_no,
          customer_pass: values.password,
          customer_pass_confirm: values.confirmPassword,
        };

        await forgotPasswordChangePasswordFun(ApiReqData)
          .then(async response => {
            if (response && response.success) {
              navigation.navigate('LoginScreen');
              Toast.show(response.message, {
                type: 'custom_toast',
                data: {title: 'Success'},
              });
            } else {
              Toast.show(response.message, {
                type: 'custom_toast',
                data: {title: 'Error'},
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
            } else if (error.request) {
            } else {
            }
          });
      }
    } catch (error) {}
  };

  const otpValidationSchema = Yup.object({
    otp: Yup.string().required('OTP is required').length(6, 'Enter valid OTP'),
  });

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={{alignItems: 'center', paddingBottom: 20}}
        automaticallyAdjustKeyboardInsets={true}
        className="flex-1 bg-white px-5">
        <NetworkStatus />
        <Image source={images.logo} className="w-64 h-64 my-5" />

        <Text variant="titleLarge" className="text-center my-10">
          Set New Password
        </Text>

        <Formik
          enableReinitialize
          initialValues={initialPasswordValues}
          validationSchema={passwordValidationSchema}
          onSubmit={handleSubmit}>
          {({handleChange, handleSubmit, values, errors, touched}) => (
            <>
              {mode === '0'
                ? passwordFields(values, handleChange, errors, touched)
                : otpFields(values, handleChange, errors, touched)}

              <Button
                mode="contained"
                className="w-60 bg-[#72B334] mt-5 mb-2 rounded-full"
                onPress={handleSubmit}>
                <Text variant="bodyLarge" className="text-white">
                  Verify
                </Text>
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
    </KeyboardAvoidingView>
  );

  function otpFields(values, handleChange, errors, touched) {
    return (
      <View className="items-center">
        {/* Password */}

        <TextInput
          placeholder="Password"
          mode="outlined"
          className="w-80 h-11 bg-[#E2EFD6]"
          contentStyle={{paddingTop: 10, paddingBottom: 10}}
          outlineStyle={{elevation: 2, borderRadius: 10, borderWidth: 0}}
          value={values.password}
          onChangeText={handleChange('password')}
          left={
            <TextInput.Icon
              icon={() => (
                <Image source={images.password} className="w-6 h-6" />
              )}
            />
          }
          right={
            <TextInput.Icon
              forceTextInputFocus={false}
              onPress={() => setPassSecure(!passSecure)}
              icon={() =>
                !passSecure ? (
                  <Image source={images.eye} className="w-6 h-6" />
                ) : (
                  <Image source={images.eyeOff} className="w-6 h-6" />
                )
              }
            />
          }
          secureTextEntry={passSecure}
        />
        {errors.password && touched.password && (
          <HelperText className="self-start" type="error" variant="bodyMedium">
            {errors.password}
          </HelperText>
        )}

        <View className="h-7" />

        {/* Confirm Password */}

        <TextInput
          placeholder="Confirm Password"
          mode="outlined"
          className="w-80 h-11 bg-[#E2EFD6]"
          contentStyle={{paddingTop: 10, paddingBottom: 10}}
          outlineStyle={{
            elevation: 2,
            borderRadius: 10,
            borderWidth: 0,
          }}
          value={values.confirmPassword}
          onChangeText={handleChange('confirmPassword')}
          left={
            <TextInput.Icon
              icon={() => (
                <Image source={images.password} className="w-6 h-6" />
              )}
            />
          }
          right={
            <TextInput.Icon
              forceTextInputFocus={false}
              onPress={() => setConPassSecure(!conPassSecure)}
              icon={() =>
                !conPassSecure ? (
                  <Image source={images.eye} className="w-6 h-6" />
                ) : (
                  <Image source={images.eyeOff} className="w-6 h-6" />
                )
              }
            />
          }
          secureTextEntry={conPassSecure}
        />
        {errors.confirmPassword && touched.confirmPassword && (
          <HelperText className="self-start" type="error" variant="bodyMedium">
            {errors.confirmPassword}
          </HelperText>
        )}

        <View className="h-7" />
      </View>
    );
  }
}
