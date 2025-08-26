import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Card, IconButton, List, Surface, Text} from 'react-native-paper';
import MyAppBar from '../../utils/components/appBar';
import {Toast} from 'react-native-toast-notifications';
import {faqListFun, InstructionService} from '../../services/faq_service';
import {FlatList} from 'react-native-gesture-handler';
import Animated, {FadeIn, FadeInDown, FadeOut} from 'react-native-reanimated';
import {StatusBar, useWindowDimensions, View} from 'react-native';
import Pdf from 'react-native-pdf';
import {introUrl} from '../../utils/constant';
import RenderHtml from 'react-native-render-html';
import Hyperlink from 'react-native-hyperlink';
import MyBannerAd from '../../utils/components/banner_ad';
import {
  AdEventType,
  InterstitialAd,
  useForeground,
} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import {interstitialAdUnitId} from '../../utils/constant';
import Loading from '../../utils/components/loading';
import {useFocusEffect} from '@react-navigation/native';

export default function InstructionScreen({navigation}) {
  const [instructionList, setInstructionList] = useState([]);
  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  useEffect(() => {
    fetchIntroList();
  }, []);

  const fetchIntroList = async () => {
    try {
      const response = await InstructionService();

      if (response && response.success) {
        setInstructionList(response.data);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Info'},
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching InstructionService:', error);
      Toast.show("Something wen't wrong..!!, Please try again", {
        type: 'custom_toast',
        data: {title: 'Error'},
      });

      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        needsOffscreenAlphaCompositing={true}
        className="flex-1 items-center justify-center">
        <Loading visible={isLoading} />
      </Animated.View>
    );
  }

  return (
    <Surface mode="flat" className="flex-1 h-full bg-white">
      <MyAppBar title={'User Guide'} />

      <FlatList
        data={instructionList}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
        renderItem={({item}) => {
          return (
            <Animated.View
              entering={FadeInDown}
              key={item.mobile_instructionsandnote_id}>
              <Hyperlink linkDefault={true} linkStyle={{color: '#007AFF'}}>
                <Text variant="titleSmall" ellipsizeMode="tail">
                  {item.mobile_instructionsandnote}
                </Text>
              </Hyperlink>
            </Animated.View>
          );
        }}
      />
    </Surface>
  );
}
