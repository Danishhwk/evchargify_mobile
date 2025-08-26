import {
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo, useRef, useState, useEffect} from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  HelperText,
  IconButton,
  Switch,
  Text,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {images} from '../../assets/images/images';
import {Formik} from 'formik';
import * as Yup from 'yup';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import ImagePicker from 'react-native-image-crop-picker';
import {userInfoFun, userUpdateFun} from '../../services/user_service';
import {Toast} from 'react-native-toast-notifications';
import Loading from '../../utils/components/loading';
import MyAppBar from '../../utils/components/appBar';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {useForeground} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';
import {initInnterstitialAd} from '../../utils/interstitial_ad_init';

export default function ProfileScreen({navigation}) {
  const [initialValues, setInitialValues] = useState({
    fullName: '',
    email: '',
    mobileNo: '',
    referralCode: '',
    gstNumber: '',
  });

  const [fullName, setfullName] = useState('');
  const [email, setemail] = useState('');
  const [mobileNo, setmobileNo] = useState('');
  const [referralCode, setreferralCode] = useState('');
  const [customer_profile, setcustomer_profile] = useState('');
  const [gstVisibleDialog, setGstVisibleDialog] = useState(false);
  const [checked, setChecked] = useState(false);
  const [passSecure, setPassSecure] = useState(true);
  const [conPassSecure, setConPassSecure] = useState(true);
  const [profileImg, setProfileImg] = useState('');
  const [profileImgSubmit, setProfileImgSubmit] = useState({});
  const cameraSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '25%'], []);

  const [isGSTAvailable, setIsGSTAvailable] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [isGstUpdate, setIsGstUpdate] = useState(0);
  const [isGst, setIsGst] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [formikValues, setFormikValues] = useState({});

  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

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
    // referralCode: Yup.string().required('Referral code is required'),
    gstNumber: Yup.string()
      .required('GST number is required')
      .matches(
        /^[0-9]{2}[A-Z]{3}[ABCFGHLJPTF]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        'Invalid GST number',
      ),
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
      .catch(error => {
        console.log(error);
      });
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
      .catch(error => {
        console.log(error);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let customer_id = await AsyncStorage.getItem('customer_id');

        console.log('user profile screen fetchData customer_id: ', customer_id);
        let userInfoData = {customer_id: customer_id};
        const response = await userInfoFun(userInfoData);

        if (response && response.success) {
          console.log(
            'profile screen fetchData response.data: ',
            response.data,
          );
          setIsGstUpdate(response.data.is_gst_update);
          setIsGst(response.data.is_gst);
          setGstNumber(response.data.gst);

          setInitialValues({
            fullName: '' + response.data.customer_first_name || '',
            email: '' + response.data.customer_mail_id || '',
            mobileNo: '' + response.data.customer_mobile_no || '',
            // referralCode: '' + response.data.reference_referral_code || '',
            gstNumber: '' + response.data.gst || '',
          });

          if (response.data.customer_first_name) {
            await AsyncStorage.setItem(
              'customer_first_name',
              '' + response.data.customer_first_name,
            );
            setfullName(response.data.customer_first_name);
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
          }
          if (response.data.customer_mobile_no) {
            await AsyncStorage.setItem(
              'customer_mobile_no',
              '' + response.data.customer_mobile_no,
            );
            setmobileNo('' + response.data.customer_mobile_no);
          }
          if (response.data.customer_mail_id) {
            await AsyncStorage.setItem(
              'customer_mail_id',
              '' + response.data.customer_mail_id,
            );
            setemail(response.data.customer_mail_id);
          }
          // if (response.data.referral_code) {
          //   await AsyncStorage.setItem(
          //     'referral_code',
          //     '' + response.data.referral_code,
          //   );
          //   setreferralCode(response.data.referral_code);
          // }
          setTimeout(() => {
            setIsLoading(false);
          }, 100);
        } else {
          Toast.show(response.message, {
            type: 'custom_toast',
            data: {title: 'Error'},
          });
          setTimeout(() => {
            setIsLoading(false);
          }, 100);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
        Toast.show('Something went wrong. Please try again later.', {
          type: 'custom_toast',
          data: {title: 'Error'},
        });
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      }
    };

    fetchData();

    // Clean-up function (optional)
    return () => {
      // Any cleanup code can go here
    };
  }, []);

  const onSubmit = async values => {
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');

      let ApiReqData = {
        customer_id: customer_id,
        customer_first_name: values.fullName,
        is_gst: 1,
        gst: values.gstNumber,
      };

      await userUpdateFun(ApiReqData)
        .then(async response => {
          console.log('response', response);
          if (response && response.success) {
            Toast.show(response.message, {
              type: 'custom_toast',
              data: {title: 'Info'},
            });
          } else {
            Toast.show(response.message, {
              type: 'custom_toast',
              data: {title: 'Error'},
            });
          }
        })
        .catch(error => {
          Toast.show(error.response.data.message, {
            type: 'custom_toast',
            data: {title: 'Error'},
          });

          console.log('error', error);
        });
    } catch (error) {
      console.log('handleSubmit error: ', error);
    }
    navigation.navigate('bottomNav');
  };

  const handleSubmit = async values => {
    setGstVisibleDialog(true);
    setFormikValues(values);
  };

  if (isLoading) {
    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        needsOffscreenAlphaCompositing={true}
        className="flex-1 items-center justify-center">
        <Loading visible={isLoading} />
      </Animated.View>
    );
  }
  return (
    <View className="flex-1 bg-white">
      <MyAppBar title={'Profile'} />
      <ScrollView
        contentContainerStyle={{alignItems: 'center', paddingBottom: 20}}
        className="flex-1 bg-white">
        {/* Profile Image */}

        <View className="h-24 w-full items-center justify-center">
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-[#6BB14F] rounded-b-2xl" />

          <Image
            source={
              customer_profile
                ? {uri: customer_profile}
                : images.default_profile
            }
            style={{borderWidth: 4, borderColor: 'white'}}
            className="w-32 h-32 absolute top-4 bg-white rounded-full"
          />
        </View>

        {/* Form */}
        <View className="mt-20" />
        {form()}

        <View className="border border-gray-400 rounded-lg mx-10">
          <HelperText type="info" variant="labelLarge">
            Note: If you need to edit or update your personal information or GST
            number, please reach out to our support team for assistance. You can
            find our contact details by clicking down below.
          </HelperText>
          <Button
            onPress={() => navigation.navigate('Support')}
            mode="contained"
            compact
            className="m-2 mx-5">
            Contact Support
          </Button>
        </View>
      </ScrollView>
      {gstDialog(formikValues)}
    </View>
  );

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
              disabled={!isGSTAvailable}
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
            <View className="h-7" />

            {/* Email */}

            <TextInput
              label="Email"
              disabled={true}
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
            <View className="h-7" />

            {/* Mobile No */}

            <TextInput
              label="Mobile Number"
              disabled={true}
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

            <View className="h-7" />

            {/* {values.referralCode == 'null' ? (
              <></>
            ) : (
              <>
                <TextInput
                  placeholder="Referral code"
                  disabled={true}
                  mode="outlined"
                  className="w-80 h-11 bg-[#E2EFD6]"
                  contentStyle={{paddingTop: 10, paddingBottom: 10}}
                  outlineStyle={{
                    elevation: 2,
                    borderRadius: 10,
                    borderWidth: 0,
                  }}
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
                />
              </>
            )} */}

            {(() => {
              if (isGst == 1) {
                if (isGstUpdate == 1) {
                  return (
                    <View className="flex-row items-center justify-between w-80">
                      <Text
                        onPress={() => setIsGSTAvailable(!isGSTAvailable)}
                        className="ml-2"
                        variant="bodyLarge">
                        Do you have your own GST Number?
                      </Text>
                      <Switch
                        value={isGSTAvailable}
                        onValueChange={() => {
                          setIsGSTAvailable(!isGSTAvailable);
                        }}
                      />
                    </View>
                  );
                } else {
                  return (
                    <View className="flex-row items-center justify-between w-80">
                      <Text
                        onPress={() => setIsGSTAvailable(!isGSTAvailable)}
                        className="ml-2"
                        variant="bodyLarge">
                        Do you have your own GST Number?
                      </Text>
                      <Switch
                        disabled
                        value={isGSTAvailable}
                        onValueChange={() => {
                          setIsGSTAvailable(!isGSTAvailable);
                        }}
                      />
                    </View>
                  );
                }
              } else {
                return (
                  <View className="flex-row items-center justify-between w-80">
                    <Text
                      onPress={() => setIsGSTAvailable(!isGSTAvailable)}
                      className="ml-2"
                      variant="bodyLarge">
                      Do you have your own GST Number?
                    </Text>
                    <Switch
                      value={isGSTAvailable}
                      onValueChange={() => {
                        setIsGSTAvailable(!isGSTAvailable);
                      }}
                    />
                  </View>
                );
              }
            })()}

            {/* GST Number */}

            {(() => {
              if (isGst == 1) {
                if (isGstUpdate == 1) {
                  return (
                    <>
                      <View className="h-5" />
                      <TextInput
                        disabled={!isGSTAvailable}
                        label="GST Number"
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
                        autoCapitalize="characters"
                        value={values.gstNumber}
                        onChangeText={handleChange('gstNumber')}
                        left={
                          <TextInput.Icon
                            style={{marginTop: 15}}
                            icon={() => (
                              <Image
                                source={images.gst}
                                tintColor={'#000'}
                                className="w-5 h-5"
                              />
                            )}
                          />
                        }
                      />
                    </>
                  );
                } else {
                  return (
                    <>
                      <View className="h-5" />
                      <TextInput
                        disabled
                        label="GST Number"
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
                        autoCapitalize="characters"
                        value={values.gstNumber}
                        onChangeText={handleChange('gstNumber')}
                        left={
                          <TextInput.Icon
                            style={{marginTop: 15}}
                            icon={() => (
                              <Image
                                source={images.gst}
                                tintColor={'#000'}
                                className="w-5 h-5"
                              />
                            )}
                          />
                        }
                      />
                    </>
                  );
                }
              } else {
                return (
                  <>
                    <View className="h-5" />
                    <TextInput
                      disabled={!isGSTAvailable}
                      label="GST Number"
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
                      autoCapitalize="characters"
                      value={values.gstNumber}
                      onChangeText={handleChange('gstNumber')}
                      left={
                        <TextInput.Icon
                          style={{marginTop: 15}}
                          icon={() => (
                            <Image
                              source={images.gst}
                              tintColor={'#000'}
                              className="w-5 h-5"
                            />
                          )}
                        />
                      }
                    />
                  </>
                );
              }
            })()}

            {errors.gstNumber && touched.gstNumber && isGSTAvailable && (
              <HelperText
                className="self-start"
                type="error"
                variant="bodyMedium">
                {errors.gstNumber}
              </HelperText>
            )}

            <View className="items-center flex-row  mt-5 mb-2">
              {/* <Button
                mode="contained"
                className="w-44 bg-[#72B334] rounded-full"
                onPress={() => navigation.navigate('bottomNav')}>
                <Text variant="bodyLarge" className="text-white">
                  Back
                </Text>
              </Button> */}

              {isGSTAvailable && (
                <Button
                  mode="contained"
                  className="w-[80%] mt-4"
                  onPress={handleSubmit}>
                  Save
                </Button>
              )}
            </View>
          </View>
        )}
      </Formik>
    );
  }

  function gstDialog(values) {
    return (
      <Dialog
        visible={gstVisibleDialog}
        dismissable={true}
        onDismiss={() => {
          setGstVisibleDialog(false);
        }}>
        <Dialog.Title>Confirmation</Dialog.Title>
        <Dialog.Content>
          <Text>Are you sure you want to update the Name and GST Number?</Text>
        </Dialog.Content>

        <Dialog.Actions>
          <Button
            mode="outlined"
            contentStyle={{paddingHorizontal: 12}}
            onPress={() => setGstVisibleDialog(false)}>
            <Text>No</Text>
          </Button>

          <View className="w-0.5" />

          <Button
            mode="contained"
            className="bg-[#E31E24]"
            contentStyle={{paddingHorizontal: 12}}
            onPress={async () => await onSubmit(values)}>
            <Text className="text-white">Yes</Text>
          </Button>
        </Dialog.Actions>
      </Dialog>
    );
  }
}
