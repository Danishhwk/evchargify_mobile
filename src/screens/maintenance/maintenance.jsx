import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {StackActions} from '@react-navigation/native';
import {images} from '../../assets/images/images';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Animated, {FadeIn} from 'react-native-reanimated';
import {mobileSettingFun} from '../../services/mobile_settings_service';
import {currentDateTime} from '../../utils/common';
import DeviceInfo from 'react-native-device-info';
import {Text, Button, Icon, Appbar} from 'react-native-paper';

const MaintenanceScreen = ({navigation}) => {
  const [maintenance_alert_msg, setmaintenance_alert_msg] = useState('');
  const [
    is_major_maintenance_alert_update,
    setis_major_maintenance_alert_update,
  ] = useState('');

  const checkMaintenanceDataFun = async () => {
    try {
      let maintenance_alert_msg_temp = await AsyncStorage.getItem(
        'maintenance_alert_msg',
      );
      let is_major_maintenance_alert_update_temp = await AsyncStorage.getItem(
        'is_major_maintenance_alert_update',
      );
      setmaintenance_alert_msg(maintenance_alert_msg_temp);
      setis_major_maintenance_alert_update(
        is_major_maintenance_alert_update_temp,
      );
    } catch (error) {
      console.error('Error trycatch checkMaintenanceDataFun:', error);
    }
  };

  useEffect(() => {
    console.log('MaintenanceScreen useEffect ++++++++++++');
    checkMaintenanceDataFun();
  }, []);

  const goToLoginScreen = () => {
    navigation.dispatch(StackActions.replace('LoginScreen'));
  };

  return (
    <View className="flex-1 bg-white">
      <Appbar className="bg-transparent" mode="center-aligned">
        <Appbar.Content title="Maintenance" />
      </Appbar>
      <View style={styles.container}>
        <Icon source="alert-circle" size={100} color="#E31E24" />
        <Text className="my-3 text-center" variant="titleLarge">
          {maintenance_alert_msg}
        </Text>
        {is_major_maintenance_alert_update &&
          (is_major_maintenance_alert_update === 1 ||
            is_major_maintenance_alert_update === '1') && (
            <Button
              mode="contained"
              className="mt-2 px-2 rounded-full"
              onPress={goToLoginScreen}>
              <Text variant="bodyLarge" className="text-white">
                OK
              </Text>
            </Button>
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default MaintenanceScreen;
