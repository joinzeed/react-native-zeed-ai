import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Zeed, ZeedProvider, useZeed } from 'react-native-zeed-ai';

export default function App() {
  Zeed.init({
    clientId: 'YOUR_CLIENT_ID',
    apiKey: 'YOUR_API_KEY',
    userId: 'YOUR_USER_ID',
    lang: 'en',
  });
  return (
    <ZeedProvider>
      <View style={styles.container}>
        <StoryGenerator />
      </View>
    </ZeedProvider>
  );
}

const StockLogo = ({
  logo,
  onPress,
}: {
  symbol: string;
  logo: string;
  onPress: Function;
}) => (
  <TouchableOpacity
    style={styles.logoWrapper}
    onPress={() => {
      onPress();
    }}
  >
    <Image source={{ uri: logo }} style={styles.stockLogo} />
  </TouchableOpacity>
);

const StoryGenerator = () => {
  const { prefetched, setPrefetched, setVisible, setEventTraits } = useZeed();
  Zeed.prefetchStory(prefetched, setPrefetched).catch(console.error);

  const generateStory = useCallback(
    async (symbol: string) => {
      try {
        setEventTraits({
          finasset: symbol,
        });
        setVisible(true);
      } catch (error) {
        console.error('Failed to generate story:', error);
      }
    },
    [setEventTraits, setVisible]
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={{
            uri: 'https://ipspmmzwanexfeyyrtul.supabase.co/storage/v1/object/public/logos/zeed.png',
          }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.portfolioCard}>
        <Text style={styles.portfolioLabel}>Portfolio Value</Text>
        <Text style={styles.portfolioValue}>$7,406.82</Text>
        <View style={styles.portfolioDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Day P/L</Text>
            <Text style={styles.negativeValue}>-$9.78</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Buying Power</Text>
            <Text style={styles.detailValue}>$2.10</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total P/L</Text>
            <Text style={styles.positiveValue}>+$2465.78</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Watchlist</Text>
        {[
          {
            symbol: 'ABNB',
            name: 'Airbnb',
            price: '$736.60',
            change: '-$8.18 (1.10%)',
            logo: 'https://ipspmmzwanexfeyyrtul.supabase.co/storage/v1/object/public/logos/ABNB.jpg',
          },
          {
            symbol: 'BAC',
            name: 'Bank of America',
            price: '$306.37',
            change: '+$3.34 (1.10%)',
            logo: 'https://ipspmmzwanexfeyyrtul.supabase.co/storage/v1/object/public/logos/BAC.jpg',
          },
          {
            symbol: 'META',
            name: 'Meta Platforms',
            price: '$736.60',
            change: '-$8.18 (1.10%)',
            logo: 'https://ipspmmzwanexfeyyrtul.supabase.co/storage/v1/object/public/logos/META.jpg',
          },
          {
            symbol: 'AMZN',
            name: 'Amazon',
            price: '$3,186.63',
            change: '-$70.30 (2.16%)',
            logo: 'https://ipspmmzwanexfeyyrtul.supabase.co/storage/v1/object/public/logos/AMZN.jpg',
          },
        ].map((stock) => (
          <View key={stock.symbol} style={styles.stockItem}>
            <View style={styles.stockInfo}>
              <StockLogo
                symbol={stock.symbol}
                logo={stock.logo}
                onPress={() => generateStory(stock.symbol)}
              />
              <View>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                <Text style={styles.stockName}>{stock.name}</Text>
              </View>
            </View>
            <View style={styles.stockPriceInfo}>
              <Text style={styles.stockPrice}>{stock.price}</Text>
              <Text
                style={
                  stock.change.startsWith('-')
                    ? styles.negativeChange
                    : styles.positiveChange
                }
              >
                {stock.change}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Open Positions</Text>
        <View style={styles.stockItem}>
          <View style={styles.stockInfo}>
            <StockLogo
              symbol="AAPL"
              logo="https://ipspmmzwanexfeyyrtul.supabase.co/storage/v1/object/public/logos/AAPL.jpg"
              onPress={() => generateStory('AAPL')}
            />
            <View>
              <Text style={styles.stockSymbol}>AAPL</Text>
              <Text style={styles.stockName}>Apple</Text>
            </View>
          </View>
          <View style={styles.stockPriceInfo}>
            <Text style={styles.stockPrice}>$132.05</Text>
            <Text style={styles.positiveChange}>+$1.13 (0.86%)</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  portfolioCard: {
    backgroundColor: 'white',
    padding: 20,
    margin: 10,
    borderRadius: 10,
  },
  portfolioLabel: {
    fontSize: 16,
    color: '#666',
  },
  portfolioValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  portfolioDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  negativeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
  },
  sectionContainer: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logoWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#7785FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stockLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stockName: {
    fontSize: 14,
    color: '#666',
  },
  stockPriceInfo: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveChange: {
    fontSize: 14,
    color: 'green',
  },
  negativeChange: {
    fontSize: 14,
    color: 'red',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    marginTop: 50,
    marginBottom: 10,
    width: 50,
    height: 50,
    borderRadius: 50,
  },
});
