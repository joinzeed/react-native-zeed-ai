# react-native-zeed-ai

[Zeed Story](https://zeed.ai/companies) brings financial data to life with animated graphics. Our AI-driven animations transform complex financial data into visually appealing, easy-to-understand formats, enhancing the overall impact of your message.

## Platforms Supported

- [x] IOS
- [x] Android

## Installation

With yarn

```bash
yarn add react-native-zeed-ai
```

With npm

```bash
npm install react-native-zeed-ai
```

## Usage

To use `react-native-zeed-ai`, you need to initialize it with an API key, wrap your application components with ZeedProvider, and then use the hooks and components provided by the package to generate and display story content.

### Basic Setup

1. Initialize Zeed AI:

   Import and initialize Zeed with your API key at the entry point of your app. If you haven't the key, just contact the [team](https://zeed.ai/companies) to get one!

   ```js
   import { Zeed } from 'react-native-zeed-ai';

   Zeed.init({ apiKey: 'YOUR_API_KEY' });
   ```

2. Wrap your component tree with `ZeedProvider`:

   This allows child components to access Zeed functionalities.

   ```js
   import { ZeedProvider } from 'react-native-zeed-ai';

   return <ZeedProvider>{/* Your app components go here */}</ZeedProvider>;
   ```

### Generating Stories

Implement a button or any trigger in your components to generate and display
stories based on a given symbol.

```javascript
import React, { useState, useCallback } from 'react';
import { View, Button } from 'react-native';
import { useZeed } from 'react-native-zeed-ai';

const StoryGenerator = () => {
  const [storyCard, setStoryCard] = useState(null);
  const { setVisible } = useZeed();

  const generateStory = useCallback(
    async (symbol) => {
      try {
        const card = await Zeed.getStoryCard(symbol);
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

You can check the [example](example/src/App.tsx) folder for more details.

## Prefetch stories

The `prefetchStory` method allows you to fetch and store story data for a predefined list of stocks or any other list you choose to define. This method is designed to be called perhaps on application load or just before entering a component that requires the story data. Here is how to use `prefetchStory`:

1. Define a Function to Handle Prefetched Data: Create a function that will handle the data once prefetched. This function will be used to update your application state or cache.

```javascript
function setPrefetchedData(data) {
  // Handle or store the prefetched data as needed
}
```

2. Call the prefetchStory Method: You can call this method at an appropriate time in your application flow. Provide the function defined above as a callback to handle the prefetched data.

```javascript
function setPrefetchedData(data) {
  Zeed.prefetchStory(setPrefetchedData);
}
```

By default, prefetchStory uses a predefined list of popular stocks (AMZN, MSFT, TSLA, etc.). If you want to use a custom list, pass your list of assets as a second argument:

```javascript
const customStockList = ['BABA', 'NFLX', 'SPOT'];
Zeed.prefetchStory(setPrefetchedData, customStockList);
```
