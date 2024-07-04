import type { ApiResponse, StoryRequest, Card, SingleLottie } from './types';
import { DefaultHost } from './constants';

class ApiClient {
  apiKey?: string;
  apiHost: string;

  constructor(apiKey?: string, apiHost: string = DefaultHost) {
    this.apiKey = apiKey;
    this.apiHost = apiHost;
  }

  // Method to fetch cards from the API
  async fetchCards<T extends Card>(
    requestData: StoryRequest = {
      action: '',
      fixed: [],
      source_ticker: '',
      n_cards: 0,
      audio: false,
      lang: 'en',
    }
  ): Promise<ApiResponse<T>> {
    // Ensure the API key is provided
    if (!this.apiKey) {
      throw new Error(
        'Error sending event to Zeed-AI: missing API key. Make sure you call Zeed.init() before calling any other methods, see README for details'
      );
    }

    const config: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(requestData),
    };

    try {
      const response = await fetch(this.apiHost, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiResponse<T> = await response.json();
      if (!data.cards) {
        console.error('No cards found in the API response', requestData);
        return { cards: [] };
      }
      const filtered = (data.cards as Card[])
        .filter((item) => item?.render)
        .map((item) => ({
          render: item.render,
          request: item.request,
          questions: item.questions,
        }));
      return { cards: filtered };
    } catch (error) {
      console.error(
        'fetchCards error',
        error instanceof Error ? error.message : error,
        requestData
      );
      return { cards: [] };
    }
  }

  // Method to get a flowchart from the API
  async getFlow(finasset: string, lang: string): Promise<ApiResponse<Card[]>> {
    // Ensure the API key is provided
    if (!this.apiKey) {
      throw new Error(
        'Error sending event to Zeed-AI: missing API key. Make sure you call Zeed.init() before calling any other methods, see README for details'
      );
    }

    const config: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify({
        action: 'flowchart',
        source_ticker: finasset,
        lang: lang,
      }),
    };

    try {
      const response = await fetch(this.apiHost, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.cards || data.cards.length === 0) {
        console.error('No cards found in the API response', config.body);
        return { cards: [] };
      }
      const lottieData = Array.isArray(data.cards[0]?.render.lottie)
        ? data.cards[0]
        : [data.cards[0]];
      const filtered = lottieData.render.lottie.map((lottie: SingleLottie) => ({
        render: {
          lottie: lottie,
          bg_color: lottieData.render.bg_color,
        },
        request: lottieData.request,
      }));
      return { cards: filtered };
    } catch (error) {
      console.error(
        'getFlow error',
        error instanceof Error ? error.message : error,
        config.body
      );
      return { cards: [] };
    }
  }

  // Method to get stories from the API
  async getStories(
    finasset: string,
    fixed: number[],
    n_cards: number,
    audio: boolean = false,
    lang: string = 'en'
  ): Promise<Card[]> {
    const requestData: StoryRequest = {
      action: 'generate',
      fixed: fixed.filter((item) => item !== 30),
      source_ticker: finasset,
      n_cards: n_cards,
      audio: audio,
      lang: lang,
    };

    try {
      if (fixed.includes(30)) {
        const [remainingDataCards, flowData] = await Promise.all([
          this.fetchCards<Card>(requestData),
          this.getFlow(finasset, lang),
        ]);

        return [...(remainingDataCards.cards || []), ...(flowData.cards || [])];
      } else {
        const result = await this.fetchCards<Card>(requestData);
        return result.cards || [];
      }
    } catch (error) {
      console.error('Error in getStories', error);
      return [];
    }
  }
}

export default ApiClient;
