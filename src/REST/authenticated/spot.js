// Imports:
import {
  checkParams,
  order,
  orderOCO
} from '../'


// Exports:
/**
 * 👛 Spot Wallet Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#wallet-endpoints
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedSpotWallet = (privCall) => ({
  /**
   * Get information of coins (available for deposit and withdraw) for user.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#all-coins-39-information-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<[{
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
   *  "storage": string
   *  "trading": boolean
   *  "withdrawAllEnable": boolean
   *  "withdrawing": string
   * }]>} Array of coin information objects
   */
  accountCoins: payload => privCall('/sapi/v1/capital/config/getall', payload),
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
   * }} payload
   * @returns { Promise<{
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
   * }>} Object containing daily account snapshot
   */
  dailyAccountSnapshot: payload =>
    checkParams('authenticated.spot.wallet.dailyAccountSnapshot', payload, ['type']) &&
    privCall('/sapi/v1/accountSnapshot', payload),
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
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<{}> } Empty object
   */
  disableFastWithdrawSwitch: payload => privCall('/sapi/v1/account/disableFastWithdrawSwitch', payload, 'POST'),
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
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<{}> } Empty object
   */
  enableFastWithdrawSwitch: payload => privCall('/sapi/v1/account/enableFastWithdrawSwitch', payload, 'POST'),
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
   * }} payload
   * @returns { Promise<string> } id
   */
  withdraw: payload =>
    checkParams('authenticated.spot.wallet.withdraw', payload, [ 'coin', 'address', 'amount' ]) &&
    privCall('/sapi/v1/capital/withdraw/apply', payload, 'POST').then(r => r.id),
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
   * }=} payload
   * @returns { Promise<[{
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
   * }]>} Array containing deposit objects
   */
  depositHistory: payload => privCall('/sapi/v1/capital/deposit/hisrec', payload),
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
   * }=} payload
   * @returns { Promise<[{
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
   *  "info": string
   *  "txId": string
   * }]>} Array containing withdraw objects
   */
  withdrawHistory: payload => privCall('/sapi/v1/capital/withdraw/history', payload),
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
   * }} payload
   * @returns { Promise<{
   *  "address": string
   *  "coin": string
   *  "tag": string
   *  "url": string
   * }>} Object containing deposit address
   */
  depositAddress: payload =>
    checkParams('authenticated.spot.wallet.depositAddress', payload, ['coin']) &&
    privCall('/sapi/v1/capital/deposit/address', payload),
  /**
   * Fetch account status detail.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#account-status-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<string> } data
   */
  accountStatus: payload => privCall('/sapi/v1/account/status', payload).then(r => r.data),
  /**
   * Fetch account API trading status details.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#account-api-trading-status-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<{
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
   *        "i": 'GCR' | 'IFER' | 'UFR'
   *        "c": number
   *        "v": number
   *        "t": number
   *      }]
   *    }
   *    "updateTime": number
   *  }
   * }>} Object containing account API trading status
   */
  accountAPITradingStatus: payload => privCall('/sapi/v1/account/apiTradingStatus', payload),
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
   * }=} payload
   * @returns { Promise<{
   *  "total"?: number
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
   * }>} Object containing dust log.
   */
  dustLog: payload => privCall('/sapi/v1/asset/dribblet', payload),
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
   * }} payload
   * @returns { Promise<{
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
   * }>} Object containing dust transfer results 
   */
  dustTransfer: payload =>
    checkParams('authenticated.spot.wallet.dustTransfer', payload, ['asset']) &&
    privCall('/sapi/v1/asset/dust', payload, 'POST'),
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
   * }=} payload
   * @returns { Promise<{
   *  "rows": [{
   *    "id": number
   *    "amount": string
   *    "asset": string
   *    "divTime": string
   *    "enInfo": string
   *    "tranId": number
   *  }]
   *  "total": number
   * }>} Object containing asset dividend record list
   */
  assetDividendRecord: payload => privCall('/sapi/v1/asset/assetDividend', payload),   
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
   * }=} payload
   * @returns { Promise<{
   *  [ key: string ]: {
   *    minWithdrawAmount: string
   *    depositStatus: boolean
   *    withdrawFee: number
   *    withdrawStatus: boolean
   *    depositTip?: string
   *  }
   * }>} Object containing asset detail(s)
   */
  assetDetail: payload => privCall('/sapi/v1/asset/assetDetail', payload),
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
   * }=} payload
   * @returns { Promise<{
   *  [ symbol: string ]: {
   *    "makerCommission": string
   *    "takerCommission": string
   *  }
   * }>} Object of fee objects
   */
  tradeFee: payload => privCall('/sapi/v1/asset/tradeFee', payload).then(r =>
    (Array.isArray(r) ? r : [r]).reduce((out, cur) => ((out[ cur.symbol ] = {
      makerCommission: cur.makerCommission,
      takerCommission: cur.takerCommission
    }), out), {})
  ),
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
   * }} payload
   * @returns { Promise<number> } tranId
   */
  universalTransfer: payload =>
    checkParams('authenticated.spot.wallet.universalTransfer', payload, [ 'type', 'asset', 'amount' ]) &&
    privCall('/sapi/v1/asset/transfer', payload, 'POST').then(r => r.tranId),
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
   * }} payload
   * @returns { Promise<{
   *  "rows": [{
   *    "asset": string
   *    "amount": string
   *    "type": string
   *    "status": 'PENDING' | 'CONFIRMED' | 'FAILED'
   *    "tranId": number
   *    "timestamp": number
   *  }]
   *  "total": number
   * }>} Object containing user universal transfer history list
   */
  universalTransferHistory: payload =>
    checkParams('authenticated.spot.wallet.universalTransferHistory', payload, ['type']) &&
    privCall('/sapi/v1/asset/transfer', payload),
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
   * }=} payload
   * @returns { Promise<[{
   *  "asset": string
   *  "free": string
   *  "locked": string
   *  "freeze": string
   *  "withdrawing": string
   *  "btcValuation": string
   * }]>} Array containing funding wallet details
   */
  fundingWallet: payload => privCall('/sapi/v1/asset/get-funding-asset', payload, 'POST'),
  /**
   * Get API key permission.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-api-key-permission-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow?: number }=} payload
   * @returns { Promise<{
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
   *  "tradingAuthorityExpirationTime"?: number
   * }>} Response object
   */
  APIPermission: payload =>  privCall('/sapi/v1/account/apiRestrictions', payload),
  /**
   * Enable or Disable IP Restriction for an API Key.
   * @weight 3000
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#enable-or-disable-ip-restriction-for-an-api-key-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  accountApiKey: string
   *  ipRestrict: boolean
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "ipRestrict": 'true' | 'false'
   *  "ipList": string[]
   *  "updateTime": number
   *  "apiKey": string
   * }>} Response object
   */
  setAPIKeyIPRestriction: payload =>  privCall('/sapi/v1/account/apiRestrictions/ipRestriction', payload, 'POST'),
  /**
   * Add IP List for an API Key.
   * You need to make sure you have used this endpoint `POST /sapi/v1/account/apiRestrictions/ipRestriction` enabled IP restriction,
   * then you can add IP list by `POST /sapi/v1/account/apiRestrictions/ipRestriction/ipList`.
   * - `ipAddress` can be added in batches, separated by commas.
   * @weight 3000
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#add-ip-list-for-an-api-key-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  accountApiKey: string
   *  ipAddress: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "ip": string
   *  "updateTime": number
   *  "apiKey": string
   * }>} Response object
   */
  addIPListForAPIKey: payload =>  privCall('/sapi/v1/account/apiRestrictions/ipRestriction/ipList', payload, 'POST'),
  /**
   * Get IP Restriction for an API Key.
   * @weight 3000
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-ip-restriction-for-an-api-key-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  accountApiKey: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "ipRestrict": 'true' | 'false'
   *  "ipList": string[]
   *  "updateTime": number
   *  "apiKey": string
   * }>} Response object
   */
  getIPRestrictionForAPIKey: payload =>  privCall('/sapi/v1/account/apiRestrictions/ipRestriction', payload),
  /**
   * Delete IP List for an API Key.
   * @weight 3000
   * @http DELETE
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-ip-restriction-for-an-api-key-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  accountApiKey: string
   *  ipAddress: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "ipRestrict": 'true' | 'false'
   *  "ipList": string[]
   *  "updateTime": number
   *  "apiKey": string
   * }>} Response object
   */
  deleteIPListForAPIKey: payload =>  privCall('/sapi/v1/account/apiRestrictions/ipRestriction/ipList', payload, 'DELETE'),
})

/**
 * 👨‍👧 Spot Sub-Account Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#sub-account-endpoints
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedSpotSubAccount = (privCall) => ({
  /**
   * Create a virtual sub-account (For Master Account).
   * - This request will generate a virtual sub account under your master account.
   * - You need to enable "trade" option for the api key which requests this endpoint
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#create-a-virtual-sub-account-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  subAccountString: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<string> } email
   */
  createSubAccount: payload =>
    checkParams('authenticated.spot.subAccount.createSubAccount', payload, ['subAccountString']) &&
    privCall('/sapi/v1/sub-account/virtualSubAccount', payload, 'POST').then(r => r.email),
  /**
   * Query sub-account list (For Master Account).
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-sub-account-list-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email?: string
   *  isFreeze?: 'true' | 'false'
   *  page?: number
   *  limit?: number
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<[{
   *  "email": string
   *  "isFreeze": boolean
   *  "createTime": number
   * }]>} Array containing sub-account objects 
   */
  list: payload => privCall('/sapi/v1/sub-account/list', payload).then(r => r.subAccounts),
  /**
   * Query sub-account spot asset transfer history (For Master Account).
   * - `fromEmail` and `toEmail` cannot be sent at the same time.
   * - Returning `fromEmail` equals master account email by default.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-sub-account-spot-asset-transfer-history-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  fromEmail?: string
   *  toEmail?: string
   *  startTime?: number
   *  endTime?: number
   *  page?: number
   *  limit?: number
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<[{
   *  "from": string
   *  "to": string
   *  "asset": string
   *  "qty": string
   *  "status": string
   *  "tranId": number
   *  "time": number
   * }]>} Array containing transfer objects 
   */
  spotAssetTransferHistory: payload => privCall('/sapi/v1/sub-account/sub/transfer/history', payload),
  /**
   * Query sub-account futures asset transfer history (For Master Account).
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-sub-account-futures-asset-transfer-history-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  futuresType: 1 | 2
   *  startTime?: number
   *  endTime?: number
   *  page?: number
   *  limit?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "success": boolean
   *  "futuresType": 1 | 2
   *  "transfers": [{
   *    "from": string
   *    "to": string
   *    "asset": string
   *    "qty": string
   *    "status": string
   *    "tranId": number
   *    "time": number
   *  }]
   * }>} Object containing transfer objects 
   */
  futuresAssetTransferHistory: payload =>
    checkParams('authenticated.spot.subAccount.futuresAssetTransferHistory', payload, [ 'email', 'futuresType' ]) &&
    privCall('/sapi/v1/sub-account/futures/internalTransfer', payload),
  /**
   * Sub-account futures asset transfer (For Master Account).
   * - Master account can transfer max 2000 times a minute.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#sub-account-futures-asset-transfer-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  fromEmail: string
   *  toEmail: string
   *  futuresType: 1 | 2
   *  asset: string
   *  amount: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "success": boolean
   *  "txnId": string
   * }>} Object containing transfer receipt 
   */
  futuresAssetTransfer: payload =>
    checkParams('authenticated.spot.subAccount.futuresAssetTransfer', payload, [ 'fromEmail', 'toEmail', 'futuresType', 'asset', 'amount' ]) &&
    privCall('/sapi/v1/sub-account/futures/internalTransfer', payload, 'POST'),
  /**
   * Fetch sub-account assets (For Master Account).
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-sub-account-assets-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  [ asset: string ]: {
   *    "free": number
   *    "locked": number
   *  }
   * }>} Object containing asset balances 
   */
  getAssets: payload =>
    checkParams('authenticated.spot.subAccount.getAssets', payload, ['email']) &&
    privCall('/sapi/v3/sub-account/assets', payload).then(r =>
      (Array.isArray(r.balances) ? r.balances : [ r.balances ]).reduce((out, cur) => ((out[ cur.asset ] = {
        free: cur.free,
        locked: cur.locked
      }), out), {})
    ),
  /**
   * Get BTC valued asset summary of sub-accounts (For Master Account).
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-sub-account-spot-assets-summary-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email?: string
   *  page?: number
   *  size?: number
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<{
   *  "totalCount": number
   *  "masterAccountTotalAsset": string
   *  "spotSubUserAssetBtcVoList": [{
   *    "email": string
   *    "totalAsset": string
   *  }]
   * }>} Object containing account summary
   */
  summary: payload => privCall('/sapi/v1/sub-account/spotSummary', payload),
  /**
   * Fetch sub-account deposit address (For Master Account).
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-sub-account-deposit-address-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  coin: string
   *  network?: string
   *  size?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "address": string
   *  "coin": string
   *  "tag": string
   *  "url": string
   * }>} Object containing deposit address
   */
  getDepositAddress: payload =>
    checkParams('authenticated.spot.subAccount.getDepositAddress', payload, [ 'email', 'coin' ]) &&
    privCall('/sapi/v1/capital/deposit/subAddress', payload),
  /**
   * Fetch sub-account deposit address (For Master Account).
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-sub-account-deposit-address-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  coin?: string
   *  status?: 0 | 6 | 1
   *  startTime?: number
   *  endTime?: number
   *  limit?: number
   *  offset?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<[{
   *  "amount": string
   *  "coin": string
   *  "network": string
   *  "status": 0 | 6 | 1
   *  "address": string
   *  "addressTag": string
   *  "txId": string
   *  "insertTime": number
   *  "transferType": number
   *  "confirmTimes": string
   * }]>} Array containing deposit history
   */
  getDepositHistory: payload =>
    checkParams('authenticated.spot.subAccount.getDepositHistory', payload, ['email']) &&
    privCall('/sapi/v1/capital/deposit/subHisrec', payload),
  /**
   * Get sub-account's status on margin/futures (For Master Account).
   * 
   * If no email sent, all sub-accounts' information will be returned.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-sub-account-39-s-status-on-margin-futures-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email?: string
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<[{
   *  "email": string
   *  "isSubUserEnabled": boolean
   *  "isUserActive": boolean
   *  "insertTime": number
   *  "isMarginEnabled": boolean
   *  "isFutureEnabled": boolean
   *  "mobile": number
   * }]>} Array containing sub-account statuses
   */
  status: payload => privCall('/sapi/v1/sub-account/status', payload),
  /**
   * Enable margin for sub-account (For Master Account).
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#enable-margin-for-sub-account-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "email": string
   *  "isMarginEnabled": boolean
   * }>} Response object
   */
  enableMargin: payload =>
    checkParams('authenticated.spot.subAccount.enableMargin', payload, ['email']) &&
    privCall('/sapi/v1/sub-account/margin/enable', payload, 'POST'),
  /**
   * Get detail on sub-account's margin account (For Master Account).
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-detail-on-sub-account-39-s-margin-account-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "email": string
   *  "marginLevel": string
   *  "totalAssetOfBtc": string
   *  "totalLiabilityOfBtc": string
   *  "totalNetAssetOfBtc": string
   *  "marginTradeCoeffVo": {
   *    "forceLiquidationBar": string
   *    "marginCallBar": string
   *    "normalBar": string
   *  }
   *  "marginUserAssetVoList": [{
   *    "asset": string
   *    "borrowed": string
   *    "free": string
   *    "interest": string
   *    "locked": string
   *    "netAsset": string
   *  }]
   * }>} Object containing sub-account margin account details
   */
  getMarginAccountDetail: payload =>
    checkParams('authenticated.spot.subAccount.getMarginAccountDetail', payload, ['email']) &&
    privCall('/sapi/v1/sub-account/margin/account', payload),
  /**
   * Get summary of sub-account's margin account (For Master Account).
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-summary-of-sub-account-39-s-margin-account-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow?: number }=} payload
   * @returns { Promise<{
   *  "totalAssetOfBtc": string
   *  "totalLiabilityOfBtc": string
   *  "totalNetAssetOfBtc": string
   *  "subAccountList": [{
   *    "email": string
   *    "totalAssetOfBtc": string
   *    "totalLiabilityOfBtc": string
   *    "totalNetAssetOfBtc": string
   *  }]
   * }>} Object containing sub-account margin account summary
   */
  getMarginAccountSummary: payload => privCall('/sapi/v1/sub-account/margin/accountSummary', payload),
  /**
   * Enable futures for sub-account (For Master Account).
   * @weight 10
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#enable-futures-for-sub-account-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "email": string
   *  "isFuturesEnabled": boolean
   *  }>} Response object
   */
  enableFutures: payload =>
    checkParams('authenticated.spot.subAccount.enableFutures', payload, ['email']) &&
    privCall('/sapi/v1/sub-account/futures/enable', payload, 'POST'),
  /**
   * Get detail on sub-account's futures account (For Master Account).
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-detail-on-sub-account-39-s-futures-account-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "email": string
   *  "asset": string
   *  "assets": [{
   *    "asset": string
   *    "initialMargin": string
   *    "maintenanceMargin": string
   *    "marginBalance": string
   *    "maxWithdrawAmount": string
   *    "openOrderInitialMargin": string
   *    "positionInitialMargin": string
   *    "unrealizedProfit": string
   *    "walletBalance": string
   *  }]
   *  "canDeposit": boolean
   *  "canTrade": boolean
   *  "canWithdraw": boolean
   *  "feeTier": number
   *  "maxWithdrawAmount": string
   *  "totalInitialMargin": string
   *  "totalMaintenanceMargin": string
   *  "totalMarginBalance": string
   *  "totalOpenOrderInitialMargin": string
   *  "totalPositionInitialMargin": string
   *  "totalUnrealizedProfit": string
   *  "totalWalletBalance": string
   *  "updateTime": number
   * }>} Object containing sub-account futures account details
   */
  getFuturesAccountDetail: payload =>
    checkParams('authenticated.spot.subAccount.getFuturesAccountDetail', payload, ['email']) &&
    privCall('/sapi/v1/sub-account/futures/account', payload),
  /**
   * Get summary of sub-account's futures account (For Master Account).
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-summary-of-sub-account-39-s-futures-account-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow?: number }=} payload
   * @returns { Promise<{
   *  "totalInitialMargin": string
   *  "totalMaintenanceMargin": string
   *  "totalMarginBalance": string
   *  "totalOpenOrderInitialMargin": string
   *  "totalPositionInitialMargin": string
   *  "totalUnrealizedProfit": string
   *  "totalWalletBalance": string
   *  "asset": string
   *  "subAccountList": [{
   *    "email": string
   *    "totalInitialMargin": string
   *    "totalMaintenanceMargin": string
   *    "totalMarginBalance": string
   *    "totalOpenOrderInitialMargin": string
   *    "totalPositionInitialMargin": string
   *    "totalUnrealizedProfit": string
   *    "totalWalletBalance": string
   *    "asset": string
   *  }]
   * }>} Object containing sub-account futures account summary
   */
  getFuturesAccountSummary: payload => privCall('/sapi/v1/sub-account/futures/accountSummary', payload),
  /**
   * Get future's position risk of sub-account (For Master Account).
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-futures-position-risk-of-sub-account-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<[{
   *  "entryPrice": string
   *  "leverage": string
   *  "maxNotional": string
   *  "liquidationPrice": string
   *  "markPrice": string
   *  "positionAmount": string
   *  "symbol": string
   *  "unrealizedProfit": string
   * }]>} Array containing future's position risks
   */
  getFuturesPositionRisk: payload =>
    checkParams('authenticated.spot.subAccount.getFuturesPositionRisk', payload, ['email']) &&
    privCall('/sapi/v1/sub-account/futures/positionRisk', payload),
  /**
   * Futures transfer for sub-account (For Master Account).
   * 
   * The `type` parameter varies as follows:
   * - `1`: Transfer from sub-account's spot account to its USDT-margined futures account.
   * - `2`: Transfer from sub-account's USDT-margined futures account to its spot account.
   * - `3`: Transfer from sub-account's spot account to its COIN-margined futures account.
   * - `4`: Transfer from sub-account's COIN-margined futures account to its spot account.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#futures-transfer-for-sub-account-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  asset: string
   *  amount: string
   *  type: 1 | 2 | 3 | 4
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<string> } txnId
   */
  futuresTransfer: payload =>
    checkParams('authenticated.spot.subAccount.futuresTransfer', payload, [ 'email', 'asset', 'amount', 'type' ]) &&
    privCall('/sapi/v1/sub-account/futures/transfer', payload, 'POST').then(r => r.txnId),
  /**
   * Margin transfer for sub-account (For Master Account).
   * 
   * The `type` parameter varies as follows:
   * - `1`: Transfer from sub-account's spot account to margin account.
   * - `2`: Transfer from sub-account's margin account to its spot account.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#margin-transfer-for-sub-account-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  asset: string
   *  amount: string
   *  type: 1 | 2
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<string> } txnId
   */
  marginTransfer: payload =>
    checkParams('authenticated.spot.subAccount.marginTransfer', payload, [ 'email', 'asset', 'amount', 'type' ]) &&
    privCall('/sapi/v1/sub-account/margin/transfer', payload, 'POST').then(r => r.txnId),
  /**
   * Transfer to sub-account of same master (For Master Account).
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#transfer-to-sub-account-of-same-master-for-sub-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  toEmail: string
   *  asset: string
   *  amount: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<string> } txnId
   */
  transferToSiblingSubAccount: payload =>
    checkParams('authenticated.spot.subAccount.transferToSiblingSubAccount', payload, [ 'toEmail', 'asset', 'amount' ]) &&
    privCall('/sapi/v1/sub-account/transfer/subToSub', payload, 'POST').then(r => r.txnId),
  /**
   * Transfer to master (For Master Account).
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#transfer-to-master-for-sub-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset: string
   *  amount: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<string> } txnId
   */
  transferToMaster: payload =>
    checkParams('authenticated.spot.subAccount.transferToMaster', payload, [ 'asset', 'amount' ]) &&
    privCall('/sapi/v1/sub-account/transfer/subToMaster', payload, 'POST').then(r => r.txnId),
  /**
   * Sub-account transfer history (For Master Account).
   * 
   * The `type` parameter varies as follows:
   * - `1`: Transfer in.
   * - `2`: Transfer out.
   * 
   * Note:
   * - If `type` is not sent, the records of `type 2: transfer out` will be returned by default.
   * - If `startTime` and `endTime` are not sent, the recent 30-day data will be returned.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#sub-account-transfer-history-for-sub-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset?: string
   *  type?: 1 | 2
   *  startTime?: number
   *  endTime?: number
   *  limit?: number
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<[{
   *  "counterParty": string
   *  "email": string
   *  "type": 1 | 2
   *  "asset": string
   *  "qty": string
   *  "fromAccountType": 'SPOT' | 'USDT_FUTURE' | 'COIN_FUTURE'
   *  "toAccountType": 'SPOT' | 'USDT_FUTURE' | 'COIN_FUTURE'
   *  "status": string
   *  "tranId": number
   *  "time": number
   * }]>} Array containing transfer history
   */
  transferHistory: payload => privCall('/sapi/v1/sub-account/transfer/subUserHistory', payload),
  /**
   * Sub-account transfer history (For Master Account).
   * 
   * Note:
   * - You need to enable "internal transfer" option for the API key which requests this endpoint.
   * - Transfer from master account by default if `fromEmail` is not sent.
   * - Transfer to master account by default if `toEmail` is not sent.
   * - Transfer between futures accounts is not supported.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#universal-transfer-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  fromEmail?: string
   *  toEmail?: string
   *  fromAccountType: 'SPOT' | 'USDT_FUTURE' | 'COIN_FUTURE'
   *  toAccountType: 'SPOT' | 'USDT_FUTURE' | 'COIN_FUTURE'
   *  asset: string
   *  amount: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<string> } tranId
   */
  universalTransfer: payload =>
    checkParams('authenticated.spot.subAccount.universalTransfer', payload, [ 'fromAccountType', 'toAccountType', 'asset', 'amount' ]) &&
    privCall('/sapi/v1/sub-account/universalTransfer', payload, 'POST').then(r => r.tranId),
  /**
   * Sub-account universal transfer history (For Master Account).
   * 
   * Note:
   * - `fromEmail` and `toEmail` cannot be sent at the same time.
   * - Empty `fromEmail` equals master account email by default.
   * - Only returns the latest history of past 30 days.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-universal-transfer-history-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  fromEmail?: string
   *  toEmail?: string
   *  startTime?: number
   *  endTime?: number
   *  page?: number
   *  limit?: number
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<[{
   *  "tranId": number
   *  "fromEmail": string
   *  "toEmail": string
   *  "asset": string
   *  "amount": string
   *  "fromAccountType": 'SPOT' | 'USDT_FUTURE' | 'COIN_FUTURE'
   *  "toAccountType": 'SPOT' | 'USDT_FUTURE' | 'COIN_FUTURE'
   *  "status": string
   *  "createTimeStamp": number
   * }]>} Array containing universal transfer history
   */
  universalTransferHistory: payload => privCall('/sapi/v1/sub-account/universalTransfer', payload),
  /**
   * Get detail on sub-account's futures account V2 (For Master Account).
   * 
   * The `type` parameter varies as follows:
   * - `1`: USDT Margined Futures.
   * - `2`: COIN Margined Futures.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-detail-on-sub-account-39-s-futures-account-v2-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  futuresType: 1 | 2
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "futureAccountResp": {
   *    "email": string
   *    "asset": string
   *    "assets": [{
   *      "asset": string
   *      "initialMargin": string
   *      "maintenanceMargin": string
   *      "marginBalance": string
   *      "maxWithdrawAmount": string
   *      "openOrderInitialMargin": string
   *      "positionInitialMargin": string
   *      "unrealizedProfit": string
   *      "walletBalance": string
   *    }]
   *    "canDeposit": boolean
   *    "canTrade": boolean
   *    "canWithdraw": boolean
   *    "feeTier": number
   *    "maxWithdrawAmount": string
   *    "totalInitialMargin": string
   *    "totalMaintenanceMargin": string
   *    "totalMarginBalance": string
   *    "totalOpenOrderInitialMargin": string
   *    "totalPositionInitialMargin": string
   *    "totalUnrealizedProfit": string
   *    "totalWalletBalance": string
   *    "updateTime": number
   *  }
   * }> | Promise<{
   *  "deliveryAccountResp": {
   *    "email": string
   *    "assets": [{
   *      "asset": string
   *      "initialMargin": string
   *      "maintenanceMargin": string
   *      "marginBalance": string
   *      "maxWithdrawAmount": string
   *      "openOrderInitialMargin": string
   *      "positionInitialMargin": string
   *      "unrealizedProfit": string
   *      "walletBalance": string
   *    }]
   *    "canDeposit": boolean
   *    "canTrade": boolean
   *    "canWithdraw": boolean
   *    "feeTier": number
   *    "updateTime": number
   *  }
   * }>} Object containing sub-account futures account details V2
   */
  getFuturesAccountDetailV2: payload =>
    checkParams('authenticated.spot.subAccount.getFuturesAccountDetailV2', payload, [ 'email', 'futuresType' ]) &&
    privCall('/sapi/v2/sub-account/futures/account', payload),
  /**
   * Get summary of sub-account's futures account V2 (For Master Account).
   * 
   * The `futuresType` parameter varies as follows:
   * - `1`: USDT Margined Futures.
   * - `2`: COIN Margined Futures.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-summary-of-sub-account-39-s-futures-account-v2-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  futuresType: 1 | 2
   *  page?: number
   *  limit?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *    "futureAccountSummaryResp": {
   *    "totalInitialMargin": string
   *    "totalMaintenanceMargin": string
   *    "totalMarginBalance": string
   *    "totalOpenOrderInitialMargin": string
   *    "totalPositionInitialMargin": string
   *    "totalUnrealizedProfit": string
   *    "totalWalletBalance": string
   *    "asset": string
   *    "subAccountList": [{
   *      "email": string
   *      "totalInitialMargin": string
   *      "totalMaintenanceMargin": string
   *      "totalMarginBalance": string
   *      "totalOpenOrderInitialMargin": string
   *      "totalPositionInitialMargin": string
   *      "totalUnrealizedProfit": string
   *      "totalWalletBalance": string
   *      "asset": string
   *    }]
   *  }
   * }> | Promise<{
   *  "deliveryAccountSummaryResp": {
   *    "totalMarginBalanceOfBTC": string
   *    "totalUnrealizedProfitOfBTC": string
   *    "totalWalletBalanceOfBTC": string
   *    "asset": string
   *    "subAccountList": [{
   *      "email": string
   *      "totalMarginBalance": string
   *      "totalUnrealizedProfit": string
   *      "totalWalletBalance": string
   *      "asset": string
   *    }]
   *  }
   * }>} Object containing sub-account futures account summary V2
   */
  getFuturesAccountSummaryV2: payload =>
    checkParams('authenticated.spot.subAccount.getFuturesAccountSummaryV2', payload, ['futuresType']) &&
    privCall('/sapi/v2/sub-account/futures/accountSummary', payload),
  /**
   * Get future's position risk of sub-account V2 (For Master Account).
   * 
   * The `futuresType` parameter varies as follows:
   * - `1`: USDT Margined Futures.
   * - `2`: COIN Margined Futures.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-futures-position-risk-of-sub-account-v2-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  futuresType: 1 | 2
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "futurePositionRiskVos": [{
   *    "entryPrice": string
   *    "leverage": string
   *    "maxNotional": string
   *    "liquidationPrice": string
   *    "markPrice": string
   *    "positionAmount": string
   *    "symbol": string
   *    "unrealizedProfit": string
   *  }]
   * }> | Promise<{
   *  "deliveryPositionRiskVos": [{
   *    "entryPrice": string
   *    "markPrice": string
   *    "leverage": string
   *    "isolated": string
   *    "isolatedWallet": string
   *    "isolatedMargin": string
   *    "isAutoAddMargin": string
   *    "positionSide": 'BOTH' | 'BUY' | 'SELL'
   *    "positionAmount": string
   *    "symbol": string
   *    "unrealizedProfit": string
   *  }]
   * }>} Array containing future's position risks V2
   */
  getFuturesPositionRiskV2: payload =>
    checkParams('authenticated.spot.subAccount.getFuturesPositionRiskV2', payload, [ 'email', 'futuresType' ]) &&
    privCall('/sapi/v2/sub-account/futures/positionRisk', payload),
  /**
   * Enable leverage token for sub-account (For Master Account).
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#enable-leverage-token-for-sub-account-for-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  enableBlvt: boolean
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "email": string
   *  "enableBlvt": boolean
   * }>} Response object
   */
  enableBLVT: payload =>
    checkParams('authenticated.spot.subAccount.enableBLVT', payload, [ 'email', 'enableBlvt' ]) &&
    privCall('/sapi/v1/sub-account/blvt/enable', payload, 'POST'),
  /**
   * Deposit assets into the managed sub-account (For Investor Master Account).
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#deposit-assets-into-the-managed-sub-account-for-investor-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  asset: string
   *  amount: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<string> } tranId
   */
  depositToManaged: payload =>
    checkParams('authenticated.spot.subAccount.depositToManaged', payload, [ 'email', 'asset', 'amount' ]) &&
    privCall('/sapi/v1/managed-subaccount/deposit', payload, 'POST').then(r => r.tranId),
  /**
   * Query managed sub-account asset details (For Investor Master Account).
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-managed-sub-account-asset-details-for-investor-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  email: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<[{
   *  "coin": string
   *  "name": string
   *  "totalBalance": string
   *  "availableBalance": string
   *  "inOrder": string
   *  "btcValue": string
   * }]>} Array containing sub-account asset details
   */
  getManagedAccountDetails: payload =>
    checkParams('authenticated.spot.subAccount.getManagedAccountDetails', payload, ['email']) &&
    privCall('/sapi/v1/managed-subaccount/asset', payload),
  /**
   * Query managed sub-account asset details (For Investor Master Account).
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#withdrawl-assets-from-the-managed-sub-account-for-investor-master-account
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  fromEmail: string
   *  asset: string
   *  amount: string
   *  transferDate?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<string> } tranId
   */
  withdrawFromManaged: payload =>
    checkParams('authenticated.spot.subAccount.withdrawFromManaged', payload, [ 'fromEmail', 'asset', 'amount' ]) &&
    privCall('/sapi/v1/managed-subaccount/withdraw', payload, 'POST').then(r => r.tranId),
})

/**
 * 💹 Spot Market Data Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#market-data-endpoints
 * @param { (path: any, data: any, method?: string) => Promise<any> } kCall
 */
export const authenticatedSpotMarketData = (kCall) => ({
  /**
   * Get older market trades.
   * @weight 5
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#old-trade-lookup-market_data
   * @requires APIKEY
   * @param {{
   *  symbol: string
   *  limit?: number
   *  fromId?: number
   * }} payload
   * @returns { Promise<[{
   *  "id": number
   *  "price": string
   *  "qty": string
   *  "quoteQty": string
   *  "time": number
   *  "isBuyerMaker": boolean
   *  "isBestMatch": boolean
   * }]>} Array of old trade objects
   */
  historicalTrades: payload =>
    checkParams('authenticated.spot.marketData.historicalTrades', payload, ['symbol']) &&
    kCall('/api/v3/historicalTrades', payload),
})

/**
 * 🤑👀 Spot Account/Trade OCO Endpoints
 * 
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedSpotTradeOCO = (privCall) => ({
  /**
   * Send in a new OCO order.
   * 
   * Other Info:
   * - Price Restrictions:
   *    - `SELL`: Limit Price > Last Price > Stop Price.
   *    - `BUY`: Limit Price < Last Price < Stop Price.
   * - Quantity Restrictions:
   *    - Both legs must have the same quantity.
   *    - `ICEBERG` quantities however do not have to be the same.
   * - Order Rate Limit:
   *    - `OCO` counts as 2 orders against the order rate limit.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#new-oco-trade
   * @requires APIKEY
   * @requires APISECRET
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
   * @returns { Promise<{
   *  "orderListId": number
   *  "contingencyType": string
   *  "listStatusType": string
   *  "listOrderStatus": string
   *  "listClientOrderId": string
   *  "transactionTime": number
   *  "symbol": string
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
   *    "status": 'CANCELED' | 'EXPIRED' | 'FILLED' | 'NEW'
   *    | 'PARTIALLY_FILLED' | 'PENDING_CANCEL' | 'REJECTED'
   *    "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *    "type": 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT'
   *    | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT' | 'LIMIT_MAKER'
   *    "side": 'BUY' | 'SELL'
   *    "stopPrice"?: string
   *  }]
   * }>} Object containing OCO order object
   */
  order: payload => orderOCO(privCall, payload, '/api/v3/order/oco', 'POST'),
  /**
   * Cancel an entire Order List.
   * 
   * Additional notes:
   * - Canceling an individual leg will cancel the entire OCO.
   * @weight 1
   * @http DELETE
   * @see https://binance-docs.github.io/apidocs/spot/en/#cancel-oco-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  orderListId?: number
   *  listClientOrderId?: string
   *  newClientOrderId?: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "orderListId": number
   *  "contingencyType": string
   *  "listStatusType": string
   *  "listOrderStatus": string
   *  "listClientOrderId": string
   *  "transactionTime": number
   *  "symbol": string
   *  "orders": [{
   *    "symbol": string
   *    "orderId": number
   *    "clientOrderId": string
   *  }]
   *  "orderReports": [{
   *    "symbol": string
   *    "origClientOrderId": string
   *    "orderId": number
   *    "orderListId": number
   *    "clientOrderId": string
   *    "price": string
   *    "origQty": string
   *    "executedQty": string
   *    "cummulativeQuoteQty": string
   *    "status": 'CANCELED' | 'EXPIRED' | 'FILLED' | 'NEW'
   *    | 'PARTIALLY_FILLED' | 'PENDING_CANCEL' | 'REJECTED'
   *    "timeInForce": 'FOK' | 'GTC' | 'IOC'
   *    "type": 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT'
   *    | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT' | 'LIMIT_MAKER'
   *    "side": 'BUY' | 'SELL'
   *    "stopPrice"?: string
   *  }]
   * }>} Object containing cancelled OCO order object
   */
  cancelOrder: payload =>
    checkParams('authenticated.spot.trade.OCO.cancelOrder', payload, ['symbol']) &&
    privCall('/api/v3/orderList', payload, 'DELETE'),
  /**
   * Retrieves a specific OCO based on provided optional parameters.
   * @weight 2
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-oco-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  orderListId?: number
   *  origClientOrderId?: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "orderListId": number
   *  "contingencyType": string
   *  "listStatusType": string
   *  "listOrderStatus": string
   *  "listClientOrderId": string
   *  "transactionTime": number
   *  "symbol": string
   *  "orders": [{
   *    "symbol": string
   *    "orderId": number
   *    "clientOrderId": string
   *  }]
   * }>} Object containing OCO order object
   */
  getOrder: payload => privCall('/api/v3/orderList', payload),
  /**
   * Retrieves all OCO based on provided optional parameters.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-all-oco-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
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
   *  "transactionTime": number
   *  "symbol": string
   *  "orders": [{
   *    "symbol": string
   *    "orderId": number
   *    "clientOrderId": string
   *  }]
   * }]>} Array containing OCO order objects
   */
  allOrders: payload => privCall('/api/v3/allOrderList', payload),
  /**
   * Query all open OCO orders.
   * @weight 3
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-open-oco-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<[{
   *  "orderListId": number
   *  "contingencyType": string
   *  "listStatusType": string
   *  "listOrderStatus": string
   *  "listClientOrderId": string
   *  "transactionTime": number
   *  "symbol": string
   *  "orders": [{
   *    "symbol": string
   *    "orderId": number
   *    "clientOrderId": string
   *  }]
   * }]>} Array containing open OCO order objects
   */
  openOrders: payload => privCall('/api/v3/openOrderList', payload)
})

/**
 * 🤑 Spot Account/Trade Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#spot-account-trade
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedSpotTrade = (privCall) => ({
  /**
   * Test new order creation and signature/recvWindow long. Creates and validates a new order but does not send it into the matching engine.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#test-new-order-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  side: 'BUY' | 'SELL'
   *  type?: 'LIMIT' | 'MARKET'
   *  timeInForce?: 'FOK' | 'GTC' | 'IOC'
   *  quantity?: string
   *  quoteOrderQty?: string
   *  price?: string
   *  newClientOrderId?: string
   *  stopPrice?: string
   *  icebergQty?: string
   *  newOrderRespType?: 'ACK' | 'RESULT' | 'FULL'
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{}> } Empty object
   */
  orderTest: payload => order(privCall, payload, '/api/v3/order/test'),
  /**
   * Send in a new order.
   * 
   * Additional mandatory parameters based on `type`:
   * 
   * | Type                | Additional mandatory parameters                 |
   * | :------------------ | :---------------------------------------------- |
   * | `LIMIT`             | `timeInForce`, `quantity`, `price`              |
   * | `MARKET`            | `quantity` or `quoteOrderQty`                   |
   * | `STOP_LOSS`         | `quantity`, `stopPrice`                         |
   * | `STOP_LOSS_LIMIT`   | `timeInForce`, `quantity`, `price`, `stopPrice` |
   * | `TAKE_PROFIT`       | `quantity`, `stopPrice`                         |
   * | `TAKE_PROFIT_LIMIT` | `timeInForce`, `quantity`, `price`, `stopPrice` |
   * | `LIMIT_MAKER`       | `quantity`, `price`                             |
   * 
   * Other info:
   * - `LIMIT_MAKER` are `LIMIT` orders that will be rejected if they would immediately
   * match and trade as a taker.
   * - `STOP_LOSS` and `TAKE_PROFIT` will execute a MARKET order when the stopPrice is reached.
   * - Any `LIMIT` or `LIMIT_MAKER` type order can be made an iceberg order by sending an `icebergQty`.
   * - Any order with an `icebergQty` **MUST** have `timeInForce` set to `GTC`.
   * - `MARKET` orders using the `quantity` field specifies the amount of the `base asset`
   * the user wants to buy or sell at the market price.
   *    - Using BTCUSDT as an example:
   *        - On the `BUY` side, the order will buy as many BTC as `quoteOrderQty` USDT can.
   *        - On the `SELL` side, the order will sell as much BTC needed to receive `quoteOrderQty` USDT.
   * - `MARKET` orders using `quoteOrderQty` will not break `LOT_SIZE` filter rules; the order will execute
   * a `quantity` that will have the notional value as close as possible to `quoteOrderQty`.
   * - same `newClientOrderId` can be accepted only when the previous one is filled, otherwise the order will be rejected.
   * 
   * Trigger order price rules against market price for both `MARKET` and `LIMIT` versions:
   * - Price above market price: `STOP_LOSS` `BUY`, `TAKE_PROFIT` `SELL`
   * - Price below market price: `STOP_LOSS` `SELL`, `TAKE_PROFIT` `BUY`
   * 
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#new-order-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  side: 'BUY' | 'SELL'
   *  type?: 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT'
   *  | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT' | 'LIMIT_MAKER'
   *  timeInForce?: 'FOK' | 'GTC' | 'IOC'
   *  quantity?: string
   *  quoteOrderQty?: string
   *  price?: string
   *  newClientOrderId?: string
   *  stopPrice?: string
   *  icebergQty?: string
   *  newOrderRespType?: 'ACK' | 'RESULT' | 'FULL'
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "symbol": string
   *  "orderId": number
   *  "orderListId": number
   *  "clientOrderId": string
   *  "transactTime": number
   * }> | Promise<{
   *  "symbol": string
   *  "orderId": number
   *  "orderListId": number
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
   * }> | Promise<{
   *  "symbol": string
   *  "orderId": number
   *  "orderListId": number
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
   *  "fills": [{
   *    "price": string
   *    "qty": string
   *    "commission": string
   *    "commissionAsset": string
   *  }]
   * }>} Response object
   */
  order: payload => order(privCall, payload, '/api/v3/order'),
  /**
   * Cancel an active order.
   * 
   * Either `orderId` or `origClientOrderId` must be sent.
   * @weight 1
   * @http DELETE
   * @see https://binance-docs.github.io/apidocs/spot/en/#cancel-order-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  orderId?: number
   *  origClientOrderId?: string
   *  newClientOrderId?: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "symbol": string
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
   *  "type": 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT'
   *  | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT' | 'LIMIT_MAKER'
   *  "side": 'BUY' | 'SELL'
   * }>} Response object
   */
  cancelOrder: payload =>
    checkParams('authenticated.spot.trade.cancelOrder', payload, ['symbol']) &&
    privCall('/api/v3/order', payload, 'DELETE'),
  /**
   * Cancels all active orders on a symbol.
   * 
   * This includes OCO orders.
   * @weight 1
   * @http DELETE
   * @see https://binance-docs.github.io/apidocs/spot/en/#cancel-all-open-orders-on-a-symbol-trade
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<[{
   *  "symbol": string
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
   * }]>} Array containing cancel order objects
   */
  cancelOpenOrders: payload =>
    checkParams('authenticated.spot.trade.cancelOpenOrders', payload, ['symbol']) &&
    privCall('/api/v3/openOrders', payload, 'DELETE'),
  /**
   * Check an order's status.
   * 
   * Notes:
   * - Either `orderId` or `origClientOrderId` must be sent.
   * - For some historical orders `cummulativeQuoteQty` will be < 0, meaning the data is not available at this time.
   * @weight 2
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#query-order-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  orderId?: number
   *  origClientOrderId?: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "symbol": string
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
   *  "stopPrice": string
   *  "icebergQty": string
   *  "time": number
   *  "updateTime": number
   *  "isWorking": boolean
   *  "origQuoteOrderQty": string
   * }>} Object containing order status
   */
  getOrder: payload =>
    checkParams('authenticated.spot.trade.getOrder', payload, ['symbol']) &&
    privCall('/api/v3/order', payload),
  /**
   * Get all open orders on a symbol. Careful when accessing this with no symbol.
   * 
   * If the symbol is not sent, orders for all symbols will be returned in an array.
   * @weight 3 for a single symbol, **40** when the symbol parameter is omitted
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#current-open-orders-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol?: string
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<[{
   *  "symbol": string
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
   *  "stopPrice": string
   *  "icebergQty": string
   *  "time": number
   *  "updateTime": number
   *  "isWorking": boolean
   *  "origQuoteOrderQty": string
   * }]>} Array containing open order objects
   */
  openOrders: payload => privCall('/api/v3/openOrders', payload),
  /**
   * Get all account orders; active, canceled, or filled.
   * 
   * Notes:
   * - If `orderId` is set, it will get orders >= that `orderId`. Otherwise most recent orders are returned.
   * - For some historical orders `cummulativeQuoteQty` will be < 0, meaning the data is not available at this time.
   * - If `startTime` and/or `endTime` provided, `orderId` is not required.
   * 
   * @weight 10 with symbol
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#all-orders-user_data
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
   * @returns { Promise<[{
   *  "symbol": string
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
   *  "stopPrice": string
   *  "icebergQty": string
   *  "time": number
   *  "updateTime": number
   *  "isWorking": boolean
   *  "origQuoteOrderQty": string
   * }]>} Array containing order objects
   */
  allOrders: payload =>
    checkParams('authenticated.spot.trade.allOrders', payload, ['symbol']) &&
    privCall('/api/v3/allOrders', payload),
  /**
   * Get current account information.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#account-information-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<{
   *  "makerCommission": number
   *  "takerCommission": number
   *  "buyerCommission": number
   *  "sellerCommission": number
   *  "canTrade": boolean
   *  "canWithdraw": boolean
   *  "canDeposit": boolean
   *  "updateTime": number
   *  "accountType": string
   *  "balances": [{
   *    "asset": string
   *    "free": string
   *    "locked": string
   *  }]
   *  "permissions": string[]
   * }>} Object containing account information
   */
  account: payload => privCall('/api/v3/account', payload),
  /**
   * Get trades for a specific account and symbol.
   * 
   * If `fromId` is set, it will get `id` >= that `fromId`.
   * Otherwise most recent trades are returned.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#account-trade-list-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  symbol: string
   *  orderId?: number
   *  startTime?: number
   *  endTime?: number
   *  fromId?: number
   *  limit?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<[{
   *  "symbol": string
   *  "id": number
   *  "orderId": number
   *  "orderListId": number
   *  "price": string
   *  "qty": string
   *  "quoteQty": string
   *  "commission": string
   *  "commissionAsset": string
   *  "time": number
   *  "isBuyer": boolean
   *  "isMaker": boolean
   *  "isBestMatch": boolean
   * }]>} Array containing trade objects
   */
  myTrades: payload =>
    checkParams('authenticated.spot.trade.myTrades', payload, ['symbol']) &&
    privCall('/api/v3/myTrades', payload),
  OCO: authenticatedSpotTradeOCO(privCall)
})

/**
 * 🌊 Spot User Data Streams
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#listen-key-spot
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedSpotUserDataStreams = (privCall) => ({
  /**
   * Start a new user data stream. The stream will close after 60 minutes unless a
   * keepalive is sent. If the account has an active `listenKey`, that `listenKey` will be 
   * returned and its validity will be extended for 60 minutes.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#listen-key-spot
   * @requires APIKEY
   * @requires APISECRET
   * @returns { Promise<{ "listenKey": string }> } Object containing listenKey
   */
  create: () => privCall('/api/v3/userDataStream', null, 'POST', true),
  /**
   * Keepalive a user data stream to prevent a time out. User data streams will close
   * after 60 minutes. It's recommended to send a ping about every 30 minutes.
   * @weight 1
   * @http PUT
   * @see https://binance-docs.github.io/apidocs/spot/en/#listen-key-spot
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ listenKey: string }} payload
   * @returns { Promise<{}> } Empty object
   */
  ping: payload =>
    checkParams('authenticated.spot.userDataStreams.ping', payload, ['listenKey']) &&
    privCall('/api/v3/userDataStream', payload, 'PUT', false, true),
  /**
   * Close out a user data stream.
   * @weight 1
   * @http DELETE
   * @see https://binance-docs.github.io/apidocs/spot/en/#listen-key-spot
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ listenKey: string }} payload
   * @returns { Promise<{}> } Empty object
   */
  close: payload =>
    checkParams('authenticated.spot.userDataStreams.close', payload, ['listenKey']) &&
    privCall('/api/v3/userDataStream', payload, 'DELETE', false, true),
})

/**
 * 💰 Spot Savings Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#savings-endpoints
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedSpotSavings = (privCall) => ({
  flexibleProduct: {
    /**
     * Get flexible product list.
     * @weight 1
     * @http GET
     * @see https://binance-docs.github.io/apidocs/spot/en/#get-flexible-product-list-user_data
     * @requires APIKEY
     * @requires APISECRET
     * @param {{
     *  status?: 'ALL' | 'SUBSCRIBABLE' | 'UNSUBSCRIBABLE'
     *  featured?: 'ALL' | 'TRUE'
     *  current?: number
     *  size?: number
     *  recvWindow?: number
     * }=} payload
     * @returns { Promise<[{
     *  "asset": string
     *  "avgAnnualInterestRate": string
     *  "canPurchase": boolean
     *  "canRedeem": boolean
     *  "dailyInterestPerThousand"?: string
     *  "featured": boolean
     *  "minPurchaseAmount": string
     *  "productId": string
     *  "purchasedAmount": string
     *  "status": string
     *  "upLimit": string
     *  "upLimitPerUser": string
     * }]>} Array containing flexible product list
     */
    list: payload => privCall('/sapi/v1/lending/daily/product/list', payload),
    /**
     * Get left daily purchase quota of flexible product.
     * @weight 1
     * @http GET
     * @see https://binance-docs.github.io/apidocs/spot/en/#get-left-daily-purchase-quota-of-flexible-product-user_data
     * @requires APIKEY
     * @requires APISECRET
     * @param {{
     *  productId: string
     *  recvWindow?: number
     * }} payload
     * @returns { Promise<{
     *  "asset": string
     *  "leftQuota": string
     * }>} Response object
     */
    leftDailyPurchaseQuota: payload =>
      checkParams('authenticated.spot.savings.flexibleProduct.leftDailyPurchaseQuota', payload, ['productId']) &&
      privCall('/sapi/v1/lending/daily/userLeftQuota', payload),
    /**
     * Purchase flexible product.
     * @weight 1
     * @http POST
     * @see https://binance-docs.github.io/apidocs/spot/en/#purchase-flexible-product-user_data
     * @requires APIKEY
     * @requires APISECRET
     * @param {{
     *  productId: string
     *  amount: string
     *  recvWindow?: number
     * }} payload
     * @returns { Promise<string> } purchaseId
     */
    purchase: payload =>
      checkParams('authenticated.spot.savings.flexibleProduct.purchase', payload, [ 'productId', 'amount' ]) &&
      privCall('/sapi/v1/lending/daily/purchase', payload, 'POST').then(r => r.purchaseId),
    /**
     * Get left daily redemption quota of flexible product.
     * @weight 1
     * @http GET
     * @see https://binance-docs.github.io/apidocs/spot/en/#get-left-daily-redemption-quota-of-flexible-product-user_data
     * @requires APIKEY
     * @requires APISECRET
     * @param {{
     *  productId: string
     *  type: 'FAST' | 'NORMAL'
     *  recvWindow?: number
     * }} payload
     * @returns { Promise<{
     *  "asset": string
     *  "dailyQuota": string
     *  "leftQuota": string
     *  "minRedemptionAmount": string
     * }>} Response object
     */
    leftDailyRedemptionQuota: payload =>
      checkParams('authenticated.spot.savings.flexibleProduct.leftDailyRedemptionQuota', payload, [ 'productId', 'type' ]) &&
      privCall('/sapi/v1/lending/daily/userRedemptionQuota', payload),
    /**
     * Redeem flexible product.
     * @weight 1
     * @http POST
     * @see https://binance-docs.github.io/apidocs/spot/en/#redeem-flexible-product-user_data
     * @requires APIKEY
     * @requires APISECRET
     * @param {{
     *  productId: string
     *  amount: string
     *  type: 'FAST' | 'NORMAL'
     *  recvWindow?: number
     * }} payload
     * @returns { Promise<{}> } Empty object
     */
    redeem: payload =>
      checkParams('authenticated.spot.savings.flexibleProduct.redeem', payload, [ 'productId', 'amount', 'type' ]) &&
      privCall('/sapi/v1/lending/daily/redeem', payload, 'POST'),
    /**
     * Get flexible product position.
     * @weight 1
     * @http GET
     * @see https://binance-docs.github.io/apidocs/spot/en/#get-flexible-product-position-user_data
     * @requires APIKEY
     * @requires APISECRET
     * @param {{
     *  asset: string
     *  recvWindow?: number
     * }} payload
     * @returns { Promise<[{
     *  "annualInterestRate": string
     *  "asset": string
     *  "avgAnnualInterestRate": string
     *  "canRedeem": boolean
     *  "dailyInterestRate": string
     *  "freeAmount": string
     *  "freezeAmount": string
     *  "lockedAmount": string
     *  "productId": string
     *  "productName": string
     *  "redeemingAmount": string
     *  "todayPurchasedAmount": string
     *  "totalAmount": string
     *  "totalInterest": string
     * }]>} Array containing flexible product position(s)
     */
    position: payload =>
      checkParams('authenticated.spot.savings.flexibleProduct.position', payload, ['asset']) &&
      privCall('/sapi/v1/lending/daily/token/position', payload),
  },
  fixedActivityProject: {
    /**
     * Get fixed and activity project list.
     * @weight 1
     * @http GET
     * @see https://binance-docs.github.io/apidocs/spot/en/#get-fixed-and-activity-project-list-user_data
     * @requires APIKEY
     * @requires APISECRET
     * @param {{
     *  asset?: string
     *  type: 'ACTIVITY' | 'CUSTOMIZED_FIXED'
     *  status?: 'ALL' | 'SUBSCRIBABLE' | 'UNSUBSCRIBABLE'
     *  isSortAsc?: boolean
     *  sortBy?: 'START_TIME' | 'LOT_SIZE' | 'INTEREST_RATE' | 'DURATION'
     *  current?: number
     *  size?: number
     *  recvWindow?: number
     * }} payload
     * @returns { Promise<[{
     *  "asset": string
     *  "displayPriority": number
     *  "duration": number
     *  "interestPerLot": string
     *  "interestRate": string
     *  "lotSize": string
     *  "lotsLowLimit": number
     *  "lotsPurchased": number
     *  "lotsUpLimit": number
     *  "maxLotsPerUser": number
     *  "needKyc": boolean
     *  "projectId": string
     *  "projectName": string
     *  "status": string
     *  "type": 'ACTIVITY' | 'CUSTOMIZED_FIXED'
     *  "withAreaLimitation": boolean
     * }]>} Array containing fixed and activity project list
     */
    list: payload =>
      checkParams('authenticated.spot.savings.fixedActivityProject.list', payload, ['type']) &&
      privCall('/sapi/v1/lending/project/list', payload),
    /**
     * Purchase fixed/activity project.
     * @weight 1
     * @http POST
     * @see https://binance-docs.github.io/apidocs/spot/en/#purchase-flexible-product-user_data
     * @requires APIKEY
     * @requires APISECRET
     * @param {{
     *  productId: string
     *  lot: number
     *  amount: string
     *  recvWindow?: number
     * }} payload
     * @returns { Promise<string> } purchaseId
     */
    purchase: payload =>
      checkParams('authenticated.spot.savings.fixedActivityProject.purchase', payload, [ 'projectId', 'lot' ]) &&
      privCall('/sapi/v1/lending/customizedFixed/purchase', payload, 'POST').then(r => r.purchaseId),
    /**
     * Get fixed/activity project position.
     * @weight 1
     * @http GET
     * @see https://binance-docs.github.io/apidocs/spot/en/#get-flexible-product-position-user_data
     * @requires APIKEY
     * @requires APISECRET
     * @param {{
     *  asset: string
     *  projectId?: string
     *  status: 'HOLDING' | 'REDEEMED'
     *  recvWindow?: number
     * }} payload
     * @returns { Promise<[{
     *  "asset": string
     *  "canTransfer": boolean
     *  "createTimestamp": number
     *  "duration": number
     *  "endTime": number
     *  "interest": string
     *  "interestRate": string
     *  "lot": number
     *  "positionId": number
     *  "principal": string
     *  "projectId": string
     *  "projectName": string
     *  "purchaseTime": number
     *  "redeemDate": string
     *  "startTime": number
     *  "status": 'HOLDING' | 'REDEEMED'
     *  "type": 'ACTIVITY' | 'CUSTOMIZED_FIXED'
     * }]>} Array containing fixed/activity project position(s)
     */
    position: payload =>
      checkParams('authenticated.spot.savings.fixedActivityProject.position', payload, ['asset']) &&
      privCall('/sapi/v1/lending/project/position/list', payload),
  },
  /**
   * Get lending account details.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#lending-account-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<{
   *  "positionAmountVos": [{
   *    "amount": string
   *    "amountInBTC": string
   *    "amountInUSDT": string
   *    "asset": string
   *  }]
   *  "totalAmountInBTC": string
   *  "totalAmountInUSDT": string
   *  "totalFixedAmountInBTC": string
   *  "totalFixedAmountInUSDT": string
   *  "totalFlexibleInBTC": string
   *  "totalFlexibleInUSDT": string
   * }>} Object containing lending account details
   */
  lendingAccount: payload => privCall('/sapi/v1/lending/union/account', payload),
  /**
   * Get purchase record.
   * - The time between `startTime` and `endTime` cannot be longer than 30 days.
   * - If `startTime` and `endTime` are both not sent, then the last 30 days' data will be returned.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-purchase-record-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  lendingType: 'DAILY' | 'ACTIVITY' | 'CUSTOMIZED_FIXED'
   *  asset?: string
   *  startTime?: number
   *  endTime?: number
   *  current?: number
   *  size?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<[{
   *  "amount": string
   *  "asset": string
   *  "createTime": number
   *  "lendingType": 'DAILY' | 'ACTIVITY' | 'CUSTOMIZED_FIXED'
   *  "productName": string
   *  "purchaseId": string
   *  "status": string
   * }]> | Promise<[{
   *  "amount": string
   *  "asset": string
   *  "createTime": number
   *  "lendingType": 'DAILY' | 'ACTIVITY' | 'CUSTOMIZED_FIXED'
   *  "lot": string
   *  "productName": string
   *  "purchaseId": number
   *  "status": string
   * }]>} Array containing purchase record
   */
  purchaseRecord: payload =>
    checkParams('authenticated.spot.savings.purchaseRecord', payload, ['lendingType']) &&
    privCall('/sapi/v1/lending/union/purchaseRecord', payload),
  /**
   * Get redemption record.
   * - The time between `startTime` and `endTime` cannot be longer than 30 days.
   * - If `startTime` and `endTime` are both not sent, then the last 30 days' data will be returned.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-redemption-record-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  lendingType: 'DAILY' | 'ACTIVITY' | 'CUSTOMIZED_FIXED'
   *  asset?: string
   *  startTime?: number
   *  endTime?: number
   *  current?: number
   *  size?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<[{
   *  "amount": string
   *  "asset": string
   *  "createTime": number
   *  "principal": string
   *  "projectId": string
   *  "projectName": string
   *  "status": string
   *  "type": 'FAST' | 'NORMAL'
   * }]> | Promise<[{
   *  "amount": string
   *  "asset": string
   *  "createTime": number
   *  "interest": string
   *  "principal": string
   *  "projectId": number
   *  "projectName": string
   *  "startTime": number
   *  "status": string
   * }]>} Array containing redemption record
   */
  redemptionRecord: payload =>
    checkParams('authenticated.spot.savings.redemptionRecord', payload, ['lendingType']) &&
    privCall('/sapi/v1/lending/union/redemptionRecord', payload),
  /**
   * Get interest history.
   * - The time between `startTime` and `endTime` cannot be longer than 30 days.
   * - If `startTime` and `endTime` are both not sent, then the last 30 days' data will be returned.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-interest-history-user_data-2
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  lendingType: 'DAILY' | 'ACTIVITY' | 'CUSTOMIZED_FIXED'
   *  asset?: string
   *  startTime?: number
   *  endTime?: number
   *  current?: number
   *  size?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<[{
   *  "asset": string
   *  "interest": string
   *  "lendingType": string
   *  "productName": string
   *  "time": number
   * }]>} Array containing redemption record
   */
  interestHistory: payload =>
    checkParams('authenticated.spot.savings.interestHistory', payload, ['lendingType']) &&
    privCall('/sapi/v1/lending/union/interestHistory', payload),
  /**
   * Change fixed/activity position to daily position.
   * - `positionId` is mandatory parameter for fixed position.
   * @weight 1
   * @http POST
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-interest-history-user_data-2
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  projectId: string
   *  lot: number
   *  positionId?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "dailyPurchaseId": number
   *  "success": boolean
   *  "time": number
   * }>} Response object
   */
  changeToDailyPosition: payload =>
    checkParams('authenticated.spot.savings.changeToDailyPosition', payload, [ 'projectId', 'lot' ]) &&
    privCall('/sapi/v1/lending/positionChanged', payload, 'POST')
})

/**
 * ⛏️ Spot Mining Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#mining-endpoints
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 * @param { (path: any, data: any, method?: string) => Promise<any> } kCall
 */
export const authenticatedSpotMining = (privCall, kCall) => ({
  /**
   * Acquiring algorithm.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#acquiring-algorithm-market_data
   * @requires APIKEY
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<{
   *  "code": number
   *  "msg": string
   *  "data": [{
   *    "algoName": string
   *    "algoId": number
   *    "poolIndex": number
   *    "unit": string
   *  }]
   * }>} Response object
   */
  acquiringAlgorithm: payload => kCall('/sapi/v1/mining/pub/algoList', payload),
  /**
   * Acquiring coin name.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#acquiring-coinname-market_data
   * @requires APIKEY
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<{
   *  "code": number
   *  "msg": string
   *  "data": [{
   *    "coinName": string
   *    "coinId": number
   *    "poolIndex": number
   *    "algoId": number
   *    "algoName": string
   *  }]
   * }>} Response object
   */
  acquiringCoinName: payload => kCall('/sapi/v1/mining/pub/coinList', payload),
  /**
   * Request for detailed miner list.
   * @weight 5
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#request-for-detail-miner-list-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  algo: string
   *  userName: string
   *  workerName: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "code": number
   *  "msg": string
   *  "data": [{
   *    "workerName": string
   *    "type": string
   *    "hashrateDatas": [{
   *      "time": number
   *      "hashrate": string
   *      "reject": number
   *    }]
   *  }]
   * }>} Response object
   */
  detailedMinerList: payload =>
    checkParams('authenticated.spot.mining.detailedMinerList', payload, [ 'algo', 'userName', 'workerName' ]) &&
    privCall('/sapi/v1/mining/worker/detail', payload),
  /**
   * Request for miner list.
   * @weight 5
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#request-for-miner-list-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  algo: string
   *  userName: string
   *  pageIndex?: number
   *  sort?: 0 | 1
   *  sortColumn?: 1 | 2 | 3 | 4 | 5
   *  workerStatus?: 0 | 1 | 2 | 3 
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "code": number
   *  "msg": string
   *  "data": [{
   *    "workerDatas": [{
   *      "workerId": string
   *      "workerName": string
   *      "status": number
   *      "hashRate": number
   *      "dayHashRate": number
   *      "rejectRate": number
   *      "lastShareTime": number
   *    }]
   *    "totalNum": number
   *    "pageSize": number
   *  }]
   * }>} Response object
   */
  minerList: payload =>
    checkParams('authenticated.spot.mining.minerList', payload, [ 'algo', 'userName' ]) &&
    privCall('/sapi/v1/mining/worker/list', payload),
  /**
   * Fetch earnings list.
   * @weight 5
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#earnings-list-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  algo: string
   *  userName: string
   *  coin?: string
   *  startDate?: number
   *  endDate?: number
   *  pageIndex?: number
   *  pageSize?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "code": number
   *  "msg": string
   *  "data": [{
   *    "accountProfits": [{
   *      "time": number
   *      "type": 0 | 5 | 7 | 8 | 31 | 32 | 33
   *      "hashTransfer": any
   *      "transferAmount": any
   *      "dayHashRate": number
   *      "profitAmount": number
   *      "coinName": string
   *      "status": 0 | 1 | 2
   *    }]
   *    "totalNum": number
   *    "pageSize": number
   *  }]
   * }>} Response object containing earnings list
   */
  earningsList: payload =>
    checkParams('authenticated.spot.mining.earningsList', payload, [ 'algo', 'userName' ]) &&
    privCall('/sapi/v1/mining/payment/list', payload),
  /**
   * Fetch extra bonus list.
   * @weight 5
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#extra-bonus-list-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  algo: string
   *  userName: string
   *  coin?: string
   *  startDate?: number
   *  endDate?: number
   *  pageIndex?: number
   *  pageSize?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "code": number
   *  "msg": string
   *  "data": [{
   *    "otherProfits": [{
   *      "time": number
   *      "coinName": string
   *      "type": 1 | 2 | 3 | 4 | 6 | 7
   *      "profitAmount": number
   *      "status": 0 | 1 | 2
   *    }]
   *    "totalNum": number
   *    "pageSize": number
   *  }]
   * }>} Response object containing extra bonus list
   */
  extraBonusList: payload =>
    checkParams('authenticated.spot.mining.extraBonusList', payload, [ 'algo', 'userName' ]) &&
    privCall('/sapi/v1/mining/payment/other', payload),
  hashrateResale: {
    /**
     * Fetch hashrate resale list.
     * @weight 5
     * @http GET
     * @see https://binance-docs.github.io/apidocs/spot/en/#hashrate-resale-list-user_data
     * @requires APIKEY
     * @requires APISECRET
     * @param {{
     *  pageIndex?: number
     *  pageSize?: number
     *  recvWindow?: number
     * }=} payload
     * @returns { Promise<{
     *  "code": number
     *  "msg": string
     *  "data": {
     *    "configDetails": [{
     *      "configId": number
     *      "poolUsername": string
     *      "toPoolUsername": string
     *      "algoName": string
     *      "hashRate": number
     *      "startDay": number
     *      "endDay": number
     *      "status": 0 | 1 | 2
     *    }]
     *    "totalNum": number
     *    "pageSize": number
     *  }
     * }>} Response object containing hashrate resale list
     */
    list: payload => privCall('/sapi/v1/mining/hash-transfer/config/details/list', payload),
    /**
     * Fetch hashrate resale detail.
     * @weight 5
     * @http GET
     * @see https://binance-docs.github.io/apidocs/spot/en/#hashrate-resale-detail-user_data
     * @requires APIKEY
     * @requires APISECRET
     * @param {{
     *  configId: number
     *  userName: string
     *  pageIndex?: number
     *  pageSize?: number
     *  recvWindow?: number
     * }} payload
     * @returns { Promise<{
     *  "code": number
     *  "msg": string
     *  "data": {
     *    "profitTransferDetails": [{
     *      "poolUsername": string
     *      "toPoolUsername": string
     *      "algoName": string
     *      "hashRate": number
     *      "day": number
     *      "amount": number
     *      "coinName": string
     *    }]
     *    "totalNum": number
     *    "pageSize": number
     *  }
     * }>} Response object containing hashrate resale details
     */
    detail: payload =>
      checkParams('authenticated.spot.mining.hashrateResale.detail', payload, [ 'configId', 'userName' ]) &&
      privCall('/sapi/v1/mining/hash-transfer/profit/details', payload),
    /**
     * Request hash resale.
     * @weight 5
     * @http POST
     * @see https://binance-docs.github.io/apidocs/spot/en/#hashrate-resale-request-user_data
     * @requires APIKEY
     * @requires APISECRET
     * @param {{
     *  userName: string
     *  algo: string
     *  endDate: number
     *  startDate: number
     *  toPoolUser: string
     *  hashRate: number
     *  recvWindow?: number
     * }} payload
     * @returns { Promise<{
     *  "code": number
     *  "msg": string
     *  "data": number
     * }>} Response object
     */
    request: payload =>
      checkParams('authenticated.spot.mining.hashrateResale.request', payload, [ 'userName', 'algo', 'endDate', 'startDate', 'toPoolUser', 'hashRate' ]) &&
      privCall('/sapi/v1/mining/hash-transfer/config', payload, 'POST'),
    /**
     * Cancel hashrate resale configuration.
     * @weight 5
     * @http POST
     * @see https://binance-docs.github.io/apidocs/spot/en/#cancel-hashrate-resale-configuration-user_data
     * @requires APIKEY
     * @requires APISECRET
     * @param {{
     *  configId: number
     *  userName: string
     *  recvWindow?: number
     * }} payload
     * @returns { Promise<{
     *  "code": number
     *  "msg": string
     *  "data": boolean
     * }>} Response object
     */
    cancelConfiguration: payload =>
      checkParams('authenticated.spot.mining.hashrateResale.cancelConfiguration', payload, [ 'configId', 'userName' ]) &&
      privCall('/sapi/v1/mining/hash-transfer/config/cancel', payload, 'POST'),
  },
  /**
   * Fetch static list.
   * @weight 5
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#statistic-list-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  algo: string
   *  userName: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "code": number
   *  "msg": string
   *  "data": {
   *    "fifteenMinHashRate": string
   *    "dayHashRate": string
   *    "validNum": number
   *    "invalidNum": number
   *    "profitToday": { [ symbol: string ]: string }
   *    "profitYesterday": { [ symbol: string ]: string }
   *    "userName": string
   *    "unit": string
   *    "algo": string
   *  }
   * }>} Response object containing static list
   */
  staticList: payload =>
    checkParams('authenticated.spot.mining.staticList', payload, [ 'algo', 'userName' ]) &&
    privCall('/sapi/v1/mining/statistics/user/status', payload),
  /**
   * Fetch account list.
   * @weight 5
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#statistic-list-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  algo: string
   *  userName: string
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
   *  "code": number
   *  "msg": string
   *  "data": {
   *    "type": string
   *    "userName": string
   *    "list": [{
   *      "time": number
   *      "hashrate": string
   *      "reject": string
   *    }]
   *  }
   * }>} Response object containing account list
   */
  accountList: payload =>
    checkParams('authenticated.spot.mining.accountList', payload, [ 'algo', 'userName' ]) &&
    privCall('/sapi/v1/mining/statistics/user/list', payload),
})

/**
 * 📜 Spot Futures Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#futures
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedSpotFutures = (privCall) => ({
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
   * }} payload
   * @returns { Promise<number> } tranId
   */
  transfer: payload =>
    checkParams('authenticated.spot.futures.transfer', payload, [ 'asset', 'amount', 'type' ]) &&
    privCall('/sapi/v1/futures/transfer', payload, 'POST').then(r => r.tranId),
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
   * }} payload
   * @returns { Promise<{
   *  "rows": [{
   *    "asset": string
   *    "tranId": number
   *    "amount": string
   *    "type": 1 | 2 | 3 | 4
   *    "timestamp": number
   *    "status": 'PENDING' | 'CONFIRMED' | 'FAILED'
   *  }]
   *  "total": number
   * }>} Object containing transaction history list
   */
  transactionHistoryList: payload =>
    checkParams('authenticated.spot.futures.transactionHistoryList', payload, [ 'asset', 'startTime' ]) &&
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
   * }} payload
   * @returns { Promise<{
   *  "coin": string
   *  "amount": string
   *  "collateralCoin": string
   *  "collateralAmount": string
   *  "time": number
   *  "borrowId": string
   * }>} Object containing borrow result
   */
  crossCollateralBorrow: payload =>
    checkParams('authenticated.spot.futures.crossCollateralBorrow', payload, [ 'coin', 'collateralCoin' ]) &&
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
   * }=} payload
   * @returns { Promise<{
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
   * }>} Object containing borrow history list
   */
  crossCollateralBorrowHistory: payload => privCall('/sapi/v1/futures/loan/borrow/history', payload),
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
   * }} payload
   * @returns { Promise<{
   *  "coin": string
   *  "amount": string
   *  "collateralCoin": string
   *  "repayId": string
   * }>} Object containing repayment status
   */
  crossCollateralRepay: payload =>
    checkParams('authenticated.spot.futures.crossCollateralRepay', payload, [ 'coin', 'collateralCoin', 'amount' ]) &&
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
   * }=} payload
   * @returns { Promise<{
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
   * }>} Object containing repayment history list
   */
  crossCollateralRepayHistory: payload => privCall('/sapi/v1/futures/loan/repay/history', payload),
  /**
   * Cross-collateral wallet.
   * @weight 10
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#cross-collateral-wallet-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<{
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
   * }>} Object containing cross-collateral wallet
   */
  crossCollateralWallet: payload => privCall('/sapi/v1/futures/loan/wallet', payload),
  /**
   * Cross-collateral wallet V2.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#cross-collateral-wallet-v2-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{ recvWindow: number }=} payload
   * @returns { Promise<{
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
   * }>} Object containing cross-collateral wallet V2
   */
  crossCollateralWalletV2: payload => privCall('/sapi/v2/futures/loan/wallet', payload),
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
   * }=} payload
   * @returns { Promise<[{
   *  "collateralCoin": string
   *  "rate": string
   *  "marginCallCollateralRate": string
   *  "liquidationCollateralRate": string
   *  "currentCollateralRate": string
   *  "interestRate"?: string
   *  "interestGracePeriod": string
   *  "loanCoin": string
   * }]>} Array of cross-collateral information objects
   */
  crossCollateralInformation: payload => privCall('/sapi/v1/futures/loan/configs', payload),
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
   * }=} payload
   * @returns { Promise<[{
   *  "loanCoin": string
   *  "collateralCoin": string
   *  "rate": string
   *  "marginCallCollateralRate": string
   *  "liquidationCollateralRate": string
   *  "currentCollateralRate": string
   *  "interestRate"?: string
   *  "interestGracePeriod": string
   * }]>} Array of cross-collateral information V2 objects
   */
  crossCollateralInformationV2: payload => privCall('/sapi/v2/futures/loan/configs', payload),
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
   * }} payload
   * @returns { Promise<string> } afterCollateralRate
   */
  crossCollateralCalculateRateAfterAdjust: payload =>
    checkParams('authenticated.spot.futures.crossCollateralCalculateRateAfterAdjust', payload, [ 'collateralCoin', 'amount', 'direction' ]) &&
    privCall('/sapi/v1/futures/loan/calcAdjustLevel', payload).then(r => r.afterCollateralRate),
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
   * }} payload
   * @returns { Promise<string> } afterCollateralRate
   */
  crossCollateralCalculateRateAfterAdjustV2: payload =>
    checkParams('authenticated.spot.futures.crossCollateralCalculateRateAfterAdjustV2', payload, [ 'loanCoin', 'collateralCoin', 'amount', 'direction' ]) &&
    privCall('/sapi/v2/futures/loan/calcAdjustLevel', payload).then(r => r.afterCollateralRate),
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
   * }} payload
   * @returns { Promise<{
   *  "maxInAmount": string
   *  "maxOutAmount": string
   * }>} Response object
   */
  crossCollateralMaxAdjustAmount: payload =>
    checkParams('authenticated.spot.futures.crossCollateralMaxAdjustAmount', payload, [ 'collateralCoin' ]) &&
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
   * }} payload
   * @returns { Promise<{
   *  "maxInAmount": string
   *  "maxOutAmount": string
   * }>} Response object
   */
  crossCollateralMaxAdjustAmountV2: payload =>
    checkParams('authenticated.spot.futures.crossCollateralMaxAdjustAmountV2', payload, [ 'loanCoin', 'collateralCoin' ]) &&
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
   * }} payload
   * @returns { Promise<{
   *  "collateralCoin": string
   *  "direction": 'ADDITIONAL' | 'REDUCED'
   *  "amount": string
   *  "time": number
   * }>} Response object
   */
  adjustCrossCollateral: payload =>
    checkParams('authenticated.spot.futures.adjustCrossCollateral', payload, [ 'collateralCoin', 'amount', 'direction' ]) &&
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
   * }} payload
   * @returns { Promise<{
   *  "loanCoin": string
   *  "collateralCoin": string
   *  "direction": 'ADDITIONAL' | 'REDUCED'
   *  "amount": string
   *  "time": number
   * }>} Response object
   */
  adjustCrossCollateralV2: payload =>
    checkParams('authenticated.spot.futures.adjustCrossCollateralV2', payload, [ 'loanCoin', 'collateralCoin', 'amount', 'direction' ]) &&
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
   * }=} payload
   * @returns { Promise<{
   *  "rows": [{
   *    "amount": string
   *    "collateralCoin": string
   *    "coin": string
   *    "preCollateralRate": string
   *    "afterCollateralRate": string
   *    "direction": 'ADDITIONAL' | 'REDUCED'
   *    "status": string
   *    "adjustTime": number
   *  }]
   *  "total": number
   * }>} Object containing adjust cross-collateral LTV history list
   */
  adjustCrossCollateralHistory: payload => privCall('/sapi/v1/futures/loan/adjustCollateral/history', payload),
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
   * }=} payload
   * @returns { Promise<{
   *  "rows": [{
   *    "collateralAmountForLiquidation": string
   *    "collateralCoin": string
   *    "forceLiquidationStartTime": number
   *    "coin": string
   *    "restCollateralAmountAfterLiquidation": string
   *    "restLoanAmount": string
   *    "status": 'PENDING' | 'CONFIRMED' | 'FAILED'
   *  }]
   *  "total": number
   * }>} Object containing cross-collateral liquidation history list
   */
  crossCollateralLiquidationHistory: payload => privCall('/sapi/v1/futures/loan/liquidationHistory', payload),
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
   * }} payload
   * @returns { Promise<{
   *  "coin": string
   *  "collateralCoin": string
   *  "max": string
   *  "min": string
   * }>} Object containing collateral repay limit
   */
  collateralRepayLimit: payload =>
    checkParams('authenticated.spot.futures.collateralRepayLimit', payload, [ 'coin', 'collateralCoin' ]) &&
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
   * }} payload
   * @returns { Promise<{
   *  "coin": string
   *  "collateralCoin": string
   *  "amount": string
   *  "quoteId": string
   * }>} Object containing collateral repay quote.
   */
  getCollateralRepayQuote: payload =>
    checkParams('authenticated.spot.futures.getCollateralRepayQuote', payload, [ 'coin', 'collateralCoin', 'amount' ]) &&
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
   * }} payload
   * @returns { Promise<{
   *  "coin": string
   *  "collateralCoin": string
   *  "amount": string
   *  "quoteId": string
   * }>} Object containing collateral repay receipt
   */
  collateralRepay: payload =>
    checkParams('authenticated.spot.futures.collateralRepay', payload, [ 'quoteId' ]) &&
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
   * }} payload
   * @returns { Promise<{
   *  "quoteId": string
   *  "status": string
   * }>} Object containing collateral repayment result
   */
  collateralRepaymentResult: payload =>
    checkParams('authenticated.spot.futures.collateralRepaymentResult', payload, [ 'quoteId' ]) &&
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
   * }=} payload
   * @returns { Promise<{
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
   * }>} Object containing cross-collateral interest history list
   */
  crossCollateralInterestHistory: payload => privCall('/sapi/v1/futures/loan/interestHistory', payload)
})

/**
 * 🪙 Spot BLVT Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#blvt-endpoints
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 * @param { (path: any, data: any, method?: string) => Promise<any> } kCall
 */
export const authenticatedSpotBLVT = (privCall, kCall) => ({
  /**
   * Get BLVT Info.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-blvt-info-market_data
   * @requires APIKEY
   * @param {{ tokenName: string }=} payload
   * @returns { Promise<[{
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
   * }]>} Array of token info objects
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
   * }} payload
   * @returns { Promise<{
   *  "id": number
   *  "status": string
   *  "tokenName": string
   *  "amount": string
   *  "cost": string
   *  "timestamp": number
   * }>} Object containing BLVT subscription
   */
  subscribe: payload =>
    checkParams('authenticated.spot.BLVT.subscribe', payload, [ 'tokenName', 'cost' ]) &&
    privCall('/sapi/v1/blvt/subscribe', payload, 'POST'),
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
   * }=} payload
   * @returns { Promise<[{
   *  "id": number
   *  "tokenName": string
   *  "amount": number
   *  "nav": string
   *  "fee": string
   *  "totalCharge": string
   *  "timestamp": number
   * }]>} Array of subscription records
   */
  getSubscriptionRecord: payload => privCall('/sapi/v1/blvt/subscribe/record', payload),
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
   * }} payload
   * @returns { Promise<{
   *  "id": number
   *  "status": 'S' | 'P' | 'F'
   *  "tokenName": string
   *  "redeemAmount": string
   *  "amount": string
   *  "timestamp": number
   * }>} Object containing redeem BLVT
   */
  redeem: payload =>
    checkParams('authenticated.spot.BLVT.redeem', payload, [ 'tokenName', 'amount' ]) &&
    privCall('/sapi/v1/blvt/redeem', payload, 'POST'),
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
   * }=} payload
   * @returns { Promise<[{
   *  "id": number
   *  "tokenName": string
   *  "amount": number
   *  "nav": string
   *  "fee": string
   *  "netProceed": string
   *  "timestamp": number
   * }]>} Array of redemption records
   */
  getRedemptionRecord: payload => privCall('/sapi/v1/blvt/redeem/record', payload),
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
   * }=} payload
   * @returns { Promise<[{
   *  "tokenName": string
   *  "userDailyTotalPurchaseLimit": string
   *  "userDailyTotalRedeemLimit": string
   * }]>} Array of BLVT user limit info objects
   */
  userLimit: payload => privCall('/sapi/v1/blvt/userLimit', payload),
})

/**
 * 💱 Spot BSwap Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#bswap-endpoints
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 * @param { (path: any, data: any, method?: string) => Promise<any> } kCall
 */
export const authenticatedSpotBSwap = (privCall, kCall) => ({
  /**
   * Get metadata about all swap pools.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#list-all-swap-pools-market_data
   * @requires APIKEY
   * @returns { Promise<[{
   *  "poolId": number
   *  "poolName": string
   *  "assets": [ string, string ]
   * }]>} Array of swap pool metadata objects
   */
  getPools: () => kCall('/sapi/v1/bswap/pools'),
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
   * }=} payload
   * @returns { Promise<[{
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
   * }]>} Array of swap pool metadata objects
   */
  getLiquidity: payload => privCall('/sapi/v1/bswap/liquidity', payload),
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
   * }} payload
   * @returns { Promise<number> } operationId
   */
  addLiquidity: payload =>
    checkParams('authenticated.spot.BSWap.addLiquidity', payload, [ 'poolId', 'asset', 'quantity' ]) &&
    privCall('/sapi/v1/bswap/liquidityAdd', payload, 'POST').then(r => r.operationId),
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
   * }} payload
   * @returns { Promise<number> } operationId
   */
  removeLiquidity: payload =>
    checkParams('authenticated.spot.BSWap.removeLiquidity', payload, [ 'poolId', 'type', 'shareAmount' ]) &&
    privCall('/sapi/v1/bswap/liquidityRemove', payload, 'POST').then(r => r.operationId),
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
   * }=} payload
   * @returns { Promise<[{
   *  "operationId": number
   *  "poolId": number
   *  "poolName": string
   *  "operation": 'ADD' | 'REMOVE'
   *  "status": 0 | 1 | 2
   *  "updateTime": number
   *  "shareAmount": string
   * }]>} Array of liquidity operation record objects
   */
  getLiquidityOperationRecords: payload => privCall('/sapi/v1/bswap/liquidityOps', payload),
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
   * }} payload
   * @returns { Promise<{
   *  "quoteAsset": string
   *  "baseAsset": string
   *  "quoteQty": number
   *  "baseQty": number
   *  "price": number
   *  "slippage": number
   *  "fee": number
   * }>} Object containing quote
   */
  requestQuote: payload =>
    checkParams('authenticated.spot.BSWap.requestQuote', payload, [ 'quoteAsset', 'baseAsset', 'quoteQty' ]) &&
    privCall('/sapi/v1/bswap/quote', payload),
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
   * }} payload 
   * @returns { Promise<number> } swapID
   */
  swap: payload =>
    checkParams('authenticated.spot.BSWap.swap', payload, [ 'quoteAsset', 'baseAsset', 'quoteQty' ]) &&
    privCall('/sapi/v1/bswap/swap', payload, 'POST').then(r => r.swapID),
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
   * }=} payload 
   * @returns { Promise<[{
   *  "swapID": number
   *  "swapTime": number
   *  "status": 0 | 1 | 2
   *  "quoteAsset": string
   *  "baseAsset": string
   *  "quoteQty": number
   *  "baseQty": number
   *  "price": number
   *  "fee": number
   * }]>} Array of swap objects
   */
  swapHistory: payload => privCall('/sapi/v1/bswap/swap', payload),
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
   * }=} payload 
   * @returns { Promise<[{
   *  "poolId": number
   *  "poolName": string
   *  "updateTime": number
   *  "liquidity": {
   *    "constantA": number | "NA"
   *    "minRedeemShare": number
   *    "slippageTolerance": number
   *  }
   *  "assetConfigure": {
   *    [ key: string ]: {
   *      "minAdd": number
   *      "maxAdd": number
   *      "minSwap": number
   *      "maxSwap": number
   *    }
   *  }
   * }]>} Array containing pool configuration
   */
  getPoolConfigure: payload => privCall('/sapi/v1/bswap/poolConfigure', payload),
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
   * }} payload 
   * @returns { Promise<{
   *  "quoteAsset": string
   *  "baseAsset": string
   *  "quoteAmt": number
   *  "baseAmt": number
   *  "price": number
   *  "share": number
   *  "slippage": number
   *  "fee": number
   * }>} Object containing liquidity preview
   */
  addLiquidityPreview: payload =>
    checkParams('authenticated.spot.BSWap.addLiquidityPreview', payload, [ 'poolId', 'type', 'quoteAsset', 'quoteQty' ]) &&
    privCall('/sapi/v1/bswap/addLiquidityPreview', payload),
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
   * }} payload 
   * @returns { Promise<{
   *  "quoteAsset": string
   *  "baseAsset": string
   *  "quoteAmt": number
   *  "baseAmt": number
   *  "price": number
   *  "slippage": number
   *  "fee": number
   * }>} Object containing liquidity preview
   */
  removeLiquidityPreview: payload =>
    checkParams('authenticated.spot.BSWap.removeLiquidityPreview', payload, [ 'poolId', 'type', 'quoteAsset', 'shareAmount' ]) &&
    privCall('/sapi/v1/bswap/removeLiquidityPreview', payload),
})

/**
 * 💵 Spot Fiat Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#fiat-endpoints
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedSpotFiat = (privCall) => ({
  /**
   * Get fiat deposit/withdraw history.
   * - `transactionType`: `'0'` = deposit, `'1'` = withdraw
   * If `beginTime` and `endTime` are not sent, the recent 30-day data will be returned.
   * @weight 1
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-fiat-deposit-withdraw-history-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  transactionType: '0' | '1'
   *  beginTime?: number
   *  endTime?: number
   *  page?: number
   *  rows?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<{
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
   * }>} Object containing fiat deposit/withdraw history
   */
  getOrderHistory: payload =>
    checkParams('authenticated.spot.fiat.getOrderHistory', payload, ['transactionType']) &&
    privCall('/sapi/v1/fiat/orders', payload),
  /**
   * Get fiat payments history.
   * - `transactionType`: `'0'` = buy, `'1'` = sell
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
   * }} payload
   * @returns { Promise<{
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
   * }>} Object containing fiat payments history
   */
  getPaymentHistory: payload =>
    checkParams('authenticated.spot.fiat.getPaymentHistory', payload, ['transactionType']) &&
    privCall('/sapi/v1/fiat/payments', payload),
})

/**
 * 🧑‍🤝‍🧑 Spot C2C Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#c2c-endpoints
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedSpotC2C = (privCall) => ({
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
   * }} payload
   * @returns { Promise<{
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
   * }>} Object containing C2C trade history
   */
  getTradeHistory: payload =>
    checkParams('authenticated.spot.C2C.getTradeHistory', payload, ['tradeType']) &&
    privCall('/sapi/v1/c2c/orderMatch/listUserOrderHistory', payload),
})

/**
 * 💳 Spot Crypto Loans Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#crypto-loans-endpoints
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedSpotCryptoLoans = (privCall) => ({
  /**
   * Get Crypto Loans Income History.
   * - If `startTime` and `endTime` are not sent, the recent 7-day data will be returned.
   * - The max interval between `startTime` and `endTime` is 30 days.
   * @weight 6000
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-crypto-loans-income-history-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  asset: string
   *  type?: 'borrowIn' | 'collateralSpent' | 'repayAmount' | 'collateralReturn'
   *  | 'addCollateral' | 'removeCollateral' | 'collateralReturnAfterLiquidation'
   *  startTime?: number
   *  endTime?: number
   *  limit?: number
   *  recvWindow?: number
   * }} payload
   * @returns { Promise<[{
   *  "asset": string
   *  "type": 'borrowIn' | 'collateralSpent' | 'repayAmount' | 'collateralReturn'
   *  | 'addCollateral' | 'removeCollateral' | 'collateralReturnAfterLiquidation'
   *  "amount": string
   *  "timestamp": number
   *  "tranId": string
   * }]>} Object containing crypto loans income history
   */
  getCryptoLoansIncomeHistory: payload =>
    checkParams('authenticated.spot.cryptoLoans.getCryptoLoansIncomeHistory', payload, ['asset']) &&
    privCall('/sapi/v1/loan/income', payload),
})

/**
 * 💳 Spot Pay Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/#pay-endpoints
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 */
export const authenticatedSpotPay = (privCall) => ({
  /**
   * Get Pay Trade History.
   * - If `startTimestamp` and `endTimestamp` are not sent, the recent 90-day data will be returned.
   * - The max interval between `startTimestamp` and `endTimestamp` is 90 days.
   * - Support for querying orders within the last 18 months.
   * @weight 3000
   * @http GET
   * @see https://binance-docs.github.io/apidocs/spot/en/#get-pay-trade-history-user_data
   * @requires APIKEY
   * @requires APISECRET
   * @param {{
   *  startTimestamp?: number
   *  endTimestamp?: number
   *  limit?: number
   *  recvWindow?: number
   * }=} payload
   * @returns { Promise<{
   *  "code": string
   *  "message": string
   *  "data": {
   *    "orderType": 'PAY' | 'PAY_REFUND' | 'C2C' | 'CRYPTO_BOX' | 'CRYPTO_BOX_RF'
   *    | 'C2C_HOLDING' | 'C2C_HOLDING_RF' | 'PAYOUT'
   *    "transactionId": string
   *    "transactionTime": number
   *    "amount": string
   *    "currency": string
   *    "fundsDetail": {
   *      "currency": string
   *      "amount": string
   *    }[]
   *  }[]
   *  "success": string
   * }>} Object containing pay trade history
   */
  getPayTradeHistory: payload =>
    checkParams('authenticated.spot.pay.getPayTradeHistory', payload) &&
    privCall('/sapi/v1/pay/transactions', payload),
})

/**
 * 🔐 Authenticated Spot REST Endpoints
 * 
 * @see https://binance-docs.github.io/apidocs/spot/en/
 * @param { (path: string, data?: any, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', noData?: boolean, noExtra?: boolean) => Promise<any> } privCall
 * @param { (path: any, data: any, method?: string) => Promise<any> } kCall
 */
const authenticatedSpot = (privCall, kCall) => ({
  wallet: authenticatedSpotWallet(privCall),
  subAccount: authenticatedSpotSubAccount(privCall),
  marketData: authenticatedSpotMarketData(kCall),
  trade: authenticatedSpotTrade(privCall),
  userDataStreams: authenticatedSpotUserDataStreams(privCall),
  savings: authenticatedSpotSavings(privCall),
  mining: authenticatedSpotMining(privCall, kCall),
  futures: authenticatedSpotFutures(privCall),
  BLVT: authenticatedSpotBLVT(privCall, kCall),
  BSwap: authenticatedSpotBSwap(privCall, kCall),
  fiat: authenticatedSpotFiat(privCall),
  C2C: authenticatedSpotC2C(privCall),
  cryptoLoans: authenticatedSpotCryptoLoans(privCall),
  pay: authenticatedSpotPay(privCall)
})

export default authenticatedSpot
