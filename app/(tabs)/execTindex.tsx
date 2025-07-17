import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import WordsNavigator from "@/components/WordsNavigator";
import { buttonStyle } from "@/styles/buttonStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "@react-navigation/elements";
import { Image } from "expo-image";

import { useEffect, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import {
  useLLM,
  LLAMA3_2_1B,
  LLAMA3_2_TOKENIZER,
  LLAMA3_2_TOKENIZER_CONFIG,

} from 'react-native-executorch';





export default function HomeScreen() {
  const [inputText, setInputText] = useState<string>("");
  const [words, setWords] = useState<string[]>([]);
  const [activeWordInd, setActiveWordInd] = useState<null | number>(null);

  const llm = useLLM({
    modelSource: LLAMA3_2_1B,
    tokenizerSource: LLAMA3_2_TOKENIZER,
    tokenizerConfigSource: LLAMA3_2_TOKENIZER_CONFIG,
  });


const talkToLLM = () =>{
  const chat = [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Hi!' },
      { role: 'assistant', content: 'Hi!, how can I help you?'},
      { role: 'user', content: `Give me 5 simple sentences using the word ${words[activeWordInd]}. Give no explanations. Don't use synonyms.` },
    ];
  
    // Chat completion
  llm.generate(chat);
}

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

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Add the word</ThemedText>
        <HelloWave />
      </ThemedView>
      <View>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={saveWord}
        />
      </View>
      {/* save buttons  */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[buttonStyle.button, { width: "45%" }]}
          onPress={talkToLLM}
        >
          <Text style={buttonStyle.buttonText}>Get response</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[buttonStyle.button, { width: "45%" }]}
          onPress={deleteAll}
        >
          <Text style={buttonStyle.buttonText}>Delete All</Text>
        </TouchableOpacity>
      </View>
      <WordsNavigator
        words={words}
        activeWordInd={activeWordInd}
        setActiveWordInd={setActiveWordInd}
      />
      
      <Text style={styles.responseText}>{llm.isGenerating&&!llm.response?"...wait":llm.response}</Text>
      


      {/* {words.map((word, i) => (
        <View key={i}>
          <Text>{word}</Text>
        </View>
      ))} */}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  input: {
    height: "auto",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    fontSize: 20,
    justifyContent: "center",
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 13,
    justifyContent: "center",
  },
  responseText: {
    marginBlock: 20,
    fontSize: 18
  }
});