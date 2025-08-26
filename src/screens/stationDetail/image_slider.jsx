import React, {useState, useCallback} from 'react';
import {Image, ImageBackground, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Text, TouchableRipple} from 'react-native-paper';
import SwiperFlatList from 'react-native-swiper-flatlist';
import {images} from '../../assets/images/images';

export function ImageSlider({imageList, isFav, handleFavToggle}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onIndexChanged = useCallback(index => {
    setActiveIndex(index);
  }, []);

  return (
    <View>
      <SwiperFlatList
        data={imageList}
        horizontal
        pagingEnabled
        style={{height: 250}}
        showsPagination={false}
        index={activeIndex}
        onChangeIndex={({index}) => onIndexChanged(index)}
        renderItem={({item}) => (
          <View className="w-screen h-fit items-center">
            <ImageBackground
              source={{uri: item}}
              resizeMode="cover"
              imageStyle={{
                borderRadius: 20,
                width: '100%',
              }}
              className="w-[92%] h-[100%] rounded-3xl">
              <LinearGradient
                className="flex-1 w-full h-[100%] rounded-2xl"
                colors={['#00000080', '#00000000']}
                start={{x: 0, y: 0.15}}
                end={{x: 0, y: 0.35}}
                style={{borderRadius: 20}}
              />
            </ImageBackground>
            <TouchableRipple
              className="rounded-full p-1 absolute top-3 right-8 z-10"
              borderless
              style={{backgroundColor: '#E9EDF599'}}
              onPress={handleFavToggle}>
              <Image
                source={isFav ? images.heart_fill : images.heart}
                style={{width: 28, height: 28}}
              />
            </TouchableRipple>
            {/* <Image
              source={{uri: item}}
              resizeMode="cover"
              style={{
                borderWidth: 2,
                borderColor: 'white',
              }}
              className="w-[92%] h-[100%] rounded-3xl"
            /> */}
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 w-screen h-fit items-center justify-center">
            <Image
              source={images.logobanner}
              resizeMode="contain"
              className="w-[92%] h-[100%] rounded-3xl"
            />
            <TouchableRipple
              className="rounded-full p-1 absolute top-3 right-8 z-10"
              borderless
              style={{backgroundColor: '#E9EDF599'}}
              onPress={handleFavToggle}>
              <Image
                source={isFav ? images.heart_fill : images.heart}
                style={{width: 28, height: 28}}
              />
            </TouchableRipple>
          </View>
        }
      />

      <View className="flex-row justify-center items-center my-2">
        {imageList?.map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 m-1 rounded-full ${
              index === activeIndex
                ? 'bg-[#1F4B99]'
                : 'bg-transparent border-2 border-[#1F4B99]'
            } border`}
          />
        ))}
      </View>
    </View>
  );
}
