import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import SplashScreen from '../screens/splash/splash';
import MaintenanceScreen from '../screens/maintenance/maintenance';
import AppUpdateScreen from '../screens/app_update/app_update';
import OnboardScreen from '../screens/onBoard/onboard_screen';
import LoginScreen from '../screens/auth/login_screen';
import RegisterScreen from '../screens/auth/register_screen';
import RegisterOtpScreen from '../screens/auth/register_otp_screen';
import ForgotPasswordScreen from '../screens/auth/forgot_password_screen';
import ForgotPasswordChangePasswordScreen from '../screens/auth/forgot_password_change_password_screen';

import bottomNav from './components/bottom_navigation';
import StationDetail from '../screens/stationDetail/station_detail';
import ChargerInfo from '../screens/charging/charging_info';
import ChargingStatus from '../screens/charging/charging_status';

import Profile from '../screens/profile/profile_screen';
import Wallet from '../screens/wallet/wallet';
import Session from '../screens/session/session';
import ChangePassword from '../screens/change_password/change_password_screen';
import ReviewInfo from '../screens/stationDetail/review_info';
import FeedBackScreen from '../screens/feedback/feedback';
import CurrentSessions from '../screens/charging/current_sessions';
import QrScanner from '../screens/qrScanner/qr_scanner';
import SessionDetail from '../screens/session/session_detail';
import Delete from '../screens/delete/delete';
import PasswordVerify from '../screens/delete/password_verify';
import Subscription from '../screens/subscription/subscription';
import FaqScreen from '../screens/faq/faq_screen';
import SupportScreen from '../screens/support/support_screen';
import InstructionScreen from '../screens/faq/instruction_screen';
import FavouriteScreen from '../screens/favourite/favourites';
import VehicleListScreen from '../screens/vehicle/vehicleList';
import VehicleAdd from '../screens/vehicle/vehicle_add';
import VehicleEdit from '../screens/vehicle/vehicle_edit';
import TicketScreen from '../screens/ticket/ticket';
import TicketAdd from '../screens/ticket/ticket_add';
import TicketDetail from '../screens/ticket/ticket_detail';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getTicketListService} from '../services/ticket_service';
import RfidListScreen from '../screens/rfid/rfid_list';
import InquiryList from '../screens/inquiry/inquiry_list';
import InquiryAdd from '../screens/inquiry/inquiry_add';
import {getIn} from 'formik';
import {getInquiryListService} from '../services/inquiry_service';
import {getVehicleListService} from '../services/vehicle_service';
import EarnScreen from '../screens/earn/earn';
import {isRewardEnableService} from '../services/reward_service';
import ApiErrorScreen from '../screens/error/api_error';
import StationDetail1 from '../screens/stationDetail/ocpi_station_detail';
import OcpiStationDetail from '../screens/stationDetail/ocpi_station_detail';

const Stack = createNativeStackNavigator();

export default function StackRoutes() {
  const navigation = useNavigation();
  const [ticketList, setTicketList] = useState([]);
  const [vehicleList, setVehicleList] = useState([]);

  const vehicleListFun = async () => {
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');

      await getVehicleListService(customer_id)
        .then(response => {
          setVehicleList(response.data.reverse());
        })
        .catch(error => {
          console.log('error', error);
        });
    } catch (error) {
      console.log('error', error);
    }
  };

  const checkReward = async () => {
    try {
      const response = await isRewardEnableService();
      await AsyncStorage.setItem(
        'coin_show_response',
        JSON.stringify({
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
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
      }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="OnboardScreen" component={OnboardScreen} />
      <Stack.Screen name="MaintenanceScreen" component={MaintenanceScreen} />
      <Stack.Screen name="AppUpdateScreen" component={AppUpdateScreen} />

      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="RegisterOtpScreen" component={RegisterOtpScreen} />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <Stack.Screen
        name="ForgotPasswordChangePasswordScreen"
        component={ForgotPasswordChangePasswordScreen}
      />

      <Stack.Screen
        name="bottomNav"
        component={bottomNav}
        listeners={{
          focus: () => {
            checkReward();
          },
        }}
      />

      <Stack.Screen name="StationDetail" component={StationDetail} />
      <Stack.Screen name="OcpiStationDetail" component={OcpiStationDetail} />
      <Stack.Screen name="ChargerInfo" component={ChargerInfo} />
      <Stack.Screen
        name="ChargingStatus"
        component={ChargingStatus}
        listeners={{
          focus: () => {
            checkReward();
          },
        }}
      />
      <Stack.Screen name="ReviewInfo" component={ReviewInfo} />
      <Stack.Screen name="FeedBack" component={FeedBackScreen} />

      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Wallet" component={Wallet} />
      <Stack.Screen name="Subscription" component={Subscription} />
      <Stack.Screen name="Session" component={Session} />
      <Stack.Screen name="Delete" component={Delete} />
      <Stack.Screen name="PasswordVerify" component={PasswordVerify} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="QRScanner" component={QrScanner} />
      <Stack.Screen name="SessionDetail" component={SessionDetail} />
      <Stack.Screen name="Faq" component={FaqScreen} />
      <Stack.Screen name="Instruction" component={InstructionScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Favourite" component={FavouriteScreen} />
      <Stack.Screen name="VehicleAdd" component={VehicleAdd} />
      <Stack.Screen name="VehicleEdit" component={VehicleEdit} />
      <Stack.Screen name="RfidList" component={RfidListScreen} />
      <Stack.Screen name="InquiryAdd" component={InquiryAdd} />
      <Stack.Screen name="InquiryList" component={InquiryList} />
      <Stack.Screen name="Earn" component={EarnScreen} />
      <Stack.Screen
        name="VehicleList"
        listeners={{
          focus: async () => {
            vehicleListFun();
          },
        }}
        children={() => (
          <VehicleListScreen
            navigation={navigation}
            vehicleData={vehicleList}
            vehicleFun={vehicleListFun}
          />
        )}
      />

      <Stack.Screen
        name="TicketScreen"
        listeners={{
          focus: async () => {
            try {
              let customer_id = await AsyncStorage.getItem('customer_id');

              await getTicketListService(customer_id)
                .then(response => {
                  setTicketList(response.data.reverse());
                })
                .catch(error => {
                  console.log('error', error);
                });
            } catch (error) {
              console.log('error', error);
            }
          },
        }}
        children={() => (
          <TicketScreen navigation={navigation} ticketData={ticketList} />
        )}
      />
      <Stack.Screen name="TicketAdd" component={TicketAdd} />
      <Stack.Screen name="TicketDetail" component={TicketDetail} />
      <Stack.Screen name="ApiErrorScreen" component={ApiErrorScreen} />
    </Stack.Navigator>
  );
}
