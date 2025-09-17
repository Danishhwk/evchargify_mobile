import {
  CommonActions,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Button, Icon, Appbar} from 'react-native-paper';

const MaintenanceScreen = ({navigation}) => {
  return (
    <View style={styles.wrapper}>
      <Appbar style={styles.appbar} mode="center-aligned">
        <Appbar.Content title="Maintenance" />
      </Appbar>

      <View style={styles.container}>
        <Icon source="alert-circle" size={96} color="#E31E24" />

        <Text style={styles.title} variant="titleLarge">
          We'll be back shortly
        </Text>

        <Text style={styles.message} variant="bodyMedium">
          We're currently undergoing scheduled maintenance to improve our
          services. Thank you for your patience — please try again soon.
        </Text>

        <Button
          mode="contained"
          onPress={() => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'SplashScreen'}],
              }),
            );
          }}
          style={styles.button}
          contentStyle={styles.buttonContent}>
          <Text variant="bodyLarge" style={styles.buttonText}>
            Refresh
          </Text>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  appbar: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    color: '#444',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    alignSelf: 'center',
    borderRadius: 24,
  },
  buttonContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#ffffff',
  },
});

export default MaintenanceScreen;
