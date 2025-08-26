import {View, Text, KeyboardAvoidingView, Platform} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Button, HelperText, Surface, TextInput} from 'react-native-paper';
import MyAppBar from '../../utils/components/appBar';
import {ScrollView} from 'react-native-gesture-handler';
import {Dropdown} from 'react-native-element-dropdown';
import {
  addInquiryService,
  getInquiryTypeListService,
} from '../../services/inquiry_service';
import {Toast} from 'react-native-toast-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useForeground} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';

export default function InquiryAdd({navigation}) {
  const [inquiryTypeList, setInquiryTypeList] = useState([]);
  const [seletedType, setSelectedType] = useState([]);
  const [typeError, setTypeError] = useState(false);

  const [inquirySubject, setInquirySubject] = useState('');
  const [subjectError, setSubjectError] = useState(false);

  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  useEffect(() => {
    getInquiryType();
  }, []);

  const getInquiryType = async () => {
    try {
      await getInquiryTypeListService()
        .then(res => {
          const response = res.data;

          console.log('response', response);

          var temp = [];

          for (let i = 0; i < response.length; i++) {
            temp.push({
              label: response[i].inquiry_type,
              value: response[i].inquiry_type_id,
              note: response[i].inquiry_note,
            });
          }
          setInquiryTypeList(temp);
        })
        .catch(error => {
          console.log('error', error);
        });
    } catch (error) {
      console.log('error', error);
    }
  };

  const addInquiry = async () => {
    try {
      const customer_id = await AsyncStorage.getItem('customer_id');
      const data = {
        customer_id: customer_id,
        inquiry_type_id: seletedType.value,
        inquiry_description: inquirySubject,
      };
      const response = await addInquiryService(data);

      console.log('response', response);

      if (response && response.success) {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Success'},
        });

        setInquirySubject('');
        setSelectedType([]);

        navigation.goBack();
      }
    } catch (error) {
      console.log('error', error);
      Toast.show('Something went wrong. Please try again', {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Surface mode="flat" className="flex-1 h-full bg-white">
        <MyAppBar title={'Create a new inquiry'} />

        <ScrollView
          contentContainerStyle={{
            alignItems: 'center',
            paddingBottom: 20,
          }}>
          <View className="items-center">
            <Dropdown
              data={inquiryTypeList}
              labelField="label"
              valueField="value"
              placeholder="Select inquiry type"
              mode="default"
              itemTextStyle={{color: 'black'}}
              placeholderStyle={{color: 'black'}}
              selectedTextStyle={{color: 'black'}}
              value={seletedType}
              className="w-80 h-11 px-4 rounded-lg mt-5"
              style={{
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: typeError ? 'red' : '#6BB14F',
                elevation: 3,
                shadowColor: '#6BB14F',
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.7,
                shadowRadius: 1.41,
              }}
              itemContainerStyle={{
                borderRadius: 10,
              }}
              containerStyle={{
                borderRadius: 10,
                marginTop: 2,
              }}
              onChange={item => {
                setSelectedType(item);
              }}
              fontFamily="Exo2-Medium"
            />

            {typeError && (
              <HelperText
                className="self-start"
                type="error"
                variant="bodyMedium">
                Required
              </HelperText>
            )}

            {seletedType.note && (
              <HelperText
                className="self-start mt-2"
                type="info"
                variant="bodyMedium"
                visible={true}>
                {seletedType.note}
              </HelperText>
            )}

            <TextInput
              label="Description"
              mode="outlined"
              className="w-80 mt-5"
              contentStyle={{height: 200}}
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
              value={inquirySubject}
              onChangeText={text => {
                setInquirySubject(text);
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

            <Button
              mode="contained"
              className="w-[80%] mt-8"
              onPress={() => {
                if (seletedType.length === 0) {
                  setTypeError(true);
                } else {
                  setTypeError(false);
                }
                if (inquirySubject === '') {
                  setSubjectError(true);
                } else {
                  setSubjectError(false);
                }

                if (seletedType.length !== 0 && inquirySubject !== '') {
                  addInquiry();
                }
              }}>
              Create
            </Button>
          </View>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  );
}
