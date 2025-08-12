import {
  FlatList,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { buttonStyle } from "@/styles/buttonStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  LightSpeedInRight,
  LightSpeedInLeft,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type navigatorProps = {
  words: string[];
  activeWordInd: number | null;
  setActiveWordInd: Dispatch<SetStateAction<number | null>>;
};
////word///
const SCREEN_WIDTH = Dimensions.get("window").width;
const WORD_WIDTH = SCREEN_WIDTH - 120; //20+20 margin on buttons container
// console.log(SCREEN_WIDTH, WORD_WIDTH); //40+40 side elements

////////////
function WordsNavigator({
  words,
  activeWordInd,
  setActiveWordInd,
}: navigatorProps) {
  // console.log("active ind", activeWordInd);
  const [currentPage, setCurrentPage] = useState(0);
  const offset = useSharedValue({ x: 0, y: 0 });
  const animatedStylesProbe = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value.x }],
    };
  });

  const doubleTap = Gesture.Pan()
    .onStart((e) => {})
    .onUpdate((e) => {
      offset.value = { x: e.translationX };
    });

  const [enterFrom, setEnterFrom] = useState("left");

  const next = () => {
    if (activeWordInd !== null) {
      if (activeWordInd < words.length - 1) {
        setEnterFrom("left");
        const restate = () => {
          setActiveWordInd((prev) => (prev === null ? 0 : prev + 1));
          const saveIndToStorage = async () => {
            await AsyncStorage.setItem(
              "currentWordInd",
              JSON.stringify(activeWordInd + 1)
            );
          };
          saveIndToStorage();
        };
        restate();
      }
    }
  };

  const prev = () => {
    if (activeWordInd !== null) {
      if (activeWordInd > 0) {
        setEnterFrom("right");
        const restate = () => {
          setActiveWordInd((prev) => (prev === null ? 0 : prev - 1));
          const saveIndToStorage = async () => {
            await AsyncStorage.setItem(
              "currentWordInd",
              JSON.stringify(activeWordInd - 1)
            );
          };
          saveIndToStorage();
        };
        restate();
      }
    }
  };

  // const AnimatedText = Animated.createAnimatedComponent(Text);
  return (
    <GestureHandlerRootView>
      <View style={{ flex: 1 }}>
        <View style={styles.wordsNumbersContainer}>
          <Text>
            {currentPage + 1} / {words.length}
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[buttonStyle.button, { width: 40, zIndex: 10 }]}
            onPress={prev}
          >
            <Text style={buttonStyle.buttonText}>{"<<"}</Text>
          </TouchableOpacity>
          {/* //WORDs/ */}
          {/* <GestureDetector gesture={doubleTap}> */}
          <FlatList
            data={words}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            decelerationRate="normal"
            onMomentumScrollEnd={(event) => {
              const contentOffset = event.nativeEvent.contentOffset;
              // console.log(contentOffset.x, WORD_WIDTH);
              // Calculate current page
              const page = Math.ceil(Math.floor(contentOffset.x) / WORD_WIDTH);
              setCurrentPage(page);
            }}
            renderItem={(word) => (
              <Text style={[styles.word]}>{word.item}</Text>
            )}
          ></FlatList>
          {/* //WORDs/ */}
          <TouchableOpacity
            style={[buttonStyle.button, { width: 40, zIndex: 10 }]}
            onPress={next}
          >
            <Text style={buttonStyle.buttonText}>{">>"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    // flex: 1,
    // height: 80,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },

  flatList: {
    // borderColor: "red", borderWidth: 1
  },
  word: {
    width: WORD_WIDTH,
    height: 50,
    fontSize: 20,
    textAlign: "center",
    textAlignVertical: "center",
    paddingHorizontal: 10,
    // borderColor: "green",
    // borderWidth: 1,
  },

  wordsNumbersContainer: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginVertical: 20,
  },
});

export default WordsNavigator;
