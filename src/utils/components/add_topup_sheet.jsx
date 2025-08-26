import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import {Formik} from 'formik';
import {Image, Keyboard} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Button, HelperText, Text, TextInput} from 'react-native-paper';
import {images} from '../../assets/images/images';
import {useMemo, useRef} from 'react';

export function AddTopupSheet({
  bottomSheetRef,
  initialValues,
  validationSchema,
  onSubmit,
}) {
  const formRef = useRef(null);
  const snapPoints = ['30%', '40%'];
  return (
    <BottomSheet
      ref={ref => (bottomSheetRef.current = ref)}
      snapPoints={snapPoints}
      enablePanDownToClose
      android_keyboardInputMode="adjustResize"
      keyboardBehavior="extend"
      onClose={() => {
        bottomSheetRef.current?.close();
        formRef.current.resetForm({values: initialValues});
        Keyboard.dismiss();
      }}
      backdropComponent={props => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      )}
      index={-1}>
      <ScrollView
        contentContainerStyle={{alignItems: 'center'}}
        className="mt-2 flex-1 mx-10">
        <Formik
          initialValues={initialValues}
          innerRef={ref => (formRef.current = ref)}
          validationSchema={validationSchema}
          onSubmit={onSubmit}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              <Text variant="titleLarge" className="text-[#1E1E1E] mb-2">
                Add Amount to Top up
              </Text>
              <TextInput
                placeholder="Enter Amount"
                mode="outlined"
                className="w-80 h-11 mt-2 bg-[#E2EFD6]"
                contentStyle={{paddingTop: 10, paddingBottom: 10}}
                outlineStyle={{
                  elevation: 2,
                  borderRadius: 10,
                  borderWidth: 0,
                }}
                keyboardType="numeric"
                value={values.amount}
                onChangeText={handleChange('amount')}
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Image source={images.rupess} className="w-6 h-6" />
                    )}
                  />
                }
                maxLength={10}
              />
              {errors.amount && touched.amount && (
                <HelperText
                  className="self-start"
                  type="error"
                  variant="bodyMedium">
                  {errors.amount}
                </HelperText>
              )}

              <Button
                mode="contained"
                className="w-60 bg-[#72B334] mt-5 mb-2 rounded-full"
                onPress={handleSubmit}>
                <Text variant="bodyLarge" className="text-white">
                  Add
                </Text>
              </Button>
            </>
          )}
        </Formik>
      </ScrollView>
    </BottomSheet>
  );
}
