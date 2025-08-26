import {View, Text} from 'react-native';
import React, {useRef, useState} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import StationListScreen from './station_lists';
import StationFavs from './station_favs';
import {getFavListService} from '../../services/favourite_service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetworkStatus from '../network_screen';
import {useForeground} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';

const Tab = createMaterialTopTabNavigator();

export default function StationScreen() {
  const [favStationList, setFavStationList] = useState([]);
  const [isFavRefreshing, setFavRefreshing] = useState(false);
  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  const getFavList = async () => {
    setFavRefreshing(true);
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');
      getFavListService(customer_id)
        .then(async response => {
          if (response && response.success) {
            var responseData = response.data;
            const distanceData = await AsyncStorage.getItem('station_distance');

            const distance = JSON.parse(distanceData);

            var temp = [];

            for (let i = 0; i < responseData.length; i++) {
              for (let j = 0; j < distance.length; j++) {
                if (responseData[i].station_id === distance[j].station_id) {
                  temp.push(distance[j]);
                }
              }
            }

            console.log('temp: ', temp);

            var data = temp.map((item, index) => {
              let temp = {...responseData[index], distance: item.distance};
              return temp;
            });

            setFavStationList(data);
            setFavRefreshing(false);
          }
        })
        .catch(error => {
          setFavRefreshing(false);
          console.log('getFavListService error: ', error);
        });
    } catch (error) {
      setFavRefreshing(false);
      console.log('getFavListService error: ', error);
    }
  };

  return (
    <View style={{flex: 1}}>
      <NetworkStatus />
      <Tab.Navigator
        backBehavior="none"
        screenOptions={{
          tabBarStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
          },
          tabBarLabelStyle: {
            fontFamily: 'Exo2-SemiBold',
            fontSize: 18,
            textTransform: 'none',
          },
          tabBarIndicatorStyle: {height: 3, borderRadius: 10},
          tabBarActiveTintColor: '#1F4B99',
          tabBarAndroidRipple: {borderless: false},
        }}
        initialRouteName="Station_List">
        <Tab.Screen options={{title: 'Station List'}} name="Station_List">
          {() => <StationListScreen />}
        </Tab.Screen>

        <Tab.Screen
          listeners={{focus: () => getFavList()}}
          options={{title: 'My Stations'}}
          name="favourites">
          {() => (
            <StationFavs
              StationList={favStationList}
              favRefresh={isFavRefreshing}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}
