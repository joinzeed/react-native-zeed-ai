import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  PanResponder,
  View,
  TouchableOpacity,
  Text,
  Modal,
} from 'react-native';
import type { Card, Lottie } from './types';
import VideoProgressBar from './progressBar';
import LottiePlayer from './lottie-player';
import { useZeed } from './ZeedProvider';
import Zeed from './zeed';

interface CardPlayerProps {
  ZeedClient: typeof Zeed;
  finasset: string;
  fixed?: string;
  n_cards: number;
  audio: boolean;
}

const CardPlayer: React.FC<CardPlayerProps> = ({
  ZeedClient,
  finasset,
  n_cards,
  audio,
}) => {
  const { visible, setVisible } = useZeed();
  const [section1, setSection1] = useState<Card[]>([]);
  const [section2, setSection2] = useState<Card[]>([]);
  const [section3, setSection3] = useState<Card[]>([]);
  const [section4, setSection4] = useState<Card[]>([]);
  const [currIndices, setCurrIndices] = useState<number[]>([0, 0, 0, 0]);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const progressBarRefs = useRef<Array<any>>([]);
  const lottiePlayerRef = useRef<any>(null);
  const { width } = Dimensions.get('window');
  const videoSections = [
    { text: 'Performance', cards: section1 },
    { text: 'Industry', cards: section2 },
    { text: 'Ratings', cards: section3 },
    { text: 'Financials', cards: section4 },
  ];
  const sectionNumber = videoSections.length;

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
              : Math.min(prevSection + 1, sectionNumber - 1);

          if (prevSection !== newSection) {
            progressBarRefs.current[prevSection]?.reset();
          }
          return newSection;
        });
        setCurrIndices([0, 0, 0, 0]);
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

  // Fetch data when component mounts
  useEffect(() => {
    const fetchLottieJson = async () => {
      try {
        const data: Card[] = await ZeedClient.story(
          finasset,
          [27, 29],
          n_cards,
          audio
        );
        if (data.length > 0) {
          setSection1(data);

          const promises: Promise<Card[]>[] = [
            ZeedClient.story(finasset, [7, 1, 14, 19], 0, audio),
            ZeedClient.story(finasset, [26], 0, audio),
            ZeedClient.story(finasset, [30], 0, audio),
          ];

          promises.forEach(async (promise, index) => {
            const sectionData: Card[] = await promise;
            switch (index) {
              case 0:
                setSection2(sectionData);
                break;
              case 1:
                setSection3(sectionData);
                break;
              case 2:
                setSection4(sectionData);
                break;
              default:
                break;
            }
          });
        }
      } catch (error: any) {
        console.error('Error fetching stories:', error);
      }
    };

    fetchLottieJson();
  }, [finasset, ZeedClient, audio, n_cards]);

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
      nextSection = Math.min(currentSection + 1, sectionNumber - 1);
      nextIndex = 0;

      if (
        nextSection === sectionNumber - 1 &&
        currentSection + 1 > sectionNumber - 1
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

  if (section1.length > 0) {
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
              videoSections[currentSection]?.cards.length === 0
                ? ({} as Lottie)
                : videoSections[currentSection]?.cards[
                    currIndices[currentSection] ?? 0
                  ]?.render?.lottie ?? ({} as Lottie)
            }
            bg_color={
              videoSections[currentSection]?.cards[
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
