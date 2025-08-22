import React, { useEffect } from "react";
import { Dimensions, StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

type wordProps = {};

const SCREEN_WIDTH = Dimensions.get("window").width;
const WORD_WIDTH = SCREEN_WIDTH - 160; //20+20 margin on buttons container
// console.log(SCREEN_WIDTH, WORD_WIDTH); //60+60 side elements + 2+2 paddings

function Word({ word, setIsDeletingWord, isDeletingWord }: wordProps) {
  console.log(word);
  const offsetY = useSharedValue(0);
  const animatedOnDelete = useAnimatedStyle(() => {
    // Start: hsl(51, 30%, 85%)
    // End: hsla(0, 100%, 58%, 1.00)
    //offsetY moves to ~50-60
    const hue = 51 - offsetY.value * 0.7; // 51 → 0
    const saturation = 30 + offsetY.value; // 30% → 100%
    const lightness = 85 - offsetY.value * 0.5; // 85% → 50%
    // console.log(hue, saturation, lightness);

    return {
      transform: [{ translateY: offsetY.value }],
      backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    };
  });

  const deleteGesture = Gesture.Pan()
    .minDistance(30) //gesture starts after finger moved 30 points down
    .onBegin(() => {})
    .onUpdate((e) => {
      //only move down
      if (e.translationY >= 0) {
        offsetY.value = e.translationY;
      }
    })
    .onEnd(() => {
      //don't move on small gestures
      if (offsetY.value < 60) {
        offsetY.value = 0;
      }
    })
    .onFinalize(() => {
      if (offsetY.value >= 60) {
        //to move down last part of element - height 70
        offsetY.value = 80;
        runOnJS(setIsDeletingWord)(true);
      }
    });
  //return word to position after confirmation of deletion
  useEffect(() => {
    if (!isDeletingWord) {
      offsetY.value = 0;
    }
  }, [isDeletingWord]);

  return (
    <GestureDetector gesture={deleteGesture}>
      <Animated.View style={[styles.wordContainer, animatedOnDelete]}>
        <Text style={styles.word}>{word.item}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wordContainer: {
    width: WORD_WIDTH,
    height: 70,
    // height: "auto",
    paddingHorizontal: 10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // borderRadius: 40,
  },
  word: {
    fontSize: 20,
    color: "black",
    textAlign: "center",
    // borderColor: "green",
    // borderWidth: 1,
  },
});

export default Word;
