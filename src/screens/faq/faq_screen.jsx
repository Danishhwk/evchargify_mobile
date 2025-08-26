import React, {useEffect, useRef, useState} from 'react';
import {Card, List, Surface, Text} from 'react-native-paper';
import MyAppBar from '../../utils/components/appBar';
import {Toast} from 'react-native-toast-notifications';
import {faqListService} from '../../services/faq_service';
import {FlatList} from 'react-native-gesture-handler';
import Animated, {FadeIn, FadeInDown, FadeOut} from 'react-native-reanimated';
import {
  AdEventType,
  InterstitialAd,
  useForeground,
} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';
import Loading from '../../utils/components/loading';
import {interstitialAdUnitId} from '../../utils/constant';
import {StatusBar} from 'react-native';
import {initInnterstitialAd} from '../../utils/interstitial_ad_init';

export default function FaqScreen({navigation}) {
  const [faqList, setfaqList] = useState([]);

  useEffect(() => {
    fetchfaqList();

    return () => {};
  }, []);

  const fetchfaqList = async () => {
    try {
      const response = await faqListService();

      if (response && response.success) {
        setfaqList(response.data);
      } else {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Error'},
        });
      }
    } catch (error) {
      console.error('Error fetching faqList:', error);
      Toast.show("Something wen't wrong..!!, Please try again", {
        type: 'custom_toast',
        data: {title: 'Error'},
      });

      navigation.goBack();
    }
  };

  return (
    <Surface mode="flat" className="flex-1 h-full bg-white">
      <MyAppBar title={'FAQs'} />

      <FlatList
        data={faqList}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
        renderItem={({item}) => {
          return (
            <Animated.View key={item.mobile_faq_id} entering={FadeInDown}>
              <Card className="mb-5" mode="outlined">
                <List.Accordion
                  key={item.mobile_faq_id}
                  titleNumberOfLines={5}
                  title={item.mobile_faq_question}>
                  <Surface mode="flat" className="p-4">
                    <Text variant="bodyMedium">{item.mobile_faq_ans}</Text>
                  </Surface>
                </List.Accordion>
              </Card>
            </Animated.View>
          );
        }}
      />
    </Surface>
  );
}
