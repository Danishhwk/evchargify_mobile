import {Image, View} from 'react-native';
import React, {useState} from 'react';
import {Button, Dialog, Text, TextInput} from 'react-native-paper';
import MyAppBar from '../../utils/components/appBar';
import {ScrollView} from 'react-native-gesture-handler';
import {images} from '../../assets/images/images';
import {Toast} from 'react-native-toast-notifications';
import {CommonActions} from '@react-navigation/native';
import Loading from '../../utils/components/loading';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {deleteServiceFun} from '../../services/delete_service';

export default function PasswordVerify({navigation, route}) {
  const {reason} = route.params;
  const [password, setPassword] = useState('');
  const [passSecure, setPassSecure] = useState(true);
  const [deletePopup, setDeletePopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteFun = async () => {
    let customer_id = await AsyncStorage.getItem('customer_id');
    let response = await deleteServiceFun(customer_id, password, reason);
    console.log('response', response);
    if (response.success === true) {
      setLoading(false);
      Toast.show('Deleted Successfully', {
        type: 'custom_toast',
        data: {title: 'Success'},
      });
      clearData();
    } else {
      setLoading(false);
      Toast.show(response.message, {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  const clearData = async () => {
    await AsyncStorage.removeItem('iSlogin');
    await AsyncStorage.removeItem('customer_id');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('customer_first_name');
    await AsyncStorage.removeItem('customer_profile');
    await AsyncStorage.removeItem('customer_current_wallet_amt');
    await AsyncStorage.removeItem('customer_mobile_no');
    await AsyncStorage.removeItem('customer_mail_id');
    await AsyncStorage.removeItem('referral_code');
    await AsyncStorage.clear();

    console.log('clearData');

    navigation.dispatch(
      CommonActions.reset({index: 0, routes: [{name: 'LoginScreen'}]}),
    );
  };

  return (
    <View className="flex-1 h-full">
      <MyAppBar title={'Password Verify'} />
      <ScrollView className="p-5" contentContainerStyle={{paddingBottom: 30}}>
        <Text variant="bodyLarge" className="mt-2">
          Thank you for providing the reason. To confirm your identity and
          proceed with the account deletion, please enter your password below.
        </Text>

        <TextInput
          label="Password"
          mode="outlined"
          className="h-10 my-5"
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
          value={password}
          onChangeText={text => setPassword(text)}
          left={
            <TextInput.Icon
              style={{marginTop: 15}}
              icon={() => (
                <Image source={images.password} className="w-5 h-5" />
              )}
            />
          }
          right={
            <TextInput.Icon
              style={{marginTop: 15}}
              forceTextInputFocus={false}
              onPress={() => setPassSecure(!passSecure)}
              icon={() =>
                !passSecure ? (
                  <Image
                    source={images.eye}
                    tintColor={'#6BB14F'}
                    className="w-5 h-5"
                  />
                ) : (
                  <Image
                    source={images.eyeOff}
                    tintColor={'black'}
                    className="w-5 h-5"
                  />
                )
              }
            />
          }
          secureTextEntry={passSecure}
        />

        <Button
          mode="contained"
          className="w-full mb-2 rounded-full self-center"
          onPress={() => {
            if (password.trim() == '') {
              Toast.show('Please enter password', {
                type: 'custom_toast',
                data: {title: 'Info'},
              });
            } else {
              setDeletePopup(true);
            }
          }}>
          <Text variant="bodyLarge" className="text-white">
            Verify & Delete
          </Text>
        </Button>
      </ScrollView>

      {deleteDialog()}
      {Loading({visible: loading})}
    </View>
  );

  function deleteDialog() {
    return (
      <Dialog visible={deletePopup} onDismiss={() => setDeletePopup(false)}>
        <Dialog.Title className="text-center">Confirmation</Dialog.Title>

        <Dialog.Content className="items-center">
          <Image source={images.deleteUser} className="w-16 h-16" />
          <Text variant="bodyLarge" className="my-2 text-center">
            Are you sure you want to delete your account? This action cannot be
            undone. Please confirm by clicking 'Delete Account' below.
          </Text>

          <View className="w-full mt-5 items-center justify-evenly">
            <Button
              mode="contained"
              className="w-full"
              onPress={async () => {
                setDeletePopup(false);
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{name: 'bottomNav'}],
                  }),
                );
              }}>
              <Text className="text-white">No I've changed my mind</Text>
            </Button>

            <Button
              mode="outlined"
              className="w-full mt-4 border-[#E31E24]"
              onPress={() => {
                setDeletePopup(false);
                setLoading(true);
                deleteFun();
              }}>
              <Text variant="bodyMedium" className="text-[#E31E24]">
                Delete Account
              </Text>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog>
    );
  }
}
