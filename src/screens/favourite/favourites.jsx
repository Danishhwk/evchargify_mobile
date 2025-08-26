import React, {useEffect, useState} from 'react';
import {Card, Surface, Text, TouchableRipple} from 'react-native-paper';
import MyAppBar from '../../utils/components/appBar';
import {
  FavAddService,
  getFavListService,
} from '../../services/favourite_service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FlatList, RefreshControl} from 'react-native-gesture-handler';
import {Image, View} from 'react-native';
import {images} from '../../assets/images/images';
import {Toast} from 'react-native-toast-notifications';

export default function FavouriteScreen({navigation}) {
  const [favList, setFavList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getFavList();
  }, []);

  const getFavList = async () => {
    setRefreshing(true);
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');
      getFavListService(customer_id)
        .then(response => {
          if (response && response.success) {
            setFavList(response.data);
            setRefreshing(false);
          }
        })
        .catch(error => {
          setRefreshing(false);
          console.log('getFavListService error: ', error);
        });
    } catch (error) {
      setRefreshing(false);
      console.log('getFavListService error: ', error);
    }
  };

  async function FavFun(station_id) {
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');

      await FavAddService(customer_id, station_id, 2)
        .then(value => {
          Toast.show('Removed from Favourites', {
            type: 'custom_toast',
            data: {title: 'Info'},
          });
          getFavList();
        })
        .catch(error => {
          console.error('Error:', error);
          Toast.show('Something went wrong. Please try again', {
            type: 'custom_toast',
            data: {title: 'Error'},
          });
          getFavList();
        });
    } catch (error) {
      console.error('Error:', error);
      Toast.show('Something went wrong. Please try again', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
      getFavList();
    }
  }

  return (
    <Surface mode="flat" className="flex-1 h-full">
      <MyAppBar title={'Favourites'} />

      <FlatList
        data={favList}
        onRefresh={getFavList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={getFavList} />
        }
        ListEmptyComponent={
          <Surface
            mode="flat"
            className="flex-1 h-screen items-center justify-center bg-[#E9EDF5]">
            <Text variant="headlineLarge" className="text-center">
              No Favourites found
            </Text>
          </Surface>
        }
        contentContainerStyle={{padding: 20}}
        renderItem={({item, index}) => {
          return (
            <Card
              onPress={() => {
                navigation.navigate('StationDetail', {
                  station_id: item.station_id,
                });
              }}
              key={item.station_id}
              mode="elevated"
              className="p-4 mt-4">
              <View className="flex-row">
                <View className="w-[90%]">
                  <Text
                    ellipsizeMode="tail"
                    className="text-lg"
                    numberOfLines={2}>
                    {item.station_name}
                  </Text>
                  <Text
                    variant="titleSmall"
                    className="text-[#79747E] mt-1"
                    ellipsizeMode="tail"
                    numberOfLines={4}>
                    {item.station_address_one + ' ' + item.station_address_two}
                  </Text>
                </View>

                <View>
                  <TouchableRipple
                    className="rounded-full p-1"
                    borderless
                    onPress={() => {
                      FavFun(item.station_id);
                    }}>
                    <Image
                      source={
                        item.favorite_station_status == 1
                          ? images.heart_fill
                          : images.heart
                      }
                      style={{width: 32, height: 32}}
                    />
                  </TouchableRipple>
                </View>
              </View>
            </Card>
          );
        }}
      />
    </Surface>
  );
}
