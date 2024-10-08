import ApiClient from './api';
import type { Card, Information, Translations } from './types';

class Zeed {
  api?: ApiClient;
  clientId?: string;
  userId?: string;
  apiKey?: string;
  lang!: keyof Translations;
  // Minimal initialization that is expected to be called on app boot
  init = ({
    clientId,
    userId,
    apiKey,
    lang,
  }: {
    clientId: string;
    userId: string;
    apiKey: string;
    lang: keyof Translations;
  }) => {
    this.clientId = clientId;
    this.userId = userId;
    this.apiKey = apiKey;
    this.api = new ApiClient(apiKey, clientId, userId); // Initialize the ApiClient with the apiKey
    this.lang = lang;
  };

  changeLang = ({ lang }: { lang: keyof Translations }) => {
    this.lang = lang;
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

  // Method to call getEarning from ApiClient
  async earning(finasset: string): Promise<Card[]> {
    if (!this.api) {
      throw new Error(
        'Zeed API client not initialized. Call init() before using other methods.'
      );
    }
    return this.api.getEarning(finasset);
  }

  prefetchStory = async (
    prefetched:
      | { [key: string]: { information: Information; stories: Card[] } }
      | undefined,
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
      if (prefetched) {
        stocklist = stocklist.filter((stock) => !(stock in prefetched));
      }
      if (stocklist.length > 0) {
        const prefetchedData = await this.api.getPrefetchedStory(
          stocklist,
          this.lang
        );
        setPrefetched(
          (prevStories: {
            [key: string]: { information: Information; stories: Card[] };
          }) => ({
            ...prevStories,
            ...prefetchedData,
          })
        );
      }
    } catch (error) {
      console.error('Error prefetching stories:', error);
    }
  };
}

export default new Zeed();
