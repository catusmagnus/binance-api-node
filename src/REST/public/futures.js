// Imports:
import {
  futuresBook,
  checkParams,
  candles
} from '../'

import {
  continuousKlineFields,
  indexAndMarkPriceKlineFields,
  historicalBLVTNAVKlineFields
} from '../constants'


// Exports:
/**
 * 💹 Futures Market Data Endpoints (https://binance-docs.github.io/apidocs/futures/en/#market-data-endpoints)
 * 
 * @param { (path: string, data: any, method: 'GET' | 'POST' | 'PUT' | 'DELETE', headers: any) => Promise<any> } pubCall 
 */
export const publicFuturesMarketData = (pubCall) => ({
  /**
   * Test connectivity to the Rest API.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#test-connectivity
   * @returns {{}} Empty objects
   */
  ping: () => pubCall('/fapi/v1/ping').then(() => true).catch(() => false),
  /**
   * Test connectivity to the Rest API and get the current server time.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#check-server-time
   * @returns { number } serverTime
   */
  time: () => pubCall('/fapi/v1/time').then(r => r.serverTime),
  /**
   * Current exchange trading rules and symbol information.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#exchange-information
   * @returns {{
   *  "exchangeFilters": []
   *  "rateLimits": [{
   *    "interval": string
   *    "intervalNum": number
   *    "limit": number
   *    "rateLimitType": string
   *  }]
   *  "serverTime": number
   *  "assets": [{
   *    "asset": string
   *    "marginAvailable": boolean
   *    "autoAssetExchange": number
   *  }]
   *  "symbols": [{
   *    "symbol": string
   *    "pair": string
   *    "contractType": string
   *    "deliveryDate": number
   *    "onboardDate": number
   *    "status": string
   *    "maintMarginPercent": string
   *    "requiredMarginPercent": string
   *    "baseAsset": string
   *    "quoteAsset": string
   *    "marginAsset": string
   *    "pricePrecision": number
   *    "quantityPrecision": number
   *    "baseAssetPrecision": number
   *    "quotePrecision": number
   *    "underlyingType": string
   *    "underlyingSubType": string[]
   *    "settlePlan": number
   *    "triggerProtect": string
   *    "filters": [{
   *      "filterType": string
   *      "maxPrice": string
   *      "minPrice": string
   *      "tickSize": string
   *    }]
   *    "OrderType": string[]
   *    "timeInForce": string[]
   *    "liquidationFee": string
   *    "marketTakeBound": string
   *  }]
   *  "timezone": string
   * }} Object containing exchange information
   */
  exchangeInfo: () => pubCall('/fapi/v1/exchangeInfo'),
  /**
   * Get order book.
   * @weight Adjusted based on the limit:
   * 
   * | Limit         | Weight     |
   * | :------------ | :--------- |
   * | 5, 10, 20, 50 | 2          |
   * | 100           | 5          |
   * | 500           | 10         |
   * | 1000          | 20         |
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#order-book
   * @param {{
   *  symbol: number
   *  limit?: number
   * }} payload
   * @returns {{
   *  "lastUpdateId": number
   *  "messageOutputTime": number
   *  "transactionTime": number
   *  "asks": [ string, string ][]
   *  "bids": [ string, string ][]
   * }} Object containing order book
   */
  book: payload => futuresBook(pubCall, payload, '/fapi/v1/depth'),
  /**
   * Get recent market trades.
   * - Market trades means trades filled in the order book. Only market trades
   * will be returned, which means the insurance fund trades and ADL trades won't be returned.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#recent-trades-list
   * @param {{
   *  symbol: number
   *  limit?: number
   * }} payload
   * @returns {[{
   *  "id": number
   *  "price": string
   *  "qty": string
   *  "quoteQty": string
   *  "time": number
   *  "isBuyerMaker": boolean
   * }]} Array containing trades
   */
  trades: payload =>
    checkParams('public.futures.marketData.trades', payload, ['symbol']) &&
    pubCall('/fapi/v1/trades', payload),
  /**
   * Get compressed, aggregate market trades. Market trades that fill at the time, from the same order,
   * with the same price will have the quantity aggregated.
   * - If both `startTime` and `endTime` are sent, time between `startTime` and `endTime` must be less than 1 hour.
   * - If `fromId`, `startTime`, and `endTime` are not sent, the most recent aggregate trades will be returned.
   * - Only market trades will be aggregated and returned, which means the insurance fund trades
   * and ADL trades won't be aggregated.
   * @weight 20
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#compressed-aggregate-trades-list
   * @param {{
   *  symbol: number
   *  fromId?: number
   *  startTime?: number
   *  endTime?: number
   *  limit?: number
   * }} payload
   * @returns {[{
   *  "aggId": number
   *  "symbol": string
   *  "price": string
   *  "quantity": string
   *  "firstId": number
   *  "lastId": number
   *  "timestamp": number
   *  "isBuyerMaker": boolean
   * }]} Array containing aggregate trades
   */
  aggTrades: payload =>
    checkParams('public.futures.marketData.aggTrades', payload, ['symbol']) &&
    pubCall('fapi/v1/aggTrades', payload)
    .then(trades => trades.map(trade => ({
      aggId: trade.a,
      symbol: payload.symbol,
      price: trade.p,
      quantity: trade.q,
      firstId: trade.f,
      lastId: trade.l,
      timestamp: trade.T,
      isBuyerMaker: trade.m,
    }))),
  /**
   * Kline/candlestick bars for a symbol. Klines are uniquely identified by their open time.
   * - If `startTime` and `endTime` are not sent, the most recent klines are returned.
   * @weight based on parameter `limit`:
   * 
   * | Limit         | Weight |
   * | :------------ | :----- |
   * | [1, 100)      | 1      |
   * | [100, 500)    | 2      |
   * | [500, 1000]   | 5      |
   * | > 1000        | 10     |
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#kline-candlestick-data
   * @param {{
   *  symbol: number
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
   *  "close": number
   *  "volume": number
   *  "closeTime": number
   *  "quoteVolume": string
   *  "trades": number
   *  "baseAssetVolume": string
   *  "quoteAssetVolume": string
   * }]} Array containing candles
   */
  candles: payload => candles(pubCall, payload, '/fapi/v1/klines'),
  /**
   * Kline/candlestick bars for a specific contract type.
   * 
   * Klines are uniquely identified by their open time.
   * - If `startTime` and `endTime` are not sent, the most recent klines are returned.
   * - `contractType`:
   *    - PERPETUAL
   *    - CURRENT_MONTH
   *    - NEXT_MONTH
   *    - CURRENT_QUARTER 当季交割合约
   *    - NEXT_QUARTER 次季交割合约
   * @weight based on parameter `limit`:
   * 
   * | Limit         | Weight |
   * | :------------ | :----- |
   * | [1, 100)      | 1      |
   * | [100, 500)    | 2      |
   * | [500, 1000]   | 5      |
   * | > 1000        | 10     |
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#continuous-contract-kline-candlestick-data
   * @param {{
   *  pair: string
   *  contractType: 'PERPETUAL' | 'CURRENT_MONTH' | 'NEXT_MONTH' | 'CURRENT_QUARTER' | 'NEXT_QUARTER'
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
   *  "close": number
   *  "volume": number
   *  "closeTime": number
   *  "quoteVolume": string
   *  "trades": number
   *  "buyVolume": string
   *  "quoteAssetVolume": string
   * }]} Array containing continuous candles
   */
  continuousKlines: payload =>
    checkParams('public.futures.marketData.continuousKlines', payload, [ 'pair', 'contractType', 'interval' ]) &&
    pubCall('/fapi/v1/continuousKlines', { interval: '5m', ...payload }).then(continuousKlines =>
      continuousKlines.map(continuousKline => zip(continuousKlineFields, continuousKline)),
    ),
  /**
   * Kline/candlestick bars for the index price of a pair.
   * 
   * Klines are uniquely identified by their open time.
   * - If `startTime` and `endTime` are not sent, the most recent klines are returned.
   * @weight based on parameter `limit`:
   * 
   * | Limit         | Weight |
   * | :------------ | :----- |
   * | [1, 100)      | 1      |
   * | [100, 500)    | 2      |
   * | [500, 1000]   | 5      |
   * | > 1000        | 10     |
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#index-price-kline-candlestick-data
   * @param {{
   *  pair: string
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
   *  "close": number
   *  "_i1": number
   *  "closeTime": number
   *  "_i2": string
   *  "bisicData": number
   * }]} Array containing continuous candles
   */
  indexPriceKlines: payload =>
    checkParams('public.futures.marketData.indexPriceKlines', payload, [ 'pair', 'interval' ]) &&
    pubCall('/fapi/v1/indexPriceKlines', { interval: '5m', ...payload }).then(indexPriceKlines =>
      indexPriceKlines.map(indexPriceKline => {
        // Remove fields to be ignored.
        indexPriceKline.splice(5, 1)
        indexPriceKline.splice(6, 1)
        return zip(indexAndMarkPriceKlineFields, indexPriceKline)
      }),
    ),
  /**
   * Kline/candlestick bars for the mark price of a symbol.
   * 
   * Klines are uniquely identified by their open time.
   * - If `startTime` and `endTime` are not sent, the most recent klines are returned.
   * @weight based on parameter `limit`:
   * 
   * | Limit         | Weight |
   * | :------------ | :----- |
   * | [1, 100)      | 1      |
   * | [100, 500)    | 2      |
   * | [500, 1000]   | 5      |
   * | > 1000        | 10     |
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#mark-price-kline-candlestick-data
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
   *  "close": number
   *  "_i1": number
   *  "closeTime": number
   *  "_i2": string
   *  "bisicData": number
   * }]} Array containing continuous candles
   */
  markPriceKlines: payload =>
    checkParams('public.futures.marketData.markPriceKlines', payload, [ 'symbol', 'interval' ]) &&
    pubCall('/fapi/v1/markPriceKlines', { interval: '5m', ...payload }).then(markPriceKlines =>
      markPriceKlines.map(markPriceKline => {
        // Remove fields to be ignored.
        markPriceKline.splice(5, 1)
        markPriceKline.splice(6, 1)
        return zip(indexAndMarkPriceKlineFields, markPriceKline)
      }),
    ),
  /**
   * Get mark price and funding rate.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#mark-price
   * @param {{ symbol?: string }} payload
   * @returns {{
   *  "symbol": string
   *  "markPrice": string
   *  "indexPrice": string
   *  "estimatedSettlePrice": string
   *  "lastFundingRate": string
   *  "nextFundingTime": number
   *  "interestRate": string
   *  "time": number
   * }} Object containing mark price and funding rate
   */
  markPrice: payload => pubCall('/fapi/v1/premiumIndex', payload),
  /**
   * Get funding rate history.
   * - If `startTime` and `endTime` are not sent, the most recent limit datas are returned.
   * - If the number of data between `startTime` and `endTime` is larger than `limit`, return as `startTime` + `limit`.
   * - History is returned in ascending order.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#get-funding-rate-history
   * @param {{
   *  symbol?: string
   *  startTime?: number
   *  endTime?: number
   *  limit?: number
   * }} payload
   * @returns {[{
   *  "symbol": string
   *  "fundingRate": string
   *  "fundingTime": number
   * }]} Array containing funding rate history
   */
  fundingRateHistory: payload => pubCall('/fapi/v1/fundingRate', payload),
  /**
   * 24 hour rolling window price change statistics. **CAREFUL** when accessing this with no symbol.
   * - If the `symbol` is not sent, tickers for all symbols will be returned in an array.
   * @weight 1 for a single symbol, **40** when the symbol parameter is omitted
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#24hr-ticker-price-change-statistics
   * @param {{ symbol?: string }} payload
   * @returns {{
   *  "symbol": string
   *  "priceChange": string
   *  "priceChangePercent": string
   *  "weightedAvgPrice": string
   *  "prevClosePrice": string
   *  "lastPrice": string
   *  "lastQty": string
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
   * } | [{
   *  "symbol": string
   *  "priceChange": string
   *  "priceChangePercent": string
   *  "weightedAvgPrice": string
   *  "prevClosePrice": string
   *  "lastPrice": string
   *  "lastQty": string
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
   * }]} Object or array containing ticker price statistics
   */
  dailyTickerStats: payload => pubCall('/fapi/v1/ticker/24hr', payload),
  /**
   * Latest price for a symbol or symbols.
   * - If the `symbol` is not sent, tickers for all symbols will be returned in an array.
   * @weight 1 for a single symbol, **2** when the symbol parameter is omitted
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#symbol-price-ticker
   * @param {{ symbol?: string }} payload
   * @returns {{
   *  [ symbol: string ]: string
   * }} Object containing ticker price statistics
   */
  price: () =>
    pubCall('/fapi/v1/ticker/price').then(r =>
      (Array.isArray(r) ? r : [r]).reduce((out, cur) => ((out[cur.symbol] = cur.price), out), {})
    ),
  /**
   * Best price/qty on the order book for a symbol or symbols.
   * - If the `symbol` is not sent, bookTickers for all symbols will be returned in an array.
   * @weight 1 for a single symbol, **2** when the symbol parameter is omitted
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#symbol-order-book-ticker
   * @param {{ symbol?: string }} payload
   * @returns {{
   *  [ symbol: string ]: {
   *    "symbol": string
   *    "bidPrice": string
   *    "bidQty": string
   *    "askPrice": string
   *    "askQty": string
   *    "time": number
   *  }
   * }} Object containing ticker price statistics
   */
  bookTicker: () =>
    pubCall('/fapi/v1/ticker/bookTicker').then(r =>
      (Array.isArray(r) ? r : [r]).reduce((out, cur) => ((out[cur.symbol] = cur), out), {})
    ),
  /**
   * Get present open interest of a specific symbol.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#open-interest
   * @param {{ symbol: string }} payload
   * @returns {{
   *  "openInterest": string
   *  "symbol": string
   *  "time": number
   * }} Object containing open interest of a specific symbol
   */
  openInterest: payload =>
    checkParams('public.futures.marketData.openInterest', payload, ['symbol']) &&
    pubCall('/fapi/v1/openInterest', payload),
  /**
   * Get present open interest history of a specific symbol.
   * - If `startTime` and `endTime` are not sent, the most recent data is returned.
   * - Only the data of the latest 30 days is available.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#open-interest-statistics
   * @param {{
   *  symbol: string
   *  period: '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d'
   *  limit?: number
   *  startTime?: number
   *  endTime?: number
   * }} payload
   * @returns {[{
   *  "symbol": string
   *  "sumOpenInterest": string
   *  "sumOpenInterestValue": string
   *  "timestamp": string
   * }]} Array containing open interest history of a specific symbol
   */
  openInterestHistory: payload =>
    checkParams('public.futures.marketData.openInterestHistory', payload, [ 'symbol', 'period' ]) &&
    pubCall('/futures/data/openInterestHist', payload),
  /**
   * Get top trader long/short ratio (Positions).
   * - If `startTime` and `endTime` are not sent, the most recent data is returned.
   * - Only the data of the latest 30 days is available.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#top-trader-long-short-ratio-positions
   * @param {{
   *  symbol: string
   *  period: '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d'
   *  limit?: number
   *  startTime?: number
   *  endTime?: number
   * }} payload
   * @returns {[{
   *  "symbol": string
   *  "longShortRatio": string
   *  "longAccount": string
   *  "shortAccount": string
   *  "timestamp": string
   * }]} Array containing top trader long/short ratio (Positions)
   */
  topLongShortPositionRatio: payload =>
    checkParams('public.futures.marketData.topLongShortPositionRatio', payload, [ 'symbol', 'period' ]) &&
    pubCall('/futures/data/topLongShortPositionRatio', payload),
  /**
   * Get long/short ratio.
   * - If `startTime` and `endTime` are not sent, the most recent data is returned.
   * - Only the data of the latest 30 days is available.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#long-short-ratio
   * @param {{
   *  symbol: string
   *  period: '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d'
   *  limit?: number
   *  startTime?: number
   *  endTime?: number
   * }} payload
   * @returns {[{
   *  "symbol": string
   *  "longShortRatio": string
   *  "longAccount": string
   *  "shortAccount": string
   *  "timestamp": string
   * }]} Array containing long/short ratio
   */
  longShortRatio: payload =>
    checkParams('public.futures.marketData.longShortRatio', payload, [ 'symbol', 'period' ]) &&
    pubCall('/futures/data/globalLongShortAccountRatio', payload),
  /**
   * Get taker buy/sell volume.
   * - If `startTime` and `endTime` are not sent, the most recent data is returned.
   * - Only the data of the latest 30 days is available.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#taker-buy-sell-volume
   * @param {{
   *  symbol: string
   *  period: '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d'
   *  limit?: number
   *  startTime?: number
   *  endTime?: number
   * }} payload
   * @returns {[{
   *  "buySellRatio": string
   *  "buyVol": string
   *  "sellVol": string
   *  "timestamp": string
   * }]} Array containing long/short ratio
   */
  takerBuySellVolume: payload =>
    checkParams('public.futures.marketData.takerLongShortRatio', payload, [ 'symbol', 'period' ]) &&
    pubCall('/futures/data/takerlongshortRatio', payload),
  /**
   * The BLVT NAV system is based on Binance Futures, so the endpoint is based on `fapi`.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#historical-blvt-nav-kline-candlestick
   * @param {{
   *  symbol: string
   *  interval: '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d'
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
   *  "realLeverage": string
   *  "closeTime": number
   *  "NAVUpdateCount": number
   * }]} Array containing historical BLVT NAV klines/candlesticks
   */
  historicalBLVTNAVKlines: payload =>
    checkParams('public.futures.marketData.historicalBLVTNAVKlines', payload, [ 'symbol', 'interval' ]) &&
    pubCall('/fapi/v1/lvtKlines', { interval: '5m', ...payload }).then(historicalBLVTNAVKlines =>
      historicalBLVTNAVKlines.map(historicalBLVTNAVKline => {
        // Remove fields to be ignored.
        historicalBLVTNAVKline.splice(7, 1)
        return zip(historicalBLVTNAVKlineFields, historicalBLVTNAVKline)
      }),
    ),
  /**
   * Get composite index symbol information.
   * - Only for composite index symbols.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#composite-index-symbol-information
   * @param {{ symbol?: string }} payload
   * @returns {[{
   *  "symbol": string
   *  "time": number
   *  "component": string
   *  "baseAssetList": [{
   *    "baseAsset": string
   *    "quoteAsset": string
   *    "weightInQuantity": string
   *    "weightInPercentage": string
   *  }]
   * }]} Array containing composite index symbol information
   */
  compositeIndexSymbolInfo: () => pubCall('/fapi/v1/indexInfo'),
})

/**
 * 📢 Public Futures REST Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/futures/en/
 * @param { (path: string, data: any, method: 'GET' | 'POST' | 'PUT' | 'DELETE', headers: any) => Promise<any> } pubCall 
 */
const publicFutures = (pubCall) => ({
  marketData: publicFuturesMarketData(pubCall)
})

export default publicFutures
