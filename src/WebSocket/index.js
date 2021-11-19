// Packages:
import RESTMethods from '../REST'
import openWebSocket from './open-websocket'
import {
  aggTradesTransform,
  tradesTransform,
  miniTickerTransform,
  tickerTransform,
  bookTickerTransform,
  partialDepthTransform,
  depthTransform,
  userTransforms,
  markPriceTransform,
  liquidationTransform,
  infoTransform,
  compositeIndexTransform,
} from './transforms'
import spotWebSocket from './spot'
import marginWebSocket from './margin'
import futuresWebSocket from './futures'


// State:
const endpoints = {
  base: 'wss://stream.binance.com:9443/ws',
  futures: 'wss://fstream.binance.com/ws',
}


// Functions:
export const aggTrades = (payload, cb, transform = true, variator) => {
  const cache = (Array.isArray(payload) ? payload : [ payload ]).map(symbol => {
    const w = openWebSocket(
      `${ variator === 'futures' ? endpoints.futures : endpoints.base }/${ symbol.toLowerCase() }@aggTrade`,
    )
    w.onmessage = msg => {
      const obj = JSON.parse(msg.data)
      cb(
        transform ?
          variator === 'futures' ?
            aggTradesTransform.futures(obj)
          :
            aggTradesTransform.spot(obj)
        :
          obj,
      )
    }
    return w
  })
  return options =>
    cache.forEach(w => w.close(1000, 'Close handle was called', { keepClosed: true, ...options }))
}

export const trades = (payload, cb, transform = true) => {
  const cache = (Array.isArray(payload) ? payload : [ payload ]).map(symbol => {
    const w = openWebSocket(`${ endpoints.base }/${ symbol.toLowerCase() }@trade`)
    w.onmessage = msg => {
      const obj = JSON.parse(msg.data)
      cb(transform ? tradesTransform(obj) : obj)
    }
    return w
  })
  return options =>
    cache.forEach(w => w.close(1000, 'Close handle was called', { keepClosed: true, ...options }))
}

export const candles = (payload, interval, cb, transform = true, variator, isBLVT = false) => {
  if (!interval || !cb) throw new Error(`Please pass a ${ isBLVT ? 'tokenName' : 'symbol' }, interval and a callback.`)
  const cache = (Array.isArray(payload) ? payload : [ payload ]).map(symbol => {
    const w = openWebSocket(
      `${
        variator === 'futures' ?
          endpoints.futures
        :
          endpoints.base
      }/${ symbol.toLowerCase() }@${ isBLVT ? 'nav_Kline_' : 'kline_' }${ interval }`
    )
    w.onmessage = msg => {
      const obj = JSON.parse(msg.data)
      const { e: eventType, E: eventTime, s: symbol, k: tick } = obj
      const {
        t: startTime,
        T: closeTime,
        f: firstTradeId,
        L: lastTradeId,
        o: open,
        h: high,
        l: low,
        c: close,
        v: volume,
        n: trades,
        i: interval,
        x: isFinal,
        q: quoteVolume,
        V: buyVolume,
        Q: quoteBuyVolume
      } = tick
      cb(
        transform ?
          {
            eventType,
            eventTime,
            symbol,
            startTime,
            closeTime,
            firstTradeId,
            lastTradeId,
            open,
            high,
            low,
            close,
            volume,
            trades,
            interval,
            isFinal,
            quoteVolume,
            buyVolume,
            quoteBuyVolume
          }
        :
          obj
      )
    }
    return w
  })
  return options =>
    cache.forEach(w => w.close(1000, 'Close handle was called', { keepClosed: true, ...options }))
}

export const miniTicker = (payload, cb, transform = true, variator) => {
  const cache = (Array.isArray(payload) ? payload : [ payload ]).map(symbol => {
    const w = openWebSocket(
      `${ variator === 'futures' ? endpoints.futures : endpoints.base }/${ symbol.toLowerCase() }@miniTicker`
    )
    w.onmessage = msg => {
      const obj = JSON.parse(msg.data)
      cb(transform ? miniTickerTransform(obj) : obj)
    }
    return w
  })
  return options =>
    cache.forEach(w => w.close(1000, 'Close handle was called', { keepClosed: true, ...options }))
}

export const allMiniTickers = (cb, transform = true, variator) => {
  const w = openWebSocket(`${ variator === 'futures' ? endpoints.futures : endpoints.base }/!miniTicker@arr`)
    w.onmessage = msg => {
      const arr = JSON.parse(msg.data)
      cb(transform ? arr.map(m => miniTickerTransform(m)) : arr)
    }
  return options => w.close(1000, 'Close handle was called', { keepClosed: true, ...options })
}

export const ticker = (payload, cb, transform = true, variator) => {
  const cache = (Array.isArray(payload) ? payload : [ payload ]).map(symbol => {
    const w = openWebSocket(
      `${ variator === 'futures' ? endpoints.futures : endpoints.base }/${ symbol.toLowerCase() }@ticker`,
    )
    w.onmessage = msg => {
      const obj = JSON.parse(msg.data)
      cb(
        transform ?
          variator === 'futures' ?
            tickerTransform.futures(obj)
          :
            tickerTransform.spot(obj)
        :
          obj,
      )
    }
    return w
  })
  return options =>
    cache.forEach(w => w.close(1000, 'Close handle was called', { keepClosed: true, ...options }))
}

export const allTickers = (cb, transform = true, variator) => {
  const w = new openWebSocket(
    `${ variator === 'futures' ? endpoints.futures : endpoints.base }/!ticker@arr`,
  )
  w.onmessage = msg => {
    const arr = JSON.parse(msg.data)
    cb(
      transform ?
        variator === 'futures' ?
          arr.map(m => tickerTransform.futures(m))
        :
          arr.map(m => tickerTransform.spot(m))
      :
        arr,
    )
  }
  return options => w.close(1000, 'Close handle was called', { keepClosed: true, ...options })
}

export const bookTicker = (payload, cb, transform = true, variator) => {
  const cache = (Array.isArray(payload) ? payload : [ payload ]).map(symbol => {
    const w = openWebSocket(
      `${ variator === 'futures' ? endpoints.futures : endpoints.base }/${ symbol.toLowerCase() }@bookTicker`,
    )
    w.onmessage = msg => {
      const obj = JSON.parse(msg.data)
      cb(
        transform ?
          variator === 'futures' ?
            bookTickerTransform.futures(obj)
          :
            bookTickerTransform.spot(obj)
        :
          obj,
      )
    }
    return w
  })
  return options =>
    cache.forEach(w => w.close(1000, 'Close handle was called', { keepClosed: true, ...options }))
}

export const allBookTickers = (cb, transform = true, variator) => {
  const w = new openWebSocket(
    `${ variator === 'futures' ? endpoints.futures : endpoints.base }/!bookTicker`,
  )
  w.onmessage = msg => {
    const obj = JSON.parse(msg.data)
    cb(
      transform ?
        variator === 'futures' ?
          bookTickerTransform.futures(obj)
        :
          bookTickerTransform.spot(obj)
      :
        obj
    )
  }
  return options => w.close(1000, 'Close handle was called', { keepClosed: true, ...options })
}

export const partialDepth = (payload, cb, transform = true, variator) => {
  const cache = (Array.isArray(payload) ? payload : [ payload ]).map(({ symbol, level, updateSpeed }) => {
    if (
      ![ 5, 10, 20 ].includes(level) ||
      ![ '1000ms', '100ms', undefined ].includes(updateSpeed)
    ) throw new Error('Please pass a valid level and/or updateSpeed.')
    updateSpeed = updateSpeed ? `@${ updateSpeed }` : ''
    const w = openWebSocket(
      `${ variator === 'futures' ? endpoints.futures : endpoints.base }/${ symbol }@depth${ level }${ updateSpeed }`,
    )
    w.onmessage = msg => {
      const obj = JSON.parse(msg.data)
      cb(
        transform ?
          variator === 'futures' ?
            partialDepthTransform.spot(level, obj)
          :
            partialDepthTransform.futures(symbol, level, obj)
        :
          obj,
      )
    }
    return w
  })
  return options =>
    cache.forEach(w => w.close(1000, 'Close handle was called', { keepClosed: true, ...options }))
}

export const depth = (payload, cb, transform = true, variator) => {
  const cache = (Array.isArray(payload) ? payload : [ payload ]).map(({ symbol, updateSpeed }) => {
    if (![ '1000ms', '100ms', undefined ].includes(updateSpeed)) throw new Error('Please pass a valid updateSpeed.')
    updateSpeed = updateSpeed ? `@${ updateSpeed }` : ''
    const w = openWebSocket(
      `${ variator === 'futures' ? endpoints.futures : endpoints.base }/${ symbol }@depth${ updateSpeed }`
    )
    w.onmessage = msg => {
      const obj = JSON.parse(msg.data)
      cb(
        transform ?
          variator === 'futures' ?
            depthTransform.futures(obj)
          :
            depthTransform.spot(obj)
        :
          obj,
      )
    }
    return w
  })
  return options =>
    cache.forEach(w => w.close(1000, 'Close handle was called', { keepClosed: true, ...options }))
}

export const userEventHandler = (cb, transform = true, variator) => msg => {
  const { e: type, ...rest } = JSON.parse(msg.data)
  cb(
    variator === 'futures' ?
      transform && userTransforms.futures[ type ] ?
        userTransforms.futures[ type ](rest)
      :
        { type, ...rest }
    :
      transform && userTransforms.spot[ type ] ?
        userTransforms.spot[ type ](rest)
      :
        { type, ...rest }
  )
}

export const userErrorHandler = (cb, transform = true) => error => {
  cb({ [ transform ? 'eventType' : 'type' ]: 'error', error })
}

const getStreamMethods = (opts, variator = '') => {
  const methods = RESTMethods(opts)
  if (variator === 'margin') return methods.authenticated.margin.userDataStreams
  else if (variator === 'futures') return methods.authenticated.futures.userDataStreams
  else return methods.authenticated.spot.userDataStreams
}

export const user = (opts, variator) => (cb, transform) => {
  const { create: createDataStream, ping: pingDataStream, close: closeDataStream } = getStreamMethods(opts, variator)
  let currentListenKey = null, intervalReference = null, w = null, keepClosed = false
  const errorHandler = userErrorHandler(cb, transform)
  const keepAlive = isReconnecting => {
    if (currentListenKey) {
      pingDataStream({ listenKey: currentListenKey }).catch(err => {
        closeStream({}, true)
        if (isReconnecting) setTimeout(() => makeStream(true), 30e3)
        else makeStream(true)
        if (opts.emitStreamErrors) errorHandler(err)
      })
    }
  }
  const closeStream = (options, catchErrors, setKeepClosed = false) => {
    keepClosed = setKeepClosed
    if (!currentListenKey) return Promise.resolve()
    clearInterval(intervalReference)
    const p = closeDataStream({ listenKey: currentListenKey })
    if (catchErrors) p.catch(f => f)
    w.close(1000, 'Close handle was called', { keepClosed: true, ...options })
    currentListenKey = null
    return p
  }
  const makeStream = isReconnecting => {
    return (
      !keepClosed &&
      createDataStream()
        .then(({ listenKey }) => {
          if (keepClosed) return closeDataStream({ listenKey }).catch(f => f)
          w = openWebSocket(
            `${ variator === 'futures' ? endpoints.futures : endpoints.base }/${ listenKey }`,
          )
          w.onmessage = msg => userEventHandler(cb, transform, variator)(msg)
          if (opts.emitSocketOpens) w.onopen = () => cb({ [ transform ? 'eventType' : 'type' ]: 'open' })
          if (opts.emitSocketErrors) w.onerror = ({ error }) => errorHandler(error)
          currentListenKey = listenKey
          intervalReference = setInterval(() => keepAlive(false), 50e3)
          keepAlive(true)
          return options => closeStream(options, false, true)
        })
        .catch(error => {
          if (isReconnecting) {
            if (!keepClosed) setTimeout(() => makeStream(true), 30e3)
            if (opts.emitStreamErrors) errorHandler(error)
          } else throw error
        })
    )
  }
  return makeStream(false)
}

export const markPrice = (payload, cb, transform = true) => {
  const cache = (Array.isArray(payload) ? payload : [ payload ]).map(({ symbol, updateSpeed }) => {
    if (![ '3000ms', '1000ms', '1s', undefined ].includes(updateSpeed)) throw new Error('Please pass a valid updateSpeed.')
    updateSpeed = updateSpeed ? `@${ updateSpeed }` : ''
    const w = openWebSocket(`${ endpoints.futures }/${ symbol.toLowerCase() }@markPrice${ updateSpeed }`)
    w.onmessage = msg => {
      const obj = JSON.parse(msg.data)
      cb(transform ? markPriceTransform(obj) : obj)
    }
    return w
  })
  return options =>
    cache.forEach(w => w.close(1000, 'Close handle was called', { keepClosed: true, ...options }))
}

export const allMarkPrices = (payload, cb, transform = true) => {
  let updateSpeed = payload.updateSpeed
  if (![ '3000ms', '1000ms', '1s', undefined ].includes(updateSpeed)) {
    throw new Error('Please pass a valid updateSpeed.')
  }
  updateSpeed = updateSpeed ? `@${ updateSpeed }` : ''
  const w = openWebSocket(`${ endpoints.futures }/!markPrice@arr${ updateSpeed }`)
  w.onmessage = msg => {
    const arr = JSON.parse(msg.data)
    cb(transform ? arr.map(obj => markPriceTransform(obj)) : arr)
  }
  return options => w.close(1000, 'Close handle was called', { keepClosed: true, ...options })
}

export const continuousKlines = (payload, interval, cb, transform = true) => {
  if (!interval || !cb) throw new Error('Please pass a pair, contractType, interval and a callback.')
  const cache = (Array.isArray(payload) ? payload : [ payload ]).map(({ pair, contractType }) => {
    if (![ 'perpetual', 'current_quarter', 'next_quarter' ].includes(contractType)) {
      throw new Error('Please pass a valid contractType.')
    }
    const w = openWebSocket(
      `${ endpoints.futures }/${ pair.toLowerCase() }_${ contractType }@continuousKline_${ interval }`
    )
    w.onmessage = msg => {
      const obj = JSON.parse(msg.data)
      const { e: eventType, E: eventTime, ps: pair, ct: contractType, k: tick } = obj
      const {
        t: startTime,
        T: closeTime,
        i: interval,
        f: firstTradeId,
        L: lastTradeId,
        o: open,
        c: close,
        h: high,
        l: low,
        v: volume,
        n: trades,
        x: isFinal,
        q: quoteVolume,
        V: buyVolume,
        Q: quoteBuyVolume
      } = tick
      cb(
        transform ?
          {
            eventType,
            eventTime,
            pair,
            contractType,
            startTime,
            closeTime,
            interval,
            firstTradeId,
            lastTradeId,
            open,
            close,
            high,
            low,
            volume,
            trades,
            isFinal,
            quoteVolume,
            buyVolume,
            quoteBuyVolume
          }
        :
          obj
      )
    }
    return w
  })
  return options =>
    cache.forEach(w => w.close(1000, 'Close handle was called', { keepClosed: true, ...options }))
}

export const liquidation = (payload, cb, transform = true) => {
  const cache = (Array.isArray(payload) ? payload : [ payload ]).map(symbol => {
    const w = openWebSocket(`${ endpoints.futures }/${ symbol.toLowerCase() }@forceOrder`)
    w.onmessage = msg => {
      const obj = JSON.parse(msg.data)
      cb(transform ? liquidationTransform(obj.o) : obj)
    }
    return w
  })
  return options =>
    cache.forEach(w => w.close(1000, 'Close handle was called', { keepClosed: true, ...options }))
}

export const allLiquidations = (cb, transform = true) => {
  const w = new openWebSocket(`${ endpoints.futures }/!forceOrder@arr`)
  w.onmessage = msg => {
    const obj = JSON.parse(msg.data)
    cb(transform ? liquidationTransform(obj.o) : obj)
  }
  return options => w.close(1000, 'Close handle was called', { keepClosed: true, ...options })
}

export const info = (payload, cb, transform = true) => {
  const cache = (Array.isArray(payload) ? payload : [ payload ]).map(tokenName => {
    const w = openWebSocket(`${ endpoints.futures }/${ tokenName.toUpperCase() }@tokenNav`)
    w.onmessage = msg => {
      const obj = JSON.parse(msg.data)
      cb(transform ? infoTransform(obj) : obj)
    }
    return w
  })
  return options =>
    cache.forEach(w => w.close(1000, 'Close handle was called', { keepClosed: true, ...options }))
}

export const compositeIndex = (payload, cb, transform = true) => {
  const cache = (Array.isArray(payload) ? payload : [ payload ]).map(symbol => {
    const w = openWebSocket(`${ endpoints.futures }/${ symbol.toLowerCase() }@compositeIndex`)
    w.onmessage = msg => {
      const obj = JSON.parse(msg.data)
      cb(transform ? compositeIndexTransform(obj) : obj)
    }
    return w
  })
  return options =>
    cache.forEach(w => w.close(1000, 'Close handle was called', { keepClosed: true, ...options }))
}

export const customSubStream = (payload, cb, variator) => {
  const cache = (Array.isArray(payload) ? payload : [ payload ]).map(sub => {
    const w = openWebSocket(`${ variator === 'futures' ? endpoints.futures : endpoints.base }/${ sub }`)
    w.onmessage = msg => {
      const data = JSON.parse(msg.data)
      cb(data)
    }
    return w
  })
  return options =>
    cache.forEach(w => w.close(1000, 'Close handle was called', { keepClosed: true, ...options }))
}


// Exports:
export default opts => {
  if (opts && opts.wsBase) endpoints.base = opts.wsBase
  if (opts && opts.wsFutures) endpoints.futures = opts.wsFutures
  return {
    spot: spotWebSocket(opts),
    margin: marginWebSocket(opts),
    futures: futuresWebSocket(opts),
    advanced: {
      spot: {
        customSubStream
      },
      futures: {
        customSubStream: (payload, cb) => customSubStream(payload, cb, 'futures'),
      }
    }
  }
}
