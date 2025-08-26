import {Image, StatusBar, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Button, Text, TextInput} from 'react-native-paper';
import MyAppBar from '../../utils/components/appBar';
import {ScrollView} from 'react-native-gesture-handler';
import {images} from '../../assets/images/images';
import {Toast} from 'react-native-toast-notifications';
import {
  AdEventType,
  InterstitialAd,
  useForeground,
} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';
import {interstitialAdUnitId} from '../../utils/constant';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import Loading from '../../utils/components/loading';
import {initInnterstitialAd} from '../../utils/interstitial_ad_init';

export default function Delete({navigation}) {
  const [reason, setReason] = useState('');

  return (
    <View className="flex-1 h-full bg-white">
      <MyAppBar title={'Delete Account'} />

      <ScrollView className="p-5" contentContainerStyle={{paddingBottom: 30}}>
        <Text variant="bodyLarge" className="mt-2">
          Before we proceed with deleting your account, could you please provide
          a reason for your decision? This will help us improve our services in
          the future.
        </Text>

        <TextInput
          mode="outlined"
          value={reason}
          placeholder="Enter Reason..."
          className="my-5"
          contentStyle={{height: 100, marginTop: 12}}
          outlineStyle={{
            elevation: 3,
            borderRadius: 10,
            shadowColor: '#6BB14F',
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.7,
            shadowRadius: 1.41,
          }}
          numberOfLines={5}
          multiline
          onChangeText={text => setReason(text)}
          error={reason.trim() == ''}
          left={
            <TextInput.Icon
              forceTextInputFocus={false}
              icon={() => (
                <Image source={images.message} className="w-5 h-5 mb-2" />
              )}
            />
          }
        />

        <Button
          mode="contained"
          className="w-full mb-2 rounded-full self-center"
          onPress={() => {
            if (reason.trim() == '') {
              Toast.show('Please give reason', {
                type: 'custom_toast',
                data: {title: 'Info'},
              });
            } else {
              navigation.navigate('PasswordVerify', {
                reason: reason.trim(),
              });
            }
          }}>
          <Text variant="bodyLarge" className="text-white">
            Proceed
          </Text>
        </Button>
      </ScrollView>
    </View>
  );
}
