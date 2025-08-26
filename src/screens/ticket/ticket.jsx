import React, {useEffect, useRef, useState} from 'react';
import {Image, StatusBar, View} from 'react-native';
import {Appbar, Card, IconButton, Surface, Text} from 'react-native-paper';
import {images} from '../../assets/images/images';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getTicketListService} from '../../services/ticket_service';
import {FlatList, RefreshControl} from 'react-native-gesture-handler';
import moment from 'moment';
import Animated, {FadeIn, FadeInDown, FadeOut} from 'react-native-reanimated';
import {getWindowHeight, isIos} from '../../utils/helpers';
import {
  AdEventType,
  InterstitialAd,
  useForeground,
} from 'react-native-google-mobile-ads';
import MyBannerAd from '../../utils/components/banner_ad';
import {interstitialAdUnitId} from '../../utils/constant';
import Loading from '../../utils/components/loading';
import {initInnterstitialAd} from '../../utils/interstitial_ad_init';

export default function TicketScreen({navigation, ticketData}) {
  const [refreshing, setRefreshing] = useState(false);

  return (
    <Surface mode="flat" className="flex-1 h-full bg-white">
      <Appbar className="bg-transparent" mode="center-aligned">
        <IconButton
          icon={() => <Image source={images.back} className="w-6 h-6" />}
          onPress={() => navigation.goBack()}
        />
        <Appbar.Content title={'My Tickets'} />

        <Appbar.Action
          icon="plus"
          onPress={() => {
            navigation.navigate('TicketAdd');
          }}
        />
      </Appbar>

      <FlatList
        data={ticketData}
        contentContainerStyle={{padding: 20}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {}} />
        }
        ListEmptyComponent={
          <View
            style={{height: getWindowHeight() - 200}}
            className="flex-1 items-center justify-center mx-5">
            <Text variant="bodyLarge" className="text-center text-lg">
              You currently don't have any ticket.
            </Text>
          </View>
        }
        renderItem={({item}) => {
          return (
            <Animated.View
              needsOffscreenAlphaCompositing={true}
              entering={FadeInDown}
              className="mb-5">
              <Card
                onPress={() =>
                  navigation.navigate('TicketDetail', {ticket: item})
                }>
                <View className="w-20 bg-[#6BB14F] rounded-tl-lg rounded-tr-sm rounded-br-sm">
                  <Text
                    variant="labelSmall"
                    className="capitalize  p-1 text-center text-white">
                    {item.category_name}
                  </Text>
                </View>
                <View className="px-2 pb-2 pt-1 flex-row justify-between items-start">
                  <View className=" w-36">
                    <Text variant="titleMedium">{item.ticket_title}</Text>
                    <Text variant="labelMedium">
                      {moment(item.add_dt).format('DD-MM-YY hh:mm A')}
                    </Text>
                  </View>
                  <View className="w-40 items-start">
                    <Text variant="labelSmall">
                      Admin Status: {item.ticket_status}
                    </Text>
                    <Text variant="labelSmall">
                      Customer Status: {item.customer_status}
                    </Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          );
        }}
      />
    </Surface>
  );
}
