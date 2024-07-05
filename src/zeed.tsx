import ApiClient from './api';
import type { Card } from './types';
import CardPlayer from './card-player';
import React from 'react';
import type { Translations } from './constants';
class Zeed {
  api?: ApiClient;
  apiKey?: string;

  // Minimal initialization that is expected to be called on app boot
  init = ({ apiKey }: { apiKey: string }) => {
    this.apiKey = apiKey;
    this.api = new ApiClient(apiKey); // Initialize the ApiClient with the apiKey
  };
  // Method to call getStories from ApiClient
  async story(
    finasset: string,
    fixed: number[],
    n_cards: number,
    audio: boolean = false,
    lang: keyof Translations
  ): Promise<Card[]> {
    if (!this.api) {
      throw new Error(
        'Zeed API client not initialized. Call init() before using other methods.'
      );
    }
    return this.api.getStories(finasset, fixed, n_cards, audio, lang);
  }

  async getStoryCard(
    finasset: string,
    audio: boolean = false,
    lang: keyof Translations
  ): Promise<JSX.Element | null> {
    try {
      return (
        <CardPlayer
          ZeedClient={this}
          finasset={finasset}
          n_cards={0}
          audio={audio}
          lang={lang}
        />
      );
    } catch (error) {
      console.error('Error fetching stories on button press', error);
      return null;
    }
  }

  prefetchStory = async (
    setPrefetched: Function,
    stocklist: string[] = [
      'AMZN',
      'MSFT',
      'TSLA',
      'AAPL',
      'GOOG',
      'META',
      'NVDA',
    ]
  ) => {
    if (!this.api) {
      throw new Error(
        'Zeed API client not initialized. Call init() before using other methods.'
      );
    }

    try {
      const prefetchedData = await this.api.getPrefetchedStory(stocklist);
      setPrefetched(prefetchedData || {});
    } catch (error) {
      console.error('Error prefetching stories:', error);
    }
  };
}

export default new Zeed();
