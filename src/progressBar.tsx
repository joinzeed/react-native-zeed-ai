import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle,
} from 'react';
import { View, StyleSheet, Animated, Easing, Text } from 'react-native';
import { Audio } from 'expo-av';
import type { Card, SingleLottie } from './types';

interface VideoProgressBarProps {
  videos: Card[];
  onVideoComplete: (index?: number) => void;
  currVidIndex: number;
  text: string;
  sectionShown: boolean;
}

const VideoProgressBar = forwardRef<
  { play: () => void; pause: () => void; reset: () => void },
  VideoProgressBarProps
>((props, parentRef) => {
  const { videos, onVideoComplete, currVidIndex, text, sectionShown } = props;
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      height: 2,
      borderRadius: 2,
      overflow: 'hidden',
      marginTop: 2,
    },
    section: {
      flex: 1,
      height: '100%',
      marginHorizontal: 3,
      borderRadius: 2,
      backgroundColor: '#78777750',
    },
    bar: {
      height: '100%',
      backgroundColor: '#ffffff',
      borderRadius: 2,
    },
    sectionContainer: {
      flexDirection: 'column',
    },
    sectionName: {
      marginTop: 10,
      marginLeft: 3,
      alignSelf: 'flex-start',
      color: sectionShown ? 'white' : '#78777750',
      fontWeight: '600',
      fontSize: 9,
    },
    column: {
      flexDirection: 'column',
    },
    text: {
      marginTop: 10,
      marginLeft: 3,
      alignSelf: 'flex-start',
      color: sectionShown ? 'white' : '#78777750',
      fontWeight: '600',
      fontSize: 9,
    },
    filledWidthBar: {
      width: '100%',
      backgroundColor: '#78777750',
    },
    fullWidthBar: {
      width: '100%',
    },
    zeroWidthBar: {
      width: '0%',
    },
  });

  const [progress, setProgress] = useState<Animated.Value[]>(
    Array.from({ length: videos.length }, () => new Animated.Value(0))
  );
  useEffect(() => {
    setProgress(
      Array.from({ length: videos.length }, () => new Animated.Value(0))
    );
  }, [videos]);

  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const getDuration = async (): Promise<number> => {
      const video = videos[currVidIndex];
      if (!video) {
        throw new Error('Current video is undefined');
      }
      const lottieAnimation: SingleLottie = video.render.lottie;
      const lottieDuration = (lottieAnimation.op / 25) * 1000;

      const audioAsset = lottieAnimation.assets.find(
        (asset) => asset.id === 'audio_0'
      );

      if (audioAsset) {
        const audioUrl = audioAsset.u;
        const soundObject = new Audio.Sound();

        try {
          await soundObject.loadAsync({ uri: audioUrl });
          const playbackStatus = await soundObject.getStatusAsync();

          if (playbackStatus.isLoaded && playbackStatus.durationMillis) {
            const audioDuration = playbackStatus.durationMillis;
            return Math.max(audioDuration, lottieDuration);
          } else {
            throw new Error('Playback status is not loaded');
          }
        } catch (error) {
          console.error('Error loading audio:', error);
          return lottieDuration;
        }
      }

      return lottieDuration;
    };
    if (sectionShown && videos.length > 0) {
      getDuration().then((duration) => {
        const currentProgress = progress[currVidIndex];
        if (!currentProgress) return; // Guard against undefined values.

        animationRef.current = Animated.timing(currentProgress, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: false,
        });

        animationRef.current.start(({ finished }) => {
          if (finished) {
            onVideoComplete(currVidIndex);
          }
        });
      });
    }

    return () => {
      animationRef.current?.stop();
    };
  }, [currVidIndex, sectionShown, progress, onVideoComplete, videos]);

  const width = progress[currVidIndex]?.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const pause = () => {
    animationRef.current?.stop();
  };

  const reset = () => {
    progress.forEach((item) => item.setValue(0));
    animationRef.current?.stop();
  };

  const play = () => {
    animationRef.current?.start(({ finished }) => {
      if (finished) {
        onVideoComplete(currVidIndex);
      }
    });
  };

  useImperativeHandle(parentRef, () => ({
    play,
    pause,
    reset,
  }));

  if (!videos || videos.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <Text numberOfLines={1} style={styles.text}>
          {text}
        </Text>
        <View style={styles.container}>
          <View style={styles.section}>
            <View style={[styles.bar, styles.filledWidthBar]} />
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.column}>
      <Text numberOfLines={1} style={styles.text}>
        {text}
      </Text>
      <View style={styles.container}>
        {sectionShown ? (
          videos.map((_, index) => {
            if (index < currVidIndex) {
              return (
                <View key={index} style={styles.section}>
                  <View style={[styles.bar, styles.fullWidthBar]} />
                </View>
              );
            } else if (index === currVidIndex) {
              return (
                <View key={index} style={styles.section}>
                  <Animated.View style={[styles.bar, { width }]} />
                </View>
              );
            } else {
              return (
                <View key={index} style={styles.section}>
                  <View style={[styles.bar, styles.zeroWidthBar]} />
                </View>
              );
            }
          })
        ) : (
          <View style={styles.section}>
            <View style={[styles.bar, styles.filledWidthBar]} />
          </View>
        )}
      </View>
    </View>
  );
});

export default VideoProgressBar;
