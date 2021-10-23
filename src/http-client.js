// Packages:
import crypto from 'crypto'
import zip from 'lodash.zipobject'
import 'isomorphic-fetch'


// Constants:
const BASE = 'https://api.binance.com'
const FUTURES = 'https://fapi.binance.com'
const defaultGetTime = () => Date.now()
const info = {
  spot: {},
  futures: {},
}

// Get API limits info from headers.
const headersMapping = {
  'x-mbx-used-weight-1m': 'usedWeight1m',
  'x-mbx-order-count-10s': 'orderCount10s',
  'x-mbx-order-count-1m': 'orderCount1m',
  'x-mbx-order-count-1h': 'orderCount1h',
  'x-mbx-order-count-1d': 'orderCount1d',
  'x-response-time': 'responseTime',
}

export const candleFields = [
  'openTime',
  'open',
  'high',
  'low',
  'close',
  'volume',
  'closeTime',
  'quoteVolume',
  'trades',
  'baseAssetVolume',
  'quoteAssetVolume',
]

export const continuousKlineFields = [
  'openTime',
  'open',
  'high',
  'low',
  'close',
  'volume',
  'closeTime',
  'quoteVolume',
  'trades',
  'buyVolume',
  'quoteAssetVolume',
]

export const indexAndMarkPriceKlineFields = [
  'openTime',
  'open',
  'high',
  'low',
  'close',
  '_i1',
  'closeTime',
  '_i2',
  'bisicData',
  '_i3',
  '_i4',
  '_i5'
]

export const historicalBLVTNAVKlineFields = [
  'openTime',
  'open',
  'high',
  'low',
  'close',
  'realLeverage',
  'closeTime',
  '_i1',
  'NAVUpdateCount',
  '_i2',
  '_i3',
  '_i4'
]


// Functions:
// Build query string for URI encoded URL based on JSON object.
const makeQueryString = q =>
  q ?
    `?${Object.keys(q)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`)
      .join('&')}`
  :
    ''

// Handles responses from the Binance API.
const responseHandler = res => {
  if (!res.headers || !res.url) return
  const marketName = res.url.includes(FUTURES) ? 'futures' : 'spot'
  Object.keys(headersMapping).forEach(key => {
    const outKey = headersMapping[key]
    if (res.headers.has(key)) info[marketName][outKey] = res.headers.get(key)
  })
}

// Finalize the API response.
const sendResult = call =>
  call.then(res => {
    // Get API limits info from headers
    responseHandler(res)
    // If response is ok, we can safely assume it is valid JSON
    if (res.ok) return res.json()
    /**
     * Errors might come from the API itself or the proxy that Binance is using.
     * For API errors the response will be valid JSON, but for proxy errors
     * it will be in HTML.
     */
    return res.text().then(text => {
      let error
      try {
        const json = JSON.parse(text)
        // The body was JSON parseable, assume it is an API response error
        error = new Error(json.msg || `${res.status} ${res.statusText}`)
        error.code = json.code
        error.url = res.url
      } catch (e) {
        // The body was not JSON parseable, assume it is proxy error
        error = new Error(`${res.status} ${res.statusText} ${text}`)
        error.response = res
        error.responseText = text
      }
      throw error
    })
  })

// Utility to validate existence of required parameter(s).
const checkParams = (name, payload, requires = []) => {
  if (!payload) throw new Error('You need to pass a payload object.')
  requires.forEach(r => {
    if (!payload[r] && isNaN(payload[r])) {
      throw new Error(`Method ${name} requires ${r} parameter.`)
    }
  })
  return true
}

/**
 * Make unmanaged public calls against the Binance API.
 *
 * @param { string } path Endpoint path
 * @param { object } data The payload to be sent
 * @param { string } method HTTB VERB, GET by default
 * @param { object } headers
 * @returns { object } The API response
 */
const publicCall = ({ endpoints }) => (path, data, method = 'GET', headers = {}) =>
  sendResult(
    fetch(
      `${
        !(path.includes('/fapi') || path.includes('/futures')) || path.includes('/sapi')
          ? endpoints.base
          : endpoints.futures
      }${path}${makeQueryString(data)}`,
      {
        method,
        json: true,
        headers,
      },
    ),
  )

/**
 * Factory method for partial private calls against the Binance API.
 *
 * @param { string } path Endpoint path
 * @param { object } data The payload to be sent
 * @param { string } method HTTB VERB, GET by default
 * @returns { object } The API response
 */
const keyCall = ({ apiKey, pubCall }) => (path, data, method = 'GET') => {
  if (!apiKey) throw new Error('You need to pass an API key to make this call.')
  return pubCall(path, data, method, { 'X-MBX-APIKEY': apiKey })
}

/**
 * Factory method for private calls against the Binance API.
 *
 * @param { string } path Endpoint path
 * @param { object } data The payload to be sent
 * @param { string } method HTTB VERB, GET by default
 * @param { object } headers
 * @returns { object } The API response
 */
const privateCall = ({ apiKey, apiSecret, endpoints, getTime = defaultGetTime, pubCall }) => (
  path,
  data = {},
  method = 'GET',
  noData,
  noExtra,
) => {
  if (!apiKey || !apiSecret) {
    throw new Error('You need to pass an API key and secret to make authenticated calls.')
  }

  return (data && data.useServerTime ?
    pubCall('/api/v3/time').then(r => r.serverTime)
  :
    Promise.resolve(getTime())
  ).then(timestamp => {
    if (data) delete data.useServerTime
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(makeQueryString({ ...data, timestamp }).substr(1))
      .digest('hex')
    const newData = noExtra ? data : { ...data, timestamp, signature }
    return sendResult(
      fetch(
        `${
          !(path.includes('/fapi') || path.includes('/futures')) || path.includes('/sapi') ?
            endpoints.base
          :
            endpoints.futures
        }${ path }${ noData ? '' : makeQueryString(newData) }`,
        {
          method,
          headers: { 'X-MBX-APIKEY': apiKey },
          json: true
        }
      )
    )
  })
}

/**
 * Get candles for a specific pair and interval and convert response
 * to a user friendly collection.
 * 
 * @description See https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#klinecandlestick-data
 */
const candles = (pubCall, payload, endpoint = '/api/v3/klines') =>
  checkParams('candles', payload, [ 'symbol', 'interval' ]) &&
  pubCall(endpoint, { interval: '5m', ...payload }).then(candles =>
    candles.map(candle => zip(candleFields, candle)),
  )

/**
 * Create a new order wrapper for market order simplicity
 */
const order = (privCall, payload = {}, url) => {
  const newPayload =
    [ 'LIMIT', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT_LIMIT' ].includes(payload.type) || !payload.type ?
      { timeInForce: 'GTC', ...payload }
    :
      payload
  const requires = ['symbol', 'side']
  if (
    !(newPayload.type === 'MARKET' && newPayload.quoteOrderQty) &&
    !(newPayload.type === 'STOP_MARKET') &&
    !(newPayload.type === 'TAKE_PROFIT_MARKET') &&
    !(newPayload.type === 'TRAILING_STOP_MARKET')
  ) requires.push('quantity')
  if (newPayload.type === 'TRAILING_STOP_MARKET') requires.push('callbackRate')
  return (
    checkParams('order', newPayload, requires) &&
    privCall(url, { type: 'LIMIT', ...newPayload }, 'POST')
  )
}

const orderOco = (privCall, payload = {}, url) => {
  const newPayload =
    payload.stopLimitPrice && !payload.stopLimitTimeInForce ?
      { stopLimitTimeInForce: 'GTC', ...payload }
    :
      payload
  return (
    checkParams('order', newPayload, [ 'symbol', 'side', 'quantity', 'price', 'stopPrice' ]) &&
    privCall(url, newPayload, 'POST')
  )
}

/**
 * Zip asks and bids reponse from order book.
 * 
 * @description See https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#order-book
 */
const book = (pubCall, payload, endpoint = '/api/v3/depth') =>
  checkParams('book', payload, ['symbol']) &&
  pubCall(endpoint, payload).then(({ lastUpdateId, asks, bids }) => ({
    lastUpdateId,
    asks: asks.map(a => zip(['price', 'quantity'], a)),
    bids: bids.map(b => zip(['price', 'quantity'], b)),
  }))

  /**
   * Get compressed, aggregate trades. Trades that fill at the time, from the same taker order,
   * with the same price will have the quantity aggregated.
   * 
   * @description See https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#compressedaggregate-trades-list
   */
const aggTrades = (pubCall, payload, endpoint = '/api/v3/aggTrades') =>
  checkParams('aggTrades', payload, ['symbol']) &&
  pubCall(endpoint, payload).then(trades =>
    trades.map(trade => ({
      aggId: trade.a,
      symbol: payload.symbol,
      price: trade.p,
      quantity: trade.q,
      firstId: trade.f,
      lastId: trade.l,
      timestamp: trade.T,
      isBuyerMaker: trade.m,
      wasBestPrice: trade.M,
    })),
  )


// Exports:
export default opts => {
  const endpoints = {
    base: (opts && opts.httpBase) || BASE,
    futures: (opts && opts.httpFutures) || FUTURES,
  }

  const pubCall = publicCall({ ...opts, endpoints })
  const privCall = privateCall({ ...opts, endpoints, pubCall })
  const kCall = keyCall({ ...opts, pubCall })

  return {
    public: {
      spot: {                                                                       // Spot Public REST Endpoints (https://binance-docs.github.io/apidocs/spot/en/)
        wallet: {                                                                   // ✅ Spot Wallet Endpoints (https://binance-docs.github.io/apidocs/spot/en/#wallet-endpoints)
          /**
           * Fetch system status.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#system-status-system
           * @returns {[{
           *  "status": 0 | 1
           *  "msg": 'normal' | 'system_maintenance'
           * }]} Object containing system status
           */
          systemStatus: () => pubCall('/sapi/v1/system/status').then(() => true),
        },
        marketData: {                                                               // ✅ Spot Market Data Endpoints (https://binance-docs.github.io/apidocs/spot/en/#market-data-endpoints)
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
          trades: payload => checkParams('trades', payload, ['symbol']) && pubCall('/api/v3/trades', payload),
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
            checkParams('avgPrice', payload, ['symbol']) && pubCall('/api/v3/avgPrice', payload),
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
            ),
        }
      },
      futures: {                                                                    // Futures Public REST Endpoints (https://binance-docs.github.io/apidocs/futures/en/)
        marketData: {                                                               // Futures Market Data Enpoints (https://binance-docs.github.io/apidocs/futures/en/#market-data-endpoints)
          ping: () => pubCall('/fapi/v1/ping').then(() => true),                                          // https://binance-docs.github.io/apidocs/futures/en/#test-connectivity
          time: () => pubCall('/fapi/v1/time').then(r => r.serverTime),                                   // https://binance-docs.github.io/apidocs/futures/en/#check-server-time
          exchangeInfo: () => pubCall('/fapi/v1/exchangeInfo'),                                           // https://binance-docs.github.io/apidocs/futures/en/#exchange-information
          book: payload => book(pubCall, payload, '/fapi/v1/depth'),                                    // https://binance-docs.github.io/apidocs/futures/en/#order-book
          trades: payload =>                                                                              // https://binance-docs.github.io/apidocs/futures/en/#recent-trades-list
            checkParams('trades', payload, ['symbol']) && pubCall('/fapi/v1/trades', payload),
          aggTrades: payload => aggTrades(pubCall, payload, '/fapi/v1/aggTrades'),                        // https://binance-docs.github.io/apidocs/futures/en/#compressed-aggregate-trades-list
          candles: payload => candles(pubCall, payload, '/fapi/v1/klines'),                               // https://binance-docs.github.io/apidocs/futures/en/#kline-candlestick-data
          continuousKlines: payload =>                                                                    // https://binance-docs.github.io/apidocs/futures/en/#continuous-contract-kline-candlestick-data
            checkParams('continuousKlines', payload, [ 'pair', 'contractType', 'interval' ]) &&
            pubCall('/fapi/v1/continuousKlines', { interval: '5m', ...payload }).then(continuousKlines =>
              continuousKlines.map(continuousKline => zip(continuousKlineFields, continuousKline)),
            ),
          indexPriceKlines: payload =>                                                                    // https://binance-docs.github.io/apidocs/futures/en/#index-price-kline-candlestick-data
            checkParams('indexPriceKlines', payload, [ 'pair', 'interval' ]) &&
            pubCall('/fapi/v1/indexPriceKlines', { interval: '5m', ...payload }).then(indexPriceKlines =>
              indexPriceKlines.map(indexPriceKline => zip(indexAndMarkPriceKlineFields, indexPriceKline)),
            ),
          markPriceKlines: payload =>                                                                     // https://binance-docs.github.io/apidocs/futures/en/#mark-price-kline-candlestick-data
            checkParams('markPriceKlines', payload, [ 'symbol', 'interval' ]) &&
            pubCall('/fapi/v1/markPriceKlines', { interval: '5m', ...payload }).then(markPriceKlines =>
              markPriceKlines.map(markPriceKline => zip(indexAndMarkPriceKlineFields, markPriceKline)),
            ),
          markPrice: payload => pubCall('/fapi/v1/premiumIndex', payload),                                // https://binance-docs.github.io/apidocs/futures/en/#mark-price
          fundingRateHistory: payload => pubCall('/fapi/v1/fundingRate', payload),                        // https://binance-docs.github.io/apidocs/futures/en/#get-funding-rate-history
          dailyTickerStats: payload => pubCall('/fapi/v1/ticker/24hr', payload),                          // https://binance-docs.github.io/apidocs/futures/en/#24hr-ticker-price-change-statistics
          price: () =>                                                                                    // https://binance-docs.github.io/apidocs/futures/en/#symbol-price-ticker
            pubCall('/fapi/v1/ticker/price').then(r =>
              (Array.isArray(r) ? r : [r]).reduce((out, cur) => ((out[cur.symbol] = cur.price), out), {})
            ),
          bookTicker: () =>                                                                               // https://binance-docs.github.io/apidocs/futures/en/#symbol-order-book-ticker
            pubCall('/fapi/v1/ticker/bookTicker').then(r =>
              (Array.isArray(r) ? r : [r]).reduce((out, cur) => ((out[cur.symbol] = cur), out), {})
            ),
          openInterest: payload =>                                                                        // https://binance-docs.github.io/apidocs/futures/en/#open-interest
            checkParams('openInterest', payload, ['symbol']) && pubCall('/fapi/v1/openInterest', payload),
          openInterestHist: payload =>                                                                    // https://binance-docs.github.io/apidocs/futures/en/#open-interest-statistics
            checkParams('openInterestHist', payload, ['symbol', 'period']) && pubCall('/futures/data/openInterestHist', payload),
          topLongShortAccountRatio: payload =>                                                            // https://binance-docs.github.io/apidocs/futures/en/#top-trader-long-short-ratio-accounts-market_data
            checkParams('topLongShortAccountRatio', payload, ['symbol', 'period']) && pubCall('/futures/data/topLongShortAccountRatio', payload),
          topLongShortPositionRatio: payload =>                                                           // https://binance-docs.github.io/apidocs/futures/en/#top-trader-long-short-ratio-positions
            checkParams('topLongShortPositionRatio', payload, ['symbol', 'period']) && pubCall('/futures/data/topLongShortPositionRatio', payload),
          longShortRatio: payload =>                                                                      // https://binance-docs.github.io/apidocs/futures/en/#long-short-ratio
            checkParams('longShortRatio', payload, ['symbol', 'period']) && pubCall('/futures/data/globalLongShortAccountRatio', payload),
          takerLongShortRatio: payload =>                                                                 // https://binance-docs.github.io/apidocs/futures/en/#taker-buy-sell-volume
            checkParams('takerLongShortRatio', payload, ['symbol', 'period']) && pubCall('/futures/data/takerlongshortRatio', payload),
          historicalBLVTNAVKlines: payload =>                                                             // https://binance-docs.github.io/apidocs/futures/en/#historical-blvt-nav-kline-candlestick
            checkParams('historicalBLVTNAVKlines', payload, ['symbol', 'interval']) &&
            pubCall('/fapi/v1/lvtKlines', { interval: '5m', ...payload }).then(historicalBLVTNAVKlines =>
              historicalBLVTNAVKlines.map(historicalBLVTNAVKline => zip(historicalBLVTNAVKlineFields, historicalBLVTNAVKline)),
            ),
          indexInfo: () => pubCall('/fapi/v1/indexInfo'),                                                 // https://binance-docs.github.io/apidocs/futures/en/#composite-index-symbol-information
        }
      }
    },
    authenticated: {
      spot: {
        wallet: {                                                                   // ✅ Spot Wallet Endpoints (https://binance-docs.github.io/apidocs/spot/en/#wallet-endpoints)
          /**
           * Get information of coins (available for deposit and withdraw) for user.
           * @weight 10
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#all-coins-39-information-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {[{
           *  "coin": string
           *  "depositAllEnable": boolean
           *  "free": string
           *  "freeze": string
           *  "ipoable": string
           *  "ipoing": string
           *  "isLegalMoney": boolean // NOTE: Bruh
           *  "locked": string
           *  "name": string
           *  "networkList": [{
           *    "addressRegex": string
           *    "coin": string
           *    "depositDesc": string
           *    "depositEnable": boolean
           *    "isDefault": boolean
           *    "memoRegex": string
           *    "minConfirm": string
           *    "name": string
           *    "network": string
           *    "resetAddressStatus": boolean
           *    "specialTips": string
           *    "unLockConfirm": number
           *    "withdrawDesc": string
           *    "withdrawEnable": boolean
           *    "withdrawFee": string
           *    "withdrawIntegerMultiple": string
           *    "withdrawMax": string
           *    "withdrawMin": string
           *    "sameAddress": boolean
           *  }]
           *  "storage": 
           *  "trading": boolean
           *  "withdrawAllEnable": boolean
           *  "withdrawing": string
           * }]} Array of coin information objects
           */
          accountCoins: payload =>
            checkParams('accountCoins', payload, ['timestamp']) && privCall('/sapi/v1/capital/config/getall', payload),
          /**
           * Daily account snapshot.
           * 
           * The query time period must be less then 30 days.
           * @weight 2400
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#daily-account-snapshot-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  type: 'SPOT' | 'MARGIN' | 'FUTURES'
           *  startTime?: number
           *  endTime?: number
           *  limit?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "code": number
           *  "msg": string
           *  "snapshotVos": [{
           *    "data": {
           *      "balances": [{
           *        "asset": string
           *        "free": string
           *        "locked": string
           *      }]
           *    }
           *    "type": string
           *    "updateTime": number
           *  }]
           * }} Object containing daily account snapshot
           */
          dailyAccountSnapshot: payload =>
            checkParams('dailyAccountSnapshot', payload, [ 'type', 'timestamp' ]) && privCall('/sapi/v1/accountSnapshot', payload),
          /**
           * Disable fast withdraw switch.
           * 
           * CAUTION: This request will disable `fastwithdraw` switch under your account.
           * You need to enable "trade" option for the api key which requests this endpoint.
           * @weight 1
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#disable-fast-withdraw-switch-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{}} Empty object
           */
          disableFastWithdrawSwitch: payload =>
            checkParams('disableFastWithdrawSwitch', payload, ['timestamp']) && privCall('/sapi/v1/account/disableFastWithdrawSwitch', payload, 'POST'),
          /**
           * Enable fast withdraw switch.
           * - This request will enable `fastwithdraw` switch under your account.
           * You need to enable "trade" option for the api key which requests this endpoint.
           * - When Fast Withdraw Switch is on, transferring funds to a Binance account will be done instantly.
           * There is no on-chain transaction, no transaction ID and no withdrawal fee.
           * @weight 1
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#enable-fast-withdraw-switch-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{}} Empty object
           */
          enableFastWithdrawSwitch: payload =>
            checkParams('enableFastWithdrawSwitch', payload, ['timestamp']) && privCall('/sapi/v1/account/enableFastWithdrawSwitch', payload, 'POST'),
          /**
           * Submit a withdraw request.
           * - If `network` does not send, return with default network of the coin.
           * - You can get `network` and `isDefault` in `networkList` of a coin in the response
           *  of `GET /sapi/v1/capital/config/getall (HMAC SHA256)`.
           * @weight 1
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#withdraw-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  coin: string
           *  withdrawOrderId?: string
           *  network?: string
           *  address: string
           *  addressTag?: string
           *  amount: string
           *  transactionFeeFlag?: boolean
           *  name?: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{ "id": string }} Object containing withdraw ID 
           */
          withdraw: payload =>
            checkParams('withdraw', payload, [ 'coin', 'address', 'amount', 'timestamp' ]) && privCall('/sapi/v1/capital/withdraw/apply', payload, 'POST'),
          /**
           * Fetch deposit history (supporting network).
           * - Please notice the default `startTime` and `endTime` to make sure that time interval is within 0-90 days.
           * - If both `startTime` and `endTime` are sent, time between `startTime` and `endTime` must be less than 90 days.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#deposit-history-supporting-network-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  coin?: string
           *  status?: 0 | 6 | 1
           *  startTime?: number
           *  endTime?: number
           *  offset?: number
           *  limit?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {[{
           *  "amount": string
           *  "coin": string
           *  "network": string
           *  "status": 0 | 6 | 1
           *  "address": string
           *  "addressTag": string
           *  "txId": string
           *  "insertTime": number
           *  "transferType": number
           *  "unlockConfirm": string
           *  "confirmTimes": string
           * }]} Array containing deposit objects
           */
          depositHistory: payload =>
            checkParams('depositHistory', payload, ['timestamp']) && privCall('/sapi/v1/capital/deposit/hisrec', payload),
          /**
           * Fetch withdraw history (supporting network).
           * - `network` may not be in the response for old withdraw.
           * - Please notice the default `startTime` and `endTime` to make sure that time interval is within 0-90 days.
           * - If both `startTime` and `endTime` are sent, time between `startTime` and `endTime` must be less than 90 days.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#withdraw-history-supporting-network-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  coin?: string
           *  withdrawOrderId?: string
           *  status?: 0 | 1 | 2 | 3 | 4 | 5 | 6
           *  offset?: number
           *  limit?: number
           *  startTime?: number
           *  endTime?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {[{
           *  "address": string
           *  "amount": string
           *  "applyTime": string
           *  "coin": string
           *  "id": string
           *  "withdrawOrderId": string
           *  "network": string
           *  "transferType": 0 | 1
           *  "status": 0 | 1 | 2 | 3 | 4 | 5 | 6
           *  "transactionFee": string
           *  "confirmNo": number
           *  "txId": string
           * }]} Array containing withdraw objects
           */
          withdrawHistory: payload =>
            checkParams('withdrawHistory', payload, ['timestamp']) && privCall('/sapi/v1/capital/withdraw/history', payload),
          /**
           * Fetch deposit address with network (supporting network).
           * - If `network` does not send, return with default network of the coin.
           * - You can get `network` and `isDefault` in `networkList` in the response of `GET /sapi/v1/capital/config/getall (HMAC SHA256)`.
           * @weight 10
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#deposit-address-supporting-network-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  coin: string
           *  network?: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "address": string
           *  "coin": string
           *  "tag": string
           *  "url": string
           * }} Object containing deposit address
           */
          depositAddress: payload =>
            checkParams('depositAddress', payload, [ 'coin', 'timestamp' ]) && privCall('/sapi/v1/capital/deposit/address', payload),
          /**
           * Fetch account status detail.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#account-status-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "data": string
           * }} Object containing account status
           */
          accountStatus: payload =>
            checkParams('accountStatus', payload, ['timestamp']) && privCall('/sapi/v1/account/status', payload),
          /**
           * Fetch account API trading status details.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#account-api-trading-status-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "data": {
           *    "isLocked": boolean
           *    "plannedRecoverTime": number
           *    "triggerCondition": {
           *      "GCR": number
           *      "IFER": number
           *      "UFR": number
           *    }
           *    "indicators": {
           *      [ key: string ]: [{
           *        "i": "UFR"
           *        "c": number
           *        "v": number
           *        "t": number
           *      }]
           *    }
           *    "updateTime": number
           *  }
           * }} Object containing account API trading status
           */
          accountAPITradingStatus: payload =>
            checkParams('accountAPITradingStatus', payload, ['timestamp']) && privCall('/sapi/v1/account/apiTradingStatus', payload),
          /**
           * Get dust log.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#dustlog-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  startTime?: number
           *  endTime?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "total": number
           *  "userAssetDribblets": [{
           *    "operateTime": number
           *    "totalTransferedAmount": string
           *    "totalServiceChargeAmount": string
           *    "transId": number
           *    "userAssetDribbletDetails": [{
           *      "transId": number
           *      "serviceChargeAmount": string
           *      "amount": string
           *      "operateTime": number
           *      "transferedAmount": string
           *      "fromAsset": string
           *    }]
           *  }]
           * }} Object containing dust log.
           */
          dustLog: payload =>
            checkParams('dustLog', payload, ['timestamp']) && privCall('/sapi/v1/asset/dribblet', payload),
          /**
           * Convert dust assets to BNB.
           * @weight 10
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#dust-transfer-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  asset: string[]
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "totalServiceCharge": string
           *  "totalTransfered": string
           *  "transferResult": [{
           *    "amount": string
           *    "fromAsset": string
           *    "operateTime": number
           *    "serviceChargeAmount": string
           *    "tranId": number
           *    "transferedAmount": string
           *  }]
           * }} Object containing dust transfer results 
           */
          dustTransfer: payload =>
            checkParams('dustTransfer', payload, [ 'asset', 'timestamp' ]) && privCall('/sapi/v1/asset/dust', payload, 'POST'),
          /**
           * Query asset dividend record.
           * @weight 10
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#asset-dividend-record-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  asset?: string
           *  startTime?: number
           *  endTime?: number
           *  limit?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "rows": [{
           *    "id": number
           *    "amount": string
           *    "asset": string
           *    "divTime": string
           *    "enInfo": string
           *    "tranId": number
           *  }]
           *  "total": number
           * }} Object containing asset dividend record list
           */
          assetDividendRecord: payload =>
            checkParams('assetDividendRecord', payload, ['timestamp']) && privCall('/sapi/v1/asset/assetDividend', payload),   
          /**
           * Fetch details of assets supported on Binance.
           * 
           * Please get network and other deposit or withdraw details from `GET /sapi/v1/capital/config/getall`.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#asset-detail-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  asset?: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  [ key: string ]: {
           *    minWithdrawAmount: string
           *    depositStatus: boolean
           *    withdrawFee: number
           *    withdrawStatus: boolean
           *    depositTip?: string
           *  }
           * }} Object containing asset detail(s)
           */
          assetDetail: payload =>
            checkParams('assetDetail', payload, ['timestamp']) && privCall('/sapi/v1/asset/assetDetail', payload),
          /**
           * Fetch trade fee.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#trade-fee-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  symbol?: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {[{
           *  "symbol": string
           *  "makerCommission": string
           *  "takerCommission": string
           * }]} Array of fee objects
           */
          tradeFee: payload =>
            checkParams('tradeFee', payload, ['timestamp']) && privCall('/sapi/v1/asset/tradeFee', payload),
          /**
           * You need to enable `Permits Universal Transfer` option for the api key which requests this endpoint.
           * - `fromSymbol` must be sent when type are `ISOLATEDMARGIN_MARGIN` and `ISOLATEDMARGIN_ISOLATEDMARGIN`
           * - `toSymbol` must be sent when type are `MARGIN_ISOLATEDMARGIN` and `ISOLATEDMARGIN_ISOLATEDMARGIN`
           * - ENUM of transfer types:
           *    - `MAIN_UMFUTURE` Spot account transfer to USDⓈ-M Futures account
           *    - `MAIN_CMFUTURE` Spot account transfer to COIN-M Futures account
           *    - `MAIN_MARGIN` Spot account transfer to Margin（cross）account
           *    - `MAIN_MINING` Spot account transfer to Mining account
           *    - `UMFUTURE_MAIN` USDⓈ-M Futures account transfer to Spot account
           *    - `UMFUTURE_MARGIN` USDⓈ-M Futures account transfer to Margin（cross）account
           *    - `CMFUTURE_MAIN` COIN-M Futures account transfer to Spot account
           *    - `CMFUTURE_MARGIN` COIN-M Futures account transfer to Margin(cross) account
           *    - `MARGIN_MAIN` Margin（cross）account transfer to Spot account
           *    - `MARGIN_UMFUTURE` Margin（cross）account transfer to USDⓈ-M Futures
           *    - `MARGIN_CMFUTURE` Margin（cross）account transfer to COIN-M Futures
           *    - `MARGIN_MINING` Margin（cross）account transfer to Mining account
           *    - `MINING_MAIN` Mining account transfer to Spot account
           *    - `MINING_UMFUTURE` Mining account transfer to USDⓈ-M Futures account
           *    - `MINING_MARGIN` Mining account transfer to Margin(cross) account
           *    - `ISOLATEDMARGIN_MARGIN` Isolated margin account transfer to Margin(cross) account
           *    - `MARGIN_ISOLATEDMARGIN` Margin(cross) account transfer to Isolated margin account
           *    - `ISOLATEDMARGIN_ISOLATEDMARGIN` Isolated margin account transfer to Isolated margin account
           *    - `MAIN_FUNDING` Spot account transfer to Funding account
           *    - `FUNDING_MAIN` Funding account transfer to Spot account
           *    - `FUNDING_UMFUTURE` Funding account transfer to UMFUTURE account
           *    - `UMFUTURE_FUNDING` UMFUTURE account transfer to Funding account
           *    - `MARGIN_FUNDING` MARGIN account transfer to Funding account
           *    - `FUNDING_MARGIN` Funding account transfer to Margin account
           *    - `FUNDING_CMFUTURE` Funding account transfer to CMFUTURE account
           *    - `CMFUTURE_FUNDING` CMFUTURE account transfer to Funding account
           * @weight 1
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#user-universal-transfer-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  type: 'MAIN_UMFUTURE' | 'MAIN_CMFUTURE' | 'MAIN_MARGIN' | 'MAIN_MINING' | 'UMFUTURE_MAIN'
           *  | 'UMFUTURE_MARGIN' | 'CMFUTURE_MAIN' | 'CMFUTURE_MARGIN' | 'MARGIN_MAIN' | 'MARGIN_UMFUTURE'
           *  | 'MARGIN_CMFUTURE' | 'MARGIN_MINING' | 'MINING_MAIN' | 'MINING_UMFUTURE' | 'MINING_MARGIN'
           *  | 'ISOLATEDMARGIN_MARGIN' | 'MARGIN_ISOLATEDMARGIN' | 'ISOLATEDMARGIN_ISOLATEDMARGIN' | 'MAIN_FUNDING'
           *  | 'FUNDING_MAIN' | 'FUNDING_UMFUTURE' | 'UMFUTURE_FUNDING' | 'MARGIN_FUNDING' | 'FUNDING_MARGIN'
           *  | 'FUNDING_CMFUTURE' | 'CMFUTURE_FUNDING'
           *  asset: string
           *  amount: string
           *  fromSymbol?: string
           *  toSymbol?: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{ "tranId": number }} Object containing tranId
           */
          universalTransfer: payload =>
            checkParams('universalTransfer', payload, [ 'type', 'asset', 'amount', 'timestamp' ]) && privCall('/sapi/v1/asset/transfer', payload, 'POST'),
          /**
           * Get user universal transfer history.
           * - `fromSymbol` must be sent when type are `ISOLATEDMARGIN_MARGIN` and `ISOLATEDMARGIN_ISOLATEDMARGIN`.
           * - `toSymbol` must be sent when type are `MARGIN_ISOLATEDMARGIN` and `ISOLATEDMARGIN_ISOLATEDMARGIN`
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#query-user-universal-transfer-history-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  type: 'MAIN_UMFUTURE' | 'MAIN_CMFUTURE' | 'MAIN_MARGIN' | 'MAIN_MINING' | 'UMFUTURE_MAIN'
           *  | 'UMFUTURE_MARGIN' | 'CMFUTURE_MAIN' | 'CMFUTURE_MARGIN' | 'MARGIN_MAIN' | 'MARGIN_UMFUTURE'
           *  | 'MARGIN_CMFUTURE' | 'MARGIN_MINING' | 'MINING_MAIN' | 'MINING_UMFUTURE' | 'MINING_MARGIN'
           *  | 'ISOLATEDMARGIN_MARGIN' | 'MARGIN_ISOLATEDMARGIN' | 'ISOLATEDMARGIN_ISOLATEDMARGIN' | 'MAIN_FUNDING'
           *  | 'FUNDING_MAIN' | 'FUNDING_UMFUTURE' | 'UMFUTURE_FUNDING' | 'MARGIN_FUNDING' | 'FUNDING_MARGIN'
           *  | 'FUNDING_CMFUTURE' | 'CMFUTURE_FUNDING'
           *  startTime?: number
           *  endTime?: number
           *  current?: number
           *  size?: number
           *  fromSymbol?: string
           *  toSymbol?: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "rows": [{
           *    "asset": string
           *    "amount": string
           *    "type": string
           *    "status": 'PENDING' | 'CONFIRMED' | 'FAILED'
           *    "tranId": number
           *    "timestamp": number
           *  }]
           *  "total": number
           * }} Object containing user universal transfer history list
           */
          universalTransferHistory: payload =>
            checkParams('universalTransferHistory', payload, [ 'type', 'timestamp' ]) && privCall('/sapi/v1/asset/transfer', payload),
          /**
           * Get funding wallet.
           * 
           * Currently supports querying the following business assets：Binance Pay, Binance Card,
           * Binance Gift Card, Stock Token
           * @weight 1
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#funding-wallet-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  asset?: string
           *  needBtcValuation?: 'true' | 'false'
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {[{
           *  "asset": string
           *  "free": string
           *  "locked": string
           *  "freeze": string
           *  "withdrawing": string
           *  "btcValuation": string
           * }]} Array containing funding wallet details
           */
          fundingWallet: payload =>
            checkParams('fundingWallet', payload, ['timestamp']) && privCall('/sapi/v1/asset/get-funding-asset', payload, 'POST'),
          /**
           * Get API key permission.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#get-api-key-permission-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "ipRestrict": boolean
           *  "createTime": number
           *  "enableWithdrawals": boolean
           *  "enableInternalTransfer": boolean
           *  "permitsUniversalTransfer": boolean
           *  "enableVanillaOptions": boolean
           *  "enableReading": boolean
           *  "enableFutures": boolean
           *  "enableMargin": boolean
           *  "enableSpotAndMarginTrading": boolean
           *  "tradingAuthorityExpirationTime": number
           * }} Response object
           */
          apiPermission: payload => privCall('/sapi/v1/account/apiRestrictions', payload),
        },
        subAccount: {                                                               // Sub-Account Endpoints (https://binance-docs.github.io/apidocs/spot/en/#sub-account-endpoints)
          // TODO: POST /sapi/v1/sub-account/virtualSubAccount (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#create-a-virtual-sub-account-for-master-account
          // TODO: GET /sapi/v1/sub-account/list (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-sub-account-list-for-master-account
          // TODO: GET /sapi/v1/sub-account/sub/transfer/history (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-sub-account-spot-asset-transfer-history-for-master-account
          // TODO: GET /sapi/v1/sub-account/futures/internalTransfer (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-sub-account-futures-asset-transfer-history-for-master-account
          // TODO: POST /sapi/v1/sub-account/futures/internalTransfer (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#sub-account-futures-asset-transfer-for-master-account
          // TODO: GET /sapi/v3/sub-account/assets (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-sub-account-assets-for-master-account
          // TODO: GET /sapi/v1/sub-account/spotSummary (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-sub-account-spot-assets-summary-for-master-account
          // TODO: GET /sapi/v1/capital/deposit/subAddress (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#get-sub-account-deposit-address-for-master-account
          // TODO: GET /sapi/v1/capital/deposit/subHisrec (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#get-sub-account-deposit-history-for-master-account
          // TODO: GET /sapi/v1/sub-account/status (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#get-sub-account-39-s-status-on-margin-futures-for-master-account
          // TODO: POST /sapi/v1/sub-account/margin/enable (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#enable-margin-for-sub-account-for-master-account
          // TODO: GET /sapi/v1/sub-account/margin/account (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#get-detail-on-sub-account-39-s-margin-account-for-master-account
          // TODO: GET /sapi/v1/sub-account/margin/accountSummary (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#get-summary-of-sub-account-39-s-margin-account-for-master-account
          // TODO: POST /sapi/v1/sub-account/futures/enable (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#enable-futures-for-sub-account-for-master-account
          // TODO: GET /sapi/v1/sub-account/futures/account (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#get-detail-on-sub-account-39-s-futures-account-for-master-account
          // TODO: GET /sapi/v1/sub-account/futures/accountSummary (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#get-summary-of-sub-account-39-s-futures-account-for-master-account
          // TODO: GET /sapi/v1/sub-account/futures/positionRisk (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#get-futures-position-risk-of-sub-account-for-master-account
          // TODO: POST /sapi/v1/sub-account/futures/transfer (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#futures-transfer-for-sub-account-for-master-account
          // TODO: POST /sapi/v1/sub-account/margin/transfer (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#margin-transfer-for-sub-account-for-master-account
          // TODO: POST /sapi/v1/sub-account/transfer/subToSub (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#transfer-to-sub-account-of-same-master-for-sub-account
          // TODO: POST /sapi/v1/sub-account/transfer/subToMaster (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#transfer-to-master-for-sub-account
          // TODO: GET /sapi/v1/sub-account/transfer/subUserHistory (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#sub-account-transfer-history-for-sub-account
          // TODO: POST /sapi/v1/sub-account/universalTransfer (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#universal-transfer-for-master-account
          // TODO: GET /sapi/v1/sub-account/universalTransfer (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-universal-transfer-history-for-master-account
          // TODO: GET /sapi/v2/sub-account/futures/account (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#get-detail-on-sub-account-39-s-futures-account-v2-for-master-account
          // TODO: GET /sapi/v2/sub-account/futures/accountSummary (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#get-summary-of-sub-account-39-s-futures-account-v2-for-master-account
          // TODO: GET /sapi/v2/sub-account/futures/positionRisk (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#get-futures-position-risk-of-sub-account-v2-for-master-account
          // TODO: POST /sapi/v1/sub-account/blvt/enable (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#enable-leverage-token-for-sub-account-for-master-account
          // TODO: POST /sapi/v1/managed-subaccount/deposit (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#deposit-assets-into-the-managed-sub-account-for-investor-master-account
          // TODO: GET /sapi/v1/managed-subaccount/asset (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-managed-sub-account-asset-details-for-investor-master-account
          // TODO: POST /sapi/v1/managed-subaccount/withdraw (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#withdrawl-assets-from-the-managed-sub-account-for-investor-master-account
        },
        marketData: {                                                               // ✅ Market Data Endpoints (https://binance-docs.github.io/apidocs/spot/en/#market-data-endpoints)
          /**
           * Get older market trades.
           * @weight 5
           * @http GET
           * @see https://binance-docs.github.io/apidocs/futures/en/#old-trades-lookup-market_data
           * @requires APIKEY
           * @param {{
           *  symbol: string
           *  limit?: number
           *  fromId?: number
           * }} payload
           * @returns {[{
           *  "id": number
           *  "price": string
           *  "qty": string
           *  "quoteQty": string
           *  "time": number
           *  "isBuyerMaker": boolean
           *  "isBestMatch": boolean
           * }]} Array of old trade objects
           */
          historicalTrades: payload =>
            checkParams('historicalTrades', payload, ['symbol']) && kCall('/api/v3/historicalTrades', payload),
        },
        trade: {                                                                    // Account/Trade Endpoints (https://binance-docs.github.io/apidocs/spot/en/#spot-account-trade)
          orderTest: payload => order(privCall, payload, '/api/v3/order/test'),                     // https://binance-docs.github.io/apidocs/spot/en/#test-new-order-trade
          order: payload => order(privCall, payload, '/api/v3/order'),                              // https://binance-docs.github.io/apidocs/spot/en/#new-order-trade
          cancelOrder: payload => privCall('/api/v3/order', payload, 'DELETE'),                     // https://binance-docs.github.io/apidocs/spot/en/#cancel-order-trade
          cancelOpenOrders: payload => privCall('/api/v3/openOrders', payload, 'DELETE'),           // https://binance-docs.github.io/apidocs/spot/en/#cancel-all-open-orders-on-a-symbol-trade
          getOrder: payload => privCall('/api/v3/order', payload),                                  // https://binance-docs.github.io/apidocs/spot/en/#query-order-user_data
          openOrders: payload => privCall('/api/v3/openOrders', payload),                           // https://binance-docs.github.io/apidocs/spot/en/#current-open-orders-user_data
          allOrders: payload => privCall('/api/v3/allOrders', payload),                             // https://binance-docs.github.io/apidocs/spot/en/#all-orders-user_data
          orderOco: payload => orderOco(privCall, payload, '/api/v3/order/oco'),                    // https://binance-docs.github.io/apidocs/spot/en/#new-oco-trade
          cancelOrderOco: payload => privCall('/api/v3/orderList', payload, 'DELETE'),              // https://binance-docs.github.io/apidocs/spot/en/#cancel-oco-trade
          getOrderOco: payload => privCall('/api/v3/orderList', payload),                           // https://binance-docs.github.io/apidocs/spot/en/#query-oco-user_data
          allOrdersOCO: payload => privCall('/api/v3/allOrderList', payload),                       // https://binance-docs.github.io/apidocs/spot/en/#query-all-oco-user_data
          // TODO: GET /api/v3/openOrderList (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-open-oco-user_data
          accountInfo: payload => privCall('/api/v3/account', payload),                             // https://binance-docs.github.io/apidocs/spot/en/#account-information-user_data
          myTrades: payload => privCall('/api/v3/myTrades', payload),                               // https://binance-docs.github.io/apidocs/spot/en/#account-trade-list-user_data
        },
        userDataStreams: {                                                          // Spot User Data Streams (https://binance-docs.github.io/apidocs/spot/en/#listen-key-spot)
          create: () => privCall('/api/v3/userDataStream', null, 'POST', true),
          ping: payload => privCall('/api/v3/userDataStream', payload, 'PUT', false, true),
          close: payload => privCall('/api/v3/userDataStream', payload, 'DELETE', false, true),
        },
        savings: {
          lendingAccount: payload => privCall('/sapi/v1/lending/union/account', payload)
        },
        mining: {},
        futures: {                                                                  // ✅ Futures Endpoints (https://binance-docs.github.io/apidocs/spot/en/#futures)
          /**
           * Execute transfer between spot account and futures account.
           * @weight 1
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#new-future-account-transfer-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  asset: string
           *  amount: string
           *  type: 1 | 2 | 3 | 4
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{ "tranId": number }} Object containing transaction ID
           */
          transfer: payload =>
            checkParams('transfer', payload, [ 'asset', 'amount', 'type', 'timestamp' ]) &&
            privCall('/sapi/v1/futures/transfer', payload, 'POST'),
          /**
           * Get futures account transaction history list.
           * @weight 10
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#get-future-account-transaction-history-list-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  asset: string
           *  startTime: number
           *  endTime?: number
           *  current?: number
           *  size?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "rows": [{
           *    "asset": string
           *    "tranId": number
           *    "amount": string
           *    "type": 1 | 2 | 3 | 4
           *    "timestamp": number
           *    "status": 'PENDING' | 'CONFIRMED' | 'FAILED'
           *  }]
           *  "total": number
           * }} Object containing transaction history list
           */
          transactionHistoryList: payload =>
            checkParams('transactionHistoryList', payload, [ 'asset', 'startTime', 'timestamp' ]) &&
            privCall('/sapi/v1/futures/transfer', payload),
          /**
           * Borrow for cross-collateral.
           * @weight 3000
           * @rate 1/1s per account
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#borrow-for-cross-collateral-trade
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  coin: string
           *  amount?: string
           *  collateralCoin: string
           *  collateralAmount?: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "coin": string
           *  "amount": string
           *  "collateralCoin": string
           *  "collateralAmount": string
           *  "time": number
           *  "borrowId": string
           * }} Object containing borrow result
           */
          crossCollateralBorrow: payload =>
            checkParams('borrowCrossCollateral', payload, [ 'coin', 'collateralCoin', 'timestamp' ]) &&
            privCall('/sapi/v1/futures/loan/borrow', payload, 'POST'),
          /**
           * Cross-collateral borrow history.
           * @weight 10
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#cross-collateral-borrow-history-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  coin?: string
           *  startTime?: number
           *  endTime?: number
           *  limit?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "rows": [{
           *    "confirmedTime": number
           *    "coin": string
           *    "collateralRate": string
           *    "leftTotal": string
           *    "leftPrincipal": string
           *    "deadline": number
           *    "collateralCoin": string
           *    "collateralAmount": string
           *    "orderStatus": 'PENDING' | 'CONFIRMED' | 'FAILED'
           *    "borrowId": string
           *  }]
           *  "total": number
           * }} Object containing borrow history list
           */
          crossCollateralBorrowHistory: payload =>
            checkParams('crossCollateralBorrowHistory', payload, ['timestamp']) &&
            privCall('/sapi/v1/futures/loan/borrow/history', payload),
          /**
           * Repay for cross-collateral.
           * @weight 3000
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#repay-for-cross-collateral-trade
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  coin: string
           *  collateralCoin: string
           *  amount: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "coin": string
           *  "amount": string
           *  "collateralCoin": string
           *  "repayId": string
           * }} Object containing repayment status
           */
          crossCollateralRepay: payload =>
            checkParams('crossCollateralRepay', payload, [ 'coin', 'collateralCoin', 'amount', 'timestamp' ]) &&
            privCall('/sapi/v1/futures/loan/repay', payload, 'POST'),
          /**
           * Cross-collateral repayment history.
           * @weight 10
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#cross-collateral-repayment-history-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  coin?: string
           *  startTime?: number
           *  endTime?: number
           *  limit?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "rows": [{
           *    "coin": string
           *    "amount": string
           *    "collateralCoin": string
           *    "repayType": 'NORMAL' | 'COLLATERAL'
           *    "releasedCollateral": string
           *    "price": string
           *    "repayCollateral": string
           *    "confirmedTime": number
           *    "updateTime": number
           *    "status": 'PENDING' | 'CONFIRMED' | 'FAILED'
           *    "repayId": string
           *  }]
           *  "total": number
           * }} Object containing repayment history list
           */
          crossCollateralRepayHistory: payload =>
            checkParams('crossCollateralRepayHistory', payload, ['timestamp']) &&
            privCall('/sapi/v1/futures/loan/repay/history', payload),
          /**
           * Cross-collateral wallet.
           * @weight 10
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#cross-collateral-wallet-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "totalCrossCollateral": string
           *  "totalBorrowed": string
           *  "totalInterest": string
           *  "interestFreeLimit": string
           *  "asset": string
           *  "crossCollaterals": [{
           *    "collateralCoin": string
           *    "locked": string
           *    "loanAmount": string
           *    "currentCollateralRate": string
           *    "interestFreeLimitUsed": string
           *    "principalForInterest": string
           *    "interest": string
           *  }]
           * }} Object containing cross-collateral wallet
           */
          crossCollateralWallet: payload =>
            checkParams('crossCollateralWallet', payload, ['timestamp']) &&
            privCall('/sapi/v1/futures/loan/wallet', payload),
          /**
           * Cross-collateral wallet V2.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#cross-collateral-wallet-v2-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "totalCrossCollateral": string
           *  "totalBorrowed": string
           *  "totalInterest": string
           *  "interestFreeLimit": string
           *  "asset": string
           *  "crossCollaterals": [{
           *    "loanCoin": string
           *    "collateralCoin": string
           *    "locked": string
           *    "loanAmount": string
           *    "currentCollateralRate": string
           *    "interestFreeLimitUsed": string
           *    "principalForInterest": string
           *    "interest": string
           *  }]
           * }} Object containing cross-collateral wallet V2
           */
          crossCollateralWalletV2: payload =>
            checkParams('crossCollateralWalletV2', payload, ['timestamp']) &&
            privCall('/sapi/v2/futures/loan/wallet', payload),
          /**
           * Cross-collateral information.
           * 
           * All collateral data will be returned if `collateralCoin` is not sent.
           * @weight 10
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#cross-collateral-information-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  collateralCoin?: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {[{
           *  "collateralCoin": string
           *  "rate": string
           *  "marginCallCollateralRate": string
           *  "liquidationCollateralRate": string
           *  "currentCollateralRate": string
           *  "interestRate": string
           *  "interestGracePeriod": string
           * }]} Array of cross-collateral information objects
           */
          crossCollateralInformation: payload =>
            checkParams('crossCollateralInformation', payload, ['timestamp']) &&
            privCall('/sapi/v1/futures/loan/configs', payload),
          /**
           * Cross-collateral information V2.
           * 
           * All loan and collateral data will be returned if `loanCoin` or `collateralCoin` is not sent.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#cross-collateral-information-v2-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  loanCoin?: string
           *  collateralCoin?: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {[{
           *  "loanCoin": string
           *  "collateralCoin": string
           *  "rate": string
           *  "marginCallCollateralRate": string
           *  "liquidationCollateralRate": string
           *  "currentCollateralRate": string
           *  "interestRate": string
           *  "interestGracePeriod": string
           * }]} Array of cross-collateral information V2 objects
           */
          crossCollateralInformationV2: payload =>
            checkParams('crossCollateralInformationV2', payload, ['timestamp']) &&
            privCall('/sapi/v2/futures/loan/configs', payload),
          /**
           * Calculate rate after adjust cross-collateral LTV.
           * @weight 50
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#calculate-rate-after-adjust-cross-collateral-ltv-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  collateralCoin: string
           *  amount: string
           *  direction: 'ADDITIONAL' | 'REDUCED'
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{ "afterCollateralRate": string }} Object containing afterCollateralRate
           */
          crossCollateralCalculateRateAfterAdjust: payload =>
            checkParams('crossCollateralCalculateRateAfterAdjust', payload, [ 'collateralCoin', 'amount', 'direction', 'timestamp' ]) &&
            privCall('/sapi/v1/futures/loan/calcAdjustLevel', payload),
          /**
           * Calculate rate after adjust cross-collateral LTV V2.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#calculate-rate-after-adjust-cross-collateral-ltv-v2-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  loanCoin: string
           *  collateralCoin: string
           *  amount: string
           *  direction: 'ADDITIONAL' | 'REDUCED'
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{ "afterCollateralRate": string }} Object containing afterCollateralRate
           */
          crossCollateralCalculateRateAfterAdjustV2: payload =>
            checkParams('crossCollateralCalculateRateAfterAdjustV2', payload, [ 'loanCoin', 'collateralCoin', 'amount', 'direction', 'timestamp' ]) &&
            privCall('/sapi/v2/futures/loan/calcAdjustLevel', payload),
          /**
           * Get max amount for adjust cross-collateral LTV.
           * @weight 50
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#get-max-amount-for-adjust-cross-collateral-ltv-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  collateralCoin: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "maxInAmount": string
           *  "maxOutAmount": string
           * }} Response object
           */
          crossCollateralMaxAdjustAmount: payload =>
            checkParams('crossCollateralMaxAdjustAmount', payload, [ 'collateralCoin', 'timestamp' ]) &&
            privCall('/sapi/v1/futures/loan/calcMaxAdjustAmount', payload),
          /**
           * Get max amount for adjust cross-collateral LTV V2.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#get-max-amount-for-adjust-cross-collateral-ltv-v2-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  loanCoin: string
           *  collateralCoin: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "maxInAmount": string
           *  "maxOutAmount": string
           * }} Response object
           */
          crossCollateralMaxAdjustAmountV2: payload =>
            checkParams('crossCollateralMaxAdjustAmountV2', payload, [ 'loanCoin', 'collateralCoin', 'timestamp' ]) &&
            privCall('/sapi/v2/futures/loan/calcMaxAdjustAmount', payload),
          /**
           * Adjust cross-collateral LTV.
           * @weight 3000
           * @rate 1/1s per account
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#adjust-cross-collateral-ltv-trade
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  collateralCoin: string
           *  amount: string
           *  direction: 'ADDITIONAL' | 'REDUCED'
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "collateralCoin": string
           *  "direction": 'ADDITIONAL' | 'REDUCED'
           *  "amount": string
           *  "time": number
           * }} Response object
           */
          adjustCrossCollateral: payload =>
            checkParams('adjustCrossCollateral', payload, [ 'collateralCoin', 'amount', 'direction', 'timestamp' ]) &&
            privCall('/sapi/v1/futures/loan/adjustCollateral', payload, 'POST'),
          /**
           * Adjust cross-collateral LTV V2.
           * @weight N/A
           * @rate 1/1s per account
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#adjust-cross-collateral-ltv-v2-trade
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  loanCoin: string
           *  collateralCoin: string
           *  amount: string
           *  direction: 'ADDITIONAL' | 'REDUCED'
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "loanCoin": string
           *  "collateralCoin": string
           *  "direction": 'ADDITIONAL' | 'REDUCED'
           *  "amount": string
           *  "time": number
           * }} Response object
           */
          adjustCrossCollateralV2: payload =>
            checkParams('adjustCrossCollateralV2', payload, [ 'loanCoin', 'collateralCoin', 'amount', 'direction', 'timestamp' ]) &&
            privCall('/sapi/v2/futures/loan/adjustCollateral', payload, 'POST'),
          /**
           * Adjust cross-collateral LTV history.
           * 
           * All data will be returned if `loanCoin` or `collateralCoin` is not sent.
           * @weight 10
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#adjust-cross-collateral-ltv-history-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  loanCoin?: string
           *  collateralCoin?: string
           *  startTime?: number
           *  endTime?: number
           *  limit?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "rows": [{
           *    "amount": string
           *    "collateralCoin": string
           *    "coin": string
           *    "preCollateralRate": string
           *    "afterCollateralRate": string
           *    "direction": 'ADDITIONAL' | 'REDUCED'
           *    "status": string TODO: Enum not mentioned in official documentation
           *    "adjustTime": number
           *  }]
           *  "total": number
           * }} Object containing adjust cross-collateral LTV history list
           */
          adjustCrossCollateralHistory: payload =>
            checkParams('adjustCrossCollateralHistory', payload, ['timestamp']) &&
            privCall('/sapi/v1/futures/loan/adjustCollateral/history', payload),
          /**
           * Cross-collateral liquidation history.
           * @weight 10
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#cross-collateral-liquidation-history-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  loanCoin?: string
           *  collateralCoin?: string
           *  startTime?: number
           *  endTime?: number
           *  limit?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "collateralAmountForLiquidation": string
           *  "collateralCoin": string
           *  "forceLiquidationStartTime": number
           *  "coin": string
           *  "restCollateralAmountAfterLiquidation": string
           *  "restLoanAmount": string
           *  "status": 'PENDING' | 'CONFIRMED' | 'FAILED'
           * }} Object containing cross-collateral liquidation history list
           */
          crossCollateralLiquidationHistory: payload =>
            checkParams('crossCollateralLiquidationHistory', payload, ['timestamp']) &&
            privCall('/sapi/v1/futures/loan/liquidationHistory', payload),
          /**
           * Check the maximum and minimum limit when repay with collateral.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#check-collateral-repay-limit-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  coin: string
           *  collateralCoin: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "coin": string
           *  "collateralCoin": string
           *  "max": string
           *  "min": string
           * }} Object containing collateral repay limit
           */
          collateralRepayLimit: payload =>
            checkParams('collateralRepayLimit', payload, [ 'coin', 'collateralCoin', 'timestamp' ]) &&
            privCall('/sapi/v1/futures/loan/collateralRepayLimit', payload),
          /**
           * Get quote before repay with collateral is mandatory, the quote will be valid within 25 seconds.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#get-collateral-repay-quote-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  coin: string
           *  collateralCoin: string
           *  amount: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "coin": string
           *  "collateralCoin": string
           *  "amount": string
           *  "quoteId": string
           * }} Object containing collateral repay quote.
           */
          getCollateralRepayQuote: payload =>
            checkParams('getCollateralRepayQuote', payload, [ 'coin', 'collateralCoin', 'amount', 'timestamp' ]) &&
            privCall('/sapi/v1/futures/loan/collateralRepay', payload),
          /**
           * Repay with collateral. Get quote before repay with collateral is mandatory, the quote will be valid within 25 seconds.
           * @weight 1
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#repay-with-collateral-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  quoteId: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "coin": string
           *  "collateralCoin": string
           *  "amount": string
           *  "quoteId": string
           * }} Object containing collateral repay receipt
           */
          collateralRepay: payload =>
            checkParams('collateralRepay', payload, [ 'quoteId', 'timestamp' ]) &&
            privCall('/sapi/v1/futures/loan/collateralRepay', payload, 'POST'),
          /**
           * Check collateral repayment result.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#collateral-repayment-result-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  quoteId: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "quoteId": string
           *  "status": string
           * }} Object containing collateral repayment result
           */
          collateralRepaymentResult: payload =>
            checkParams('collateralRepaymentResult', payload, [ 'quoteId', 'timestamp' ]) &&
            privCall('/sapi/v1/futures/loan/collateralRepayResult', payload),
          /**
           * Get cross-collateral interest history.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#cross-collateral-interest-history-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  collateralCoin?: string
           *  startTime?: number
           *  endTime?: number
           *  current?: number
           *  limit?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "rows": [{
           *    "collateralCoin": string
           *    "interestCoin": string
           *    "interest": string
           *    "interestFreeLimitUsed": string
           *    "principalForInterest": string
           *    "interestRate": string
           *    "time": number
           *  }]
           *  "total": number
           * }} Object containing cross-collateral interest history list
           */
          crossCollateralInterestHistory: payload =>
            checkParams('crossCollateralInterestHistory', payload, ['timestamp']) &&
            privCall('/sapi/v1/futures/loan/interestHistory', payload),
        },
        BLVT: {                                                                     // ✅ BLVT Endpoints (https://binance-docs.github.io/apidocs/spot/en/#blvt-endpoints)
          /**
           * Get BLVT Info.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#get-blvt-info-market_data
           * @requires APIKEY
           * @param {{ tokenName?: string }} payload
           * @returns {[{
           *  "tokenName": string
           *  "description": string
           *  "underlying": string
           *  "tokenIssued": string
           *  "basket": string
           *  "currentBaskets": [{
           *    "symbol": string
           *    "amount": string
           *    "notionalValue": string
           *  }]
           *  "nav": string
           *  "realLeverage": string
           *  "fundingRate": string
           *  "dailyManagementFee": string
           *  "purchaseFeePct": string
           *  "dailyPurchaseLimit": string
           *  "redeemFeePct": string
           *  "dailyRedeemLimit": string
           *  "timestamp": number
           * }]} Array of token info objects
           */
          info: payload => kCall('/sapi/v1/blvt/tokenInfo', payload),
          /**
           * Subscribe to BLVT.
           * @weight 1
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#subscribe-blvt-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  tokenName: string
           *  cost: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "id": number
           *  "status": string
           *  "tokenName": string
           *  "amount": string
           *  "cost": string
           *  "timestamp": number
           * }} Object containing BLVT subscription
           */
          subscribe: payload =>
            checkParams('subscribe', payload, [ 'tokenName', 'cost', 'timestamp' ]) && privCall('/sapi/v1/blvt/subscribe', payload, 'POST'),
          /**
           * Query subscription record.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#query-subscription-record-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  tokenName?: string
           *  id?: number
           *  startTime?: number
           *  endTime?: number
           *  limit?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {[{
           *  "id": number
           *  "tokenName": string
           *  "amount": number
           *  "nav": string
           *  "fee": string
           *  "totalCharge": string
           *  "timestamp": number
           * }]} Array of subscription records
           */
          getSubscriptionRecord: payload =>
            checkParams('getSubscriptionRecord', payload, ['timestamp']) && privCall('/sapi/v1/blvt/subscribe/record', payload),
          /**
           * Redeem BLVT.
           * @weight 1
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#redeem-blvt-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  tokenName: string
           *  amount: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "id": number
           *  "status": 'S' | 'P' | 'F'
           *  "tokenName": string
           *  "redeemAmount": string
           *  "amount": string
           *  "timestamp": number
           * }} Object containing redeem BLVT
           */
          redeem: payload =>
            checkParams('redeem', payload, [ 'tokenName', 'amount', 'timestamp' ]) && privCall('/sapi/v1/blvt/redeem', payload, 'POST'),
          /**
           * Query redemption record.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#query-redemption-record-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  tokenName?: string
           *  id?: number
           *  startTime?: number
           *  endTime?: number
           *  limit?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {[{
           *  "id": number
           *  "tokenName": string
           *  "amount": number
           *  "nav": string
           *  "fee": string
           *  "netProceed": string
           *  "timestamp": number
           * }]} Array of redemption records
           */
          getRedemptionRecord: payload =>
            checkParams('getRedemptionRecord', payload, ['timestamp']) && privCall('/sapi/v1/blvt/redeem/record', payload),
          /**
           * Get BLVT user limit info.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#get-blvt-user-limit-info-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  tokenName?: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {[{
           *  "tokenName": string
           *  "userDailyTotalPurchaseLimit": string
           *  "userDailyTotalRedeemLimit": string
           * }]} Array of BLVT user limit info objects
           */
          userLimit: payload =>
            checkParams('userLimit', payload, ['timestamp']) && privCall('/sapi/v1/blvt/userLimit', payload),
        },
        BSwap: {                                                                    // ✅ BSwap Endpoints (https://binance-docs.github.io/apidocs/spot/en/#bswap-endpoints)
          /**
           * Get metadata about all swap pools.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#list-all-swap-pools-market_data
           * @requires APIKEY
           * @returns {[{
           *  "poolId": number
           *  "poolName": string
           *  "assets": [ string, string ]
           * }]} Array of swap pool metadata objects
           */
          getPools: payload => kCall('/sapi/v1/bswap/pools', payload),
          /**
           * Get liquidity information and user share of a pool.
           * @weight 1 for one pool, 10 when the poolId parameter is omitted
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#get-liquidity-information-of-a-pool-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  poolId?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {[{
           *  "poolId": number
           *  "poolName": string
           *  "updateTime": number
           *  "liquidity": {
           *    [ key: string ]: number
           *  }
           *  "share": {
           *    "shareAmount": number
           *    "sharePercentage": number
           *    "asset": {
           *      [ key: string ]: number
           *    }
           *  }
           * }]} Array of swap pool metadata objects
           */
          getLiquidity: payload =>
            checkParams('getLiquidity', payload, ['timestamp']) && privCall('/sapi/v1/bswap/liquidity', payload),
          /**
           * Add liquidity to a pool.
           * @weight 1000 (Additional: 3 times one second)
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#add-liquidity-trade
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  poolId: number
           *  type?: 'SINGLE' | 'COMBINATION'
           *  asset: string
           *  quantity: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{ "operationId": number }} Object containing operationId
           */
          addLiquidity: payload =>
            checkParams('addLiquidity', payload, [ 'poolId', 'asset', 'quantity', 'timestamp' ]) && privCall('/sapi/v1/bswap/liquidityAdd', payload, 'POST'),
          /**
           * Remove liquidity from a pool, `type` includes `SINGLE` and `COMBINATION`, asset is mandatory for single asset removal.
           * @weight 1000 (Additional: 3 times one second)
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#remove-liquidity-trade
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  poolId: number
           *  type: 'SINGLE' | 'COMBINATION'
           *  asset?: string | string[]
           *  shareAmount: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{ "operationId": number }} Object containing operationId
           */
          removeLiquidity: payload =>
            checkParams('removeLiquidity', payload, [ 'poolId', 'type', 'shareAmount', 'timestamp' ]) && privCall('/sapi/v1/bswap/liquidityRemove', payload, 'POST'),
          /**
           * Get liquidity operation (add/remove) records.
           * @weight 3000
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#get-liquidity-operation-record-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  operationId?: number
           *  poolId?: number
           *  operation?: 'ADD' | 'REMOVE'
           *  startTime?: number
           *  endTime?: number
           *  limit?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {[{
           *  "operationId": number
           *  "poolId": number
           *  "poolName": string
           *  "operation": 'ADD' | 'REMOVE'
           *  "status": 0 | 1 | 2
           *  "updateTime": number
           *  "shareAmount": string
           * }]} Array of liquidity operation record objects
           */
          getLiquidityOperationRecords: payload =>
            checkParams('getLiquidityOperationRecords', payload, ['timestamp']) && privCall('/sapi/v1/bswap/liquidityOps', payload),
          /**
           * Request a quote for swap quote asset (selling asset) for base asset (buying asset), essentially price/exchange rates.
           * 
           * `quoteQty` is quantity of quote asset (to sell).
           * 
           * Please note that the quote is for reference only, the actual price will change as the liquidity changes,
           * it's recommended to swap immediately after requesting a quote for slippage prevention.
           * @weight 150
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#request-quote-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  quoteAsset: string
           *  baseAsset: string
           *  quoteQty: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "quoteAsset": string
           *  "baseAsset": string
           *  "quoteQty": number
           *  "baseQty": number
           *  "price": number
           *  "slippage": number
           *  "fee": number
           * }} Object containing quote
           */
          requestQuote: payload =>
            checkParams('requestQuote', payload, [ 'quoteAsset', 'baseAsset', 'quoteQty', 'timestamp' ]) && privCall('/sapi/v1/bswap/quote', payload),
          /**
           * Swap quoteAsset for baseAsset.
           * @weight 1000 (Additional: 3 times one second)
           * @http POST
           * @see https://binance-docs.github.io/apidocs/spot/en/#swap-trade
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  quoteAsset: string
           *  baseAsset: string
           *  quoteQty: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload 
           * @returns {{ "swapID": number }} Object containing swapID
           */
          swap: payload =>
            checkParams('swap', payload, [ 'quoteAsset', 'baseAsset', 'quoteQty', 'timestamp' ]) && privCall('/sapi/v1/bswap/swap', payload, 'POST'),
          /**
           * Get swap history.
           * @weight 3000
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#get-swap-history-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  swapId?: number
           *  startTime?: number
           *  endTime?: number
           *  status?: 0 | 1 | 2
           *  quoteAsset?: string
           *  baseAsset?: string
           *  limit?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload 
           * @returns {[{
           *  "swapID": number
           *  "swapTime": number
           *  "status": number
           *  "quoteAsset": string
           *  "baseAsset": string
           *  "quoteQty": number
           *  "baseQty": number
           *  "price": number
           *  "fee": number
           * }]} Array of swap objects
           */
          swapHistory: payload =>
            checkParams('swapHistory', payload, ['timestamp']) && privCall('/sapi/v1/bswap/swap', payload),
          /**
           * Get pool configuration.
           * @weight 150
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#get-pool-configure-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  poolId?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload 
           * @returns {[{
           *  "poolId": number
           *  "poolName": string
           *  "updateTime": number
           *  "liquidity": {
           *    "constantA": number | "NA"
           *    "minRedeemShare": number
           *    "slippageTolerance": number
           *  }
           *  "assetConfigure": {
           *    "BUSD": {
           *      "minAdd": number
           *      "maxAdd": number
           *      "minSwap": number
           *      "maxSwap": number
           *    }
           *    "USDT": {
           *      "minAdd": number
           *      "maxAdd": number
           *      "minSwap": number
           *      "maxSwap": number
           *    }
           *  }
           * }]} Object containing pool configuration
           */
          getPoolConfigure: payload =>
            checkParams('getPoolConfigure', payload, ['timestamp']) && privCall('/sapi/v1/bswap/poolConfigure', payload),
          /**
           * Calculate expected share amount for adding liquidity in single or dual token.
           * @weight 150
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#add-liquidity-preview-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  poolId: number
           *  type: 'SINGLE' | 'COMBINATION'
           *  quoteAsset: string
           *  quoteQty: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload 
           * @returns {{
           *  "quoteAsset": string
           *  "baseAsset": string
           *  "quoteAmt": number
           *  "baseAmt": number
           *  "price": number
           *  "share": number
           *  "slippage": number
           *  "fee": number
           * }} Object containing liquidity preview
           */
          addLiquidityPreview: payload =>
            checkParams('addLiquidityPreview', payload, [ 'poolId', 'type', 'quoteAsset', 'quoteQty', 'timestamp' ]) && privCall('/sapi/v1/bswap/addLiquidityPreview', payload),
          /**
           * Calculate the expected asset amount of single token redemption or dual token redemption.
           * @weight 150
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#remove-liquidity-preview-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  poolId: number
           *  type: 'SINGLE' | 'COMBINATION'
           *  quoteAsset: string
           *  shareAmount: string
           *  recvWindow?: number
           *  timestamp: number
           * }} payload 
           * @returns {{
           *  "quoteAsset": string
           *  "baseAsset": string
           *  "quoteAmt": number
           *  "baseAmt": number
           *  "price": number
           *  "slippage": number
           *  "fee": number
           * }} Object containing liquidity preview
           */
          removeLiquidityPreview: payload =>
            checkParams('removeLiquidityPreview', payload, [ 'poolId', 'type', 'quoteAsset', 'shareAmount', 'timestamp' ]) && privCall('/sapi/v1/bswap/removeLiquidityPreview', payload),
        },
        fiat: {                                                                     // ✅ Fiat Endpoints (https://binance-docs.github.io/apidocs/spot/en/#fiat-endpoints)
          /**
           * Get fiat deposit/withdraw history.
           * 
           * If `beginTime` and `endTime` are not sent, the recent 30-day data will be returned.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#get-fiat-deposit-withdraw-history-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  transactionType: string
           *  beginTime?: number
           *  endTime?: number
           *  page?: number
           *  rows?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "code": string
           *  "message": string
           *  "data": [{
           *    "orderNo": string
           *    "fiatCurrency": string
           *    "indicatedAmount": string
           *    "amount": string
           *    "totalFee": string
           *    "method": string
           *    "status": 'Processing' | 'Failed' | 'Successful' | 'Finished'
           *    | 'Refunding' | 'Refunded' | 'Refund Failed' | 'Order Partial credit Stopped'
           *    "createTime": number
           *    "updateTime": number
           *  }]
           *  "total": number
           *  "success": boolean
           * }} Object containing fiat deposit/withdraw history
           */
          getOrderHistory: payload =>
            checkParams('getOrderHistory', payload, [ 'transactionType', 'timestamp' ]) && privCall('/sapi/v1/fiat/orders', payload),
          /**
           * Get fiat payments history.
           * 
           * If `beginTime` and `endTime` are not sent, the recent 30-day data will be returned.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#get-fiat-payments-history-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  transactionType: string
           *  beginTime?: number
           *  endTime?: number
           *  page?: number
           *  rows?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "code": string
           *  "message": string
           *  "data": [{
           *    "orderNo": string
           *    "sourceAmount": string
           *    "fiatCurrency": string
           *    "obtainAmount": string
           *    "cryptoCurrency": string
           *    "totalFee": string
           *    "price": string
           *    "status": 'Processing' | 'Completed' | 'Failed' | 'Refunded'
           *    "createTime": number
           *    "updateTime": number
           *  }]
           *  "total": number
           *  "success": boolean
           * }} Object containing fiat payments history
           */
          getPaymentHistory: payload =>
            checkParams('getPaymentHistory', payload, [ 'transactionType', 'timestamp' ]) && privCall('/sapi/v1/fiat/payments', payload),
        },
        C2C: {                                                                      // ✅ C2C Endpoints (https://binance-docs.github.io/apidocs/spot/en/#c2c-endpoints)
          /**
           * Get C2C trade history.
           * - If `startTimestamp` and `endTimestamp` are not sent, the recent 30-day data will be returned.
           * - The max interval between `startTimestamp` and `endTimestamp` is 30 days.
           * @weight 1
           * @http GET
           * @see https://binance-docs.github.io/apidocs/spot/en/#get-c2c-trade-history-user_data
           * @requires APIKEY
           * @requires APISECRET
           * @param {{
           *  tradeType: 'BUY' | 'SELL'
           *  startTimestamp?: number
           *  endTimestamp?: number
           *  page?: number
           *  rows?: number
           *  recvWindow?: number
           *  timestamp: number
           * }} payload
           * @returns {{
           *  "code": string
           *  "message": string
           *  "data": [{
           *    "orderNumber": string
           *    "advNo": string
           *    "tradeType": 'BUY' | 'SELL'
           *    "asset": string
           *    "fiat": string
           *    "fiatSymbol": string
           *    "amount": string
           *    "totalPrice": string
           *    "unitPrice": string
           *    "orderStatus": 'PENDING' | 'TRADING' | 'BUYER_PAYED' | 'DISTRIBUTING' | 'COMPLETED'
           *    | 'IN_APPEAL' | 'CANCELLED' | 'CANCELLED_BY_SYSTEM'
           *    "createTime": number
           *    "commission": string
           *    "counterPartNickName": string
           *    "advertisementRole": string
           *  }]
           *  "total": number
           *  "success": boolean
           * }} Object containing C2C trade history
           */
          getTradeHistory: payload =>
            checkParams('getTradeHistory', payload, [ 'tradeType', 'timestamp' ]) && privCall('/sapi/v1/c2c/orderMatch/listUserOrderHistory', payload),
        }
      },
      margin: {                                                                     // Margin Endpoints (https://binance-docs.github.io/apidocs/spot/en/#margin-account-trade)
        // TODO: POST /sapi/v1/margin/transfer (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#cross-margin-account-transfer-margin
        marginLoan: payload => privCall('/sapi/v1/margin/loan', payload, 'POST'),                                 // https://binance-docs.github.io/apidocs/spot/en/#margin-account-borrow-margin
        marginRepay: payload => privCall('/sapi/v1/margin/repay', payload, 'POST'),                               // https://binance-docs.github.io/apidocs/spot/en/#margin-account-repay-margin
        // TODO: kCall() GET /sapi/v1/margin/asset https://binance-docs.github.io/apidocs/spot/en/#query-margin-asset-market_data
        // TODO: kCall() GET /sapi/v1/margin/pair https://binance-docs.github.io/apidocs/spot/en/#query-cross-margin-pair-market_data
        // TODO: kCall() GET /sapi/v1/margin/allAssets https://binance-docs.github.io/apidocs/spot/en/#get-all-margin-assets-market_data
        // TODO: kCall() GET /sapi/v1/margin/allPairs https://binance-docs.github.io/apidocs/spot/en/#get-all-cross-margin-pairs-market_data
        // TODO: kCall() GET /sapi/v1/margin/priceIndex https://binance-docs.github.io/apidocs/spot/en/#query-margin-priceindex-market_data
        marginOrder: payload => order(privCall, payload, '/sapi/v1/margin/order'),                                // https://binance-docs.github.io/apidocs/spot/en/#margin-account-new-order-trade
        marginCancelOrder: payload => privCall('/sapi/v1/margin/order', payload, 'DELETE'),                       // https://binance-docs.github.io/apidocs/spot/en/#margin-account-cancel-order-trade
        // TODO: DELETE /sapi/v1/margin/openOrders (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#margin-account-cancel-all-open-orders-on-a-symbol-trade
        // TODO: GET /sapi/v1/margin/transfer (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#get-cross-margin-transfer-history-user_data
        // TODO: GET /sapi/v1/margin/loan (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-loan-record-user_data
        // TODO: GET /sapi/v1/margin/repay (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-repay-record-user_data
        // TODO: GET /sapi/v1/margin/interestHistory (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#get-interest-history-user_data
        // TODO: GET /sapi/v1/margin/forceLiquidationRec (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#get-force-liquidation-record-user_data
        marginAccountInfo: payload => privCall('/sapi/v1/margin/account', payload),                               // https://binance-docs.github.io/apidocs/spot/en/#query-cross-margin-account-details-user_data
        marginGetOrder: payload => privCall('/sapi/v1/margin/order', payload),                                    // https://binance-docs.github.io/apidocs/spot/en/#query-margin-account-39-s-order-user_data
        marginOpenOrders: payload => privCall('/sapi/v1/margin/openOrders', payload),                             // https://binance-docs.github.io/apidocs/spot/en/#query-margin-account-39-s-open-orders-user_data
        marginAllOrders: payload => privCall('/sapi/v1/margin/allOrders', payload),                               // https://binance-docs.github.io/apidocs/spot/en/#query-margin-account-39-s-all-orders-user_data
        marginOrderOco: payload => _orderOco(privCall, payload, '/sapi/v1/margin/order/oco'),                     // https://binance-docs.github.io/apidocs/spot/en/#margin-account-new-oco-trade
        // TODO: DELETE /sapi/v1/margin/orderList (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#margin-account-cancel-oco-trade
        // TODO: GET /sapi/v1/margin/orderList (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-margin-account-39-s-oco-user_data
        // TODO: GET /sapi/v1/margin/allOrderList (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-margin-account-39-s-all-oco-user_data
        // TODO: GET /sapi/v1/margin/openOrderList (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-margin-account-39-s-open-oco-user_data
        marginMyTrades: payload => privCall('/sapi/v1/margin/myTrades', payload),                                 // https://binance-docs.github.io/apidocs/spot/en/#query-margin-account-39-s-trade-list-user_data
        marginMaxBorrow: payload => privCall('/sapi/v1/margin/maxBorrowable', payload),                           // https://binance-docs.github.io/apidocs/spot/en/#query-max-borrow-user_data
        // TODO: GET /sapi/v1/margin/maxTransferable (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-max-transfer-out-amount-user_data
        setBNBBurn: payload => privCall('/sapi/v1/bnbBurn', payload, 'POST'),                                     // https://binance-docs.github.io/apidocs/spot/en/#toggle-bnb-burn-on-spot-trade-and-margin-interest-user_data
        getBNBBurn: payload => privCall('/sapi/v1/bnbBurn', payload),                                             // https://binance-docs.github.io/apidocs/spot/en/#get-bnb-burn-status-user_data
        // TODO: GET /sapi/v1/margin/interestRateHistory (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-margin-interest-rate-history-user_data
        userDataStreams: {                                                          // Margin User Data Streams (https://binance-docs.github.io/apidocs/spot/en/#listen-key-margin):
          create: () => privCall('/sapi/v1/userDataStream', null, 'POST', true),
          ping: payload => privCall('/sapi/v1/userDataStream', payload, 'PUT', false, true),
          close: payload => privCall('/sapi/v1/userDataStream', payload, 'DELETE', false, true)
        },
        isolated: {                                                                 // Margin Isolated Endpoints (https://binance-docs.github.io/apidocs/spot/en/#isolated-margin-account-transfer-margin)
          transfer: payload => privCall('/sapi/v1/margin/isolated/transfer', payload, 'POST'),        // https://binance-docs.github.io/apidocs/spot/en/#isolated-margin-account-transfer-margin
          transferHistory: payload => privCall('/sapi/v1/margin/isolated/transfer', payload),         // https://binance-docs.github.io/apidocs/spot/en/#get-isolated-margin-transfer-history-user_data
          account: payload => privCall('/sapi/v1/margin/isolated/account', payload),                  // https://binance-docs.github.io/apidocs/spot/en/#query-isolated-margin-account-info-user_data
          disableAccount: payload => privCall('/sapi/v1/margin/isolated/account', payload, 'DELETE'),         // https://binance-docs.github.io/apidocs/spot/en/#disable-isolated-margin-account-trade
          enableAccount: payload => privCall('/sapi/v1/margin/isolated/account', payload, 'POST'),            // https://binance-docs.github.io/apidocs/spot/en/#enable-isolated-margin-account-trade
          // TODO: GET /sapi/v1/margin/isolated/accountLimit (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-enabled-isolated-margin-account-limit-user_data
          // TODO: GET /sapi/v1/margin/isolated/pair (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#query-isolated-margin-symbol-user_data
          // TODO: GET /sapi/v1/margin/isolated/allPairs (HMAC SHA256) https://binance-docs.github.io/apidocs/spot/en/#get-all-isolated-margin-symbol-user_data
          userDataStreams: {                                                       // Isolated Margin User Data Streams (https://binance-docs.github.io/apidocs/spot/en/#listen-key-isolated-margin)
            create: () => privCall('/sapi/v1/userDataStream/isolated', null, 'POST', true),
            ping: payload => privCall('/sapi/v1/userDataStream/isolated', payload, 'PUT', false, true),
            close: payload => privCall('/sapi/v1/userDataStream/isolated', payload, 'DELETE', false, true),
          }
        }
      },
      futures: {
        marketData: {
          // TODO: GET /fapi/v1/historicalTrades https://binance-docs.github.io/apidocs/futures/en/#old-trades-lookup-market_data
        },
        accountTrades: {                                                            // Account/Trades Endpoints (https://binance-docs.github.io/apidocs/futures/en/#account-trades-endpoints)
          changePositionMode: payload => privCall('/fapi/v1/positionSide/dual', payload, 'POST'),
          futuresOrder: payload => order(privCall, payload, '/fapi/v1/order'),
          futuresBatchOrders: payload => privCall('/fapi/v1/batchOrders', payload),
          futuresGetOrder: payload => privCall('/fapi/v1/order', payload),
          futuresCancelOrder: payload => privCall('/fapi/v1/order', payload, 'DELETE'),
          futuresCancelAllOpenOrders: payload => privCall('/fapi/v1/allOpenOrders', payload, 'DELETE'),
          futuresOpenOrders: payload => privCall('/fapi/v1/openOrders', payload),
          futuresAllOrders: payload => privCall('/fapi/v1/allOrders', payload),
          futuresPositionRisk: payload => privCall('/fapi/v2/positionRisk', payload),
          futuresAccountBalance: payload => privCall('/fapi/v2/balance', payload),
          futuresAccountInfo: payload => privCall('/fapi/v2/account', payload),
          futuresUserTrades: payload => privCall('/fapi/v1/userTrades', payload),
          futuresPositionMode: payload => privCall('/fapi/v1/positionSide/dual', payload),
          futuresLeverageBracket: payload => privCall('/fapi/v1/leverageBracket', payload),
          futuresLeverage: payload => privCall('/fapi/v1/leverage', payload, 'POST'),
          futuresMarginType: payload => privCall('/fapi/v1/marginType', payload, 'POST'),
          futuresPositionMargin: payload => privCall('/fapi/v1/positionMargin', payload, 'POST'),
          futuresMarginHistory: payload => privCall('/fapi/v1/positionMargin/history', payload),
          futuresIncome: payload => privCall('/fapi/v1/income', payload)
        },
        userDataStreams: {                                                          // Futures User Data Streams (https://binance-docs.github.io/apidocs/futures/en/#user-data-streams)
          create: () => privCall('/fapi/v1/listenKey', null, 'POST', true),
          ping: payload => privCall('/fapi/v1/listenKey', payload, 'PUT', false, true),
          close: payload => privCall('/fapi/v1/listenKey', payload, 'DELETE', false, true)
        }
      }
    },
    common: {
      getInfo: () => info
    },
    advanced: {
      // Call unmanaged private call to the Binance API: you need a key and a secret.
      privateRequest: (method, url, payload) => privCall(url, payload, method),
      // Call unmanaged public call to the Binance API.
      publicRequest: (method, url, payload) => pubCall(url, payload, method),
    }
    /**
     * .
     * @weight 
     * @http 
     * @see 
     * @requires APIKEY
     * @requires APISECRET
     * @param {{
     *  recvWindow?: number
     *  timestamp: number
     * }} payload
     * @returns {{}} 
     */
  }
}
