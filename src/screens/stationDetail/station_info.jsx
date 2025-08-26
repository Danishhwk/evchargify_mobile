import React, {useState, useMemo} from 'react';
import {Image, View, StyleSheet} from 'react-native';
import {Text, Surface} from 'react-native-paper';
import {images} from '../../assets/images/images';
import Animated, {FadeIn, FadeInUp} from 'react-native-reanimated';

export default function StationInfo({stationInfoData}) {
  const [expanded, setExpanded] = useState(false);

  // Memoize the Time and Amenities data to avoid re-rendering on every render
  const timeData = useMemo(
    () => stationInfoData.timeData || [],
    [stationInfoData.timeData],
  );
  const amenitieData = useMemo(
    () => stationInfoData.amenitieData || [],
    [stationInfoData.amenitieData],
  );

  return (
    <Animated.View
      entering={FadeInUp.duration(500)}
      needsOffscreenAlphaCompositing
      style={styles.container}>
      <Text style={styles.header}>About</Text>
      <Text style={styles.description}>{stationInfoData.station_info}</Text>

      {/* Open Hours Section */}
      <InfoCard title="Open" icon={images.clock}>
        <View style={styles.timeContainer}>
          {timeData.map(item => (
            <View key={item.id} style={styles.timeRow}>
              <Text>{item.days}</Text>
              <Text>
                {item.start_time} - {item.end_time}
              </Text>
            </View>
          ))}
        </View>
      </InfoCard>

      {/* Amenities Section */}
      <InfoCard title="Amenities">
        {amenitieData.map((item, index) => (
          <View key={index} style={styles.amenityRow}>
            <Image source={images.toilet} style={styles.icon} />
            <Text>{item.amenities_name}</Text>
          </View>
        ))}
      </InfoCard>
    </Animated.View>
  );
}

// Reusable Card Component for sections like Open and Amenities
const InfoCard = ({title, icon, children}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      {icon && <Image source={icon} style={styles.icon} />}
      <Text variant="titleMedium">{title}</Text>
    </View>
    <View style={styles.cardContent}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '600',
  },
  description: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#E9EDF5',
    borderRadius: 10,
    elevation: 2,
    marginTop: 16,
    marginHorizontal: 2,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: '#79747E',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    marginTop: 8,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  timeContainer: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  amenityRow: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'center',
  },
});
