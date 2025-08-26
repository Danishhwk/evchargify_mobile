// import React, {useState, useRef} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Animated,
//   StyleSheet,
//   Easing,
//   Image,
// } from 'react-native';
// import {images} from '../../assets/images/images';

// export function Accordion({title, children}) {
//   const [isOpen, setIsOpen] = useState(false);
//   const animatedController = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

//   const toggleAccordion = () => {
//     if (isOpen) {
//       Animated.timing(animatedController, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: false,
//         easing: Easing.linear,
//       }).start();
//     } else {
//       Animated.timing(animatedController, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: false,
//         easing: Easing.linear,
//       }).start();
//     }
//     setIsOpen(!isOpen);
//   };

//   const maxHeight = animatedController.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0%', '100%'],
//   });

//   return (
//     <View style={styles.accordionContainer}>
//       <TouchableOpacity style={styles.accordionTitle} onPress={toggleAccordion}>
//         <Text>{title}</Text>
//         <Animated.View
//           style={{
//             transform: [
//               {
//                 rotate: animatedController.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: ['0deg', '180deg'], // rotate from 0 to 180 degrees
//                 }),
//               },
//             ],
//           }}>
//           <Image source={images.chevron_right} className="w-6 h-6 rotate-90" />
//         </Animated.View>
//       </TouchableOpacity>
//       <Animated.View style={[styles.accordionContent, {maxHeight}]}>
//         {children}
//       </Animated.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   accordionContainer: {
//     backgroundColor: '#E9EDF5',
//     borderRadius: 10,
//     overflow: 'hidden',
//     elevation: 2,
//     margin: 5,
//   },
//   accordionTitle: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: '#F8F8F8',
//   },
//   accordionContent: {
//     overflow: 'visible',
//   },
// });
