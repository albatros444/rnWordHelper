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



export default function HomeScreen() {
  const [inputText, setInputText] = useState<string>("");
  const [words, setWords] = useState<string[]>([]);
  const [activeWordInd, setActiveWordInd] = useState<null | number>(null);
  //gigaChat responses
  const [gigaResponse,setGigaResponse]= useState([])
  ///


  
  // console.log("hello")
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
  
  const getSentences = ()=>{
    console.log("touched")
    try{
      fetch('http://192.168.0.102:3000', 
      // fetch("http://77.222.47.206:3000",
        {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ // Convert the payload to a JSON string
        type: "sentences",
        wordForSentences: activeWordInd!==null&&words[activeWordInd]
      }),
    }
  )
      .then(response=>response.json())
      .then(data=>{
        console.log("data from Giga:", data)
        setGigaResponse(data)
      })
    }catch(err){
      console.log(err)
    }
  }
  

  const getDefinition = ()=>{
    console.log("touched")
    try{
      fetch('http://192.168.0.102:3000', 
      // fetch("http://77.222.47.206:3000",
        {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ // Convert the payload to a JSON string
        type: "definition",
        wordForDefinition: activeWordInd!==null&&words[activeWordInd]
      }),
    }
  )
      .then(response=>response.json())
      .then(data=>{
        console.log("data from Giga:", data)
        setGigaResponse(data)
      })
    }catch(err){
      console.log(err)
    }
  }

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
      {(gigaResponse.type==="sentences")&&gigaResponse.response.map((word, i) => (
        <View key={i}>
          <Text style={styles.responseText}>{word}</Text>
        </View>
      ))}
      {gigaResponse.type==="definition"&&<View>
          <Text style={styles.responseText}>{gigaResponse.response}</Text>
        </View>}
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
    flexWrap: "wrap",
    gap: 13,
    justifyContent: "center",
  },
  responseText: {
   
    fontSize: 18
  }
});