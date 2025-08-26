import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {useEffect, useState} from 'react';
import {Surface, Text} from 'react-native-paper';
import {stationCard} from '../home/station_card';
import {Easing, FadeInDown, FadeOutDown} from 'react-native-reanimated';
import {RefreshControl} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getFavListService} from '../../services/favourite_service';
import {getWindowHeight} from '../../utils/helpers';
import {View} from 'react-native';

export default function StationFavs({favRefresh, StationList}) {
  const navigation = useNavigation();

  return (
    <Surface mode="flat" className="flex-1 h-full bg-white">
      <FlashList
        className="flex-1"
        estimatedItemSize={219}
        data={StationList}
        contentContainerStyle={{paddingTop: 20}}
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
            className="flex-1 mx-5 items-center justify-center">
            <Text variant="bodyLarge" className="text-center text-lg">
              You haven't marked any stations as favourite yet.
            </Text>
          </View>
        }
      />
    </Surface>
  );
}
