import {View} from 'react-native';
import React from 'react';
import {Surface, Text} from 'react-native-paper';

export default function SoonScreen() {
  return (
    <Surface
      mode="flat"
      className="flex-1 items-center justify-center bg-[#E9EDF5]">
      <Text variant="headlineLarge" className="text-center">
        This screen will be available soon.
      </Text>
    </Surface>
  );
}
