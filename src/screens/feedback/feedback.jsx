import {Image, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Appbar, Button, Surface, Text, TextInput} from 'react-native-paper';
import {ScrollView} from 'react-native-gesture-handler';
import {images} from '../../assets/images/images';
import {Rating} from '@kolking/react-native-rating';
import {Toast} from 'react-native-toast-notifications';
import {addFeedbackService} from '../../services/review_service';
import {stationInfoFun} from '../../services/station_service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useForeground} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';

export default function FeedBackScreen({navigation, route}) {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [stationData, setStationData] = useState(null);
  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  const addFeedbackFun = async () => {
    await addFeedbackService({
      stationId: stationData.station_id.toString(),
      charging_transaction_id: 0,
      customer_review: comment,
      customer_rating: rating,
    }).then(response => {
      if (response.success) {
        Toast.show('Thank you for your feedback!', {
          type: 'custom_toast',
          data: {title: 'Success'},
        });
        setTimeout(() => {
          navigation.replace('bottomNav');
        }, 200);
      } else {
        Toast.show('Something went wrong. Please try again.', {
          type: 'custom_toast',
          data: {title: 'Error'},
        });
        setTimeout(() => {
          navigation.replace('bottomNav');
        }, 200);
      }
    });
  };

  const getStationInfo = async () => {
    const station_id = await AsyncStorage.getItem('station_id');
    const response = await stationInfoFun(station_id);
    setStationData(response.data[0]);
  };

  useEffect(() => {
    getStationInfo();

    return () => {};
  }, []);

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        automaticallyAdjustKeyboardInsets={true}
        contentContainerStyle={{paddingBottom: 20}}>
        <Appbar className="bg-transparent" mode="center-aligned">
          <Appbar.Content title={'Write a Review'} />

          <Button
            onPress={() => {
              navigation.replace('bottomNav');
            }}
            mode="text">
            <Text className="text-[#6BB14F]" variant="bodyLarge">
              Skip
            </Text>
          </Button>
        </Appbar>

        <View className="flex-1 px-5 bg-white">
          <View className="h-5" />

          {stationData && stationInfo()}
          {/* 
          {vehicleInfo()}

          {chargerInfo()}

          <Divider className="my-5 h-0.5" horizontalInset={true} /> */}

          <Text className="text-center text-2xl mt-5" variant="headlineMedium">
            Give it a star
          </Text>

          <Rating
            className="self-center my-5"
            size={55}
            scale={1.1}
            fillColor="#6BB14F"
            touchColor="#6BB14F"
            rating={rating}
            fillSymbol={images.star_fill}
            baseSymbol={images.star}
            baseColor="#6BB14F"
            onChange={value => setRating(value)}
          />

          <Text variant="titleMedium">Comment</Text>

          <TextInput
            mode="outlined"
            value={comment}
            placeholder="Enter Comment..."
            className="bg-[#E2EFD6] my-5"
            contentStyle={{paddingTop: 10, paddingBottom: 10}}
            outlineStyle={{elevation: 2, borderRadius: 10, borderWidth: 0}}
            numberOfLines={5}
            multiline
            onChangeText={text => setComment(text)}
            left={
              <TextInput.Icon
                forceTextInputFocus={false}
                icon={() => (
                  <Image source={images.message} className="w-6 h-6 mb-2" />
                )}
              />
            }
          />

          <Button
            mode="contained"
            className="w-full mb-2 rounded-full self-center"
            onPress={() => {
              if (rating == 0 || comment == '') {
                Toast.show('Please give review or skip', {
                  type: 'custom_toast',
                  data: {title: 'Info'},
                });
              } else {
                addFeedbackFun();
              }
            }}>
            <Text variant="bodyLarge" className="text-white">
              Submit
            </Text>
          </Button>
        </View>
      </ScrollView>
      <MyBannerAd
        bannerRef={bannerRef}
        setBannerLoaded={setBannerLoaded}
        bannerLoaded={bannerLoaded}
      />
    </View>
  );

  function chargerInfo() {
    return (
      <Surface mode="flat" className="bg-[#99D9D9] rounded-xl p-3 mt-4">
        <View className="flex-1 flex-row justify-between items-center">
          <Text className="" variant="titleMedium">
            Selected Option
          </Text>
          <Text variant="titleMedium">Time</Text>
        </View>

        <View className="h-2" />

        <View className="flex-1 flex-row justify-between items-center">
          <Text variant="titleMedium">Battery</Text>
          <Text variant="titleMedium">90%</Text>
        </View>
      </Surface>
    );
  }

  function stationInfo() {
    return (
      <Surface mode="flat" className="bg-[#99D9D9] rounded-xl flex-row p-2">
        <Image
          className="w-24 h-28 rounded-lg"
          resizeMode="cover"
          source={{uri: stationData.imgData[0]}}
        />
        <View className="ml-2 w-[70%]">
          <Text variant="titleLarge" ellipsizeMode="tail" numberOfLines={1}>
            {stationData.station_name}
          </Text>
          <Text variant="titleMedium" ellipsizeMode="tail" numberOfLines={3}>
            {stationData.station_info}
          </Text>
        </View>
      </Surface>
    );
  }

  function vehicleInfo() {
    return (
      <Surface
        mode="flat"
        className="bg-[#99D9D9] rounded-xl p-3 mt-4 flex-row">
        <Image source={images.carIcon} className="w-14 h-14" />

        <View className="ml-4 w-[80%]">
          <Text variant="titleLarge">Tata</Text>
          <Text numberOfLines={1} ellipsizeMode="tail" variant="titleMedium">
            Punch EV Smart 3.3
          </Text>
        </View>
      </Surface>
    );
  }
}
