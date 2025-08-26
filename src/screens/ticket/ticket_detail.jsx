import React, {useEffect, useRef, useState} from 'react';
import {
  Button,
  Dialog,
  Divider,
  Modal,
  Surface,
  Text,
} from 'react-native-paper';
import MyAppBar from '../../utils/components/appBar';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import {Image, View} from 'react-native';
import moment from 'moment';
import {images} from '../../assets/images/images';
import {ImageZoom} from '@likashefqet/react-native-image-zoom';
import Pdf from 'react-native-pdf';
import {updateTicketStatusService} from '../../services/ticket_service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Toast} from 'react-native-toast-notifications';
import {useForeground} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';

export default function TicketDetail({navigation, route}) {
  const [showModal, setShowModal] = useState(false);
  const [isImage1, setIsImage1] = useState(false);
  const [isImage2, setIsImage2] = useState(false);
  const imageUrl =
    'http://stage.tritanev.com:3006/uploads/station/IMG-20240724-WA0000.jpg';

  const pdfUrl =
    'http://stage.tritanev.com:3006/uploads/station/Invoice202406211449012000--01-45-17.pdf.pdf';
  const {ticket} = route.params;

  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);

  const [b1, setB1] = useState(false);
  const [b2, setB2] = useState(false);

  const [closeDialog, setCloseDialog] = useState(false);

  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  useEffect(() => {
    if (!ticket.image1.includes('null')) {
      if (ticket.image1.includes('jpg') || ticket.image1.includes('png')) {
        setIsImage1(true);
        setFile1(ticket.image1);
      } else {
        setIsImage1(false);
        setFile1(ticket.image1);
      }
    }

    if (!ticket.image2.includes('null')) {
      if (ticket.image2.includes('jpg') || ticket.image2.includes('png')) {
        setIsImage2(true);
        setFile2(ticket.image2);
      } else {
        setIsImage2(false);
        setFile2(ticket.image2);
      }
    }
  }, []);

  const closeTicker = async () => {
    const data = {
      ticket_id: ticket.ticket_id,
      customer_id: await AsyncStorage.getItem('customer_id'),
    };
    try {
      await updateTicketStatusService(data)
        .then(response => {
          console.log('response', response);
          if (response && response.success) {
            Toast.show('Ticket closed', {
              type: 'custom_toast',
              data: {title: 'Success'},
            });
            navigation.goBack();
          }
        })
        .catch(error => {
          Toast.show('Something went wrong. Please try again', {
            type: 'custom_toast',
            data: {title: 'Error'},
          });
          console.log('error', error);
        });
    } catch (error) {
      console.log('error', error);
      Toast.show('Something went wrong. Please try again', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  return (
    <Surface mode="flat" className="flex-1 h-full bg-white">
      <MyAppBar title={'Ticket Detail'} />
      <ScrollView contentContainerStyle={{padding: 20}}>
        <Text variant="titleLarge">{ticket.ticket_title}</Text>
        <View className="flex-1 flex-row justify-between mt-4">
          <Text className="capitalize" variant="bodyMedium">
            Category: {ticket.category_name}
          </Text>
          <Text variant="bodyMedium">Ticket ID: {ticket.ticket_id}</Text>
        </View>
        <Text className="mt-5" variant="bodyMedium">
          Created on: {moment(ticket.add_dt).format('LLL')}
        </Text>

        <View className="flex-1 flex-row justify-between mt-4">
          <Text className="capitalize" variant="bodyMedium">
            Admin Status {ticket.ticket_status}
          </Text>
          <Text variant="bodyMedium">
            Customer Status: {ticket.customer_status}
          </Text>
        </View>

        <Divider bold className="my-5" horizontalInset />

        <Text variant="bodyLarge">{ticket.description}</Text>

        <View className="flex-1 flex-row justify-evenly mt-5 items-center ">
          {file1 == null ? null : (
            <TouchableOpacity
              className="h-52 w-52 items-center justify-center"
              onPress={() => {
                setShowModal(true);
                setB1(true);
              }}>
              <Image
                source={isImage1 ? {uri: file1} : images.pdf}
                className="h-48 w-48"
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}

          {file2 == null ? null : (
            <TouchableOpacity
              className="h-52 w-52 items-center justify-center"
              onPress={() => {
                setShowModal(true);
                setB2(true);
              }}>
              <Image
                source={isImage2 ? {uri: file2} : images.pdf}
                className="h-48 w-48"
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>

        {ticket.customer_status == 'Closed' ? null : (
          <Button
            mode="contained"
            className="w-full bg-[#6BB14F] mb-2 rounded-full mt-20"
            onPress={() => {
              setCloseDialog(true);
            }}>
            <Text variant="bodyLarge" className="text-white">
              Close Ticket
            </Text>
          </Button>
        )}
      </ScrollView>

      <Dialog visible={closeDialog} onDismiss={() => setCloseDialog(false)}>
        <Dialog.Content>
          <Text variant="titleLarge">Do you want to close the ticket?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={() => {
              setCloseDialog(false);
            }}>
            Cancel
          </Button>
          <Button
            onPress={() => {
              setCloseDialog(false);
              closeTicker();
            }}>
            Close
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Modal
        dismissable={true}
        onDismiss={() => {
          setShowModal(false);
          setB1(false);
          setB2(false);
        }}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: 20,
          borderRadius: 15,
        }}
        visible={showModal}>
        <View className="h-full w-full p-5">
          {(() => {
            if (b1) {
              if (isImage1) {
                console.log('b1 image1');
                return <ImageZoom uri={file1} />;
              } else {
                return (
                  <Pdf
                    source={{uri: file1}}
                    trustAllCerts={false}
                    style={{flex: 1}}
                  />
                );
              }
            } else if (b2) {
              if (isImage2) {
                console.log('b2 image2');
                return <ImageZoom uri={file2} />;
              } else {
                return (
                  <Pdf
                    source={{uri: file2}}
                    trustAllCerts={false}
                    style={{flex: 1}}
                  />
                );
              }
            }
          })()}
        </View>
      </Modal>
    </Surface>
  );
}
