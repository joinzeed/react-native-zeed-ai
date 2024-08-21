import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Button, Alert } from 'react-native';
import { Zeed, ZeedProvider, useZeed } from '@joinzeed/react-native-zeed-ai';

export default function App() {
  Zeed.init({
    clientId: 'YOUR_CLIENT_ID',
    apiKey: 'YOUR_API_KEY',
    userId: 'YOUR_USER_KEY',
    lang: 'en',
  });
  return (
    <ZeedProvider>
      <View style={styles.container}>
        <StoryGenerator />
      </View>
    </ZeedProvider>
  );
}
const StoryGenerator = () => {
  const [storyCard, setStoryCard] = useState<JSX.Element | null>(null);
  const { visible, setVisible, setPrefetched, prefetched } = useZeed();

  Zeed.prefetchStory(prefetched, setPrefetched).catch(console.error);

  useEffect(() => {
    if (!visible) {
      setStoryCard(null);
    }
  }, [visible]);

  const generateStory = useCallback(
    async (symbol: string) => {
      const onPress = () => {
        Alert.alert('Button Pressed', 'The button has been pressed.');
      };
      try {
        const card = await Zeed.getStoryCard(symbol, true, onPress);
        setStoryCard(card);
        setVisible(true);
      } catch (error) {
        console.error('Failed to generate story:', error);
      }
    },
    [setVisible]
  );
  return (
    <>
      <Button
        title="Generate Story for QQQ"
        color="red"
        onPress={() => generateStory('QQQ')}
      />
      <Button
        title="Generate Story for TSLA"
        color="red"
        onPress={() => generateStory('TSLA')}
      />
      {storyCard}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 100,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
