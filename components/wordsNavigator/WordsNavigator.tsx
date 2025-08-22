import {
  FlatList,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import AntDesign from "@expo/vector-icons/AntDesign";
import { buttonStyle } from "@/styles/buttonStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeSyntheticEvent, //event type ts
  NativeScrollEvent, //event type ts
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Word from "./Word";
import DeleteWord from "./DeleteWord";

type navigatorProps = {
  words: string[];
  setWords: Dispatch<SetStateAction<string[]>>;
  activeWord: number | null;
  setActiveWord: Dispatch<SetStateAction<number | null>>;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const WORD_WIDTH = SCREEN_WIDTH - 160; //20+20 margin on buttons container
// console.log(SCREEN_WIDTH, WORD_WIDTH); //60+60 side elements + 2+2 paddings

function WordsNavigator({
  words,
  setWords,
  activeWord,
  setActiveWord,
}: navigatorProps) {
  // console.log("active word", activeWord);
  ////states and refs////
  const [isDeletingWord, setIsDeletingWord] = useState(false);
  const [scrollOffsetX, setScrollOffsetX] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let ind: string | null;
    const getActiveWord = async () => {
      ind = await AsyncStorage.getItem("activeWord");
      if (ind) {
        //"0", "1"...
        const i = await JSON.parse(ind);
        setActiveWord(i);
        if (flatListRef.current && i !== null) {
          // console.log("scroll", i);
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: i, // The index you want to scroll to
              animated: true, // Set to `true` if you want animation
              viewPosition: 0.5, // 0 = start, 0.5 = center, 1 = end
            });
          }, 300);
        }
        setScrollOffsetX(i * WORD_WIDTH);
      }
    };
    getActiveWord();
  }, []);

  ///////functions/////////
  const fastScroll = (dir: string) => {
    if (isDeletingWord) return;
    let newOffset: number = 0; //0 for default value to shut ts
    if (dir === "forward") {
      newOffset = scrollOffsetX + WORD_WIDTH * 10;
    } else if (dir === "backward") {
      newOffset = scrollOffsetX - WORD_WIDTH * 10;
    } else if (dir === "toStart") {
      newOffset = 0;
    } else if (dir === "toEnd") {
      newOffset = WORD_WIDTH * words.length;
    }

    flatListRef.current?.scrollToOffset({
      offset: newOffset,
      animated: true,
    });
    setScrollOffsetX(newOffset);
  };

  const deleteWord = async () => {
    //null on first load of app without active word index
    if (activeWord !== null) {
      const newWordsArray = [
        ...words.slice(0, activeWord),
        ...words.slice(activeWord + 1),
      ];
      setWords(newWordsArray);
      await AsyncStorage.setItem(
        "wordHelperWords",
        JSON.stringify(newWordsArray)
      );

      setActiveWord((prev: any) => prev - 1); //we checked in 1 line
      const newScrollOffset = scrollOffsetX - WORD_WIDTH;
      flatListRef.current?.scrollToOffset({
        offset: newScrollOffset,
      });
      setScrollOffsetX(newScrollOffset);
    }
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset;
    // console.log(contentOffset.x, WORD_WIDTH);
    const page = Math.ceil(Math.floor(contentOffset.x) / WORD_WIDTH); //starts with 0
    setActiveWord(page);
    const saveIndToStorage = async () => {
      await AsyncStorage.setItem("activeWord", JSON.stringify(page));
    };
    saveIndToStorage();
    setScrollOffsetX(contentOffset.x);
  };

  const nativeScrollGesture = Gesture.Native();

  return (
    <GestureHandlerRootView>
      <View style={{ flex: 1 }}>
        <View style={styles.wordsNumbersContainer}>
          <Text style={{ marginBottom: 10 }}>
            {activeWord === null ? 0 : activeWord + 1} / {words.length}
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[buttonStyle.button, styles.navButton]}
            onPress={() => fastScroll("backward")}
            onLongPress={() => fastScroll("toStart")}
          >
            <AntDesign name="doubleleft" size={24} color="black" />
          </TouchableOpacity>
          {/* //WORDs/ */}
          <GestureDetector gesture={nativeScrollGesture}>
            <FlatList
              ref={flatListRef}
              data={words}
              style={styles.flatList}
              onScrollToIndexFailed={({ index }) => {
                setTimeout(() => {
                  flatListRef.current?.scrollToIndex({
                    index,
                    animated: false,
                  });
                }, 200);
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={!isDeletingWord}
              pagingEnabled
              decelerationRate="normal"
              onMomentumScrollEnd={onScrollEnd}
              getItemLayout={(data, index) => ({
                length: WORD_WIDTH,
                offset: WORD_WIDTH * index,
                index,
              })}
              renderItem={(word) => (
                <Word
                  word={word}
                  setIsDeletingWord={setIsDeletingWord}
                  isDeletingWord={isDeletingWord}
                />
              )}
            ></FlatList>
          </GestureDetector>
          {/* //WORDs/ */}
          <TouchableOpacity
            style={[buttonStyle.button, styles.navButton]}
            onPress={() => fastScroll("forward")}
            onLongPress={() => fastScroll("toEnd")}
          >
            <AntDesign name="doubleright" size={24} color="black" />
          </TouchableOpacity>
        </View>
        {isDeletingWord && (
          <DeleteWord
            words={words}
            activeWord={activeWord}
            setIsDeletingWord={setIsDeletingWord}
            deleteWord={deleteWord}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    // flex: 1,
    minHeight: 60,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "hsl(51 30% 90%)",
    borderRadius: 50,
    // borderWidth: 1,
    // borderColor: "green",
  },
  navButton: {
    width: 60,
    flex: 1,
    zIndex: 10,
    borderRadius: 50,
    backgroundColor: "hsl(51 30% 90%)",
  },
  navButtonText: {
    fontSize: 24,
    color: "black",
  },

  flatList: {
    height: "100%",
    flex: 1,
    borderRadius: 40,
    backgroundColor: "hsl(51 30% 85%)",
    // borderColor: "red",
    // borderWidth: 1,
    // overflow: "visible",
  },

  wordsNumbersContainer: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WordsNavigator;
