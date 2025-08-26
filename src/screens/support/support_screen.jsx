import React, {useEffect, useRef, useState} from 'react';
import {Card, Surface, Text} from 'react-native-paper';
import MyAppBar from '../../utils/components/appBar';
import {Image, Linking, StatusBar, View} from 'react-native';
import {images} from '../../assets/images/images';
import {SupportService} from '../../services/support_service';
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

export default function SupportScreen({navigation}) {
  const [contactInfo, setContactInfo] = useState({
    phoneNumber: '',
    whatsappNumber: '',
    mail: '',
  });

  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  useEffect(() => {
    const getSupportFun = async () => {
      try {
        const response = await SupportService();

        if (response && response.success) {
          setContactInfo({
            phoneNumber: response.data[0].mobile_support_text,
            whatsappNumber: response.data[1].mobile_support_text,
            mail: response.data[2].mobile_support_text,
          });
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
        console.error('Error fetching support info:', error);
        Toast.show('Something went wrong..!!, Please try again', {
          type: 'custom_toast',
          data: {title: 'Error'},
        });
        navigation.goBack();
      }
    };

    getSupportFun();
  }, [navigation]);

  const contactCards = [
    {
      title: 'Our Customer Service',
      contact: contactInfo.phoneNumber,
      icon: images.phonecall,
      action: () => Linking.openURL(`tel:${contactInfo.phoneNumber}`),
    },
    {
      title: 'Connect with us',
      contact: contactInfo.whatsappNumber,
      icon: images.whatsApp,
      action: () => {
        const whatsAppNumber = contactInfo.whatsappNumber.replace(/\D/g, '');
        const whatsappUrl = `whatsapp://send?phone=${whatsAppNumber}`;
        const bkWhatsappUrl = `https://wa.me/${whatsAppNumber}`;

        Linking.openURL(whatsappUrl).catch(() => {
          console.log('WhatsApp not installed');
          Linking.openURL(bkWhatsappUrl);
        });
      },
    },
    {
      title: 'Write us at',
      contact: contactInfo.mail,
      icon: images.gmail,
      action: () => Linking.openURL(`mailto:${contactInfo.mail}`),
    },
  ];

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
      <MyAppBar title={'Contact Support'} />

      <View className="p-5">
        {contactCards.map((card, index) => (
          <Card
            key={index}
            className="mb-5 rounded-2xl p-2 px-3"
            onPress={card.action}>
            <View className="flex-row items-center">
              <View className="bg-gray-200 rounded-full p-4">
                <Image
                  source={card.icon}
                  className="w-8 h-8"
                  resizeMode="contain"
                />
              </View>
              <View className="p-3">
                <Text variant="bodyMedium" className="text-sm text-gray-400">
                  {card.title}
                </Text>
                <Text variant="titleLarge" className="text-lg">
                  {card.contact}
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </Surface>
  );
}
