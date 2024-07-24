# react-native-zeed-ai

[Zeed Story](https://zeed.ai/companies) brings financial data to life with animated graphics. Our AI-driven animations transform complex financial data into visually appealing, easy-to-understand formats, enhancing the overall impact of your message.

## Platforms Supported

-  ✅  IOS
-  ✅  Android

## Installation

With yarn

```bash
yarn add react-native-zeed-ai
```

With npm

```bash
npm install --save react-native-zeed-ai
```
**Install peer dependencies**
We rely on two peer dependencies, if you already have it in your app you can skip this step.

`expo-av` - used to manage the audio in the lottie
`react-native-webview` - used to display the lottie

To install and use Expo modules, the easiest way to get up and running is with the `install-expo-modules` command. Or if you want to install it manually, please refer to [Expo document](https://docs.expo.dev/bare/installing-expo-modules/).
```bash
npx install-expo-modules@latest
```
To install react-native-webview:

```bash
expo install react-native-webview expo-av
```

**Install Install pods**

For iOS you need to run pod install to complete the installation. Within the `ios` library of your app, run the following
```bash
pod install
```


## Usage

To use `react-native-zeed-ai`, you need to initialize it with an API key, wrap your application components with `ZeedProvider`, and then use the hooks and components provided by the package to generate and display story content.
Install peer dependencies
### Basic Setup
We rely on only two peer dependencies, if you already have it in your app you can skip this step.
react-native-webview - used to display the lottie
expo - to manage the audio inside the lottie

1. Initialize Zeed AI:

   Import and initialize Zeed with your API key at the entry point of your app. If you haven't the key, just contact the [team](https://zeed.ai/companies) to get one!

   ```js
   import { Zeed } from 'react-native-zeed-ai';

   Zeed.init({ apiKey: 'YOUR_API_KEY', lang: 'YOUR LANGUAGE' });
   ```

   | Language | Abbreviation | Supported |
   | -------- | ------------ | --------- |
   | English  | 'en'         | ✅        |
   | Spanish  | 'es'         | ✅        |
   | Arabic   | 'ar'         | ✅        |

2. Wrap your component tree with `ZeedProvider`:

   This allows child components to access Zeed functionalities.

   ```js
   import { ZeedProvider } from 'react-native-zeed-ai';

   return <ZeedProvider>{/* Your app components go here */}</ZeedProvider>;
   ```

### Generating Stories

Implement a button or any trigger in your components to generate and display
stories based on a given symbol. The `Zeed.getStoryCard` function is used to generate a story card. It takes three parameters:
`finasset`: The financial asset symbol (e.g., 'PDD', 'TSLA').
`audio`: A boolean indicating whether to include audio. Default is false.
`onPress`: A callback function that executes when the card is pressed. Default is an empty function.

```javascript
import React, { useState, useCallback } from 'react';
import { View, Button, Alert } from 'react-native';
import { useZeed } from 'react-native-zeed-ai';

const StoryGenerator = () => {
  const [storyCard, setStoryCard] = useState(null);
  const { setVisible } = useZeed();

  const generateStory = useCallback(
    async (symbol: string) => {
      const onPress = () => {
        Alert.alert('Button Pressed', 'The button has been pressed.');
      };
      try {
        const card = await Zeed.getStoryCard(symbol, false, onPress);
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
      <Button title="Generate Story" onPress={() => generateStory('AMZN')} />
      {storyCard}
    </>
  );
};
```

### Navigate to the story

Add your implemented component into your main app.

```javascript
{
  /* Other components */
}
<View>
  <StoryGenerator />
</View>;
{
  /* Other components */
}
```

You can check the [example](example/src/App.tsx) folder for more details.

## Prefetch stories

The `prefetchStory` method allows you to fetch and store story data for a predefined list of stocks or any other list you choose to define. This method is designed to be called perhaps on application load or just before entering a component that requires the story data. Here is how to use `prefetchStory`:

1. Get the the setter function from ` useZeed()`

```javascript
import { useZeed } from 'react-native-zeed-ai';

const { prefetched, setPrefetched } = useZeed();
```

2. Call the prefetchStory Method: You can call this method at an appropriate time in your application flow.

```javascript
Zeed.prefetchStory(prefetched, setPrefetched).catch(console.error);
```

By default, prefetchStory uses a predefined list of popular stocks (AMZN, MSFT, TSLA, etc.). If you want to use a custom list, pass your list of assets as a second argument:

```javascript
const customStockList = ['BABA', 'NFLX', 'SPOT'];
Zeed.prefetchStory(prefetched, setPrefetchedData, customStockList);
```

## Change Language

You can easily change the story language with the following function:

```javascript
Zeed.changeLang({ lang: 'es' });
```
