import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  Keyboard,
  StatusBar,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Dialog,
  HelperText,
  IconButton,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import {images} from '../../assets/images/images';
import {FlatList, RefreshControl} from 'react-native-gesture-handler';
import Animated, {FadeIn, FadeInDown, FadeOut} from 'react-native-reanimated';
import moment from 'moment';
import {add} from 'date-fns';
import {
  addInquiryNoteService,
  closeInquiryService,
  getInquiryListService,
} from '../../services/inquiry_service';
import {Toast} from 'react-native-toast-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setIn} from 'formik';
import Loading from '../../utils/components/loading';
import {useNavigation} from '@react-navigation/native';
import {
  AdEventType,
  InterstitialAd,
  useForeground,
} from 'react-native-google-mobile-ads';
import {getWindowHeight, isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';
import {interstitialAdUnitId} from '../../utils/constant';
import {initInnterstitialAd} from '../../utils/interstitial_ad_init';

export default function InquiryList() {
  const navigation = useNavigation();
  const [inquiryList, setInquiryList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogData, setDialogData] = useState({});
  const [closeInquiryDialog, setCloseInquiryDialog] = useState(false);

  const [noteDialogVisible, setNoteDialogVisible] = useState(false);
  const [inquiryNote, setInquiryNote] = useState('');

  const [subjectError, setSubjectError] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('focus');
      getInquiryList();
    });

    return unsubscribe;
  }, [navigation]);

  const getInquiryList = async () => {
    try {
      let customer_id = await AsyncStorage.getItem('customer_id');

      await getInquiryListService(customer_id)
        .then(response => {
          setRefreshing(false);
          setInquiryList(response.data);
        })
        .catch(error => {
          setRefreshing(false);
          console.log('error', error);
        });
    } catch (error) {
      setRefreshing(false);
      console.log('error', error);
    }
  };

  const addInquiryNote = async () => {
    try {
      const data = {
        customer_inquiry_id: dialogData.customer_inquiry_id,
        inquiry_note_customer: inquiryNote,
      };

      const response = await addInquiryNoteService(data);

      console.log('response', response);

      if (response && response.success) {
        setNoteDialogVisible(false);
        setInquiryNote('');
        setDialogData({});

        getInquiryList();

        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Success'},
        });
      }
    } catch (error) {
      Toast.show('Something went wrong. Please try again', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  const closeInquiry = async () => {
    try {
      const data = {
        customer_inquiry_id: dialogData.customer_inquiry_id,
      };
      const response = await closeInquiryService(data);

      console.log('response', response);

      if (response && response.success) {
        setCloseInquiryDialog(false);
        setDialogData({});
        getInquiryList();
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Success'},
        });
      }
    } catch (error) {
      Toast.show('Something went wrong. Please try again', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  return (
    <Surface mode="flat" className="flex-1 h-full bg-white">
      <Appbar className="bg-transparent" mode="center-aligned">
        <IconButton
          icon={() => <Image source={images.back} className="w-6 h-6" />}
          onPress={() => navigation.goBack()}
        />
        <Appbar.Content title={'My Inquiries'} />

        <Appbar.Action
          icon="plus"
          onPress={() => {
            navigation.navigate('InquiryAdd');
          }}
        />
      </Appbar>

      <FlatList
        data={inquiryList}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={getInquiryList} />
        }
        contentContainerStyle={{padding: 20}}
        ListEmptyComponent={
          <View
            style={{height: getWindowHeight() - 200}}
            className="flex-1  items-center justify-center mx-5">
            <Text variant="bodyLarge" className="text-center text-lg">
              You currently don't have any inquires. Please add a new inquiry to
              get started.
            </Text>
          </View>
        }
        renderItem={({item}) => {
          return (
            <Animated.View
              entering={FadeInDown}
              needsOffscreenAlphaCompositing
              className="mb-5">
              <Card
                onPress={() => {
                  setDialogVisible(true);
                  setDialogData(item);
                }}>
                <View className="w-20 bg-[#6BB14F] rounded-tl-lg rounded-tr-sm rounded-br-sm">
                  <Text
                    variant="labelSmall"
                    className="capitalize p-1 text-center text-white">
                    {item.inquiry_type}
                  </Text>
                </View>
                <View className="px-2 pb-2 pt-1 flex-row justify-between items-start">
                  <View className=" w-full">
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      variant="titleMedium">
                      {item.inquiry_description}
                    </Text>
                    <View className="flex-row justify-between mt-2">
                      <Text variant="labelMedium">{item.add_dt}</Text>

                      <Text variant="labelSmall">
                        Status: {item.inquiry_status_customer}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            </Animated.View>
          );
        }}
      />
      {ViewDialog()}
      {AddNoteDialog()}
      {CloseDialog()}
    </Surface>
  );

  function CloseDialog() {
    return (
      <Dialog
        visible={closeInquiryDialog}
        onDismiss={() => setCloseInquiryDialog(false)}>
        <Dialog.Title>Close Inquiry</Dialog.Title>
        <Dialog.Content>
          <Text>Are you sure you want to close this inquiry?</Text>
        </Dialog.Content>

        <Dialog.Actions>
          <Button
            onPress={() => {
              setCloseInquiryDialog(false);
            }}>
            No
          </Button>
          <Button
            textColor="#E31E24"
            onPress={() => {
              setCloseInquiryDialog(false);
              closeInquiry();
            }}>
            Yes
          </Button>
        </Dialog.Actions>
      </Dialog>
    );
  }

  function AddNoteDialog() {
    return (
      <Dialog
        dismissable={false}
        visible={noteDialogVisible}
        onDismiss={() => setNoteDialogVisible(false)}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}>
          <View>
            <Dialog.Title>Add Note</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Note"
                mode="outlined"
                contentStyle={{height: 80}}
                maxLength={500}
                outlineStyle={{
                  elevation: 3,
                  borderRadius: 10,
                  shadowColor: '#6BB14F',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.7,
                  shadowRadius: 1.41,
                }}
                keyboardType="default"
                multiline={true}
                value={inquiryNote}
                onChangeText={text => {
                  setInquiryNote(text);
                }}
                error={subjectError}
              />

              {subjectError && (
                <HelperText
                  className="self-start"
                  type="error"
                  variant="bodyMedium">
                  Required
                </HelperText>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => {
                  if (inquiryNote === '' || inquiryNote === null) {
                    setSubjectError(true);
                  } else {
                    setSubjectError(false);
                    addInquiryNote();
                  }
                }}>
                Add
              </Button>
              <Button
                textColor="#E31E24"
                onPress={() => {
                  setNoteDialogVisible(false);
                  setSubjectError(false);
                }}>
                Cancel
              </Button>
            </Dialog.Actions>
          </View>
        </TouchableWithoutFeedback>
      </Dialog>
    );
  }

  function ViewDialog() {
    return (
      <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
        <Dialog.Title>{dialogData.inquiry_type}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{dialogData.inquiry_description}</Text>
          {dialogData.inquiry_note_customer !== null ? (
            <>
              <Text variant="bodyLarge" className="mt-2">
                Note
              </Text>
              <Text variant="bodyMedium">
                {dialogData.inquiry_note_customer}
              </Text>
            </>
          ) : null}
        </Dialog.Content>
        {dialogData.inquiry_status_customer === 'Closed' ? null : (
          <Dialog.Actions>
            <Button
              onPress={() => {
                setDialogVisible(false);
                setNoteDialogVisible(true);
                setInquiryNote(dialogData.inquiry_note_customer);
              }}>
              {dialogData.inquiry_note_customer === null
                ? 'Add Note'
                : 'Update Note'}
            </Button>
            <Button
              textColor="#E31E24"
              onPress={() => {
                setDialogVisible(false);
                setCloseInquiryDialog(true);
              }}>
              Close Inquiry
            </Button>
          </Dialog.Actions>
        )}
      </Dialog>
    );
  }
}
