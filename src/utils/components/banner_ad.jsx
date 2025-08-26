import {View} from 'react-native';
import React from 'react';
import {BannerAd} from 'react-native-google-mobile-ads';
import {bannerAdUnitId} from '../constant';
import {getBannerSize} from '../helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export default function MyBannerAd({
  setBannerLoaded,
  bannerRef,
  bannerLoaded,
  style,
  height = 0,
}) {
  const adHeight = useSharedValue(0);
  const adOpacity = useSharedValue(0);

  const animatedAdStyle = useAnimatedStyle(() => ({
    height: adHeight.value,
    opacity: adOpacity.value,
  }));

  return (
    <Animated.View>
      {/* <BannerAd
        ref={bannerRef}
        unitId={bannerAdUnitId}
        size={getBannerSize(height)}
        onAdLoaded={async () => {
          try {
            const response = await AsyncStorage.getItem('coin_show_response');
            const data = JSON.parse(response);

            if (data.show_ad === false) {
              setBannerLoaded(false);
            } else {
              setBannerLoaded(true);
              const bannerSize = getBannerSize(height); // Get actual banner size
              const bannerHeight = height; // Adjust height dynamically

              // Animate height and opacity smoothly
              adHeight.value = withTiming(bannerHeight, {duration: 300});
              adOpacity.value = withTiming(1, {duration: 300});
            }
          } catch (error) {
            console.log('checkReward error', error);
          }
        }}
        onAdFailedToLoad={err => {
          console.log('Banner ad failed to load', err);
          setBannerLoaded(false);
          adHeight.value = withTiming(0, {duration: 300}); // Hide smoothly
          adOpacity.value = withTiming(0, {duration: 300});
        }}
      /> */}
    </Animated.View>
  );
}
