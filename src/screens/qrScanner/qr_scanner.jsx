import {View, useWindowDimensions} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Text} from 'react-native-paper';

import MyAppBar from '../../utils/components/appBar';
import {Toast} from 'react-native-toast-notifications';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import {RNHoleView} from 'react-native-hole-view';
import {getQrData} from '../../services/qr_scanner_service';

export default function QrScanner({navigation}) {
  const onSuccess = async data => {
    console.log(data);
    if (data.includes('http://') || data.includes('https://')) {
      navigation.goBack();
      Toast.show('QR Code is not valid', {
        type: 'custom_toast',
        data: {title: 'Invalid QR Code'},
      });
    } else {
      let scanData = typeof data === 'string' ? data : data.toString();

      console.log('scanData', typeof scanData);
      console.log('scanData', scanData);

      await getQrData(scanData)
        .then(data => {
          if (data === null || data === undefined || data.length === 0) {
            Toast.show('Sorry', {
              type: 'custom_toast',
              data: {title: 'Station Not found on this QR Code'},
            });
          } else {
            let param = {
              stationInfoData: data[0],
              station_id:
                data[0].chargerSelectedData[0].selected_connectors[0]
                  .station_id,
              station_charger_id:
                data[0].chargerSelectedData[0].station_charger_id,
              station_charger_connector_id:
                data[0].chargerSelectedData[0].selected_connectors[0]
                  .station_charger_connector_id,
            };
            navigation.replace('ChargerInfo', param);
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  return (
    <View className="flex-1">
      <MyAppBar title={'QR Scanner'} />

      <QRCodeScanner
        onRead={({data}) => onSuccess(data)}
        flashMode={RNCamera.Constants.FlashMode.auto}
        cameraStyle={{height: '100%'}}
        fadeIn={true}
      />

      <RNHoleView
        style={{
          position: 'absolute',
          width: '100%',
          height: '92%',
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
        holes={[
          {
            borderRadius: 10,
            width: useWindowDimensions().width * 0.72,
            height: useWindowDimensions().height * 0.34,
            x: useWindowDimensions().width * 0.14,
            y: useWindowDimensions().height * 0.24,
          },
        ]}></RNHoleView>
    </View>
  );
}
