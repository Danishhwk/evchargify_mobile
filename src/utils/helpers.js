import {Dimensions, Linking, Platform} from 'react-native';

export const getShadowProps = (offset = 2, radius = 8, opacity = 0.2) => ({
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: offset,
  },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation: radius,
});

export const isIos = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const getWindowWidth = () => Dimensions.get('window').width;
export const getWindowHeight = () => Dimensions.get('window').height;

export const goToSettings = () => {
  if (isIos) {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

export const getBannerSize = height =>
  `${Math.floor(getWindowWidth())}x${height}`;
