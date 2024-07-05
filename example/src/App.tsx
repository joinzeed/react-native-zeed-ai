import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { Zeed, ZeedProvider, useZeed } from 'react-native-zeed-ai';

export default function App() {
  Zeed.init({ apiKey: 'FVJb6WbcGE7YVSH0vpK0aaYzoEEDFbeg36Bmghgs' });
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
  const { visible, setVisible, setPrefetched } = useZeed();

  useEffect(() => {
    Zeed.prefetchStory(setPrefetched).catch(console.error);
  }, [setPrefetched]);

  useEffect(() => {
    if (!visible) {
      setStoryCard(null);
    }
  }, [visible]);

  const generateStory = useCallback(
    async (symbol: string) => {
      try {
        const card = await Zeed.getStoryCard(symbol, false, 'es');
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
        title="Generate Story for AMZN"
        color="red"
        onPress={() => generateStory('AMZN')}
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
