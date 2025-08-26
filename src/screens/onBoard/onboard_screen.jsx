import {Image, View} from 'react-native';
import React, {useRef, useState} from 'react';
import {Button, Icon, Text, TouchableRipple} from 'react-native-paper';
import SwiperFlatList from 'react-native-swiper-flatlist';
import LinearGradient from 'react-native-linear-gradient';
import {images} from '../../assets/images/images';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardScreen({navigation}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const boardList = [Board1, Board2, Board3];
  const swiperRef = useRef();

  const handleNextPress = async () => {
    if (activeIndex < boardList.length - 1) {
      setActiveIndex(activeIndex + 1);
      swiperRef.current.scrollToIndex({index: activeIndex + 1, animated: true});
    }
    if (activeIndex === 2) {
      navigation.replace('LoginScreen');
      await AsyncStorage.setItem('hasOnboarded', 'true');
    }
  };

  return (
    <LinearGradient
      colors={['#002856', '#6BB14F']}
      className="flex-1"
      start={{x: -1, y: -1}}
      end={{x: 1.3, y: 1.3}}>
      <View className=" items-center">
        <SwiperFlatList
          data={boardList}
          ref={swiperRef}
          renderItem={({item}) => item()}
          horizontal={true}
          index={activeIndex}
          style={{height: '80%'}}
          onChangeIndex={index => {
            setActiveIndex(index.index);
          }}
          showPagination={true}
          PaginationComponent={value => {
            return (
              <View className="flex-row items-center justify-center gap-2">
                {boardList.map((_, index) => {
                  return (
                    <View
                      key={index}
                      className={`h-3 w-3 rounded-full ${
                        index === activeIndex
                          ? 'bg-[#E2EFD6]'
                          : 'bg-transparent border-2 border-[#E2EFD6]'
                      }`}
                    />
                  );
                })}
              </View>
            );
          }}
        />

        <Button
          className="mt-10 bg-[#99D9D9]"
          contentStyle={{
            flexDirection: 'row-reverse',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          mode="contained"
          labelStyle={{fontSize: 18, color: '#002856'}}
          icon={() => {
            return (
              <Image
                source={images.arrowRight}
                style={{height: 30, width: 30}}
                tintColor={'#002856'}
              />
            );
          }}
          onPress={handleNextPress}>
          Next
        </Button>
      </View>
    </LinearGradient>
  );
}

function Board1() {
  return (
    <View className="w-screen bg-transparent">
      <View
        className="justify-center items-center bg-white h-[78%]"
        style={{borderBottomStartRadius: 30, borderBottomEndRadius: 30}}>
        <Image
          source={images.onboard1}
          className="w-full h-[100%]"
          resizeMethod="resize"
          resizeMode="contain"
        />
      </View>
      <Text
        variant="headlineSmall"
        className="text-center mt-4 text-white mx-5">
        Register Easily
      </Text>

      <Text variant="bodyLarge" className="text-center text-white mt-4 mx-5">
        Quickly register by providing basic details and unlock a range of
        features.
      </Text>
    </View>
  );
}

function Board2() {
  return (
    <View className="w-screen bg-transparent">
      <View
        className="justify-center items-center bg-white h-[78%]"
        style={{
          borderBottomStartRadius: 30,
          borderBottomEndRadius: 30,
          overflow: 'hidden',
        }}>
        <Image
          source={images.onboard2}
          className="w-full h-[100%]"
          resizeMethod="resize"
          resizeMode="cover"
        />
      </View>

      <Text
        variant="headlineSmall"
        className="text-center mt-4 text-white mx-5">
        Find Charging Stations
      </Text>

      <Text variant="bodyLarge" className="text-center text-white mt-4 mx-5">
        Locate nearby charging stations with pinpoint accuracy using our
        interactive map.
      </Text>
    </View>
  );
}

function Board3() {
  return (
    <View className="w-screen bg-transparent">
      <View
        className="justify-center items-center bg-white h-[78%]"
        style={{borderBottomStartRadius: 30, borderBottomEndRadius: 30}}>
        <Image
          source={images.onboard3}
          className="w-full h-[100%]"
          resizeMethod="resize"
          resizeMode="contain"
        />
      </View>

      <Text
        variant="headlineSmall"
        className="text-center mt-4 text-white mx-5">
        Start Charging Easily
      </Text>

      <Text variant="bodyLarge" className="text-center text-white mt-4 mx-5">
        Initiate charging sessions seamlessly tailor the charging experience to
        your needs.
      </Text>
    </View>
  );
}
