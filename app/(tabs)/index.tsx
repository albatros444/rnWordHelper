import WordsNavigator from "@/components/WordsNavigator";
import { buttonStyle } from "@/styles/buttonStyle";
import { inputArea } from "@/styles/inputArea";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "@react-navigation/elements";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
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
  const [activeWordInd, setActiveWordInd] = useState<null | number>(null);
  const [gigaResponse, setGigaResponse] = useState([]);

  // console.log("hello")

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
    const getInd = async () => {
      const ind: string | null = await AsyncStorage.getItem("currentWordInd");
      if (ind) {
        //"0", "1"...
        const i = JSON.parse(ind);
        setActiveWordInd(i);
      }
    };
    getWords();
    getInd();
    // main();
  }, []);

  const saveWord = async () => {
    if (inputText) {
      try {
        setWords((words) => [...words, inputText]);
        await AsyncStorage.setItem(
          "wordHelperWords",
          JSON.stringify([...words, inputText])
        );
        setInputText("");
        if (activeWordInd === null) {
          await AsyncStorage.setItem("currentWordInd", "0");
          setActiveWordInd(0);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  const deleteAll = async () => {
    await AsyncStorage.removeItem("wordHelperWords");
    setWords([]);
    await AsyncStorage.removeItem("currentWordInd");
    setActiveWordInd(null);
  };

  const getSentences = () => {
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
            type: "sentences",
            wordForSentences: activeWordInd !== null && words[activeWordInd],
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
            wordForDefinition: activeWordInd !== null && words[activeWordInd],
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
            onPress={deleteAll}
          >
            <Text style={buttonStyle.buttonText}>Delete All</Text>
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
          activeWordInd={activeWordInd}
          setActiveWordInd={setActiveWordInd}
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
