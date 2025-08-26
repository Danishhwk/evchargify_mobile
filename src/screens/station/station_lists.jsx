import React, {useEffect, useState} from 'react';
import SoonScreen from '../../utils/components/soon';
import {Appbar, Button, Surface, Text, TextInput} from 'react-native-paper';
import {
  FlatList,
  RefreshControl,
  ScrollView,
} from 'react-native-gesture-handler';
import {stationCard} from '../home/station_card';
import {stationListData} from '../../assets/fakeData/fake_data';
import {stationListFun} from '../../services/station_service';
import {View} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
} from 'react-native-reanimated';
import {Image} from 'react-native';
import {images} from '../../assets/images/images';
import {FlashList} from '@shopify/flash-list';
import {Toast} from 'react-native-toast-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {getWindowHeight} from '../../utils/helpers';

export default function StationListScreen() {
  const navigation = useNavigation();
  const [stationList, setStationList] = useState([]);
  const [stationSearchList, setStationSearchList] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchEnable, setSearchEnable] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    getStationList();

    // Clean-up function (optional)
    return () => {
      // Any cleanup code can go here
    };
  }, []);

  const getStationList = async () => {
    try {
      const response = await stationListFun();

      if (response && response.success) {
        // console.log('station list fetchData response.data: ', response.data);
        var responseData = response.data;
        // console.log('responseData: ', responseData);
        const distanceData = await AsyncStorage.getItem('station_distance');
        const distance = JSON.parse(distanceData);
        var data = distance.map((item, index) => {
          let temp = {...responseData[index], distance: item.distance};
          return temp;
        });
        let sorted = data.sort((a, b) => a.distance - b.distance);

        setStationList(sorted);
        setStationSearchList(sorted);
      } else {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Info'},
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
    setIsRefreshing(false);
  };

  const searchTextField = () => {
    return (
      <TextInput
        placeholder="Search Stations"
        mode="outlined"
        className="w-[80%] h-11 bg-[#ffffff]"
        autoFocus={true}
        contentStyle={{paddingTop: 10, paddingBottom: 10}}
        outlineStyle={{elevation: 4, borderRadius: 30, borderWidth: 0}}
        value={searchText}
        onChangeText={text => {
          const lowerCaseText = text.toLowerCase();
          const searchList = stationList.filter(
            item =>
              item.station_name.toLowerCase().includes(lowerCaseText) ||
              (item.station_address_one &&
                item.station_address_one.toLowerCase().includes(lowerCaseText)),
          );

          setSearchText(text);
          setStationSearchList(searchList);
        }}
      />
    );
  };

  return (
    <Surface mode="flat" className="flex-1 h-full bg-white">
      <Appbar
        className="bg-transparent items-center justify-center"
        mode="center-aligned">
        <Appbar.Content
          title={searchEnable ? '' : 'Find a Station'}
          mode="center-aligned"
          titleStyle={{textAlign: 'center'}}
        />

        {searchEnable ? searchTextField() : null}
        {searchEnable ? <View className="flex-1" /> : null}

        <Appbar.Action
          animated={false}
          icon={() => (
            <Image
              source={searchEnable ? images.close : images.search}
              className="w-6 h-6"
            />
          )}
          onPress={() => {
            if (searchEnable) {
              setSearchEnable(false);
              setSearchText('');
              setStationSearchList(stationList);
            } else {
              setSearchEnable(true);
            }
          }}
        />
      </Appbar>

      <View mode="flat" className="flex-1">
        <FlashList
          className="flex-1"
          estimatedItemSize={219}
          keyExtractor={item => item.station_id.toString()}
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                setIsRefreshing(true);
                getStationList();
              }}
              refreshing={isRefreshing}
            />
          }
          data={searchEnable ? stationSearchList : stationList}
          renderItem={({item}) => {
            return stationCard({
              data: item,
              distance: item.distance,
              navigation,
              enterAnimation: FadeInDown.duration(300).easing(Easing.ease),
              exitAnimation: FadeOutDown.duration(300).easing(Easing.ease),
              style: {
                margin: 10,
                padding: 2,
                borderRadius: 12,
              },
            });
          }}
          ListEmptyComponent={
            <View
              style={{height: getWindowHeight() - 250}}
              className="flex-1 items-center justify-center mx-5">
              <Text variant="bodyLarge" className="text-center text-lg">
                It looks like there are no stations available right now. Please
                try again later.
              </Text>
            </View>
          }
        />
      </View>
    </Surface>
  );
}
