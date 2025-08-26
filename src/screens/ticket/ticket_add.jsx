import {Formik} from 'formik';
import React, {useEffect, useRef, useState} from 'react';
import {Image, View} from 'react-native';
import DocumentPicker, {types} from 'react-native-document-picker';
import {Dropdown} from 'react-native-element-dropdown';
import {ScrollView} from 'react-native-gesture-handler';
import {
  Button,
  Card,
  HelperText,
  Icon,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import * as Yup from 'yup';
import MyAppBar from '../../utils/components/appBar';
import {images} from '../../assets/images/images';
import {
  addTicketService,
  getTicketCategoryService,
} from '../../services/ticket_service';
import {Toast} from 'react-native-toast-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useForeground} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';

export default function TicketAdd({navigation}) {
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCat, setSelectedCat] = useState([]);
  const [catError, setCatError] = useState(false);
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);

  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  useEffect(() => {
    getTicketCategory();
  }, []);

  const initialValues = {
    title: '',
    description: '',
  };

  const onValidation = () =>
    Yup.object().shape({
      title: Yup.string().required('Required'),
      description: Yup.string().required('Required'),
    });

  const onSubmit = async (value, {resetForm}) => {
    try {
      const data = new FormData();

      data.append('customer_id', await AsyncStorage.getItem('customer_id'));
      data.append('ticket_title', value.title);
      data.append('description', value.description);
      data.append('category_id', selectedCat.value);
      data.append('image1', file1);
      data.append('image2', file2);

      const response = await addTicketService(data);
      console.log('response', response);
      if (response && response.success) {
        Toast.show(response.message, {
          type: 'custom_toast',
          data: {title: 'Success'},
        });
        resetForm();
        setFile1(null);
        setFile2(null);
        setSelectedCat([]);
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

  const pickFile = () => {
    try {
      DocumentPicker.pickSingle({
        type: [types.images, types.pdf],
      })
        .then(response => {
          if (file1 == null) {
            setFile1(response);
          } else if (file2 == null) {
            setFile2(response);
          }
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const getTicketCategory = async () => {
    try {
      await getTicketCategoryService()
        .then(res => {
          const response = res.data;

          var temp = [];

          for (let i = 0; i < response.length; i++) {
            temp.push({
              label: response[i].category_name,
              value: response[i].ticket_category_id,
              note: response[i].category_note,
            });
          }
          setCategoryList(temp);
        })
        .catch(error => {
          console.log('error', error);
        });
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <Surface mode="flat" className="flex-1 h-full bg-white">
      <MyAppBar title={'Create a Ticket'} />

      <ScrollView
        contentContainerStyle={{alignItems: 'center', paddingBottom: 20}}>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={onValidation}
          onSubmit={onSubmit}>
          {({handleChange, handleSubmit, values, errors, touched}) => (
            <View className="items-center">
              <Dropdown
                data={categoryList}
                labelField="label"
                valueField="value"
                placeholder="Select Category"
                mode="default"
                itemTextStyle={{color: 'black'}}
                placeholderStyle={{color: 'black'}}
                selectedTextStyle={{color: 'black'}}
                value={selectedCat}
                className="w-80 h-11 px-4 rounded-lg mt-5"
                style={{
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: catError ? 'red' : '#6BB14F',
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
                  setSelectedCat(item);
                }}
                fontFamily="Exo2-Medium"
              />

              {catError && (
                <HelperText
                  className="self-start"
                  type="error"
                  variant="bodyMedium">
                  Required
                </HelperText>
              )}

              {selectedCat.note && (
                <HelperText
                  className="self-start w-80"
                  type="info"
                  variant="bodyMedium">
                  {selectedCat.note}
                </HelperText>
              )}

              <TextInput
                label="Title"
                mode="outlined"
                className="w-80 h-10 mt-5"
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
                value={values.title}
                onChangeText={handleChange('title')}
                error={errors.title && touched.title}
              />

              {errors.title && touched.title && (
                <HelperText
                  className="self-start"
                  type="error"
                  variant="bodyMedium">
                  {errors.title}
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
                value={values.description}
                onChangeText={handleChange('description')}
                error={errors.description && touched.description}
              />

              <View className="flex-row w-80 items-center justify-between">
                {errors.description && touched.description && (
                  <HelperText
                    className="self-start"
                    type="error"
                    variant="bodyMedium">
                    {errors.description}
                  </HelperText>
                )}
                {!errors.description && <View className="w-1 h-7" />}
                <Text className="text-gray-500" variant="labelSmall">
                  {values.description.length}/500
                </Text>
              </View>

              <View className="mt-5 items-start w-80">
                <Text variant="labelLarge">Attactments</Text>

                <View className="mt-3 flex-row">
                  {file1 != null && (
                    <Card className="rounded-xl w-28 h-28 items-center justify-center overflow-hidden mr-5">
                      <Image
                        source={
                          file1.type.includes('pdf')
                            ? images.pdf
                            : {uri: file1.uri}
                        }
                        className="w-28 h-28"
                        resizeMode="cover"
                      />
                    </Card>
                  )}

                  {file2 != null && (
                    <Card className="rounded-xl w-28 h-28 items-center justify-center overflow-hidden mr-5">
                      <Image
                        source={
                          file2.type.includes('pdf')
                            ? images.pdf
                            : {uri: file2.uri}
                        }
                        className="w-28 h-28"
                        resizeMode="cover"
                      />
                    </Card>
                  )}

                  {file2 === null && (
                    <Card
                      onPress={() => {
                        pickFile();
                      }}
                      className="rounded-xl w-28 h-28 items-center justify-center">
                      <Icon source={'plus'} size={60} color="#6BB14F" />
                    </Card>
                  )}
                </View>
              </View>

              <Button
                mode="contained"
                className="w-60 my-8"
                onPress={() => {
                  if (selectedCat.length === 0) {
                    setCatError(true);
                  } else {
                    setCatError(false);
                  }
                  handleSubmit();
                }}>
                Create
              </Button>
            </View>
          )}
        </Formik>
      </ScrollView>
    </Surface>
  );
}
