import React, {useCallback} from 'react';
import {Image, View, StyleSheet} from 'react-native';
import {Button, Card, Divider, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {images} from '../../assets/images/images';
import Animated, {FadeInUp} from 'react-native-reanimated';
import moment from 'moment';

export default function ChargerInfoList({stationInfoData}) {
  const navigation = useNavigation();

  const chargerRender = useCallback(
    item => {
      const statuscheck = item.ocpp_status === 'Available';
      const chargingAllow = item.is_charging_allow != 1;
      const status = chargingAllow == false ? statuscheck : false;
      const statusLabel =
        chargingAllow == false ? item.ocpp_status : 'Maintenance';

      const shouldShowSessionInfo = statusLabel === 'Busy';

      // Assign defaults
      const SocValue = item.Soc ?? stationInfoData?.Soc ?? 0;
      const unit = item.cal_energy ?? stationInfoData?.cal_energy ?? 0;
      const VoltageValue = item.Voltage ?? stationInfoData?.Voltage ?? 0;
      const CurrentValue = item.Current ?? stationInfoData?.Current ?? 0;
      const StartTimeValue =
        item.start_date_time ?? stationInfoData?.start_date_time ?? null;

      const parsedTime = StartTimeValue
        ? moment(StartTimeValue, 'DD-MM-YYYY HH:mm:ss')
        : null;

      const formattedStartTime = parsedTime
        ? parsedTime.format('DD-MM-YYYY hh:mm A')
        : null;

      const timeAgo = parsedTime ? parsedTime.fromNow() : null;

      const speed = ((VoltageValue * CurrentValue) / 1000).toFixed(2);

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

          {shouldShowSessionInfo && (
            <View
              style={{
                marginTop: 10,
                backgroundColor: '#E9EDF5',
                padding: 10,
                borderRadius: 8,
              }}>
              <Text variant="titleSmall" className="text-[#095587] mb-3">
                Current charging session info
              </Text>

              {/* Row 1 */}
              <View style={styles.row}>
                <View style={styles.item}>
                  {/* <Image source={images.socIcon} style={styles.iconSmall} /> */}
                  <Text variant="labelSmall" className="text-[#095587]">
                    SOC: {SocValue}%
                  </Text>
                </View>
                <View style={styles.item}>
                  {/* <Image source={images.energyIcon} style={styles.iconSmall} /> */}
                  <Text variant="labelSmall" className="text-[#095587]">
                    Unit: {unit} kWh
                  </Text>
                </View>
                <View style={styles.item}>
                  {/* <Image source={images.timeIcon} style={styles.iconSmall} /> */}
                  <Text variant="labelSmall" className="text-[#095587]">
                    Time: {timeAgo || '--'}
                  </Text>
                </View>
              </View>

              <View style={{height: 10}} />

              {/* Row 2 */}
              <View style={styles.row}>
                <View style={styles.item}>
                  {/* <Image source={images.voltageIcon} style={styles.iconSmall} /> */}
                  <Text variant="labelSmall" className="text-[#095587]">
                    Voltage: {VoltageValue} V
                  </Text>
                </View>
                <View style={styles.item}>
                  {/* <Image source={images.currentIcon} style={styles.iconSmall} /> */}
                  <Text variant="labelSmall" className="text-[#095587]">
                    Current: {CurrentValue} A
                  </Text>
                </View>
                <View style={styles.item}>
                  {/* <Image source={images.speedIcon} style={styles.iconSmall} /> */}
                  <Text variant="labelSmall" className="text-[#095587]">
                    Current Charging Speed: {speed} kW
                  </Text>
                </View>
              </View>
            </View>
          )}
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
  infoBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E9EDF5',
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconSmall: {
    width: 14,
    height: 14,
    marginRight: 4,
    tintColor: '#095587',
  },
});
