import { buttonStyle } from "@/styles/buttonStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  LightSpeedInRight,
  LightSpeedInLeft,
} from "react-native-reanimated";

type navigatorProps = {
  words: string[];
  activeWordInd: number | null;
  setActiveWordInd: Dispatch<SetStateAction<number | null>>;
};

function WordsNavigator({
  words,
  activeWordInd,
  setActiveWordInd,
}: navigatorProps) {
  // console.log("active ind", activeWordInd);

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

  const AnimatedText = Animated.createAnimatedComponent(Text);
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.wordsNumbersContainer}>
        <Text>
          {activeWordInd === null ? 0 : activeWordInd + 1}/{words.length}
        </Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[buttonStyle.button, { width: "15%", zIndex: 10 }]}
          onPress={prev}
        >
          <Text style={buttonStyle.buttonText}>{"<<"}</Text>
        </TouchableOpacity>
        {/* //WORDs/ */}
        <Animated.View>
          <AnimatedText
            entering={
              enterFrom === "left"
                ? LightSpeedInRight.withInitialValues({
                    opacity: 0,
                    transform: [{ translateX: 100 }, { skewX: "45deg" }],
                  })
                : LightSpeedInLeft.withInitialValues({
                    opacity: 0,
                    transform: [{ translateX: -100 }, { skewX: "45deg" }],
                  })
            }
            style={styles.word}
          >
            {activeWordInd !== null && words[activeWordInd]}
          </AnimatedText>
        </Animated.View>
        {/* //WORDs/ */}
        <TouchableOpacity
          style={[buttonStyle.button, { width: "15%", zIndex: 10 }]}
          onPress={next}
        >
          <Text style={buttonStyle.buttonText}>{">>"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  buttonsContainer: {
    // flex: 1,
    // height: 80,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    gap: 13,
  },
  word: {
    fontSize: 20,
    textAlign: "center",
  },
  wordsNumbersContainer: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginVertical: 20,
  },
});

export default WordsNavigator;
