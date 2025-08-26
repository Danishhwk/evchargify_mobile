import React, {useEffect} from 'react';
import {View, Image, StyleSheet, Platform} from 'react-native';
import {StackActions} from '@react-navigation/native';
import {images} from '../../assets/images/images';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {Easing, FadeOut} from 'react-native-reanimated';
import messaging from '@react-native-firebase/messaging';
import {notificationAddService} from '../../services/notification_service';
import {userSessionService} from '../../services/login_service';
import {Toast} from 'react-native-toast-notifications';
import {isRewardEnableService} from '../../services/reward_service';
import NetInfo from '@react-native-community/netinfo';

const SplashScreen = ({navigation}) => {
  useEffect(() => {
    // checkOnboarding();
    getFCMToken();
    checkReward();
    setTimeout(() => {
      checkUserSession();
    }, 20);
  }, []);

  const checkReward = async () => {
    try {
      const response = await isRewardEnableService();
      await AsyncStorage.setItem(
        'coin_show_response',
        JSON.stringify({
          show_coin: response.success,
          show_ad: response.data[0].is_adv_show === 1 ? true : false,
          transaction_min_unit: response.data[0].transaction_min_unit,
          transaction_max_unit_used: response.data[0].transaction_max_unit_used,
        }),
      );
    } catch (error) {
      console.log('checkReward error', error);
    }
  };

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem('hasOnboarded');
      const iSlogin = await AsyncStorage.getItem('iSlogin');

      const timer = setTimeout(() => {
        if (iSlogin || iSlogin === 'true') {
          navigation.dispatch(StackActions.replace('bottomNav'));
        } else {
          if (value || value === 'true') {
            navigation.dispatch(StackActions.replace('LoginScreen'));
          } else {
            navigation.dispatch(StackActions.replace('OnboardScreen'));
          }
        }
      }, 1500);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error trycatch checkOnboarding:', error);
    }
  };

  const getFCMToken = async () => {
    var fcmToken = '';
    console.log('getting fcm token');

    try {
      if (Platform.OS === 'ios') {
        fcmToken = await messaging().getToken();

        console.log('ios fcmToken', fcmToken);
      }
      if (Platform.OS === 'android') {
        fcmToken = await messaging().getToken();
        console.log('android fcmToken', fcmToken);
      }

      notificationAddFun(fcmToken);
    } catch (error) {
      console.log('token error', error);
    }
  };

  const notificationAddFun = async fcmToken => {
    console.log('fcmToken', fcmToken);

    const customer_id = (await AsyncStorage.getItem('customer_id')) || '0';

    const device_platform = Platform.OS;
    try {
      await notificationAddService(customer_id, device_platform, fcmToken)
        .then(response => {})
        .catch(error => {});
    } catch (error) {}
  };

  const checkUserSession = async () => {
    const customer_id = (await AsyncStorage.getItem('customer_id')) || '0';
    const isLogout = await AsyncStorage.getItem('is_logout');

    try {
      console.log('lgout', isLogout);
      if (isLogout == 'false') {
        await userSessionService(customer_id)
          .then(response => {
            console.log('response', response);

            if (response.success) {
              Toast.show('Session Expired, Please Login Again', {
                type: 'custom_toast',
                data: {title: 'Error'},
              });
              logoutFun();
            } else {
              checkOnboarding();
            }
          })
          .catch(async error => {
            const errMsg = 'Network Error';

            let internetWorking = await NetInfo.fetch().then(
              state => state.isConnected,
            );

            if (error.message === errMsg) {
              if (internetWorking) {
                navigation.dispatch(
                  StackActions.replace('ApiErrorScreen', {
                    internetWorking: true,
                  }),
                );
              } else {
                navigation.dispatch(
                  StackActions.replace('ApiErrorScreen', {
                    internetWorking: false,
                  }),
                );
              }
            } else {
              console.log('else error', error);

              Toast.show('Session Expired, Please Login Again', {
                type: 'custom_toast',
                data: {title: 'Error'},
              });
              logoutFun();
            }
          });
      } else if (isLogout == null || isLogout == undefined) {
        checkOnboarding();
      } else {
        logoutFun();
      }
    } catch (error) {
      console.log('checkUserSession error', error);

      Toast.show('Session Expired, Please Login Again', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
      logoutFun();
    }
  };

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

    navigation.dispatch(StackActions.replace('LoginScreen'));
  };

  return (
    <View style={styles.container}>
      <Animated.View exiting={FadeOut.duration(1000).easing(Easing.linear)}>
        <Image source={images.logo} resizeMode="contain" style={styles.logo} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;
