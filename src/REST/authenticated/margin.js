// Imports:
import {
  checkParams,
  order,
  orderOCO
} from '../'


// Exports:
/**
 * 🌊 Margin User Data Streams
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#listen-key-margin
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedMarginUserDataStreams = (privCall) => ({
  /**
   * Start a new user data stream. The stream will close after 60 minutes unless a
   * keepalive is sent. If the account has an active `listenKey`, that `listenKey` will be 
   * returned and its validity will be extended for 60 minutes.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#listen-key-margin
   * @requires APIKEY
   * @requires APISECRET
   * @returns { Promise<{ "listenKey": string }> } Object containing listenKey
   */
  create: () => privCall('/sapi/v1/userDataStream', null, 'POST', true),
  /**
   * Keepalive a user data stream to prevent a time out. User data streams will close
   * after 60 minutes. It's recommended to send a ping about every 30 minutes.
   * @weight 1
   * @http PUT
   * @see https://binance-docs.github.io/apidocs/spot/en/#listen-key-margin
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ listenKey: string }} payload
   * @returns { Promise<{}> } Empty object
   */
  ping: payload => privCall('/sapi/v1/userDataStream', payload, 'PUT', false, true),
  /**
   * Close out a user data stream.
   * @weight 1
   * @http DELETE
   * @see https://binance-docs.github.io/apidocs/spot/en/#listen-key-margin
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ listenKey: string }} payload
   * @returns { Promise<{}> } Empty object
   */
  close: payload => privCall('/sapi/v1/userDataStream', payload, 'DELETE', false, true)
})

/**
 * 🤞 Margin Cross Endpoints
 * 
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 * @param { (path: any, data: any, method?: string) => Promise<any> } kCall
 */
export const authenticatedMarginCross = (privCall, kCall) => ({
  /**
   * Execute transfer between spot account and cross margin account.
   * @weight 600
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#cross-margin-account-transfer-margin
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset: string
   *  amount: string
   *  type: 1 | 2
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<number> } tranId 
   */
  transfer: payload =>
    checkParams('authenticated.margin.cross.transfer', payload, [ 'asset', 'amount', 'type' ]) &&
    privCall('/sapi/v1/margin/transfer', payload, 'POST').then(r => r.tranId),
  /**
   * Query cross margin pair.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-cross-margin-pair-market_data
   * @requires APIKEY
   * @param {{
   *  symbol: string
   * }} payload
   * @returns { Promise<{
   *  "id": number
   *  "symbol": string
   *  "base": string
   *  "quote": string
   *  "isMarginTrade": boolean
   *  "isBuyAllowed": boolean
   *  "isSellAllowed": boolean
   * }>} Object containing cross margin pair
   */
  pair: payload =>
    checkParams('authenticated.margin.cross.pair', payload, ['symbol']) &&
    kCall('/sapi/v1/margin/pair', payload),
  /**
   * Get all cross margin pairs.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-all-cross-margin-pairs-market_data
   * @requires APIKEY
   * @returns { Promise<{
   *  [ symbol: string ]: {
   *    "base": string
   *    "id": number
   *    "isBuyAllowed": boolean
   *    "isMarginTrade": boolean
   *    "isSellAllowed": boolean
   *    "quote": string
   *    "symbol": string
   *  }
   * }>} Array containing cross margin pairs
   */
  allPairs: () => kCall('/sapi/v1/margin/allPairs').then(r =>
    (Array.isArray(r) ? r : [r]).reduce((out, cur) => ((out[ cur.symbol ] = { ...cur }), out), {})
  ),
  /**
   * Get cross margin transfer history.
   * - Response in descending order.
   * - Returns data for last 7 days by default.
   * - Set `archived` to `true` to query data from 6 months ago.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-cross-margin-transfer-history-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset?: string
   *  type?: 'ROLL_IN' | 'ROLL_OUT'
   *  startTime?: number
   *  endTime?: number
   *  current?: number
   *  size?: number
   *  archived?: boolean
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<{
   *  "rows": [{
   *    "amount": string
   *    "asset": string
   *    "status": string
   *    "timestamp": number
   *    "txId": number
   *    "type": 'ROLL_IN' | 'ROLL_OUT'
   *  }]
   *  "total": number
   * }>} Object containing cross transfer history
   */
  transferHistory: payload => privCall('/sapi/v1/margin/transfer', payload),
  /**
   * Get cross margin account details.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-cross-margin-account-details-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<{
   *  "borrowEnabled": boolean
   *  "marginLevel": string
   *  "totalAssetOfBtc": string
   *  "totalLiabilityOfBtc": string
   *  "totalNetAssetOfBtc": string
   *  "tradeEnabled": boolean
   *  "transferEnabled": boolean
   *  "userAssets": [{
   *    "asset": string
   *    "borrowed": string
   *    "free": string
   *    "interest": string
   *    "locked": string
   *    "netAsset": string
   *  }]
   * }>} Object containing cross margin account details
   */
  account: payload => privCall('/sapi/v1/margin/account', payload)
})

/**
 * 🌊⛰️ Margin Isolated User Data Streams
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#listen-key-isolated-margin
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedMarginIsolatedUserDataStreams = (privCall) => ({
  /**
   * Start a new user data stream. The stream will close after 60 minutes unless a
   * keepalive is sent. If the account has an active `listenKey`, that `listenKey` will be 
   * returned and its validity will be extended for 60 minutes.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#listen-key-isolated-margin
   * @requires APIKEY
   * @requires APISECRET
   * @returns { Promise<{ "listenKey": string }> } Object containing listenKey
   */
  create: () => privCall('/sapi/v1/userDataStream/isolated', null, 'POST', true),
  /**
   * Keepalive a user data stream to prevent a time out. User data streams will close
   * after 60 minutes. It's recommended to send a ping about every 30 minutes.
   * @weight 1
   * @http PUT
   * @see https://binance-docs.github.io/apidocs/spot/en/#listen-key-isolated-margin
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ listenKey: string }} payload
   * @returns { Promise<{}> } Empty object
   */
  ping: payload => privCall('/sapi/v1/userDataStream/isolated', payload, 'PUT', false, true),
  /**
   * Close out a user data stream.
   * @weight 1
   * @http DELETE
   * @see https://binance-docs.github.io/apidocs/spot/en/#listen-key-isolated-margin
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ listenKey: string }} payload
   * @returns { Promise<{}> } Empty object
   */
  close: payload => privCall('/sapi/v1/userDataStream/isolated', payload, 'DELETE', false, true),
})

/**
 * ⛰️ Margin Isolated Endpoints
 * 
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedMarginIsolated = (privCall) => ({
  /**
   * Execute transfer between spot account and isolated margin account.
   * @weight 600
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#isolated-margin-account-transfer-margin
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset: string
   *  symbol: string
   *  transFrom: 'SPOT' | 'ISOLATED_MARGIN'
   *  transTo: 'SPOT' | 'ISOLATED_MARGIN'
   *  amount: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<number> } tranId 
   */
  transfer: payload =>
    checkParams('authenticated.margin.isolated.transfer', payload, [ 'asset', 'symbol', 'amount', 'type' ]) &&
    privCall('/sapi/v1/margin/isolated/transfer', payload, 'POST').then(r => r.tranId),
  /**
   * Get isolated margin transfer history.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-isolated-margin-transfer-history-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset?: string
   *  symbol: string
   *  transFrom?: 'SPOT' | 'ISOLATED_MARGIN'
   *  transTo?: 'SPOT' | 'ISOLATED_MARGIN'
   *  startTime?: number
   *  endTime?: number
   *  current?: number
   *  size?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "rows": [{
   *    "amount": string
   *    "asset": string
   *    "status": string
   *    "timestamp": number
   *    "txId": number
   *    "transFrom": 'SPOT' | 'ISOLATED_MARGIN'
   *    "transTo": 'SPOT' | 'ISOLATED_MARGIN'
   *  }]
   *  "total": number
   * }>} Object containing isolated transfer history
   */
  transferHistory: payload =>
    checkParams('authenticated.margin.isolated.transferHistory', payload, ['symbol']) &&
    privCall('/sapi/v1/margin/isolated/transfer', payload),
  /**
   * Get isolated margin account details.
   * - Max 5 `symbols` can be sent: separated by ','. e.g. `'BTCUSDT,BNBUSDT,ADAUSDT'`.
   * - If `symbols` is not sent, all isolated assets will be returned.
   * - If `symbols` is sent, only the isolated assets of the sent `symbols` will be returned.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-isolated-margin-account-info-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbols?: string
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<{
   *  "assets": [{
   *    "baseAsset": [{
   *      "asset": string
   *      "borrowEnabled": string
   *      "borrowed": string
   *      "free": string
   *      "interest": string
   *      "locked": string
   *      "netAsset": string
   *      "netAssetOfBtc": string
   *      "repayEnabled": boolean
   *      "totalAsset": string
   *    }]
   *    "quoteAsset": [{
   *      "asset": string
   *      "borrowEnabled": string
   *      "borrowed": string
   *      "free": string
   *      "interest": string
   *      "locked": string
   *      "netAsset": string
   *      "netAssetOfBtc": string
   *      "repayEnabled": boolean
   *      "totalAsset": string
   *    }]
   *    "symbol": string
   *    "isolatedCreated": boolean
   *    "enabled": boolean
   *    "marginLevel": string
   *    "marginLevelStatus": 'EXCESSIVE' | 'NORMAL' | 'MARGIN_CALL'
   *    | 'PRE_LIQUIDATION' | 'FORCE_LIQUIDATION'
   *    "marginRatio": string
   *    "indexPrice": string
   *    "liquidatePrice": string
   *    "liquidateRate": string
   *    "tradeEnabled": boolean
   *  }]
   *  "totalAssetOfBtc"?: string
   *  "totalLiabilityOfBtc"?: string
   *  "totalNetAssetOfBtc"?: string
   * }>} Object containing cross margin account details
   */
  account: payload => privCall('/sapi/v1/margin/isolated/account', payload),
  /**
   * Disable isolated margin account for a specific symbol. Each trading pair can only be deactivated once every 24 hours.
   * @weight 300
   * @http DELETE
   * @see https://binance-docs.github.io/apidocs/spot/en/#disable-isolated-margin-account-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "success": boolean
   *  "symbol": string
   * }>} Response object
   */
  disableAccount: payload =>
    checkParams('authenticated.margin.isolated.disableAccount', payload, ['symbol']) &&
    privCall('/sapi/v1/margin/isolated/account', payload, 'DELETE'),
  /**
   * Enable isolated margin account for a specific symbol (Only supports activation of previously disabled accounts).
   * @weight 300
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#enable-isolated-margin-account-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "success": boolean
   *  "symbol": string
   * }>} Response object
   */
  enableAccount: payload => privCall('/sapi/v1/margin/isolated/account', payload, 'POST'),
  /**
   * Query enabled isolated margin account limit.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-enabled-isolated-margin-account-limit-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<{
   *  "enabledAccount": number
   *  "maxAccount": number
   * }>} Response object
   */
  enabledAccountLimit: payload => privCall('/sapi/v1/margin/isolated/accountLimit', payload),
  /**
   * Query isolated margin symbol.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-isolated-margin-symbol-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "symbol": string
   *  "base": string
   *  "quote": string
   *  "isMarginTrade": boolean
   *  "isBuyAllowed": boolean
   *  "isSellAllowed": boolean
   * }>} Object containing symbol details
   */
  symbol: payload =>
    checkParams('authenticated.margin.isolated.symbol', payload, ['symbol']) &&
    privCall('/sapi/v1/margin/isolated/pair', payload),
  /**
   * Get all isolated margin symbols.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-all-isolated-margin-symbol-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<{
   *  [ symbol: string ]: {
   *    "base": string
   *    "isMarginTrade": boolean
   *    "isBuyAllowed": boolean
   *    "isSellAllowed": boolean
   *    "quote": string
   *    "symbol": string
   *  }
   * }>} Array containing all symbol details
   */
  allSymbols: payload => privCall('/sapi/v1/margin/isolated/allPairs', payload).then(r =>
    (Array.isArray(r) ? r : [r]).reduce((out, cur) => ((out[ cur.symbol ] = { ...cur }), out), {})
  ),
  userDataStreams: authenticatedMarginIsolatedUserDataStreams(privCall)
})

/**
 * 👀 Margin OCO Endpoints
 * 
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedMarginOCO = (privCall) => ({
  /**
   * Send in a new OCO for a margin account.
   * 
   * Other Info:
   * - Price Restrictions:
   *    - `SELL`: Limit Price > Last Price > Stop Price
   *    - `BUY`: Limit Price < Last Price < Stop Price
   * - Quantity Restrictions:
   *    - Both legs must have the same quantity.
   *    - `ICEBERG` quantities however do not have to be the same
   * - Order Rate Limit:
   *    - `OCO` counts as 2 orders against the order rate limit
   * @weight 6
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#margin-account-new-oco-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  isIsolated?: 'TRUE' | 'FALSE'
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
   *  newOrderRespType?: 'JSON' | 'ACK' | 'RESULT' | 'FULL'
   *  sideEffectType?: 'NO_SIDE_EFFECT' | 'MARGIN_BUY' | 'AUTO_REPAY'
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "orderListId": number
   *  "contingencyType": string
   *  "listStatusType": string
   *  "listOrderStatus": string
   *  "listClientOrderId": string
   *  "transactTime": number
   *  "symbol": string
   *  "marginBuyBorrowAmount": string
   *  "marginBuyBorrowAsset": string
   *  "isIsolated": boolean
   *  "orders": [{
   *    "symbol": string
   *    "orderId": number
   *    "clientOrderId": string
   *  }]
   *  "orderReports": [{
   *    "symbol": string
   *    "orderId": number
   *    "orderListId": number
   *    "clientOrderId": string
   *    "transactTime": number
   *    "price": string
   *    "origQty": string
   *    "executedQty": string
   *    "cummulativeQuoteQty": string
   *    "status": string
   *    "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *    "type": string
   *    "side": 'BUY' | 'SELL'
   *    "stopPrice": string
   *  }]
   * }>} Response object
   */
  order: payload => orderOCO(privCall, payload, '/sapi/v1/margin/order/oco'),
  /**
   * Cancel an entire Order List for a margin account.
   * 
   * Additional notes:
   * - Either orderListId or listClientOrderId must be provided.
   * - Canceling an individual leg will cancel the entire OCO.
   * @weight 1
   * @http DELETE
   * @see https://binance-docs.github.io/apidocs/spot/en/#margin-account-cancel-oco-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  isIsolated?: 'TRUE' | 'FALSE'
   *  orderListId?: number
   *  listClientOrderId: string
   *  newClientOrderId: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "orderListId": number
   *  "contingencyType": string
   *  "listStatusType": string
   *  "listOrderStatus": string
   *  "listClientOrderId": string
   *  "transactTime": number
   *  "symbol": string
   *  "isIsolated": boolean
   *  "orders": [{
   *    "symbol": string
   *    "orderId": number
   *    "clientOrderId": string
   *  }]
   *  "orderReports": [{
   *    "symbol": string
   *    "orderId": number
   *    "orderListId": number
   *    "clientOrderId": string
   *    "transactTime": number
   *    "price": string
   *    "origQty": string
   *    "executedQty": string
   *    "cummulativeQuoteQty": string
   *    "status": string
   *    "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *    "type": string
   *    "side": 'BUY' | 'SELL'
   *    "stopPrice": string
   *  }]
   * }>} Response object
   */
  cancelOrder: payload =>
    checkParams('authenticated.margin.OCO.cancelOrder', payload, ['symbol']) &&
    privCall('/sapi/v1/margin/orderList', payload, 'DELETE'),
  /**
   * Retrieves a specific OCO based on provided optional parameters.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-margin-account-39-s-oco-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  isIsolated?: 'TRUE' | 'FALSE'
   *  symbol?: string
   *  orderListId?: number
   *  origClientOrderId: string
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<{
   *  "orderListId": number
   *  "contingencyType": string
   *  "listStatusType": string
   *  "listOrderStatus": string
   *  "listClientOrderId": string
   *  "transactTime": number
   *  "symbol": string
   *  "isIsolated": boolean
   *  "orders": [{
   *    "symbol": string
   *    "orderId": number
   *    "clientOrderId": string
   *  }]
   * }>} Object containing OCO order
   */
  getOrder: payload => privCall('/sapi/v1/margin/orderList', payload),
  /**
   * Retrieves all OCO for a specific margin account based on provided optional parameters.
   * @weight 200
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-margin-account-39-s-all-oco-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  isIsolated?: 'TRUE' | 'FALSE'
   *  symbol?: string
   *  fromId?: number
   *  startTime?: number
   *  endTime?: number
   *  limit?: number
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<[{
   *  "orderListId": number
   *  "contingencyType": string
   *  "listStatusType": string
   *  "listOrderStatus": string
   *  "listClientOrderId": string
   *  "transactTime": number
   *  "symbol": string
   *  "isIsolated": boolean
   *  "orders": [{
   *    "symbol": string
   *    "orderId": number
   *    "clientOrderId": string
   *  }]
   * }]>} Array containing OCO order(s)
   */
  allOrders: payload => privCall('/sapi/v1/margin/allOrderList', payload),
  /**
   * Get margin account's open OCO orders(s).
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-margin-account-39-s-open-oco-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  isIsolated?: 'TRUE' | 'FALSE'
   *  symbol?: string
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<[{
   *  "orderListId": number
   *  "contingencyType": string
   *  "listStatusType": string
   *  "listOrderStatus": string
   *  "listClientOrderId": string
   *  "transactTime": number
   *  "symbol": string
   *  "isIsolated": boolean
   *  "orders": [{
   *    "symbol": string
   *    "orderId": number
   *    "clientOrderId": string
   *  }]
   * }]>} Array containing open OCO order(s)
   */
  openOrders: payload => privCall('/sapi/v1/margin/openOrderList', payload),
})

/**
 * 🔐 Authenticated Margin REST Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#margin-account-trade
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 * @param { (path: any, data: any, method?: string) => Promise<any> } kCall
 */
const authenticatedMargin = (privCall, kCall) => ({
  /**
   * Apply for a loan.
   * - If `isIsolated = 'TRUE'`, `symbol` must be sent.
   * - `isIsolated = 'FALSE'` for crossed margin loan.
   * @weight 3000
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#margin-account-borrow-margin
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset: string
   *  isIsolated?: 'TRUE' | 'FALSE'
   *  symbol?: string
   *  amount: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<number> } tranId 
   */
  loan: payload =>
    checkParams('authenticated.margin.loan', payload, [ 'asset', 'amount' ]) &&
    privCall('/sapi/v1/margin/loan', payload, 'POST').then(r => r.tranId),
  /**
   * Repay loan for margin account.
   * - If `isIsolated = 'TRUE'`, `symbol` must be sent.
   * - `isIsolated = 'FALSE'` for crossed margin repay.
   * @weight 3000
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#margin-account-repay-margin
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset: string
   *  isIsolated?: 'TRUE' | 'FALSE'
   *  symbol?: string
   *  amount: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<number> } tranId 
   */
  repay: payload =>
    checkParams('authenticated.margin.repay', payload, [ 'asset', 'amount' ]) &&
    privCall('/sapi/v1/margin/repay', payload, 'POST').then(r => r.tranId),
  /**
   * Query margin asset.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-margin-asset-market_data
   * @requires APIKEY
   * @param {{
   *  asset: string
   * }} payload
   * @returns { Promise<{
   *  "assetFullName": string
   *  "assetName": string
   *  "isBorrowable": boolean
   *  "isMortgageable": boolean
   *  "userMinBorrow": string
   *  "userMinRepay": string
   * }>} Object containing margin asset
   */
  asset: payload =>
    checkParams('authenticated.margin.asset', payload, ['asset']) &&
    kCall('/sapi/v1/margin/asset', payload),
  /**
   * Get all margin assets.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-all-margin-assets-market_data
   * @requires APIKEY
   * @returns { Promise<[{
   *  "assetFullName": string
   *  "assetName": string
   *  "isBorrowable": boolean
   *  "isMortgageable": boolean
   *  "userMinBorrow": number
   *  "userMinRepay": number
   * }]>} Array containing margin assets
   */
  allAssets: () => kCall('/sapi/v1/margin/allAssets'),
  /**
   * Query margin price index.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-margin-priceindex-market_data
   * @requires APIKEY
   * @param {{
   *  symbol: string
   * }} payload
   * @returns { Promise<{
   *  "calcTime": number
   *  "price": string
   *  "symbol": string
   * }>} Object containing price index
   */
  priceIndex: payload =>
    checkParams('authenticated.margin.priceIndex', payload, ['symbol']) &&
    kCall('/sapi/v1/margin/priceIndex', payload),
  /**
   * Post a new order for margin account.
   * @weight 6
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#margin-account-new-order-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  isIsolated?: 'TRUE' | 'FALSE'
   *  side: 'BUY' | 'SELL'
   *  type: 'LIMIT' | 'MARKET'
   *  quantity?: string
   *  quoteOrderQty?: string
   *  price?: string
   *  stopPrice?: string
   *  newClientOrderId?: string
   *  icebergQty?: string
   *  newOrderRespType?: 'JSON' | 'ACK' | 'RESULT' | 'FULL'
   *  sideEffectType?: 'NO_SIDE_EFFECT' | 'MARGIN_BUY' | 'AUTO_REPAY'
   *  timeInForce?: 'FOK' | 'GTC' | 'IOC'
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "symbol": string
   *  "orderId": number
   *  "clientOrderId": string
   *  "isIsolated": boolean
   *  "transactTime": number
   * }> | Promise<{
   *  "symbol": string
   *  "orderId": number
   *  "clientOrderId": string
   *  "transactTime": number
   *  "price": string
   *  "origQty": string
   *  "executedQty": string
   *  "cummulativeQuoteQty": string
   *  "status": 'CANCELED' | 'EXPIRED' | 'FILLED' | 'NEW'
   *  | 'PARTIALLY_FILLED' | 'PENDING_CANCEL' | 'REJECTED'
   *  "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *  "type": 'LIMIT' | 'MARKET'
   *  "isIsolated": boolean
   *  "side": 'BUY' | 'SELL'
   * }> | Promise<{
   *  "symbol": string
   *  "orderId": number
   *  "clientOrderId": string
   *  "transactTime": number
   *  "price": string
   *  "origQty": string
   *  "executedQty": string
   *  "cummulativeQuoteQty": string
   *  "status": 'CANCELED' | 'EXPIRED' | 'FILLED' | 'NEW'
   *  | 'PARTIALLY_FILLED' | 'PENDING_CANCEL' | 'REJECTED'
   *  "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *  "type": 'LIMIT' | 'MARKET'
   *  "side": 'BUY' | 'SELL'
   *  "marginBuyBorrowAmount": number
   *  "marginBuyBorrowAsset": string
   *  "isIsolated": boolean
   *  "fills": [{
   *    "price": string
   *    "qty": string
   *    "commission": string
   *    "commissionAsset": string
   *  }]
   * }>} Response object
   */
  order: payload => order(privCall, payload, '/sapi/v1/margin/order'),
  /**
   * Cancel an active order for margin account.
   * - Either `orderId` or `origClientOrderId` must be sent.
   * @weight 10
   * @http DELETE
   * @see https://binance-docs.github.io/apidocs/spot/en/#margin-account-cancel-order-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  isIsolated?: 'TRUE' | 'FALSE'
   *  orderId?: number
   *  origClientOrderId: string
   *  newClientOrderId: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "symbol": string
   *  "isIsolated": boolean
   *  "orderId": number
   *  "origClientOrderId": string
   *  "clientOrderId": string
   *  "price": string
   *  "origQty": string
   *  "executedQty": string
   *  "cummulativeQuoteQty": string
   *  "status": 'CANCELED' | 'EXPIRED' | 'FILLED' | 'NEW'
   *  | 'PARTIALLY_FILLED' | 'PENDING_CANCEL' | 'REJECTED'
   *  "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *  "type": 'LIMIT' | 'MARKET'
   *  "side": 'BUY' | 'SELL'
   * }>} Response object
   */
  cancelOrder: payload =>
    checkParams('authenticated.margin.cancelOrder', payload, ['symbol']) &&
    privCall('/sapi/v1/margin/order', payload, 'DELETE'),
  /**
   * Cancels all active orders on a symbol for margin account.
   * 
   * This includes OCO orders.
   * @weight 1
   * @http DELETE
   * @see https://binance-docs.github.io/apidocs/spot/en/#margin-account-cancel-all-open-orders-on-a-symbol-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  isIsolated?: 'TRUE' | 'FALSE'
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<[{
   *  "symbol": string
   *  "isIsolated": boolean
   *  "origClientOrderId": string
   *  "orderId": number
   *  "orderListId": number
   *  "clientOrderId": string
   *  "price": string
   *  "origQty": string
   *  "executedQty": string
   *  "cummulativeQuoteQty": string
   *  "status": 'CANCELED' | 'EXPIRED' | 'FILLED' | 'NEW'
   *  | 'PARTIALLY_FILLED' | 'PENDING_CANCEL' | 'REJECTED'
   *  "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *  "type": 'LIMIT' | 'MARKET'
   *  "side": 'BUY' | 'SELL'
   * }]>} Array containing response objects
   */
  cancelAllOpenOrders: payload =>
    checkParams('authenticated.margin.cancelOrder', payload, ['symbol']) &&
    privCall('/sapi/v1/margin/openOrders', payload, 'DELETE'),
  /**
   * Get loan record.
   * - `txId` or `startTime` must be sent. `txId` takes precedence.
   * - Response is in descending order.
   * - If `isolatedSymbol` is not sent, crossed margin data will be returned.
   * - Set `archived` to `true` to query data from 6 months ago.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-loan-record-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset: string
   *  isolatedSymbol?: string
   *  txId?: number
   *  startTime?: number
   *  endTime?: number
   *  current?: number
   *  size?: number
   *  archived?: boolean
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "rows": [{
   *    "isolatedSymbol": string
   *    "txId": number
   *    "asset": string
   *    "principal": string
   *    "timestamp": number
   *    "status": string
   *  }]
   *  "total": number
   * }>} Object containing loan record
   */
  loanRecord: payload =>
    checkParams('authenticated.margin.loanRecord', payload, ['asset']) &&
    privCall('/sapi/v1/margin/loan', payload),
  /**
   * Get repay record.
   * - `txId` or `startTime` must be sent. `txId` takes precedence.
   * - Response is in descending order.
   * - If `isolatedSymbol` is not sent, crossed margin data will be returned.
   * - Set `archived` to `true` to query data from 6 months ago.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-repay-record-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset: string
   *  isolatedSymbol?: string
   *  txId?: number
   *  startTime?: number
   *  endTime?: number
   *  current?: number
   *  size?: number
   *  archived?: boolean
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "rows": [{
   *    "isolatedSymbol": string
   *    "amount": string
   *    "asset": string
   *    "interest": string
   *    "principal": string
   *    "status": string
   *    "timestamp": number
   *    "txId": number
   *  }]
   *  "total": number
   * }>} Object containing repay record
   */
  repayRecord: payload =>
    checkParams('authenticated.margin.repayRecord', payload, ['asset']) &&
    privCall('/sapi/v1/margin/repay', payload),
  /**
   * Get interest history.
   * - Response is in descending order.
   * - If `isolatedSymbol` is not sent, crossed margin data will be returned.
   * - Set `archived` to `true` to query data from 6 months ago.
   * - `type` in response has 4 enums:
   *    - `PERIODIC` interest charged per hour.
   *    - `ON_BORROW` first interest charged on borrow.
   *    - `PERIODIC_CONVERTED` interest charged per hour converted into BNB.
   *    - `ON_BORROW_CONVERTED` first interest charged on borrow converted into BNB.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-interest-history-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset?: string
   *  isolatedSymbol?: string
   *  startTime?: number
   *  endTime?: number
   *  current?: number
   *  size?: number
   *  archived?: boolean
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<{
   *  "rows": [{
   *    "isolatedSymbol": string
   *    "asset": string
   *    "interest": string
   *    "interestAccuredTime": number
   *    "interestRate": string
   *    "principal": string
   *    "type": 'PERIODIC' | 'ON_BORROW' | 'PERIODIC_CONVERTED' | 'ON_BORROW_CONVERTED'
   *  }]
   *  "total": number
   * }>} Object containing interest history
   */
  interestHistory: payload => privCall('/sapi/v1/margin/interestHistory', payload),
  /**
   * Get force liquidation record.
   * - Response is in descending order.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-force-liquidation-record-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset?: string
   *  endTime?: number
   *  isolatedSymbol?: string
   *  current?: number
   *  size?: number
   *  archived?: boolean
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<{
   *  "rows": [{
   *    "avgPrice": string
   *    "executedQty": string
   *    "orderId": number
   *    "price": string
   *    "qty": string
   *    "side": 'BUY' | 'SELL'
   *    "symbol": string
   *    "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *    "isIsolated": boolean
   *    "updatedTime": number
   *  }]
   *  "total": number
   * }>} Object containing force liquidation record
   */
  forceLiquidationRecord: payload => privCall('/sapi/v1/margin/forceLiquidationRec', payload),
  /**
   * Get margin account's order.
   * - Either `orderId` or `origClientOrderId` must be sent.
   * - For some historical orders `cummulativeQuoteQty` will be < 0, meaning the data is not available at this time.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-margin-account-39-s-order-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  isIsolated?: 'TRUE' | 'FALSE'
   *  orderId?: number
   *  origClientOrderId?: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "clientOrderId": string
   *  "cummulativeQuoteQty": string
   *  "executedQty": string
   *  "icebergQty": string
   *  "isWorking": boolean
   *  "orderId": number
   *  "origQty": string
   *  "price": string
   *  "side": 'BUY' | 'SELL'
   *  "status": string
   *  "stopPrice": string
   *  "symbol": string
   *  "isIsolated": boolean
   *  "time": string
   *  "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *  "type": 'LIMIT' | 'MARKET'
   *  "updateTime": number
   * }>} Object containing margin account's order
   */
  getOrder: payload =>
    checkParams('authenticated.margin.getOrder', payload, ['symbol']) &&
    privCall('/sapi/v1/margin/order', payload),
  /**
   * Get margin account's open order(s).
   * - If the `symbol` is not sent, orders for all symbols will be returned in an array.
   * - When all symbols are returned, the number of requests counted against the rate limiter is equal to
   * the number of symbols currently trading on the exchange.
   * - If `isIsolated = 'TRUE'`, symbol must be sent.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-margin-account-39-s-open-orders-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol?: string
   *  isIsolated?: 'TRUE' | 'FALSE'
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<[{
   *  "clientOrderId": string
   *  "cummulativeQuoteQty": string
   *  "executedQty": string
   *  "icebergQty": string
   *  "isWorking": boolean
   *  "orderId": number
   *  "origQty": string
   *  "price": string
   *  "side": 'BUY' | 'SELL'
   *  "status": string
   *  "stopPrice": string
   *  "symbol": string
   *  "isIsolated": boolean
   *  "time": string
   *  "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *  "type": 'LIMIT' | 'MARKET'
   *  "updateTime": number
   * }]>} Object containing margin account's open order(s)
   */
  openOrders: payload => privCall('/sapi/v1/margin/openOrders', payload),
  /**
   * Get margin account's all order(s).
   * - If `orderId` is set, it will get orders >= that `orderId`. Otherwise most recent orders are returned.
   * - For some historical orders `cummulativeQuoteQty` will be < 0, meaning the data is not available at this time.
   * @weight 200
   * @requestLimit 60 times/min per IP
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-margin-account-39-s-all-orders-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  isIsolated?: 'TRUE' | 'FALSE'
   *  orderId?: number
   *  startTime?: number
   *  endTime?: number
   *  limit?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<[{
   *  "clientOrderId": string
   *  "cummulativeQuoteQty": string
   *  "executedQty": string
   *  "icebergQty": string
   *  "isWorking": boolean
   *  "orderId": number
   *  "origQty": string
   *  "price": string
   *  "side": 'BUY' | 'SELL'
   *  "status": string
   *  "stopPrice": string
   *  "symbol": string
   *  "isIsolated": boolean
   *  "time": string
   *  "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *  "type": 'LIMIT' | 'MARKET'
   *  "updateTime": number
   * }]>} Object containing margin account's all order(s)
   */
  allOrders: payload =>
    checkParams('authenticated.margin.allOrders', payload, ['symbol']) &&
    privCall('/sapi/v1/margin/allOrders', payload),
  /**
   * Get margin account's trade list.
   * 
   * - If `fromId` is set, it will get trades >= that `fromId`. Otherwise most recent trades are returned.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-margin-account-39-s-trade-list-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  isIsolated?: 'TRUE' | 'FALSE'
   *  startTime?: number
   *  endTime?: number
   *  fromId?: number
   *  limit?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<[{
   *  "commission": string
   *  "commissionAsset": string
   *  "id": number
   *  "isBestMatch": boolean
   *  "isBuyer": boolean
   *  "isMaker": boolean
   *  "orderId": number
   *  "price": boolean
   *  "qty": string
   *  "symbol": string
   *  "isIsolated": boolean
   *  "time": number
   * }]>} Array containing trade(s)
   */
  myTrades: payload =>
    checkParams('authenticated.margin.myTrades', payload, ['symbol']) &&
    privCall('/sapi/v1/margin/myTrades', payload),
  /**
   * Get max borrow.
   * - If `isolatedSymbol` is not sent, crossed margin data will be sent.
   * - `borrowLimit` is also available from https://www.binance.com/en/margin-fee.
   * @weight 50
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-max-borrow-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset: string
   *  isolatedSymbol?: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "amount": string
   *  "borrowLimit": string
   * }>} Object containing max borrow limit
   */
  maxBorrow: payload =>
    checkParams('authenticated.margin.maxBorrow', payload, ['asset']) &&
    privCall('/sapi/v1/margin/maxBorrowable', payload),
  /**
   * Get max transfer-out amount.
   * - If `isolatedSymbol` is not sent, crossed margin data will be sent.
   * @weight 50
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-max-transfer-out-amount-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset: string
   *  isolatedSymbol?: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<string> } amount
   */
  maxTransferOut: payload =>
    checkParams('authenticated.margin.maxTransferOut', payload, ['asset']) &&
    privCall('/sapi/v1/margin/maxTransferable', payload).then(r => r.amount),
  /**
   * Toggle BNB burn on spot trade and margin interest.
   * - `spotBNBBurn` and `interestBNBBurn` should be sent at least one.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#toggle-bnb-burn-on-spot-trade-and-margin-interest-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  spotBNBBurn?: 'true' | 'false'
   *  interestBNBBurn?: 'true' | 'false'
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "spotBNBBurn": boolean
   *  "interestBNBBurn": boolean
   * }>} Response object
   */
  setBNBBurn: payload => privCall('/sapi/v1/bnbBurn', payload, 'POST'),
  /**
   * Get BNB burn status.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-bnb-burn-status-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<{
   *  "spotBNBBurn": boolean
   *  "interestBNBBurn": boolean
   * }>} Response object
   */
  getBNBBurn: payload => privCall('/sapi/v1/bnbBurn', payload),
  /**
   * Query margin interest rate history.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-margin-interest-rate-history-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset: string
   *  vipLevel?: number
   *  startTime?: number
   *  endTime?: number
   *  limit?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<[{
   *  "asset": string
   *  "dailyInterestRate": string
   *  "timestamp": number
   *  "vipLevel": number
   * }]>} Array containing interest rate history
   */
  interestRateHistory: payload =>
    checkParams('authenticated.margin.interestRateHistory', payload, ['asset']) &&
    privCall('/sapi/v1/margin/interestRateHistory', payload),
  userDataStreams: authenticatedMarginUserDataStreams(privCall),
  cross: authenticatedMarginCross(privCall, kCall),
  isolated: authenticatedMarginIsolated(privCall, kCall),
  OCO: authenticatedMarginOCO(privCall),
})

export default authenticatedMargin
