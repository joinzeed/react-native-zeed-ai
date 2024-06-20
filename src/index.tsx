// Importing modules
import Zeed from './zeed';
import { ZeedProvider, useZeed } from './ZeedProvider';

// Defining the structure of the exports
export interface Exports {
  Zeed: typeof Zeed;
}

// Exporting modules
export { Zeed, ZeedProvider, useZeed };
