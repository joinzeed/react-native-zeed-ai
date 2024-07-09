import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  PanResponder,
  View,
  TouchableOpacity,
  Text,
  Modal,
  Image,
} from 'react-native';
import type {
  Card,
  Logo,
  LanguageType,
  Translations,
  StoryRequest,
} from './types';
import { Language } from './types';
import VideoProgressBar from './progressBar';
import LottiePlayer from './lottie-player';
import { useZeed } from './ZeedProvider';
import Zeed from './zeed';

interface CardPlayerProps {
  ZeedClient: typeof Zeed;
  finasset: string;
  fixed?: string;
  audio: boolean;
  lang: keyof Translations;
}
interface Section {
  text: string;
  cards: Card[] | null;
}

const CardPlayer: React.FC<CardPlayerProps> = ({
  ZeedClient,
  finasset,
  audio,
  lang,
}) => {
  const { visible, setVisible, prefetched, setPrefetched } = useZeed();
  const [img, setImg] = useState<Logo | null>();
  const [currIndices, setCurrIndices] = useState<number[]>([0, 0, 0, 0]);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const progressBarRefs = useRef<Array<any>>([]);
  const lottiePlayerRef = useRef<any>(null);
  const { width } = Dimensions.get('window');
  const [videoSections, setVideoSections] = useState<Section[]>([]);
  // PanResponder to handle swiping between sections
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        setCurrentSection((prevSection) => {
          const newSection =
            dx > 0
              ? Math.max(prevSection - 1, 0)
              : Math.min(prevSection + 1, videoSections.length - 1);

          if (prevSection !== newSection) {
            progressBarRefs.current[prevSection]?.reset();
          }
          return newSection;
        });
        setCurrIndices(currIndices.map(() => 0));
      },
    })
  ).current;

  // Styles for the component
  const styles = StyleSheet.create({
    image: {
      width: 25,
      height: 25,
      borderRadius: 25,
      marginRight: 8,
      padding: 3,
    },
    subtitle: {
      width: '80%',
      fontSize: 17,
      fontWeight: '500',
      color: 'white',
      textDecorationLine: 'underline',
    },
    container: {
      flex: 1,
    },
    progressBarContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 70,
      width: '100%',
      zIndex: 4,
      overflow: 'hidden',
      alignContent: 'center',
      alignItems: 'center',
    },
    nextSession: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: width / 2,
      height: '100%',
      zIndex: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    prevSession: {
      position: 'absolute',
      bottom: 0,
      right: width / 2,
      width: width / 2,
      height: '100%',
      zIndex: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    companyName: {
      position: 'absolute',
      top: 45,
      left: 20,
      height: 30,
      width: '50%',
      zIndex: 5,
      overflow: 'hidden',
      alignContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    name: {
      width: '90%',
    },
    topBar: {
      flexDirection: 'row',
      marginHorizontal: 10,
    },
    eachProgress: {
      flex: 1,
    },
  });

  useEffect(() => {
    const fetchLottieJson = async () => {
      try {
        let sections = [];
        const data = prefetched?.[finasset] || { information: {}, stories: [] };

        // Collect and set all texts first
        if (
          data.stories.length > 0 &&
          (data.information.section1 as { name: keyof LanguageType })?.name
        ) {
          const sectionName = (
            data.information.section1 as { name: keyof LanguageType }
          )?.name;
          sections.push({
            text: Language[sectionName][lang as keyof Translations],
            cards: data.stories,
          });
        }

        for (const key in data.information) {
          if (key === 'section1') continue;
          const section = data.information[key];
          const sectionText =
            Language[
              (section as { name?: keyof LanguageType })
                ?.name as keyof LanguageType
            ]?.[lang as keyof Translations];
          if (sectionText) {
            sections.push({
              text: sectionText,
              cards: null,
            });
          }
        }

        // Set initial sections with texts
        setVideoSections(sections);

        // Create promises for fetching card data
        let promises = [];
        for (const key in data.information) {
          if (key === 'section1') continue;
          const section = data.information[key];
          const sectionName = (section as { name?: keyof LanguageType })?.name;
          const args = (section as { arguments?: StoryRequest })?.arguments;

          let promise;
          switch (args?.action) {
            case 'generate':
              promise = ZeedClient.story(
                args.source_ticker,
                args.fixed,
                0,
                audio,
                args.lang
              );
              break;
            case 'earning':
              promise = ZeedClient.earning(args.source_ticker);
              break;
            default:
              console.log(`No valid action found for ${section}`);
              continue;
          }

          promises.push(
            promise
              .then((result) => {
                return { key: sectionName, result };
              })
              .catch((error) => {
                console.error(`Error processing ${section}:`, error);
                return { key: sectionName, result: [] }; // Return empty result to handle error case
              })
          );
        }

        // Process results and update sections with cards
        const results = await Promise.all(promises);
        setVideoSections((prevSections) => {
          return prevSections.map((section) => {
            const result = results.find(
              (res) =>
                Language[res.key as keyof LanguageType]?.[
                  lang as keyof Translations
                ] === section.text
            );
            if (result) {
              return { ...section, cards: result.result };
            }
            return section;
          });
        });
      } catch (error) {
        console.error('Error fetching Lottie JSON:', error);
      }
    };

    const fetchData = async () => {
      if (prefetched && prefetched[finasset]) {
        fetchLottieJson();
      } else {
        await ZeedClient.prefetchStory(prefetched, setPrefetched, [finasset]);
      }
    };

    fetchData();
  }, [finasset, prefetched, setPrefetched, ZeedClient, audio, lang]);

  useEffect(() => {
    const fetchImage = async () => {
      const fetchedImg = await ZeedClient?.api?.getZeedStockImage(finasset);
      setImg(fetchedImg);
    };

    fetchImage();
  }, [ZeedClient?.api, finasset]);

  // Handle video completion within a section
  const handleVideoComplete = (index: number, section: Card[]): void => {
    if (index === section.length - 1) {
      // Handle end of the section
    } else {
      const updatedIndices = [...currIndices];
      const sectionMaxIndex =
        (videoSections[currentSection]?.cards?.length ?? 0) - 1;

      if (sectionMaxIndex !== undefined) {
        updatedIndices[currentSection] = Math.min(
          (updatedIndices[currentSection] ?? 0) + 1,
          sectionMaxIndex
        );
        setCurrIndices(updatedIndices);
      }
    }
  };

  // Function to handle moving to the next section or video
  const handleNextSection = () => {
    const updatedIndices = [...currIndices];
    let sectionLength = videoSections[currentSection]?.cards?.length || 0;
    let nextIndex = (updatedIndices[currentSection] ?? 0) + 1;
    let nextSection = currentSection;

    if (nextIndex >= sectionLength) {
      nextSection = Math.min(currentSection + 1, videoSections.length - 1);
      nextIndex = 0;

      if (
        nextSection === videoSections.length - 1 &&
        currentSection + 1 > videoSections.length - 1
      ) {
        const nextSectionLottieLength =
          videoSections[nextSection]?.cards?.length;
        nextIndex = nextSectionLottieLength ? nextSectionLottieLength - 1 : 0;
      }
    }

    updatedIndices[nextSection] = nextIndex;

    setCurrentSection((prevSection) => {
      if (prevSection !== nextSection) {
        progressBarRefs.current?.[prevSection]?.reset();
      }
      return nextSection;
    });

    setCurrIndices(updatedIndices);
  };

  // Function to handle moving to the previous section or video
  const handlePrevSection = () => {
    const updatedIndices = [...currIndices];
    const nextIndex = (updatedIndices[currentSection] ?? 0) - 1;

    if (nextIndex < 0) {
      const previousSection = currentSection - 1;
      const maxSection = Math.max(previousSection, 0);

      setCurrentSection((prevSection) => {
        if (prevSection !== maxSection) {
          progressBarRefs.current?.[prevSection]?.reset();
        }
        return maxSection;
      });

      if (previousSection < 0) {
        updatedIndices[maxSection] = 0;
      } else {
        const previousSectionLottieLength =
          videoSections[maxSection]?.cards?.length;
        updatedIndices[maxSection] = previousSectionLottieLength
          ? previousSectionLottieLength - 1
          : 0;
      }
    } else {
      updatedIndices[currentSection] = nextIndex;
    }

    setCurrIndices(updatedIndices);
  };
  // Functions to handle play and pause
  const handlePause = () => {
    lottiePlayerRef.current?.pause();
    progressBarRefs.current?.[currentSection]?.pause();
  };

  const handlePlay = () => {
    lottiePlayerRef.current?.play();
    progressBarRefs.current?.[currentSection]?.play();
  };

  if (videoSections.length > 0) {
    return (
      <Modal
        presentationStyle="pageSheet"
        animationType="slide"
        onRequestClose={() => {
          setVisible(!visible);
        }}
        visible={visible}
      >
        <View style={styles.container} {...panResponder.panHandlers}>
          <View style={styles.progressBarContainer}>
            <View style={styles.topBar}>
              {videoSections.map((section, index) => (
                <View key={index} style={styles.eachProgress}>
                  <VideoProgressBar
                    ref={(el) => (progressBarRefs.current[index] = el)}
                    videos={videoSections[index]?.cards || []}
                    onVideoComplete={() =>
                      handleVideoComplete(
                        currIndices[index] ?? 0,
                        videoSections[index]?.cards ?? []
                      )
                    }
                    currVidIndex={currIndices[index] ?? 0}
                    text={section.text}
                    sectionShown={currentSection === index}
                  />
                </View>
              ))}
            </View>
          </View>
          <LottiePlayer
            ref={lottiePlayerRef}
            lottie={
              videoSections[currentSection]?.cards
                ? videoSections[currentSection]?.cards?.[
                    currIndices[currentSection] ?? 0
                  ]?.render.lottie || {}
                : null
            }
            bg_color={
              videoSections[currentSection]?.cards?.[
                currIndices[currentSection] ?? 0
              ]?.render?.bg_color ?? ''
            }
            width="100%"
          />

          {/* Next section */}
          <TouchableOpacity
            onPress={handleNextSection}
            onLongPress={handlePause}
            onPressOut={handlePlay}
            style={styles.nextSession}
          />

          {/* Previous section */}
          <TouchableOpacity
            onPress={handlePrevSection}
            onLongPress={handlePause}
            onPressOut={handlePlay}
            style={styles.prevSession}
          />
          <TouchableOpacity style={styles.companyName} onPress={() => {}}>
            <Image
              source={{ uri: img?.logo }}
              style={styles.image}
              resizeMode={'contain'}
            />
            <View style={styles.name}>
              <Text style={styles.subtitle} numberOfLines={1}>
                {finasset}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return null;
};

export default CardPlayer;
