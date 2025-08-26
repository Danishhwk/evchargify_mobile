import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Button,
  Checkbox,
  HelperText,
  IconButton,
  Text,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import {images} from '../../assets/images/images';
import {Formik} from 'formik';
import * as Yup from 'yup';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {registerInsertFun} from '../../services/register_service';
import NetworkStatus from '../network_screen';
import {Toast} from 'react-native-toast-notifications';
import Loading from '../../utils/components/loading';
import {StackActions} from '@react-navigation/native';
import MyAppBar from '../../utils/components/appBar';

export default function RegisterScreen({navigation}) {
  const [checked, setChecked] = useState(false);
  const [passSecure, setPassSecure] = useState(true);
  const [conPassSecure, setConPassSecure] = useState(true);
  const [profileImg, setProfileImg] = useState('');
  const [profileImgSubmit, setProfileImgSubmit] = useState({});
  const cameraSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['28%', '28%'], []);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraSheetVisible, setIsCameraSheetVisible] = useState(false);

  useEffect(() => {
    const checkRegisterAlloFun = async () => {
      try {
        let is_register_allow = await AsyncStorage.getItem('is_register_allow');
        // setis_register_allow(is_register_allow)
        if (is_register_allow === 1 || is_register_allow === '1') {
        } else {
          navigation.dispatch(StackActions.replace('SplashScreen'));
        }
      } catch (error) {
        console.error('Error trycatch checkAlreadyLoginFun:', error);
      }
    };

    // checkRegisterAlloFun();
  }, []);

  const initialValues = {
    fullName: '',
    email: '',
    mobileNo: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  };

  const validationSchema = Yup.object({
    fullName: Yup.string()
      .required('Full Name is required')
      .min(3, 'Too Short!'),
    email: Yup.string().email('Invalid email').required('Email is required'),
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
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
  });

  const pickImage = async () => {
    await ImagePicker.openPicker({
      width: 200,
      height: 200,
      cropping: true,
      cropperCircleOverlay: true,
    })
      .then(image => {
        setProfileImg(image.path);
        let tempData = {uri: image.path, type: image.mime, name: image.name};
        setProfileImgSubmit(tempData);
      })
      .catch(error => {});
  };

  const cameraPick = async () => {
    await ImagePicker.openCamera({
      width: 200,
      height: 200,
      cropping: true,
      cropperCircleOverlay: true,
    })
      .then(image => {
        setProfileImg(image.path);
        let tempData = {uri: image.path, type: image.mime, name: image.name};
        setProfileImgSubmit(tempData);
      })
      .catch(error => {});
  };

  const goToLogin = () => {
    navigation.navigate('LoginScreen');
  };

  const handleSubmit = async values => {
    try {
      if (!checked) {
        Toast.show('Please accept the terms and conditions.', {
          type: 'custom_toast',
          data: {
            title: 'Error',
          },
        });
      } else {
        setIsLoading(true);
        if (values.fullName && values.mobileNo && values.password) {
          values.isTermPrivacy = 1;

          let ApiReqData = new FormData();
          ApiReqData.append('customer_first_name', values.fullName);
          ApiReqData.append('customer_mail_id', values.email);
          ApiReqData.append('customer_mobile_no', values.mobileNo);
          ApiReqData.append('customer_pass', values.password);
          ApiReqData.append('customer_pass_confirm', values.confirmPassword);
          ApiReqData.append('is_term_privacy', values.isTermPrivacy);

          if (profileImgSubmit && Object.keys(profileImgSubmit).length > 0) {
            ApiReqData.append('customer_profile', {
              uri: profileImgSubmit.uri,
              type: profileImgSubmit.type,
              name: profileImgSubmit.name,
            });
          }

          await registerInsertFun(ApiReqData)
            .then(async response => {
              if (response && response.success) {
                setIsLoading(false);
                navigation.navigate('RegisterOtpScreen', {
                  customer_mobile_no: values.mobileNo,
                  customer_mail_id: values.email,
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
                setIsLoading(false);
              } else {
                setIsLoading(false);
              }
            });
        }
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="flex-1">
        <MyAppBar title={'Register'} />
        <ScrollView
          contentContainerStyle={{alignItems: 'center', paddingBottom: 20}}
          automaticallyAdjustKeyboardInsets={true}
          className="flex-1 bg-white">
          <NetworkStatus />
          {/* Profile Image */}

          <View className="h-24 w-full items-center justify-center">
            <View className="absolute top-0 left-0 right-0 bottom-0 bg-[#6BB14F] rounded-b-2xl" />

            <Image
              source={
                profileImg == '' ? images.default_profile : {uri: profileImg}
              }
              style={{borderWidth: 4, borderColor: 'white'}}
              className="w-32 h-32 absolute top-4 bg-white rounded-full"
            />

            <IconButton
              onPress={() => {
                setIsCameraSheetVisible(true);
              }}
              className="w-12 h-12 absolute bottom-0 right-0 mb-2 mr-2"
              icon={() => (
                <Image source={images.camera} className="w-10 h-10" />
              )}
            />
          </View>

          {/* Form */}
          <View className="mt-20" />
          {form()}

          <Button mode="text" className="self-center" onPress={goToLogin}>
            <Text variant="bodyLarge" className="text-[#E31E24]">
              Already have an account?{' '}
              <Text className="text-[#1F4B99]">Login</Text>
            </Text>
          </Button>
        </ScrollView>
        {isCameraSheetVisible && imageBtmSheet()}
        {Loading({visible: isLoading})}
      </View>
    </KeyboardAvoidingView>
  );

  function imageBtmSheet() {
    return (
      <BottomSheet
        ref={cameraSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={() => {
          setIsCameraSheetVisible(false);
        }}
        index={0}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
          />
        )}>
        <View className="flex-row justify-evenly items-center flex-1">
          <TouchableOpacity onPress={cameraPick}>
            <View className="bg-[#6BB14F] w-24 h-24 rounded-full items-center justify-center">
              <Image source={images.camera} className="w-14 h-14" />
            </View>
            <Text className="text-center text-lg mt-2" variant="bodyLarge">
              Camera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickImage}>
            <View className="bg-[#6BB14F] w-24 h-24 rounded-full items-center justify-center">
              <Image source={images.gallery} className="w-14 h-14" />
            </View>
            <Text className="text-center text-lg mt-2" variant="bodyLarge">
              Gallery
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    );
  }

  function form() {
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {({handleChange, handleSubmit, values, errors, touched}) => (
          <View className="items-center mx-10">
            {/* Full Name */}

            <TextInput
              label="Full Name"
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
              keyboardType="default"
              value={values.fullName}
              onChangeText={handleChange('fullName')}
              error={errors.fullName && touched.fullName}
              left={
                <TextInput.Icon
                  style={{marginTop: 15}}
                  icon={() => (
                    <Image source={images.user} className="w-5 h-5" />
                  )}
                />
              }
            />
            {errors.fullName && touched.fullName && (
              <HelperText
                className="self-start"
                type="error"
                variant="bodyMedium">
                {errors.fullName}
              </HelperText>
            )}
            <View className="h-4" />

            {/* Email */}

            <TextInput
              label="Email"
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
              keyboardType="email-address"
              value={values.email}
              onChangeText={handleChange('email')}
              error={errors.email && touched.email}
              left={
                <TextInput.Icon
                  style={{marginTop: 15}}
                  icon={() => (
                    <Image source={images.email} className="w-5 h-5" />
                  )}
                />
              }
            />
            {errors.email && touched.email && (
              <HelperText
                className="self-start"
                type="error"
                variant="bodyMedium">
                {errors.email}
              </HelperText>
            )}
            <View className="h-4" />

            {/* Mobile No */}

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
              value={values.mobileNo}
              onChangeText={handleChange('mobileNo')}
              error={errors.mobileNo && touched.mobileNo}
              left={
                <TextInput.Icon
                  style={{marginTop: 15}}
                  icon={() => (
                    <Image source={images.phone} className="w-5 h-5" />
                  )}
                />
              }
              maxLength={10}
            />
            {errors.mobileNo && touched.mobileNo && (
              <HelperText
                className="self-start"
                type="error"
                variant="bodyMedium">
                {errors.mobileNo}
              </HelperText>
            )}

            <View className="h-4" />

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
              secureTextEntry={passSecure}
            />
            {errors.password && touched.password && (
              <HelperText
                className="self-start"
                type="error"
                variant="bodyMedium">
                {errors.password}
              </HelperText>
            )}

            <View className="h-4" />

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
                  style={{marginTop: 15}}
                  forceTextInputFocus={false}
                  onPress={() => setConPassSecure(!conPassSecure)}
                  icon={() =>
                    !conPassSecure ? (
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
              secureTextEntry={conPassSecure}
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <HelperText
                className="self-start"
                type="error"
                variant="bodyMedium">
                {errors.confirmPassword}
              </HelperText>
            )}

            <View className="h-7" />

            {/* Referral code */}

            {/* <TextInput
              placeholder="Referral code (Optional)"
              mode="outlined"
              className="w-80 h-11 bg-[#E2EFD6]"
              contentStyle={{paddingTop: 10, paddingBottom: 10}}
              outlineStyle={{elevation: 2, borderRadius: 10, borderWidth: 0}}
              keyboardType="default"
              value={values.referralCode}
              onChangeText={handleChange('referralCode')}
              left={
                <TextInput.Icon
                  icon={() => (
                    <Image source={images.user} className="w-6 h-6" />
                  )}
                />
              }
            /> */}

            {/* Terms and condition */}

            <View className="flex-row items-center justify-between">
              <Checkbox.Android
                status={checked ? 'checked' : 'unchecked'}
                onPress={() => {
                  setChecked(!checked);
                }}
              />

              <TouchableRipple
                borderless
                className="rounded-full p-1"
                onPress={async () => {
                  await Linking.openURL('https://evdock.app/privacypolicy.html')
                    .then(value => {})
                    .catch(e => {});
                }}>
                <Text
                  variant="labelMedium"
                  className="px-2 text-blue-600 underline">
                  I agree to the Terms & Conditions and Privacy Policy
                </Text>
              </TouchableRipple>
            </View>

            <Button
              mode="contained"
              className="w-60 mt-5 mb-2"
              onPress={handleSubmit}>
              Register
            </Button>
          </View>
        )}
      </Formik>
    );
  }
}
