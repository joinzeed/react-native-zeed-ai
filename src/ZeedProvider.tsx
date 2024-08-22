import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Card, Information, EventTraits } from './types';
import CardPlayer from './card-player';
// Define the properties for the Zeed context
interface ZeedContextProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  prefetched:
    | { [key: string]: { information: Information; stories: Card[] } }
    | undefined;
  setPrefetched: (prefetched: {
    [key: string]: { information: Information; stories: Card[] };
  }) => void;
  eventTraits: EventTraits | undefined;
  setEventTraits: (eventTraits: EventTraits | undefined) => void;
}

// Create the Zeed context with default value as undefined
export const ZeedReadyContext = createContext<ZeedContextProps | undefined>(
  undefined
);

// Custom hook to use the Zeed context
export const useZeed = (): ZeedContextProps => {
  const context = useContext(ZeedReadyContext);
  // Throw an error if the context is used outside of the ZeedProvider
  if (!context) {
    throw new Error('useZeedReady must be used within a ZeedProvider');
  }
  return context;
};

// Define the properties for the ZeedProvider component
interface ZeedProviderProps {
  children: ReactNode;
}

// ZeedProvider component that provides the Zeed context to its children
export const ZeedProvider = ({ children }: ZeedProviderProps): JSX.Element => {
  // State for the visibility
  const [eventTraits, setEventTraits] = useState<EventTraits | undefined>(
    undefined
  );
  const [visible, setVisible] = useState<boolean>(true);
  const [prefetched, setPrefetched] = useState<{
    [key: string]: { information: Information; stories: Card[] };
  }>();
  return (
    // Provide the Zeed context to the children
    <>
      <ZeedReadyContext.Provider
        value={{
          visible,
          setVisible,
          prefetched,
          setPrefetched,
          eventTraits,
          setEventTraits,
        }}
      >
        {children}
        <CardPlayer
          prefetched={prefetched}
          visible={visible}
          setVisible={setVisible}
          eventTraits={eventTraits}
        />
      </ZeedReadyContext.Provider>
    </>
  );
};
