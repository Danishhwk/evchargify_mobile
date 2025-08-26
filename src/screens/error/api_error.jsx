import {Image, View} from 'react-native';
import React from 'react';
import {Appbar, Button, Icon, Text} from 'react-native-paper';
import {images} from '../../assets/images/images';
import {StackActions} from '@react-navigation/native';

const ApiErrorScreen = ({navigation, route}) => {
  const [isInternetWorking, setIsInternetWorking] = React.useState(false);

  React.useEffect(() => {
    setIsInternetWorking(route.params.internetWorking);
  }, [route.params.internetWorking]);

  if (isInternetWorking) {
    return (
      <View className="flex-1 bg-white">
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Image source={images.server} className="h-40 w-40" />
          <Text className="my-3 mx-5 text-center" variant="titleLarge">
            We are currently experiencing technical difficulties. Our team is
            working to resolve the issue as soon as possible. Thank you for your
            patience.
          </Text>

          <Button
            onPress={() => {
              navigation.dispatch(StackActions.replace('SplashScreen'));
            }}
            mode="contained"
            contentStyle={{
              height: 50,
              width: 160,
            }}
            style={{
              borderRadius: 50,
            }}
            className="bg-[#6BB14F] my-5">
            <Text className="text-white" variant="bodyLarge">
              Try Again
            </Text>
          </Button>
        </View>
      </View>
    );
  } else {
    return (
      <View className="flex-1 bg-white">
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Image source={images.nowifi} className="h-40 w-40" />
          <Text className="my-3 mx-5 text-center" variant="titleLarge">
            It seems like your internet connection is not working. Please check
            your internet and try again.
          </Text>

          <Button
            onPress={() => {
              navigation.dispatch(StackActions.replace('SplashScreen'));
            }}
            mode="contained"
            contentStyle={{
              height: 50,
              width: 160,
            }}
            style={{
              borderRadius: 50,
            }}
            className="bg-[#6BB14F] my-5">
            <Text className="text-white" variant="bodyLarge">
              Try Again
            </Text>
          </Button>
        </View>
      </View>
    );
  }
};

export default ApiErrorScreen;
