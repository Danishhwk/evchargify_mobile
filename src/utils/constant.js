import {TestIds} from 'react-native-google-mobile-ads';
import {isIos} from './helpers';

// URLS
export let BaseUrl = 'http://prod.tritanev.com:3006/api/mobile';
export let imageUrl = 'http://prod.tritanev.com:3006';
export let BaseUrlTransaction = 'http://prod.tritanev.com:3002/api/transaction';
export let appSettingURl = 'http://goilkar.in:3006/api/mobile/app_setting';
export let introUrl =
  'http://prod.tritanev.com:3006/uploads/mobile_instructionsandnote/mobile_instructionsandnote.pdf';
// PAYMENT GATEWAY URL
export const RazorpayKey = 'rzp_live_RDRLafTwoe1qd7';
export const RazorpayTestKey = 'rzp_test_R8lQUGiEAkjbOw';
export const RazorpayProductionKey = 'rzp_live_RDRLafTwoe1qd7';

// export const bannerAdUnitId = isIos
//   ? 'ca-app-pub-8848421759163585/9364255675'
//   : 'ca-app-pub-8848421759163585/9090182680';
// export const interstitialAdUnitId = isIos
//   ? 'ca-app-pub-8848421759163585/7771972409'
//   : 'ca-app-pub-8848421759163585/3695559232';
// export const rewardedAdUnitId = isIos
//   ? 'ca-app-pub-8848421759163585/5684294291'
//   : 'ca-app-pub-8848421759163585/3715014189';

export let bannerAdUnitId = '';
export let interstitialAdUnitId = '';
export let rewardedAdUnitId = '';

if (__DEV__) {
  bannerAdUnitId = TestIds.BANNER;
  interstitialAdUnitId = TestIds.INTERSTITIAL;
  rewardedAdUnitId = TestIds.REWARDED;
} else {
  if (isIos) {
    bannerAdUnitId = 'ca-app-pub-8848421759163585/9364255675';
    interstitialAdUnitId = 'ca-app-pub-8848421759163585/7771972409';
    rewardedAdUnitId = 'ca-app-pub-8848421759163585/5684294291';
  } else {
    bannerAdUnitId = 'ca-app-pub-8848421759163585/9090182680';
    interstitialAdUnitId = 'ca-app-pub-8848421759163585/3695559232';
    rewardedAdUnitId = 'ca-app-pub-8848421759163585/3715014189';
  }
}

if (__DEV__) {
  // DEVELOPMENT BASE URL

  // BaseUrl = 'https://stage.tritanev.com/mobile/api';
  // imageUrl = 'http://stage.tritanev.com';
  // BaseUrlTransaction = 'http://stage.tritanev.com:3002/api/transaction';

  // BaseUrl = 'http://prod.tritanev.com:3006/api/mobile';
  // imageUrl = 'http://prod.tritanev.com:3006';
  // BaseUrlTransaction = 'http://prod.tritanev.com:3002/api/transaction';

  BaseUrl = 'http://stage.thevchargify.com:3006/api/mobile';
  imageUrl = 'http://stage.thevchargify.com:3006';
  BaseUrlTransaction = 'http://stage.thevchargify.com:3002/api/transaction';
} else {
  // PRODUCTION URLS

  BaseUrl = 'http://prod.thevchargify.com:3006/api/mobile';
  imageUrl = 'http://prod.thevchargify.com:3006';
  BaseUrlTransaction = 'http://prod.thevchargify.com:3002/api/transaction';

  /*   BaseUrl = 'http://prod.tritanev.com:3006/api/mobile';
  imageUrl = 'http://prod.tritanev.com:3006';
  BaseUrlTransaction = 'http://prod.tritanev.com:3002/api/transaction';
 */
}

export const guideText1 = 'Lock the car and apply the handbrake.';
export const guideText2 =
  'Press "Start Charging Now" within 60 seconds after connecting the gun to the EV.';
export const guideTextAmt =
  'Select the correct charger (AC or DC) and gun (GUN A or GUN B), enter the amount.';

export const guideTextTime =
  'Select the correct charger (AC or DC) and gun (GUN A or GUN B), enter the charging time.';
export const guideTextEnergy =
  'Select the correct charger (AC or DC) and gun (GUN A or GUN B), enter the energy (unit).';
