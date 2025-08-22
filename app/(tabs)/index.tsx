import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";
import WordsNavigator from "@/components/wordsNavigator/WordsNavigator";
import { buttonStyle } from "@/styles/buttonStyle";
import { inputArea } from "@/styles/inputArea";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "@react-navigation/elements";
import { useFonts } from "expo-font";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";

const colors = {
  bg: "hsl(51 30% 95%)",
};

export default function HomeScreen() {
  const [inputText, setInputText] = useState<string>("");
  const [words, setWords] = useState<string[]>([]);
  const [activeWord, setActiveWord] = useState<null | number>(null);
  const [gigaResponse, setGigaResponse] = useState([]);

  const [loaded, error] = useFonts({
    // Montserrat: require("../../assets/fonts/Montserrat.ttf"),
    Montserrat_600SemiBold,
  });
  useEffect(() => {
    const getWords = async () => {
      const storageItems: string | null = await AsyncStorage.getItem(
        "wordHelperWords"
      );
      if (storageItems) {
        const items = JSON.parse(storageItems);
        setWords(items);
      }
    };
    getWords();
    // main();
  }, []);

  const saveWord = async () => {
    if (inputText) {
      try {
        ///check for repeat
        const isThere = words.find((word) => word === inputText.trim());
        ///don't save if repeated
        if (isThere) {
          console.log("You repeated word");
          setInputText("");
        }
        ///save word
        if (isThere === undefined) {
          setWords((words) => [...words, inputText]);
          await AsyncStorage.setItem(
            "wordHelperWords",
            JSON.stringify([...words, inputText])
          );
          setInputText("");
          ///create active word cash in storage on first word
          if (activeWord === null) {
            await AsyncStorage.setItem("currentWord", "0");
            setActiveWord(0);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // const deleteAll = async () => {
  // await AsyncStorage.removeItem("wordHelperWords");
  // setWords([]);
  // await AsyncStorage.removeItem("currentWordInd");
  // setActiveWordInd(null);
  // };

  const getSentences = () => {
    try {
      fetch(
        "http://192.168.0.102:3000",
        // fetch("http://77.222.47.206:3000",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Convert the payload to a JSON string
            type: "sentences",
            wordForSentences: activeWord !== null && words[activeWord],
          }),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("data from Giga:", data);
          setGigaResponse(data);
        });
    } catch (err) {
      console.log(err);
    }
  };

  const getDefinition = () => {
    console.log("touched");
    try {
      fetch(
        "http://192.168.0.102:3000",
        // fetch("http://77.222.47.206:3000",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Convert the payload to a JSON string
            type: "definition",
            wordForDefinition: activeWord !== null && words[activeWord],
          }),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("data from Giga:", data);
          setGigaResponse(data);
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <GestureHandlerRootView>
        <View style={inputArea.inputArea}>
          <Text
            style={[inputArea.title, { fontFamily: "Montserrat_600SemiBold" }]}
          >
            Add the word
          </Text>
          <TextInput
            style={inputArea.input}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={saveWord}
          />
        </View>
        <View style={styles.allButtons}>
          {/* save buttons  */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={getSentences}
              style={[buttonStyle.button, { width: "45%" }]}
            >
              <Text style={buttonStyle.buttonText}>Get response</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[buttonStyle.button, { width: "45%" }]}
              onPress={getDefinition}
            >
              <Text style={buttonStyle.buttonText}>What's this</Text>
            </TouchableOpacity>
          </View>
          <WordsNavigator
            words={words}
            setWords={setWords}
            activeWord={activeWord}
            setActiveWord={setActiveWord}
          />
        </View>
        {gigaResponse.type === "sentences" &&
          gigaResponse.response.map((word, i) => (
            <ScrollView key={i}>
              <Text style={styles.responseText}>{word}</Text>
            </ScrollView>
          ))}
        {gigaResponse.type === "definition" && (
          <ScrollView>
            <Text style={styles.responseText}>{gigaResponse.response}</Text>
          </ScrollView>
        )}
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: "hsl(51 30% 95%)",
    flex: 1,
  },

  allButtons: {
    // borderWidth: 1, ////$$
    // borderColor: "red", ///$$
    flex: 1,
    marginHorizontal: 20,
    paddingBlock: 30,
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 13,
  },
  responseText: {
    fontSize: 18,
  },
});
