import React, {useState, useMemo} from 'react';
import {Modal, SafeAreaView, View, StyleSheet, Image} from 'react-native';
import {ActivityIndicator, Card, IconButton, Text} from 'react-native-paper';
import Pdf from 'react-native-pdf';
import {Toast} from 'react-native-toast-notifications';
import {images} from '../../assets/images/images';
import Animated, {FadeInUp} from 'react-native-reanimated';

export default function StepsInfo({stationInfo: station_info_data}) {
  const [viewPdf, setViewPdf] = useState(false);
  const [pdfHeaderText, setPdfHeaderText] = useState('');
  const [pdfViewFile, setPdfViewFile] = useState('');

  // Data for all cards, allows dynamic rendering
  const pdfCardsData = useMemo(
    () => [
      {
        title: 'Charging Your Vehicle with the EV Chargify App?',
        subtitle: 'Click here to view the step-by-step guide.',
        icon: images.mobileApp,
        pdfFile: station_info_data.gun_step_file,
        headerText: 'EV Chargify App Guide',
      },
      {
        title: 'Your Guide to UPI Charging',
        subtitle: 'Click here to view the step-by-step guide.',
        icon: images.scanPay,
        pdfFile: station_info_data.upi_step_file,
        headerText: 'UPI Charging Guide',
      },
      {
        title: 'Charge Your Vehicle with the Tap of an RFID Card',
        subtitle: 'Click here to view the step-by-step guide.',
        icon: images.rfid_lable,
        pdfFile: station_info_data.rfid_step_file,
        headerText: 'RFID Charging Guide',
      },
      {
        title: 'Effortless EV Charging with AutoCharge',
        subtitle: 'Click here to view the step-by-step guide.',
        icon: images.autocharge,
        pdfFile: station_info_data.autocharge_step_file,
        headerText: 'AutoCharge Guide',
      },
    ],
    [station_info_data],
  );

  return (
    <Animated.View
      entering={FadeInUp.duration(500)}
      needsOffscreenAlphaCompositing
      style={styles.container}>
      <PdfModel
        visible={viewPdf}
        pdfHeaderText={pdfHeaderText}
        pdfViewFile={pdfViewFile}
        setViewPdf={setViewPdf}
      />

      {pdfCardsData.map((card, index) => (
        <PdfCard
          key={index}
          title={card.title}
          subtitle={card.subtitle}
          icon={card.icon}
          onPress={() => {
            setPdfViewFile(card.pdfFile);
            setPdfHeaderText(card.headerText);
            setViewPdf(true);
          }}
        />
      ))}
    </Animated.View>
  );
}

// Pdf Model (Modal for displaying PDF)
function PdfModel({visible, pdfHeaderText, pdfViewFile, setViewPdf}) {
  return (
    <Modal visible={visible} onDismiss={() => setViewPdf(false)}>
      <SafeAreaView style={styles.pdfModalContainer}>
        <View style={styles.pdfHeader}>
          <Text variant="titleLarge">{pdfHeaderText}</Text>
          <IconButton icon="close" onPress={() => setViewPdf(false)} />
        </View>
        <Pdf
          trustAllCerts={false}
          source={{uri: pdfViewFile}}
          enableDoubleTapZoom
          onError={err => {
            console.log('PDF Error: ', err);
            setViewPdf(false);
            Toast.show('PDF link is not working', {
              type: 'custom_toast',
              data: {title: 'Error'},
            });
          }}
          renderActivityIndicator={() => <ActivityIndicator size="large" />}
          style={{flex: 1}}
        />
      </SafeAreaView>
    </Modal>
  );
}

// PdfCard Component
function PdfCard({title, subtitle, icon, onPress}) {
  return (
    <Card
      onPress={onPress}
      mode="elevated"
      contentStyle={styles.cardContent}
      style={styles.card}>
      <Image source={icon} style={styles.cardImage} />
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle} variant="titleLarge">
          {title}
        </Text>
        <Text style={styles.cardSubtitle} variant="titleMedium">
          {subtitle}
        </Text>
      </View>
    </Card>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    padding: 10,
  },
  pdfModalContainer: {
    flex: 1,
  },
  pdfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
  },
  card: {
    padding: 22,
    margin: 8,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  cardImage: {
    width: 75,
    height: 75,
    tintColor: '#6BB14F',
  },
  cardTextContainer: {
    marginLeft: 16,
    width: '80%',
  },
  cardTitle: {
    marginBottom: 8,
    marginRight: 8,
  },
  cardSubtitle: {
    color: '#6BB14F',
  },
});
