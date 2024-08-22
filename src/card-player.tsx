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
  StoryRequest,
  SectionInfo,
  CardPlayerProps,
  Section,
} from './types';
import VideoProgressBar from './progressBar';
import LottiePlayer from './lottie-player';
import Zeed from './zeed';
const { width } = Dimensions.get('window');

const CardPlayer: React.FC<CardPlayerProps> = ({
  prefetched,
  visible,
  setVisible,
  eventTraits,
}) => {
  const [img, setImg] = useState<Logo | null>();
  const [currIndices, setCurrIndices] = useState<number[]>([0]);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const progressBarRefs = useRef<Array<any>>([]);
  const lottiePlayerRef = useRef<any>(null);
  const [videoSections, setVideoSections] = useState<Section[]>([]);
  const panResponder = useRef<ReturnType<typeof PanResponder.create> | null>(
    null
  );
  const finasset = eventTraits?.finasset as string;
  const audio = eventTraits?.audio !== undefined ? !!eventTraits.audio : true;
  const lang = Zeed.lang;
  const onPress: (() => void) | undefined =
    typeof eventTraits?.onPress === 'function'
      ? eventTraits.onPress
      : undefined;

  // Update the PanResponder instance whenever videoSections and currIndices changes
  useEffect(() => {
    panResponder.current = PanResponder.create({
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
    });
  }, [videoSections, currIndices]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let sections = [];
        let sectionInfo: { [sectionName: string]: SectionInfo } | undefined =
          {};
        let stories: Card[] = [];
        if (prefetched && prefetched[finasset]) {
          const data = prefetched[finasset];
          sectionInfo = data?.information || {};
          stories = data?.stories || [];
        } else {
          const information = await Zeed?.api?.getSectionInformation(
            [finasset],
            lang
          );
          sectionInfo = information ? information[finasset] : {};
        }

        // Process sections
        for (const key in sectionInfo) {
          const section = sectionInfo[key];
          const sectionText = section?.name;

          if (sectionText) {
            sections.push({
              text: sectionText,
              cards: key === 'section1' && stories.length > 0 ? stories : null,
            });
          }
        }

        // Set initial sections
        setVideoSections(sections);
        setCurrIndices(Array(sections.length).fill(0));

        // Fetch card data for non-section1 sections
        let promises = [];
        for (const key in sectionInfo) {
          if (key === 'section1' && stories.length > 0) continue;
          const section = sectionInfo[key];
          const sectionName = section?.name;
          const args = (section as { arguments?: StoryRequest })?.arguments;

          let promise;
          switch (args?.action) {
            case 'generate':
              promise = Zeed.story(
                args.source_ticker,
                args.fixed,
                0,
                audio,
                args.lang
              );
              break;
            case 'earning':
              promise = Zeed.earning(args.source_ticker);
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

        // Process results as they settle and update sections with cards
        promises.forEach((promise) => {
          promise.then((result) => {
            setVideoSections((prevSections) => {
              return prevSections.map((section) => {
                if (result.key === section.text) {
                  return { ...section, cards: result.result };
                }
                return section;
              });
            });
          });
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [audio, finasset, lang, prefetched]);

  useEffect(() => {
    if (finasset) {
      const fetchImage = async () => {
        const fetchedImg = await Zeed?.api?.getZeedStockImage(finasset);
        setImg(fetchedImg);
      };

      fetchImage();
    }
  }, [finasset]);

  if (!eventTraits || !finasset) {
    return null;
  }

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

  if (!videoSections.length) return null;

  return (
    <Modal
      presentationStyle="pageSheet"
      animationType="slide"
      onRequestClose={() => {
        setVisible(!visible);
        setImg(null);
        setCurrIndices([0]);
        setCurrentSection(0);
        setVideoSections([]);
      }}
      visible={visible}
    >
      <View style={styles.container} {...panResponder.current?.panHandlers}>
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
        <TouchableOpacity style={styles.companyName} onPress={onPress}>
          <Image
            source={{ uri: img?.logo }}
            style={styles.image}
            resizeMode={'contain'}
          />
          <View style={styles.name}>
            <Text style={styles.subtitle} numberOfLines={1}>
              {img?.ticker ?? finasset}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

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

export default CardPlayer;
