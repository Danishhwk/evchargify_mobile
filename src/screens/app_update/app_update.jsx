import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Platform, Linking} from 'react-native';
import {StackActions} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {Text, Button, Icon} from 'react-native-paper';
import {Toast} from 'react-native-toast-notifications';

const AppUpdateScreen = ({navigation}) => {
  const [is_update, setis_update] = useState(false);
  const [is_major_update, setis_major_update] = useState(false);

  const checkAppUpdateDataFun = async () => {
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

      if (PlatformOS === 'android') {
        if (appVersion < android_version) {
          if (
            is_major_android_update === 1 ||
            is_major_android_update === '1'
          ) {
            setis_update(true);
            setis_major_update(false);
          } else {
            if (
              is_major_android_update === 2 ||
              is_major_android_update === '2'
            ) {
              setis_update(false);
              setis_major_update(true);
            }
          }
        }
      } else {
        if (PlatformOS === 'ios') {
          if (appVersion < ios_version) {
            if (is_major_ios_update === 1 || is_major_ios_update === '1') {
              setis_update(true);
              setis_major_update(false);
            } else {
              if (is_major_ios_update === 2 || is_major_ios_update === '2') {
                setis_update(false);
                setis_major_update(true);
              }
            }
          }
        }
      }
      if (is_update) {
        navigation.dispatch(StackActions.replace('AppUpdateScreen'));
      }
    } catch (error) {
      console.error('Error trycatch checkAppUpdateDataFun:', error);
    }
  };

  useEffect(() => {
    checkAppUpdateDataFun();
  }, []);

  const goToLoginScreen = () => {
    navigation.dispatch(StackActions.replace('LoginScreen'));
  };

  return (
    <View style={styles.container}>
      <Icon source="update" color="#6BB14F" size={100} />

      <Text variant="titleLarge" className="text-[#6BB14F] my-2">
        Update Available
      </Text>

      <Text variant="bodyLarge" className="text-black mb-2">
        {is_major_update ? 'Major Update' : 'Minor Update'}
      </Text>

      {/* <Text>{is_update + ''}</Text> */}
      {/* <Text>{is_major_update + ''}</Text> */}
      {(!is_major_update ||
        is_major_update === false ||
        is_major_update === 'false') && (
        <Button
          mode="contained"
          className="mt-2 px-2 rounded-full"
          onPress={goToLoginScreen}>
          <Text variant="bodyLarge" className="text-white">
            Skip
          </Text>
        </Button>
      )}
      {(is_major_update ||
        is_major_update === true ||
        is_major_update === 'true') && (
        <Button
          mode="contained"
          className="mt-2 px-2 rounded-full"
          onPress={() => {
            if (Platform.OS === 'android') {
              Linking.openURL('market://details?id=app.evdock.evdock').catch(
                e => {
                  Toast.show('Playstore not found', {
                    type: 'custom_toast',
                    data: {title: 'Error'},
                  });
                },
              );
            } else if (Platform.OS === 'ios') {
              Linking.openURL(
                'itms-apps://itunes.apple.com/in/app/ev-dock/id1625633222',
              ).catch(e => {});
            }
          }}>
          <Text variant="bodyLarge" className="text-white">
            Update
          </Text>
        </Button>
      )}
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

export default AppUpdateScreen;
