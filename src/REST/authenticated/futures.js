// Imports:
import {
  checkParams,
  futuresOrder,
  futuresBatchOrder
} from '../'


// Exports:
/**
 * 💹 Futures Market Data Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/futures/en/#market-data-endpoints
 * @param { (path: any, data: any, method?: string) => Promise<any> } kCall
 */
export const authenticatedFuturesMarketData = (kCall) => ({
  /**
   * Get older market historical trades.
   * - Market trades means trades filled in the order book. Only market trades will be returned,
   * which means the insurance fund trades and ADL trades won't be returned.
   * @weight 20
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
   * }]} Array containing top trader long/short ratio (Accounts)
   */
  historicalTrades: payload =>
    checkParams('authenticated.futures.marketData.historicalTrades', payload, [ 'symbol', 'period' ]) &&
    kCall('/fapi/v1/historicalTrades', payload),
  /**
   * Get top trader long/short ratio (Accounts).
   * - If `startTime` and `endTime` are not sent, the most recent data is returned.
   * - Only the data of the latest 30 days is available.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#top-trader-long-short-ratio-accounts-market_data
   * @requires APIKEY
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
   * }]} Array containing top trader long/short ratio (Accounts)
   */
  topLongShortAccountRatio: payload =>
    checkParams('authenticated.futures.marketData.topLongShortAccountRatio', payload, [ 'symbol', 'period' ]) &&
    kCall('/futures/data/topLongShortAccountRatio', payload),
})

/**
 * 🤑 Futures Account/Trade Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/futures/en/#account-trades-endpoints
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedFuturesTrade = (privCall) => ({
  /**
   * Change user's position mode (Hedge Mode or One-way Mode) on ***EVERY SYMBOL***.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/futures/en/#change-position-mode-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  dualSidePosition: 'true' | 'false'
   *  recvWindow?: number
   * }} payload
   * @returns {{
   *  "code": number
   *  "msg" string
   * }} Response object 
   */
  changePositionMode: payload =>
    checkParams('authenticated.futures.trade.changePositionMode', payload, ['dualSidePosition']) &&
    privCall('/fapi/v1/positionSide/dual', payload, 'POST'),
  /**
   * Get user's position mode (Hedge Mode or One-way Mode) on ***EVERY SYMBOL***.
   * @weight 30
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#get-current-position-mode-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow?: number }} payload
   * @returns {{
   *  "dualSidePosition": boolean
   * }} Response object 
   */
  positionMode: payload => privCall('/fapi/v1/positionSide/dual', payload),
  /**
   * Change user's multi-assets mode (Multi-Assets Mode or Single-Asset Mode) on ***EVERY SYMBOL***.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/futures/en/#change-multi-assets-mode-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  multiAssetsMargin: 'true' | 'false'
   *  recvWindow?: number
   * }} payload
   * @returns {{
   *  "code": number
   *  "msg" string
   * }} Response object 
   */
  changeMultiAssetsMode: payload =>
    checkParams('authenticated.futures.trade.changeMultiAssetsMode', payload, ['multiAssetsMargin']) &&
    privCall('/fapi/v1/multiAssetsMargin', payload, 'POST'),
  /**
   * Get user's multi-assets mode (Multi-Assets Mode or Single-Asset Mode) on ***EVERY SYMBOL***.
   * @weight 30
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#get-current-multi-assets-mode-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow?: number }} payload
   * @returns {{
   *  "multiAssetsMargin": boolean
   * }} Response object 
   */
  multiAssetsMode: payload => privCall('/fapi/v1/multiAssetsMargin', payload),
  /**
   * Send in a new order.
   * Additional mandatory parameters based on `type`:
   * 
   * | Type                               | Additional mandatory parameters    |
   * | :--------------------------------- | :--------------------------------- |
   * | `LIMIT`                            | `timeInForce`, `quantity`, `price` |
   * | `MARKET`                           | `quantity`                         |
   * | `STOP`/`TAKE_PROFIT`               | `quantity`, `price`, `stopPrice`   |
   * | `STOP_MARKET`/`TAKE_PROFIT_MARKET` | `stopPrice`                        |
   * | `TRAILING_STOP_MARKET`             | `callbackRate`                     |
   * 
   * - Order with type `STOP`, parameter `timeInForce` can be sent (default `GTC`).
   * - Order with type `TAKE_PROFIT`, parameter `timeInForce` can be sent (default `GTC`).
   * - Condition orders will be triggered when:
   *    - If parameter `priceProtect` is sent as `true`:
   *        - When price reaches the `stopPrice`，the difference rate between `MARK_PRICE`
   *        and `CONTRACT_PRICE` cannot be larger than the `triggerProtect` of the symbol.
   *        - `triggerProtect` of a symbol can be got from `GET /fapi/v1/exchangeInfo`.
   *    - `STOP`, `STOP_MARKET`:
   *        - `BUY`: latest price (`MARK_PRICE` or `CONTRACT_PRICE`) >= `stopPrice`
   *        - SELL: latest price (`MARK_PRICE` or `CONTRACT_PRICE`) <= `stopPrice`
   *    - `TAKE_PROFIT`, `TAKE_PROFIT_MARKET`:
   *        - `BUY`: latest price (`MARK_PRICE` or `CONTRACT_PRICE`) <= `stopPrice`
   *        - `SELL`: latest price (`MARK_PRICE` or `CONTRACT_PRICE`) >= `stopPrice`
   *    - `TRAILING_STOP_MARKET`:
   *        - `BUY`: the lowest price after order placed <= `activationPrice`, and the latest
   *        price >= the lowest price * (1 + `callbackRate`)
   *        - `SELL`: the highest price after order placed >= `activationPrice`, and the latest
   *        price <= the highest price * (1 - `callbackRate`)
   * - For `TRAILING_STOP_MARKET`, if you get this error code: `{ "code": -2021,
   * "msg": "Order would immediately trigger." }` means that the parameters you send do not meet
   * the following requirements:
   *    - `BUY`: `activationPrice` should be smaller than latest price.
   *    - `SELL`: `activationPrice` should be larger than latest price.
   * - If `newOrderRespType` is sent as `RESULT`:
   *    - `MARKET` order: the final `FILLED` result of the order will be return directly.
   *    - `LIMIT` order with special timeInForce: the final status result of the order (`FILLED` or
   *    `EXPIRED`) will be returned directly.
   * - `STOP_MARKET`, `TAKE_PROFIT_MARKET` with `closePosition = true`:
   *    - Follow the same rules for condition orders.
   *    - If triggered，**close all** current long position (if `SELL`) or current short position (if `BUY`).
   *    - Cannot be used with `quantity` parameter.
   *    - Cannot be used with `reduceOnly` parameter.
   *    - In Hedge Mode, cannot be used with `BUY` orders in `LONG` position side, and cannot be used with
   *    `SELL` orders in `SHORT` position side.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/futures/en/#new-order-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
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
   * @returns {{
   *  "clientOrderId":  string
   *  "cumQty": string
   *  "cumQuote": string
   *  "executedQty": string
   *  "orderId": number
   *  "avgPrice": string
   *  "origQty": string
   *  "price": string
   *  "reduceOnly": boolean
   *  "side": 'BUY' | 'SELL'
   *  "positionSide": 'BOTH' | 'LONG' | 'SHORT'
   *  "status": string
   *  "stopPrice": string
   *  "closePosition": boolean
   *  "symbol": string
   *  "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *  "type": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *  | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET'
   *  "origType": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *  | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET'
   *  "activatePrice": string
   *  "priceRate": string
   *  "updateTime": number
   *  "workingType": 'MARK_PRICE' | 'CONTRACT_PRICE'
   *  "priceProtect": boolean
   * }} Response object 
   */
  order: payload => futuresOrder(privCall, payload, '/fapi/v1/order'),
  /**
   * Send in a new order.
   * - Max 5 orders.
   * - Parameter rules are same with New Order.
   * - Batch orders are processed concurrently, and the order of matching is not guaranteed.
   * - The order of returned contents for batch orders is the same as the order of the order list.
   * @weight 5
   * @http POST
   * @see https://binance-docs.github.io/apidocs/futures/en/#place-multiple-orders-trade
   * @requires APIKEY
   * @requires APISECRET
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
   * @returns {[
   *  {
   *    "clientOrderId":  string
   *    "cumQty": string
   *    "cumQuote": string
   *    "executedQty": string
   *    "orderId": number
   *    "avgPrice": string
   *    "origQty": string
   *    "price": string
   *    "reduceOnly": boolean
   *    "side": 'BUY' | 'SELL'
   *    "positionSide": 'BOTH' | 'LONG' | 'SHORT'
   *    "status": string
   *    "stopPrice": string
   *    "closePosition": boolean
   *    "symbol": string
   *    "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *    "type": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *    | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET'
   *    "origType": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *    | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET'
   *    "activatePrice": string
   *    "priceRate": string
   *    "updateTime": number
   *    "workingType": 'MARK_PRICE' | 'CONTRACT_PRICE'
   *    "priceProtect": boolean
   *  }
   *  {
   *    "code": number
   *    "msg": string
   *  }
   * ]} Response array
   */
  batchOrder: payload => futuresBatchOrder(privCall, payload, '/fapi/v1/batchOrders'),
  /**
   * Check an order's status.
   * 
   * These orders will not be found:
   * - Order status is `CANCELED` or `EXPIRED`, **AND**
   * - Order has NO filled trade, **AND**
   * - created time + 7 days < current time.
   * 
   * Notes:
   * - Either `orderId` or `origClientOrderId` must be sent.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#query-order-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  orderId?: number
   *  origClientOrderId?: string
   *  recvWindow?: number
   * }} payload
   * @returns {{
   *  "avgPrice": string
   *  "clientOrderId":  string
   *  "cumQuote": string
   *  "executedQty": string
   *  "orderId": number
   *  "origQty": string
   *  "origType": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *  "price": string
   *  "reduceOnly": boolean
   *  "side": 'BUY' | 'SELL'
   *  "positionSide": 'BOTH' | 'LONG' | 'SHORT'
   *  "status": string
   *  "stopPrice": string
   *  "closePosition": boolean
   *  "symbol": string
   *  "time": number
   *  "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *  "type": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *  | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET'
   *  "activatePrice": string
   *  "priceRate": string
   *  "updateTime": number
   *  "workingType": 'MARK_PRICE' | 'CONTRACT_PRICE'
   *  "priceProtect": boolean
   * }} Object containing order 
   */
  getOrder: payload =>
    checkParams('authenticated.futures.trade.getOrder', payload, ['symbol']) &&
    privCall('/fapi/v1/order', payload),
  /**
   * Cancel an active order.
   * Notes:
   * - Either `orderId` or `origClientOrderId` must be sent.
   * @weight 1
   * @http DELETE
   * @see https://binance-docs.github.io/apidocs/futures/en/#cancel-order-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  orderId?: number
   *  origClientOrderId?: string
   *  recvWindow?: number
   * }} payload
   * @returns {{
   *  "clientOrderId":  string
   *  "cumQty": string
   *  "cumQuote": string
   *  "executedQty": string
   *  "orderId": number
   *  "origQty": string
   *  "origType": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *  "price": string
   *  "reduceOnly": boolean
   *  "side": 'BUY' | 'SELL'
   *  "positionSide": 'BOTH' | 'LONG' | 'SHORT'
   *  "status": string
   *  "stopPrice": string
   *  "closePosition": boolean
   *  "symbol": string
   *  "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *  "type": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *  | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET'
   *  "activatePrice": string
   *  "priceRate": string
   *  "updateTime": number
   *  "workingType": 'MARK_PRICE' | 'CONTRACT_PRICE'
   *  "priceProtect": boolean
   * }} Response object 
   */
  cancelOrder: payload =>
    checkParams('authenticated.futures.trade.cancelOrder', payload, ['symbol']) &&
    privCall('/fapi/v1/order', payload, 'DELETE'),
  /**
   * Cancels all active orders on a symbol.
   * @weight 1
   * @http DELETE
   * @see https://binance-docs.github.io/apidocs/futures/en/#cancel-order-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  recvWindow?: number
   * }} payload
   * @returns {{
   *  "code":  string
   *  "msg": string
   * }} Response object 
   */
  cancelOpenOrders: payload =>
    checkParams('authenticated.futures.trade.cancelOpenOrders', payload, ['symbol']) &&
    privCall('/fapi/v1/allOpenOrders', payload, 'DELETE'),
  /**
   * Cancels multiple orders.
   * 
   * Either orderIdList or origClientOrderIdList must be sent
   * @weight 1
   * @http DELETE
   * @see https://binance-docs.github.io/apidocs/futures/en/#cancel-multiple-orders-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  orderIdList?: number[]
   *  origClientOrderIdList?: string[]
   *  recvWindow?: number
   * }} payload
   * @returns {[
   *  {
   *    "clientOrderId":  string
   *    "cumQty": string
   *    "cumQuote": string
   *    "executedQty": string
   *    "orderId": number
   *    "origQty": string
   *    "origType": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *    | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET'
   *    "price": string
   *    "reduceOnly": boolean
   *    "side": 'BUY' | 'SELL'
   *    "positionSide": 'BOTH' | 'LONG' | 'SHORT'
   *    "status": string
   *    "stopPrice": string
   *    "closePosition": boolean
   *    "symbol": string
   *    "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *    "type": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *    | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET'
   *    "activatePrice": string
   *    "priceRate": string
   *    "updateTime": number
   *    "workingType": 'MARK_PRICE' | 'CONTRACT_PRICE'
   *    "priceProtect": boolean
   *  }
   *  {
   *    "code": number
   *    "msg": string
   *  }
   * ]} Response array
   */
  cancelMultipleOrders: payload =>
    checkParams('authenticated.futures.trade.cancelOpenOrders', payload, ['symbol']) &&
    privCall('/fapi/v1/batchOrders', payload, 'DELETE'),
  /**
   * Cancel all open orders of the specified symbol at the end of the specified countdown.
   * - The endpoint should be called repeatedly as heartbeats so that the existing countdown
   * time can be canceled and replaced by a new one.
   * - Example usage: Call this endpoint at 30s intervals with an countdownTime of 120000 (120s).
   * If this endpoint is not called within 120 seconds, all your orders of the specified symbol will be automatically canceled.
   * If this endpoint is called with an countdownTime of 0, the countdown timer will be stopped.
   * - The system will check all countdowns **approximately every 10 milliseconds**, so please note that sufficient redundancy
   * should be considered when using this function. We do not recommend setting the countdown time to be too precise or too small.
   * @weight 10
   * @http POST
   * @see https://binance-docs.github.io/apidocs/futures/en/#auto-cancel-all-open-orders-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  countdownTime: number
   *  recvWindow?: number
   * }} payload
   * @returns {{
   *  "symbol":  string
   *  "countdownTime": string
   * }} Response object 
   */
  autoCancelOpenOrders: payload =>
    checkParams('authenticated.futures.trade.autoCancelOpenOrders', payload, [ 'symbol', 'countdownTime' ]) &&
    privCall('/fapi/v1/countdownCancelAll', payload, 'POST'),
  /**
   * Get current open order.
   * - Either `orderId` or `origClientOrderId` must be sent.
   * - If the queried order has been filled or cancelled, the error message
   * `"Order does not exist"` will be returned.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#query-current-open-order-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  orderId?: number
   *  origClientOrderId?: string
   *  recvWindow?: number
   * }} payload
   * @returns {{
   *  "avgPrice": string
   *  "clientOrderId":  string
   *  "cumQuote": string
   *  "executedQty": string
   *  "orderId": number
   *  "origQty": string
   *  "origType": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *  "price": string
   *  "reduceOnly": boolean
   *  "side": 'BUY' | 'SELL'
   *  "positionSide": 'BOTH' | 'LONG' | 'SHORT'
   *  "status": string
   *  "stopPrice": string
   *  "closePosition": boolean
   *  "symbol": string
   *  "time": number
   *  "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *  "type": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *  | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET'
   *  "activatePrice": string
   *  "priceRate": string
   *  "updateTime": number
   *  "workingType": 'MARK_PRICE' | 'CONTRACT_PRICE'
   *  "priceProtect": boolean
   * }} Object containing open order 
   */
  getOpenOrder: payload =>
    checkParams('authenticated.futures.trade.getOpenOrder', payload, ['symbol']) &&
    privCall('/fapi/v1/openOrder', payload),
  /**
   * Get all open orders on a symbol. **Careful** when accessing this with no symbol.
   * - If the `symbol` is not sent, orders for all symbols will be returned in an array.
   * @weight 1 for a single symbol; **40** when the symbol parameter is omitted
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#current-all-open-orders-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  recvWindow?: number
   * }} payload
   * @returns {[{
   *  "avgPrice": string
   *  "clientOrderId":  string
   *  "cumQuote": string
   *  "executedQty": string
   *  "orderId": number
   *  "origQty": string
   *  "origType": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *  "price": string
   *  "reduceOnly": boolean
   *  "side": 'BUY' | 'SELL'
   *  "positionSide": 'BOTH' | 'LONG' | 'SHORT'
   *  "status": string
   *  "stopPrice": string
   *  "closePosition": boolean
   *  "symbol": string
   *  "time": number
   *  "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *  "type": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *  | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET'
   *  "activatePrice": string
   *  "priceRate": string
   *  "updateTime": number
   *  "workingType": 'MARK_PRICE' | 'CONTRACT_PRICE'
   *  "priceProtect": boolean
   * }]} Array containing open orders 
   */
  openOrders: payload =>
    checkParams('authenticated.futures.trade.openOrders', payload, ['symbol']) &&
    privCall('/fapi/v1/openOrders', payload),
  /**
   * Get all account orders; active, canceled, or filled.
   * - These orders will not be found:
   *    - Order status is `CANCELED` or `EXPIRED`, **AND**
   *    - Order has NO filled trade, **AND**
   *    - Created time + 7 days < current time.
   * Notes:
   * - If `orderId` is set, it will get orders >= that `orderId`. Otherwise most recent orders are returned.
   * - The query time period must be less then 7 days (default as the recent 7 days).
   * @weight 5
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#all-orders-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  orderId?: number
   *  startTime?: number
   *  endTime?: number
   *  limit?: number
   *  recvWindow?: number
   * }} payload
   * @returns {[{
   *  "avgPrice": string
   *  "clientOrderId":  string
   *  "cumQuote": string
   *  "executedQty": string
   *  "orderId": number
   *  "origQty": string
   *  "origType": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *  "price": string
   *  "reduceOnly": boolean
   *  "side": 'BUY' | 'SELL'
   *  "positionSide": 'BOTH' | 'LONG' | 'SHORT'
   *  "status": string
   *  "stopPrice": string
   *  "closePosition": boolean
   *  "symbol": string
   *  "time": number
   *  "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *  "type": 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
   *  | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET'
   *  "activatePrice": string
   *  "priceRate": string
   *  "updateTime": number
   *  "workingType": 'MARK_PRICE' | 'CONTRACT_PRICE'
   *  "priceProtect": boolean
   * }]} Array containing orders 
   */
  allOrders: payload =>
    checkParams('authenticated.futures.trade.allOrders', payload, ['symbol']) &&
    privCall('/fapi/v1/allOrders', payload),
  /**
   * Get futures account balance V2.
   * @weight 5
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#futures-account-balance-v2-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow?: number }} payload
   * @returns {[{
   *  "accountAlias": string
   *  "asset":  string
   *  "balance": string
   *  "crossWalletBalance": string
   *  "crossUnPnl": string
   *  "availableBalance": string
   *  "maxWithdrawAmount": string
   *  "marginAvailable": boolean
   *  "updateTime": number
   * }]} Array containing account balance 
   */
  accountBalance: payload => privCall('/fapi/v2/balance', payload),
  /**
   * Get current account information.
   * @weight 5
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#account-information-v2-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow?: number }} payload
   * @returns {{
   *  "feeTier": number
   *  "canTrade":  boolean
   *  "canDeposit": boolean
   *  "canWithdraw": boolean
   *  "updateTime": number
   *  "totalInitialMargin": string
   *  "totalMaintMargin": string
   *  "totalWalletBalance": string
   *  "totalUnrealizedProfit": string
   *  "totalMarginBalance": string
   *  "totalPositionInitialMargin": string
   *  "totalOpenOrderInitialMargin": string
   *  "totalCrossWalletBalance": string
   *  "totalCrossUnPnl": string
   *  "availableBalance": string
   *  "maxWithdrawAmount": string
   *  "assets": [{
   *    "asset": string
   *    "walletBalance": string
   *    "unrealizedProfit": string
   *    "marginBalance": string
   *    "maintMargin": string
   *    "initialMargin": string
   *    "positionInitialMargin": string
   *    "openOrderInitialMargin": string
   *    "crossWalletBalance": string
   *    "crossUnPnl": string
   *    "availableBalance": string
   *    "maxWithdrawAmount": string
   *    "marginAvailable": boolean
   *    "updateTime": number
   *  }]
   *  "positions": [{
   *    "symbol": string
   *    "initialMargin": string
   *    "maintMargin": string
   *    "unrealizedProfit": string
   *    "positionInitialMargin": string
   *    "openOrderInitialMargin": string
   *    "leverage": string
   *    "isolated": boolean
   *    "entryPrice": string
   *    "maxNotional": string
   *    "positionSide": 'BOTH' | 'LONG' | 'SHORT'
   *    "positionAmt": string
   *    "updateTime": number
   *  }]
   * }} Object containing account information 
   */
  account: payload => privCall('/fapi/v2/account', payload),
  /**
   * Change user's initial leverage of specific symbol market.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/futures/en/#change-initial-leverage-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  leverage: number
   *  recvWindow?: number
   * }} payload
   * @returns {{
   *  "leverage": number
   *  "maxNotionalValue":  string
   *  "symbol": string
   * }} Response object 
   */
  changeLeverage: payload =>
    checkParams('authenticated.futures.trade.changeLeverage', payload, [ 'symbol', 'leverage' ]) &&
    privCall('/fapi/v1/leverage', payload, 'POST'),
  /**
   * Change user's margin type.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/futures/en/#modify-isolated-position-margin-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  marginType: 'ISOLATED' | 'CROSSED'
   *  recvWindow?: number
   * }} payload
   * @returns {{
   *  "code": number
   *  "msg":  string
   * }} Response object 
   */
  changeMarginType: payload =>
    checkParams('authenticated.futures.trade.changeMarginType', payload, [ 'symbol', 'marginType' ]) &&
    privCall('/fapi/v1/marginType', payload, 'POST'),
  /**
   * Modify isolated position margin.
   * - Only for isolated symbol.
   * - `type`: 	1: Add position margin，2: Reduce position margin
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/futures/en/#modify-isolated-position-margin-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  positionSide?: 'BOTH' | 'LONG' | 'SHORT'
   *  amount: string
   *  type: 1 | 2
   *  recvWindow?: number
   * }} payload
   * @returns {{
   *  "code": number
   *  "msg":  string
   * }} Response object 
   */
  modifyPositionMargin: payload =>
    checkParams('authenticated.futures.trade.modifyPositionMargin', payload, [ 'symbol', 'amount', 'type' ]) &&
    privCall('/fapi/v1/positionMargin', payload, 'POST'),
  /**
   * Get position margin change history.
   * - `type`: 	1: Add position margin，2: Reduce position margin
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#get-position-margin-change-history-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  type?: 1 | 2
   *  startTime?: number
   *  endTime?: number
   *  limit?: number
   *  recvWindow?: number
   * }} payload
   * @returns {[{
   *  "amount": string
   *  "asset": string
   *  "symbol": string
   *  "time": number
   *  "type": 1 | 2
   *  "positionSide": 'BOTH' | 'LONG' | 'SHORT'
   * }]} Array containing position margin change history
   */
  positionMarginChangeHistory: payload =>
    checkParams('authenticated.futures.trade.positionMarginChangeHistory', payload, ['symbol']) &&
    privCall('/fapi/v1/positionMargin/history', payload),
  /**
   * Get current position information.
   * Note: Please use with user data stream `ACCOUNT_UPDATE` to meet your timeliness and accuracy needs.
   * @weight 5
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#position-information-v2-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol?: string
   *  recvWindow?: number
   * }} payload
   * @returns {[{
   *  "entryPrice": string
   *  "marginType": string
   *  "isAutoAddMargin": string
   *  "isolatedMargin": string
   *  "leverage": string
   *  "liquidationPrice": string
   *  "markPrice": string
   *  "maxNotionalValue": string
   *  "positionAmt": string
   *  "symbol": string
   *  "unRealizedProfit": string
   *  "positionSide": 'BOTH' | 'LONG' | 'SHORT'
   *  "updateTime": number
   * }]} Array containing current position information
   */
  position: payload => privCall('/fapi/v2/positionRisk', payload),
  /**
   * Get trades for a specific account and symbol.
   * - If `startTime` and `endTime` are both not sent, then the last 7 days' data will be returned.
   * - The time between `startTime` and `endTime` cannot be longer than 7 days.
   * - The parameter `fromId` cannot be sent with `startTime` or `endTime`.
   * @weight 5
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#account-trade-list-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  startTime?: number
   *  endTime?: number
   *  fromId?: number
   *  limit?: number
   *  recvWindow?: number
   * }} payload
   * @returns {[{
   *  "buyer": boolean
   *  "commission": string
   *  "commissionAsset": string
   *  "id": number
   *  "maker": boolean
   *  "orderId": number
   *  "price": string
   *  "qty": string
   *  "quoteQty": string
   *  "realizedPnl": string
   *  "side": 'BUY' | 'SELL'
   *  "positionSide": 'BOTH' | 'LONG' | 'SHORT'
   *  "symbol": string
   *  "time": number
   * }]} Array containing trades
   */
  trades: payload =>
    checkParams('authenticated.futures.trade.trades', payload, ['symbol']) &&
    privCall('/fapi/v1/userTrades', payload),
  /**
   * Get income history.
   * - If `startTime` and `endTime` are both not sent, then the last 7 days' data will be returned.
   * - If `incomeType` is not sent, all kinds of flow will be returned.
   * - `trandId` is unique in the same `incomeType` for a user.
   * @weight 30
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#get-income-history-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  incomeType?: 'TRANSFER' | 'WELCOME_BONUS' | 'REALIZED_PNL'
   *  | 'FUNDING_FEE' | 'COMMISSION' | 'INSURANCE_CLEAR'
   *  startTime?: number
   *  endTime?: number
   *  fromId?: number
   *  limit?: number
   *  recvWindow?: number
   * }} payload
   * @returns {[{
   *  "symbol": string
   *  "incomeType": 'TRANSFER' | 'WELCOME_BONUS' | 'REALIZED_PNL'
   *  | 'FUNDING_FEE' | 'COMMISSION' | 'INSURANCE_CLEAR'
   *  "income": string
   *  "asset": string
   *  "info": string
   *  "time": number
   *  "tranId": string
   *  "tradeId": string
   * }]} Array containing income history
   */
  incomeHistory: payload => privCall('/fapi/v1/income', payload),
  /**
   * Notional and leverage brackets.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#notional-and-leverage-brackets-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol?: string
   *  recvWindow?: number
   * }} payload
   * @returns {[{
   *  "symbol": string
   *  "brackets": [{
   *    "bracket": number
   *    "initialLeverage": number
   *    "notionalCap": number
   *    "notionalFloor": number
   *    "maintMarginRatio": number
   *    "cum": number // NOTE: https://www.youtube.com/watch?v=RmOz4FrCIQU
   *  }]
   * }] | {
   *  "symbol": string
   *  "brackets": [{
   *    "bracket": number
   *    "initialLeverage": number
   *    "notionalCap": number
   *    "notionalFloor": number
   *    "maintMarginRatio": number
   *    "cum": number // NOTE: https://www.youtube.com/watch?v=RmOz4FrCIQU
   *  }]
   * }} Array or object containing notional and leverage brackets
   */
  leverageBracket: payload => privCall('/fapi/v1/leverageBracket', payload),
  /**
   * Position ADL quantile estimation.
   * - Values update every 30s.
   * - Values 0, 1, 2, 3, 4 shows the queue position and possibility of ADL from low to high.
   * - For positions of the symbol are in One-way Mode or isolated margined in Hedge Mode, `LONG`,
   * `SHORT`, and `BOTH` will be returned to show the positions' ADL quantiles of different position sides.
   * - If the positions of the symbol are crossed margined in Hedge Mode:
   *    - `HEDGE` as a sign will be returned instead of `BOTH`.
   *    - A same value caculated on unrealized PNLs on long and short sides' positions will be shown
   *    for `LONG` and `SHORT` when there are positions in both of long and short sides.
   * @weight 5
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#position-adl-quantile-estimation-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol?: string
   *  recvWindow?: number
   * }} payload
   * @returns {[{
   *  "symbol": string
   *  "adlQuantile": {
   *    "LONG": number
   *    "SHORT": number
   *    "HEDGE"?: number
   *    "BOTH"?: number
   *  }
   * }]} Array containing position ADL quantile estimation
   */
  positionADLQuantileEstimation: payload => privCall('/fapi/v1/adlQuantile', payload),
  /**
   * Get user's force orders.
   * - If `autoCloseType` is not sent, orders with both of the types will be returned.
   * - If `startTime` is not sent, data within 7 days before `endTime` can be queried.
   * @weight 20 with symbol, 50 without symbol
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#user-39-s-force-orders-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol?: string
   *  autoCloseType?: 'LIQUIDATION' | 'ADL'
   *  startTime?: number
   *  endTime?: number
   *  limit?: number
   *  recvWindow?: number
   * }} payload
   * @returns {[{
   *  "orderId": number
   *  "symbol": string
   *  "status": string
   *  "clientOrderId": string
   *  "price": string
   *  "avgPrice": string
   *  "origQty": string
   *  "executedQty": string
   *  "cumQuote": string
   *  "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *  "type": 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT'
   *  | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT' | 'LIMIT_MAKER'
   *  "reduceOnly": boolean
   *  "closePosition": boolean
   *  "side": 'BUY' | 'SELL'
   *  "positionSide": 'BOTH' | 'LONG' | 'SHORT'
   *  "stopPrice": string
   *  "workingType": 'MARK_PRICE' | 'CONTRACT_PRICE'
   *  "origType": 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT'
   *  | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT' | 'LIMIT_MAKER'
   *  "time": number
   *  "updateTime": number
   * }]} Array containing user's force orders
   */
  getForceOrders: payload => privCall('/fapi/v1/forceOrders', payload),
  /**
   * For more information on this, please refer to the
   * [Futures API Trading Quantitative Rules](https://www.binance.com/en/support/faq/4f462ebe6ff445d4a170be7d9e897272).
   * @weight 1 for a single symbol, 10 when the symbol parameter is omitted
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#user-api-trading-quantitative-rules-indicators-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol?: string
   *  recvWindow?: number
   * }} payload
   * @returns {{
   *  "indicators": {
   *    "isLocked": boolean
   *    "plannedRecoverTime": number
   *    "indicator": string
   *    "value": number
   *    "triggerValue": number
   *  }[]
   *  [ symbol: string ]: {
   *    "isLocked": boolean
   *    "plannedRecoverTime": number
   *    "indicator": string
   *    "value": number
   *    "triggerValue": number
   *  }[]
   *  "updateTime": number
   * }} Response object
   */
  APITradingQuantitativeRulesIndicators: payload => privCall('/fapi/v1/apiTradingStatus', payload),
  /**
   * Get user commission rate.
   * @weight 20
   * @http GET
   * @see https://binance-docs.github.io/apidocs/futures/en/#user-commission-rate-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  recvWindow?: number
   * }} payload
   * @returns {{
   *  "symbol": string
   *  "makerCommissionRate": string
   *  "takerCommissionRate": string
   * }} Object containing commission rate
   */
  commissionRate: payload =>
    checkParams('authenticated.futures.trade.commissionRate', payload, ['symbol']) &&
    privCall('/fapi/v1/commissionRate', payload),
})

/**
 * 🌊 Futures User Data Streams
 * 
 * @see https://binance-docs.github.io/apidocs/futures/en/#user-data-streams
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedFuturesUserDataStreams = (privCall) => ({
  /**
   * Start a new user data stream. The stream will close after 60 minutes unless a
   * keepalive is sent. If the account has an active `listenKey`, that `listenKey` will be 
   * returned and its validity will be extended for 60 minutes.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/futures/en/#start-user-data-stream-user_stream
   * @requires APIKEY
   * @requires APISECRET
   * @returns {{ "listenKey": string }} Object containing listenKey
   */
  create: () => privCall('/fapi/v1/listenKey', null, 'POST', true),
  /**
   * Keepalive a user data stream to prevent a time out. User data streams will close
   * after 60 minutes. It's recommended to send a ping about every 30 minutes.
   * @weight 1
   * @http PUT
   * @see https://binance-docs.github.io/apidocs/futures/en/#keepalive-user-data-stream-user_stream
   * @requires APIKEY
   * @requires APISECRET
   * @returns {{}} Empty object
   */
  ping: () => privCall('/fapi/v1/listenKey', null, 'PUT', false, true),
  /**
   * Close out a user data stream.
   * @weight 1
   * @http DELETE
   * @see https://binance-docs.github.io/apidocs/futures/en/#close-user-data-stream-user_stream
   * @requires APIKEY
   * @requires APISECRET
   * @returns {{}} Empty object
   */
  close: () => privCall('/fapi/v1/listenKey', null, 'DELETE', false, true)
})

/**
 * 🔐 Authenticated Futures REST Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/futures/en/
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 * @param { (path: any, data: any, method?: string) => Promise<any> } kCall
 */
const authenticatedFutures = (privCall, kCall) => ({
  marketData: authenticatedFuturesMarketData(kCall),
  trade: authenticatedFuturesTrade(privCall),
  userDataStreams: authenticatedFuturesUserDataStreams(privCall),
})

export default authenticatedFutures
