export type EventTraitValue = string | number | boolean | Date | (() => void);
export type EventTraits = { [key: string]: EventTraitValue };

export type PresentationStyle =
  | 'fullScreen'
  | 'pageSheet'
  | 'formSheet'
  | 'overFullScreen';

export type ApiResponseError = {
  code: number;
  message?: string;
  type: string;
  user_message?: string;
};

export type ApiResponse<ResultsType> = {
  errors?: ApiResponseError[];
  error?: any;
  results?: ResultsType;
  cards?: Card[];
  data?: any;
};

export type Lotties = Lottie[] | undefined;
export type Lottie =
  | {
      v: string; // Version of the Bodymovin schema
      fr: number; // Frame rate of the animation
      ip: number; // In-point of the animation (start frame)
      op: number; // Out-point of the animation (end frame)
      w: number; // Width of the animation
      h: number; // Height of the animation
      nm: string; // Name of the animation
      ddd: number; // 3D layer indicator (0 = 2D, 1 = 3D)
      assets: Asset[]; // Array of assets used in the animation
      layers: Layer[]; // Array of animation layers
    }
  | {}
  | null;

export type Asset = {
  id: string; // Asset identifier
  w?: number; // Width (for images)
  h?: number; // Height (for images)
  u?: string; // URI of the image folder
  p?: string; // Path to the asset
  e?: number; // Asset is external (1) or not (0)
  layers?: Layer[]; // Layers for precompositions
};

export type Layer = {
  ty: number; // Layer type (e.g., shape, solid, image, null, text)
  nm: string; // Name of the layer
  ind: number; // Index in the composition
  ks: any; // Transform properties like position, scale, rotation, etc.
  ao: number; // Auto-Orient along path (0 or 1)
  ip: number; // In-point of the layer in frames
  op: number; // Out-point of the layer in frames
};

export type StoryRequest = {
  action: string;
  fixed: number[];
  source_ticker: string;
  n_cards: number;
  audio: boolean;
  lang: keyof Translations;
  tickers?: string[];
  client_id?: string;
  user_id?: string;
};
export type Card = {
  render: Render;
  request: Record<string, unknown>;
  questions?: string[];
};

export type Flow = {
  card?: Card;
};
export type SingleLottie = {
  assets: Array<{ id: string; u: string }>;
  op: number;
};
export type Render = {
  lottie: SingleLottie;
  bg_color: string;
};

export type Logo = {
  logo: string;
  blurhash: string;
  company_name: string;
  ticker?: string;
};

export type Information = { [sectionName: string]: SectionInfo };

export interface Translations {
  en: string;
  es: string;
  ar: string;
}

export type SectionInfo = {
  arguments: StoryRequest;
  name: string;
};

export interface CardPlayerProps {
  prefetched?:
    | { [key: string]: { information: Information; stories: Card[] } }
    | undefined;
  visible?: boolean;
  setVisible: (visible: boolean) => void;
  eventTraits?: EventTraits;
}
export interface Section {
  text: string;
  cards: Card[] | null;
}
