import type {
  ApiResponse,
  StoryRequest,
  Card,
  SingleLottie,
  Logo,
  Information,
  Translations,
} from './types';
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
      const response = await fetch(
        this.apiHost + '/visual_story_teller',
        config
      );
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
      const response = await fetch(
        this.apiHost + '/visual_story_teller',
        config
      );
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
    lang: keyof Translations
  ): Promise<Card[]> {
    const requestData: StoryRequest = {
      action: 'generate',
      fixed: fixed.filter((item) => item !== 41),
      source_ticker: finasset,
      n_cards: n_cards,
      audio: audio,
      lang: lang,
    };

    try {
      if (fixed.includes(41)) {
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

  async getEarning(finasset: string): Promise<Card[]> {
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
        action: 'earning',
        source_ticker: finasset,
      }),
    };

    try {
      const response = await fetch(
        this.apiHost + '/visual_story_teller',
        config
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.cards) {
        console.error('No earnings cards found in the API response');
        return [];
      }
      const filtered = (data.cards as Card[])
        .filter((item) => item?.render)
        .map((item) => ({
          render: item.render,
          request: item.request,
        }));
      return filtered;
    } catch (error) {
      console.error('Error in getEarning', error);
      return [];
    }
  }

  async getSectionInformation(
    stocklist: string[],
    lang: keyof Translations
  ): Promise<{ [ticker: string]: Information }> {
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
        action: 'prefetch',
        tickers: stocklist,
        lang: lang,
      }),
    };

    try {
      const response = await fetch(
        this.apiHost + '/visual_story_teller',
        config
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getSectionInformation', error);
      return {};
    }
  }

  async getPrefetchedStory(stocklist: string[], lang: keyof Translations) {
    console.log('start prefetch');
    const stories: {
      [key: string]: { information: Information; stories: Card[] };
    } = {};

    try {
      const infor = await this.getSectionInformation(stocklist, lang);
      // Map each stock item to a promise that fetches its stories
      const promises = stocklist.map(async (item) => {
        try {
          const section1Information = infor[item] as Information;
          const sectionInfo = section1Information['section1'];
          const args = sectionInfo?.arguments;
          if (args) {
            const storyData = await this.getStories(
              item,
              args.fixed,
              0,
              true,
              args.lang
            );
            stories[item] = {
              information: infor[item] || {},
              stories: storyData,
            };
          } else {
            stories[item] = {
              information: infor[item] || {},
              stories: [],
            };
          }
        } catch (error) {
          console.error(`Error fetching stories for ${item}:`, error);
          stories[item] = {
            information: infor[item] || {},
            stories: [],
          };
        }
      });

      // Wait for all promises to resolve
      await Promise.all(promises);
      console.log('prefetch stories finished!');
      return stories; // Return the populated stories object
    } catch (error) {
      console.error('Error in getPrefetchedStory:', error);
      return null; // Handle any unexpected errors
    }
  }

  // Method to get a single stock image from the API
  async getZeedStockImage(finasset: string): Promise<Logo | null> {
    // Ensure the API key is provided
    if (!this.apiKey) {
      throw new Error(
        'Error sending event to Zeed-AI: missing API key. Make sure you call Zeed.init() before calling any other methods, see README for details'
      );
    }
    const params = new URLSearchParams({ stock_tickers: finasset });

    const config: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    };

    try {
      const response = await fetch(
        `${this.apiHost}/logos/stock?${params.toString()}`,
        config
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const logoList = JSON.parse(data?.data?.body);
      if (logoList && logoList.length > 0) {
        const image = {
          logo: logoList[0]?.image_url,
          blurhash: logoList[0]?.blurhash,
        };
        return image;
      } else {
        return null;
      }
    } catch (error) {
      console.error('getZeedStockImage error', error);
      throw error;
    }
  }
}

export default ApiClient;
