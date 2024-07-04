import React, { useState, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { Zeed, ZeedProvider, useZeed } from 'react-native-zeed-ai';

export default function App() {
  const [storyCard, setStoryCard] = useState<JSX.Element | null>(null);

  Zeed.init({ apiKey: 'FVJb6WbcGE7YVSH0vpK0aaYzoEEDFbeg36Bmghgs' });

  return (
    <ZeedProvider>
      <View style={styles.container}>
        <StoryGenerator setStoryCard={setStoryCard} />
        {storyCard}
      </View>
    </ZeedProvider>
  );
}

function StoryGenerator({
  setStoryCard,
}: {
  setStoryCard: Dispatch<SetStateAction<JSX.Element | null>>;
}) {
  const { setVisible } = useZeed();

  const generateStory = useCallback(async () => {
    const card = await Zeed.getStoryCard('AMZN', false, 'es');
    setVisible(true);
    setStoryCard(card);
  }, [setStoryCard, setVisible]);

  return <Button title="Generate Story" color="red" onPress={generateStory} />;
}

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
