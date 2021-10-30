// Imports:
import {
  aggTrades,
  markPrice,
  allMarkPrices,
  candles,
  continuousKlines,
  miniTicker,
  allMiniTickers,
  ticker,
  allTickers,
  bookTicker,
  allBookTickers,
  liquidation,
  allLiquidations,
  partialDepth,
  depth,
  info,
  compositeIndex,
  user
} from './index'


// Exports:
const futuresWebSocket = (opts) => ({
  /**
   * The Aggregate Trade Streams push market trade information that is aggregated
   * for a single taker order every 100 milliseconds.
   * - Only market trades will be aggregated, which means the insurance fund trades and
   * ADL trades won't be aggregated.
   * @updateSpeed 100ms
   * @see https://binance-docs.github.io/apidocs/futures/en/#aggregate-trade-streams
   */
  aggTrades: (payload, cb, transform) => aggTrades(payload, cb, transform, 'futures'),
  /**
   * Mark price and funding rate for a single symbol pushed every 3 seconds or every second.
   * @updateSpeed 3000ms or 1000ms
   * @see https://binance-docs.github.io/apidocs/futures/en/#mark-price-stream
   */
  markPrice,
  /**
   * Mark price and funding rate for all symbols pushed every 3 seconds or every second.
   * @updateSpeed 3000ms or 1000ms
   * @see https://binance-docs.github.io/apidocs/futures/en/#mark-price-stream-for-all-market
   */
  allMarkPrices,
  /**
   * The Kline/Candlestick Stream push updates to the current klines/candlestick every
   * 250 milliseconds (if existing).
   * @updateSpeed 250ms
   * @see https://binance-docs.github.io/apidocs/futures/en/#kline-candlestick-streams
   */
  candles: (payload, interval, cb, transform) => candles(payload, interval, cb, transform, 'futures'),
  /**
   * Continuous contract kline/candlestick streams.
   * Contract Types:
   * - `perpetual`
   * - `current_quarter`
   * - `next_quarter`
   * @updateSpeed 250ms
   * @see https://binance-docs.github.io/apidocs/futures/en/#continuous-contract-kline-candlestick-streams
   */
  continuousKlines,
  /**
   * 24hr rolling window mini-ticker statistics for a single symbol.
   * These are NOT the statistics of the UTC day, but a 24hr rolling window from requestTime to 24hrs before.
   * @updateSpeed 500ms
   * @see https://binance-docs.github.io/apidocs/futures/en/#individual-symbol-mini-ticker-stream
   */
  miniTicker: (payload, cb, transform) => miniTicker(payload, cb, transform, 'futures'),
  /**
   * 24hr rolling window mini-ticker statistics for all symbols.
   * These are NOT the statistics of the UTC day, but a 24hr rolling window from requestTime to 24hrs before.
   * Note that only tickers that have changed will be present in the array.
   * @updateSpeed 1000ms
   * @see https://binance-docs.github.io/apidocs/futures/en/#all-market-mini-tickers-stream
   */
  allMiniTickers: (cb, transform) => allMiniTickers(cb, transform, 'futures'),
  /**
   * 24hr rollwing window ticker statistics for a single symbol.
   * These are NOT the statistics of the UTC day, but a 24hr rolling window from requestTime to 24hrs before.
   * @updateSpeed 500ms
   * @see https://binance-docs.github.io/apidocs/futures/en/#individual-symbol-ticker-streams
   */
  ticker: (payload, cb, transform) => ticker(payload, cb, transform, 'futures'),
  /**
   * 24hr rollwing window ticker statistics for all symbols.
   * These are NOT the statistics of the UTC day, but a 24hr rolling window from requestTime to 24hrs before.
   * Note that only tickers that have changed will be present in the array.
   * @updateSpeed 1000ms
   * @see https://binance-docs.github.io/apidocs/futures/en/#all-market-tickers-streams
   */
  allTickers: (cb, transform) => allTickers(cb, transform, 'futures'),
  /**
   * Pushes any update to the best bid or ask's price or quantity in real-time for a specified symbol.
   * @updateSpeed Real-time
   * @see https://binance-docs.github.io/apidocs/futures/en/#individual-symbol-book-ticker-streams
   */
  bookTicker: (payload, cb, transform) => bookTicker(payload, cb, transform, 'futures'),
  /**
   * Pushes any update to the best bid or ask's price or quantity in real-time for all symbols.
   * @updateSpeed Real-time
   * @see https://binance-docs.github.io/apidocs/futures/en/#all-book-tickers-stream
   */
  allBookTickers: (cb, transform) => allBookTickers(cb, transform, 'futures'),
  /**
   * The Liquidation Order Snapshot Streams push force liquidation order information for specific symbol.
   * 
   * For each symbol，only the latest one liquidation order within 1000ms will be pushed as the snapshot.
   * If no liquidation happens in the interval of 1000ms, no stream will be pushed.
   * @updateSpeed 1000ms
   * @see https://binance-docs.github.io/apidocs/futures/en/#liquidation-order-streams
   */
  liquidation,
  /**
   * The All Liquidation Order Snapshot Streams push force liquidation order information for all symbols in the market.
   * 
   * For each symbol，only the latest one liquidation order within 1000ms will be pushed as the snapshot.
   * If no liquidation happens in the interval of 1000ms, no stream will be pushed.
   * @updateSpeed 1000ms
   * @see https://binance-docs.github.io/apidocs/futures/en/#all-market-liquidation-order-streams
   */
  allLiquidations,
  /**
   * Top bids and asks, Valid are 5, 10, or 20.
   * @updateSpeed 250ms, 500ms or 100ms
   * @see https://binance-docs.github.io/apidocs/futures/en/#partial-book-depth-streams
   */
  partialDepth: (payload, cb, transform) => partialDepth(payload, cb, transform, 'futures'),
  /**
   * Bids and asks, pushed every 250 milliseconds, 500 milliseconds, 100 milliseconds (if existing).
   * @updateSpeed 250ms, 500ms or 100ms
   * @see https://binance-docs.github.io/apidocs/futures/en/#diff-book-depth-streams
   */
  depth: (payload, cb, transform) => depth(payload, cb, transform, 'futures'),
  BLVT: {
    /**
     * - Note: tokenName must be uppercase, e.g. `'TRXDOWN'`.
     * @see https://binance-docs.github.io/apidocs/futures/en/#blvt-info-streams
     */
    info,
    /**
     * - Note: tokenName must be uppercase, e.g. `'TRXDOWN'`.
     * @updateSpeed 300ms
     * @see https://binance-docs.github.io/apidocs/futures/en/#blvt-nav-kline-candlestick-streams
     */
    candles: (payload, interval, cb, transform) => candles(payload, interval, cb, transform, 'futures', true),
  },
  /**
   * Composite index information for index symbols pushed every second.
   * @updateSpeed 1000ms
   * @see https://binance-docs.github.io/apidocs/futures/en/#composite-index-symbol-information-streams
   */
  compositeIndex,
  user: user(opts, 'futures')
})

export default futuresWebSocket
