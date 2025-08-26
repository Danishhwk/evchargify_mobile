import React from 'react';
import {ActivityIndicator, Dialog, Text} from 'react-native-paper';

export default function Loading({visible}) {
  return (
    <Dialog
      visible={visible}
      dismissable={false}
      className="rounded-2xl self-center justify-between items-center">
      <Dialog.Content>
        <ActivityIndicator size="small" />
        <Text variant="labelMedium" className="text-center mt-3">
          Loading...
        </Text>
      </Dialog.Content>
    </Dialog>
  );
}
