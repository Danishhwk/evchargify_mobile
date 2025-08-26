import React, {useCallback} from 'react';
import {Image, View, StyleSheet} from 'react-native';
import {Button, Card, Divider, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {images} from '../../assets/images/images';
import Animated, {FadeInUp} from 'react-native-reanimated';

export default function ChargerInfoList({stationInfoData}) {
  const navigation = useNavigation();

  const chargerRender = useCallback(
    item => {
      const statuscheck = item.ocpp_status === 'Available';
      const chargingAllow = item.is_charging_allow != 1;
      const status = chargingAllow == false ? statuscheck : false;
      const statusLabel =
        chargingAllow == false ? item.ocpp_status : 'Maintenance';
      return (
        <Card
          key={item.station_charger_connector_id}
          className="p-3 mt-3 bg-white"
          disabled={!status}
          onPress={() => {
            navigation.navigate('ChargerInfo', {
              stationInfoData,
              station_id: item.station_id,
              station_charger_id: item.station_charger_id,
              station_charger_connector_id: item.station_charger_connector_id,
            });
          }}
          style={[
            styles.card,
            {borderStartColor: status ? '#6BB14F' : '#E31E24'},
          ]}>
          <View style={styles.cardHeader}>
            <View style={styles.chargerType}>
              <Text variant="bodyMedium">{item.charger_power_type}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Text variant="bodyMedium">{statusLabel}</Text>
              <View
                style={[
                  styles.statusIndicator,
                  {backgroundColor: status ? '#6BB14F' : '#E31E24'},
                ]}
              />
            </View>
          </View>

          <Divider className="my-2" bold />

          <View style={styles.cardContent}>
            <View style={styles.connectorDetails}>
              <Text variant="bodyLarge" className="text-[#6BB14F]">
                {item.connector_type_name} - Gun {item.connector_name}
              </Text>
              {item.connector_type_icon && (
                <Image
                  source={images[item.connector_type_icon]}
                  className="w-16 h-16 mt-2"
                  style={styles.icon}
                />
              )}
            </View>

            <View style={styles.separator} />

            <View style={styles.powerDetails}>
              <Text variant="bodyLarge" className="text-[#6BB14F]">
                Max. Power
              </Text>
              <Text variant="headlineSmall" className="text-[#6BB14F]">
                {item.connector_power_kw} kW
              </Text>
            </View>
          </View>

          <Divider className="my-2" bold />

          <Button
            disabled={!status}
            className={`${
              status ? 'bg-[#6BB14F]' : 'bg-gray-400'
            } rounded-full`}
            onPress={() => {
              navigation.navigate('ChargerInfo', {
                stationInfoData,
                station_id: item.station_id,
                station_charger_id: item.station_charger_id,
                station_charger_connector_id: item.station_charger_connector_id,
              });
            }}>
            <Text variant="bodyLarge" className="text-white">
              Charge Now
            </Text>
          </Button>
        </Card>
      );
    },
    [navigation, stationInfoData],
  );

  return (
    <Animated.View
      entering={FadeInUp.duration(500)}
      needsOffscreenAlphaCompositing
      className="p-3">
      {stationInfoData.chargerData?.map((item, index) => (
        <View key={index}>
          <View style={styles.stationNameContainer}>
            <Text variant="bodyLarge">{item.charger_name}</Text>
            <View className="flex-row items-center">
              {item.is_rfid == 1 && tagRender('RFID')}
              {item.is_plug_charge == 1 && tagRender('AutoCharge')}
              {item.is_upi == 1 && tagRender('UPI')}
            </View>
          </View>
          <View style={styles.connectorContainer}>
            {item.connectors.map(chargerRender)}
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

function tagRender(title) {
  return (
    <View className="bg-[#6BB14F] p-2 rounded-lg flex-row items-center mr-1">
      <View className="w-1.5 h-1.5 rounded-full bg-white mr-2" />
      <Text variant="labelMedium" className="text-white">
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stationNameContainer: {
    backgroundColor: '#E9EDF5',
    borderRadius: 10,
    elevation: 2,
    marginVertical: 10,
    margin: 2,
    paddingHorizontal: 10,
    paddingVertical: 15,
    shadowColor: '#79747E',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectorContainer: {
    padding: 3,
    marginBottom: 20,
    borderRadius: 10,
    margin: 2,
  },
  card: {
    borderStartWidth: 6,
    borderRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chargerType: {
    backgroundColor: '#99D9D9',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  cardContent: {
    flexDirection: 'row',
  },
  connectorDetails: {
    flex: 1,
  },
  icon: {
    width: 64,
    height: 64,
    marginTop: 8,
    tintColor: '#6BB14F',
  },
  separator: {
    width: 1,
    backgroundColor: '#D1D1D1',
  },
  powerDetails: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
