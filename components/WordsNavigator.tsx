import { buttonStyle } from "@/styles/buttonStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { Dispatch, SetStateAction } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  const next = () => {
    if (activeWordInd !== null) {
      if (activeWordInd < words.length - 1) {
        setActiveWordInd((prev) => (prev === null ? 0 : prev + 1));
        const saveIndToStorage = async () => {
          await AsyncStorage.setItem(
            "currentWordInd",
            JSON.stringify(activeWordInd + 1)
          );
        };
        saveIndToStorage();
      }
    }
  };
  const prev = () => {
    if (activeWordInd !== null) {
      if (activeWordInd > 0) {
        setActiveWordInd((prev) => (prev === null ? 0 : prev - 1));
        const saveIndToStorage = async () => {
          await AsyncStorage.setItem(
            "currentWordInd",
            JSON.stringify(activeWordInd - 1)
          );
        };
        saveIndToStorage();
      }
    }
  };
  return (
    <View>
      <View style={styles.wordsNumbersContainer}>
        <Text>
          {activeWordInd === null ? 0 : activeWordInd + 1}/{words.length}
        </Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[buttonStyle.button, { width: "25%" }]}
          onPress={prev}
        >
          <Text style={buttonStyle.buttonText}>prev</Text>
        </TouchableOpacity>
        {/* /// */}
        <Text style={styles.word}>
          {activeWordInd !== null && words[activeWordInd]}
        </Text>
        {/* /// */}
        <TouchableOpacity
          style={[buttonStyle.button, { width: "25%" }]}
          onPress={next}
        >
          <Text style={buttonStyle.buttonText}>next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  buttonsContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    gap: 13,
  },
  word: {
    fontSize: 20,
  },
  wordsNumbersContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
});

export default WordsNavigator;