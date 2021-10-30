// Packages:
import crypto from 'crypto'
import zip from 'lodash.zipobject'
import 'isomorphic-fetch'


// Imports:
import publicSpot from './public/spot'
import publicFutures from './public/futures'
import authenticatedSpot from './authenticated/spot'
import authenticatedMargin from './authenticated/margin'
import authenticatedFutures from './authenticated/futures'


// Constants:
import {
  BASE,
  FUTURES,
  headersMapping,
  candleFields
} from './constants'


// State:
const info = {
  spot: {},
  futures: {}
}


// Functions:
const defaultGetTime = () => Date.now()

/**
 * Build query string for URI encoded URL based on JSON object.
 * @param { object } q 
 * @returns { string } queryString
 */
const makeQueryString = q =>
  q ?
    `?${
      Object.keys(q)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(q[k]))
        .join('&')
    }`
  :
    ''

/**
* Handles responses from the Binance API.
* @param { Response } res 
*/
const responseHandler = res => {
  if (!res.headers || !res.url) return
  const marketName = res.url.includes(FUTURES) ? 'futures' : 'spot'
  Object.keys(headersMapping).forEach(key => {
    const outKey = headersMapping[key]
    if (res.headers.has(key)) info[marketName][outKey] = res.headers.get(key)
  })
}

/**
 * Finalize the API response.
 * @param { Promise<Response> } call 
 */
const sendResult = call =>
  call.then(res => {
    // Get API limits info from headers.
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
        // The body was JSON parseable, assume it is an API response error.
        error = new Error(json.msg || `${ res.status } ${ res.statusText }`)
        error.code = json.code
        error.url = res.url
      } catch (e) {
        // The body was not JSON parseable, assume it is a proxy error.
        error = new Error(`${ res.status } ${ res.statusText } ${ text }`)
        error.response = res
        error.responseText = text
      }
      throw error
    })
  })

/**
 * Utility to validate the existence of required parameter(s).
 * @param { string } name 
 * @param { object } payload 
 * @param { any[] } requires 
 */
export const checkParams = (name, payload, requires = []) => {
  if (!payload) throw new Error('You need to pass a payload object.')
  requires.forEach(r => {
    if (!payload[r] && isNaN(payload[r])) {
      throw new Error(`Method ${ name } requires ${ r } parameter.`)
    }
  })
  return true
}

/**
 * Factory method for public calls against the Binance API.
 *
 * @param {{ endpoints: { base: string, futures: string } }} payload
 * @returns {(
 *  path: string
 *  data: any
 *  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
 *  headers: any
 * ) => Promise<any> } Function that returns the API response
 */
export const publicCall = ({ endpoints }) => (path, data, method = 'GET', headers = {}) =>
  sendResult(
    fetch(
      `${
        !(path.includes('/fapi') || path.includes('/futures')) || path.includes('/sapi') ?
          endpoints.base
        :
          endpoints.futures
      }${ path }${ makeQueryString(data) }`,
      {
        method,
        json: true,
        headers
      }
    )
  )

/**
 * Factory method for partial private calls against the Binance API.
 * 
 * @param {{ apiKey: string, pubCall: (
 *  path: string
 *  data: any
 *  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
 *  headers: any
 * ) => Promise<any> }} payload
 */
export const keyCall = ({ apiKey, pubCall }) => (path, data, method = 'GET') => {
  if (!apiKey) throw new Error('You need to pass an API key to make this call.')
  return pubCall(path, data, method, { 'X-MBX-APIKEY': apiKey })
}

/**
 * Factory method for private calls against the Binance API.
 * 
 * @param {{
 *  apiKey: string
 *  apiSecret: string
 *  endpoints: { base: string, futures: string }
 *  getTime: () => number
 *  pubCall: (
 *    path: string
 *    data: any
 *    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
 *    headers?: any
 *  ) => Promise<any>
 * }} payload
 * @returns {(
 *  path: string
 *  data?: any
 *  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
 *  noData?: boolean
 *  noExtra?: boolean
 * ) => Promise<any> }
 */
export const privateCall = ({
  apiKey,
  apiSecret,
  endpoints,
  getTime = defaultGetTime,
  pubCall
}) => (
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
 * Get candles for a specific pair and interval and convert the response
 * into a user-friendly collection.
 * 
 * @param {(
 *    path: string
 *    data: any
 *  ) => Promise<number[][]> } pubCall
 * @param { any } payload
 * @param { string } endpoint
 * @returns { void | Promise<{
 *  openTime: number
 *  open: number
 *  high: number
 *  low: number
 *  close: number
 *  volume: number
 *  closeTime: number
 *  quoteVolume: number
 *  trades: number
 *  baseAssetVolume: number
 *  quoteAssetVolume: number
 * }[]> }
 */
export const candles = (pubCall, payload, endpoint = '/api/v3/klines') =>
  checkParams('candles', payload, [ 'symbol' ]) &&
  pubCall(endpoint, { interval: '5m', ...payload }).then(candles =>
    candles.map(candle => zip(candleFields, candle))
  )

/**
 * Create a new order wrapper for market order simplicity.
 * 
 * @param {(
 *  path: string
 *  data?: any
 *  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
 *  noData?: boolean
 *  noExtra?: boolean
 * ) => Promise<any> } privCall
 * @param {{
 *  symbol: string
 *  side: 'BUY' | 'SELL'
 *  isIsolated?: 'TRUE' | 'FALSE'
 *  positionSide?: 'LONG' | 'SHORT' | 'BOTH'
 *  type?: 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT'
 *  | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT' | 'LIMIT_MAKER'
 *  quantity?: string
 *  quoteOrderQty?: string
 *  reduceOnly?: 'true' | 'false'
 *  price?: string
 *  timeInForce?: 'FOK' | 'GTC' | 'IOC'
 *  newClientOrderId?: string
 *  stopPrice?: string
 *  closePosition?: 'true' | 'false'
 *  activationPrice?: string
 *  callbackRate?: string
 *  workingType?: 'MARK_PRICE' | 'CONTRACT_PRICE'
 *  priceProtect?: 'TRUE' | 'FALSE'
 *  newOrderRespType?: 'ACK' | 'RESULT' | 'FULL'
 *  sideEffectType?: 'NO_SIDE_EFFECT' | 'MARGIN_BUY' | 'AUTO_REPAY'
 *  icebergQty?: string
 *  recvWindow?: number
 * }} payload
 * @param { string } url
 */
export const order = (privCall, payload = {}, url) => {
  const newPayload =
    [ 'LIMIT', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT_LIMIT' ].includes(payload.type) || !payload.type ?
      { timeInForce: 'GTC', ...payload }
    :
      payload
  const requires = [ 'symbol', 'side' ]
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

/**
 * Create a new futures order wrapper for market order simplicity.
 * 
 * @param {(
 *  path: string
 *  data?: any
 *  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
 *  noData?: boolean
 *  noExtra?: boolean
 * ) => Promise<any> } privCall
 * @param {{
 *  symbol:
 *  side: 'BUY' | 'SELL'
 *  positionSide?: 'BOTH' | 'LONG' | 'SHORT'
 *  type?: 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
 *  | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET'
 *  timeInForce?: 'FOK' | 'GTC' | 'IOC'
 *  quantity?: string
 *  reduceOnly?: 'true' | 'false'
 *  price?: string
 *  newClientOrderId?: string
 *  stopPrice?: string
 *  closePosition?: 'true' | 'false'
 *  activationPrice?: string
 *  callbackRate?: string
 *  workingType?: 'MARK_PRICE' | 'CONTRACT_PRICE'
 *  priceProtect?: 'TRUE' | 'FALSE'
 *  newOrderRespType?: 'ACK' | 'RESULT'
 *  recvWindow?: number
 * }} payload
 * @param { string } url
 */
export const futuresOrder = (privCall, payload = {}, url = 'fapi/v1/order') => {
  const newPayload =
    payload.type === 'LIMIT' || !payload.type ?
      { timeInForce: 'GTC', ...payload }
    :
      payload
  const requires = [ 'symbol', 'side' ]
  if (
    (newPayload.type === 'LIMIT') ||
    (newPayload.type === 'MARKET') ||
    (newPayload.type === 'STOP') ||
    (newPayload.type === 'TAKE_PROFIT')
  ) requires.push('quantity')
  if (
    newPayload.type === 'LIMIT' ||
    newPayload.type === 'STOP' ||
    newPayload.type === 'TAKE_PROFIT'
  ) requires.push('price')
  if (
    newPayload.type === 'STOP' ||
    newPayload.type === 'TAKE_PROFIT' ||
    newPayload.type === 'STOP_MARKET' ||
    newPayload.type === 'TAKE_PROFIT_MARKET'
  ) requires.push('stopPrice')
  if (newPayload.type === 'TRAILING_STOP_MARKET') requires.push('callbackRate')
  return (
    checkParams('authenticated.futures.trade.order', newPayload, requires) &&
    privCall(url, { type: 'LIMIT', ...newPayload }, 'POST')
  )
}

/**
 * Create a new futures batch order wrapper for market order simplicity.
 * 
 * @param {(
 *  path: string
 *  data?: any
 *  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
 *  noData?: boolean
 *  noExtra?: boolean
 * ) => Promise<any> } privCall
 * @param {{
 *  batchOrders: {
 *    symbol: string
 *    side: 'BUY' | 'SELL'
 *    positionSide?: 'BOTH' | 'LONG' | 'SHORT'
 *    type?: 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
 *    | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET'
 *    timeInForce?: 'FOK' | 'GTC' | 'IOC'
 *    quantity?: string
 *    reduceOnly?: 'true' | 'false'
 *    price?: string
 *    newClientOrderId?: string
 *    stopPrice?: string
 *    activationPrice?: string
 *    callbackRate?: string
 *    workingType?: 'MARK_PRICE' | 'CONTRACT_PRICE'
 *    priceProtect?: 'TRUE' | 'FALSE'
 *    newOrderRespType?: 'ACK' | 'RESULT'
 *  }[]
 *  recvWindow?: number
 * }} payload
 * @param { string } url
 */
export const futuresBatchOrder = (privCall, payload, url = 'fapi/v1/batchOrders') => {
  const batchOrderRequiresFulfilled = []
  payload.batchOrders.forEach(order => {
    const newOrder =
      order.type === 'LIMIT' || !order.type ?
        { timeInForce: 'GTC', ...order }
      :
        order
    const requires = [ 'symbol', 'side' ]
    if (
      (newOrder.type === 'LIMIT') ||
      (newOrder.type === 'MARKET') ||
      (newOrder.type === 'STOP') ||
      (newOrder.type === 'TAKE_PROFIT')
    ) requires.push('quantity')
    if (
      newOrder.type === 'LIMIT' ||
      newOrder.type === 'STOP' ||
      newOrder.type === 'TAKE_PROFIT'
    ) requires.push('price')
    if (
      newOrder.type === 'STOP' ||
      newOrder.type === 'TAKE_PROFIT' ||
      newOrder.type === 'STOP_MARKET' ||
      newOrder.type === 'TAKE_PROFIT_MARKET'
    ) requires.push('stopPrice')
    if (newOrder.type === 'TRAILING_STOP_MARKET') requires.push('callbackRate')
    batchOrderRequiresFulfilled.push(
      checkParams('authenticated.futures.trade.batchOrder', newOrder, requires)
    )
  })
  
  return (
    !batchOrderRequiresFulfilled.includes(false) &&
    privCall(url, { type: 'LIMIT', ...newPayload }, 'POST')
  )
}

/**
 * Create a new OCO order wrapper for OCO order simplicity.
 * 
 * @param {(
 *  path: string
 *  data?: any
 *  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
 *  noData?: boolean
 *  noExtra?: boolean
 * ) => Promise<any> } privCall
 * @param {{
 *  symbol: string
 *  listClientOrderId?: string
 *  side: 'BUY' | 'SELL'
 *  quantity: string
 *  limitClientOrderId?: string
 *  price: string
 *  limitIcebergQty?: string
 *  stopClientOrderId?: string
 *  stopPrice: string
 *  stopLimitPrice?: string
 *  stopIcebergQty?: string
 *  stopLimitTimeInForce?: 'FOK' | 'GTC' | 'IOC'
 *  newOrderRespType?: 'ACK' | 'RESULT' | 'FULL'
 *  recvWindow?: number
 * }} payload
 * @param { string } url
 */
export const orderOCO = (privCall, payload = {}, url) => {
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
 * @param {(
 *    path: string
 *    data: any
 *  ) => Promise<{ lastUpdateId: number, bids: string[][], asks: string[][] }> } pubCall
 * @param {{ symbol: string, limit?: number }} payload
 * @return { Promise<{
 *  lastUpdateId: number
 *  asks: { price: string, quantity: string }[]
 *  bids: { price: string, quantity: string }[]
 * }> | void }
 */
export const book = (pubCall, payload, endpoint = '/api/v3/depth') =>
  checkParams('book', payload, [ 'symbol' ]) &&
  pubCall(endpoint, payload).then(({ lastUpdateId, asks, bids }) => ({
    lastUpdateId,
    asks: asks.map(ask => zip([ 'price', 'quantity' ], ask)),
    bids: bids.map(bid => zip([ 'price', 'quantity' ], bid))
  }))

/**
 * Zip asks and bids reponse from futures order book.
 * 
 * @param {(
 *    path: string
 *    data: any
 *  ) => Promise<{ lastUpdateId: number, bids: string[][], asks: string[][] }> } pubCall
 * @param {{ symbol: string, limit?: number }} payload
 * @return { Promise<{
 *  lastUpdateId: number
 *  messageOutputTime: number
 *  transactionTime: number
 *  asks: { price: string, quantity: string }[]
 *  bids: { price: string, quantity: string }[]
 * }> | void }
 */
export const futuresBook = (pubCall, payload, endpoint = '/fapi/v1/depth') =>
  checkParams('book', payload, [ 'symbol' ]) &&
  pubCall(endpoint, payload).then(({ lastUpdateId, E, T, asks, bids }) => ({
    lastUpdateId,
    messageOutputTime: E,
    transactionTime: T,
    asks: asks.map(ask => zip([ 'price', 'quantity' ], ask)),
    bids: bids.map(bid => zip([ 'price', 'quantity' ], bid))
  }))

/**
 * Get compressed, aggregate trades and convert the response
 * into a user-friendly collection.
 * 
 * @param {(
 *    path: string
 *    data: any
 *  ) => Promise<[{
 *    a: number
 *    p: string
 *    q: string
 *    f: number
 *    l: number
 *    T: number
 *    m: boolean
 *    M: boolean
 *  }]> } pubCall
 * @param {{
 *  symbol: string
 *  fromId?: number
 *  startTime?: number
 *  endTime?: number
 *  limit?: number
 * }} payload
 */
export const aggTrades = (pubCall, payload, endpoint = '/api/v3/aggTrades') =>
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
      wasBestPrice: trade.M
    }))
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
      spot: publicSpot(pubCall),
      futures: publicFutures(pubCall)
    },
    authenticated: {
      spot: authenticatedSpot(privCall, kCall),
      margin: authenticatedMargin(privCall, kCall),
      futures: authenticatedFutures(privCall, kCall)
    },
    common: {
      getInfo: () => info
    },
    advanced: {
      /**
       * Call unmanaged public call to the Binance API.
       */
      publicRequest: (method, url, payload) => pubCall(url, payload, method),
      /**
       * Call unmanaged partial private call to the Binance API: You need a key.
       * @requires APIKEY
       */
      partialPrivateRequest: (method, url, payload) => kCall(url, payload, method),
      /**
       * Call unmanaged private call to the Binance API: you need a key and a secret.
       * @requires APIKEY
       * @requires APISECRET
       */
      privateRequest: (method, url, payload) => privCall(url, payload, method)
    }
  }
}
