// Packages:
import test from 'ava'


// Imports:
import Binance, { ErrorCodes } from '../src'
import {
  candleFields,
  continuousKlineFields,
  indexAndMarkPriceKlineFields
} from '../src/REST/constants'
import { userEventHandler } from '../src/WebSocket'
import { checkFields, createHttpServer } from './utils'


// Constants:
const client = Binance()
const __IGNORE_TIMEOUT_TESTS__ = true


// MISC:
test('[MISC] Some error codes are defined', t => {
  t.truthy(ErrorCodes, 'The map is there')
  t.truthy(ErrorCodes.TOO_MANY_ORDERS, 'And we have this')
})

// REST-SPOT:
test('[REST-SPOT] systemStatus', async t => {
  t.truthy(await client.public.spot.wallet.systemStatus(), 'Pinging spot wallet system status should work')
})
test('[REST-SPOT] ping', async t => {
  t.truthy(await client.public.spot.marketData.ping(), 'Pinging spot endpoint should work')
})
test('[REST-SPOT] time', async t => {
  const ts = await client.public.spot.marketData.time()
  t.truthy(new Date(ts).getTime() > 0, 'The returned spot timestamp should be valid')
})
test('[REST-SPOT] exchangeInfo', async t => {
  const res = await client.public.spot.marketData.exchangeInfo()
  checkFields(t, res, [
    'timezone',
    'serverTime',
    'rateLimits',
    'exchangeFilters',
    'symbols'
  ])
})
test('[REST-SPOT] book', async t => {
  try {
    await client.public.spot.marketData.book()
  } catch (e) {
    t.is(e.message, 'You need to pass a payload object.')
  }
  try {
    await client.public.spot.marketData.book({})
  } catch (e) {
    t.is(e.message, 'Method book requires symbol parameter.')
  }
  const book = await client.public.spot.marketData.book({ symbol: 'ETHUSDT' })
  t.truthy(book.lastUpdateId)
  t.truthy(book.asks.length)
  t.truthy(book.bids.length)
  const [ bid ] = book.bids
  t.truthy(typeof bid.price === 'string')
  t.truthy(typeof bid.quantity === 'string')
})
test('[REST-SPOT] trades', async t => {
  try {
    await client.public.spot.marketData.trades({})
  } catch (e) {
    t.is(e.message, 'Method public.spot.marketData.trades requires symbol parameter.')
  }
  const trades = await client.public.spot.marketData.trades({ symbol: 'ETHUSDT' })
  t.is(trades.length, 500)
  const limitedTrades = await client.public.spot.marketData.trades({ symbol: 'ETHUSDT', limit: 10 })
  t.is(limitedTrades.length, 10)
  const [ trade ] = limitedTrades
  checkFields(t, trade, [
    'id',
    'price',
    'qty',
    'quoteQty',
    'time',
    'isBuyerMaker',
    'isBestMatch'
  ])
})
test('[REST-SPOT] aggTrades', async t => {
  try {
    await client.public.spot.marketData.aggTrades({})
  } catch (e) {
    t.is(e.message, 'Method aggTrades requires symbol parameter.')
  }
  const trades = await client.public.spot.marketData.aggTrades({ symbol: 'ETHUSDT' })
  t.truthy(trades.length)
  checkFields(t, trades[0], [
    'aggId',
    'symbol',
    'price',
    'quantity',
    'firstId',
    'lastId',
    'timestamp',
    'isBuyerMaker',
    'wasBestPrice'
  ])
})
test('[REST-SPOT] candles', async t => {
  try {
    await client.public.spot.marketData.candles({})
  } catch (e) {
    t.is(e.message, 'Method candles requires symbol parameter.')
  }
  const candles = await client.public.spot.marketData.candles({ symbol: 'ETHUSDT' })
  t.truthy(candles.length)
  const [ candle ] = candles
  checkFields(t, candle, candleFields)
})
test('[REST-SPOT] avgPrice', async t => {
  try {
    await client.public.spot.marketData.avgPrice({})
  } catch (e) {
    t.is(e.message, 'Method public.spot.marketData.avgPrice requires symbol parameter.')
  }
  const res = await client.public.spot.marketData.avgPrice({ symbol: 'ETHUSDT' })
  t.truthy(res)
  checkFields(t, res, [ 'mins', 'price' ])
})
test('[REST-SPOT] dailyTickerStats', async t => {
  const res = await client.public.spot.marketData.dailyTickerStats({ symbol: 'ETHUSDT' })
  t.truthy(res)
  checkFields(t, res, [
    'symbol',
    'priceChange',
    'priceChangePercent',
    'weightedAvgPrice',
    'prevClosePrice',
    'lastPrice',
    'lastQty',
    'bidPrice',
    'askPrice',
    'openPrice',
    'highPrice',
    'lowPrice',
    'volume',
    'quoteVolume',
    'openTime',
    'closeTime',
    'firstId',
    'lastId',
    'count'
  ])
})
test('[REST-SPOT] price (all)', async t => {
  const prices = await client.public.spot.marketData.price()
  t.truthy(prices)
  t.truthy(prices.ETHUSDT)
})
test('[REST-SPOT] price', async t => {
  const prices = await client.public.spot.marketData.price({ symbol: 'ETHUSDT' })
  t.truthy(prices)
  t.truthy(prices.ETHUSDT)
})
test('[REST-SPOT] bookTicker (all)', async t => {
  const bookTicker = await client.public.spot.marketData.bookTicker()
  t.truthy(bookTicker)
  t.truthy(bookTicker.ETHUSDT)
  checkFields(t, bookTicker.ETHUSDT, [
    'symbol',
    'bidPrice',
    'bidQty',
    'askPrice',
    'askQty'
  ])
})
test('[REST-SPOT] bookTicker', async t => {
  const bookTicker = await client.public.spot.marketData.bookTicker({ symbol: 'ETHUSDT' })
  t.truthy(bookTicker)
  t.truthy(bookTicker.ETHUSDT)
  checkFields(t, bookTicker.ETHUSDT, [
    'symbol',
    'bidPrice',
    'bidQty',
    'askPrice',
    'askQty'
  ])
})

// REST-FUTURES:
test('[REST-FUTURES] ping', async t => {
  t.truthy(await client.public.futures.marketData.ping(), 'Pinging futures endpoint should work')
})
test('[REST-FUTURES] time', async t => {
  const ts = await client.public.futures.marketData.time()
  t.truthy(new Date(ts).getTime() > 0, 'The returned futures timestamp should be valid')
})
test('[REST-FUTURES] exchangeInfo', async t => {
  const res = await client.public.futures.marketData.exchangeInfo()
  checkFields(t, res, [
    'rateLimits',
    'exchangeFilters',
    'serverTime',
    'assets',
    'symbols',
    'timezone'
  ])
})
test('[REST-FUTURES] book', async t => {
  try {
    await client.public.futures.marketData.book()
  } catch (e) {
    t.is(e.message, 'You need to pass a payload object.')
  }
  try {
    await client.public.futures.marketData.book({})
  } catch (e) {
    t.is(e.message, 'Method book requires symbol parameter.')
  }
  const book = await client.public.futures.marketData.book({ symbol: 'ETHUSDT' })
  t.truthy(book.lastUpdateId)
  t.truthy(book.messageOutputTime)
  t.truthy(book.transactionTime)
  t.truthy(book.asks.length)
  t.truthy(book.bids.length)
  const [ bid ] = book.bids
  t.truthy(typeof bid.price === 'string')
  t.truthy(typeof bid.quantity === 'string')
})
test('[REST-FUTURES] trades', async t => {
  try {
    await client.public.futures.marketData.trades({})
  } catch (e) {
    t.is(e.message, 'Method public.futures.marketData.trades requires symbol parameter.')
  }
  const trades = await client.public.futures.marketData.trades({ symbol: 'ETHUSDT' })
  t.is(trades.length, 500)
  const limitedTrades = await client.public.futures.marketData.trades({ symbol: 'ETHUSDT', limit: 10 })
  t.is(limitedTrades.length, 10)
  const [ trade ] = limitedTrades
  checkFields(t, trade, [
    'id',
    'price',
    'qty',
    'quoteQty',
    'time',
    'isBuyerMaker'
  ])
})
test('[REST-FUTURES] aggTrades', async t => {
  try {
    await client.public.spot.marketData.aggTrades({})
  } catch (e) {
    t.is(e.message, 'Method aggTrades requires symbol parameter.')
  }
  const trades = await client.public.spot.marketData.aggTrades({ symbol: 'ETHUSDT' })
  t.truthy(trades.length)
  const [ trade ] = trades
  checkFields(t, trade, [
    'aggId',
    'symbol',
    'price',
    'quantity',
    'firstId',
    'lastId',
    'timestamp',
    'isBuyerMaker'
  ])
})
test('[REST-FUTURES] candles', async t => {
  try {
    await client.public.futures.marketData.candles({})
  } catch (e) {
    t.is(e.message, 'Method candles requires symbol parameter.')
  }
  const candles = await client.public.futures.marketData.candles({ symbol: 'ETHUSDT' })
  t.truthy(candles.length)
  const [ candle ] = candles
  checkFields(t, candle, candleFields)
})
test('[REST-FUTURES] continuousKlines', async t => {
  try {
    await client.public.futures.marketData.continuousKlines({})
  } catch (e) {
    t.is(e.message, 'Method public.futures.marketData.continuousKlines requires pair parameter.')
  }
  try {
    await client.public.futures.marketData.continuousKlines({ pair: 'ETHUSDT' })
  } catch (e) {
    t.is(e.message, 'Method public.futures.marketData.continuousKlines requires contractType parameter.')
  }
  const continuousKlines = await client.public.futures.marketData.continuousKlines({
    pair: 'ETHUSDT',
    contractType: 'NEXT_QUARTER'
  })
  t.truthy(continuousKlines.length)
  const [ continuousKline ] = continuousKlines
  checkFields(t, continuousKline, continuousKlineFields)
})
test('[REST-FUTURES] indexPriceKlines', async t => {
  try {
    await client.public.futures.marketData.indexPriceKlines({})
  } catch (e) {
    t.is(e.message, 'Method public.futures.marketData.indexPriceKlines requires pair parameter.')
  }
  const indexPriceKlines = await client.public.futures.marketData.indexPriceKlines({ pair: 'ETHUSDT' })
  t.truthy(indexPriceKlines.length)
  const [ indexPriceKline ] = indexPriceKlines
  checkFields(t, indexPriceKline, indexAndMarkPriceKlineFields)
})
test('[REST-FUTURES] markPriceKlines', async t => {
  try {
    await client.public.futures.marketData.markPriceKlines({})
  } catch (e) {
    t.is(e.message, 'Method public.futures.marketData.markPriceKlines requires symbol parameter.')
  }
  const markPriceKlines = await client.public.futures.marketData.markPriceKlines({ symbol: 'ETHUSDT' })
  t.truthy(markPriceKlines.length)
  const [ markPriceKline ] = markPriceKlines
  checkFields(t, markPriceKline, indexAndMarkPriceKlineFields)
})
test('[REST-FUTURES] markPrice (all)', async t => {
  const markPrices = await client.public.futures.marketData.markPrice()
  t.truthy(Array.isArray(markPrices))
  checkFields(t, markPrices[0], [
    'symbol',
    'markPrice',
    'indexPrice',
    'estimatedSettlePrice',
    'lastFundingRate',
    'nextFundingTime',
    'interestRate',
    'time'
  ])
})
test('[REST-FUTURES] markPrice', async t => {
  const markPrice = await client.public.futures.marketData.markPrice({ symbol: 'ETHUSDT' })
  t.truthy(!Array.isArray(markPrice))
  t.truthy(markPrice)
  checkFields(t, markPrice, [
    'symbol',
    'markPrice',
    'indexPrice',
    'estimatedSettlePrice',
    'lastFundingRate',
    'nextFundingTime',
    'interestRate',
    'time'
  ])
})
test('[REST-FUTURES] fundingRateHistory', async t => {
  const fundingRateHistory = await client.public.futures.marketData.fundingRateHistory()
  checkFields(t, fundingRateHistory[0], [
    'symbol',
    'fundingRate',
    'fundingTime'
  ])
})
test('[REST-FUTURES] dailyTickerStats', async t => {
  const dailyTickerStats = await client.public.futures.marketData.dailyTickerStats({ symbol: 'ETHUSDT' })
  t.truthy(dailyTickerStats)
  checkFields(t, dailyTickerStats, [
    'symbol',
    'priceChange',
    'priceChangePercent',
    'weightedAvgPrice',
    'lastPrice',
    'lastQty',
    'openPrice',
    'highPrice',
    'lowPrice',
    'volume',
    'quoteVolume',
    'openTime',
    'closeTime',
    'firstId',
    'lastId',
    'count'
  ])
})
test('[REST-FUTURES] price (all)', async t => {
  const prices = await client.public.futures.marketData.price()
  t.truthy(prices)
  t.truthy(prices.ETHUSDT)
})
test('[REST-FUTURES] price', async t => {
  const prices = await client.public.futures.marketData.price({ symbol: 'ETHUSDT' })
  t.truthy(prices)
  t.truthy(prices.ETHUSDT)
})
test('[REST-FUTURES] bookTicker (all)', async t => {
  const bookTicker = await client.public.futures.marketData.bookTicker()
  t.truthy(bookTicker)
  t.truthy(bookTicker.ETHUSDT)
  checkFields(t, bookTicker.ETHUSDT, [
    'symbol',
    'bidPrice',
    'bidQty',
    'askPrice',
    'askQty',
    'time'
  ])
})
test('[REST-FUTURES] bookTicker', async t => {
  const bookTicker = await client.public.futures.marketData.bookTicker({ symbol: 'ETHUSDT' })
  t.truthy(bookTicker)
  t.truthy(bookTicker.ETHUSDT)
  checkFields(t, bookTicker.ETHUSDT, [
    'symbol',
    'bidPrice',
    'bidQty',
    'askPrice',
    'askQty',
    'time'
  ])
})
test('[REST-FUTURES] openInterest', async t => {
  try {
    await client.public.futures.marketData.openInterest({})
  } catch (e) {
    t.is(e.message, 'Method public.futures.marketData.openInterest requires symbol parameter.')
  }
  const openInterest = await client.public.futures.marketData.openInterest({ symbol: 'ETHUSDT' })
  checkFields(t, openInterest, [
    'openInterest',
    'symbol',
    'time'
  ])
})
test('[REST-FUTURES] openInterestHistory', async t => {
  try {
    await client.public.futures.marketData.openInterestHistory({})
  } catch (e) {
    t.is(e.message, 'Method public.futures.marketData.openInterestHistory requires symbol parameter.')
  }
  const openInterestHistory = await client.public.futures.marketData.openInterestHistory({ symbol: 'ETHUSDT' })
  t.truthy(Array.isArray(openInterestHistory))
  checkFields(t, openInterestHistory[0], [
    'symbol',
    'sumOpenInterest',
    'sumOpenInterestValue',
    'timestamp'
  ])
})
test('[REST-FUTURES] topLongShortPositionRatio', async t => {
  try {
    await client.public.futures.marketData.topLongShortPositionRatio({})
  } catch (e) {
    t.is(e.message, 'Method public.futures.marketData.topLongShortPositionRatio requires symbol parameter.')
  }
  const topLongShortPositionRatio = await client.public.futures.marketData.topLongShortPositionRatio({ symbol: 'ETHUSDT' })
  t.truthy(Array.isArray(topLongShortPositionRatio))
  checkFields(t, topLongShortPositionRatio[0], [
    'symbol',
    'longShortRatio',
    'longAccount',
    'shortAccount',
    'timestamp'
  ])
})
test('[REST-FUTURES] longShortRatio', async t => {
  try {
    await client.public.futures.marketData.longShortRatio({})
  } catch (e) {
    t.is(e.message, 'Method public.futures.marketData.longShortRatio requires symbol parameter.')
  }
  const longShortRatio = await client.public.futures.marketData.longShortRatio({ symbol: 'ETHUSDT' })
  t.truthy(Array.isArray(longShortRatio))
  checkFields(t, longShortRatio[0], [
    'symbol',
    'longShortRatio',
    'longAccount',
    'shortAccount',
    'timestamp'
  ])
})
test('[REST-FUTURES] takerBuySellVolume', async t => {
  try {
    await client.public.futures.marketData.takerBuySellVolume({})
  } catch (e) {
    t.is(e.message, 'Method public.futures.marketData.takerBuySellVolume requires symbol parameter.')
  }
  const takerBuySellVolume = await client.public.futures.marketData.takerBuySellVolume({ symbol: 'ETHUSDT' })
  t.truthy(Array.isArray(takerBuySellVolume))
  checkFields(t, takerBuySellVolume[0], [
    'buySellRatio',
    'buyVol',
    'sellVol',
    'timestamp'
  ])
})
test('[REST-FUTURES] historicalBLVTNAVKlines', async t => {
  try {
    await client.public.futures.marketData.historicalBLVTNAVKlines({})
  } catch (e) {
    t.is(e.message, 'Method public.futures.marketData.historicalBLVTNAVKlines requires symbol parameter.')
  }
  const historicalBLVTNAVKlines = await client.public.futures.marketData.historicalBLVTNAVKlines({ symbol: 'BTCDOWN' })
  t.truthy(Array.isArray(historicalBLVTNAVKlines))
  checkFields(t, historicalBLVTNAVKlines[0], [
    'openTime',
    'open',
    'high',
    'low',
    'close',
    'realLeverage',
    'closeTime',
    'NAVUpdateCount'
  ])
})
test('[REST-FUTURES] compositeIndexSymbolInfo', async t => {
  const compositeIndexSymbolInfo = await client.public.futures.marketData.compositeIndexSymbolInfo()
  checkFields(t, compositeIndexSymbolInfo[0], [
    'symbol',
    'time',
    'component',
    'baseAssetList'
  ])
  checkFields(t, compositeIndexSymbolInfo[0].baseAssetList[0], [
    'baseAsset',
    'quoteAsset',
    'weightInQuantity',
    'weightInPercentage'
  ])
})

// REST-MISC:
test('[REST-MISC] Signed call without creds', async t => {
  try {
    await client.authenticated.spot.trade.account()
  } catch (e) {
    t.is(e.message, 'You need to pass an API key and secret to make authenticated calls.')
  }
})
test('[REST-MISC] Signed call without creds - attempt getting tradeFee', async t => {
  try {
    await client.authenticated  .spot.wallet.tradeFee()
  } catch (e) {
    t.is(e.message, 'You need to pass an API key and secret to make authenticated calls.')
  }
})
test('[REST-MISC] Server-side JSON error', async t => {
  const server = createHttpServer((req, res) => {
    res.statusCode = 500
    res.write(
      JSON.stringify({
        msg: 'Server unkown error',
        code: -1337,
      }),
    )
    res.end()
  })
  const localClient = Binance({ httpBase: server.url })
  try {
    await server.start()
    await localClient.public.spot.marketData.ping()
    t.fail('did not throw')
  } catch (e) {
    t.is(e.message, 'Server unkown error')
    t.is(e.code, -1337)
  } finally {
    await server.stop()
  }
})
test('[REST-MISC] Server-side HTML error', async t => {
  const serverReponse = '<html>Server Internal Error</html>'
  const server = createHttpServer((req, res) => {
    res.statusCode = 500
    res.write(serverReponse)
    res.end()
  })
  const localClient = Binance({ httpBase: server.url })
  try {
    await server.start()
    await localClient.public.spot.marketData.ping()
    t.fail('did not throw')
  } catch (e) {
    t.is(e.message, `500 Internal Server Error ${ serverReponse }`)
    t.truthy(e.response)
    t.is(e.responseText, serverReponse)
  } finally {
    await server.stop()
  }
})

// WS-SPOT:
test('[WS-SPOT] aggTrades', t => {
  return new Promise(resolve => {
    client.ws.spot.aggTrades([ 'BNBBTC', 'ETHUSDT', 'BNTBTC' ], trade => {
      checkFields(t, trade, [
        'eventType',
        'eventTime',
        'timestamp',
        'symbol',
        'price',
        'quantity',
        'aggId',
        'firstId',
        'lastId',
        'isBuyerMaker',
        'wasBestPrice'
      ])
      resolve()
    })
  })
})
test('[WS-SPOT] trades', t => {
  return new Promise(resolve => {
    client.ws.spot.trades([ 'BNBBTC', 'ETHUSDT', 'BNTBTC' ], trade => {
      checkFields(t, trade, [
        'eventType',
        'eventTime',
        'tradeTime',
        'symbol',
        'price',
        'quantity',
        'isBuyerMaker',
        'maker',
        'tradeId',
        'buyerOrderId',
        'sellerOrderId'
      ])
      resolve()
    })
  })
})
test('[WS-SPOT] candles', t => {
  try {
    client.ws.spot.candles('ETHUSDT', d => d)
  } catch (e) {
    t.is(e.message, 'Please pass a symbol, interval and a callback.')
  }
  return new Promise(resolve => {
    client.ws.spot.candles([ 'ETHUSDT', 'BNBBTC', 'BNTBTC' ], '5m', candle => {
      checkFields(t, candle, [
        'eventType',
        'eventTime',
        'symbol',
        'startTime',
        'closeTime',
        'firstTradeId',
        'lastTradeId',
        'open',
        'high',
        'low',
        'close',
        'volume',
        'trades',
        'interval',
        'isFinal',
        'quoteVolume',
        'buyVolume',
        'quoteBuyVolume'
      ])
      resolve()
    })
  })
})
test('[WS-SPOT] miniTicker', t => {
  return new Promise(resolve => {
    client.ws.spot.miniTicker('ETHUSDT', miniTicker => {
      checkFields(t, miniTicker, [
        'eventType',
        'eventTime',
        'symbol',
        'curDayClose',
        'open',
        'high',
        'low',
        'volume',
        'volumeQuote'
      ])
      resolve()
    })
  })
})
test('[WS-SPOT] allMiniTickers', t => {
  return new Promise(resolve => {
    client.ws.spot.allMiniTickers(allMiniTickers => {
      t.truthy(Array.isArray(allMiniTickers))
      t.is(allMiniTickers[0].eventType, '24hrMiniTicker')
      checkFields(t, allMiniTickers[0], [
        'eventType',
        'eventTime',
        'symbol',
        'curDayClose',
        'open',
        'high',
        'low',
        'volume',
        'volumeQuote'
      ])
      resolve()
    })
  })
})
test('[WS-SPOT] ticker', t => {
  return new Promise(resolve => {
    client.ws.spot.ticker('ETHUSDT', ticker => {
      checkFields(t, ticker, [
        'eventType',
        'eventTime',
        'symbol',
        'priceChange',
        'priceChangePercent',
        'weightedAvg',
        'prevDayClose',
        'curDayClose',
        'closeTradeQuantity',
        'bestBid',
        'bestBidQnt',
        'bestAsk',
        'bestAskQnt',
        'open',
        'high',
        'low',
        'volume',
        'volumeQuote',
        'openTime',
        'closeTime',
        'firstTradeId',
        'lastTradeId',
        'totalTrades'
      ])
      resolve()
    })
  })
})
test('[WS-SPOT] allTickers', t => {
  return new Promise(resolve => {
    client.ws.spot.allTickers(tickers => {
      t.truthy(Array.isArray(tickers))
      t.is(tickers[0].eventType, '24hrTicker')
      checkFields(t, tickers[0], [
        'eventType',
        'eventTime',
        'symbol',
        'priceChange',
        'priceChangePercent',
        'weightedAvg',
        'prevDayClose',
        'curDayClose',
        'closeTradeQuantity',
        'bestBid',
        'bestBidQnt',
        'bestAsk',
        'bestAskQnt',
        'open',
        'high',
        'low',
        'volume',
        'volumeQuote',
        'openTime',
        'closeTime',
        'firstTradeId',
        'lastTradeId',
        'totalTrades'
      ])
      resolve()
    })
  })
})
test('[WS-SPOT] bookTicker', t => {
  return new Promise(resolve => {
    client.ws.spot.bookTicker('ETHUSDT', bookTicker => {
      checkFields(t, bookTicker, [
        'updateId',
        'symbol',
        'bestBid',
        'bestBidQnt',
        'bestAsk',
        'bestAskQnt'
      ])
      resolve()
    })
  })
})
test('[WS-SPOT] allBookTickers', t => {
  return new Promise(resolve => {
    client.ws.spot.allBookTickers(allBookTickers => {
      checkFields(t, allBookTickers, [
        'updateId',
        'symbol',
        'bestBid',
        'bestBidQnt',
        'bestAsk',
        'bestAskQnt'
      ])
      resolve()
    })
  })
})
if (!__IGNORE_TIMEOUT_TESTS__) {
  test('[WS-SPOT] partialDepth', t => {
    return new Promise(resolve => {
      client.ws.spot.partialDepth({ symbol: 'ETHUSDT', level: 10 }, partialDepth => {
        checkFields(t, partialDepth, [
          'symbol',
          'level',
          'lastUpdateId',
          'bids',
          'asks'
        ])
        resolve()
      })
    })
  })
  test('[WS-SPOT] partialDepth (with update speed)', t => {
    return new Promise(resolve => {
      client.ws.spot.partialDepth({ symbol: 'ETHUSDT', level: 10, updateSpeed: '100ms' }, partialDepth => {
        checkFields(t, partialDepth, [
          'symbol',
          'level',
          'lastUpdateId',
          'bids',
          'asks'
        ])
        resolve()
      })
    })
  })
  test('[WS-SPOT] depth', t => {
    return new Promise(resolve => {
      client.ws.spot.depth({ symbol: 'ETHUSDT' }, depth => {
        checkFields(t, depth, [
          'eventType',
          'eventTime',
          'symbol',
          'firstUpdateId',
          'finalUpdateId',
          'bidDepth',
          'askDepth'
        ])
        resolve()
      })
    })
  })
  test('[WS-SPOT] depth (with update speed)', t => {
    return new Promise(resolve => {
      client.ws.spot.depth({ symbol: 'ETHUSDT', updateSpeed: '100ms' }, depth => {
        checkFields(t, depth, [
          'eventType',
          'eventTime',
          'symbol',
          'firstUpdateId',
          'finalUpdateId',
          'bidDepth',
          'askDepth'
        ])
        resolve()
      })
    })
  })
}


// WS-FUTURES:
test('[WS-FUTURES] aggTrades', t => {
  return new Promise(resolve => {
    client.ws.futures.aggTrades([ 'BNBBTC', 'ETHUSDT', 'BNTBTC' ], aggTrade => {
      checkFields(t, aggTrade, [
        'eventType',
        'eventTime',
        'symbol',
        'aggId',
        'price',
        'quantity',
        'firstId',
        'lastId',
        'timestamp',
        'isBuyerMaker'
      ])
      resolve()
    })
  })
})
test('[WS-FUTURES] markPrice', t => {
  return new Promise(resolve => {
    client.ws.futures.markPrice([ { symbol: 'BNBBTC'}, { symbol: 'ETHUSDT' }, { symbol: 'BNTBTC' } ], markPrice => {
      checkFields(t, markPrice, [
        'eventType',
        'eventTime',
        'symbol',
        'markPrice',
        'indexPrice',
        'estimatedSettlePrice',
        'fundingRate',
        'nextFundingTime'
      ])
      resolve()
    })
  })
})
test('[WS-FUTURES] allMarkPrices', t => {
  return new Promise(resolve => {
    client.ws.futures.allMarkPrices({}, allMarkPrices => {
      checkFields(t, allMarkPrices[0], [
        'eventType',
        'eventTime',
        'symbol',
        'markPrice',
        'indexPrice',
        'estimatedSettlePrice',
        'fundingRate',
        'nextFundingTime'
      ])
      resolve()
    })
  })
})
test('[WS-FUTURES] candles', t => {
  try {
    client.ws.futures.candles('ETHUSDT', d => d)
  } catch (e) {
    t.is(e.message, 'Please pass a symbol, interval and a callback.')
  }
  return new Promise(resolve => {
    client.ws.futures.candles([ 'ETHUSDT', 'BNBBTC', 'BNTBTC' ], '5m', candle => {
      checkFields(t, candle, [
        'eventType',
        'eventTime',
        'symbol',
        'startTime',
        'closeTime',
        'firstTradeId',
        'lastTradeId',
        'open',
        'high',
        'low',
        'close',
        'volume',
        'trades',
        'interval',
        'isFinal',
        'quoteVolume',
        'buyVolume',
        'quoteBuyVolume'
      ])
      resolve()
    })
  })
})
test('[WS-FUTURES] continuousKlines', t => {
  try {
    client.ws.futures.continuousKlines({ pair: 'ETHUSDT', contractType: 'perpetual' }, d => d)
  } catch (e) {
    t.is(e.message, 'Please pass a pair, contractType, interval and a callback.')
  }
  return new Promise(resolve => {
    client.ws.futures.continuousKlines([
      { pair: 'ETHUSDT', contractType: 'perpetual' },
      { pair: 'BNBBTC', contractType: 'current_quarter' },
      { pair: 'BNTBTC', contractType: 'next_quarter' }
    ], '5m', continuousKline => {
      checkFields(t, continuousKline, [
        'eventType',
        'eventTime',
        'pair',
        'contractType',
        'startTime',
        'closeTime',
        'interval',
        'firstTradeId',
        'lastTradeId',
        'open',
        'close',
        'high',
        'low',
        'volume',
        'trades',
        'isFinal',
        'quoteVolume',
        'buyVolume',
        'quoteBuyVolume'
      ])
      resolve()
    })
  })
})
test('[WS-FUTURES] miniTicker', t => {
  return new Promise(resolve => {
    client.ws.futures.miniTicker('ETHUSDT', miniTicker => {
      checkFields(t, miniTicker, [
        'eventType',
        'eventTime',
        'symbol',
        'curDayClose',
        'open',
        'high',
        'low',
        'volume',
        'volumeQuote'
      ])
      resolve()
    })
  })
})
test('[WS-FUTURES] allMiniTickers', t => {
  return new Promise(resolve => {
    client.ws.futures.allMiniTickers(allMiniTickers => {
      t.truthy(Array.isArray(allMiniTickers))
      t.is(allMiniTickers[0].eventType, '24hrMiniTicker')
      checkFields(t, allMiniTickers[0], [
        'eventType',
        'eventTime',
        'symbol',
        'curDayClose',
        'open',
        'high',
        'low',
        'volume',
        'volumeQuote'
      ])
      resolve()
    })
  })
})
test('[WS-FUTURES] ticker', t => {
  return new Promise(resolve => {
    client.ws.futures.ticker('ETHUSDT', ticker => {
      checkFields(t, ticker, [
        'eventType',
        'eventTime',
        'symbol',
        'priceChange',
        'priceChangePercent',
        'weightedAvg',
        'curDayClose',
        'closeTradeQuantity',
        'open',
        'high',
        'low',
        'volume',
        'volumeQuote',
        'openTime',
        'closeTime',
        'firstTradeId',
        'lastTradeId',
        'totalTrades'
      ])
      resolve()
    })
  })
})
test('[WS-FUTURES] allTickers', t => {
  return new Promise(resolve => {
    client.ws.futures.allTickers(tickers => {
      t.truthy(Array.isArray(tickers))
      t.is(tickers[0].eventType, '24hrTicker')
      checkFields(t, tickers[0], [
        'eventType',
        'eventTime',
        'symbol',
        'priceChange',
        'priceChangePercent',
        'weightedAvg',
        'curDayClose',
        'closeTradeQuantity',
        'open',
        'high',
        'low',
        'volume',
        'volumeQuote',
        'openTime',
        'closeTime',
        'firstTradeId',
        'lastTradeId',
        'totalTrades'
      ])
      resolve()
    })
  })
})
test('[WS-FUTURES] bookTicker', t => {
  return new Promise(resolve => {
    client.ws.futures.bookTicker('ETHUSDT', bookTicker => {
      checkFields(t, bookTicker, [
        'eventType',
        'updateId',
        'eventTime',
        'transactionTime',
        'symbol',
        'bestBid',
        'bestBidQnt',
        'bestAsk',
        'bestAskQnt'
      ])
      resolve()
    })
  })
})
test('[WS-FUTURES] allBookTickers', t => {
  return new Promise(resolve => {
    client.ws.futures.allBookTickers(bookTickers => {
      t.is(bookTickers.eventType, 'bookTicker')
      checkFields(t, bookTickers, [
        'eventType',
        'updateId',
        'eventTime',
        'transactionTime',
        'symbol',
        'bestBid',
        'bestBidQnt',
        'bestAsk',
        'bestAskQnt'
      ])
      resolve()
    })
  })
})
if (!__IGNORE_TIMEOUT_TESTS__) {
  test('[WS-FUTURES] liquidation', t => {
    return new Promise(resolve => {
      client.ws.futures.liquidation('ETHUSDT', liquidation => {
        checkFields(t, liquidation, [
          'symbol',
          'price',
          'origQty',
          'lastFilledQty',
          'accumulatedQty',
          'averagePrice',
          'status',
          'timeInForce',
          'type',
          'side',
          'time'
        ])
        resolve()
      })
    })
  })
}
test('[WS-FUTURES] allLiquidations', t => {
  return new Promise(resolve => {
    client.ws.futures.allLiquidations(liquidation => {
      checkFields(t, liquidation, [
        'symbol',
        'price',
        'origQty',
        'lastFilledQty',
        'accumulatedQty',
        'averagePrice',
        'status',
        'timeInForce',
        'type',
        'side',
        'time',
      ])
      resolve()
    })
  })
})
if (!__IGNORE_TIMEOUT_TESTS__) {
  test('[WS-FUTURES] partialDepth', t => {
    return new Promise(resolve => {
      client.ws.futures.partialDepth({ symbol: 'ETHUSDT', level: 10 }, partialDepth => {
        checkFields(t, partialDepth, [
          'level',
          'eventType',
          'eventTime',
          'transactionTime',
          'symbol',
          'firstUpdateId',
          'finalUpdateId',
          'prevFinalUpdateId',
          'bidDepth',
          'askDepth'
        ])
        resolve()
      })
    })
  })
  test('[WS-FUTURES] partialDepth (with update speed)', t => {
    return new Promise(resolve => {
      client.ws.futures.partialDepth({ symbol: 'ETHUSDT', level: 10, updateSpeed: '100ms' }, partialDepth => {
        checkFields(t, partialDepth, [
          'level',
          'eventType',
          'eventTime',
          'transactionTime',
          'symbol',
          'firstUpdateId',
          'finalUpdateId',
          'prevFinalUpdateId',
          'bidDepth',
          'askDepth'
        ])
        resolve()
      })
    })
  })
  test('[WS-FUTURES] depth', t => {
    return new Promise(resolve => {
      client.ws.futures.depth({ symbol: 'ETHUSDT' }, depth => {
        checkFields(t, depth, [
          'eventType',
          'eventTime',
          'transactionTime',
          'symbol',
          'firstUpdateId',
          'finalUpdateId',
          'prevFinalUpdateId',
          'bidDepth',
          'askDepth'
        ])
        resolve()
      })
    })
  })
  test('[WS-FUTURES] depth (with update speed)', t => {
    return new Promise(resolve => {
      client.ws.futures.depth({ symbol: 'ETHUSDT', updateSpeed: '100ms' }, depth => {
        checkFields(t, depth, [
          'eventType',
          'eventTime',
          'transactionTime',
          'symbol',
          'firstUpdateId',
          'finalUpdateId',
          'prevFinalUpdateId',
          'bidDepth',
          'askDepth'
        ])
        resolve()
      })
    })
  })
}
test('[WS-FUTURES-BLVT] info', t => {
  return new Promise(resolve => {
    client.ws.futures.BLVT.info('TRXDOWN', info => {
      checkFields(t, info, [
        'eventType',
        'eventTime',
        'name',
        'tokenIssued',
        'baskets',
        'nav',
        'realLeverage',
        'targetLeverage',
        'fundingRatio'
      ])
      resolve()
    })
  })
})
if (!__IGNORE_TIMEOUT_TESTS__) {
  test('[WS-FUTURES-BLVT] candles', t => {
    try {
      client.ws.futures.BLVT.candles('TRXDOWN', d => d)
    } catch (e) {
      t.is(e.message, 'Please pass a symbol, interval and a callback.')
    }
    return new Promise(resolve => {
      client.ws.futures.BLVT.candles('TRXDOWN', '5m', candle => {
        checkFields(t, candle, [
          'eventType',
          'eventTime',
          'symbol',
          'startTime',
          'closeTime',
          'firstTradeId',
          'lastTradeId',
          'open',
          'high',
          'low',
          'close',
          'volume',
          'trades',
          'interval',
          'isFinal',
          'quoteVolume',
          'buyVolume',
          'quoteBuyVolume'
        ])
        resolve()
      })
    })
  })
  test('[WS-FUTURES] compositeIndex', t => {
    return new Promise(resolve => {
      client.ws.futures.compositeIndex('ETHUSDT', compositeIndex => {
        checkFields(t, compositeIndex, [
          'eventType',
          'eventTime',
          'symbol',
          'price',
          'baseAsset',
          'composition'
        ])
        checkFields(t, compositeIndex.composition[0], [
          'baseAsset',
          'quoteAsset',
          'weightInQuantity',
          'weightInPercentage',
          'indexPrice'
        ])
        resolve()
      })
    })
  })
}

// WS-MISC:
test('[WS-MISC] userEvents', t => {
  const accountPayload = {
    e: 'outboundAccountInfo',
    E: 1499405658849,
    m: 0,
    t: 0,
    b: 0,
    s: 0,
    T: true,
    W: true,
    D: true,
    u: 1499405658849,
    B: [
      {
        a: 'LTC',
        f: '17366.18538083',
        l: '0.00000000',
      },
      {
        a: 'BTC',
        f: '10537.85314051',
        l: '2.19464093',
      },
      {
        a: 'ETH',
        f: '17902.35190619',
        l: '0.00000000',
      },
      {
        a: 'BNC',
        f: '1114503.29769312',
        l: '0.00000000',
      },
      {
        a: 'NEO',
        f: '0.00000000',
        l: '0.00000000',
      },
    ],
  }
  userEventHandler(res => {
    t.deepEqual(res, {
      eventType: 'account',
      eventTime: 1499405658849,
      makerCommissionRate: 0,
      takerCommissionRate: 0,
      buyerCommissionRate: 0,
      sellerCommissionRate: 0,
      canTrade: true,
      canWithdraw: true,
      canDeposit: true,
      lastAccountUpdate: 1499405658849,
      balances: {
        LTC: { available: '17366.18538083', locked: '0.00000000' },
        BTC: { available: '10537.85314051', locked: '2.19464093' },
        ETH: { available: '17902.35190619', locked: '0.00000000' },
        BNC: { available: '1114503.29769312', locked: '0.00000000' },
        NEO: { available: '0.00000000', locked: '0.00000000' },
      },
    })
  })({ data: JSON.stringify(accountPayload) })
  const orderPayload = {
    e: 'executionReport',
    E: 1499405658658,
    s: 'ETHUSDT',
    c: 'mUvoqJxFIILMdfAW5iGSOW',
    S: 'BUY',
    o: 'LIMIT',
    f: 'GTC',
    q: '1.00000000',
    p: '0.10264410',
    P: '0.10285410',
    F: '0.00000000',
    g: -1,
    C: 'null',
    x: 'NEW',
    X: 'NEW',
    r: 'NONE',
    i: 4293153,
    l: '0.00000000',
    z: '0.00000000',
    L: '0.00000000',
    n: '0',
    N: null,
    T: 1499405658657,
    t: -1,
    I: 8641984,
    w: true,
    m: false,
    M: false,
    O: 1499405658657,
    Q: 0,
    Y: 0,
    Z: '0.00000000',
  }
  userEventHandler(res => {
    t.deepEqual(res, {
      eventType: 'executionReport',
      eventTime: 1499405658658,
      symbol: 'ETHUSDT',
      newClientOrderId: 'mUvoqJxFIILMdfAW5iGSOW',
      originalClientOrderId: 'null',
      side: 'BUY',
      orderType: 'LIMIT',
      timeInForce: 'GTC',
      quantity: '1.00000000',
      price: '0.10264410',
      stopPrice: '0.10285410',
      executionType: 'NEW',
      icebergQuantity: '0.00000000',
      orderStatus: 'NEW',
      orderRejectReason: 'NONE',
      orderId: 4293153,
      orderTime: 1499405658657,
      lastTradeQuantity: '0.00000000',
      totalTradeQuantity: '0.00000000',
      priceLastTrade: '0.00000000',
      commission: '0',
      commissionAsset: null,
      tradeId: -1,
      isOrderWorking: true,
      isBuyerMaker: false,
      creationTime: 1499405658657,
      totalQuoteTradeQuantity: '0.00000000',
      lastQuoteTransacted: 0,
      orderListId: -1,
      quoteOrderQuantity: 0,
    })
  })({ data: JSON.stringify(orderPayload) })
  const tradePayload = {
    e: 'executionReport',
    E: 1499406026404,
    s: 'ETHUSDT',
    c: '1hRLKJhTRsXy2ilYdSzhkk',
    S: 'BUY',
    o: 'LIMIT',
    f: 'GTC',
    q: '22.42906458',
    p: '0.10279999',
    P: '0.10280001',
    F: '0.00000000',
    g: -1,
    C: 'null',
    x: 'TRADE',
    X: 'FILLED',
    r: 'NONE',
    i: 4294220,
    l: '17.42906458',
    z: '22.42906458',
    L: '0.10279999',
    n: '0.00000001',
    N: 'BNC',
    T: 1499406026402,
    t: 77517,
    I: 8644124,
    w: false,
    m: false,
    M: true,
    O: 1499405658657,
    Q: 0,
    Y: 0,
    Z: '2.30570761',
  }
  userEventHandler(res => {
    t.deepEqual(res, {
      eventType: 'executionReport',
      eventTime: 1499406026404,
      symbol: 'ETHUSDT',
      newClientOrderId: '1hRLKJhTRsXy2ilYdSzhkk',
      originalClientOrderId: 'null',
      side: 'BUY',
      orderType: 'LIMIT',
      timeInForce: 'GTC',
      quantity: '22.42906458',
      price: '0.10279999',
      stopPrice: '0.10280001',
      executionType: 'TRADE',
      icebergQuantity: '0.00000000',
      orderStatus: 'FILLED',
      orderRejectReason: 'NONE',
      orderId: 4294220,
      orderTime: 1499406026402,
      lastTradeQuantity: '17.42906458',
      totalTradeQuantity: '22.42906458',
      priceLastTrade: '0.10279999',
      commission: '0.00000001',
      commissionAsset: 'BNC',
      tradeId: 77517,
      isOrderWorking: false,
      isBuyerMaker: false,
      creationTime: 1499405658657,
      totalQuoteTradeQuantity: '2.30570761',
      lastQuoteTransacted: 0,
      orderListId: -1,
      quoteOrderQuantity: 0,
    })
  })({ data: JSON.stringify(tradePayload) })
  const newEvent = { e: 'totallyNewEvent', yolo: 42 }
  userEventHandler(res => {
    t.deepEqual(res, { type: 'totallyNewEvent', yolo: 42 })
  })({ data: JSON.stringify(newEvent) })
})
