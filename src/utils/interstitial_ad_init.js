import {AdEventType, InterstitialAd} from 'react-native-google-mobile-ads';
import {interstitialAdUnitId} from './constant';
import {isIos} from './helpers';
import {StatusBar} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const initInnterstitialAd = async ({setAdLoaded, adShown}) => {
  const interstitialAdHelper =
    InterstitialAd.createForAdRequest(interstitialAdUnitId);

  let unsubscribeLoaded;
  let unsubsribedError;
  let unsubscribedClosed;
  let loadAd = false;

  /* try {
    try {
      const response = await AsyncStorage.getItem('coin_show_response');
      const data = JSON.parse(response);

      if (data.show_ad === true) {
        loadAd = true;
      }
    } catch (error) {
      loadAd = true;
      console.log('checkReward error', error);
    }

    if (!adShown.current) {
      interstitialAdHelper.load();

      unsubscribeLoaded = interstitialAdHelper.addAdEventListener(
        AdEventType.LOADED,
        () => {
          if (loadAd) interstitialAdHelper.show();
          setAdLoaded(true);
          adShown.current = true;
          if (isIos) StatusBar.setHidden(true);
        },
      );

      unsubscribedClosed = interstitialAdHelper.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          if (isIos) StatusBar.setHidden(false);
        },
      );

      unsubsribedError = interstitialAdHelper.addAdEventListener(
        AdEventType.ERROR,
        () => {
          setAdLoaded(true);
          adShown.current = true;
          if (isIos) StatusBar.setHidden(false);
        },
      );
    }
  } catch (error) {
    console.log('ads error', error);
  }
  return () => {
    unsubscribeLoaded();
    unsubscribedClosed();
    unsubsribedError();
  }; */
};
