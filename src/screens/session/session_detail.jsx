import {Image, Linking, PermissionsAndroid, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Button, Modal, Text} from 'react-native-paper';
import MyAppBar from '../../utils/components/appBar';
import {sessionDetailService} from '../../services/session_service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RefreshControl, ScrollView} from 'react-native-gesture-handler';
import moment from 'moment';
import {images} from '../../assets/images/images';
import ReactNativeBlobUtil from 'react-native-blob-util';

import {Toast} from 'react-native-toast-notifications';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  SlideInDown,
} from 'react-native-reanimated';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {Platform} from 'react-native';
import Loading from '../../utils/components/loading';
import {
  getApiLevel,
  getApiLevelSync,
  getDeviceId,
  getDeviceType,
  getSystemVersion,
} from 'react-native-device-info';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {useForeground} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';

export default function SessionDetail({navigation, route}) {
  const {id} = route.params;
  const [sessionData, setsessionData] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStart, setDownloadStart] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sgst, setSgst] = useState(0);
  const [cgst, setCgst] = useState(0);

  const [genPdf, setGenPdf] = useState(false);
  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  const fetchDetail = async () => {
    setIsLoading(true);
    let customer_id = await AsyncStorage.getItem('customer_id');
    sessionDetailService(id, customer_id)
      .then(response => {
        setsessionData(response.data);

        console.log(response.data);

        let sgstPercent = response.data.sgst;
        let cgstPercent = response.data.cgst;
        setSgst((response.data.total_charging_amount * sgstPercent) / 100);
        setCgst((response.data.total_charging_amount * cgstPercent) / 100);

        setIsRefreshing(false);
        setIsLoading(false);

        getPermission();
      })
      .catch(error => {
        setIsRefreshing(false);
        setIsLoading(false);
        console.log('error: ', error);
      });
  };

  useEffect(() => {
    fetchDetail();

    return () => {};
  }, []);

  const getPermission = async () => {
    const Device_api = getSystemVersion();

    if (Platform.OS === 'ios' || Device_api >= 13) {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      ])
        .then(async () => {})
        .catch(error => {
          console.log(error);
        });
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        } else {
          console.log('please grant permission');
        }
      } catch (err) {
        console.log('display error', err);
      }
    }
  };

  if (isLoading) {
    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        needsOffscreenAlphaCompositing={true}
        className="flex-1 items-center justify-center">
        <Loading visible={isLoading} />
      </Animated.View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <MyAppBar title={'Session Details'} />

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchDetail} />
        }
        contentContainerStyle={{paddingBottom: 20}}>
        <View className="mt-2">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text variant="bodyLarge" className="text-lg">
                Station Name
              </Text>
              <Text variant="bodyLarge" className="mt-2 text-gray-600">
                {sessionData.station_name}
              </Text>
            </View>
            <Image source={images.logo} className="h-20 w-20" />
          </View>

          <Text variant="bodyLarge" className="mt-4 text-lg">
            Station Address
          </Text>
          <Text variant="bodyLarge" className="mt-2 text-gray-600">
            {sessionData.station_address_one} {sessionData.station_address_two}{' '}
            {sessionData.station_address_landmark} {sessionData.pin_code}{' '}
            {sessionData.location_name} {sessionData.country_name}{' '}
            {sessionData.state_name} {sessionData.city_name}
          </Text>

          <View className="mt-4 flex-row items-center justify-between">
            <Text variant="bodyLarge" className="text-lg">
              Charger
            </Text>

            <Text variant="bodyLarge" className="mt-2 text-gray-600">
              {sessionData.charger_name}
            </Text>
          </View>
          <View className="mt-4 flex-row items-center justify-between">
            <Text variant="bodyLarge" className="text-lg">
              Connector
            </Text>

            <Text variant="bodyLarge" className="mt-2 text-gray-600">
              {sessionData.connector_name}
            </Text>
          </View>
          <View className="mt-4 flex-row items-center justify-between">
            <Text variant="bodyLarge" className="text-lg">
              Date
            </Text>

            <Text variant="bodyLarge" className="mt-2 text-gray-600">
              {sessionData.charging_date}
            </Text>
          </View>
          <View className="mt-4 flex-row items-center justify-between">
            <Text variant="bodyLarge" className="text-lg">
              Charging Type
            </Text>

            <Text variant="bodyLarge" className="mt-2 text-gray-600">
              {sessionData.charging_method_type}
            </Text>
          </View>
          <View className="mt-4 flex-row items-center justify-between">
            <Text variant="bodyLarge" className="text-lg">
              Unit Consumed
            </Text>

            <Text variant="bodyLarge" className="mt-2 text-gray-600">
              {sessionData.actual_energy ?? 0}
            </Text>
          </View>
          <View className="mt-4 flex-row items-center justify-between">
            <Text variant="bodyLarge" className="text-lg">
              Charging Charges
            </Text>

            <Text variant="bodyLarge" className="mt-2 text-gray-600">
              {sessionData.charger_charges}
            </Text>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <Text variant="bodyLarge" className="text-lg">
              Amount
            </Text>

            <Text variant="bodyLarge" className="mt-2 text-gray-600">
              {sessionData.total_charging_amount ?? 0}
            </Text>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <Text variant="bodyLarge" className="text-lg">
              SGST {sessionData.sgst}%
            </Text>

            <Text variant="bodyLarge" className="mt-2 text-gray-600">
              {sgst}
            </Text>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <Text variant="bodyLarge" className="text-lg">
              CGST {sessionData.cgst}%
            </Text>

            <Text variant="bodyLarge" className="mt-2 text-gray-600">
              {cgst}
            </Text>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <Text variant="bodyLarge" className="text-lg">
              Total Amount
            </Text>

            <Text variant="bodyLarge" className="mt-2 text-gray-600">
              {sessionData.total_amount ?? 0}
            </Text>
          </View>

          <View className="mt-4">
            <Text variant="bodyLarge" className="text-lg ">
              Customer Detail
            </Text>
            <Text variant="bodyLarge" className="mt-2 text-gray-600">
              {sessionData.customer_first_name} {sessionData.customer_last_name}
            </Text>
            <Text variant="bodyLarge" className="mt-2 text-gray-600">
              {sessionData.customer_mail_id}
            </Text>
            <Text variant="bodyLarge" className="mt-2 text-gray-600">
              {sessionData.customer_mobile_no}
            </Text>
          </View>
        </View>
        <Button
          disabled={
            // sessionData.transaction_status === 'Hold' ||
            // sessionData.transaction_status === 'Failed' ||
            sessionData.actual_energy <= 0 || sessionData.actual_energy === null
              ? true
              : false
          }
          loading={genPdf}
          onPress={async () => {
            await pdfDownloadFun();
          }}
          mode="contained"
          className="mt-4"
          icon={'download'}>
          <Text className="text-white">Download Invoice</Text>
        </Button>
      </ScrollView>
      {downloadStart && (
        <Animated.View
          className="absolute left-5 right-5 bottom-2"
          exiting={FadeOutUp}
          entering={FadeInDown}>
          <View
            style={{
              flex: 1,
              borderStartWidth: 6,
              borderRadius: 10,
              height: 55,
              padding: 10,
              backgroundColor: 'white',
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.23,
              shadowRadius: 2.62,
              justifyContent: 'center',
            }}>
            <Text variant="labelLarge">
              Download Progress: {Math.round(downloadProgress * 100)}%,
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );

  async function pdfDownloadFun() {
    setGenPdf(true);
    await createPDF()
      .then(async path => {
        setTimeout(() => {
          setGenPdf(false);
        }, 200);

        if (Platform.OS === 'ios') {
          Toast.show('Invoice is Downloaded', {
            type: 'custom_toast',
            data: {
              title: 'Download Completed',
            },
            duration: 2000,
          });
          setTimeout(() => {
            ReactNativeBlobUtil.ios.previewDocument(path);
          }, 400);
        }
        if (Platform.OS === 'android') {
          Toast.show('Invoice is Downloaded at device Document folder', {
            type: 'custom_toast',
            data: {
              title: 'Download Completed',
            },
            duration: 2000,
          });
          setTimeout(() => {
            ReactNativeBlobUtil.android.actionViewIntent(
              path,
              'application/pdf',
            );
          }, 400);
        }
      })
      .catch(err => {
        setTimeout(() => {
          setGenPdf(false);
        }, 200);
        console.log(err);
      });
  }

  async function createPDF() {
    let htmlString = `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0;">
    <section style="padding: 20px; max-width: 800px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <div style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
            <a href="#!" style="display: block; text-align: right;">
                <img src="https://thevchargify.com/wp-content/uploads/2024/12/ev_logo.png" alt="Logo" style="width: 180px; height: auto;">
            </a>
        </div>
        <div>
            <h4 style="font-size: 1.5rem; margin: 0 0 10px; display: flex; justify-content: space-between;">
                <span>Invoice</span>
                <span>#${sessionData.transaction_id}</span>
            </h4>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Invoice Date</span>
                <span>${moment(sessionData.add_dt).format(
                  'DD-MM-YYYY hh:mm',
                )}</span>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
                <div>
                <h4 style="font-size: 1.25rem;  margin-bottom: 10px;">From</h4>
                <address style="line-height: 1.6;">
                    <strong>AcmeECS Infra Pvt Ltd</strong><br>
                    AcmeECS Infra Pvt Ltd (EV Chargify) PAP-R-16,<br>
                    Near R-625 & R-624, Rabale, MIDC, TTC.,<br>
                    Navi Mumbai - 400 701.<br>
                    <strong>Phone:</strong> (+91) 9967567505<br>
                    <strong>Email:</strong> support@thevchargify.com<br>
                    <strong>GSTIN/UIN:</strong> ${sessionData.gstin_uni}<br>
                    <strong>CIN:</strong> ${
                      sessionData.cin
                    } <strong>Code:</strong> ${sessionData.state_code}<br>
                    <strong>HSN/SAC:</strong> ${sessionData.hsn_sac}<br>
                </address>
            </div>
            <div>
                <h4 style="font-size: 1.25rem;  margin-bottom: 10px;">Bill To</h4>
                <address style="line-height: 1.6;">
                    <strong>${sessionData.customer_first_name}</strong><br>
                    <strong>Phone:</strong> (+91) ${
                      sessionData.customer_mobile_no
                    }<br>
                    <strong>Email:</strong> ${sessionData.customer_mail_id}<br>
                    <strong>GST:</strong> ${sessionData.customer_gst}
                </address>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">

            <div>
                <h4 style="font-size: 1.25rem;  margin-bottom: 10px;">Session Details</h4>
                <address style="line-height: 1.6;">
                    <strong>Start Time:</strong> ${sessionData.start_dt}<br>
                    <strong>End Time:</strong> ${sessionData.end_dt}<br>
                    <strong>Charging Duration:</strong> ${
                      sessionData.time_consumed
                    }<br>
                </address>
            </div>
            <div>
                <h4 style="font-size: 1.25rem;  margin-bottom: 10px;">Station Details</h4>
                <address style="line-height: 1.6;">
                    <strong>Location:</strong> ${sessionData.station_name}<br>
                    <strong>Charger:</strong> ${sessionData.charger_name}<br>
                    <strong>Connector:</strong> ${
                      sessionData.connector_name
                    }<br>
                </address>
            </div>

        </div>
        
        <div style="margin-bottom: 20px;">
            <h4 style="font-size: 1.25rem; margin-bottom: 10px;">Calculation Details:</h4>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Unit Consumed:</span>
                <span>${sessionData.actual_energy} (kWh)</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Charging Charges:</span>
                <span>${sessionData.charger_charges} (INR)</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Amount:</span>
                <span>${sessionData.total_charging_amount} (INR)</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>SGST ${sessionData.sgst}%</span>
                <span>${sgst} (INR)</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>CGST ${sessionData.cgst}%</span>
                <span>${cgst} (INR)</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <span>Total Amount</span>
                <span>${sessionData.total_amount} (INR)</span>
            </div>
        </div>
        <div style="margin-top: 20px;">
            <h6 style="margin: 0.5rem 0; font-size: 0.875rem;">This is a computer-generated invoice. No signature required.</h6>
            <h6 style="margin: 0.5rem 0; font-size: 0.875rem;">Thank you for using 'EV Chargify' service</h6>
            <h6 style="margin: 0.5rem 0; font-size: 0.875rem;">For any disputes, please contact us via email at support@thevchargify.com or call our helpline at +91 9967567505</h6>
        </div>
    </section>
</body>
</html>

    `;

    let options = {
      html: htmlString,
      fileName: `Invoice${sessionData.transaction_id}--${moment().format(
        'hh-mm-ss',
      )}`,
      directory: 'Documents',
    };

    let file = await RNHTMLtoPDF.convert(options);

    return file.filePath;
  }
}
