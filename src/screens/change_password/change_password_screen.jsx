import {
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {images} from '../../assets/images/images';
import {Button, HelperText, Text, TextInput} from 'react-native-paper';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {changePasswordFun} from '../../services/user_service';
import MyAppBar from '../../utils/components/appBar';
import {Toast} from 'react-native-toast-notifications';

export default function ForgotPasswordChangePasswordScreen({
  navigation,
  route,
}) {
  const [oldpassSecure, setoldPassSecure] = useState(true);
  const [passSecure, setPassSecure] = useState(true);
  const [conPassSecure, setConPassSecure] = useState(true);
  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const adShown = useRef(false);

  const initialPasswordValues = {
    oldpassword: '',
    password: '',
    confirmPassword: '',
  };

  const passwordValidationSchema = Yup.object({
    oldpassword: Yup.string()
      .required('Old Password is required')
      .min(8, 'Old Password must be at least 8 characters')
      .matches(
        /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
        'Old Password must contain 1 uppercase, 1 lowercase, 1 special character and 1 number',
      ),
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
      let customer_id = await AsyncStorage.getItem('customer_id');
      let ApiReqData = {};
      if (customer_id && values.oldpassword && values.password) {
        let ApiReqData = {
          customer_id: customer_id,
          customer_old_pass: values.oldpassword,
          customer_pass: values.password,
          customer_pass_confirm: values.confirmPassword,
        };

        await changePasswordFun(ApiReqData)
          .then(async response => {
            if (response && response.success) {
              await AsyncStorage.removeItem('iSlogin');
              await AsyncStorage.removeItem('customer_id');
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('customer_first_name');
              await AsyncStorage.removeItem('customer_profile');
              await AsyncStorage.removeItem('customer_current_wallet_amt');
              await AsyncStorage.removeItem('customer_mobile_no');
              await AsyncStorage.removeItem('customer_mail_id');
              await AsyncStorage.removeItem('referral_code');
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

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="flex-1 bg-white">
        <MyAppBar title={'Change Password'} />

        <ScrollView
          contentContainerStyle={{alignItems: 'center', paddingBottom: 20}}
          className="flex-1 bg-white px-5">
          <Image source={images.logo} className="w-64 h-64 my-5" />
          <Text variant="titleLarge" className="text-center mb-10">
            Update your password and keep your account secure!
          </Text>

          <Formik
            enableReinitialize
            initialValues={initialPasswordValues}
            validationSchema={passwordValidationSchema}
            onSubmit={handleSubmit}>
            {({handleChange, handleSubmit, values, errors, touched}) => (
              <>
                {passwordFields(values, handleChange, errors, touched)}

                <Button
                  className="w-[80%]"
                  mode="contained"
                  onPress={handleSubmit}>
                  Update
                </Button>
              </>
            )}
          </Formik>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );

  function passwordFields(values, handleChange, errors, touched) {
    return (
      <View className="items-center">
        {/* Old Password */}

        <TextInput
          label="Old Password"
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
          value={values.oldpassword}
          onChangeText={handleChange('oldpassword')}
          error={errors.oldpassword && touched.oldpassword}
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
              forceTextInputFocus={false}
              onPress={() => setoldPassSecure(!oldpassSecure)}
              style={{marginTop: 15}}
              icon={() =>
                !oldpassSecure ? (
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
          secureTextEntry={oldpassSecure}
        />
        {errors.oldpassword && touched.oldpassword && (
          <HelperText className="self-start" type="error" variant="bodyMedium">
            {errors.oldpassword}
          </HelperText>
        )}

        <View className="h-5" />

        {/* Password */}

        <TextInput
          label="Password"
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
          value={values.password}
          onChangeText={handleChange('password')}
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
              onPress={() => setPassSecure(!passSecure)}
              icon={() =>
                !passSecure ? (
                  <Image source={images.eye} className="w-5 h-5" />
                ) : (
                  <Image source={images.eyeOff} className="w-5 h-5" />
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

        <View className="h-5" />

        {/* Confirm Password */}

        <TextInput
          label="Confirm Password"
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
          value={values.confirmPassword}
          onChangeText={handleChange('confirmPassword')}
          error={errors.confirmPassword && touched.confirmPassword}
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
              forceTextInputFocus={false}
              onPress={() => setConPassSecure(!conPassSecure)}
              icon={() =>
                !conPassSecure ? (
                  <Image source={images.eye} className="w-5 h-5" />
                ) : (
                  <Image source={images.eyeOff} className="w-5 h-5" />
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
