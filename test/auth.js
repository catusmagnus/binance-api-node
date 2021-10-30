// Packages:
import test from 'ava'
import dotenv from 'dotenv'
dotenv.config()


// Imports:
import Binance from '../src'
import { checkFields } from './utils'


// Functions:
/**
 * @param {{
 *  isFuturesEnabled: boolean
 *  isolatedMarginAccountExists: boolean
 *  isSubAccountEnabled: boolean
 *  orderListId: {
 *    spot?: number
 *    spotOCO?: number
 *    margin?: number
 *    marginOCO?: number
 *    futures?: number
 *    futuresOCO?: number
 *  }
 * }} payload
 */
const main = ({
  isFuturesEnabled,
  isolatedMarginAccountExists,
  isSubAccountEnabled,
  orderListId
}) => {
  if (!process.env.API_KEY || !process.env.API_SECRET) {
    return test('[AUTH] ⚠️  Skipping tests.', t => {
      t.log('Provide an API_KEY and API_SECRET to run them.')
      t.pass()
    })
  }
  const client = Binance({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET
  })

  // REST-SPOT-WALLET:
  test('[REST-SPOT-WALLET] accountCoins', async t => {
    const accountCoins = await client.authenticated.spot.wallet.accountCoins()
    t.true(Array.isArray(accountCoins))
    t.true(accountCoins[0].coin !== undefined)
    t.true(Array.isArray(accountCoins[0].networkList))
    t.true(accountCoins[0].storage !== undefined)
    t.pass()
  })
  test('[REST-SPOT-WALLET] dailyAccountSnapshot', async t => {
    try {
      await client.authenticated.spot.wallet.dailyAccountSnapshot({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.wallet.dailyAccountSnapshot requires type parameter.')
    }
    const dailyAccountSnapshot = await client.authenticated.spot.wallet.dailyAccountSnapshot({ type: 'SPOT' })
    t.true(Array.isArray(dailyAccountSnapshot.snapshotVos))
    t.true(Array.isArray(dailyAccountSnapshot.snapshotVos[0].data.balances))
    t.true(dailyAccountSnapshot.snapshotVos[0].type !== undefined)
    t.true(dailyAccountSnapshot.snapshotVos[0].updateTime !== undefined)
    t.pass()
  })
  test('[REST-SPOT-WALLET] depositHistory', async t => {
    const depositHistory = await client.authenticated.spot.wallet.depositHistory()
    t.true(Array.isArray(depositHistory))
    if (depositHistory.length > 0) {
      t.true(depositHistory[0].address !== undefined)
      t.true(depositHistory[0].txId !== undefined)
    }
    t.pass()
  })
  test('[REST-SPOT-WALLET] withdrawHistory', async t => {
    const withdrawHistory = await client.authenticated.spot.wallet.withdrawHistory()
    t.true(Array.isArray(withdrawHistory))
    if (withdrawHistory.length > 0) {
      t.true(withdrawHistory[0].address !== undefined)
      t.true(withdrawHistory[0].txId !== undefined)
    }
    t.pass()
  })
  test('[REST-SPOT-WALLET] depositAddress', async t => {
    try {
      await client.authenticated.spot.wallet.depositAddress({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.wallet.depositAddress requires coin parameter.')
    }
    const depositAddress = await client.authenticated.spot.wallet.depositAddress({ coin: 'BTC' })
    checkFields(t, depositAddress, [
      'address',
      'coin',
      'tag',
      'url'
    ])
    t.pass()
  })
  test('[REST-SPOT-WALLET] accountStatus', async t => {
    const accountStatus = await client.authenticated.spot.wallet.accountStatus()
    t.true(accountStatus !== undefined)
    t.pass()
  })
  test('[REST-SPOT-WALLET] accountAPITradingStatus', async t => {
    const accountAPITradingStatus = await client.authenticated.spot.wallet.accountAPITradingStatus()
    t.true(accountAPITradingStatus.data !== undefined)
    t.pass()
  })
  test('[REST-SPOT-WALLET] dustLog', async t => {
    const dustLog = await client.authenticated.spot.wallet.dustLog()
    t.true(Array.isArray(dustLog.userAssetDribblets))
    if (dustLog.userAssetDribblets.length !== 0) {
      t.true(dustLog.total !== undefined)
    }
    t.pass()
  })
  test('[REST-SPOT-WALLET] assetDividendRecord', async t => {
    const assetDividendRecord = await client.authenticated.spot.wallet.assetDividendRecord()
    if (assetDividendRecord.rows.length > 0) {
      checkFields(t, assetDividendRecord.rows[0], [
        'id',
        'amount',
        'asset',
        'divTime',
        'enInfo',
        'tranId'
      ])
    }
    t.true(assetDividendRecord.total === assetDividendRecord.rows.length)
    t.pass()
  })
  test('[REST-SPOT-WALLET] assetDetail', async t => {
    const assetDetail = await client.authenticated.spot.wallet.assetDetail()
    const keys = Object.keys(assetDetail)
    if (keys.length > 0) {
      checkFields(t, assetDetail[ keys[0] ], [
        'minWithdrawAmount',
        'depositStatus',
        'withdrawFee',
        'withdrawStatus'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-WALLET] tradeFee', async t => {
    const tradeFee = await client.authenticated.spot.wallet.tradeFee()
    const keys = Object.keys(tradeFee)
    if (keys.length > 0) {
      checkFields(t, tradeFee[ keys[0] ], [
        'makerCommission',
        'takerCommission'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-WALLET] universalTransferHistory', async t => {
    try {
      await client.authenticated.spot.wallet.universalTransferHistory({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.wallet.universalTransferHistory requires type parameter.')
    }
    const universalTransferHistory = await client.authenticated.spot.wallet.universalTransferHistory({ type: 'FUNDING_MAIN' })
    if (universalTransferHistory.rows.length > 0) {
      checkFields(t, universalTransferHistory.rows[0], [
        'asset',
        'amount',
        'type',
        'status',
        'tranId',
        'timestamp'
      ])
    }
    t.true(universalTransferHistory.total === universalTransferHistory.rows.length)
    t.pass()
  })
  test('[REST-SPOT-WALLET] apiPermission', async t => {
    const apiPermission = await client.authenticated.spot.wallet.apiPermission()
    checkFields(t, apiPermission, [
      'ipRestrict',
      'createTime',
      'enableWithdrawals',
      'enableInternalTransfer',
      'permitsUniversalTransfer',
      'enableVanillaOptions',
      'enableReading',
      'enableFutures',
      'enableMargin',
      'enableSpotAndMarginTrading'
    ])
    t.pass()
  })
  // REST-SPOT-SUBACCOUNT:
  if (isSubAccountEnabled) {
    test('[REST-SPOT-SUBACCOUNT] list', async t => {
      const list = await client.authenticated.spot.subAccount.list()
      if (list.length > 0) {
        checkFields(t, list[0], [
          'email',
          'isFreeze',
          'createTime'
        ])
      }
      t.pass()
    })
    test('[REST-SPOT-SUBACCOUNT] spotAssetTransferHistory', async t => {
      const spotAssetTransferHistory = await client.authenticated.spot.subAccount.spotAssetTransferHistory()
      if (spotAssetTransferHistory.length > 0) {
        checkFields(t, spotAssetTransferHistory[0], [
          'from',
          'to',
          'asset',
          'qty',
          'status',
          'tranId',
          'time'
        ])
      }
      t.pass()
    })
    test('[REST-SPOT-SUBACCOUNT] summary', async t => {
      const summary = await client.authenticated.spot.subAccount.summary()
      checkFields(t, summary, [
        'totalCount',
        'masterAccountTotalAsset',
        'spotSubUserAssetBtcVoList'
      ])
      t.pass()
    })
    test('[REST-SPOT-SUBACCOUNT] getMarginAccountSummary', async t => {
      const marginAccountSummary = await client.authenticated.spot.subAccount.getMarginAccountSummary()
      checkFields(t, marginAccountSummary, [
        'totalAssetOfBtc',
        'totalLiabilityOfBtc',
        'totalNetAssetOfBtc',
        'subAccountList'
      ])
      t.pass()
    })
    test('[REST-SPOT-SUBACCOUNT] getFuturesAccountSummary', async t => {
      const futuresAccountSummary = await client.authenticated.spot.subAccount.getFuturesAccountSummary()
      checkFields(t, futuresAccountSummary, [
        'totalInitialMargin',
        'totalMaintenanceMargin',
        'totalMarginBalance',
        'totalOpenOrderInitialMargin',
        'totalPositionInitialMargin',
        'totalUnrealizedProfit',
        'totalWalletBalance',
        'asset',
        'subAccountList',
        'getFuturesAccountSummary'
      ])
      t.pass()
    })
    test('[REST-SPOT-SUBACCOUNT] transferHistory', async t => {
      const transferHistory = await client.authenticated.spot.subAccount.transferHistory()
      if (transferHistory.length > 0) {
        checkFields(t, transferHistory[0], [
          'counterParty',
          'email',
          'type',
          'asset',
          'qty',
          'fromAccountType',
          'toAccountType',
          'status',
          'tranId',
          'time'
        ])
      }
      t.pass()
    })
    test('[REST-SPOT-SUBACCOUNT] universalTransferHistory', async t => {
      const universalTransferHistory = await client.authenticated.spot.subAccount.universalTransferHistory()
      if (universalTransferHistory.length > 0) {
        checkFields(t, universalTransferHistory[0], [
          'tranId',
          'fromEmail',
          'toEmail',
          'asset',
          'amount',
          'fromAccountType',
          'toAccountType',
          'status',
          'createTimeStamp'
        ])
      }
      t.pass()
    })
  }
  // REST-SPOT-MARKETDATA:
  test('[REST-SPOT-MARKETDATA] historicalTrades', async t => {
    try {
      await client.authenticated.spot.marketData.historicalTrades({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.marketData.historicalTrades requires symbol parameter.')
    }
    const historicalTrades = await client.authenticated.spot.marketData.historicalTrades({ symbol: 'BTCUSDT' })
    t.is(historicalTrades.length, 500)
    const limitedHistoricalTrades = await client.authenticated.spot.marketData.historicalTrades({ symbol: 'ETHUSDT', limit: 10 })
    t.is(limitedHistoricalTrades.length, 10)
    const [ trade ] = limitedHistoricalTrades
    checkFields(t, trade, [
      'id',
      'price',
      'qty',
      'quoteQty',
      'time',
      'isBuyerMaker',
      'isBestMatch'
    ])
    t.pass()
  })
  // REST-SPOT-TRADE:
  test('[REST-SPOT-TRADE] orderTest', async t => {
    try {
      await client.authenticated.spot.trade.orderTest({})
    } catch (e) {
      t.is(e.message, 'Method order requires symbol parameter.')
    }
    try {
      await client.authenticated.spot.trade.orderTest({
        side: 'BUY',
        symbol: 'XMRUSDT',
        quantity: '1',
        price: '1'
      })
    } catch (e) {
      t.is(e.message, 'Filter failure: PERCENT_PRICE')
    }
    await client.authenticated.spot.trade.orderTest({
      side: 'BUY',
      symbol: 'XMRUSDT',
      type: 'MARKET',
      quantity: '1'
    })
    t.pass()
  })
  test('[REST-SPOT-TRADE] orderTest (MARKET order with quoteOrderQty)', async t => {
    try {
      await client.authenticated.spot.trade.orderTest({
        symbol: 'ETHUSDT',
        side: 'BUY',
        quoteOrderQty: 10,
        type: 'MARKET'
      })
    } catch (e) {
      t.is(e.message, 'Filter failure: PERCENT_PRICE')
    }
    await client.authenticated.spot.trade.orderTest({
      symbol: 'ETHUSDT',
      side: 'BUY',
      quantity: 1,
      type: 'MARKET'
    })
    t.pass()
  })
  test('[REST-SPOT-TRADE] getOrder', async t => {
    try {
      await client.authenticated.spot.trade.getOrder({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.trade.getOrder requires symbol parameter.')
    }
    try {
      await client.authenticated.spot.trade.getOrder({ symbol: 'XMRUSDT' })
    } catch (e) {
      t.is(
        e.message,
        "Param 'origClientOrderId' or 'orderId' must be sent, but both were empty/null!",
      )
    }
    try {
      await client.authenticated.spot.trade.getOrder({ symbol: 'XMRUSDT', orderId: 1 })
    } catch (e) {
      t.is(e.message, 'Order does not exist.')
    }
    if (orderListId.spot) {
      const order = await client.authenticated.spot.trade.getOrder({ symbol: 'XMRUSDT', orderId: orderListId.spot })
      checkFields(t, order, [
        'symbol',
        'orderId',
        'orderListId',
        'clientOrderId',
        'price',
        'origQty',
        'executedQty',
        'cummulativeQuoteQty',
        'status',
        'timeInForce',
        'type',
        'side',
        'stopPrice',
        'icebergQty',
        'time',
        'updateTime',
        'isWorking',
        'origQuoteOrderQty'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-TRADE] openOrders', async t => {
    const openOrders = await client.authenticated.spot.trade.openOrders()
    if (openOrders.length > 0) {
      checkFields(t, openOrders[0], [
        'symbol',
        'orderId',
        'orderListId',
        'clientOrderId',
        'price',
        'origQty',
        'executedQty',
        'cummulativeQuoteQty',
        'status',
        'timeInForce',
        'type',
        'side',
        'stopPrice',
        'icebergQty',
        'time',
        'updateTime',
        'isWorking',
        'origQuoteOrderQty'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-TRADE] allOrders', async t => {
    try {
      await client.authenticated.spot.trade.allOrders({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.trade.allOrders requires symbol parameter.')
    }
    const allOrders = await client.authenticated.spot.trade.allOrders({
      symbol: 'XMRUSDT'
    })
    if (allOrders.length > 0) {
      checkFields(t, allOrders[0], [
        'symbol',
        'orderId',
        'orderListId',
        'clientOrderId',
        'price',
        'origQty',
        'executedQty',
        'cummulativeQuoteQty',
        'status',
        'timeInForce',
        'type',
        'side',
        'stopPrice',
        'icebergQty',
        'time',
        'updateTime',
        'isWorking',
        'origQuoteOrderQty'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-TRADE] account', async t => {
    const account = await client.authenticated.spot.trade.account()
    checkFields(t, account, [
      'makerCommission',
      'takerCommission',
      'buyerCommission',
      'sellerCommission',
      'canTrade',
      'canWithdraw',
      'canDeposit',
      'updateTime',
      'accountType',
      'balances',
      'permissions'
    ])
    t.pass()
  })
  test('[REST-SPOT-TRADE] myTrades', async t => {
    try {
      await client.authenticated.spot.trade.myTrades({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.trade.myTrades requires symbol parameter.')
    }
    const myTrades = await client.authenticated.spot.trade.myTrades({ symbol: 'XMRUSDT' })
    if (myTrades.length > 0) {
      checkFields(t, myTrades[0], [
        'symbol',
        'id',
        'orderId',
        'orderListId',
        'price',
        'qty',
        'quoteQty',
        'commission',
        'commissionAsset',
        'time',
        'isBuyer',
        'isMaker',
        'isBestMatch'
      ])
    }
    t.pass()
  })
  // REST-SPOT-TRADE-OCO:
  test('[REST-SPOT-TRADE-OCO] getOrder', async t => {
    try {
      await client.authenticated.spot.trade.OCO.getOrder({})
    } catch (e) {
      t.is(
        e.message,
        "Combination of optional parameters invalid. Recommendation: 'orderListId' should also be sent."
      )
    }
    try {
      await client.authenticated.spot.trade.OCO.getOrder({ orderListId: 1 })
    } catch (e) {
      t.is(e.message, 'Order list does not exist.')
    }
    if (orderListId.spotOCO) {
      const order = await client.authenticated.spot.trade.OCO.getOrder({ orderListId: orderListId.spotOCO })
      checkFields(t, order, [
        'orderListId',
        'contingencyType',
        'listStatusType',
        'listOrderStatus',
        'listClientOrderId',
        'transactionTime',
        'symbol',
        'orders'
      ])
      if (order.orders.length > 0) {
        checkFields(t, order.orders[0], [
          'symbol',
          'orderId',
          'clientOrderId'
        ])
      }
    }
    t.pass()
  })
  test('[REST-SPOT-TRADE-OCO] allOrders', async t => {
    const allOrders = await client.authenticated.spot.trade.OCO.allOrders()
    if (allOrders.length > 0) {
      checkFields(t, allOrders[0], [
        'orderListId',
        'contingencyType',
        'listStatusType',
        'listOrderStatus',
        'listClientOrderId',
        'transactionTime',
        'symbol',
        'orders'
      ])
      if (allOrders[0].orders.length > 0) {
        checkFields(t, allOrders[0].orders[0], [
          'symbol',
          'orderId',
          'clientOrderId'
        ])
      }
    }
    t.pass()
  })
  test('[REST-SPOT-TRADE-OCO] openOrders', async t => {
    const openOrders = await client.authenticated.spot.trade.OCO.openOrders()
    if (openOrders.length > 0) {
      checkFields(t, openOrders[0], [
        'orderListId',
        'contingencyType',
        'listStatusType',
        'listOrderStatus',
        'listClientOrderId',
        'transactionTime',
        'symbol',
        'orders'
      ])
      if (openOrders[0].orders.length > 0) {
        checkFields(t, openOrders[0].orders[0], [
          'symbol',
          'orderId',
          'clientOrderId'
        ])
      }
    }
    t.pass()
  })
  // REST-SPOT-SAVINGS-FLEXIBLE-PROJECT:
  test('[REST-SPOT-SAVINGS-FLEXIBLE-PROJECT] list', async t => {
    const list = await client.authenticated.spot.savings.flexibleProduct.list()
    if (list.length > 0) {
      checkFields(t, list[0], [
        'asset',
        'avgAnnualInterestRate',
        'canPurchase',
        'canRedeem',
        'featured',
        'minPurchaseAmount',
        'productId',
        'purchasedAmount',
        'status',
        'upLimit',
        'upLimitPerUser'
      ])
    }
    t.pass()
  })
  // REST-SPOT-SAVINGS-FIXED-ACTIVITY-PROJECT:
  test('[REST-SPOT-SAVINGS-FIXED-ACTIVITY-PROJECT] list', async t => {
    try {
      await client.authenticated.spot.savings.fixedActivityProject.list({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.savings.fixedActivityProject.list requires type parameter.')
    }
    const list = await client.authenticated.spot.savings.fixedActivityProject.list({ type: 'ACTIVITY' })
    if (list.length > 0) {
      checkFields(t, list[0], [
        'asset',
        'displayPriority',
        'duration',
        'interestPerLot',
        'interestRate',
        'lotSize',
        'lotsLowLimit',
        'lotsPurchased',
        'lotsUpLimit',
        'maxLotsPerUser',
        'needKyc',
        'projectId',
        'projectName',
        'status',
        'type',
        'withAreaLimitation'
      ])
    }
    t.pass()
  })
  // REST-SPOT-SAVINGS:
  test('[REST-SPOT-SAVINGS] lendingAccount', async t => {
    const lendingAccount = await client.authenticated.spot.savings.lendingAccount()
    checkFields(t, lendingAccount, [
      'positionAmountVos',
      'totalAmountInBTC',
      'totalAmountInUSDT',
      'totalFixedAmountInBTC',
      'totalFixedAmountInUSDT',
      'totalFlexibleInBTC',
      'totalFlexibleInUSDT'
    ])
    if (lendingAccount.positionAmountVos.length > 0) {
      checkFields(t, lendingAccount.positionAmountVos[0], [
        'amount',
        'amountInBTC',
        'amountInUSDT',
        'asset'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-SAVINGS] purchaseRecord', async t => {
    try {
      await client.authenticated.spot.savings.purchaseRecord({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.savings.purchaseRecord requires lendingType parameter.')
    }
    const flexiblePurchaseRecord = await client.authenticated.spot.savings.purchaseRecord({ lendingType: 'DAILY' })
    if (flexiblePurchaseRecord.length > 0) {
      checkFields(t, flexiblePurchaseRecord[0], [
        'amount',
        'asset',
        'createTime',
        'lendingType',
        'productName',
        'purchaseId',
        'status'
      ])
    }
    const activityPurchaseRecord = await client.authenticated.spot.savings.purchaseRecord({ lendingType: 'ACTIVITY' })
    if (activityPurchaseRecord.length > 0) {
      checkFields(t, activityPurchaseRecord[0], [
        'amount',
        'asset',
        'createTime',
        'lendingType',
        'lot',
        'productName',
        'purchaseId',
        'status'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-SAVINGS] redemptionRecord', async t => {
    try {
      await client.authenticated.spot.savings.redemptionRecord({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.savings.redemptionRecord requires lendingType parameter.')
    }
    const flexibleRedemptionRecord = await client.authenticated.spot.savings.redemptionRecord({ lendingType: 'DAILY' })
    if (flexibleRedemptionRecord.length > 0) {
      checkFields(t, flexibleRedemptionRecord[0], [
        'amount',
        'asset',
        'createTime',
        'principal',
        'projectId',
        'projectName',
        'status',
        'type'
      ])
    }
    const activityRedemptionRecord = await client.authenticated.spot.savings.redemptionRecord({ lendingType: 'ACTIVITY' })
    if (activityRedemptionRecord.length > 0) {
      checkFields(t, activityRedemptionRecord[0], [
        'amount',
        'asset',
        'createTime',
        'interest',
        'principal',
        'projectId',
        'projectName',
        'startTime',
        'status'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-SAVINGS] interestHistory', async t => {
    try {
      await client.authenticated.spot.savings.interestHistory({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.savings.interestHistory requires lendingType parameter.')
    }
    const interestHistory = await client.authenticated.spot.savings.interestHistory({ lendingType: 'DAILY' })
    if (interestHistory.length > 0) {
      checkFields(t, interestHistory[0], [
        'asset',
        'interest',
        'lendingType',
        'productName',
        'time'
      ])
    }
    t.pass()
  })
  // REST-SPOT-MINING:
  test('[REST-SPOT-MINING] acquiringAlgorithm', async t => {
    const algorithm = await client.authenticated.spot.mining.acquiringAlgorithm()
    checkFields(t, algorithm, [
      'code',
      'msg',
      'data'
    ])
    t.true(Array.isArray(algorithm.data))
    if (algorithm.data.length > 0) {
      checkFields(t, algorithm.data[0], [
        'algoName',
        'algoId',
        'poolIndex',
        'unit'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-MINING] acquiringCoinName', async t => {
    const coinName = await client.authenticated.spot.mining.acquiringCoinName()
    checkFields(t, coinName, [
      'code',
      'msg',
      'data'
    ])
    t.true(Array.isArray(coinName.data))
    if (coinName.data.length > 0) {
      checkFields(t, coinName.data[0], [
        'coinName',
        'coinId',
        'poolIndex',
        'algoId',
        'algoName'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-MINING] hashrateResale.list', async t => {
    const list = await client.authenticated.spot.mining.hashrateResale.list()
    checkFields(t, list, [
      'code',
      'msg',
      'data'
    ])
    if (list.data.totalNum > 0) {
      checkFields(t, list.data, [
        'configDetails',
        'totalNum',
        'pageSize'
      ])
      t.true(Array.isArray(list.data.configDetails))
      if (list.data.configDetails.length > 0) {
        checkFields(t, list.data.configDetails[0], [
          'configId',
          'poolUsername',
          'toPoolUsername',
          'algoName',
          'hashRate',
          'startDay',
          'endDay',
          'status'
        ])
      }
    } else {
      checkFields(t, list.data, [
        'totalNum',
        'pageSize'
      ])
    }
    t.pass()
  })
  // REST-SPOT-FUTURES:
  test('[REST-SPOT-FUTURES] transactionHistoryList', async t => {
    try {
      await client.authenticated.spot.futures.transactionHistoryList({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.futures.transactionHistoryList requires asset parameter.')
    }
    try {
      await client.authenticated.spot.futures.transactionHistoryList({ asset: 'USDT' })
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.futures.transactionHistoryList requires startTime parameter.')
    }
    const transactionHistoryList = await client.authenticated.spot.futures.transactionHistoryList({
      asset: 'USDT',
      startTime: Date.now() - 1000 * 60 * 60 * 24
    })
    if (transactionHistoryList.total !== 0) {
      t.true(transactionHistoryList.rows.length === transactionHistoryList.total)
      if (transactionHistoryList.rows.length > 0) {
        checkFields(t, transactionHistoryList.rows[0], [
          'asset',
          'tranId',
          'amount',
          'type',
          'timestamp',
          'status'
        ])
      }
    }
    t.pass()
  })
  test('[REST-SPOT-FUTURES] crossCollateralBorrowHistory', async t => {
    const crossCollateralBorrowHistory = await client.authenticated.spot.futures.crossCollateralBorrowHistory()
    if (crossCollateralBorrowHistory.total !== 0) {
      t.true(crossCollateralBorrowHistory.rows.length === crossCollateralBorrowHistory.total)
      if (crossCollateralBorrowHistory.rows.length > 0) {
        checkFields(t, crossCollateralBorrowHistory.rows[0], [
          'confirmedTime',
          'coin',
          'collateralRate',
          'leftTotal',
          'leftPrincipal',
          'deadline',
          'collateralCoin',
          'collateralAmount',
          'orderStatus',
          'borrowId'
        ])
      }
    }
    t.pass()
  })
  test('[REST-SPOT-FUTURES] crossCollateralRepayHistory', async t => {
    const crossCollateralRepayHistory = await client.authenticated.spot.futures.crossCollateralRepayHistory()
    if (crossCollateralRepayHistory.total !== 0) {
      t.true(crossCollateralRepayHistory.rows.length === crossCollateralRepayHistory.total)
      if (crossCollateralRepayHistory.rows.length > 0) {
        checkFields(t, crossCollateralRepayHistory.rows[0], [
          'coin',
          'amount',
          'collateralCoin',
          'repayType',
          'releasedCollateral',
          'price',
          'repayCollateral',
          'confirmedTime',
          'updateTime',
          'status',
          'repayId'
        ])
      }
    }
    t.pass()
  })
  test('[REST-SPOT-FUTURES] crossCollateralWallet', async t => {
    const wallet = await client.authenticated.spot.futures.crossCollateralWallet()
    checkFields(t, wallet, [
      'totalCrossCollateral',
      'totalBorrowed',
      'totalInterest',
      'interestFreeLimit',
      'asset',
      'crossCollaterals'
    ])
    if (wallet.crossCollaterals.length > 0) {
      checkFields(t, wallet.crossCollaterals[0], [
        'collateralCoin',
        'locked',
        'loanAmount',
        'currentCollateralRate',
        'interestFreeLimitUsed',
        'principalForInterest',
        'interest'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-FUTURES] crossCollateralWalletV2', async t => {
    const wallet = await client.authenticated.spot.futures.crossCollateralWalletV2()
    checkFields(t, wallet, [
      'totalCrossCollateral',
      'totalBorrowed',
      'totalInterest',
      'interestFreeLimit',
      'asset',
      'crossCollaterals'
    ])
    if (wallet.crossCollaterals.length > 0) {
      checkFields(t, wallet.crossCollaterals[0], [
        'loanCoin',
        'collateralCoin',
        'locked',
        'loanAmount',
        'currentCollateralRate',
        'interestFreeLimitUsed',
        'principalForInterest',
        'interest'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-FUTURES] crossCollateralInformation', async t => {
    const info = await client.authenticated.spot.futures.crossCollateralInformation()
    t.true(Array.isArray(info))
    if (info.length > 0) {
      checkFields(t, info[0], [
        'collateralCoin',
        'rate',
        'marginCallCollateralRate',
        'liquidationCollateralRate',
        'currentCollateralRate',
        'loanCoin',
        'interestGracePeriod'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-FUTURES] crossCollateralInformationV2', async t => {
    const info = await client.authenticated.spot.futures.crossCollateralInformationV2()
    t.true(Array.isArray(info))
    if (info.length > 0) {
      checkFields(t, info[0], [
        'loanCoin',
        'collateralCoin',
        'rate',
        'marginCallCollateralRate',
        'liquidationCollateralRate',
        'currentCollateralRate',
        'interestGracePeriod'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-FUTURES] crossCollateralCalculateRateAfterAdjust', async t => {
    try {
      await client.authenticated.spot.futures.crossCollateralCalculateRateAfterAdjust({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.futures.crossCollateralCalculateRateAfterAdjust requires collateralCoin parameter.')
    }
    try {
      await client.authenticated.spot.futures.crossCollateralCalculateRateAfterAdjust({
        collateralCoin: 'BTC'
      })
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.futures.crossCollateralCalculateRateAfterAdjust requires amount parameter.')
    }
    try {
      await client.authenticated.spot.futures.crossCollateralCalculateRateAfterAdjust({
        collateralCoin: 'BTC',
        amount: '1'
      })
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.futures.crossCollateralCalculateRateAfterAdjust requires direction parameter.')
    }
    try {
      const newRate = await client.authenticated.spot.futures.crossCollateralCalculateRateAfterAdjust({
        collateralCoin: 'BTC',
        amount: '100',
        direction: 'ADDITIONAL'
      })
      t.true(typeof newRate === 'string')
    } catch (e) {
      t.is(e.message, 'No order information found.')
    }
    t.pass()
  })
  test('[REST-SPOT-FUTURES] crossCollateralCalculateRateAfterAdjustV2', async t => {
    try {
      await client.authenticated.spot.futures.crossCollateralCalculateRateAfterAdjustV2({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.futures.crossCollateralCalculateRateAfterAdjustV2 requires loanCoin parameter.')
    }
    try {
      await client.authenticated.spot.futures.crossCollateralCalculateRateAfterAdjustV2({
        loanCoin: 'BUSD'
      })
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.futures.crossCollateralCalculateRateAfterAdjustV2 requires collateralCoin parameter.')
    }
    try {
      await client.authenticated.spot.futures.crossCollateralCalculateRateAfterAdjustV2({
        loanCoin: 'BUSD',
        collateralCoin: 'BTC'
      })
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.futures.crossCollateralCalculateRateAfterAdjustV2 requires amount parameter.')
    }
    try {
      await client.authenticated.spot.futures.crossCollateralCalculateRateAfterAdjustV2({
        loanCoin: 'BUSD',
        collateralCoin: 'BTC',
        amount: '100'
      })
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.futures.crossCollateralCalculateRateAfterAdjustV2 requires direction parameter.')
    }
    try {
      const newRate = await client.authenticated.spot.futures.crossCollateralCalculateRateAfterAdjustV2({
        loanCoin: 'BUSD',
        collateralCoin: 'BTC',
        amount: '1',
        direction: 'ADDITIONAL'
      })
      t.true(typeof newRate === 'string')
    } catch (e) {
      t.is(e.message, 'No order information found.')
    }
    t.pass()
  })
  test('[REST-SPOT-FUTURES] crossCollateralMaxAdjustAmount', async t => {
    try {
      await client.authenticated.spot.futures.crossCollateralMaxAdjustAmount({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.futures.crossCollateralMaxAdjustAmount requires collateralCoin parameter.')
    }
    const crossCollateralMaxAdjustAmount = await client.authenticated.spot.futures.crossCollateralMaxAdjustAmount({ collateralCoin: 'BTC' })
    checkFields(t, crossCollateralMaxAdjustAmount, [
      'maxInAmount',
      'maxOutAmount'
    ])
    t.pass()
  })
  test('[REST-SPOT-FUTURES] crossCollateralMaxAdjustAmountV2', async t => {
    try {
      await client.authenticated.spot.futures.crossCollateralMaxAdjustAmountV2({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.futures.crossCollateralMaxAdjustAmountV2 requires loanCoin parameter.')
    }
    try {
      await client.authenticated.spot.futures.crossCollateralMaxAdjustAmountV2({
        loanCoin: 'BUSD'
      })
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.futures.crossCollateralMaxAdjustAmountV2 requires collateralCoin parameter.')
    }
    const crossCollateralMaxAdjustAmount = await client.authenticated.spot.futures.crossCollateralMaxAdjustAmountV2({
      loanCoin: 'BUSD',
      collateralCoin: 'BTC'
    })
    checkFields(t, crossCollateralMaxAdjustAmount, [
      'maxInAmount',
      'maxOutAmount'
    ])
    t.pass()
  })
  test('[REST-SPOT-FUTURES] adjustCrossCollateralHistory', async t => {
    const adjustCrossCollateralHistory = await client.authenticated.spot.futures.adjustCrossCollateralHistory()
    if (adjustCrossCollateralHistory.total !== 0) {
      t.true(adjustCrossCollateralHistory.rows.length === adjustCrossCollateralHistory.total)
      if (adjustCrossCollateralHistory.rows.length > 0) {
        checkFields(t, adjustCrossCollateralHistory.rows[0], [
          'amount',
          'collateralCoin',
          'coin',
          'preCollateralRate',
          'afterCollateralRate',
          'direction',
          'status',
          'adjustTime'
        ])
      }
    }
    t.pass()
  })
  test('[REST-SPOT-FUTURES] crossCollateralLiquidationHistory', async t => {
    const crossCollateralLiquidationHistory = await client.authenticated.spot.futures.crossCollateralLiquidationHistory()
    if (crossCollateralLiquidationHistory.total !== 0) {
      t.true(crossCollateralLiquidationHistory.rows.length === crossCollateralLiquidationHistory.total)
      if (crossCollateralLiquidationHistory.rows.length > 0) {
        checkFields(t, crossCollateralLiquidationHistory.rows[0], [
          'collateralAmountForLiquidation',
          'collateralCoin',
          'forceLiquidationStartTime',
          'coin',
          'restCollateralAmountAfterLiquidation',
          'restLoanAmount',
          'status'
        ])
      }
    }
    t.pass()
  })
  test('[REST-SPOT-FUTURES] collateralRepayLimit', async t => {
    const limit = await client.authenticated.spot.futures.collateralRepayLimit({
      coin: 'USDT',
      collateralCoin: 'BTC'
    })
    t.true(limit.coin === 'USDT')
    t.true(limit.collateralCoin === 'BTC')
    checkFields(t, limit, [
      'coin',
      'collateralCoin',
      'max',
      'min'
    ])
    t.pass()
  })
  test('[REST-SPOT-FUTURES] getCollateralRepayQuote', async t => {
    const quote = await client.authenticated.spot.futures.getCollateralRepayQuote({
      coin: 'USDT',
      collateralCoin: 'BTC',
      amount: '10000'
    })
    t.true(quote.coin === 'USDT')
    t.true(quote.collateralCoin === 'BTC')
    checkFields(t, quote, [
      'coin',
      'collateralCoin',
      'amount',
      'quoteId'
    ])
    t.pass()
  })
  test('[REST-SPOT-FUTURES] crossCollateralInterestHistory', async t => {
    const crossCollateralInterestHistory = await client.authenticated.spot.futures.crossCollateralInterestHistory()
    if (crossCollateralInterestHistory.total !== 0) {
      t.true(crossCollateralInterestHistory.rows.length === crossCollateralInterestHistory.total)
      if (crossCollateralInterestHistory.rows.length > 0) {
        checkFields(t, crossCollateralInterestHistory.rows[0], [
          'collateralCoin',
          'interestCoin',
          'interest',
          'interestFreeLimitUsed',
          'principalForInterest',
          'interestRate',
          'time'
        ])
      }
    }
    t.pass()
  })
  // REST-SPOT-BLVT:
  test('[REST-SPOT-BLVT] info', async t => {
    const info = await client.authenticated.spot.BLVT.info()
    t.true(Array.isArray(info))
    if (info.length > 0) {
      checkFields(t, info[0], [
        'tokenName',
        'description',
        'underlying',
        'tokenIssued',
        'basket',
        'currentBaskets',
        'nav',
        'realLeverage',
        'fundingRate',
        'dailyManagementFee',
        'purchaseFeePct',
        'dailyPurchaseLimit',
        'redeemFeePct',
        'dailyRedeemLimit',
        'timestamp'
      ])
      if (info[0].currentBaskets.length > 0) {
        checkFields(t, info[0].currentBaskets[0], [
          'symbol',
          'amount',
          'notionalValue'
        ])
      }
    }
    t.pass()
  })
  test('[REST-SPOT-BLVT] getSubscriptionRecord', async t => {
    const subscriptionRecord = await client.authenticated.spot.BLVT.getSubscriptionRecord()
    t.true(Array.isArray(subscriptionRecord))
    if (subscriptionRecord.length > 0) {
      checkFields(t, subscriptionRecord[0], [
        'id',
        'tokenName',
        'amount',
        'nav',
        'fee',
        'totalCharge',
        'timestamp'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-BLVT] getRedemptionRecord', async t => {
    const redemptionRecord = await client.authenticated.spot.BLVT.getRedemptionRecord()
    t.true(Array.isArray(redemptionRecord))
    if (redemptionRecord.length > 0) {
      checkFields(t, redemptionRecord[0], [
        'id',
        'tokenName',
        'amount',
        'nav',
        'fee',
        'netProceed',
        'timestamp'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-BLVT] userLimit', async t => {
    const userLimit = await client.authenticated.spot.BLVT.userLimit()
    t.true(Array.isArray(userLimit))
    if (userLimit.length > 0) {
      checkFields(t, userLimit[0], [
        'tokenName',
        'userDailyTotalPurchaseLimit',
        'userDailyTotalRedeemLimit'
      ])
    }
    t.pass()
  })
  // REST-SPOT-BLVT:
  test('[REST-SPOT-BSWAP] getPools', async t => {
    const list = await client.authenticated.spot.BSwap.getPools()
    t.true(Array.isArray(list))
    if (list.length > 0) {
      checkFields(t, list[0], [
        'poolId',
        'poolName',
        'assets'
      ])
      t.true(list[0].assets.length === 2)
    }
    t.pass()
  })
  test('[REST-SPOT-BSWAP] getLiquidity', async t => {
    const liquidities = await client.authenticated.spot.BSwap.getLiquidity()
    t.true(Array.isArray(liquidities))
    if (liquidities.length > 0) {
      checkFields(t, liquidities[0], [
        'poolId',
        'poolName',
        'updateTime',
        'liquidity',
        'share'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-BSWAP] getLiquidityOperationRecords', async t => {
    const records = await client.authenticated.spot.BSwap.getLiquidityOperationRecords()
    t.true(Array.isArray(records))
    if (records.length > 0) {
      checkFields(t, records[0], [
        'operationId',
        'poolId',
        'poolName',
        'operation',
        'status',
        'updateTime',
        'shareAmount'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-BSWAP] requestQuote', async t => {
    const quote = await client.authenticated.spot.BSwap.requestQuote({
      quoteAsset: 'USDT',
      baseAsset: 'BUSD',
      quoteQty: '42013.37'
    })
    checkFields(t, quote, [
      'quoteAsset',
      'baseAsset',
      'quoteQty',
      'baseQty',
      'price',
      'slippage',
      'fee'
    ])
    t.pass()
  })
  test('[REST-SPOT-BSWAP] swapHistory', async t => {
    const swapHistory = await client.authenticated.spot.BSwap.swapHistory()
    t.true(Array.isArray(swapHistory))
    if (swapHistory.length > 0) {
      checkFields(t, swapHistory[0], [
        'swapID',
        'swapTime',
        'status',
        'quoteAsset',
        'baseAsset',
        'quoteQty',
        'baseQty',
        'price',
        'fee'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-BSWAP] getPoolConfigure', async t => {
    const poolConfigure = await client.authenticated.spot.BSwap.getPoolConfigure()
    t.true(Array.isArray(poolConfigure))
    if (poolConfigure.length > 0) {
      checkFields(t, poolConfigure[0], [
        'poolId',
        'poolName',
        'updateTime',
        'liquidity',
        'assetConfigure'
      ])
    }
    t.pass()
  })
  // REST-SPOT-FIAT:
  test('[REST-SPOT-FIAT] getOrderHistory', async t => {
    try {
      await client.authenticated.spot.fiat.getOrderHistory({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.fiat.getOrderHistory requires transactionType parameter.')
    }
    const orderHistory = await client.authenticated.spot.fiat.getOrderHistory({
      transactionType: '0'
    })
    checkFields(t, orderHistory, [
      'code',
      'message',
      'data',
      'total',
      'success'
    ])
    if (orderHistory.data.length > 0) {
      checkFields(t, orderHistory.data[0], [
        'orderNo',
        'fiatCurrency',
        'indicatedAmount',
        'amount',
        'totalFee',
        'method',
        'status',
        'createTime',
        'updateTime'
      ])
    }
    t.pass()
  })
  test('[REST-SPOT-FIAT] getPaymentHistory', async t => {
    try {
      await client.authenticated.spot.fiat.getPaymentHistory({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.fiat.getPaymentHistory requires transactionType parameter.')
    }
    const paymentHistory = await client.authenticated.spot.fiat.getPaymentHistory({
      transactionType: '1'
    })
    checkFields(t, paymentHistory, [
      'code',
      'message',
      'data',
      'total',
      'success'
    ])
    if (paymentHistory.data.length > 0) {
      checkFields(t, paymentHistory.data[0], [
        'orderNo',
        'sourceAmount',
        'fiatCurrency',
        'obtainAmount',
        'cryptoCurrency',
        'totalFee',
        'price',
        'status',
        'createTime',
        'updateTime'
      ])
    }
    t.pass()
  })
  // REST-SPOT-C2C:
  test('[REST-SPOT-C2C] getOrderHistory', async t => {
    try {
      await client.authenticated.spot.C2C.getTradeHistory({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.spot.C2C.getTradeHistory requires tradeType parameter.')
    }
    const tradeHistory = await client.authenticated.spot.C2C.getTradeHistory({
      tradeType: 'BUY'
    })
    checkFields(t, tradeHistory, [
      'code',
      'message',
      'data',
      'total',
      'success'
    ])
    if (tradeHistory.data.length > 0) {
      checkFields(t, tradeHistory.data[0], [
        'orderNumber',
        'advNo',
        'tradeType',
        'asset',
        'fiat',
        'fiatSymbol',
        'amount',
        'totalPrice',
        'unitPrice',
        'orderStatus',
        'createTime',
        'commission',
        'counterPartNickName',
        'advertisementRole'
      ])
    }
    t.pass()
  })

  // REST-MARGIN:
  test('[REST-MARGIN] asset', async t => {
    try {
      await client.authenticated.margin.asset({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.margin.asset requires asset parameter.')
    }
    const asset = await client.authenticated.margin.asset({ asset: 'BNB' })
    checkFields(t, asset, [
      'assetFullName',
      'assetName',
      'isBorrowable',
      'isMortgageable',
      'userMinBorrow',
      'userMinRepay'
    ])
    t.pass()
  })
  test('[REST-MARGIN] allAssets', async t => {
    const allAssets = await client.authenticated.margin.allAssets()
    t.true(Array.isArray(allAssets))
    if (allAssets.length > 0) {
      checkFields(t, allAssets[0], [
        'assetFullName',
        'assetName',
        'isBorrowable',
        'isMortgageable',
        'userMinBorrow',
        'userMinRepay'
      ])
    }
    t.pass()
  })
  test('[REST-MARGIN] priceIndex', async t => {
    try {
      await client.authenticated.margin.priceIndex({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.margin.priceIndex requires symbol parameter.')
    }
    const priceIndex = await client.authenticated.margin.priceIndex({ symbol: 'BNBBTC' })
    checkFields(t, priceIndex, [
      'calcTime',
      'price',
      'symbol'
    ])
    t.pass()
  })
  test('[REST-MARGIN] loanRecord', async t => {
    try {
      await client.authenticated.margin.loanRecord({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.margin.loanRecord requires asset parameter.')
    }
    const loanRecord = await client.authenticated.margin.loanRecord({ asset: 'BNB' })
    if (loanRecord.total !== 0) {
      t.true(loanRecord.rows.length === loanRecord.total)
      if (loanRecord.rows.length > 0) {
        checkFields(t, loanRecord.rows[0], [
          'isolatedSymbol',
          'txId',
          'asset',
          'principal',
          'timestamp',
          'status'
        ])
      }
    }
    t.pass()
  })
  test('[REST-MARGIN] repayRecord', async t => {
    try {
      await client.authenticated.margin.repayRecord({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.margin.repayRecord requires asset parameter.')
    }
    const repayRecord = await client.authenticated.margin.repayRecord({ asset: 'BNB' })
    if (repayRecord.total !== 0) {
      t.true(repayRecord.rows.length === repayRecord.total)
      if (repayRecord.rows.length > 0) {
        checkFields(t, repayRecord.rows[0], [
          'isolatedSymbol',
          'amount',
          'asset',
          'interest',
          'principal',
          'status',
          'timestamp',
          'txId'
        ])
      }
    }
    t.pass()
  })
  test('[REST-MARGIN] interestHistory', async t => {
    const interestHistory = await client.authenticated.margin.interestHistory()
    if (interestHistory.total !== 0) {
      t.true(interestHistory.rows.length === interestHistory.total)
      if (interestHistory.rows.length > 0) {
        checkFields(t, interestHistory.rows[0], [
          'isolatedSymbol',
          'asset',
          'interest',
          'interestAccuredTime',
          'interestRate',
          'principal',
          'type'
        ])
      }
    }
    t.pass()
  })
  test('[REST-MARGIN] forceLiquidationRecord', async t => {
    const forceLiquidationRecord = await client.authenticated.margin.forceLiquidationRecord()
    if (forceLiquidationRecord.total !== 0) {
      t.true(forceLiquidationRecord.rows.length === forceLiquidationRecord.total)
      if (forceLiquidationRecord.rows.length > 0) {
        checkFields(t, forceLiquidationRecord.rows[0], [
          'avgPrice',
          'executedQty',
          'orderId',
          'price',
          'qty',
          'side',
          'symbol',
          'timeInForce',
          'isIsolated',
          'updatedTime'
        ])
      }
    }
    t.pass()
  })
  test('[REST-MARGIN] getOrder', async t => {
    try {
      await client.authenticated.margin.getOrder({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.margin.getOrder requires symbol parameter.')
    }
    try {
      await client.authenticated.margin.getOrder({
        symbol: 'BTCUSDT'
      })
    } catch (e) {
      t.is(
        e.message,
        "Param 'origClientOrderId' or 'orderId' must be sent, but both were empty/null!",
      )
    }
    try {
      await client.authenticated.margin.getOrder({
        symbol: 'BTCUSDT',
        orderId: 1
      })
    } catch (e) {
      t.is(e.message, 'Order does not exist.')
    }
    if (orderListId.margin) {
      const order = await client.authenticated.margin.getOrder({
        symbol: 'BTCUSDT',
        orderId: orderListId.margin
      })
      checkFields(t, order, [
        'clientOrderId',
        'cummulativeQuoteQty',
        'executedQty',
        'icebergQty',
        'isWorking',
        'orderId',
        'origQty',
        'price',
        'side',
        'status',
        'stopPrice',
        'symbol',
        'isIsolated',
        'time',
        'timeInForce',
        'type',
        'updateTime'
      ])
    }
    t.pass()
  })
  test('[REST-MARGIN] openOrders', async t => {
    const openOrders = await client.authenticated.margin.openOrders()
    t.true(Array.isArray(openOrders))
    if (openOrders.length > 0) {
      checkFields(t, openOrders[0], [
        'clientOrderId',
        'cummulativeQuoteQty',
        'executedQty',
        'icebergQty',
        'isWorking',
        'orderId',
        'origQty',
        'price',
        'side',
        'status',
        'stopPrice',
        'symbol',
        'isIsolated',
        'time',
        'timeInForce',
        'type',
        'updateTime'
      ])
    }
    t.pass()
  })
  test('[REST-MARGIN] allOrders', async t => {
    try {
      await client.authenticated.margin.allOrders({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.margin.allOrders requires symbol parameter.')
    }
    const allOrders = await client.authenticated.margin.allOrders({ symbol: 'BNBBTC' })
    t.true(Array.isArray(allOrders))
    if (allOrders.length > 0) {
      checkFields(t, allOrders[0], [
        'clientOrderId',
        'cummulativeQuoteQty',
        'executedQty',
        'icebergQty',
        'isWorking',
        'orderId',
        'origQty',
        'price',
        'side',
        'status',
        'stopPrice',
        'symbol',
        'isIsolated',
        'time',
        'timeInForce',
        'type',
        'updateTime'
      ])
    }
    t.pass()
  })
  test('[REST-MARGIN] myTrades', async t => {
    try {
      await client.authenticated.margin.myTrades({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.margin.myTrades requires symbol parameter.')
    }
    const myTrades = await client.authenticated.margin.myTrades({ symbol: 'BNBBTC' })
    t.true(Array.isArray(myTrades))
    if (myTrades.length > 0) {
      checkFields(t, myTrades[0], [
        'commission',
        'commissionAsset',
        'id',
        'isBestMatch',
        'isBuyer',
        'isMaker',
        'orderId',
        'price',
        'qty',
        'symbol',
        'isIsolated',
        'time'
      ])
    }
    t.pass()
  })
  test('[REST-MARGIN] maxBorrow', async t => {
    try {
      await client.authenticated.margin.maxBorrow({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.margin.maxBorrow requires asset parameter.')
    }
    const maxBorrow = await client.authenticated.margin.maxBorrow({ asset: 'BNB' })
    checkFields(t, maxBorrow, [
      'amount',
      'borrowLimit'
    ])
    t.pass()
  })
  test('[REST-MARGIN] maxTransferOut', async t => {
    try {
      await client.authenticated.margin.maxTransferOut({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.margin.maxTransferOut requires asset parameter.')
    }
    const maxTransferOut = await client.authenticated.margin.maxTransferOut({ asset: 'BNB' })
    t.true(typeof maxTransferOut === 'string')
    t.pass()
  })
  test('[REST-MARGIN] getBNBBurn', async t => {
    const getBNBBurn = await client.authenticated.margin.getBNBBurn()
    checkFields(t, getBNBBurn, [
      'spotBNBBurn',
      'interestBNBBurn'
    ])
    t.pass()
  })
  test('[REST-MARGIN] interestRateHistory', async t => {
    try {
      await client.authenticated.margin.interestRateHistory({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.margin.interestRateHistory requires asset parameter.')
    }
    const interestRateHistory = await client.authenticated.margin.interestRateHistory({ asset: 'BTC' })
    t.true(Array.isArray(interestRateHistory))
    if (interestRateHistory.length > 0) {
      checkFields(t, interestRateHistory[0], [
        'asset',
        'dailyInterestRate',
        'timestamp',
        'vipLevel'
      ])
    }
    t.pass()
  })
  // REST-MARGIN-CROSS:
  test('[REST-MARGIN-CROSS] pair', async t => {
    try {
      await client.authenticated.margin.cross.pair({})
    } catch (e) {
      t.is(e.message, 'Method authenticated.margin.cross.pair requires symbol parameter.')
    }
    const pair = await client.authenticated.margin.cross.pair({ symbol: 'BTCUSDT' })
    checkFields(t, pair, [
      'id',
      'symbol',
      'base',
      'quote',
      'isMarginTrade',
      'isBuyAllowed',
      'isSellAllowed'
    ])
    t.pass()
  })
  test('[REST-MARGIN-CROSS] allPairs', async t => {
    const allPairs = await client.authenticated.margin.cross.allPairs()
    checkFields(t, allPairs[ Object.keys(allPairs)[0] ], [
      'base',
      'id',
      'isBuyAllowed',
      'isMarginTrade',
      'isSellAllowed',
      'symbol',
      'quote'
    ])
    t.pass()
  })
  test('[REST-MARGIN-CROSS] transferHistory', async t => {
    const transferHistory = await client.authenticated.margin.cross.transferHistory()
    if (transferHistory.total !== 0) {
      t.true(transferHistory.rows.length === transferHistory.total)
      if (transferHistory.rows.length > 0) {
        checkFields(t, transferHistory.rows[0], [
          'amount',
          'asset',
          'status',
          'timestamp',
          'txId',
          'type'
        ])
      }
    }
    t.pass()
  })
  test('[REST-MARGIN-CROSS] account', async t => {
    const account = await client.authenticated.margin.cross.account()
    checkFields(t, account, [
      'borrowEnabled',
      'marginLevel',
      'totalAssetOfBtc',
      'totalLiabilityOfBtc',
      'totalNetAssetOfBtc',
      'tradeEnabled',
      'transferEnabled',
      'userAssets'
    ])
    if (account.userAssets.length > 0) {
      checkFields(t, account.userAssets[0], [
        'asset',
        'borrowed',
        'free',
        'interest',
        'locked',
        'netAsset'
      ])
    }
    t.pass()
  })
  // REST-MARGIN-ISOLATED:
  if (isolatedMarginAccountExists) {
    test('[REST-MARGIN-ISOLATED] transferHistory', async t => {
      try {
        await client.authenticated.margin.isolated.transferHistory({})
      } catch (e) {
        t.is(e.message, 'Method authenticated.margin.isolated.transferHistory requires symbol parameter.')
      }
      const transferHistory = await client.authenticated.margin.isolated.transferHistory({ symbol: 'BNBUSDT' })
      if (transactionHistoryList.total !== 0) {
        t.true(transferHistory.rows.length === transferHistory.total)
        if (transferHistory.rows.length > 0) {
          checkFields(t, transferHistory.rows[0], [
            'amount',
            'asset',
            'status',
            'timestamp',
            'txId',
            'transFrom',
            'transTo'
          ])
        }
      }
      t.pass()
    })
    test('[REST-MARGIN-ISOLATED] account', async t => {
      const accountSymbolless = await client.authenticated.margin.isolated.account()
      checkFields(t, accountSymbolless, [
        'assets',
        'totalAssetOfBtc',
        'totalLiabilityOfBtc',
        'totalNetAssetOfBtc'
      ])
      if (accountSymbolless.assets.length > 0) {
        checkFields(t, accountSymbolless.assets[0], [
          'baseAsset',
          'quoteAsset',
          'symbol',
          'isolatedCreated',
          'enabled',
          'marginLevel',
          'marginLevelStatus',
          'marginRatio',
          'indexPrice',
          'liquidatePrice',
          'liquidateRate',
          'tradeEnabled'
        ])
        checkFields(t, accountSymbolless.assets[0].baseAsset, [
          'asset',
          'borrowEnabled',
          'borrowed',
          'free',
          'interest',
          'locked',
          'netAsset',
          'netAssetOfBtc',
          'repayEnabled',
          'totalAsset'
        ])
        checkFields(t, accountSymbolless.assets[0].quoteAsset, [
          'asset',
          'borrowEnabled',
          'borrowed',
          'free',
          'interest',
          'locked',
          'netAsset',
          'netAssetOfBtc',
          'repayEnabled',
          'totalAsset'
        ])
      }
      const accountSymbolOne = await client.authenticated.margin.isolated.account({ symbols: 'BTCUSDT' })
      t.true(accountSymbolOne.totalAssetOfBtc === undefined)
      t.true(accountSymbolOne.totalLiabilityOfBtc === undefined)
      t.true(accountSymbolOne.totalNetAssetOfBtc === undefined)
      if (accountSymbolOne.assets.length > 0) {
        checkFields(t, accountSymbolOne.assets[0], [
          'baseAsset',
          'quoteAsset',
          'symbol',
          'isolatedCreated',
          'enabled',
          'marginLevel',
          'marginLevelStatus',
          'marginRatio',
          'indexPrice',
          'liquidatePrice',
          'liquidateRate',
          'tradeEnabled'
        ])
        checkFields(t, accountSymbolOne.assets[0].baseAsset, [
          'asset',
          'borrowEnabled',
          'borrowed',
          'free',
          'interest',
          'locked',
          'netAsset',
          'netAssetOfBtc',
          'repayEnabled',
          'totalAsset'
        ])
        checkFields(t, accountSymbolOne.assets[0].quoteAsset, [
          'asset',
          'borrowEnabled',
          'borrowed',
          'free',
          'interest',
          'locked',
          'netAsset',
          'netAssetOfBtc',
          'repayEnabled',
          'totalAsset'
        ])
      }
      t.pass()
    })
    test('[REST-MARGIN-ISOLATED] enabledAccountLimit', async t => {
      const enabledAccountLimit = await client.authenticated.margin.isolated.enabledAccountLimit()
      checkFields(t, enabledAccountLimit, [
        'enabledAccount',
        'maxAccount'
      ])
      t.pass()
    })
    test('[REST-MARGIN-ISOLATED] symbol', async t => {
      try {
        await client.authenticated.margin.isolated.symbol({})
      } catch (e) {
        t.is(e.message, 'Method authenticated.margin.isolated.symbol requires symbol parameter.')
      }
      const symbol = await client.authenticated.margin.isolated.symbol({ symbol: 'BTCUSDT' })
      checkFields(t, symbol, [
        'symbol',
        'base',
        'quote',
        'isMarginTrade',
        'isBuyAllowed',
        'isSellAllowed'
      ])
      t.pass()
    })
    test('[REST-MARGIN-ISOLATED] allSymbols', async t => {
      const allSymbols = await client.authenticated.margin.isolated.allSymbols()
      checkFields(t, allSymbols[ Object.keys(allSymbols)[0] ], [
        'base',
        'isMarginTrade',
        'isBuyAllowed',
        'isSellAllowed',
        'quote',
        'symbol'
      ])
      t.pass()
    })
  }
  // REST-MARGIN-OCO:
  test('[REST-MARGIN-OCO] getOrder', async t => {
    try {
      await client.authenticated.margin.OCO.getOrder({})
    } catch (e) {
      t.is(
        e.message,
        "Combination of optional parameters invalid. Recommendation: 'orderListId' should also be sent.",
      )
    }
    try {
      await client.authenticated.margin.OCO.getOrder({ orderListId: 1 })
    } catch (e) {
      t.is(e.message, 'Order list does not exist.')
    }
    if (orderListId.marginOCO) {
      const order = await client.authenticated.margin.OCO.getOrder({ orderListId: orderListId.marginOCO })
      checkFields(t, order, [
        'orderListId',
        'contingencyType',
        'listStatusType',
        'listOrderStatus',
        'listClientOrderId',
        'transactTime',
        'symbol',
        'isIsolated',
        'orders'
      ])
      if (order.orders.length > 0) {
        checkFields(t, order.orders[0], [
          'symbol',
          'orderId',
          'clientOrderId'
        ])
      }
    }
    t.pass()
  })
  test('[REST-MARGIN-OCO] allOrders', async t => {
    const allOrders = await client.authenticated.margin.OCO.allOrders()
    if (allOrders.length > 0) {
      checkFields(t, allOrders[0], [
        'orderListId',
        'contingencyType',
        'listStatusType',
        'listOrderStatus',
        'listClientOrderId',
        'transactTime',
        'symbol',
        'isIsolated',
        'orders'
      ])
      if (allOrders[0].orders.length > 0) {
        checkFields(t, allOrders[0].orders[0], [
          'symbol',
          'orderId',
          'clientOrderId'
        ])
      }
    }
    t.pass()
  })
  test('[REST-MARGIN-OCO] openOrders', async t => {
    const openOrders = await client.authenticated.margin.OCO.openOrders()
    if (openOrders.length > 0) {
      checkFields(t, openOrders[0], [
        'orderListId',
        'contingencyType',
        'listStatusType',
        'listOrderStatus',
        'listClientOrderId',
        'transactTime',
        'symbol',
        'isIsolated',
        'orders'
      ])
      if (openOrders[0].orders.length > 0) {
        checkFields(t, openOrders[0].orders[0], [
          'symbol',
          'orderId',
          'clientOrderId'
        ])
      }
    }
    t.pass()
  })

  // REST-FUTURES-MARKETDATA:
  if (isFuturesEnabled) {
    test('[REST-FUTURES-MARKETDATA] historicalTrades', async t => {
      try {
        await client.authenticated.futures.marketData.historicalTrades({})
      } catch (e) {
        t.is(e.message, 'Method authenticated.futures.marketData.historicalTrades requires symbol parameter.')
      }
      const historicalTrades = await client.authenticated.futures.marketData.historicalTrades({
        symbol: 'XMRUSDT'
      })
      t.true(Array.isArray(historicalTrades))
      if (historicalTrades.length > 0) {
        checkFields(t, historicalTrades[0], [
          'id',
          'price',
          'qty',
          'quoteQty',
          'time',
          'isBuyerMaker'
        ])
      }
      t.pass()
    })
    test('[REST-FUTURES-MARKETDATA] topLongShortAccountRatio', async t => {
      try {
        await client.authenticated.futures.marketData.topLongShortAccountRatio({})
      } catch (e) {
        t.is(e.message, 'Method authenticated.futures.marketData.topLongShortAccountRatio requires symbol parameter.')
      }
      const topLongShortAccountRatio = await client.authenticated.futures.marketData.topLongShortAccountRatio({
        symbol: 'XMRUSDT'
      })
      t.true(Array.isArray(topLongShortAccountRatio))
      if (topLongShortAccountRatio.length > 0) {
        checkFields(t, topLongShortAccountRatio[0], [
          'symbol',
          'longShortRatio',
          'longAccount',
          'shortAccount',
          'timestamp'
        ])
      }
      t.pass()
    })
    // REST-FUTURES-TRADE:
    test('[REST-FUTURES-TRADE] positionMode', async t => {
      const positionMode = await client.authenticated.futures.trade.positionMode()
      t.true(typeof positionMode === 'boolean')
      t.pass()
    })
    test('[REST-FUTURES-TRADE] multiAssetsMode', async t => {
      const multiAssetsMode = await client.authenticated.futures.trade.multiAssetsMode()
      t.true(typeof multiAssetsMode === 'boolean')
      t.pass()
    })
    test('[REST-FUTURES-TRADE] getOrder', async t => {
      try {
        await client.authenticated.futures.trade.getOrder({})
      } catch (e) {
        t.is(e.message, 'Method authenticated.futures.trade.getOrder requires symbol parameter.')
      }
      try {
        await client.authenticated.futures.trade.getOrder({
          symbol: 'BTCUSDT'
        })
      } catch (e) {
        t.is(
          e.message,
          "Param 'orderId' or 'origClientOrderId' must be sent, but both were empty/null!",
        )
      }
      try {
        await client.authenticated.futures.trade.getOrder({
          symbol: 'BTCUSDT',
          orderId: 1
        })
      } catch (e) {
        t.is(e.message, 'Order does not exist.')
      }
      if (orderListId.futures) {
        const order = await client.authenticated.futures.trade.getOrder({
          symbol: 'BTCUSDT',
          orderId: orderListId.futures
        })
        checkFields(t, order, [
          'avgPrice',
          'clientOrderId',
          'cumQuote',
          'executedQty',
          'orderId',
          'origQty',
          'origType',
          'price',
          'reduceOnly',
          'side',
          'positionSide',
          'status',
          'stopPrice',
          'closePosition',
          'symbol',
          'time',
          'timeInForce',
          'type',
          'activatePrice',
          'priceRate',
          'updateTime',
          'workingType',
          'priceProtect'
        ])
      }
      t.pass()
    })
    test('[REST-FUTURES-TRADE] getOpenOrder', async t => {
      try {
        await client.authenticated.futures.trade.getOpenOrder({})
      } catch (e) {
        t.is(e.message, 'Method authenticated.futures.trade.getOpenOrder requires symbol parameter.')
      }
      try {
        await client.authenticated.futures.trade.getOpenOrder({
          symbol: 'BTCUSDT'
        })
      } catch (e) {
        t.is(
          e.message,
          "Param 'orderId' or 'origClientOrderId' must be sent, but both were empty/null!",
        )
      }
      try {
        await client.authenticated.futures.trade.getOpenOrder({
          symbol: 'BTCUSDT',
          orderId: 1
        })
      } catch (e) {
        t.is(e.message, 'Order does not exist.')
      }
      if (orderListId.futuresOCO) {
        const order = await client.authenticated.futures.trade.getOpenOrder({
          symbol: 'BTCUSDT',
          orderId: orderListId.futuresOCO
        })
        checkFields(t, order, [
          'avgPrice',
          'clientOrderId',
          'cumQuote',
          'executedQty',
          'orderId',
          'origQty',
          'origType',
          'price',
          'reduceOnly',
          'side',
          'positionSide',
          'status',
          'stopPrice',
          'closePosition',
          'symbol',
          'time',
          'timeInForce',
          'type',
          'activatePrice',
          'priceRate',
          'updateTime',
          'workingType',
          'priceProtect'
        ])
      }
      t.pass()
    })
    test('[REST-FUTURES-TRADE] openOrders', async t => {
      const order = await client.authenticated.futures.trade.openOrders({
        symbol: 'BTCUSDT'
      })
      checkFields(t, order, [
        'avgPrice',
        'clientOrderId',
        'cumQuote',
        'executedQty',
        'orderId',
        'origQty',
        'origType',
        'price',
        'reduceOnly',
        'side',
        'positionSide',
        'status',
        'stopPrice',
        'closePosition',
        'symbol',
        'time',
        'timeInForce',
        'type',
        'activatePrice',
        'priceRate',
        'updateTime',
        'workingType',
        'priceProtect'
      ])
      t.pass()
    })
    test('[REST-FUTURES-TRADE] allOrders', async t => {
      try {
        await client.authenticated.futures.trade.allOrders({})
      } catch (e) {
        t.is(e.message, 'Method authenticated.futures.trade.allOrders requires symbol parameter.')
      }
      const order = await client.authenticated.futures.trade.allOrders({
        symbol: 'BTCUSDT'
      })
      checkFields(t, order, [
        'avgPrice',
        'clientOrderId',
        'cumQuote',
        'executedQty',
        'orderId',
        'origQty',
        'origType',
        'price',
        'reduceOnly',
        'side',
        'positionSide',
        'status',
        'stopPrice',
        'closePosition',
        'symbol',
        'time',
        'timeInForce',
        'type',
        'activatePrice',
        'priceRate',
        'updateTime',
        'workingType',
        'priceProtect'
      ])
      t.pass()
    })
    test('[REST-FUTURES-TRADE] accountBalance', async t => {
      const accountBalance = await client.authenticated.futures.trade.accountBalance()
      t.true(Array.isArray(accountBalance))
      if (accountBalance.length > 0) {
        checkFields(t, accountBalance[0], [
          'accountAlias',
          'asset',
          'balance',
          'crossWalletBalance',
          'crossUnPnl',
          'availableBalance',
          'maxWithdrawAmount',
          'marginAvailable',
          'updateTime'
        ])
      }
      t.pass()
    })
    test('[REST-FUTURES-TRADE] account', async t => {
      const account = await client.authenticated.futures.trade.account()
      checkFields(t, account, [
        'feeTier',
        'canTrade',
        'canDeposit',
        'canWithdraw',
        'updateTime',
        'totalInitialMargin',
        'totalMaintMargin',
        'totalWalletBalance',
        'totalUnrealizedProfit',
        'totalMarginBalance',
        'totalPositionInitialMargin',
        'totalOpenOrderInitialMargin',
        'totalCrossWalletBalance',
        'totalCrossUnPnl',
        'availableBalance',
        'maxWithdrawAmount',
        'assets',
        'positions'
      ])
      if (account.assets.length > 0) {
        checkFields(t, account.assets[0], [
          'asset',
          'walletBalance',
          'unrealizedProfit',
          'marginBalance',
          'maintMargin',
          'initialMargin',
          'positionInitialMargin',
          'openOrderInitialMargin',
          'crossWalletBalance',
          'crossUnPnl',
          'availableBalance',
          'maxWithdrawAmount',
          'marginAvailable',
          'updateTime'
        ])
      }
      if (account.positions.length > 0) {
        checkFields(t, account.positions[0], [
          'symbol',
          'initialMargin',
          'maintMargin',
          'unrealizedProfit',
          'positionInitialMargin',
          'openOrderInitialMargin',
          'leverage',
          'isolated',
          'entryPrice',
          'maxNotional',
          'positionSide',
          'positionAmt',
          'updateTime'
        ])
      }
      t.pass()
    })
    test('[REST-FUTURES-TRADE] positionMarginChangeHistory', async t => {
      try {
        await client.authenticated.futures.trade.positionMarginChangeHistory({})
      } catch (e) {
        t.is(e.message, 'Method authenticated.futures.trade.positionMarginChangeHistory requires symbol parameter.')
      }
      const positionMarginChangeHistory = await client.authenticated.futures.trade.positionMarginChangeHistory({
        symbol: 'BTCUSDT'
      })
      t.true(Array.isArray(positionMarginChangeHistory))
      if (positionMarginChangeHistory.length > 0) {
        checkFields(t, positionMarginChangeHistory[0], [
          'amount',
          'asset',
          'symbol',
          'time',
          'type',
          'positionSide'
        ])
      }
      t.pass()
    })
    test('[REST-FUTURES-TRADE] position', async t => {
      const position = await client.authenticated.futures.trade.position()
      t.true(Array.isArray(position))
      if (position.length > 0) {
        checkFields(t, position[0], [
          'entryPrice',
          'marginType',
          'isAutoAddMargin',
          'isolatedMargin',
          'leverage',
          'liquidationPrice',
          'markPrice',
          'maxNotionalValue',
          'positionAmt',
          'symbol',
          'unRealizedProfit',
          'positionSide',
          'updateTime'
        ])
      }
      t.pass()
    })
    test('[REST-FUTURES-TRADE] trades', async t => {
      try {
        await client.authenticated.futures.trade.trades({})
      } catch (e) {
        t.is(e.message, 'Method authenticated.futures.trade.trades requires symbol parameter.')
      }
      const trades = await client.authenticated.futures.trade.trades({
        symbol: 'BTCUSDT'
      })
      t.true(Array.isArray(trades))
      if (trades.length > 0) {
        checkFields(t, trades[0], [
          'buyer',
          'commission',
          'commissionAsset',
          'id',
          'maker',
          'orderId',
          'price',
          'qty',
          'quoteQty',
          'realizedPnl',
          'side',
          'positionSide',
          'symbol',
          'time'
        ])
      }
      t.pass()
    })
    test('[REST-FUTURES-TRADE] incomeHistory', async t => {
      const incomeHistory = await client.authenticated.futures.trade.incomeHistory()
      t.true(Array.isArray(incomeHistory))
      if (incomeHistory.length > 0) {
        checkFields(t, incomeHistory[0], [
          'symbol',
          'incomeType',
          'income',
          'asset',
          'info',
          'time',
          'tranId',
          'tradeId'
        ])
      }
      t.pass()
    })
    test('[REST-FUTURES-TRADE] leverageBracket', async t => {
      const leverageBracket = await client.authenticated.futures.trade.leverageBracket()
      if (Object.keys(leverageBracket) > 0) {
        const brackets = leverageBracket[ Object.keys(leverageBracket)[0] ]
        t.true(Array.isArray(brackets))
        if (brackets.length > 0) {
          checkFields(t, brackets[0], [
            'bracket',
            'initialLeverage',
            'notionalCap',
            'notionalFloor',
            'maintMarginRatio',
            'cum'
          ])
        }
      }
      t.pass()
    })
    test('[REST-FUTURES-TRADE] positionADLQuantileEstimation', async t => {
      const positionADLQuantileEstimation = await client.authenticated.futures.trade.positionADLQuantileEstimation()
      if (Object.keys(positionADLQuantileEstimation) > 0) {
        const adlQuantile = positionADLQuantileEstimation[ Object.keys(positionADLQuantileEstimation)[0] ]
        checkFields(t, adlQuantile, [
          'LONG',
          'SHORT'
        ])
        t.true(adlQuantile.HEDGE !== undefined || adlQuantile.BOTH !== undefined)
      }
      t.pass()
    })
    test('[REST-FUTURES-TRADE] getForceOrders', async t => {
      const forceOrders = await client.authenticated.futures.trade.getForceOrders()
      t.true(Array.isArray(forceOrders))
      if (forceOrders.length > 0) {
        checkFields(t, forceOrders[0], [
          'orderId',
          'symbol',
          'status',
          'clientOrderId',
          'price',
          'avgPrice',
          'origQty',
          'executedQty',
          'cumQuote',
          'timeInForce',
          'type',
          'reduceOnly',
          'closePosition',
          'side',
          'positionSide',
          'stopPrice',
          'workingType',
          'origType',
          'time',
          'updateTime'
        ])
      }
      t.pass()
    })
    test('[REST-FUTURES-TRADE] APITradingQuantitativeRulesIndicators', async t => {
      const res = await client.authenticated.futures.trade.APITradingQuantitativeRulesIndicators()
      checkFields(t, res, [
        'indicators',
        'updateTime'
      ])
      if (Object.keys(res.indicators) > 0) {
        const symbolIndicatorList = res.indicators[ Object.keys(res.indicators)[0] ]
        t.true(Array.isArray(symbolIndicatorList))
        if (symbolIndicatorList.length > 0) {
          checkFields(t, symbolIndicatorList[0], [
            'isLocked',
            'plannedRecoverTime',
            'indicator',
            'value',
            'triggerValue'
          ])
        }
      }
      t.pass()
    })
    test('[REST-FUTURES-TRADE] commissionRate', async t => {
      try {
        await client.authenticated.futures.trade.commissionRate({})
      } catch (e) {
        t.is(e.message, 'Method authenticated.futures.trade.commissionRate requires symbol parameter.')
      }
      const commissionRate = await client.authenticated.futures.trade.commissionRate({
        symbol: 'BTCUSDT'
      })
      checkFields(t, commissionRate, [
        'symbol',
        'makerCommissionRate',
        'takerCommissionRate'
      ])
      t.pass()
    })
  }
  
  // WS-SPOT:
  test('[WS-SPOT] user', async t => {
    const clean = await client.ws.spot.user()
    t.truthy(clean)
    t.true(typeof clean === 'function')
  })
  // WS-MARGIN:
  test('[WS-MARGIN] user', async t => {
    const clean = await client.ws.margin.user()
    t.truthy(clean)
    t.true(typeof clean === 'function')
  })
  // WS-FUTURES:
  test('[WS-FUTURES] user', async t => {
    if (isFuturesEnabled) {
      const clean = await client.ws.futures.user()
      t.truthy(clean)
      t.true(typeof clean === 'function')
    }
    t.pass()
  })
}

// Add parameters here for additional tests.
main({
  isFuturesEnabled: false,
  isolatedMarginAccountExists: false,
  isSubAccountEnabled: false,
  orderListId: {}
})
