import ApiClient from './api';
import type { Card } from './types';
import CardPlayer from './card-player';
import React from 'react';

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
    audio: boolean = false
  ): Promise<Card[]> {
    if (!this.api) {
      throw new Error(
        'Zeed API client not initialized. Call init() before using other methods.'
      );
    }
    return this.api.getStories(finasset, fixed, n_cards, audio);
  }

  async getStoryCard(
    finasset: string,
    audio: boolean = false
  ): Promise<JSX.Element | null> {
    try {
      return (
        <CardPlayer
          ZeedClient={this}
          finasset={finasset}
          n_cards={0}
          audio={audio}
        />
      );
    } catch (error) {
      console.error('Error fetching stories on button press', error);
      return null;
    }
  }
}

export default new Zeed();
