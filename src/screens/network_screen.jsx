// components/NetworkStatus.js
import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Animated, {
  Easing,
  SlideInDown,
  SlideInUp,
} from 'react-native-reanimated';
import {Surface, Text} from 'react-native-paper';

const NetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    NetInfo.addEventListener(state => {
      setIsConnected(
        state.isInternetReachable === null ? true : state.isInternetReachable,
      );
    });

    return () => {
      // unsubscribe();
    };
  }, []);

  // State to manage visibility of "Online" text
  const [showOnline, setShowOnline] = useState(false);

  // Effect to handle vanishing of "Online" text after 10 seconds
  // useEffect(() => {
  //   if (isConnected) {
  //     setShowOnline(true);
  //     const timer = setTimeout(() => {
  //       setShowOnline(false);
  //     }, 10000); // 10 seconds
  //     return () => clearTimeout(timer);
  //   } else {
  //     setShowOnline(false); // Ensure "Online" disappears immediately when offline
  //   }
  // }, [isConnected]);

  return (
    <>
      {!isConnected && (
        <Animated.View
          entering={SlideInUp.duration(1000).easing(Easing.ease)}
          exiting={SlideInDown.duration(1000).easing(Easing.ease)}
          className={'absolute left-5 right-5 top-3 z-50'}>
          <Surface
            mode="elevated"
            className="rounded-lg bg-red-400 h-14 items-center justify-center">
            <Text variant="titleMedium" className="text-white text-lg">
              No Internet Connection
            </Text>
          </Surface>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    zIndex: 9999,
  },
  text: {
    fontWeight: 'bold',
  },
});

export default NetworkStatus;
