import React, {useEffect, useRef, useState} from 'react';
import {
  Appbar,
  Card,
  Divider,
  IconButton,
  Modal,
  Surface,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import {UpdateService} from '../../services/updates_service';
import {Toast} from 'react-native-toast-notifications';
import {
  FlatList,
  RefreshControl,
  ScrollView,
} from 'react-native-gesture-handler';
import {Image, View} from 'react-native';
import Hyperlink from 'react-native-hyperlink';
import {images} from '../../assets/images/images';
import NetworkStatus from '../network_screen';
import {useForeground} from 'react-native-google-mobile-ads';
import {isIos} from '../../utils/helpers';
import MyBannerAd from '../../utils/components/banner_ad';
import moment from 'moment';

export default function UpdateScreen() {
  const [isRefresh, setIsRefresh] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState({});
  const bannerRef = useRef(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useForeground(() => {
    isIos && bannerRef.current?.load();
  });

  useEffect(() => {
    getUpdates();
  }, []);

  const getUpdates = async () => {
    setIsRefresh(true);
    try {
      await UpdateService()
        .then(response => {
          if (response && response.success) {
            setUpdates(response.data);
            setIsRefresh(false);
          } else {
            setIsRefresh(false);
          }
        })
        .catch(error => {
          console.error('Error fetching updates:', error);
          setIsRefresh(false);
          Toast.show(error, {
            type: 'custom_toast',
            data: {title: 'Error'},
          });
        });
    } catch (error) {
      console.error('Error fetching updates:', error);
      setIsRefresh(false);
      Toast.show(error, {
        type: 'custom_toast',
        data: {title: 'Error'},
      });
    }
  };

  return (
    <Surface mode="flat" className="flex-1 h-full bg-white">
      <NetworkStatus />

      <Appbar className="bg-transparent">
        <Appbar.Content
          title="What’s New"
          mode="center-aligned"
          titleStyle={{textAlign: 'center'}}
        />
      </Appbar>

      <FlatList
        data={updates}
        keyExtractor={(item, index) => index}
        style={{paddingHorizontal: 10}}
        refreshControl={
          <RefreshControl
            refreshing={isRefresh}
            onRefresh={getUpdates}
            tintColor="black"
          />
        }
        ListEmptyComponent={
          <Surface
            mode="flat"
            className="flex-1 h-screen items-center justify-center">
            <Text variant="headlineLarge" className="text-center">
              No updates available
            </Text>
          </Surface>
        }
        renderItem={({item, index}) => {
          const dateTime = moment.parseZone(
            item.mobile_updates_dt,
            'MMMM DD, YYYY hh:mm:ss A',
          );
          const formattedDate = dateTime.format('MMM DD, YYYY ddd');

          return (
            <Card
              onPress={() => {
                setIsModalVisible(true);
                setModalData(item);
              }}
              key={index}
              mode="elevated"
              className="m-2 bg-white">
              <View>
                <View className="flex-1 p-4">
                  <Text
                    variant="titleLarge"
                    numberOfLines={1}
                    className="text-lg">
                    {item.mobile_updates_titles}
                  </Text>
                  <Text className="mt-2" variant="labelSmall">
                    {formattedDate}
                  </Text>
                </View>
                <Divider bold />
                <Text
                  variant="titleSmall"
                  ellipsizeMode="tail"
                  className="p-4"
                  numberOfLines={3}>
                  {item.mobile_updates_desc}
                </Text>

                {item.files_data && item.files_data.length > 0 && (
                  <FlatList
                    horizontal
                    data={item.files_data}
                    scrollEnabled={item.files_data.length > 4 ? true : false}
                    showsHorizontalScrollIndicator={false}
                    className="pb-1 mx-4"
                    keyExtractor={(item, index) => index}
                    key={index}
                    renderItem={({item, index}) => (
                      <Image
                        key={index}
                        className="w-24 h-24 mr-2 rounded-lg"
                        resizeMode="cover"
                        source={{uri: item.file_name}}
                      />
                    )}
                  />
                )}

                <TouchableRipple
                  className="self-end mr-3 rounded-full bg-gray-200 mb-4"
                  onPress={() => {
                    setIsModalVisible(true);
                    setModalData(item);
                  }}>
                  <Text className="mx-2 my-1" variant="labelSmall">
                    Read More
                  </Text>
                </TouchableRipple>
              </View>
            </Card>
          );
        }}
      />

      {ReadMoreModal()}
    </Surface>
  );

  function ReadMoreModal() {
    const dateTime = moment.parseZone(
      modalData.mobile_updates_dt,
      'MMMM DD, YYYY hh:mm:ss A',
    );
    const formattedDate = dateTime.format('MMM DD, YYYY ddd');
    return (
      <Modal
        visible={isModalVisible}
        dismissable={true}
        onDismiss={() => setIsModalVisible(false)}>
        <Card mode="contained" className=" self-start m-4 bg-white">
          <ScrollView>
            <View>
              <View className="mx-2 mt-2 flex-row items-center justify-between pb-2">
                <View className="flex-1">
                  <Text variant="titleLarge" className="text-lg">
                    {modalData.mobile_updates_titles}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  onPress={() => setIsModalVisible(false)}
                  size={20}
                  className="m-0"
                />
              </View>
              <Text className="mx-2" variant="labelSmall">
                {formattedDate}
              </Text>
              <Divider bold />
              <Hyperlink linkDefault={true} linkStyle={{color: '#007AFF'}}>
                <Text variant="titleSmall" ellipsizeMode="tail" className="p-4">
                  {modalData.mobile_updates_desc}
                </Text>
              </Hyperlink>

              {modalData.files_data && modalData.files_data.length > 0 && (
                <FlatList
                  data={modalData.files_data}
                  numColumns={2}
                  keyExtractor={item => item.id}
                  showsHorizontalScrollIndicator={false}
                  className="pb-3 mt-4"
                  contentContainerStyle={{
                    marginHorizontal: 10,
                  }}
                  renderItem={({item, index}) => (
                    <Image
                      key={index}
                      className="w-48 h-48 mx-2 rounded-lg"
                      resizeMode="cover"
                      source={{uri: item.file_name}}
                    />
                  )}
                />
              )}
            </View>
          </ScrollView>
        </Card>
      </Modal>
    );
  }
}
