import {View, Text, Image} from 'react-native';
import React from 'react';
import {Appbar, IconButton} from 'react-native-paper';
import {images} from '../../assets/images/images';
import {useNavigation} from '@react-navigation/native';

export default function MyAppBar({title}) {
  const navigation = useNavigation();
  return (
    <Appbar className="bg-transparent" mode="center-aligned">
      <IconButton
        icon={() => <Image source={images.back} className="w-6 h-6" />}
        onPress={() => navigation.goBack()}
      />
      <Appbar.Content title={title} />
    </Appbar>
  );
}
