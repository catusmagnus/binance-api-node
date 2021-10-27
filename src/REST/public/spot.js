// Imports:
import {
  book,
  checkParams,
  aggTrades,
  candles
} from '../'


// Exports:
/**
 * 👛 Spot Wallet Endpoints (https://binance-docs.github.io/apidocs/spot/en/#wallet-endpoints)
 * 
 * @param { (path: string, data: any, method: 'GET' | 'POST' | 'PUT' | 'DELETE', headers: any) => Promise<any> } pubCall 
 */
export const publicSpotWallet = (pubCall) => ({
  /**
   * Fetch system status.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#system-status-system
   * @returns { boolean } System status
   */
  systemStatus: () => pubCall('/sapi/v1/system/status').then(() => true).catch(() => false)
})

/**
 * 💹 Spot Market Data Endpoints (https://binance-docs.github.io/apidocs/spot/en/#market-data-endpoints)
 * 
 * @param { (path: string, data: any, method: 'GET' | 'POST' | 'PUT' | 'DELETE', headers: any) => Promise<any> } pubCall 
 */
export const publicSpotMarketData = (pubCall) => ({
  /**
   * Test connectivity to the Rest API.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#test-connectivity
   * @returns { boolean } Connectivity status
   */
  ping: () => pubCall('/api/v3/ping').then(() => true).catch(() => false),
  /**
   * Test connectivity to the Rest API and get the current server time.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#check-server-time
   * @returns { number } serverTime
   */
  time: () => pubCall('/api/v3/time').then(r => r.serverTime),
  /**
   * Current exchange trading rules and symbol information.
   * 
   * If any symbol provided in either `symbol` or `symbols` do not exist, the endpoint will throw an error.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#exchange-information
   * @param {{
   *  symbol?: string
   *  symbols?: string[]
   * }} payload
   * @returns {{
   *  "timezone": string
   *  "serverTime": number
   *  "rateLimits": any[]
   *  "exchangeFilters": any[]
   *  "symbols": [{
   *    "symbol": string
   *    "status": string
   *    "baseAsset": string
   *    "baseAssetPrecision": string
   *    "quoteAsset": string
   *    "quotePrecision": string
   *    "quoteAssetPrecision": string
   *    "orderTypes": [
   *      'LIMIT'
   *      'LIMIT_MAKER'
   *      'MARKET'
   *      'STOP_LOSS'
   *      'STOP_LOSS_LIMIT'
   *      'TAKE_PROFIT'
   *      'TAKE_PROFIT_LIMIT'
   *    ]
   *    "icebergAllowed": boolean
   *    "ocoAllowed": boolean
   *    "isSpotTradingAllowed": boolean
   *    "isMarginTradingAllowed": boolean
   *    "filters": any[]
   *    "permissions": [
   *      'SPOT'
   *      'MARGIN'
   *    ]
   *  }]
   * }} Object containing exchange information
   */
  exchangeInfo: payload => pubCall('/api/v3/exchangeInfo', payload),
  /**
   * Get order book.
   * @weight Adjusted based on the limit:
   * 
   * | Limit                | Weight     |
   * | :------------------- | :--------- |
   * | 5, 10, 20, 50, 100   | 1          |
   * | 500                  | 5          |
   * | 1000                 | 10         |
   * | 5000                 | 50         |
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#order-book
   * @param {{
   *  symbol: string
   *  limit: 5 | 10 | 20 | 50 | 100 | 500 | 1000 | 5000
   * }} payload
   * @returns {{
   *  "lastUpdateId": number
   *  "bids": [ string, string ][]
   *  "asks": [ string, string ][]
   * }} Object containing order book
   */
  book: payload => book(pubCall, payload),
  /**
   * Get recent trades.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#recent-trades-list
   * @param {{
   *  symbol: string
   *  limit: number
   * }} payload
   * @returns {[{
   *  "id": number
   *  "price": string
   *  "qty": string
   *  "quoteQty": string
   *  "time": number
   *  "isBuyerMaker": boolean
   *  "isBestMatch": boolean
   * }]} Array containing trade objects
   */
  trades: payload => checkParams('public.spot.market.trades', payload, ['symbol']) && pubCall('/api/v3/trades', payload),
  /**
   * Get compressed, aggregate trades. Trades that fill at the time, from the same order,
   * with the same price will have the quantity aggregated.
   * - If `startTime` and `endTime` are sent, time between `startTime` and `endTime` must be less than 1 hour.
   * - If fromId, `startTime`, and `endTime` are not sent, the most recent aggregate trades will be returned.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#compressed-aggregate-trades-list
   * @param {{
   *  symbol: string
   *  fromId?: number
   *  startTime?: number
   *  endTime?: number
   *  limit?: number
   * }} payload
   * @returns {[{
   *  "a": number
   *  "p": string
   *  "q": string
   *  "f": number
   *  "l": number
   *  "T": number
   *  "m": boolean
   *  "M": boolean
   * }]} // Array containing aggregate trades 
   */
  aggTrades: payload => aggTrades(pubCall, payload),
  /**
   * Kline/candlestick bars for a symbol.
   * 
   * Klines are uniquely identified by their open time.
   * 
   * - If `startTime` and `endTime` are not sent, the most recent klines are returned
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#kline-candlestick-data
   * @param {{
   *  symbol: string
   *  interval: string
   *  startTime?: number
   *  endTime?: number
   *  limit?: number
   * }} payload
   * @returns {[{
   *  "openTime": number
   *  "open": string
   *  "high": string
   *  "low": string
   *  "close": string
   *  "volume": string
   *  "closeTime": number
   *  "quoteVolume": string
   *  "trades": number
   *  "baseAssetVolume": string
   *  "quoteAssetVolume": string
   * }]} Object containing candle
   */
  candles: payload => candles(pubCall, payload),
  /**
   * Current average price for a symbol.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#current-average-price
   * @param {{ symbol: string }} payload
   * @returns {{
   *  "mins": number
   *  "price": string
   * }} 
   */
  avgPrice: payload =>
    checkParams('public.spot.market.avgPrice', payload, ['symbol']) && pubCall('/api/v3/avgPrice', payload),
  /**
   * 24 hour rolling window price change statistics.
   * 
   * CAREFUL when accessing this with no symbol.
   * 
   * - If the `symbol` is not sent, tickers for all symbols will be returned in an array.
   * @weight 1 for a single symbol, 40 when the symbol parameter is omitted
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#24hr-ticker-price-change-statistics
   * @param {{ symbol?: string }} payload
   * @returns {{
   *  "symbol": string
   *  "priceChange": string
   *  "priceChangePercent": string
   *  "weightedAvgPrice": string
   *  "prevClosePrice": string
   *  "lastPrice": string
   *  "lastQty": string
   *  "bidPrice": string
   *  "askPrice": string
   *  "openPrice": string
   *  "highPrice": string
   *  "lowPrice": string
   *  "volume": string
   *  "quoteVolume": string
   *  "openTime": number
   *  "closeTime": number
   *  "firstId": number
   *  "lastId": number
   *  "count": number
   * }} Object containing ticker price change statistics
   */
  dailyTickerStats: payload => pubCall('/api/v3/ticker/24hr', payload),
  /**
   * Latest price(s) for a symbol or symbols.
   * - If the `symbol` is not sent, prices for all symbols will be returned in an array.
   * @weight 1 for a single symbol, 2 when the symbol parameter is omitted
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#symbol-price-ticker
   * @param {{ symbol?: string }} payload
   * @returns {{
   *  [ symbol: string ]: string
   * }} Object containing latest price(s) for symbol(s)
   */
  price: payload =>
    pubCall('/api/v3/ticker/price', payload).then(r =>
      (Array.isArray(r) ? r : [r]).reduce((out, cur) => ((out[cur.symbol] = cur.price), out), {})
    ),
  /**
   * Best price(s)/qty(s) on the order book for a symbol or symbols.
   * - If the `symbol` is not sent, bookTickers for all symbols will be returned in an array.
   * @weight 1 for a single symbol, 2 when the symbol parameter is omitted
   * @http GET
   * @see https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#symbol-order-book-ticker
   * @param {{ symbol?: string }} payload
   * @returns {{
   *  [ symbol: string ]: {
   *    "symbol": string
   *    "bidPrice": string
   *    "bidQty": string
   *    "askPrice": string
   *    "askQty": string
   *  }
   * }} Object containing latest price(s) for symbol(s)
   */
  bookTicker: () =>
    pubCall('/api/v3/ticker/bookTicker').then(r =>
      (Array.isArray(r) ? r : [r]).reduce((out, cur) => ((out[cur.symbol] = cur), out), {})
    )
})

/**
 * 📢 Public Spot REST Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/
 * @param { (path: string, data: any, method: 'GET' | 'POST' | 'PUT' | 'DELETE', headers: any) => Promise<any> } pubCall 
 */
const publicSpot = (pubCall) => ({
  wallet: publicSpotWallet(pubCall),
  marketData: publicSpotMarketData(pubCall)
})

export default publicSpot
