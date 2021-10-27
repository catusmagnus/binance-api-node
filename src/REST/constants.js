// Exports:
export const BASE = 'https://api.binance.com'

export const FUTURES = 'https://fapi.binance.com'

// Get API limits info from headers.
export const headersMapping = {
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
  'closeTime',
  'bisicData'
]

export const historicalBLVTNAVKlineFields = [
  'openTime',
  'open',
  'high',
  'low',
  'close',
  'realLeverage',
  'closeTime',
  'NAVUpdateCount'
]
