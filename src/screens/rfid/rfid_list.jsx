import {StatusBar, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Appbar,
  Card,
  Dialog,
  IconButton,
  Surface,
  Switch,
  Text,
} from 'react-native-paper';
import {images} from '../../assets/images/images';
import {Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getRfidListService,
  setActiveRfidService,
} from '../../services/rfid_service';
import {FlatList, RefreshControl} from 'react-native-gesture-handler';
import {Toast} from 'react-native-toast-notifications';
import {
  AdEventType,
  InterstitialAd,
  useForeground,
} from 'react-native-google-mobile-ads';
import {getWindowHeight, isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';
import {interstitialAdUnitId} from '../../utils/constant';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import Loading from '../../utils/components/loading';
import {initInnterstitialAd} from '../../utils/interstitial_ad_init';

export default function RfidListScreen({navigation}) {
  const [refreshing, setRefreshing] = useState(false);

  const [rfidList, setRfidList] = useState([]);

  const [dialogVisible, setDialogVisible] = useState(false);

  const [dialogData, setDialogData] = useState({});

  useEffect(() => {
    getRfidList();
  }, []);

  const getRfidList = async () => {
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');
      await getRfidListService(customer_id)
        .then(response => {
          console.log('rfid response', response);

          setRfidList(response.data);

          setRefreshing(false);
        })
        .catch(error => {
          console.log('error', error);
          setRefreshing(false);
        });
    } catch (error) {
      console.log('error', error);
      setRefreshing(false);
    }
  };

  const setActiveFun = async (id, is_active) => {
    try {
      const data = {
        rfid_id: id,
        is_active: is_active,
      };
      console.log('data', data);

      await setActiveRfidService(data)
        .then(response => {
          console.log('response', response);
          Toast.show('RFID Status Updated', {
            type: 'custom_toast',
            data: {title: 'Success'},
          });
          getRfidList();
        })
        .catch(error => {
          console.log('error', error);
          Toast.show('Something went wrong. Please try again', {
            type: 'custom_toast',
            data: {title: 'Error'},
          });
        });
    } catch (error) {
      console.log('error', error);
      Toast.show('Something went wrong. Please try again', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
    setDialogVisible(false);
  };

  return (
    <Surface mode="flat" className="flex-1 h-full bg-white">
      <Appbar className="bg-transparent" mode="center-aligned">
        <IconButton
          icon={() => <Image source={images.back} className="w-6 h-6" />}
          onPress={() => navigation.goBack()}
        />
        <Appbar.Content title={'RFID'} />
      </Appbar>

      <FlatList
        data={rfidList}
        showsVerticalScrollIndicator={false}
        style={{alignSelf: 'center'}}
        contentContainerStyle={{
          padding: 20,
          alignItems: 'flex-start',
          gap: 30,
        }}
        columnWrapperStyle={{
          columnGap: 50,
        }}
        numColumns={2}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={getRfidList} />
        }
        ListEmptyComponent={
          <View
            style={{height: getWindowHeight() - 200}}
            className="flex-1 items-center justify-center mx-5">
            <Text variant="bodyLarge" className="text-center text-lg">
              No RFID Tags Available
            </Text>
          </View>
        }
        renderItem={({item}) => {
          return (
            <Card
              onPress={() => {
                setDialogVisible(true);
                setDialogData(item);
              }}
              className="p-2 w-32 h-32 items-center justify-center">
              <Image
                source={images.rfid_lable}
                tintColor={'#6BB14F'}
                className="w-16 h-16 self-center"
              />
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                className="mt-2 text-center"
                variant="titleMedium">
                {item.rfid_name}
              </Text>
            </Card>
          );
        }}
      />

      {cardDialog(setDialogVisible, dialogVisible, dialogData, setActiveFun)}
    </Surface>
  );
}
function cardDialog(setDialogVisible, dialogVisible, dialogData, setActiveFun) {
  return (
    <Dialog onDismiss={() => setDialogVisible(false)} visible={dialogVisible}>
      <Dialog.Content>
        <View className="items-center justify-between flex-row">
          <Text variant="titleLarge">Card Info</Text>

          <IconButton
            borderless
            style={{margin: 0}}
            icon={() => <Image source={images.close} className="w-6 h-6" />}
            onPress={() => setDialogVisible(false)}
          />
        </View>

        <Text className="mt-4 font-bold" variant="titleMedium">
          RFID Name: <Text variant="titleMedium">{dialogData.rfid_name}</Text>
        </Text>

        <Text className="mt-3 font-bold" variant="titleMedium">
          Issue Date:{' '}
          <Text variant="titleMedium">{dialogData.rfid_issue_dt}</Text>
        </Text>

        <Text className="mt-3 font-bold" variant="titleMedium">
          Expiry Date:{' '}
          <Text variant="titleMedium">{dialogData.rfid_expiry_dt}</Text>
        </Text>

        <View className="flex-row items-center mt-3">
          <Text className="font-bold" variant="titleMedium">
            Status:{' '}
          </Text>

          <View className="flex-row items-center">
            <Text className="mr-2" variant="titleMedium">
              {dialogData.is_active == 1 ? 'Active' : 'Inactive'}
            </Text>
            <Switch
              value={dialogData.is_active == 1}
              onChange={() => {
                setActiveFun(
                  dialogData.rfid_id,
                  dialogData.is_active == 1 ? 0 : 1,
                );
              }}
            />
          </View>
        </View>
      </Dialog.Content>
    </Dialog>
  );
}
