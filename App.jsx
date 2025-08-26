import React, {useEffect} from 'react';
import {NavigationContainer, StackActions} from '@react-navigation/native';
import {
  PaperProvider,
  DefaultTheme,
  configureFonts,
  Portal,
  Text,
} from 'react-native-paper';
import {fontConfig, lightTheme} from './src/assets/theme';
import StackRoutes from './src/utils/routes';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {Toast, ToastProvider} from 'react-native-toast-notifications';
import {LogBox, Platform, View} from 'react-native';
import {mobileSettingFun} from './src/services/mobile_settings_service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {currentDateTime} from './src/utils/common';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {navigationRef} from './src/utils/rootNavigation';
import {initializeSslPinning} from 'react-native-ssl-public-key-pinning';

async function setupPinning() {
  try {
    await initializeSslPinning({
      'stage.tritanev.com': {
        publicKeyHashes: [
          'VOL9QTgE6FI0MmWctHZrsFrvUqQsLx5EhDb2ax2so2M=',
          '8Rw90Ej3Ttt8RRkrg+WYDS9n7IS03bk5bjP/UXPtaY8=',
        ],
        includeSubdomains: true, // optional
      },
    });
    console.log('🔒 SSL public key pinning enabled');
  } catch (e) {
    console.error('❌ SSL pinning failed:', e);
  }
}

async function onMessageReceived(message) {
  console.log('onMessageReceived', message);
  displayNotification(message);
}
notifee.onBackgroundEvent(async ({type, detail}) => {
  console.log('onBackgroundEvent', type, detail);
});

const displayNotification = async message => {
  const channelId = await notifee.createChannel({
    id: 'important',
    name: 'Important Channel',
    importance: AndroidImportance.HIGH,
    badge: true,
    sound: 'default',
    bypassDnd: true,
  });

  await notifee
    .displayNotification({
      title: message.data.title,
      body: message.data.body,
      // data: message.data,
      ios: {
        sound: 'default',
        critical: true,
        interruptionLevel: 'critical',
        foregroundPresentationOptions: {
          badge: true,
          banner: true,
          sound: true,
          list: true,
        },
      },
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        showTimestamp: true,
        pressAction: {
          id: 'default',
        },
      },
    })
    .then(() => console.log('Success'));
};

messaging().onMessage(onMessageReceived);
messaging().setBackgroundMessageHandler(onMessageReceived);

const theme = {
  ...DefaultTheme,
  fonts: configureFonts({config: fontConfig}),
  colors: lightTheme.colors,
};

LogBox.ignoreAllLogs(true);

export default function App({navigation}) {
  const checkMaintenanceFun = async () => {
    console.log('######################checkMaintenanceFun');
    try {
      let currentDt = currentDateTime();

      let maintenance_alert_from_dt = await AsyncStorage.getItem(
        'maintenance_alert_from_dt',
      );
      let maintenance_alert_to_dt = await AsyncStorage.getItem(
        'maintenance_alert_to_dt',
      );

      let parsedFromDate = moment(
        maintenance_alert_from_dt,
        'YYYY-MM-DD HH:mm:ss',
      );
      let parsedToDate = moment(maintenance_alert_to_dt, 'YYYY-MM-DD HH:mm:ss');
      let parsedCurrentDate = moment(currentDt, 'YYYY-MM-DD HH:mm:ss');

      let isBetween = parsedCurrentDate.isBetween(parsedFromDate, parsedToDate);

      if (isBetween) {
        navigation.dispatch(StackActions.replace('MaintenanceScreen'));
      } else {
        await checkAppVersionFun();
      }
    } catch (error) {
      console.error('Error trycatch checkMaintenanceFun:', error);
    }
  };

  const checkAppVersionFun = async () => {
    console.log('######################checkAppVersionFun');
    try {
      let PlatformOS = Platform.OS;

      let android_version = await AsyncStorage.getItem('android_version');
      let is_major_android_update = await AsyncStorage.getItem(
        'is_major_android_update',
      );
      let ios_version = await AsyncStorage.getItem('ios_version');
      let is_major_ios_update = await AsyncStorage.getItem(
        'is_major_ios_update',
      );

      let appVersion = DeviceInfo.getVersion();
      let is_update = false;
      let is_major_update = false;

      if (PlatformOS === 'android') {
        if (is_major_android_update > 0 && appVersion < android_version) {
          if (
            is_major_android_update === 1 ||
            is_major_android_update === '1'
          ) {
            is_update = true;
            is_major_update = false;
          } else {
            if (
              is_major_android_update === 2 ||
              is_major_android_update === '2'
            ) {
              is_update = true;
              is_major_update = true;
            }
          }
        }
      } else {
        if (PlatformOS === 'ios') {
          if (is_major_ios_update > 0 && appVersion < ios_version) {
            if (is_major_ios_update === 1 || is_major_ios_update === '1') {
              is_update = true;
              is_major_update = false;
            } else {
              if (is_major_ios_update === 2 || is_major_ios_update === '2') {
                is_update = true;
                is_major_update = true;
              }
            }
          }
        }
      }
      if (
        is_update &&
        (is_major_android_update > 0 || is_major_ios_update > 0)
      ) {
        navigation.dispatch(StackActions.replace('AppUpdateScreen'));
      } else {
      }
    } catch (error) {
      console.error('Error trycatch checkAppVersionFun:', error);
    }
  };

  const checkMobileSetting = async () => {
    console.log('######################checkMobileSetting');
    try {
      let last_updated_old = await AsyncStorage.getItem('last_updated_old');
      await AsyncStorage.setItem('nearby_distance', '20');
      let last_updated = await AsyncStorage.getItem('last_updated');
      if (last_updated_old !== last_updated) {
        await AsyncStorage.setItem('last_updated_old', '' + last_updated);
      }
      await checkMaintenanceFun();
    } catch (error) {
      console.error('Error trycatch checkMobileSetting:', error);
    }
  };

  const fetchMobileSettingData = async () => {
    try {
      const response = await mobileSettingFun();

      if (response && response.success) {
        let last_updated = response.data.last_updated;

        let last_updated_old = await AsyncStorage.getItem('last_updated_old');

        let currentDt = currentDateTime();

        if (!!last_updated) {
          currentDt = moment(currentDt, 'YYYY-MM-DD HH:mm:ss');
          last_updated = moment(last_updated, 'YYYY-MM-DD HH:mm:ss');

          if (last_updated_old !== last_updated) {
            await AsyncStorage.setItem(
              'is_register_allow',
              '' + response.data.is_register_allow,
            );

            await AsyncStorage.setItem(
              'is_show_price_allow',
              '' + response.data.is_show_price_allow,
            );

            await AsyncStorage.setItem(
              'is_wallet_allow',
              '' + response.data.is_wallet_allow,
            );

            await AsyncStorage.setItem(
              'is_major_android_update',
              '' + response.data.is_major_android_update,
            );

            await AsyncStorage.setItem(
              'is_major_ios_update',
              '' + response.data.is_major_ios_update,
            );

            await AsyncStorage.setItem(
              'is_major_maintenance_alert_update',
              '' + response.data.is_major_maintenance_alert_update,
            );

            await AsyncStorage.setItem(
              'maintenance_alert_from_dt',
              '' + response.data.maintenance_alert_from_dt,
            );

            await AsyncStorage.setItem(
              'maintenance_alert_to_dt',
              '' + response.data.maintenance_alert_to_dt,
            );

            await AsyncStorage.setItem(
              'maintenance_alert_msg',
              '' + response.data.maintenance_alert_msg,
            );

            await AsyncStorage.setItem(
              'android_version',
              '' + response.data.android_version,
            );

            await AsyncStorage.setItem(
              'ios_version',
              '' + response.data.ios_version,
            );

            await AsyncStorage.setItem(
              'last_updated',
              '' + response.data.last_updated,
            );
            await AsyncStorage.setItem(
              'nearby_distance',
              response.data.nearby_distance === undefined
                ? '20'
                : response.data.nearby_distance.toString(),
            );
          }

          await checkMobileSetting();
        }
      } else {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Info'},
        });
        await checkMobileSetting();
      }
    } catch (error) {
      console.error('Error trycatch fetchMobileSettingData:', error);
    }
  };

  useEffect(() => {
    // fetchMobileSettingData();

    checkMobileSetting();
    return () => {
      console.log('App unmounted');
    };
  }, []);

  const config = {
    screens: {
      SplashScreen: 'app',
    },
  };

  const linking = {
    prefixes: ['https://tritanev.com', 'evdock://'],
    config,
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ToastProvider
        offsetBottom={30}
        renderType={{
          custom_toast: toast => (
            <View
              style={{
                maxWidth: '90%',
                minWidth: '90%',
                paddingHorizontal: 15,
                paddingVertical: 10,
                backgroundColor: '#fff',
                marginVertical: 4,
                borderRadius: 8,
                borderLeftColor: '#00C851',
                borderLeftWidth: 6,
                justifyContent: 'center',
                paddingLeft: 16,
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.23,
                shadowRadius: 2.62,
              }}>
              <Text
                style={{
                  fontSize: 14,
                  color: '#333',
                  fontWeight: 'bold',
                }}>
                {toast.data.title}
              </Text>
              <Text style={{color: '#a3a3a3', marginTop: 2}}>
                {toast.message}
              </Text>
            </View>
          ),
        }}>
        <SafeAreaProvider>
          <SafeAreaView style={{flex: 1}}>
            <PaperProvider theme={theme}>
              <Portal>
                <NavigationContainer ref={navigationRef} linking={linking}>
                  <StackRoutes />
                </NavigationContainer>
              </Portal>
            </PaperProvider>
          </SafeAreaView>
        </SafeAreaProvider>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}
