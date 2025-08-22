import { buttonStyle } from "@/styles/buttonStyle";
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

function DeleteWord({ words, activeWord, setIsDeletingWord, deleteWord }) {
  const offsetY = useSharedValue(0);

  ///style for button animation
  const animatedOnButtonMove = useAnimatedStyle(() => {
    let opacity;
    if (offsetY.value <= 0) {
      opacity = (100 + offsetY.value) / 100;
    } else if (offsetY.value >= 0) {
      opacity = (100 - offsetY.value) / 100;
    }
    // console.log(offsetY.value, (100 + offsetY.value) / 100);
    return {
      transform: [{ translateY: offsetY.value }],
      opacity,
    };
  });
  ///style for up/down arrows animation
  const animatedArrow = useAnimatedStyle(() => {
    let opacity;
    if (offsetY.value !== 0) {
      opacity = 0;
    } else {
      opacity = 1;
    }
    return {
      opacity,
    };
  });
  const confirmDeleteGesture = Gesture.Pan()
    .onUpdate((e) => {
      offsetY.value = e.translationY;
    })
    .onEnd((e) => {
      //confirm deletion or cancelation moving up or down
      if (e.translationY < -80) {
        runOnJS(setIsDeletingWord)(false);
      } else if (e.translationY > 70) {
        runOnJS(deleteWord)();
        runOnJS(setIsDeletingWord)(false);
        //returning on small gestures
      } else {
        offsetY.value = 0;
      }
    })
    .onFinalize(() => {});

  const AnimatedAntDesign = Animated.createAnimatedComponent(AntDesign);
  return (
    <View style={styles.componentBody}>
      <AnimatedAntDesign
        name="up"
        size={24}
        color="gray"
        style={[styles.upDownArrow, animatedArrow]}
      />
      <GestureDetector gesture={confirmDeleteGesture}>
        <Animated.View
          style={[
            buttonStyle.button,
            styles.deleteWordButton,
            animatedOnButtonMove,
          ]}
          // onPress={deleteWord}
        >
          <Text style={[buttonStyle.buttonText, { color: "white" }]}>
            Delete {words[activeWord]}?
          </Text>
        </Animated.View>
      </GestureDetector>
      <AnimatedAntDesign
        name="down"
        size={24}
        color="gray"
        style={[styles.upDownArrow, animatedArrow]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  componentBody: {
    marginTop: 20,
  },
  upDownArrow: {
    alignSelf: "center",
  },
  deleteWordButton: {
    minHeight: 70,
    height: "auto",
    width: "65%",
    alignSelf: "center",
    backgroundColor: "hsla(0, 100%, 58%, 1.00)",
  },
});
export default DeleteWord;
