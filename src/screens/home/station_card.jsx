import {Image, Linking, Platform, View} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Divider,
  Surface,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import Animated, {
  Easing,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import {images} from '../../assets/images/images';
import {Rating} from '@kolking/react-native-rating';
import LinearGradient from 'react-native-linear-gradient';

export function stationCard({
  data,
  distance,
  style,
  navigation,
  enterAnimation,
  exitAnimation,
}) {
  const inUseMap = {
    0: 'Available',
    1: 'In Use',
    2: 'In Maintenance',
  };
  const in_use = inUseMap[data['in_use']];
  const address =
    data['station_address_one'] +
    ',' +
    data['station_address_two'] +
    ',' +
    data['station_address_landmark'] +
    ',' +
    data['location_name'] +
    ',' +
    data['city_name'] +
    ',' +
    data['state_name'] +
    ',' +
    data['country_name'] +
    ',' +
    data['pin_code'];

  const latLong = data['station_lat'] + ',' + data['station_long'];

  //const chargers = data['chargers'];
  const chargers = [];

  const imageMap = {
    1: images.CCS1,
    2: images.CCS2,
    3: images.Chademo,
    4: images.GB_TAC,
    5: images.GB_TDC,
    6: images.Type1,
    7: images.Type2,
  };

  const ChargerIcon = ({type}) => {
    const imageSource = imageMap[type];
    return imageSource ? (
      <Image
        source={imageSource}
        style={{
          width: 20,
          height: 20,
          resizeMode: 'contain',
          tintColor: '#79747E',
          marginHorizontal: 2,
        }}
      />
    ) : (
      <></>
    );
  };

  return (
    <TouchableRipple
      style={style}
      className={'w-fit'}
      borderless
      onPress={() => {
        if (data['is_ocpi'] === 1) {
          navigation.navigate('OcpiStationDetail', {
            station_id: data['station_id'],
          });
        } else {
          navigation.navigate('StationDetail', {
            station_id: data['station_id'],
          });
        }
      }}>
      <Animated.View
        needsOffscreenAlphaCompositing
        entering={enterAnimation}
        exiting={exitAnimation}>
        <Surface className="min-h-min mx-2 rounded-2xl shadow-sm shadow-gray-500  flex-1">
          <LinearGradient
            className={'flex-1 p-3 rounded-2xl'}
            useAngle={true}
            angle={140}
            angleCenter={{x: 0, y: 0.5}}
            colors={
              data['is_ocpi'] === 1
                ? ['#F8F8F8', '#F8F8F8']
                : ['#6BB14F', '#F8F8F8']
            }>
            {data['station_id'] !== undefined ? (
              <>
                <View className="flex-row justify-between">
                  <View className="flex-1 w-[80%]">
                    <Text
                      ellipsizeMode="tail"
                      className="text-lg"
                      numberOfLines={2}>
                      {data['station_name']}
                    </Text>
                    <Text
                      variant="titleSmall"
                      className="text-[#79747E]"
                      ellipsizeMode="tail"
                      numberOfLines={4}>
                      {address}
                    </Text>
                  </View>
                  <TouchableRipple
                    onPress={() => {
                      const url = Platform.select({
                        ios: `google.navigation:q=${latLong}`,
                        android: `google.navigation:q=${latLong}`,
                      });

                      Linking.openURL(url).catch(e => {
                        const errText = 'Unable to open URL';
                        if (e.message.includes(errText)) {
                          Linking.openURL(
                            `https://maps.google.com/?q=${latLong}`,
                          );
                        }
                      });
                    }}
                    className={`bg-[#6BB14F] h-10 w-10 rounded-full shadow-sm shadow-gray-400 justify-center items-center`}>
                    <Image source={images.direction} className="w-5 h-5" />
                  </TouchableRipple>
                </View>

                {/* Body */}

                {/* Public inuse kmtrs */}

                <View
                  style={{
                    marginTop: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    rowGap: 2,
                  }}>
                  <View className="flex-row items-center">
                    <View className="bg-[#6BB14F] rounded-lg mr-2">
                      <Text
                        variant="titleSmall"
                        className="text-white p-1 px-2">
                        {data.station_visibility === 'Private'
                          ? 'Restricted'
                          : 'Public'}
                      </Text>
                    </View>

                    <View className="bg-[#6BB14F] rounded-lg mr-2">
                      <Text
                        variant="titleSmall"
                        className="text-white p-1 px-2">
                        {data.charger_type}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Image source={images.map_pin} className="w-6 h-6" />
                      <View className="w-1" />

                      <Text variant="titleSmall" className="text-[#79747E]">
                        {Number(distance).toFixed(2)} km
                      </Text>
                    </View>
                  </View>

                  {data['is_ocpi'] !== 1 ? (
                    <View className="flex-row  items-center">
                      <Text className="mx-1" variant="titleSmall">
                        {parseFloat(data['stationreview'] ?? 0).toFixed(1)}
                      </Text>

                      <Rating
                        size={13}
                        fillColor="#6BB14F"
                        disabled={true}
                        rating={data['stationreview']}
                        fillSymbol={images.star_fill}
                        baseSymbol={images.star}
                        baseColor="#6BB14F"
                      />
                    </View>
                  ) : (
                    <></>
                  )}
                </View>

                {/* Divider */}

                <Divider className="my-3" bold />

                <Button
                  mode="contained"
                  onPress={() => {
                    if (data['is_ocpi'] === 1) {
                      navigation.navigate('OcpiStationDetail', {
                        station_id: data['station_id'],
                      });
                    } else {
                      navigation.navigate('StationDetail', {
                        station_id: data['station_id'],
                      });
                    }
                  }}>
                  View Details
                </Button>
              </>
            ) : (
              <View className="w-full h-40 items-center justify-center">
                <ActivityIndicator color="#6BB14F" />
              </View>
            )}
          </LinearGradient>
        </Surface>
      </Animated.View>
    </TouchableRipple>
  );
}
