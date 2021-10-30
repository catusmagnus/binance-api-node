// Imports:
import {
  aggTrades,
  trades,
  candles,
  miniTicker,
  allMiniTickers,
  ticker,
  allTickers,
  bookTicker,
  allBookTickers,
  partialDepth,
  depth,
  user
} from './index'


// Exports:
const spotWebSocket = (opts) => ({
  /**
   * The Aggregate Trade Streams push trade information that is aggregated for a single taker order.
   * @updateSpeed Real-time
   * @see https://binance-docs.github.io/apidocs/spot/en/#aggregate-trade-streams
   */
  aggTrades,
  /**
   * The Trade Streams push raw trade information; each trade has a unique buyer and seller.
   * @updateSpeed Real-time
   * @see https://binance-docs.github.io/apidocs/spot/en/#trade-streams
   */
  trades,
  /**
   * The Kline/Candlestick Stream push updates to the current klines/candlestick every second.
   * @updateSpeed 2000ms
   * @see https://binance-docs.github.io/apidocs/spot/en/#kline-candlestick-streams
   */
  candles,
  /**
   * 24hr rolling window mini-ticker statistics.
   * These are NOT the statistics of the UTC day, but a 24hr rolling window for the previous 24hrs.
   * @updateSpeed 1000ms
   * @see https://binance-docs.github.io/apidocs/spot/en/#individual-symbol-mini-ticker-stream
   */
  miniTicker,
  /**
   * 24hr rolling window mini-ticker statistics for all symbols that changed in an array.
   * These are NOT the statistics of the UTC day, but a 24hr rolling window for the previous 24hrs.
   * Note that only tickers that have changed will be present in the array.
   * @updateSpeed 1000ms
   * @see https://binance-docs.github.io/apidocs/spot/en/#all-market-mini-tickers-stream
   */
  allMiniTickers,
  /**
   * 24hr rolling window ticker statistics for a single symbol.
   * These are NOT the statistics of the UTC day, but a 24hr rolling window for the previous 24hrs.
   * @updateSpeed 1000ms
   * @see https://binance-docs.github.io/apidocs/spot/en/#individual-symbol-ticker-streams
   */
  ticker,
  /**
   * 24hr rolling window ticker statistics for all symbols that changed in an array.
   * These are NOT the statistics of the UTC day, but a 24hr rolling window for the previous 24hrs.
   * Note that only tickers that have changed will be present in the array.
   * @updateSpeed 1000ms
   * @see https://binance-docs.github.io/apidocs/spot/en/#all-market-tickers-stream
   */
  allTickers,
  /**
   * Pushes any update to the best bid or ask's price or quantity in real-time for a specified symbol.
   * @updateSpeed Real-time
   * @see https://binance-docs.github.io/apidocs/spot/en/#individual-symbol-book-ticker-streams
   */
  bookTicker,
  /**
   * Pushes any update to the best bid or ask's price or quantity in real-time for all symbols.
   * @updateSpeed Real-time
   * @see https://binance-docs.github.io/apidocs/spot/en/#all-book-tickers-stream
   */
  allBookTickers,
  /**
   * Top bids and asks, Valid are 5, 10, or 20.
   * @updateSpeed 1000ms or 100ms
   * @see https://binance-docs.github.io/apidocs/spot/en/#partial-book-depth-streams
   */
  partialDepth,
  /**
   * Order book price and quantity depth updates used to locally manage an order book.
   * @updateSpeed 1000ms or 100ms
   * @see https://binance-docs.github.io/apidocs/spot/en/#diff-depth-stream
   */
  depth,
  user: user(opts)
})

export default spotWebSocket
