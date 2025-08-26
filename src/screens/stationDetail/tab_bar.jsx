import {View} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Text} from 'react-native-paper';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ScrollView} from 'react-native-gesture-handler';
import SoonScreen from '../../utils/components/soon';
import StationInfo from './station_info';
import ChargerInfoList from './charger_info_list';
import {stationInfoFun} from '../../services/station_service';
import ReviewInfo from './review_info';
import {getStationReview} from '../../services/review_service';
import ChargingSteps from './charging_steps';

const Tab = createMaterialTopTabNavigator();

export default function TabBar({stationInfoData, station_id, reviewData}) {
  return (
    <Tab.Navigator
      backBehavior="none"
      screenOptions={{
        swipeEnabled: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: 'Exo2-SemiBold',
          fontSize: 16,
          textTransform: 'none',
        },
        tabBarIndicatorStyle: {height: 3, borderRadius: 10},
        tabBarActiveTintColor: '#1F4B99',
        tabBarAndroidRipple: {borderless: false},
        lazy: true,
      }}
      initialRouteName="Steps">
      <Tab.Screen name="Steps">{() => <ChargingSteps />}</Tab.Screen>
      <Tab.Screen name="Info">
        {() => (
          <StationInfo
            stationInfoData={stationInfoData}
            reviewData={reviewData}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Chargers">
        {() => <ChargerInfoList stationInfoData={stationInfoData} />}
      </Tab.Screen>
      <Tab.Screen name="Reviews">
        {() => <ReviewInfo stationId={station_id} reviewData={reviewData} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
