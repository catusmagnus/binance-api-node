// Packages:
import zip from 'lodash.zipobject'


// Exports:
export const aggTradesTransform = {
  spot: m => ({
    eventType: m.e,
    eventTime: m.E,
    timestamp: m.T,
    symbol: m.s,
    price: m.p,
    quantity: m.q,
    isBuyerMaker: m.m,
    wasBestPrice: m.M,
    aggId: m.a,
    firstId: m.f,
    lastId: m.l
  }),
  futures: m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    aggId: m.a,
    price: m.p,
    quantity: m.q,
    firstId: m.f,
    lastId: m.l,
    timestamp: m.T,
    isBuyerMaker: m.m
  })
}

export const tradesTransform = m => ({
  eventType: m.e,
  eventTime: m.E,
  tradeTime: m.T,
  symbol: m.s,
  price: m.p,
  quantity: m.q,
  isBuyerMaker: m.m,
  maker: m.M,
  tradeId: m.t,
  buyerOrderId: m.b,
  sellerOrderId: m.a,
})

export const miniTickerTransform = m => ({
  eventType: m.e,
  eventTime: m.E,
  symbol: m.s,
  curDayClose: m.c,
  open: m.o,
  high: m.h,
  low: m.l,
  volume: m.v,
  volumeQuote: m.q
})

export const tickerTransform = {
  spot: m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    priceChange: m.p,
    priceChangePercent: m.P,
    weightedAvg: m.w,
    prevDayClose: m.x,
    curDayClose: m.c,
    closeTradeQuantity: m.Q,
    bestBid: m.b,
    bestBidQnt: m.B,
    bestAsk: m.a,
    bestAskQnt: m.A,
    open: m.o,
    high: m.h,
    low: m.l,
    volume: m.v,
    volumeQuote: m.q,
    openTime: m.O,
    closeTime: m.C,
    firstTradeId: m.F,
    lastTradeId: m.L,
    totalTrades: m.n
  }),
  futures: m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    priceChange: m.p,
    priceChangePercent: m.P,
    weightedAvg: m.w,
    curDayClose: m.c,
    closeTradeQuantity: m.Q,
    open: m.o,
    high: m.h,
    low: m.l,
    volume: m.v,
    volumeQuote: m.q,
    openTime: m.O,
    closeTime: m.C,
    firstTradeId: m.F,
    lastTradeId: m.L,
    totalTrades: m.n
  })
}

export const bookTickerTransform = {
  spot: m => ({
    updateId: m.u,
    symbol: m.s,
    bestBid: m.b,
    bestBidQnt: m.B,
    bestAsk: m.a,
    bestAskQnt: m.A
  }),
  futures: m => ({
    eventType: m.e,
    updateId: m.u,
    eventTime: m.E,
    transactionTime: m.T,
    symbol: m.s,
    bestBid: m.b,
    bestBidQnt: m.B,
    bestAsk: m.a,
    bestAskQnt: m.A
  })
}

export const partialDepthTransform = {
  spot: (symbol, level, m) => ({
    symbol,
    level,
    lastUpdateId: m.lastUpdateId,
    bids: m.bids.map(b => zip([ 'price', 'quantity' ], b)),
    asks: m.asks.map(a => zip([ 'price', 'quantity' ], a))
  }),
  futures: (level, m) => ({
    level,
    eventType: m.e,
    eventTime: m.E,
    transactionTime: m.T,
    symbol: m.s,
    firstUpdateId: m.U,
    finalUpdateId: m.u,
    prevFinalUpdateId: m.pu,
    bidDepth: m.b.map(b => zip([ 'price', 'quantity' ], b)),
    askDepth: m.a.map(a => zip([ 'price', 'quantity' ], a))
  })
}

export const depthTransform = {
  spot: m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    firstUpdateId: m.U,
    finalUpdateId: m.u,
    bidDepth: m.b.map(b => zip([ 'price', 'quantity' ], b)),
    askDepth: m.a.map(a => zip([ 'price', 'quantity' ], a))
  }),
  futures: m => ({
    eventType: m.e,
    eventTime: m.E,
    transactionTime: m.T,
    symbol: m.s,
    firstUpdateId: m.U,
    finalUpdateId: m.u,
    prevFinalUpdateId: m.pu,
    bidDepth: m.b.map(b => zip([ 'price', 'quantity' ], b)),
    askDepth: m.a.map(a => zip([ 'price', 'quantity' ], a))
  })
}

export const userTransforms = {
  spot: {
    // https://github.com/binance-exchange/binance-official-api-docs/blob/master/user-data-stream.md#balance-update
    balanceUpdate: m => ({
      asset: m.a,
      balanceDelta: m.d,
      clearTime: m.T,
      eventTime: m.E,
      eventType: 'balanceUpdate',
    }),
    // https://github.com/binance-exchange/binance-official-api-docs/blob/master/user-data-stream.md#account-update
    outboundAccountInfo: m => ({
      eventType: 'account',
      eventTime: m.E,
      makerCommissionRate: m.m,
      takerCommissionRate: m.t,
      buyerCommissionRate: m.b,
      sellerCommissionRate: m.s,
      canTrade: m.T,
      canWithdraw: m.W,
      canDeposit: m.D,
      lastAccountUpdate: m.u,
      balances: m.B.reduce((out, cur) => {
        out[ cur.a ] = { available: cur.f, locked: cur.l }
        return out
      }, {}),
    }),
    // https://github.com/binance-exchange/binance-official-api-docs/blob/master/user-data-stream.md#account-update
    outboundAccountPosition: m => ({
      balances: m.B.map(({ a, f, l }) => ({ asset: a, free: f, locked: l })),
      eventTime: m.E,
      eventType: 'outboundAccountPosition',
      lastAccountUpdate: m.u,
    }),
    // https://github.com/binance-exchange/binance-official-api-docs/blob/master/user-data-stream.md#order-update
    executionReport: m => ({
      eventType: 'executionReport',
      eventTime: m.E,
      symbol: m.s,
      newClientOrderId: m.c,
      originalClientOrderId: m.C,
      side: m.S,
      orderType: m.o,
      timeInForce: m.f,
      quantity: m.q,
      price: m.p,
      executionType: m.x,
      stopPrice: m.P,
      icebergQuantity: m.F,
      orderStatus: m.X,
      orderRejectReason: m.r,
      orderId: m.i,
      orderTime: m.T,
      lastTradeQuantity: m.l,
      totalTradeQuantity: m.z,
      priceLastTrade: m.L,
      commission: m.n,
      commissionAsset: m.N,
      tradeId: m.t,
      isOrderWorking: m.w,
      isBuyerMaker: m.m,
      creationTime: m.O,
      totalQuoteTradeQuantity: m.Z,
      orderListId: m.g,
      quoteOrderQuantity: m.Q,
      lastQuoteTransacted: m.Y,
    }),
  },
  futures: {
    // https://binance-docs.github.io/apidocs/futures/en/#event-margin-call
    MARGIN_CALL: m => ({
      eventTime: m.E,
      crossWalletBalance: m.cw,
      eventType: 'MARGIN_CALL',
      positions: m.p.reduce((out, cur) => {
        out[ cur.a ] = {
          symbol: cur.s,
          positionSide: cur.ps,
          positionAmount: cur.pa,
          marginType: cur.mt,
          isolatedWallet: cur.iw,
          markPrice: cur.mp,
          unrealizedPnL: cur.up,
          maintenanceMarginRequired: cur.mm,
        }
        return out
      }, {}),
    }),
    // https://binance-docs.github.io/apidocs/futures/en/#event-balance-and-position-update
    ACCOUNT_UPDATE: m => ({
      eventTime: m.E,
      transactionTime: m.T,
      eventType: 'ACCOUNT_UPDATE',
      eventReasonType: m.a.m,
      balances: m.a.B.map(b => ({
        asset: b.a,
        walletBalance: b.wb,
        crossWalletBalance: b.cw,
        balanceChange: b.bc,
      })),
      positions: m.a.P.map(p => ({
        symbol: p.s,
        positionAmount: p.pa,
        entryPrice: p.ep,
        accumulatedRealized: p.cr,
        unrealizedPnL: p.up,
        marginType: p.mt,
        isolatedWallet: p.iw,
        positionSide: p.ps,
      })),
    }),
    // https://binance-docs.github.io/apidocs/futures/en/#event-order-update
    ORDER_TRADE_UPDATE: m => ({
      eventType: 'ORDER_TRADE_UPDATE',
      eventTime: m.E,
      transactionTime: m.T,
      symbol: m.o.s,
      clientOrderId: m.o.c,
      side: m.o.S,
      orderType: m.o.o,
      timeInForce: m.o.f,
      quantity: m.o.q,
      price: m.o.p,
      averagePrice: m.o.ap,
      stopPrice: m.o.sp,
      executionType: m.o.x,
      orderStatus: m.o.X,
      orderId: m.o.i,
      lastTradeQuantity: m.o.l,
      totalTradeQuantity: m.o.z,
      priceLastTrade: m.o.L,
      commissionAsset: m.o.N,
      commission: m.o.n,
      orderTime: m.o.T,
      tradeId: m.o.t,
      bidsNotional: m.o.b,
      asksNotional: m.o.a,
      isMaker: m.o.m,
      isReduceOnly: m.o.R,
      workingType: m.o.wt,
      originalOrderType: m.o.ot,
      positionSide: m.o.ps,
      closePosition: m.o.cp,
      activationPrice: m.o.AP,
      callbackRate: m.o.cr,
      realizedProfit: m.o.rp,
    }),
  }
}

export const markPriceTransform = m => ({
  eventType: m.e,
  eventTime: m.E,
  symbol: m.s,
  markPrice: m.p,
  indexPrice: m.i,
  estimatedSettlePrice: m.P,
  fundingRate: m.r,
  nextFundingTime: m.T
})

export const liquidationTransform = m => ({
  symbol: m.s,
  price: m.p,
  origQty: m.q,
  lastFilledQty: m.l,
  accumulatedQty: m.z,
  averagePrice: m.ap,
  status: m.X,
  timeInForce: m.f,
  type: m.o,
  side: m.S,
  time: m.T
})

export const infoTransform = m => ({
  eventType: m.e,
  eventTime: m.E,
  name: m.s,
  tokenIssued: m.m,
  baskets: m.b.map(basket => ({ symbol: basket.s, position: basket.n })),
  nav: m.n,
  realLeverage: m.l,
  targetLeverage: m.t,
  fundingRatio: m.f
})

export const compositeIndexTransform = m => ({
  eventType: m.e,
  eventTime: m.E,
  symbol: m.s,
  price: m.p,
  baseAsset: m.C,
  composition: m.c.map(c => ({
    baseAsset: c.b,
    quoteAsset: c.q,
    weightInQuantity: c.w,
    weightInPercentage: c.W,
    indexPrice: c.i
  }))
})
