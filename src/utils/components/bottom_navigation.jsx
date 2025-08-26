import {View, Image, Linking} from 'react-native';
import React, {useState} from 'react';
import HomeScreen from '../../screens/home/home_screen';
import {createMaterialBottomTabNavigator} from 'react-native-paper/react-navigation';
import Setting from '../../screens/settings/setting';
import {images} from '../../assets/images/images';
import CurrentSessions from '../../screens/charging/current_sessions';
import UpdateScreen from '../../screens/update/update_screen';
import StationListScreen from '../../screens/station/station_lists';
import StationScreen from '../../screens/station/station_screen';
import {checkVersion} from 'react-native-check-version';
import {Button, Dialog, Text} from 'react-native-paper';
import {isRewardEnableService} from '../../services/reward_service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createMaterialBottomTabNavigator();

export default function BottomNavigation() {
  const [versionUrl, setVersionUrl] = useState('');
  const [needUpdate, setNeedUpdate] = useState(false);

  React.useEffect(() => {
    // checkAppUpdate();
  }, []);

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

  const checkReward = async () => {
    try {
      const response = await isRewardEnableService();
      await AsyncStorage.setItem(
        'coin_show_response',
        JSON.stringify({
          show_ad: response.data[0].is_adv_show === 1 ? true : false,
          show_coin: response.success,
          transaction_min_unit: response.data[0].transaction_min_unit,
          transaction_max_unit_used: response.data[0].transaction_max_unit_used,
        }),
      );
    } catch (error) {
      console.log('checkReward error', error);
    }
  };
  return (
    <>
      <Tab.Navigator
        labeled={true}
        initialRouteName="Home"
        barStyle={{backgroundColor: '#E2EFD6', maxHeight: 80}}
        sceneAnimationEnabled
        // shifting
        activeIndicatorStyle={{backgroundColor: '#6BB14F'}}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({focused}) => {
              return (
                <Image
                  source={focused ? images.home_fill : images.home}
                  style={{width: 24, height: 24}}
                />
              );
            },
          }}
        />

        <Tab.Screen
          name="Stations"
          component={StationScreen}
          options={{
            tabBarIcon: ({focused}) => {
              return (
                <Image
                  source={focused ? images.station_fill : images.station}
                  style={{width: 24, height: 24}}
                />
              );
            },
          }}
        />

        <Tab.Screen
          name="Sessions"
          component={CurrentSessions}
          options={{
            tabBarIcon: ({focused}) => {
              return (
                <Image
                  source={focused ? images.current_fill : images.current}
                  style={{width: 24, height: 24}}
                />
              );
            },
          }}
        />

        <Tab.Screen
          name="Updates"
          component={UpdateScreen}
          options={{
            tabBarIcon: ({focused}) => {
              return (
                <Image
                  source={focused ? images.update_fill : images.update}
                  style={{width: 24, height: 24}}
                />
              );
            },
          }}
        />

        <Tab.Screen
          name="Settings"
          component={Setting}
          listeners={{
            focus: () => {
              checkReward();
            },
          }}
          options={{
            tabBarIcon: ({focused}) => {
              return (
                <Image
                  source={focused ? images.setting_fill : images.setting}
                  style={{width: 24, height: 24}}
                />
              );
            },
          }}
        />
      </Tab.Navigator>
      {updateDialog()}
    </>
  );

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
