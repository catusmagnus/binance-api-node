// tslint:disable:interface-name
declare module 'binance-api-node' {
  export default function (options?: {
    apiKey?: string
    apiSecret?: string
    getTime?: () => number | Promise<number>
    httpBase?: string
    httpFutures?: string
    wsBase?: string
    wsFutures?: string
  }): Binance;

  export type ErrorCodes_LT = -1000 | -1001 | -1002 | -1003 | -1006 | -1007 | -1013 | -1014
    | -1015 | -1016 | -1020 | -1021 | -1022 | -1100 | -1101 | -1102
    | -1103 | -1104 | -1105 | -1106 | -1112 | -1114 | -1115 | -1116
    | -1117 | -1118 | -1119 | -1120 | -1121 | -1125 | -1127 | -1128
    | -1130 | -2008 | -2009 | -2010 | -2012 | -2013 | -2014 | -2015

  export const enum ErrorCodes {
    UNKNOWN = -1000,
    DISCONNECTED = -1001,
    UNAUTHORIZED = -1002,
    TOO_MANY_REQUESTS = -1003,
    UNEXPECTED_RESP = -1006,
    TIMEOUT = -1007,
    INVALID_MESSAGE = -1013,
    UNKNOWN_ORDER_COMPOSITION = -1014,
    TOO_MANY_ORDERS = -1015,
    SERVICE_SHUTTING_DOWN = -1016,
    UNSUPPORTED_OPERATION = -1020,
    INVALID_TIMESTAMP = -1021,
    INVALID_SIGNATURE = -1022,
    ILLEGAL_CHARS = -1100,
    TOO_MANY_PARAMETERS = -1101,
    MANDATORY_PARAM_EMPTY_OR_MALFORMED = -1102,
    UNKNOWN_PARAM = -1103,
    UNREAD_PARAMETERS = -1104,
    PARAM_EMPTY = -1105,
    PARAM_NOT_REQUIRED = -1106,
    NO_DEPTH = -1112,
    TIF_NOT_REQUIRED = -1114,
    INVALID_TIF = -1115,
    INVALID_ORDER_TYPE = -1116,
    INVALID_SIDE = -1117,
    EMPTY_NEW_CL_ORD_ID = -1118,
    EMPTY_ORG_CL_ORD_ID = -1119,
    BAD_INTERVAL = -1120,
    BAD_SYMBOL = -1121,
    INVALID_LISTEN_KEY = -1125,
    MORE_THAN_XX_HOURS = -1127,
    OPTIONAL_PARAMS_BAD_COMBO = -1128,
    INVALID_PARAMETER = -1130,
    BAD_API_ID = -2008,
    DUPLICATE_API_KEY_DESC = -2009,
    INSUFFICIENT_BALANCE = -2010,
    CANCEL_ALL_FAIL = -2012,
    NO_SUCH_ORDER = -2013,
    BAD_API_KEY_FMT = -2014,
    REJECTED_MBX_KEY = -2015,
  }

  export type RateLimitType_LT = 'REQUEST_WEIGHT' | 'ORDERS'

  export const enum RateLimitType {
    REQUEST_WEIGHT  = 'REQUEST_WEIGHT',
    ORDERS = 'ORDERS'
  }

  export type RateLimitInterval_LT = 'SECOND' | 'MINUTE' | 'DAY'

  export const enum RateLimitInterval {
    SECOND = 'SECOND',
    MINUTE = 'MINUTE',
    DAY = 'DAY'
  }

  export interface ExchangeInfoRateLimit {
    rateLimitType: RateLimitType_LT
    interval: RateLimitInterval_LT
    intervalNum: number
    limit: number
  }

  export type ExchangeFilterType_LT = 'EXCHANGE_MAX_NUM_ORDERS' | 'EXCHANGE_MAX_ALGO_ORDERS'

  export const enum ExchangeFilterType {
    EXCHANGE_MAX_NUM_ORDERS = 'EXCHANGE_MAX_NUM_ORDERS',
    EXCHANGE_MAX_ALGO_ORDERS = 'EXCHANGE_MAX_ALGO_ORDERS'
  }

  export interface ExchangeFilter {
    filterType: ExchangeFilterType_LT
    limit: number
  }

  export type SymbolFilterType_LT = 'PRICE_FILTER' | 'PERCENT_PRICE' | 'LOT_SIZE'
    | 'MIN_NOTIONAL' | 'MAX_NUM_ORDERS' | 'MAX_ALGO_ORDERS'

  export const enum SymbolFilterType {
    PRICE_FILTER = 'PRICE_FILTER',
    PERCENT_PRICE = 'PERCENT_PRICE',
    LOT_SIZE = 'LOT_SIZE',
    MIN_NOTIONAL = 'MIN_NOTIONAL',
    MAX_NUM_ORDERS = 'MAX_NUM_ORDERS',
    MAX_ALGO_ORDERS = 'MAX_ALGO_ORDERS',
  }

  export interface SymbolPriceFilter {
    filterType: SymbolFilterType.PRICE_FILTER
    minPrice: string
    maxPrice: string
    tickSize: string
  }

  export interface SymbolPercentPriceFilter {
    filterType: SymbolFilterType.PERCENT_PRICE
    multiplierDown: string
    multiplierUp: string
    avgPriceMins: number
  }

  export interface SymbolLotSizeFilter {
    filterType: SymbolFilterType.LOT_SIZE
    minQty: string
    maxQty: string
    stepSize: string
  }

  export interface SymbolMinNotionalFilter {
    filterType: SymbolFilterType.MIN_NOTIONAL
    applyToMarket: boolean
    avgPriceMins: number
    minNotional: string
  }

  export interface SymbolMaxNumOrdersFilter {
    filterType: SymbolFilterType.MAX_NUM_ORDERS
    maxNumOrders: number
  }

  export interface SymbolMaxAlgoOrdersFilter {
    filterType: SymbolFilterType.MAX_ALGO_ORDERS
    maxNumAlgoOrders: number
  }

  export type SymbolFilter =
    | SymbolPriceFilter
    | SymbolPercentPriceFilter
    | SymbolLotSizeFilter
    | SymbolMinNotionalFilter
    | SymbolMaxNumOrdersFilter
    | SymbolMaxAlgoOrdersFilter

  export type SymbolOrderType_LT = 'LIMIT' | 'LIMIT_MAKER' | 'MARKET' | 'STOP' | 'STOP_MARKET' | 'STOP_LOSS_LIMIT'
    | 'TAKE_PROFIT_LIMIT' | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET'
  
  export const enum SymbolOrderType {
    LIMIT = 'LIMIT',
    LIMIT_MAKER = 'LIMIT_MAKER',
    MARKET = 'MARKET',
    STOP = 'STOP',
    STOP_MARKET = 'STOP_MARKET',
    STOP_LOSS_LIMIT = 'STOP_LOSS_LIMIT',
    TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT',
    TAKE_PROFIT_MARKET = 'TAKE_PROFIT_MARKET',
    TRAILING_STOP_MARKET = 'TRAILING_STOP_MARKET'
  }
  
  export type TradingType_LT = 'MARGIN' | 'SPOT'

  export const enum TradingType {
    MARGIN = 'MARGIN',
    SPOT = 'SPOT'
  }

  export interface Symbol {
    baseAsset: string
    baseAssetPrecision: number
    baseCommissionPrecision: number
    filters: SymbolFilter[]
    icebergAllowed: boolean
    isMarginTradingAllowed: boolean
    isSpotTradingAllowed: boolean
    ocoAllowed: boolean
    orderTypes: SymbolOrderType_LT[]
    permissions: TradingType_LT[]
    quoteAsset: string
    quoteAssetPrecision: number
    quoteCommissionPrecision: number
    quoteOrderQtyMarketAllowed: boolean
    quotePrecision: number
    status: string
    symbol: string
  }

  export interface SpotExchangeInfo {
    timezone: string
    serverTime: number
    rateLimits: ExchangeInfoRateLimit[]
    exchangeFilters: ExchangeFilter[]
    symbols: Symbol[]
  }

  export interface FuturesAssets {
    asset: string
    marginAvailable: boolean
    autoAssetExchange: string
  }

  export interface FuturesSymbolFilter {
    filterType: string
    maxPrice?: string
    minPrice?: string
    tickSize?: string
    stepSize?: string
    maxQty: string
    minQty: string
    limit: number
    notional: string
    multiplierDown: string
    multiplierUp: string
    multiplierDecimal: string
  }

  export interface FuturesSymbol {
    symbol: string
    pair: string
    contractType: string
    deliveryDate: number
    onboardDate: number
    status: string
    maintMarginPercent: string
    requiredMarginPercent: string
    baseAsset: string
    quoteAsset: string
    marginAsset: string
    pricePrecision: number
    quantityPrecision: number
    baseAssetPrecision: number
    quotePrecision: number
    underlyingType: string
    underlyingSubType: string[]
    settlePlan: number
    triggerProtect: string
    liquidationFee: string
    marketTakeBound: string
    filters: FuturesSymbolFilter[]
    orderTypes: string[]
    timeInForce: string[]
  }

  export interface FuturesExchangeInfo {
    timezone: string
    serverTime: number
    futuresType: string
    rateLimits: ExchangeInfoRateLimit[]
    exchangeFilters: ExchangeFilter[]
    assets: FuturesAssets[]
    symbols: FuturesSymbol[]
  }

  type BookLimit_LT = 5 | 10 | 20 | 50 | 100 | 500 | 1000

  export type SpotBookLimit_LT = BookLimit_LT | 5000

  export type FuturesBookLimit_LT = BookLimit_LT

  export interface Bid {
    price: string
    quantity: string
  }

  export interface OrderBook {
    lastUpdateId: number
    asks: Bid[]
    bids: Bid[]
  }

  export interface SpotBook extends OrderBook {}

  export interface FuturesBook extends OrderBook {
    messageOutputTime: number
    transactionTime: number
  }

  interface Trade {
    id: number
    price: string
    qty: string
    quoteQty: string
    time: number
    isBuyerMaker: boolean
    isBestMatch: boolean
  }

  export interface SpotTrade extends Trade {
    isBestMatch: boolean
  }

  export interface FuturesTrade extends Trade {}

  export interface AggTradesOptions {
    symbol: string
    fromId?: string
    startTime?: number
    endTime?: number
    limit?: number
  }

  interface AggTrade {
    aggId: number
    symbol: string
    price: string
    quantity: string
    firstId: number
    lastId: number
    timestamp: number
    isBuyerMaker: boolean
    wasBestPrice: boolean
  }

  export interface SpotAggTrade extends AggTrade {
    wasBestPrice: boolean
  }

  export interface FuturesAggTrade extends AggTrade {}

  export type CandleChartInterval_LT = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h'
    | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M'

  export interface CandlesOptions {
    symbol: string
    interval: CandleChartInterval_LT
    limit?: number
    startTime?: number
    endTime?: number
  }

  export interface CandleChart {
    openTime: number
    open: string
    high: string
    low: string
    close: string
    volume: string
    closeTime: number
    quoteVolume: string
    trades: number
    baseAssetVolume: string
    quoteAssetVolume: string
  }

  export interface AvgPrice {
    mins: number
    price: string
  }

  export interface DailyTickerStats {
    symbol: string
    priceChange: string
    priceChangePercent: string
    weightedAvgPrice: string
    prevClosePrice: string
    lastPrice: string
    lastQty: string
    openPrice: string
    highPrice: string
    lowPrice: string
    volume: string
    quoteVolume: string
    openTime: number
    closeTime: number
    firstId: number
    lastId: number
    count: number
  }

  export interface SpotDailyTickerStats extends DailyTickerStats {
    bidPrice: string
    bidQty: string
    askPrice: string
    askQty: string
  }

  export interface FuturesDailyTickerStats extends DailyTickerStats {}

  interface BookTicker {
    symbol: string
    bidPrice: string
    bidQty: string
    askPrice: string
    askQty: string
  }

  export interface SpotBookTicker extends BookTicker {}

  export interface FuturesBookTicker extends BookTicker {
    time: number
  }

  export type ContractType_LT = 'PERPETUAL' | 'CURRENT_MONTH' | 'NEXT_MONTH' | 'CURRENT_QUARTER'
    | 'NEXT_QUARTER'
  
  export const enum ContractType {
    PERPETUAL = 'PERPETUAL',
    CURRENT_MONTH = 'CURRENT_MONTH',
    NEXT_MONTH = 'NEXT_MONTH',
    CURRENT_QUARTER = 'CURRENT_QUARTER',
    NEXT_QUARTER = 'NEXT_QUARTER'
  }

  export interface KlineOptions {
    pair: string
    interval?: string
    startTime?: number
    endTime?: number
    limit?: number
  }

  export interface ContinuousKlinesOptions extends KlineOptions {
    contractType: ContractType_LT
  }

  export interface ContinuousKline extends Omit<CandleChart, 'baseAssetVolume'> {
    buyVolume: string
  }

  interface PriceKline {
    openTime: number
    open: string
    high: string
    low: string
    close: string
    closeTime: number
    bisicData: number
  }

  export interface IndexPriceKline extends PriceKline {}

  export interface MarkPriceKline extends PriceKline {}

  export interface MarkPrice {
    symbol: string
    markPrice: string
    indexPrice: string
    estimatedSettlePrice: string
    lastFundingRate: string
    nextFundingTime: number
    interestRate: string
    time: number
  }

  export interface FundingRate {
    symbol: string
    fundingRate: string
    fundingTime: number
  }

  export interface OpenInterest {
    openInterest: string
    symbol: string
    time: number
  }

  export type FuturesPeriod_LT = '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d'

  export interface OpenInterestHistoryOptions {
    symbol: string
    period?: FuturesPeriod_LT
    limit?: number
    startTime?: number
    endTime?: number
  }

  export interface OpenInterestHistory {
    symbol: string
    sumOpenInterest: string
    sumOpenInterestValue: string
    timestamp: string
  }

  export interface TopLongShortPositionRatioOptions {
    symbol: string
    period?: FuturesPeriod_LT
    limit?: number
    startTime?: number
    endTime?: number
  }

  export interface TopLongShortPositionRatio {
    symbol: string
    longShortRatio: string
    longAccount: string
    shortAccount: string
    timestamp: string
  }

  export interface LongShortRatioOptions {
    symbol: string
    period?: FuturesPeriod_LT
    limit?: number
    startTime?: number
    endTime?: number
  }

  export interface LongShortRatio {
    symbol: string
    longShortRatio: string
    longAccount: string
    shortAccount: string
    timestamp: string
  }

  export interface TakerBuySellVolumeOptions {
    symbol: string
    period?: FuturesPeriod_LT
    limit?: number
    startTime?: number
    endTime?: number
  }

  export interface TakerBuySellVolume {
    symbol: string
    longShortRatio: string
    longAccount: string
    shortAccount: string
    timestamp: string
  }

  export interface HistoricalBLVTNAVKlinesOptions {
    symbol: string
    interval?: FuturesPeriod_LT
    startTime?: number
    endTime?: number
    limit?: number
  }

  export interface HistoricalBLVTNAVKline {
    openTime: number
    open: string
    high: string
    low: string
    close: string
    realLeverage: string
    closeTime: number
    NAVUpdateCount: number
  }

  export interface BaseAssetList {
    baseAsset: string
    quoteAsset: string
    weightInQuantity: string
    weightInPercentage: string
  }

  export interface CompositeIndexSymbolInfo {
    symbol: string
    time: number
    component: string
    baseAssetList: BaseAssetList[]
  }

  export interface WalletNetworkListItem {
    addressRegex: string
    coin: string
    depositDesc: string
    depositEnable: boolean
    isDefault: boolean
    memoRegex: string
    minConfirm: string
    name: string
    network: string
    resetAddressStatus: boolean
    specialTips: string
    unLockConfirm: number
    withdrawDesc: string
    withdrawEnable: boolean
    withdrawFee: string
    withdrawIntegerMultiple: string
    withdrawMax: string
    withdrawMin: string
    sameAddress: boolean
  }

  export interface WalletAccountCoin {
    coin: string
    depositAllEnable: boolean
    free: string
    freeze: string
    ipoable: string
    ipoing: string
    isLegalMoney: boolean
    locked: string
    name: string
    networkList: WalletNetworkListItem[]
    storage: string
    trading: boolean
    withdrawAllEnable: boolean
    withdrawing: string
  }

  export type WalletType_LT = 'SPOT' | 'MARGIN' | 'FUTURES'

  export const enum WalletType {
    SPOT = 'SPOT',
    MARGIN = 'MARGIN',
    FUTURES = 'FUTURES'
  }

  export interface WalletDailyAccountSnapshotOptions {
    type: WalletType_LT
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export interface AssetBalance {
    asset: string
    free: string
    locked: string
  }

  export interface WalletSnapshotVosItem {
    data: {
      balances: AssetBalance[]
    }
    type: string
    updateTime: number
  }

  export interface WalletDailyAccountSnapshot {
    code: number
    msg: string
    snapshotVos: WalletSnapshotVosItem[]
  }

  export interface WalletWithdrawOptions {
    coin: string
    withdrawOrderId?: string
    network?: string
    address: string
    addressTag?: string
    amount: string
    transactionFeeFlag?: boolean
    name?: string
    recvWindow?: number
  }

  export type DepositHistoryStatus_LT = 0 | 6 | 1

  export const enum DepositHistoryStatus {
    PENDING = 0,
    CREDITED_BUT_CANNOT_WITHDRAW = 6,
    SUCCESS = 1
  }

  export interface WalletDepositHistoryOptions {
    coin?: string
    status?: DepositHistoryStatus_LT
    startTime?: number
    endTime?: number
    offset?: number
    limit?: number
    recvWindow?: number
  }

  export interface WalletDepositHistoryItem {
    amount: string
    coin: string
    network: string
    status: DepositHistoryStatus_LT
    address: string
    addressTag: string
    txId: string
    insertTime: number
    transferType: number
    unlockConfirm: string
    confirmTimes: string
  }

  export type WalletWithdrawHistoryStatus_LT = 0 | 1 | 2 | 3 | 4 | 5 | 6

  export const enum WalletWithdrawHistoryStatus {
    EMAIL_SENT = 0,
    CANCELLED = 1,
    AWAITING_APPROVAL = 2,
    REJECTED = 3,
    PROCESSING = 4,
    FAILURE = 5,
    COMPLETED = 6
  }

  export interface WalletWithdrawHistoryOptions {
    coin?: string
    withdrawOrderId?: string
    status?: WalletWithdrawHistoryStatus_LT
    offset?: number
    limit?: number
    startTime?: number
    endTime?: number
    recvWindow?: number
  }

  export type WalletWithdrawHistoryTransferType_LT = 0 | 1

  export const enum WalletWithdrawHistoryTransferType {
    INTERNAL_TRANSFER = 0,
    EXTERNAL_TRANSFER = 1
  }

  export interface WalletWithdrawHistoryItem {
    address: string
    amount: string
    applyTime: string
    coin: string
    id: string
    withdrawOrderId: string
    network: string
    transferType: WalletWithdrawHistoryTransferType_LT
    status: WalletWithdrawHistoryStatus_LT
    transactionFee: string
    confirmNo: number
    info: string
    txId: string
  }

  export interface WalletDepositAddressOptions {
    coin: string
    network?: string
    recvWindow?: number
  }

  export interface WalletDepositAddress {
    address: string
    coin: string
    tag: string
    url: string
  }

  export type WalletAccountAPITradingStatusIndicatorI_LT = 'GCR' | 'IFER' | 'UFR'

  export const enum WalletWithdrawHistoryTransferType {
    GTC_CANCELLATION_RATIO = 'GCR',
    IOC_FOK_EXPIRATION_RATIO = 'IFER',
    UNFILLED_RATIO = 'UFR'
  }

  export interface WalletAccountAPITradingStatusIndicator {
    i: WalletAccountAPITradingStatusIndicatorI_LT
    c: number
    v: number
    t: number
  }

  export interface WalletAccountAPITradingStatus {
    data: {
      isLocked: boolean
      plannedRecoverTime: number
      triggerCondition: {
        GCR: number
        IFER: number
        UFR: number
      }
      indicators: {
        [ key: string ]: WalletAccountAPITradingStatusIndicator[]
      }
      updateTime: number
    }
  }

  export interface WalletDustLogOptions {
    startTime?: number
    endTime?: number
    recvWindow?: number
  }

  export interface WalletUserAssetDribbletDetail {
    transId: number
    serviceChargeAmount: string
    amount: string
    operateTime: number
    transferedAmount: string
    fromAsset: string
  }

  export interface WalletUserAssetDribblet {
    operateTime: number
    totalTransferedAmount: string
    totalServiceChargeAmount: string
    transId: number
    userAssetDribbletDetails: WalletUserAssetDribbletDetail[]
  }

  export interface WalletDustLog {
    total?: number
    userAssetDribblets: WalletUserAssetDribblet[]
  }

  export interface WalletDustTransferOptions {
    asset: string[]
    recvWindow?: number
  }

  export interface WalletDustTransferResult {
    amount: string
    fromAsset: string
    operateTime: number
    serviceChargeAmount: string
    tranId: number
    transferedAmount: string
  }

  export interface WalletDustTransfer {
    totalServiceCharge: string
    totalTransfered: string
    transferResult: WalletDustTransferResult[]
  }

  export interface WalletAssetDividendRecordOptions {
    asset?: string
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export interface WalletAssetDividendRecordItem {
    id: number
    amount: string
    asset: string
    divTime: string
    enInfo: string
    tranId: number
  }

  export interface WalletAssetDividendRecord {
    rows: WalletAssetDividendRecordItem[]
    total: number
  }

  export interface WalletAssetDetail {
    [ key: string ]: {
      minWithdrawAmount: string
      depositStatus: boolean
      withdrawFee: number
      withdrawStatus: boolean
      depositTip?: string
    }
  }

  export interface WalletTradeFee {
    [ symbol: string ]: {
      makerCommission: string
      takerCommission: string
    }
  }

  export type WalletUniversalTransferType_LT = 'MAIN_UMFUTURE' | 'MAIN_CMFUTURE' | 'MAIN_MARGIN' | 'MAIN_MINING' | 'UMFUTURE_MAIN'
    | 'UMFUTURE_MARGIN' | 'CMFUTURE_MAIN' | 'CMFUTURE_MARGIN' | 'MARGIN_MAIN' | 'MARGIN_UMFUTURE'
    | 'MARGIN_CMFUTURE' | 'MARGIN_MINING' | 'MINING_MAIN' | 'MINING_UMFUTURE' | 'MINING_MARGIN'
    | 'ISOLATEDMARGIN_MARGIN' | 'MARGIN_ISOLATEDMARGIN' | 'ISOLATEDMARGIN_ISOLATEDMARGIN' | 'MAIN_FUNDING'
    | 'FUNDING_MAIN' | 'FUNDING_UMFUTURE' | 'UMFUTURE_FUNDING' | 'MARGIN_FUNDING' | 'FUNDING_MARGIN'
    | 'FUNDING_CMFUTURE' | 'CMFUTURE_FUNDING'

  export const enum WalletUniversalTransferType {
    MAIN_UMFUTURE = 'MAIN_UMFUTURE',
    MAIN_CMFUTURE = 'MAIN_CMFUTURE',
    MAIN_MARGIN = 'MAIN_MARGIN',
    MAIN_MINING = 'MAIN_MINING',
    UMFUTURE_MAIN = 'UMFUTURE_MAIN',
    UMFUTURE_MARGIN = 'UMFUTURE_MARGIN',
    CMFUTURE_MAIN = 'CMFUTURE_MAIN',
    CMFUTURE_MARGIN = 'CMFUTURE_MARGIN',
    MARGIN_MAIN = 'MARGIN_MAIN',
    MARGIN_UMFUTURE = 'MARGIN_UMFUTURE',
    MARGIN_CMFUTURE = 'MARGIN_CMFUTURE',
    MARGIN_MINING = 'MARGIN_MINING',
    MINING_MAIN = 'MINING_MAIN',
    MINING_UMFUTURE = 'MINING_UMFUTURE',
    MINING_MARGIN = 'MINING_MARGIN',
    ISOLATEDMARGIN_MARGIN = 'ISOLATEDMARGIN_MARGIN',
    MARGIN_ISOLATEDMARGIN = 'MARGIN_ISOLATEDMARGIN',
    ISOLATEDMARGIN_ISOLATEDMARGIN = 'ISOLATEDMARGIN_ISOLATEDMARGIN',
    MAIN_FUNDING = 'MAIN_FUNDING',
    FUNDING_MAIN = 'FUNDING_MAIN',
    FUNDING_UMFUTURE = 'FUNDING_UMFUTURE',
    UMFUTURE_FUNDING = 'UMFUTURE_FUNDING',
    MARGIN_FUNDING = 'MARGIN_FUNDING',
    FUNDING_MARGIN = 'FUNDING_MARGIN',
    FUNDING_CMFUTURE = 'FUNDING_CMFUTURE',
    CMFUTURE_FUNDING = 'CMFUTURE_FUNDING'
  }

  export interface WalletUniversalTransferOptions {
    type: WalletUniversalTransferType_LT
    asset: string
    amount: string
    fromSymbol?: string
    toSymbol?: string
    recvWindow?: number
  }

  export interface WalletUniversalTransferHistoryOptions {
    type: WalletUniversalTransferType_LT
    startTime?: number
    endTime?: number
    current?: number
    size?: number
    fromSymbol?: string
    toSymbol?: string
    recvWindow?: number
  }

  export type WalletUniversalTransferStatus_LT = 'PENDING' | 'CONFIRMED' | 'FAILED'

  export const enum WalletUniversalTransferStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    FAILED = 'FAILED'
  }

  export interface UniversalTransferItem {
    asset: string
    amount: string
    type: string
    status: WalletUniversalTransferStatus_LT
    tranId: number
    timestamp: number
  }

  export interface WalletUniversalTransferHistory {
    rows: UniversalTransferItem[]
    total: number
  }

  export type LowercaseBooleanString = 'true' | 'false'

  export type UppercaseBooleanString = 'TRUE' | 'FALSE'

  export interface WalletFundingWalletOptions {
    asset?: string
    needBtcValuation?: LowercaseBooleanString
    recvWindow?: number
  }

  export interface WalletFundingWallet {
    asset: string
    free: string
    locked: string
    freeze: string
    withdrawing: string
    btcValuation: string
  }

  export interface WalletAPIPermission {
    ipRestrict: boolean
    createTime: number
    enableWithdrawals: boolean
    enableInternalTransfer: boolean
    permitsUniversalTransfer: boolean
    enableVanillaOptions: boolean
    enableReading: boolean
    enableFutures: boolean
    enableMargin: boolean
    enableSpotAndMarginTrading: boolean
    tradingAuthorityExpirationTime?: number
  }

  export interface WalletSetAPIKeyIPRestrictionOptions {
    accountApiKey: string
    ipRestrict: boolean
    recvWindow?: number
  }

  export interface WalletAPIKeyIPDetails {
    ipRestrict: LowercaseBooleanString
    ipList: string[]
    updateTime: number
    apiKey: string
  }

  export interface WalletAddIPListForAPIKeyOptions {
    accountApiKey: string
    ipAddress: string
    recvWindow?: number
  }

  export interface WalletAddIPListForAPIKeyResult {
    ip: string
    updateTime: number
    apiKey: string
  }

  export interface WalletGetIPRestrictionForAPIKeyOptions {
    accountApiKey: string
    recvWindow?: number
  }
  
  export interface WalletDeleteIPListForAPIKey {
    accountApiKey: string
    ipAddress: string
    recvWindow?: number
  }

  export interface SubAccountListOptions {
    email?: string
    isFreeze?: LowercaseBooleanString
    page?: number
    limit?: number
    recvWindow?: number
  }

  export interface SubAccountListItem {
    email: string
    isFreeze: boolean
    createTime: number
  }

  export interface SubAccountSpotAssetTransferHistoryOptions {
    fromEmail?: string
    toEmail?: string
    startTime?: number
    endTime?: number
    page?: number
    limit?: number
    recvWindow?: number
  }

  export interface SubAccountSpotAssetTransferHistoryItem {
    from: string
    to: string
    asset: string
    qty: string
    status: string
    tranId: number
    time: number
  }

  export type FuturesType_LT = 1 | 2

  export const enum FuturesType {
    USDT_MARGINED = 1,
    COIN_MARGINED = 2
  }

  export interface SubAccountFuturesAssetTransferHistoryOptions {
    email: string
    futuresType: FuturesType_LT
    startTime?: number
    endTime?: number
    page?: number
    limit?: number
    recvWindow?: number
  }

  export interface SubAccountFuturesAssetTransferHistoryTransferItem {
    from: string
    to: string
    asset: string
    qty: string
    status: string
    tranId: number
    time: number
  }
  export interface SubAccountFuturesAssetTransferHistory {
    success: boolean
    futuresType: FuturesType_LT
    transfers: SubAccountFuturesAssetTransferHistoryTransferItem[]
  }

  export interface SubAccountFuturesAssetTransferOptions {
    fromEmail: string
    toEmail: string
    futuresType: FuturesType_LT
    asset: string
    amount: string
    recvWindow?: number
  }

  export interface SubAccountAssets {
    [ asset: string ]: {
      free: number
      locked: number
    }
  }

  export interface SubAccountSummaryOptions {
    email?: string
    page?: number
    size?: number
    recvWindow?: number
  }

  export interface SubAccountSpotSubUserAssetBtcVoListItem {
    email: string
    totalAsset: string
  }

  export interface SubAccountSummary {
    totalCount: number
    masterAccountTotalAsset: string
    spotSubUserAssetBtcVoList: SubAccountSpotSubUserAssetBtcVoListItem[]
  }

  export interface SubAccountGetDepositAddressOptions {
    email: string
    coin: string
    network?: string
    size?: number
    recvWindow?: number
  }

  export interface SubAccountDepositAddress {
    address: string
    coin: string
    tag: string
    url: string
  }

  export interface SubAccountGetDepositHistoryOptions {
    email: string
    coin?: string
    status?: DepositHistoryStatus_LT
    startTime?: number
    endTime?: number
    limit?: number
    offset?: number
    recvWindow?: number
  }

  export interface SubAccountDepositHistoryItem {
    amount: string
    coin: string
    network: string
    status: DepositHistoryStatus_LT
    address: string
    addressTag: string
    txId: string
    insertTime: number
    transferType: number
    confirmTimes: string
  }

  export interface SubAccountStatusItem {
    email: string
    isSubUserEnabled: boolean
    isUserActive: boolean
    insertTime: number
    isMarginEnabled: boolean
    isFutureEnabled: boolean
    mobile: number
  }

  export interface SubAccountMarginTradeCoeffVo {
    forceLiquidationBar: string
    marginCallBar: string
    normalBar: string
  }

  export interface SubAccountMarginUserAssetVoListItem {
    asset: string
    borrowed: string
    free: string
    interest: string
    locked: string
    netAsset: string
  }

  export interface SubAccountMarginAccountDetail {
    email: string
    marginLevel: string
    totalAssetOfBtc: string
    totalLiabilityOfBtc: string
    totalNetAssetOfBtc: string
    marginTradeCoeffVo: SubAccountMarginTradeCoeffVo
    marginUserAssetVoList: SubAccountMarginUserAssetVoListItem[]
  }

  export interface SubAccountMarginAccountSummarySubAccount {
    email: string
    totalAssetOfBtc: string
    totalLiabilityOfBtc: string
    totalNetAssetOfBtc: string
  }

  export interface SubAccountMarginAccountSummary {
    totalAssetOfBtc: string
    totalLiabilityOfBtc: string
    totalNetAssetOfBtc: string
    subAccountList: SubAccountMarginAccountSummarySubAccount[]
  }

  export interface SubAccountFuturesAccountDetailAsset {
    asset: string
    initialMargin: string
    maintenanceMargin: string
    marginBalance: string
    maxWithdrawAmount: string
    openOrderInitialMargin: string
    positionInitialMargin: string
    unrealizedProfit: string
    walletBalance: string
  }

  export interface SubAccountFuturesAccountDetail {
    email: string
    asset: string
    assets: SubAccountFuturesAccountDetailAsset[]
    canDeposit: boolean
    canTrade: boolean
    canWithdraw: boolean
    feeTier: number
    maxWithdrawAmount: string
    totalInitialMargin: string
    totalMaintenanceMargin: string
    totalMarginBalance: string
    totalOpenOrderInitialMargin: string
    totalPositionInitialMargin: string
    totalUnrealizedProfit: string
    totalWalletBalance: string
    updateTime: number
  }

  export interface SubAccountFuturesAccountSummarySubAccount {
    email: string
    totalInitialMargin: string
    totalMaintenanceMargin: string
    totalMarginBalance: string
    totalOpenOrderInitialMargin: string
    totalPositionInitialMargin: string
    totalUnrealizedProfit: string
    totalWalletBalance: string
    asset: string
  }

  export interface SubAccountFuturesAccountSummary {
    totalInitialMargin: string
    totalMaintenanceMargin: string
    totalMarginBalance: string
    totalOpenOrderInitialMargin: string
    totalPositionInitialMargin: string
    totalUnrealizedProfit: string
    totalWalletBalance: string
    asset: string
    subAccountList: SubAccountFuturesAccountSummarySubAccount[]
  }

  export interface SubAccountFuturesPositionRisk {
    entryPrice: string
    leverage: string
    maxNotional: string
    liquidationPrice: string
    markPrice: string
    positionAmount: string
    symbol: string
    unrealizedProfit: string
  }

  export type FuturesTransferType_LT = 1 | 2 | 3 | 4

  export const enum FuturesTransferType {
    SPOT_TO_USDTM = 1,
    USDTM_TO_SPOT = 2,
    SPOT_TO_COINM = 3,
    COINM_TO_SPOT = 4
  }

  export interface SubAccountFuturesTransferOptions {
    email: string
    asset: string
    amount: string
    type: FuturesTransferType_LT
    recvWindow?: number
  }

  export type SubAccountMarginTransferType_LT = 1 | 2

  export const enum SubAccountMarginTransferType {
    SPOT_TO_MARGIN = 1,
    MARGIN_TO_SPOT = 2
  }

  export interface SubAccountMarginTransferOptions {
    email: string
    asset: string
    amount: string
    type: SubAccountMarginTransferType_LT
    recvWindow?: number
  }

  export interface SubAccountTransferToSiblingSubAccountOptions {
    toEmail: string
    asset: string
    amount: string
    recvWindow?: number
  }

  export type SubAccountTransferType_LT = 1 | 2

  export const enum SubAccountTransferType {
    TRANSFER_IN = 1,
    TRANSFER_OUT = 2
  }

  export interface SubAccountTransferHistoryOptions {
    asset?: string
    type?: SubAccountTransferType_LT
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export type SubAccountAccountType_LT = 'SPOT' | 'USDT_FUTURE' | 'COIN_FUTURE'

  export const enum SubAccountAccountType {
    SPOT = 'SPOT',
    USDT_FUTURE = 'USDT_FUTURE',
    COIN_FUTURE = 'COIN_FUTURE'
  }

  export interface SubAccountTransferHistory {
    counterParty: string
    email: string
    type: SubAccountTransferType_LT
    asset: string
    qty: string
    fromAccountType: SubAccountAccountType_LT
    toAccountType: SubAccountAccountType_LT
    status: string
    tranId: number
    time: number
  }

  export interface SubAccountUniversalTransferOptions {
    fromEmail?: string
    toEmail?: string
    fromAccountType: SubAccountAccountType_LT
    toAccountType: SubAccountAccountType_LT
    asset: string
    amount: string
    recvWindow?: number
  }

  export interface SubAccountUniversalTransferHistoryOptions {
    fromEmail?: string
    toEmail?: string
    startTime?: number
    endTime?: number
    page?: number
    limit?: number
    recvWindow?: number
  }

  export interface SubAccountUniversalTransferHistoryItem {
    tranId: number
    fromEmail: string
    toEmail: string
    asset: string
    amount: string
    fromAccountType: SubAccountAccountType_LT
    toAccountType: SubAccountAccountType_LT
    status: string
    createTimeStamp: number
  }

  export interface SubAccountGetFuturesAccountDetailV2Options {
    email: string
    futuresType: FuturesType_LT
    recvWindow?: number
  }

  export type SubAccountFuturesAccountDetailV2 = {
    futureAccountResp: {
      email: string
      asset: string
      assets: SubAccountFuturesAccountDetailAsset[]
      canDeposit: boolean
      canTrade: boolean
      canWithdraw: boolean
      feeTier: number
      maxWithdrawAmount: string
      totalInitialMargin: string
      totalMaintenanceMargin: string
      totalMarginBalance: string
      totalOpenOrderInitialMargin: string
      totalPositionInitialMargin: string
      totalUnrealizedProfit: string
      totalWalletBalance: string
      updateTime: number
    }
  } | {
    deliveryAccountResp: {
      email: string
      assets: SubAccountFuturesAccountDetailAsset[]
      canDeposit: boolean
      canTrade: boolean
      canWithdraw: boolean
      feeTier: number
      updateTime: number
    }
  }

  export interface SubAccountGetFuturesAccountSummaryV2Options {
    futuresType: FuturesType_LT
    page?: number
    limit?: number
    recvWindow?: number
  }

  export interface SubAccountFuturesAccountSummaryV2DeliverySubAccount {
    email: string
    totalMarginBalance: string
    totalUnrealizedProfit: string
    totalWalletBalance: string
    asset: string
  }

  export type SubAccountFuturesAccountSummaryV2 = {
    futureAccountSummaryResp: {
      totalInitialMargin: string
      totalMaintenanceMargin: string
      totalMarginBalance: string
      totalOpenOrderInitialMargin: string
      totalPositionInitialMargin: string
      totalUnrealizedProfit: string
      totalWalletBalance: string
      asset: string
      subAccountList: SubAccountFuturesAccountSummarySubAccount[]
    }
  } | {
    deliveryAccountSummaryResp: {
      totalMarginBalanceOfBTC: string
      totalUnrealizedProfitOfBTC: string
      totalWalletBalanceOfBTC: string
      asset: string
      subAccountList: SubAccountFuturesAccountSummaryV2DeliverySubAccount[]
    }
  }

  export interface SubAccountGetFuturesPositionRiskV2Options {
    email: string
    futuresType: FuturesType_LT
    recvWindow?: number
  }

  export type PositionSide_LT = 'BOTH' | OrderSide_LT

  export const enum PositionSide {
    BUY = 'BUY',
    SELL = 'SELL',
    BOTH = 'BOTH'
  }

  export type SubAccountFuturesPositionRiskV2 = {
    futurePositionRiskVos: {
      entryPrice: string
      leverage: string
      maxNotional: string
      liquidationPrice: string
      markPrice: string
      positionAmount: string
      symbol: string
      unrealizedProfit: string
    }[]
  } | {
    deliveryPositionRiskVos: {
      entryPrice: string
      markPrice: string
      leverage: string
      isolated: string
      isolatedWallet: string
      isolatedMargin: string
      isAutoAddMargin: string
      positionSide: PositionSide_LT
      positionAmount: string
      symbol: string
      unrealizedProfit: string
    }[]
  }

  export interface SubAccountEnableBLVTOptions {
    email: string
    enableBlvt: boolean
    recvWindow?: number
  }

  export interface SubAccountEnableBLVT {
    email: string
    enableBlvt: boolean
  }

  export interface SubAccountDepositToManagedOptions {
    email: string
    asset: string
    amount: string
    recvWindow?: number
  }

  export interface SubAccountManagedAccountDetail {
    coin: string
    name: string
    totalBalance: string
    availableBalance: string
    inOrder: string
    btcValue: string
  }

  export interface SubAccountWithdrawFromManagedOptions {
    fromEmail: string
    asset: string
    amount: string
    transferDate?: number
    recvWindow?: number
  }

  export interface SpotMarketDataHistoricalTradesOptions {
    symbol: string
    limit?: number
    fromId?: number
  }

  export interface SpotMarketDataHistoricalTrade {
    id: number
    price: string
    qty: string
    quoteQty: string
    time: number
    isBuyerMaker: boolean
    isBestMatch: boolean
  }

  export type OrderSide_LT = 'BUY' | 'SELL'

  export const enum OrderSide {
    BUY = 'BUY',
    SELL = 'SELL'
  }

  export type OrderTestType_LT = 'LIMIT' | 'MARKET'

  export const enum OrderTestType {
    LIMIT = 'LIMIT',
    MARKET = 'MARKET'
  }

  export type TimeInForce_LT = 'FOK' | 'GTC' | 'IOC'

  export const enum TimeInForce {
    FOK = 'FOK',
    GTC = 'GTC',
    IOC = 'IOC'
  }

  export type OrderRespType_LT = 'ACK' | 'RESULT' | 'FULL'

  export const enum OrderRespType {
    ACK = 'ACK',
    RESULT = 'RESULT',
    FULL = 'FULL'
  }

  export interface SpotTradeOrderTestOptions {
    symbol: string
    side: OrderSide_LT
    type?: OrderTestType_LT
    timeInForce?: TimeInForce_LT
    quantity?: string
    quoteOrderQty?: string
    price?: string
    newClientOrderId?: string
    stopPrice?: string
    icebergQty?: string
    newOrderRespType?: OrderRespType_LT
    recvWindow?: number
  }

  export type OrderType_LT = OrderTestType_LT | 'STOP_LOSS' | 'STOP_LOSS_LIMIT'
    | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT' | 'LIMIT_MAKER'
  
  export const enum OrderType {
    LIMIT = 'LIMIT',
    MARKET = 'MARKET',
    STOP_LOSS = 'STOP_LOSS',
    STOP_LOSS_LIMIT = 'STOP_LOSS_LIMIT',
    TAKE_PROFIT = 'TAKE_PROFIT',
    TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT',
    LIMIT_MAKER = 'LIMIT_MAKER'
  }

  export interface SpotTradeOrderOptions {
    symbol: string
    side: OrderSide_LT
    type?: OrderType_LT
    timeInForce?: TimeInForce_LT
    quantity?: string
    quoteOrderQty?: string
    price?: string
    newClientOrderId?: string
    stopPrice?: string
    icebergQty?: string
    newOrderRespType?: OrderRespType_LT
    recvWindow?: number
  }

  export type OrderStatus_LT = 'CANCELED' | 'EXPIRED' | 'FILLED' | 'NEW'
    | 'PARTIALLY_FILLED' | 'PENDING_CANCEL' | 'REJECTED'
  
  export const enum OrderStatus {
    CANCELED = 'CANCELED',
    EXPIRED = 'EXPIRED',
    FILLED = 'FILLED',
    NEW = 'NEW',
    PARTIALLY_FILLED = 'PARTIALLY_FILLED',
    PENDING_CANCEL = 'PENDING_CANCEL',
    REJECTED = 'REJECTED'
  }

  export interface SpotTradeOrderResultACK {
    symbol: string
    orderId: number
    orderListId: number
    clientOrderId: string
    transactTime: number
  }

  export interface SpotTradeOrderResultRESULT {
    symbol: string
    orderId: number
    orderListId: number
    clientOrderId: string
    transactTime: number
    price: string
    origQty: string
    executedQty: string
    cummulativeQuoteQty: string
    status: OrderStatus_LT
    timeInForce: TimeInForce_LT
    type: OrderTestType_LT
    side: OrderSide_LT
  }

  export interface SpotTradeOrderResultFULL {
    symbol: string
    orderId: number
    orderListId: number
    clientOrderId: string
    transactTime: number
    price: string
    origQty: string
    executedQty: string
    cummulativeQuoteQty: string
    status: OrderStatus_LT
    timeInForce: TimeInForce_LT
    type: OrderTestType_LT
    side: OrderSide_LT
    fills: {
      price: string
      qty: string
      commission: string
      commissionAsset: string
    }[]
  }

  export type SpotTradeOrderResult = SpotTradeOrderResultACK | SpotTradeOrderResultRESULT | SpotTradeOrderResultFULL

  export interface SpotTradeCancelOrderOptions {
    symbol: string
    orderId?: number
    origClientOrderId?: string
    newClientOrderId?: string
    recvWindow?: number
  }

  export interface SpotTradeCancelOrderResult {
    symbol: string
    origClientOrderId: string
    orderId: number
    orderListId: number
    clientOrderId: string
    price: string
    origQty: string
    executedQty: string
    cummulativeQuoteQty: string
    status: OrderStatus_LT
    timeInForce: TimeInForce_LT
    type: OrderType_LT
    side: OrderSide_LT
  }

  export interface SpotTradeGetOrderOptions {
    symbol: string
    orderId?: number
    origClientOrderId?: string
    recvWindow?: number
  }

  export interface SpotTradeOrder {
    symbol: string
    orderId: number
    orderListId: number
    clientOrderId: string
    price: string
    origQty: string
    executedQty: string
    cummulativeQuoteQty: string
    status: OrderStatus_LT
    timeInForce: TimeInForce_LT
    type: OrderTestType_LT
    side: OrderSide_LT
    stopPrice: string
    icebergQty: string
    time: number
    updateTime: number
    isWorking: boolean
    origQuoteOrderQty: string
  }

  export interface SpotTradeAllOrdersOptions {
    symbol: string
    orderId?: number
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export interface SpotTradeAccount {
    makerCommission: number
    takerCommission: number
    buyerCommission: number
    sellerCommission: number
    canTrade: boolean
    canWithdraw: boolean
    canDeposit: boolean
    updateTime: number
    accountType: string
    balances: AssetBalance[]
    permissions: string[]
  }

  export interface SpotTradeMyTradesOptions {
    symbol: string
    orderId?: number
    startTime?: number
    endTime?: number
    fromId?: number
    limit?: number
    recvWindow?: number
  }

  export interface SpotTradeMyTrade {
    symbol: string
    id: number
    orderId: number
    orderListId: number
    price: string
    qty: string
    quoteQty: string
    commission: string
    commissionAsset: string
    time: number
    isBuyer: boolean
    isMaker: boolean
    isBestMatch: boolean
  }

  export interface SpotTradeOCOOrderOptions {
    symbol: string
    listClientOrderId?: string
    side: OrderSide_LT
    quantity: string
    limitClientOrderId?: string
    price: string
    limitIcebergQty?: string
    stopClientOrderId?: string
    stopPrice: string
    stopLimitPrice?: string
    stopIcebergQty?: string
    stopLimitTimeInForce?: TimeInForce_LT
    newOrderRespType?: OrderRespType_LT
    recvWindow?: number
  }

  export interface SpotTradeOCOOrderResultOrder {
    symbol: string
    orderId: number
    clientOrderId: string
  }

  export interface SpotTradeOCOOrderResultOrderReport {
    symbol: string
    orderId: number
    orderListId: number
    clientOrderId: string
    transactTime: number
    price: string
    origQty: string
    executedQty: string
    cummulativeQuoteQty: string
    status: OrderStatus_LT
    timeInForce: TimeInForce_LT
    type: OrderType_LT
    side: OrderSide_LT
    stopPrice?: string
  }

  export type ListStatusType_LT = 'RESPONSE' | 'EXEC_STARTED' | 'ALL_DONE'

  export const enum ListStatusType {
    RESPONSE = 'RESPONSE',
    EXEC_STARTED = 'EXEC_STARTED',
    ALL_DONE = 'ALL_DONE',
  }

  export type ListOrderStatus_LT = 'EXECUTING' | 'ALL_DONE' | 'REJECT'

  export const enum ListOrderStatus {
    EXECUTING = 'EXECUTING',
    ALL_DONE = 'ALL_DONE',
    REJECT = 'REJECT',
  }

  export interface SpotTradeOCOOrderResult {
    orderListId: number
    contingencyType: string
    listStatusType: ListStatusType_LT
    listOrderStatus: ListOrderStatus_LT
    listClientOrderId: string
    transactionTime: number
    symbol: string
    orders: SpotTradeOCOOrderResultOrder[]
    orderReports: SpotTradeOCOOrderResultOrderReport[]
  }

  export interface SpotTradeOCOCancelOrderOptions {
    symbol: string
    orderListId?: number
    listClientOrderId?: string
    newClientOrderId?: string
    recvWindow?: number
  }

  export interface SpotTradeOCOCancelOrderResultOrderReport {
    symbol: string
    origClientOrderId: string
    orderId: number
    orderListId: number
    clientOrderId: string
    price: string
    origQty: string
    executedQty: string
    cummulativeQuoteQty: string
    status: OrderStatus_LT
    timeInForce: TimeInForce_LT
    type: OrderType_LT
    side: OrderSide_LT
    stopPrice?: string
  }

  export interface SpotTradeOCOCancelOrderResult {
    orderListId: number
    contingencyType: string
    listStatusType: ListStatusType_LT
    listOrderStatus: ListOrderStatus_LT
    listClientOrderId: string
    transactionTime: number
    symbol: string
    orders: SpotTradeOCOOrderResultOrder[]
    orderReports: SpotTradeOCOCancelOrderResultOrderReport[]
  }

  export interface SpotTradeOCOGetOrderOptions {
    orderListId?: number
    origClientOrderId?: string
    recvWindow?: number
  }

  export interface SpotTradeOCOOrder {
    orderListId: number
    contingencyType: string
    listStatusType: ListStatusType_LT
    listOrderStatus: ListOrderStatus_LT
    listClientOrderId: string
    transactionTime: number
    symbol: string
    orders: SpotTradeOCOOrderResultOrder[]
  }

  export interface SpotTradeOCOAllOrdersOptions {
    fromId?: number
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export type SavingsStatus_LT = 'ALL' | 'SUBSCRIBABLE' | 'UNSUBSCRIBABLE'

  export const enum SavingsStatus {
    ALL = 'ALL',
    SUBSCRIBABLE = 'SUBSCRIBABLE',
    UNSUBSCRIBABLE = 'UNSUBSCRIBABLE'
  }

  export type SavingsFlexibleProductListFeatured_LT = 'ALL' | 'TRUE'

  export const enum SavingsFlexibleProductListFeatured {
    ALL = 'ALL',
    TRUE = 'TRUE'
  }

  export interface SavingsFlexibleProductListOptions {
    status?: SavingsStatus_LT
    featured?: SavingsFlexibleProductListFeatured_LT
    current?: number
    size?: number
    recvWindow?: number
  }

  export interface SavingsFlexibleProductListItem {
    asset: string
    avgAnnualInterestRate: string
    canPurchase: boolean
    canRedeem: boolean
    dailyInterestPerThousand?: string
    featured: boolean
    minPurchaseAmount: string
    productId: string
    purchasedAmount: string
    status: string
    upLimit: string
    upLimitPerUser: string
  }

  export type SavingsFlexibleProductType_LT = 'FAST' | 'NORMAL'

  export const enum SavingsFlexibleProductType {
    FAST = 'FAST',
    NORMAL = 'NORMAL'
  }

  export interface SavingsFlexibleProductLeftDailyRedemptionQuotaOptions {
    productId: string
    type: SavingsFlexibleProductType_LT
    recvWindow?: number
  }

  export interface SavingsFlexibleProductLeftDailyRedemptionQuota {
    asset: string
    dailyQuota: string
    leftQuota: string
    minRedemptionAmount: string
  }

  export interface SavingsFlexibleProductRedeem {
    productId: string
    amount: string
    type: SavingsFlexibleProductType_LT
    recvWindow?: number
  }

  export interface SavingsFlexibleProductPosition {
    annualInterestRate: string
    asset: string
    avgAnnualInterestRate: string
    canRedeem: boolean
    dailyInterestRate: string
    freeAmount: string
    freezeAmount: string
    lockedAmount: string
    productId: string
    productName: string
    redeemingAmount: string
    todayPurchasedAmount: string
    totalAmount: string
    totalInterest: string
  }

  export type SavingsFixedActivityProjectType_LT = 'ACTIVITY' | 'CUSTOMIZED_FIXED'

  export const enum SavingsFixedActivityProjectType {
    ACTIVITY = 'ACTIVITY',
    CUSTOMIZED_FIXED = 'CUSTOMIZED_FIXED'
  }

  export type SavingsFixedActivityProjectListSortBy_LT = 'START_TIME' | 'LOT_SIZE' | 'INTEREST_RATE' | 'DURATION'

  export const enum SavingsFixedActivityProjectListSortBy {
    START_TIME = 'START_TIME',
    LOT_SIZE = 'LOT_SIZE',
    INTEREST_RATE = 'INTEREST_RATE',
    DURATION = 'DURATION'
  }

  export interface SavingsFixedActivityProjectListOptions {
    asset?: string
    type: SavingsFixedActivityProjectType_LT
    status?: SavingsStatus_LT
    isSortAsc?: boolean
    sortBy?: SavingsFixedActivityProjectListSortBy_LT
    current?: number
    size?: number
    recvWindow?: number
  }

  export interface SavingsFixedActivityProjectListItem {
    asset: string
    displayPriority: number
    duration: number
    interestPerLot: string
    interestRate: string
    lotSize: string
    lotsLowLimit: number
    lotsPurchased: number
    lotsUpLimit: number
    maxLotsPerUser: number
    needKyc: boolean
    projectId: string
    projectName: string
    status: string
    type: SavingsFixedActivityProjectType_LT
    withAreaLimitation: boolean
  }

  export interface SavingsFixedActivityProjectPurchaseOptions {
    productId: string
    lot: number
    amount: string
    recvWindow?: number
  }

  export type SavingsFixedActivityProjectPositionStatus_LT = 'HOLDING' | 'REDEEMED'

  export const enum SavingsFixedActivityProjectPositionStatus {
    HOLDING = 'HOLDING',
    REDEEMED = 'REDEEMED'
  }

  export interface SavingsFixedActivityProjectPositionOptions {
    asset: string
    projectId?: string
    status: SavingsFixedActivityProjectPositionStatus_LT
    recvWindow?: number
  }

  export interface SavingsFixedActivityProjectPositionListItem {
    asset: string
    canTransfer: boolean
    createTimestamp: number
    duration: number
    endTime: number
    interest: string
    interestRate: string
    lot: number
    positionId: number
    principal: string
    projectId: string
    projectName: string
    purchaseTime: number
    redeemDate: string
    startTime: number
    status: SavingsFixedActivityProjectPositionStatus_LT
    type: SavingsFixedActivityProjectType_LT
  }

  export interface SavingsLendingAccountPositionAmountVosItem {
    amount: string
    amountInBTC: string
    amountInUSDT: string
    asset: string
  }

  export interface SavingsLendingAccount {
    positionAmountVos: SavingsLendingAccountPositionAmountVosItem[]
    totalAmountInBTC: string
    totalAmountInUSDT: string
    totalFixedAmountInBTC: string
    totalFixedAmountInUSDT: string
    totalFlexibleInBTC: string
    totalFlexibleInUSDT: string
  }

  export type SavingsLendingType_LT = 'DAILY' | 'ACTIVITY' | 'CUSTOMIZED_FIXED'

  export const enum SavingsLendingType {
    DAILY = 'DAILY',
    ACTIVITY = 'ACTIVITY',
    CUSTOMIZED_FIXED = 'CUSTOMIZED_FIXED'
  }

  export interface SavingsPurchaseRecordOptions {
    lendingType: SavingsLendingType_LT
    asset?: string
    startTime?: number
    endTime?: number
    current?: number
    size?: number
    recvWindow?: number
  }

  export interface SavingsPurchaseRecordFlexibleProductsItem {
    amount: string
    asset: string
    createTime: number
    lendingType: SavingsLendingType_LT
    productName: string
    purchaseId: string
    status: string
  }

  export interface SavingsPurchaseRecordFixedActivityProjectsItem {
    amount: string
    asset: string
    createTime: number
    lendingType: SavingsLendingType_LT
    lot: string
    productName: string
    purchaseId: number
    status: string
  }

  export interface SavingsRedemptionRecordOptions {
    lendingType: SavingsLendingType_LT
    asset?: string
    startTime?: number
    endTime?: number
    current?: number
    size?: number
    recvWindow?: number
  }

  export interface SavingsRedemptionRecordFlexibleProductsItem {
    amount: string
    asset: string
    createTime: number
    principal: string
    projectId: string
    projectName: string
    status: string
    type: SavingsFlexibleProductType_LT
  }

  export interface SavingsRedemptionRecordFixedActivityProjectsItem {
    amount: string
    asset: string
    createTime: number
    interest: string
    principal: string
    projectId: number
    projectName: string
    startTime: number
    status: string
  }

  export interface SavingsInterestHistoryOptions {
    lendingType: SavingsLendingType_LT
    asset?: string
    startTime?: number
    endTime?: number
    current?: number
    size?: number
    recvWindow?: number
  }

  export interface SavingsInterestHistoryListItem {
    asset: string
    interest: string
    lendingType: string
    productName: string
    time: number
  }

  export interface SavingsChangeToDailyPositionOptions {
    projectId: string
    lot: number
    positionId?: number
    recvWindow?: number
  }

  export interface SavingsChangeToDailyPositionResult {
    dailyPurchaseId: number
    success: boolean
    time: number
  }

  export interface MiningMiningAlgorithm {
    algoName: string
    algoId: number
    poolIndex: number
    unit: string
  }

  export interface MiningAcquiringAlgorithmResult {
    code: number
    msg: string
    data: MiningMiningAlgorithm[]
  }

  export interface MiningMiningCoinName {
    coinName: string
    coinId: number
    poolIndex: number
    algoId: number
    algoName: string
  }

  export interface MiningAcquiringCoinNameResult {
    code: number
    msg: string
    data: MiningMiningCoinName[]
  }

  export interface MiningDetailedMinerListOptions {
    algo: string
    userName: string
    workerName: string
    recvWindow?: number
  }

  export interface MiningDetailedMinerListHashrateData {
    time: number
    hashrate: string
    reject: number
  }

  export interface MiningDetailedMinerListItem {
    workerName: string
    type: string
    hashrateDatas: MiningDetailedMinerListHashrateData[]
  }

  export interface MiningDetailedMinerListResult {
    code: number
    msg: string
    data: MiningDetailedMinerListItem[]
  }

  export type MiningMinerListSort_LT = 0 | 1

  export const enum MiningMinerListSort {
    POSITIVE_SEQUENCE = 0,
    NEGATIVE_SEQUENCE = 1
  }

  export type MiningMinerListSortColumn_LT = 1 | 2 | 3 | 4 | 5

  export const enum MiningMinerListSortColumn {
    MINER_NAME = 1,
    REALTIME_COMPUTING_POWER = 2,
    DAILY_AVERAGE_COMPUTING_POWER = 3,
    REALTIME_REJECTION_RATE = 4,
    LAST_SUBMISSION_TIME = 5
  }

  export type MiningMinerListWorkerStatus_LT = 0 | 1 | 2 | 3

  export const enum MiningMinerListWorkerStatus {
    ALL = 0,
    VALID = 1,
    INVALID = 2,
    FAILURE = 3
  }

  export interface MiningMinerListOptions {
    algo: string
    userName: string
    pageIndex?: number
    sort?: MiningMinerListSort_LT
    sortColumn?: MiningMinerListSortColumn_LT
    workerStatus?: MiningMinerListWorkerStatus_LT
    recvWindow?: number
  }

  export interface MiningMinerListWorkerData {
    workerId: string
    workerName: string
    status: number
    hashRate: number
    dayHashRate: number
    rejectRate: number
    lastShareTime: number
  }

  export interface MiningMinerListItem {
    workerDatas: MiningMinerListWorkerData[]
    totalNum: number
    pageSize: number
  }

  export interface MiningMinerListResult {
    code: number
    msg: string
    data: MiningMinerListItem[]
  }

  export interface MiningEarningsListOptions {
    algo: string
    userName: string
    coin?: string
    startDate?: number
    endDate?: number
    pageIndex?: number
    pageSize?: number
    recvWindow?: number
  }

  export type MiningEarningsListItemAccountProfitType_LT = 0 | 5 | 7 | 8 | 31 | 32 | 33

  export const enum MiningEarningsListItemAccountProfitType {
    MINING_WALLET = 0,
    MINING_ADDRESS = 5,
    POOL_SAVINGS = 7,
    TRANSFERRED = 8,
    INCOME_TRANSFER = 31,
    HASHRATE_RESALE_MINING_WALLET = 32,
    HASHRATE_RESALE_POOL_SAVINGS = 33
  }

  export type MiningProfitsStatus_LT = 0 | 1 | 2

  export const enum MiningProfitsStatus {
    UNPAID = 0,
    PAYING = 1,
    PAID = 2
  }

  export interface MiningEarningsListItemAccountProfit {
    time: number
    type: MiningEarningsListItemAccountProfitType_LT
    hashTransfer: any
    transferAmount: any
    dayHashRate: number
    profitAmount: number
    coinName: string
    status: MiningProfitsStatus_LT
  }

  export interface MiningEarningsListItem {
    accountProfits: MiningEarningsListItemAccountProfit[]
    totalNum: number
    pageSize: number
  }

  export interface MiningEarningsListResult {
    code: number
    msg: string
    data: MiningEarningsListItem[]
  }

  export interface MiningExtraBonusListOptions {
    algo: string
    userName: string
    coin?: string
    startDate?: number
    endDate?: number
    pageIndex?: number
    pageSize?: number
    recvWindow?: number
  }

  export type MiningExtraBonusListItemOtherProfitsType_LT = 1 | 2 | 3 | 4 | 6 | 7

  export const enum MiningExtraBonusListItemOtherProfitsType {
    MERGED_MINING = 1,
    ACTIVITY_BONUS = 2,
    REBATE = 3,
    SMART_POOL = 4,
    INCOME_TRANSFER = 6,
    POOL_SAVINGS = 7
  }

  export interface MiningExtraBonusListItemOtherProfits {
    time: number
    coinName: string
    type: MiningExtraBonusListItemOtherProfitsType_LT
    profitAmount: number
    status: MiningProfitsStatus_LT
  }

  export interface MiningExtraBonusListItem {
    otherProfits: MiningExtraBonusListItemOtherProfits[]
    totalNum: number
    pageSize: number
  }

  export interface MiningExtraBonusListResult {
    code: number
    msg: string
    data: MiningExtraBonusListItem[]
  }

  export interface MiningHashrateResaleListOptions {
    pageIndex?: number
    pageSize?: number
    recvWindow?: number
  }

  export type MiningHashrateResaleListConfigDetailsStatus_LT = 0 | 1 | 2

  export const enum MiningHashrateResaleListConfigDetailsStatus {
    PROCESSING = 0,
    CANCELLED = 1,
    TERMINATED = 2
  }

  export interface MiningHashrateResaleListConfigDetails {
    configId: number
    poolUsername: string
    toPoolUsername: string
    algoName: string
    hashRate: number
    startDay: number
    endDay: number
    status: MiningHashrateResaleListConfigDetailsStatus_LT
  }

  export interface MiningHashrateResaleList {
    configDetails: MiningHashrateResaleListConfigDetails[]
    totalNum: number
    pageSize: number
  }

  export interface MiningHashrateResaleListResult {
    code: number
    msg: string
    data: MiningHashrateResaleList
  }

  export interface MiningHashrateResaleDetailOptions {
    configId: number
    userName: string
    pageIndex?: number
    pageSize?: number
    recvWindow?: number
  }

  export interface MiningHashrateResaleDetailProfitTransferDetail {
    poolUsername: string
    toPoolUsername: string
    algoName: string
    hashRate: number
    day: number
    amount: number
    coinName: string
  }

  export interface MiningHashrateResaleDetail {
    profitTransferDetails: MiningHashrateResaleDetailProfitTransferDetail[]
    totalNum: number
    pageSize: number
  }

  export interface MiningHashrateResaleDetailResult {
    code: number
    msg: string
    data: MiningHashrateResaleDetail
  }

  export interface MiningHashrateResaleRequestOptions {
    userName: string
    algo: string
    endDate: number
    startDate: number
    toPoolUser: string
    hashRate: number
    recvWindow?: number
  }

  export interface MiningHashrateResaleCancelConfigurationOptions {
    configId: number
    userName: string
    recvWindow?: number
  }

  export interface MiningStaticListOptions {
    algo: string
    userName: string
    recvWindow?: number
  }

  export interface MiningStaticList {
    fifteenMinHashRate: string
    dayHashRate: string
    validNum: number
    invalidNum: number
    profitToday: { [ symbol: string ]: string }
    profitYesterday: { [ symbol: string ]: string }
    userName: string
    unit: string
    algo: string
  }

  export interface MiningStaticListResult {
    code: number
    msg: string
    data: MiningStaticList
  }

  export interface MiningAccountListOptions {
    algo: string
    userName: string
    recvWindow?: number
  }

  export interface MiningAccountListDataListItem {
    time: number
    hashrate: string
    reject: string
  }

  export interface MiningAccountListData {
    type: string
    userName: string
    list: MiningAccountListDataListItem[]
  }

  export interface MiningAccountListResult {
    code: number
    msg: string
    data: MiningAccountListData
  }

  export interface SpotFuturesTransfer {
    asset: string
    amount: string
    type: FuturesTransferType_LT
    recvWindow?: number
  }

  export interface SpotFuturesTransactionHistoryListOptions {
    asset: string
    startTime: number
    endTime?: number
    current?: number
    size?: number
    recvWindow?: number
  }

  export type SpotFuturesStatus_LT = 'PENDING' | 'CONFIRMED' | 'FAILED'

  export const enum SpotFuturesStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    FAILED = 'FAILED'
  }

  export interface SpotFuturesTransactionHistoryListItem {
    asset: string
    tranId: number
    amount: string
    type: FuturesTransferType_LT
    timestamp: number
    status: SpotFuturesStatus_LT
  }

  export interface SpotFuturesTransactionHistoryListResult {
    rows: SpotFuturesTransactionHistoryListItem[]
    total: number
  }

  export interface SpotFuturesCrossCollateralBorrowOptions {
    coin: string
    amount?: string
    collateralCoin: string
    collateralAmount?: string
    recvWindow?: number
  }

  export interface SpotFuturesCrossCollateralBorrowResult {
    coin: string
    amount: string
    collateralCoin: string
    collateralAmount: string
    time: number
    borrowId: string
  }

  export interface SpotFuturesCrossCollateralBorrowHistoryOptions {
    coin?: string
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export interface SpotFuturesCrossCollateralBorrowHistoryListItem {
    confirmedTime: number
    coin: string
    collateralRate: string
    leftTotal: string
    leftPrincipal: string
    deadline: number
    collateralCoin: string
    collateralAmount: string
    orderStatus: SpotFuturesStatus_LT
    borrowId: string
  }

  export interface SpotFuturesCrossCollateralBorrowHistoryResult {
    rows: SpotFuturesCrossCollateralBorrowHistoryListItem[]
    total: number
  }

  export interface SpotFuturesCrossCollateralRepayOptions {
    coin: string
    collateralCoin: string
    amount: string
    recvWindow?: number
  }

  export interface SpotFuturesCrossCollateralRepayResult {
    coin: string
    amount: string
    collateralCoin: string
    repayId: string
  }

  export interface SpotFuturesCrossCollateralRepayHistoryOptions {
    coin?: string
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export type SpotFuturesCrossCollateralRepayType_LT = 'NORMAL' | 'COLLATERAL'

  export const enum SpotFuturesCrossCollateralRepayType {
    NORMAL = 'NORMAL',
    COLLATERAL = 'COLLATERAL'
  }

  export interface SpotFuturesCrossCollateralRepayHistoryListItem {
    coin: string
    amount: string
    collateralCoin: string
    repayType: SpotFuturesCrossCollateralRepayType_LT
    releasedCollateral: string
    price: string
    repayCollateral: string
    confirmedTime: number
    updateTime: number
    status: SpotFuturesStatus_LT
    repayId: string
  }

  export interface SpotFuturesCrossCollateralRepayHistoryResult {
    rows: SpotFuturesCrossCollateralRepayHistoryListItem[]
    total: number
  }

  export interface SpotFuturesCrossCollateralWalletCrossCollateral {
    collateralCoin: string
    locked: string
    loanAmount: string
    currentCollateralRate: string
    interestFreeLimitUsed: string
    principalForInterest: string
    interest: string
  }

  export interface SpotFuturesCrossCollateralWallet {
    totalCrossCollateral: string
    totalBorrowed: string
    totalInterest: string
    interestFreeLimit: string
    asset: string
    crossCollaterals: SpotFuturesCrossCollateralWalletCrossCollateral[]
  }

  export interface SpotFuturesCrossCollateralWalletV2CrossCollateral {
    loanCoin: string
    collateralCoin: string
    locked: string
    loanAmount: string
    currentCollateralRate: string
    interestFreeLimitUsed: string
    principalForInterest: string
    interest: string
  }

  export interface SpotFuturesCrossCollateralWalletV2 {
    totalCrossCollateral: string
    totalBorrowed: string
    totalInterest: string
    interestFreeLimit: string
    asset: string
    crossCollaterals: SpotFuturesCrossCollateralWalletV2CrossCollateral[]
  }
  
  export interface SpotFuturesCrossCollateralInformationResultItem {
    collateralCoin: string
    rate: string
    marginCallCollateralRate: string
    liquidationCollateralRate: string
    currentCollateralRate: string
    interestRate?: string
    interestGracePeriod: string
    loanCoin: string
  }
  
  export interface SpotFuturesCrossCollateralInformationV2Options {
    loanCoin?: string
    collateralCoin?: string
    recvWindow?: number
  }
  
  export interface SpotFuturesCrossCollateralInformationV2ResultItem {
    loanCoin: string
    collateralCoin: string
    rate: string
    marginCallCollateralRate: string
    liquidationCollateralRate: string
    currentCollateralRate: string
    interestRate?: string
    interestGracePeriod: string
  }

  export type SpotFuturesCrossCollateralDirection_LT = 'ADDITIONAL' | 'REDUCED'

  export const enum SpotFuturesCrossCollateralDirection {
    ADDITIONAL = 'ADDITIONAL',
    REDUCED = 'REDUCED'
  }
  
  export interface SpotFuturesCrossCollateralCalculateRateAfterAdjustOptions {
    collateralCoin: string
    amount: string
    direction: SpotFuturesCrossCollateralDirection_LT
    recvWindow?: number
  }
  
  export interface SpotFuturesCrossCollateralCalculateRateAfterAdjustV2Options {
    loanCoin: string
    collateralCoin: string
    amount: string
    direction: SpotFuturesCrossCollateralDirection_LT
    recvWindow?: number
  }
  
  export interface SpotFuturesAdjustCrossCollateralOptions {
    collateralCoin: string
    amount: string
    direction: SpotFuturesCrossCollateralDirection_LT
    recvWindow?: number
  }
  
  export interface SpotFuturesAdjustCrossCollateral {
    collateralCoin: string
    direction: SpotFuturesCrossCollateralDirection_LT
    amount: string
    time: number
  }
  
  export interface SpotFuturesAdjustCrossCollateralV2Options {
    loanCoin: string
    collateralCoin: string
    amount: string
    direction: SpotFuturesCrossCollateralDirection_LT
    recvWindow?: number
  }
  
  export interface SpotFuturesAdjustCrossCollateralV2 {
    loanCoin: string
    collateralCoin: string
    direction: SpotFuturesCrossCollateralDirection_LT
    amount: string
    time: number
  }
  
  export interface SpotFuturesAdjustCrossCollateralHistoryOptions {
    loanCoin?: string
    collateralCoin?: string
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export interface SpotFuturesAdjustCrossCollateralHistoryListItem {
    amount: string
    collateralCoin: string
    coin: string
    preCollateralRate: string
    afterCollateralRate: string
    direction: SpotFuturesCrossCollateralDirection_LT
    status: string
    adjustTime: number
  }
  
  export interface SpotFuturesAdjustCrossCollateralHistoryResult {
    rows: SpotFuturesAdjustCrossCollateralHistoryListItem[]
    total: number
  }
  
  export interface SpotFuturesCrossCollateralLiquidationHistoryOptions {
    loanCoin?: string
    collateralCoin?: string
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export interface SpotFuturesCrossCollateralLiquidationHistoryListItem {
    collateralAmountForLiquidation: string
    collateralCoin: string
    forceLiquidationStartTime: number
    coin: string
    restCollateralAmountAfterLiquidation: string
    restLoanAmount: string
    status: SpotFuturesStatus_LT
  }
  
  export interface SpotFuturesCrossCollateralLiquidationHistoryResult {
    rows: SpotFuturesCrossCollateralLiquidationHistoryListItem[]
    total: number
  }
  
  export interface SpotFuturesCollateralRepayLimitOptions {
    coin: string
    collateralCoin: string
    recvWindow?: number
  }
  
  export interface SpotFuturesCollateralRepayLimit {
    coin: string
    collateralCoin: string
    max: string
    min: string
  }
  
  export interface SpotFuturesGetCollateralRepayQuoteOptions {
    coin: string
    collateralCoin: string
    amount: string
    recvWindow?: number
  }

  export interface SpotFuturesGetCollateralRepayQuote {
    coin: string
    collateralCoin: string
    amount: string
    quoteId: string
  }

  export interface SpotFuturesCollateralRepay {
    coin: string
    collateralCoin: string
    amount: string
    quoteId: string
  }

  export interface SpotFuturesCrossCollateralInterestHistoryOptions {
    collateralCoin?: string
    startTime?: number
    endTime?: number
    current?: number
    limit?: number
    recvWindow?: number
  }

  export interface SpotFuturesCrossCollateralInterestHistoryListItem {
    collateralCoin: string
    interestCoin: string
    interest: string
    interestFreeLimitUsed: string
    principalForInterest: string
    interestRate: string
    time: number
  }

  export interface SpotFuturesCrossCollateralInterestHistoryResult {
    rows: SpotFuturesCrossCollateralInterestHistoryListItem[]
    total: number
  }

  export interface BLVTInfoItemCurrentBasket {
    symbol: string
    amount: string
    notionalValue: string
  }

  export interface BLVTInfoItem {
    tokenName: string
    description: string
    underlying: string
    tokenIssued: string
    basket: string
    currentBaskets: BLVTInfoItemCurrentBasket[]
    nav: string
    realLeverage: string
    fundingRate: string
    dailyManagementFee: string
    purchaseFeePct: string
    dailyPurchaseLimit: string
    redeemFeePct: string
    dailyRedeemLimit: string
    timestamp: number
  }

  export interface BLVTSubscribeOptions {
    tokenName: string
    cost: string
    recvWindow?: number
  }

  export interface BLVTSubscribeResult {
    id: number
    status: string
    tokenName: string
    amount: string
    cost: string
    timestamp: number
  }

  export interface BLVTGetSubscriptionRecordOptions {
    tokenName?: string
    id?: number
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export interface BLVTSubscriptionRecordItem {
    id: number
    tokenName: string
    amount: number
    nav: string
    fee: string
    totalCharge: string
    timestamp: number
  }

  export interface BLVTRedeemOptions {
    tokenName: string
    amount: string
    recvWindow?: number
  }

  export type BLVTRedeemStatus_LT = 'S' | 'P' | 'F'

  export const enum BLVTRedeemStatus {
    SUCCESS = 'S',
    PENDING = 'P',
    FAILURE = 'F'
  }

  export interface BLVTRedeemResult {
    id: number
    status: BLVTRedeemStatus_LT
    tokenName: string
    redeemAmount: string
    amount: string
    timestamp: number
  }

  export interface BLVTGetRedemptionRecordOptions {
    tokenName?: string
    id?: number
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export interface BLVTGetRedemptionRecordItem {
    id: number
    tokenName: string
    amount: number
    nav: string
    fee: string
    netProceed: string
    timestamp: number
  }

  export interface BLVTUserLimitItem {
    tokenName: string
    userDailyTotalPurchaseLimit: string
    userDailyTotalRedeemLimit: string
  }

  export interface BSwapGetPoolsResult {
    poolId: number
    poolName: string
    assets: [ string, string ]
  }

  export interface BSwapLiquidityItem {
    poolId: number
    poolName: string
    updateTime: number
    liquidity: {
      [ key: string ]: number
    }
    share: {
      shareAmount: number
      sharePercentage: number
      asset: {
        [ key: string ]: number
      }
    }
  }

  export type BSwapLiquidityType_LT = 'SINGLE' | 'COMBINATION'

  export const enum BSwapLiquidityType {
    SINGLE = 'SINGLE',
    COMBINATION = 'COMBINATION'
  }

  export interface BSwapAddLiquidityOptions {
    poolId: number
    type?: BSwapLiquidityType_LT
    asset: string
    quantity: string
    recvWindow?: number
  }

  export interface BSwapRemoveLiquidityOptions {
    poolId: number
    type: BSwapLiquidityType_LT
    asset?: string | string[]
    shareAmount: string
    recvWindow?: number
  }

  export type BSwapLiquidityOperation_LT = 'ADD' | 'REMOVE'

  export const enum BSwapLiquidityOperation {
    ADD = 'ADD',
    REMOVE = 'REMOVE'
  }

  export interface BSwapGetLiquidityOperationRecordsOptions {
    operationId?: number
    poolId?: number
    operation?: BSwapLiquidityOperation_LT
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export type BSwapStatus_LT = 0 | 1 | 2

  export const enum BSwapStatus {
    PENDING = 0,
    SUCCESS = 1,
    FAILED = 2
  }

  export interface BSwapLiquidityOperationRecord {
    operationId: number
    poolId: number
    poolName: string
    operation: BSwapLiquidityOperation_LT
    status: BSwapStatus
    updateTime: number
    shareAmount: string
  }

  export interface BSwapRequestQuoteOptions {
    quoteAsset: string
    baseAsset: string
    quoteQty: string
    recvWindow?: number
  }

  export interface BSwapRequestQuoteResult {
    quoteAsset: string
    baseAsset: string
    quoteQty: number
    baseQty: number
    price: number
    slippage: number
    fee: number
  }

  export interface BSwapSwapOptions {
    quoteAsset: string
    baseAsset: string
    quoteQty: string
    recvWindow?: number
  }

  export type BSwapSwapHistoryOptionsStatus_LT = 0 | 1 | 2

  export interface BSwapSwapHistoryOptions {
    swapId?: number
    startTime?: number
    endTime?: number
    status?: BSwapStatus_LT
    quoteAsset?: string
    baseAsset?: string
    limit?: number
    recvWindow?: number
  }

  export interface BSwapSwapHistoryItem {
    swapID: number
    swapTime: number
    status: BSwapStatus
    quoteAsset: string
    baseAsset: string
    quoteQty: number
    baseQty: number
    price: number
    fee: number
  }

  export interface BSwapPoolAssetConfigure {
    minAdd: number
    maxAdd: number
    minSwap: number
    maxSwap: number
  }

  export interface BSwapPoolConfigureItem {
    poolId: number
    poolName: string
    updateTime: number
    liquidity: {
      constantA: number | 'NA'
      minRedeemShare: number
      slippageTolerance: number
    }
    assetConfigure: {
      [ key: string ]: BSwapPoolAssetConfigure
    }
  }

  export interface BSwapAddLiquidityPreviewOptions {
    poolId: number
    type: BSwapLiquidityType_LT
    quoteAsset: string
    quoteQty: string
    recvWindow?: number
  }

  export interface BSwapAddLiquidityPreviewResult {
    quoteAsset: string
    baseAsset: string
    quoteAmt: number
    baseAmt: number
    price: number
    share: number
    slippage: number
    fee: number
  }

  export interface BSwapRemoveLiquidityPreviewOptions {
    poolId: number
    type: BSwapLiquidityType_LT
    quoteAsset: string
    shareAmount: string
    recvWindow?: number
  }

  export interface BSwapRemoveLiquidityPreviewResult {
    quoteAsset: string
    baseAsset: string
    quoteAmt: number
    baseAmt: number
    price: number
    slippage: number
    fee: number
  }

  export type FiatOrderTransactionType_LT = '0' | '1'

  export const enum FiatOrderTransactionType {
    DEPOSIT = '0',
    WITHDRAW = '1'
  }

  export interface FiatGetOrderHistoryOptions {
    transactionType: FiatOrderTransactionType_LT
    beginTime?: number
    endTime?: number
    page?: number
    rows?: number
    recvWindow?: number
  }

  export type FiatOrderStatus_LT = 'Processing' | 'Failed' | 'Successful' | 'Finished'
    | 'Refunding' | 'Refunded' | 'Refund Failed' | 'Order Partial credit Stopped'

  export const enum FiatOrderStatus {
    PROCESSING = 'Processing',
    FAILED = 'Failed',
    SUCCESSFUL = 'Successful',
    FINISHED = 'Finished',
    REFUNDING = 'Refunding',
    REFUNDED = 'Refunded',
    REFUND_FAILED = 'Refund Failed',
    ORDER_PARTIAL_CREDIT_STOPPED = 'Order Partial credit Stopped'
  }

  export interface FiatOrderHistoryItem {
    orderNo: string
    fiatCurrency: string
    indicatedAmount: string
    amount: string
    totalFee: string
    method: string
    status: FiatOrderStatus_LT
    createTime: number
    updateTime: number
  }

  export interface FiatOrderHistoryResult {
    code: string
    message: string
    data: FiatOrderHistoryItem[]
    total: number
    success: boolean
  }

  export interface FiatGetPaymentHistoryOptions {
    transactionType: FiatOrderTransactionType_LT
    beginTime?: number
    endTime?: number
    page?: number
    rows?: number
    recvWindow?: number
  }

  export type FiatPaymentStatus_LT = 'Processing' | 'Completed' | 'Failed' | 'Refunded'

  export const enum FiatPaymentStatus {
    PROCESSING = 'Processing',
    COMPLETED = 'Completed',
    FAILED = 'Failed',
    REFUNDED = 'Refunded'
  }

  export interface FiatPaymentHistoryItem {
    orderNo: string
    sourceAmount: string
    fiatCurrency: string
    obtainAmount: string
    cryptoCurrency: string
    totalFee: string
    price: string
    status: FiatPaymentStatus_LT
    createTime: number
    updateTime: number
  }

  export interface FiatPaymentHistoryResult {
    code: string
    message: string
    data: FiatPaymentHistoryItem[]
    total: number
    success: boolean
  }

  export interface C2CGetTradeHistoryOptions {
    tradeType: OrderSide_LT
    startTimestamp?: number
    endTimestamp?: number
    page?: number
    rows?: number
    recvWindow?: number
  }

  export type C2CTradeOrderStatus_LT = 'PENDING' | 'TRADING' | 'BUYER_PAYED' | 'DISTRIBUTING' | 'COMPLETED'
    | 'IN_APPEAL' | 'CANCELLED' | 'CANCELLED_BY_SYSTEM'

  export const enum C2CTradeOrderStatus {
    PENDING = 'PENDING',
    TRADING = 'TRADING',
    BUYER_PAYED = 'BUYER_PAYED',
    DISTRIBUTING = 'DISTRIBUTING',
    COMPLETED = 'COMPLETED',
    IN_APPEAL = 'IN_APPEAL',
    CANCELLED = 'CANCELLED',
    CANCELLED_BY_SYSTEM = 'CANCELLED_BY_SYSTEM'
  }

  export interface C2CTradeHistoryItem {
    orderNumber: string
    advNo: string
    tradeType: OrderSide_LT
    asset: string
    fiat: string
    fiatSymbol: string
    amount: string
    totalPrice: string
    unitPrice: string
    orderStatus: C2CTradeOrderStatus_LT
    createTime: number
    commission: string
    counterPartNickName: string
    advertisementRole: string
  }

  export interface C2CGetTradeHistoryResult {
    code: string
    message: string
    data: C2CTradeHistoryItem[]
    total: number
    success: boolean
  }

  export type CryptoLoansIncomeType_LT = 'borrowIn' | 'collateralSpent' | 'repayAmount' | 'collateralReturn'
    | 'addCollateral' | 'removeCollateral' | 'collateralReturnAfterLiquidation'

  export const enum CryptoLoansIncomeType {
    BORROW_IN = 'borrowIn',
    COLLATERAL_SPENT = 'collateralSpent',
    REPAY_AMOUNT = 'repayAmount',
    COLLATERAL_RETURN = 'collateralReturn',
    ADD_COLLATERAL = 'addCollateral',
    REMOVE_COLLATERAL = 'removeCollateral',
    COLLATERAL_RETURN_AFTER_LIQUIDATION = 'collateralReturnAfterLiquidation'
  }

  export interface CryptoLoansGetCryptoLoansIncomeHistoryOptions {
    asset: string
    type?: CryptoLoansIncomeType_LT
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export interface CryptoLoansIncomeHistoryItem {
    asset: string
    type: CryptoLoansIncomeType_LT
    amount: string
    timestamp: number
    tranId: string
  }

  export interface PayGetPayTradeHistoryOptions {
    startTimestamp?: number
    endTimestamp?: number
    limit?: number
    recvWindow?: number
  }

  export interface PayTradeHistoryItemFundDetail {
    currency: string
    amount: string
  }

  export interface PayTradeHistoryItem {
    orderType: 'PAY' | 'PAY_REFUND' | 'C2C' | 'CRYPTO_BOX' | 'CRYPTO_BOX_RF'
    | 'C2C_HOLDING' | 'C2C_HOLDING_RF' | 'PAYOUT'
    transactionId: string
    transactionTime: number
    amount: string
    currency: string
    fundsDetail: PayTradeHistoryItemFundDetail[]
  }

  export interface PayGetPayTradeHistoryResult {
    code: string
    message: string
    data: PayTradeHistoryItem[]
    success: string
  }

  export interface MarginLoanOptions {
    asset: string
    isIsolated?: UppercaseBooleanString
    symbol?: string
    amount: string
    recvWindow?: number
  }

  export interface MarginRepayOptions {
    asset: string
    isIsolated?: UppercaseBooleanString
    symbol?: string
    amount: string
    recvWindow?: number
  }

  export interface MarginAsset {
    assetFullName: string
    assetName: string
    isBorrowable: boolean
    isMortgageable: boolean
    userMinBorrow: string
    userMinRepay: string
  }

  export type MarginNewOrderRespType_LT = 'JSON' | OrderRespType_LT

  export const enum MarginNewOrderRespType {
    JSON = 'JSON',
    ACK = 'ACK',
    RESULT = 'RESULT',
    FULL = 'FULL'
  }

  export type MarginSideEffectType_LT = 'NO_SIDE_EFFECT' | 'MARGIN_BUY' | 'AUTO_REPAY'

  export const enum MarginSideEffectType {
    NO_SIDE_EFFECT = 'NO_SIDE_EFFECT',
    MARGIN_BUY = 'MARGIN_BUY',
    AUTO_REPAY = 'AUTO_REPAY'
  }

  export interface MarginOrderOptions {
    symbol: string
    isIsolated?: UppercaseBooleanString
    side: OrderSide_LT
    type: OrderTestType_LT
    quantity?: string
    quoteOrderQty?: string
    price?: string
    stopPrice?: string
    newClientOrderId?: string
    icebergQty?: string
    newOrderRespType?: MarginNewOrderRespType_LT
    sideEffectType?: MarginSideEffectType_LT
    timeInForce?: TimeInForce_LT
    recvWindow?: number
  }

  export interface MarginOrderResultACK {
    symbol: string
    orderId: number
    clientOrderId: string
    isIsolated: boolean
    transactTime: number
  }

  export interface MarginOrderResultRESULT {
    symbol: string
    orderId: number
    clientOrderId: string
    transactTime: number
    price: string
    origQty: string
    executedQty: string
    cummulativeQuoteQty: string
    status: OrderStatus_LT
    timeInForce: TimeInForce_LT
    type: OrderTestType_LT
    isIsolated: boolean
    side: OrderSide_LT
  }

  export interface MarginOrderResultFULL {
    symbol: string
    orderId: number
    clientOrderId: string
    transactTime: number
    price: string
    origQty: string
    executedQty: string
    cummulativeQuoteQty: string
    status: OrderStatus_LT
    timeInForce: TimeInForce_LT
    type: OrderTestType_LT
    side: OrderSide_LT
    marginBuyBorrowAmount: number
    marginBuyBorrowAsset: string
    isIsolated: boolean
    fills: {
      price: string
      qty: string
      commission: string
      commissionAsset: string
    }[]
  }

  export type MarginOrderResult = MarginOrderResultACK | MarginOrderResultRESULT | MarginOrderResultFULL

  export interface MarginCancelOrderOptions {
    symbol: string
    isIsolated?: UppercaseBooleanString
    orderId?: number
    origClientOrderId: string
    newClientOrderId: string
    recvWindow?: number
  }

  export interface MarginCancelOrderResult {
    symbol: string
    isIsolated: boolean
    orderId: number
    origClientOrderId: string
    clientOrderId: string
    price: string
    origQty: string
    executedQty: string
    cummulativeQuoteQty: string
    status: OrderStatus_LT
    timeInForce: TimeInForce_LT
    type: OrderTestType_LT
    side: OrderSide_LT
  }

  export interface MarginCancelAllOpenOrdersResult {
    symbol: string
    isIsolated: boolean
    origClientOrderId: string
    orderId: number
    orderListId: number
    clientOrderId: string
    price: string
    origQty: string
    executedQty: string
    cummulativeQuoteQty: string
    status: OrderStatus_LT
    timeInForce: TimeInForce_LT
    type: OrderTestType_LT
    side: OrderSide_LT
  }

  export interface MarginLoanRecordOptions {
    asset: string
    isolatedSymbol?: string
    txId?: number
    startTime?: number
    endTime?: number
    current?: number
    size?: number
    archived?: boolean
    recvWindow?: number
  }

  export interface MarginLoanRecordItem {
    isolatedSymbol: string
    txId: number
    asset: string
    principal: string
    timestamp: number
    status: string
  }

  export interface MarginLoanRecordResult {
    rows: MarginLoanRecordItem[]
    total: number
  }

  export interface MarginRepayRecordOptions {
    asset: string
    isolatedSymbol?: string
    txId?: number
    startTime?: number
    endTime?: number
    current?: number
    size?: number
    archived?: boolean
    recvWindow?: number
  }

  export interface MarginRepayRecordItem {
    isolatedSymbol: string
    amount: string
    asset: string
    interest: string
    principal: string
    status: string
    timestamp: number
    txId: number
  }

  export interface MarginRepayRecordResult {
    rows: MarginRepayRecordItem[]
    total: number
  }

  export interface MarginInterestHistoryOptions {
    asset?: string
    isolatedSymbol?: string
    startTime?: number
    endTime?: number
    current?: number
    size?: number
    archived?: boolean
    recvWindow?: number
  }

  export type MarginInterestType_LT = 'PERIODIC' | 'ON_BORROW' | 'PERIODIC_CONVERTED' | 'ON_BORROW_CONVERTED'

  export const enum MarginInterestType {
    PERIODIC = 'PERIODIC',
    ON_BORROW = 'ON_BORROW',
    PERIODIC_CONVERTED = 'PERIODIC_CONVERTED',
    ON_BORROW_CONVERTED = 'ON_BORROW_CONVERTED'
  }

  export interface MarginInterestHistoryItem {
    isolatedSymbol: string
    asset: string
    interest: string
    interestAccuredTime: number
    interestRate: string
    principal: string
    type: MarginInterestType_LT
  }

  export interface MarginInterestHistoryResult {
    rows: MarginInterestHistoryItem[]
    total: number
  }

  export interface MarginForceLiquidationRecordOptions {
    asset?: string
    endTime?: number
    isolatedSymbol?: string
    current?: number
    size?: number
    archived?: boolean
    recvWindow?: number
  }

  export interface MarginForceLiquidationRecordItem {
    avgPrice: string
    executedQty: string
    orderId: number
    price: string
    qty: string
    side: OrderSide_LT
    symbol: string
    timeInForce: TimeInForce_LT
    isIsolated: boolean
    updatedTime: number
  }

  export interface MarginForceLiquidationRecordResult {
    rows: MarginForceLiquidationRecordItem[]
    total: number
  }

  export interface MarginGetOrderOptions {
    symbol: string
    isIsolated?: UppercaseBooleanString
    orderId?: number
    origClientOrderId?: string
    recvWindow?: number
  }

  export interface MarginOrder {
    clientOrderId: string
    cummulativeQuoteQty: string
    executedQty: string
    icebergQty: string
    isWorking: boolean
    orderId: number
    origQty: string
    price: string
    side: OrderSide_LT
    status: string
    stopPrice: string
    symbol: string
    isIsolated: boolean
    time: string
    timeInForce: TimeInForce_LT
    type: OrderTestType_LT
    updateTime: number
  }

  export interface MarginAllOrdersOptions {
    symbol: string
    isIsolated?: UppercaseBooleanString
    orderId?: number
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export interface MarginMyTradesOptions {
    symbol: string
    isIsolated?: UppercaseBooleanString
    startTime?: number
    endTime?: number
    fromId?: number
    limit?: number
    recvWindow?: number
  }

  export interface MarginTrade {
    commission: string
    commissionAsset: string
    id: number
    isBestMatch: boolean
    isBuyer: boolean
    isMaker: boolean
    orderId: number
    price: boolean
    qty: string
    symbol: string
    isIsolated: boolean
    time: number
  }

  export interface MarginInterestRateHistoryOptions {
    asset: string
    vipLevel?: number
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export interface MarginInterestRateHistoryItem {
    asset: string
    dailyInterestRate: string
    timestamp: number
    vipLevel: number
  }

  export type MarginCrossTransferType_LT = 1 | 2

  export const enum MarginCrossTransferType {
    MAIN_TO_CROSS = 1,
    CROSS_TO_MAIN = 2
  }

  export interface MarginCrossTransferOptions {
    asset: string
    amount: string
    type: MarginCrossTransferType_LT
    recvWindow?: number
  }

  export interface MarginCrossPair {
    id: number
    symbol: string
    base: string
    quote: string
    isMarginTrade: boolean
    isBuyAllowed: boolean
    isSellAllowed: boolean
  }

  export type MarginCrossTransferHistoryType_LT = 'ROLL_IN' | 'ROLL_OUT'

  export const enum MarginCrossTransferHistoryType {
    ROLL_IN = 'ROLL_IN',
    ROLL_OUT = 'ROLL_OUT'
  }

  export interface MarginCrossTransferHistoryOptions {
    asset?: string
    type?: MarginCrossTransferHistoryType_LT
    startTime?: number
    endTime?: number
    current?: number
    size?: number
    archived?: boolean
    recvWindow?: number
  }

  export interface MarginCrossTransferHistoryItem {
    amount: string
    asset: string
    status: string
    timestamp: number
    txId: number
    type: MarginCrossTransferHistoryType_LT
  }

  export interface MarginCrossTransferHistoryResult {
    rows: MarginCrossTransferHistoryItem[]
    total: number
  }

  export interface MarginCrossAccountUserAsset {
    asset: string
    borrowed: string
    free: string
    interest: string
    locked: string
    netAsset: string
  }

  export interface MarginCrossAccount {
    borrowEnabled: boolean
    marginLevel: string
    totalAssetOfBtc: string
    totalLiabilityOfBtc: string
    totalNetAssetOfBtc: string
    tradeEnabled: boolean
    transferEnabled: boolean
    userAssets: MarginCrossAccountUserAsset[]
  }

  export type MarginIsolatedTransferWallet_LT = 'SPOT' | 'ISOLATED_MARGIN'
  
  export const enum MarginIsolatedTransferWallet {
    SPOT = 'SPOT',
    ISOLATED_MARGIN = 'ISOLATED_MARGIN'
  }

  export interface MarginIsolatedTransferOptions {
    asset: string
    symbol: string
    transFrom: MarginIsolatedTransferWallet_LT
    transTo: MarginIsolatedTransferWallet_LT
    amount: string
    recvWindow?: number
  }

  export interface MarginIsolatedTransferHistoryOptions {
    asset?: string
    symbol: string
    transFrom?: MarginIsolatedTransferWallet_LT
    transTo?: MarginIsolatedTransferWallet_LT
    startTime?: number
    endTime?: number
    current?: number
    size?: number
    recvWindow?: number
  }

  export interface MarginIsolatedTransferHistoryItem {
    amount: string
    asset: string
    status: string
    timestamp: number
    txId: number
    transFrom: MarginIsolatedTransferWallet_LT
    transTo: MarginIsolatedTransferWallet_LT
  }

  export interface MarginIsolatedTransferHistoryResult {
    rows: MarginIsolatedTransferHistoryItem[]
    total: number
  }

  export interface MarginIsolatedAsset {
    asset: string
    borrowEnabled: string
    borrowed: string
    free: string
    interest: string
    locked: string
    netAsset: string
    netAssetOfBtc: string
    repayEnabled: boolean
    totalAsset: string
  }

  export type MarginIsolatedLevelStatus_LT = 'EXCESSIVE' | 'NORMAL' | 'MARGIN_CALL'
    | 'PRE_LIQUIDATION' | 'FORCE_LIQUIDATION'

  export const enum MarginIsolatedLevelStatus {
    EXCESSIVE = 'EXCESSIVE',
    NORMAL = 'NORMAL',
    MARGIN_CALL = 'MARGIN_CALL',
    PRE_LIQUIDATION = 'PRE_LIQUIDATION',
    FORCE_LIQUIDATION = 'FORCE_LIQUIDATION'
  }

  export interface MarginIsolatedAccount {
    assets: {
      baseAsset: MarginIsolatedAsset[]
      quoteAsset: MarginIsolatedAsset[]
      symbol: string
      isolatedCreated: boolean
      enabled: boolean
      marginLevel: string
      marginLevelStatus: MarginIsolatedLevelStatus_LT
      marginRatio: string
      indexPrice: string
      liquidatePrice: string
      liquidateRate: string
      tradeEnabled: boolean
    }[]
    totalAssetOfBtc?: string
    totalLiabilityOfBtc?: string
    totalNetAssetOfBtc?: string
  }

  export interface MarginIsolatedSymbol {
    symbol: string
    base: string
    quote: string
    isMarginTrade: boolean
    isBuyAllowed: boolean
    isSellAllowed: boolean
  }

  

  export interface MarginOCOOrderOptions {
    symbol: string
    isIsolated?: UppercaseBooleanString
    listClientOrderId?: string
    side: OrderSide_LT
    quantity: string
    limitClientOrderId?: string
    price: string
    limitIcebergQty?: string
    stopClientOrderId?: string
    stopPrice: string
    stopLimitPrice?: string
    stopIcebergQty?: string
    stopLimitTimeInForce?: TimeInForce_LT
    newOrderRespType?: MarginNewOrderRespType_LT
    sideEffectType?: MarginSideEffectType_LT
    recvWindow?: number
  }

  export interface MarginOCOOrderOrderItem {
    symbol: string
    orderId: number
    clientOrderId: string
  }

  export interface MarginOCOOrderOrderReport {
    symbol: string
    orderId: number
    orderListId: number
    clientOrderId: string
    transactTime: number
    price: string
    origQty: string
    executedQty: string
    cummulativeQuoteQty: string
    status: string
    timeInForce: TimeInForce_LT
    type: string
    side: OrderSide_LT
    stopPrice: string
  }

  export interface MarginOCOOrderResult {
    orderListId: number
    contingencyType: string
    listStatusType: ListStatusType_LT
    listOrderStatus: ListOrderStatus_LT
    listClientOrderId: string
    transactTime: number
    symbol: string
    marginBuyBorrowAmount: string
    marginBuyBorrowAsset: string
    isIsolated: boolean
    orders: MarginOCOOrderOrderItem[]
    orderReports: MarginOCOOrderOrderReport[]
  }

  export interface MarginOCOCancelOrderOptions {
    symbol: string
    isIsolated?: UppercaseBooleanString
    orderListId?: number
    listClientOrderId: string
    newClientOrderId: string
    recvWindow?: number
  }

  export interface MarginOCOCancelOrderResult {
    orderListId: number
    contingencyType: string
    listStatusType: ListStatusType_LT
    listOrderStatus: ListOrderStatus_LT
    listClientOrderId: string
    transactTime: number
    symbol: string
    isIsolated: boolean
    orders: MarginOCOOrderOrderItem[]
    orderReports: MarginOCOOrderOrderReport[]
  }

  export interface MarginOCOGetOrderOptions {
    isIsolated?: UppercaseBooleanString
    symbol?: string
    orderListId?: number
    origClientOrderId: string
    recvWindow?: number
  }

  export interface MarginOCOOrder {
    orderListId: number
    contingencyType: string
    listStatusType: ListStatusType_LT
    listOrderStatus: ListOrderStatus_LT
    listClientOrderId: string
    transactTime: number
    symbol: string
    isIsolated: boolean
    orders: MarginOCOOrderOrderItem[]
  }

  export interface MarginOCOAllOrdersOptions {
    isIsolated?: UppercaseBooleanString
    symbol?: string
    fromId?: number
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export interface FuturesHistoricalTrade {
    id: number
    price: string
    qty: string
    quoteQty: string
    time: number
    isBuyerMaker: boolean
  }

  export interface FuturesTopLongShortAccountRatioOptions {
    symbol: string
    period?: FuturesPeriod_LT
    limit?: number
    startTime?: number
    endTime?: number
  }

  export interface FuturesTopLongShortAccountRatioResult {
    symbol: string
    longShortRatio: string
    longAccount: string
    shortAccount: string
    timestamp: string
  }

  export type FuturesOrderPositionSide_LT = 'BOTH' | 'LONG' | 'SHORT'

  export const enum FuturesOrderPositionSide {
    BOTH = 'BOTH',
    LONG = 'LONG',
    SHORT = 'SHORT'
  }

  export type FuturesOrderType_LT = OrderTestType_LT | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET'
    | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET'

  export const enum FuturesOrderType {
    LIMIT = 'LIMIT',
    MARKET = 'MARKET',
    STOP = 'STOP',
    TAKE_PROFIT = 'TAKE_PROFIT',
    STOP_MARKET = 'STOP_MARKET',
    TAKE_PROFIT_MARKET = 'TAKE_PROFIT_MARKET',
    TRAILING_STOP_MARKET = 'TRAILING_STOP_MARKET'
  }

  export type FuturesOrderWorkingType_LT = 'MARK_PRICE' | 'CONTRACT_PRICE'

  export const enum FuturesOrderWorkingType {
    MARK_PRICE = 'MARK_PRICE',
    CONTRACT_PRICE = 'CONTRACT_PRICE'
  }

  export type FuturesNewOrderRespType_LT = 'ACK' | 'RESULT'

  export const enum FuturesNewOrderRespType {
    ACK = 'ACK',
    RESULT = 'RESULT'
  }

  export interface FuturesOrderOptions {
    symbol: string
    side: OrderSide_LT
    positionSide?: FuturesOrderPositionSide_LT
    type?: FuturesOrderType_LT
    timeInForce?: TimeInForce_LT
    quantity?: string
    reduceOnly?: LowercaseBooleanString
    price?: string
    newClientOrderId?: string
    stopPrice?: string
    closePosition?: LowercaseBooleanString
    activationPrice?: string
    callbackRate?: string
    workingType?: FuturesOrderWorkingType_LT
    priceProtect?: UppercaseBooleanString
    newOrderRespType?: FuturesNewOrderRespType_LT
    recvWindow?: number
  }

  export interface FuturesOrderResult {
    clientOrderId:  string
    cumQty: string
    cumQuote: string
    executedQty: string
    orderId: number
    avgPrice: string
    origQty: string
    price: string
    reduceOnly: boolean
    side: OrderSide_LT
    positionSide: FuturesOrderPositionSide_LT
    status: string
    stopPrice: string
    closePosition: boolean
    symbol: string
    timeInForce: TimeInForce_LT
    type: FuturesOrderType_LT
    origType: FuturesOrderType_LT
    activatePrice: string
    priceRate: string
    updateTime: number
    workingType: FuturesOrderWorkingType_LT
    priceProtect: boolean
  }

  export interface FuturesBatchOrderOptionsBatchOrder {
    symbol: string
    side: OrderSide_LT
    positionSide?: FuturesOrderPositionSide_LT
    type?: FuturesOrderType_LT
    timeInForce?: TimeInForce_LT
    quantity?: string
    reduceOnly?: LowercaseBooleanString
    price?: string
    newClientOrderId?: string
    stopPrice?: string
    activationPrice?: string
    callbackRate?: string
    workingType?: FuturesOrderWorkingType_LT
    priceProtect?: UppercaseBooleanString
    newOrderRespType?: FuturesNewOrderRespType_LT
  }

  export interface FuturesBatchOrderOptions {
    batchOrders: FuturesBatchOrderOptionsBatchOrder[]
    recvWindow?: number
  }

  export type FuturesBatchOrderResult = [
    {
      clientOrderId:  string
      cumQty: string
      cumQuote: string
      executedQty: string
      orderId: number
      avgPrice: string
      origQty: string
      price: string
      reduceOnly: boolean
      side: OrderSide_LT
      positionSide: FuturesOrderPositionSide_LT
      status: string
      stopPrice: string
      closePosition: boolean
      symbol: string
      timeInForce: TimeInForce_LT
      type: FuturesOrderType_LT
      origType: FuturesOrderType_LT
      activatePrice: string
      priceRate: string
      updateTime: number
      workingType: FuturesOrderWorkingType_LT
      priceProtect: boolean
    },
    {
      code: number
      msg: string
    }
  ]

  export interface FuturesOrder {
    avgPrice: string
    clientOrderId:  string
    cumQuote: string
    executedQty: string
    orderId: number
    origQty: string
    origType: FuturesOrderType_LT
    price: string
    reduceOnly: boolean
    side: OrderSide_LT
    positionSide: FuturesOrderPositionSide_LT
    status: string
    stopPrice: string
    closePosition: boolean
    symbol: string
    time: number
    timeInForce: TimeInForce_LT
    type: FuturesOrderType_LT
    activatePrice: string
    priceRate: string
    updateTime: number
    workingType: FuturesOrderWorkingType_LT
    priceProtect: boolean
  }

  export interface FuturesCancelOrderResult {
    clientOrderId:  string
    cumQty: string
    cumQuote: string
    executedQty: string
    orderId: number
    origQty: string
    origType: FuturesOrderType_LT
    price: string
    reduceOnly: boolean
    side: OrderSide_LT
    positionSide: FuturesOrderPositionSide_LT
    status: string
    stopPrice: string
    closePosition: boolean
    symbol: string
    timeInForce: TimeInForce_LT
    type: FuturesOrderType_LT
    activatePrice: string
    priceRate: string
    updateTime: number
    workingType: FuturesOrderWorkingType_LT
    priceProtect: boolean
  }

  export interface FuturesCancelMultipleOrdersOptions {
    symbol: string
    orderIdList?: number[]
    origClientOrderIdList?: string[]
    recvWindow?: number
  }

  export type FuturesCancelMultipleOrdersResult = [
    FuturesCancelOrderResult,
    {
      code: number
      msg: string
    }
  ]

  export interface FuturesGetOpenOrderOptions {
    symbol: string
    orderId?: number
    origClientOrderId?: string
    recvWindow?: number
  }

  export interface FuturesAccountBalance {
    accountAlias: string
    asset: string
    balance: string
    crossWalletBalance: string
    crossUnPnl: string
    availableBalance: string
    maxWithdrawAmount: string
    marginAvailable: boolean
    updateTime: number
  }

  export interface FuturesAccountAsset {
    asset: string
    walletBalance: string
    unrealizedProfit: string
    marginBalance: string
    maintMargin: string
    initialMargin: string
    positionInitialMargin: string
    openOrderInitialMargin: string
    crossWalletBalance: string
    crossUnPnl: string
    availableBalance: string
    maxWithdrawAmount: string
    marginAvailable: boolean
    updateTime: number
  }

  export interface FuturesAccountPosition {
    symbol: string
    initialMargin: string
    maintMargin: string
    unrealizedProfit: string
    positionInitialMargin: string
    openOrderInitialMargin: string
    leverage: string
    isolated: boolean
    entryPrice: string
    maxNotional: string
    positionSide: FuturesOrderPositionSide_LT
    positionAmt: string
    updateTime: number
  }

  export interface FuturesAccount {
    feeTier: number
    canTrade:  boolean
    canDeposit: boolean
    canWithdraw: boolean
    updateTime: number
    totalInitialMargin: string
    totalMaintMargin: string
    totalWalletBalance: string
    totalUnrealizedProfit: string
    totalMarginBalance: string
    totalPositionInitialMargin: string
    totalOpenOrderInitialMargin: string
    totalCrossWalletBalance: string
    totalCrossUnPnl: string
    availableBalance: string
    maxWithdrawAmount: string
    assets: FuturesAccountAsset[]
    positions: FuturesAccountPosition[]
  }

  export type FuturesMarginType_LT = 'ISOLATED' | 'CROSSED'

  export const enum FuturesMarginType {
    ISOLATED = 'ISOLATED',
    CROSSED = 'CROSSED'
  }

  export type FuturesPositionMarginType_LT = 1 | 2

  export const enum FuturesPositionMarginType {
    ADD_POSITION_MARGIN = 1,
    REDUCE_POSITION_MARGIN = 2
  }

  export interface FuturesModifyPositionMarginOptions {
    symbol: string
    positionSide?: FuturesOrderPositionSide_LT
    amount: string
    type: FuturesPositionMarginType_LT
    recvWindow?: number
  }

  export interface FuturesPositionMarginChangeHistoryOptions {
    symbol: string
    type?: FuturesPositionMarginType_LT
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export interface FuturesPosition {
    entryPrice: string
    marginType: string
    isAutoAddMargin: string
    isolatedMargin: string
    leverage: string
    liquidationPrice: string
    markPrice: string
    maxNotionalValue: string
    positionAmt: string
    symbol: string
    unRealizedProfit: string
    positionSide: FuturesOrderPositionSide_LT
    updateTime: number
  }

  export interface FuturesTradesOptions {
    symbol: string
    startTime?: number
    endTime?: number
    fromId?: number
    limit?: number
    recvWindow?: number
  }

  export interface FuturesUserTrade {
    buyer: boolean
    commission: string
    commissionAsset: string
    id: number
    maker: boolean
    orderId: number
    price: string
    qty: string
    quoteQty: string
    realizedPnl: string
    side: OrderSide_LT
    positionSide: FuturesOrderPositionSide_LT
    symbol: string
    time: number
  }

  export type FuturesIncomeType_LT = 'TRANSFER' | 'WELCOME_BONUS' | 'REALIZED_PNL'
    | 'FUNDING_FEE' | 'COMMISSION' | 'INSURANCE_CLEAR'

  export const enum FuturesIncomeType {
    TRANSFER = 'TRANSFER',
    WELCOME_BONUS = 'WELCOME_BONUS',
    REALIZED_PNL = 'REALIZED_PNL',
    FUNDING_FEE = 'FUNDING_FEE',
    COMMISSION = 'COMMISSION',
    INSURANCE_CLEAR = 'INSURANCE_CLEAR'
  }

  export interface FuturesIncomeHistoryOptions {
    symbol?: string
    incomeType?: FuturesIncomeType_LT
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export interface FuturesIncomeHistoryItem {
    symbol: string
    incomeType: FuturesIncomeType_LT
    income: string
    asset: string
    info: string
    time: number
    tranId: string
    tradeId: string
  }

  export interface FuturesLeverageBracket {
    bracket: number
    initialLeverage: number
    notionalCap: number
    notionalFloor: number
    maintMarginRatio: number
    cum: number
  }

  export interface FuturesLeverageBracketResult {
    [ symbol: string ]: FuturesLeverageBracket[]
  }

  export interface FuturesPositionADLQuantileEstimation {
    LONG: number
    SHORT: number
    HEDGE?: number
    BOTH?: number
  }

  export interface FuturesPositionADLQuantileEstimationResult {
    [ symbol: string ]: FuturesPositionADLQuantileEstimation
  }

  export type FuturesForceOrderAutoCloseType_LT = 'LIQUIDATION' | 'ADL'

  export const enum FuturesForceOrderAutoCloseType {
    LIQUIDATION = 'LIQUIDATION',
    ADL = 'ADL'
  }

  export interface FuturesGetForceOrdersOptions {
    symbol?: string
    autoCloseType?: FuturesForceOrderAutoCloseType_LT
    startTime?: number
    endTime?: number
    limit?: number
    recvWindow?: number
  }

  export interface FuturesForceOrder {
    orderId: number
    symbol: string
    status: string
    clientOrderId: string
    price: string
    avgPrice: string
    origQty: string
    executedQty: string
    cumQuote: string
    timeInForce: TimeInForce_LT
    type: OrderType_LT
    reduceOnly: boolean
    closePosition: boolean
    side: OrderSide_LT
    positionSide: FuturesOrderPositionSide_LT
    stopPrice: string
    workingType: FuturesOrderWorkingType_LT
    origType: OrderType_LT
    time: number
    updateTime: number
  }

  export interface FuturesAPITradingQuantitativeRulesIndicator {
    isLocked: boolean
    plannedRecoverTime: number
    indicator: string
    value: number
    triggerValue: number
  }

  export interface FuturesAPITradingQuantitativeRulesIndicatorsResult {
    indicators: {
      [ symbol: string ]: FuturesAPITradingQuantitativeRulesIndicator[]
    }
    updateTime: number
  }

  export type MethodType_LT = 'GET' | 'POST' | 'PUT' | 'DELETE'

  export const enum MethodType {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
  }

  export type WebSocketCloseOptions = {
    delay: number
    fastClose: boolean
    keepClosed: boolean
  }

  export type ReconnectingWebSocketHandler = (options?: WebSocketCloseOptions) => void

  export interface WSSpotTrade {
    eventType: string
    eventTime: number
    symbol: string
    price: string
    quantity: string
    maker: boolean
    isBuyerMaker: boolean
    tradeId: number
    tradeTime: number
    buyerOrderId: number
    sellerOrderId: number
  }

  export interface Candle {
    eventType: string
    eventTime: number
    symbol: string
    startTime: number
    closeTime: number
    firstTradeId: number
    lastTradeId: number
    open: string
    high: string
    low: string
    close: string
    volume: string
    trades: number
    interval: string
    isFinal: boolean
    quoteVolume: string
    buyVolume: string
    quoteBuyVolume: string
  }

  export interface MiniTicker {
    eventType: string,
    eventTime: number,
    symbol: string,
    curDayClose: string,
    open: string,
    high: string,
    low: string,
    volume: string,
    volumeQuote: string
  }

  export interface Ticker {
    eventType: string
    eventTime: number
    symbol: string
    priceChange: string
    priceChangePercent: string
    weightedAvg: string
    prevDayClose: string
    curDayClose: string
    closeTradeQuantity: string
    bestBid: string
    bestBidQnt: string
    bestAsk: string
    bestAskQnt: string
    open: string
    high: string
    low: string
    volume: string
    volumeQuote: string
    openTime: number
    closeTime: number
    firstTradeId: number
    lastTradeId: number
    totalTrades: number
  }

  export interface WSBookTicker {
    updateId: number
    symbol: string
    bestBid: string
    bestBidQnt: string
    bestAsk: string
    bestAskQnt: string
  }

  export interface SpotPartialDepth {
    symbol: string
    level: number
    lastUpdateId: number
    bids: Bid[]
    asks: Bid[]
  }

  export interface FuturesPartialDepth {
    level: 5 | 10 | 20
    eventType: string
    eventTime: number
    transactionTime: number
    symbol: string
    firstUpdateId: number
    finalUpdateId: number
    prevFinalUpdateId: number
    bidDepth: Bid[]
    askDepth: Bid[]
  }

  export interface BidDepth {
    price: string
    quantity: string
  }

  interface Depth {
    eventType: string
    eventTime: number
    symbol: string
    firstUpdateId: number
    finalUpdateId: number
    bidDepth: BidDepth[]
    askDepth: BidDepth[]
  }

  export interface SpotDepth extends Depth {}

  export interface FuturesDepth extends Depth {
    transactionTime: number
    prevFinalUpdateId: number
  }

  export interface WSMarkPrice {
    eventType: string
    eventTime: number
    symbol: string
    markPrice: string
    indexPrice: string
    estimatedSettlePrice: string
    fundingRate: string
    nextFundingTime: number
  }

  export interface WSContinuousKline {
    eventType: string
    eventTime: number
    pair: string
    contractType: 'PERPETUAL' | 'CURRENT_QUARTER' | 'NEXT_QUARTER'
    startTime: number
    closeTime: number
    interval: CandleChartInterval_LT
    firstTradeId: number
    lastTradeId: number
    open: string
    close: string
    high: string
    low: string
    volume: string
    trades: number
    isFinal: boolean
    quoteVolume: string
    buyVolume: string
    quoteBuyVolume: string
  }

  export interface FuturesTicker {
    eventType: string
    eventTime: number
    symbol: string
    priceChange: string
    priceChangePercent: string
    weightedAvg: string
    curDayClose: string
    closeTradeQuantity: string
    open: string
    high: string
    low: string
    volume: string
    volumeQuote: string
    openTime: number
    closeTime: number
    firstTradeId: number
    lastTradeId: number
    totalTrades: number
  }

  export interface WSFuturesBookTicker {
    eventType: string
    updateId: number
    eventTime: number
    transactionTime: number
    symbol: string
    bestBid: string
    bestBidQnt: string
    bestAsk: string
    bestAskQnt: string
  }

  export interface WSLiquidation {
    symbol: string
    price: string
    origQty: string
    lastFilledQty: string
    accumulatedQty: string
    averagePrice: string
    status: string
    timeInForce: string
    type: string
    side: string
    time: number
  }

  export interface Basket {
    symbol: string
    position: number
  }

  export interface FuturesBLVTInfo {
    eventType: string
    eventTime: number
    name: string
    tokenIssued: number
    baskets: Basket[]
    nav: number
    realLeverage: number
    targetLeverage: number
    fundingRatio: number
  }

  export interface Composition {
    baseAsset: string
    quoteAsset: string
    weightInQuantity: string
    weightInPercentage: string
    indexPrice: string
  }

  export interface FuturesCompositeIndex {
    eventType: string
    eventTime: number
    symbol: string
    price: string
    baseAsset: string
    composition: Composition[]
  }

  export interface PublicSpot {
    wallet: {
      systemStatus(): Promise<boolean>
    },
    marketData: {
      ping(): Promise<boolean>
      time(): Promise<number>
      exchangeInfo(options?: {
        symbol?: string
        symbols?: string
      }): Promise<SpotExchangeInfo>
      book(options: {
        symbol: string
        limit?: SpotBookLimit_LT
      }): Promise<SpotBook>
      trades(options: { symbol: string; limit?: number }): Promise<SpotTrade[]>
      aggTrades(options: AggTradesOptions): Promise<SpotAggTrade[]>
      candles(options: CandlesOptions): Promise<CandleChart[]>
      avgPrice(options: { symbol: string }): Promise<AvgPrice>
      dailyTickerStats(options?: { symbol: string }): Promise<SpotDailyTickerStats | SpotDailyTickerStats[]>
      price(options?: { symbol: string }): Promise<{ [ symbol: string ]: string }>
      bookTicker(options?: { symbol: string }): Promise<{ [ symbol: string ]: SpotBookTicker }>
    }
  }

  export interface PublicFutures {
    marketData: {
      ping(): Promise<boolean>
      time(): Promise<number>
      exchangeInfo(): Promise<FuturesExchangeInfo>
      book(options: {
        symbol: string
        limit?: FuturesBookLimit_LT
      }): Promise<FuturesBook>
      trades(options: { symbol: string; limit?: number }): Promise<FuturesTrade[]>
      aggTrades(options: AggTradesOptions): Promise<FuturesAggTrade[]>
      candles(options: CandlesOptions): Promise<CandleChart[]>
      continuousKlines(options: ContinuousKlinesOptions): Promise<ContinuousKline[]>
      indexPriceKlines(options: KlineOptions): Promise<IndexPriceKline[]>
      markPriceKlines(options: KlineOptions): Promise<MarkPriceKline[]>
      markPrice(options?: { symbol: string }): Promise<MarkPrice | MarkPrice[]>
      fundingRateHistory(options?: {
        symbol?: string
        startTime?: number
        endTime?: number
        limit?: number
      }): Promise<FundingRate[]>
      dailyTickerStats(options?: { symbol: string }): Promise<FuturesDailyTickerStats | FuturesDailyTickerStats[]>
      price(options?: { symbol: string }): Promise<{ [ symbol: string ]: string }>
      bookTicker(options?: { symbol: string }): Promise<{ [ symbol: string ]: FuturesBookTicker }>
      openInterest(options: { symbol: string }): Promise<OpenInterest>
      openInterestHistory(options: OpenInterestHistoryOptions): Promise<{
        [ symbol: string ]: OpenInterestHistory
      }>
      topLongShortPositionRatio(options: TopLongShortPositionRatioOptions): Promise<{
        [ symbol: string ]: TopLongShortPositionRatio
      }>
      longShortRatio(options: LongShortRatioOptions): Promise<{
        [ symbol: string ]: LongShortRatio
      }>
      takerBuySellVolume(options: TakerBuySellVolumeOptions): Promise<TakerBuySellVolume[]>
      historicalBLVTNAVKlines(options: HistoricalBLVTNAVKlinesOptions): Promise<HistoricalBLVTNAVKline[]>
      compositeIndexSymbolInfo(options?: { symbol: string }): Promise<CompositeIndexSymbolInfo[]>
    }
  }

  export interface AuthenticatedSpot {
    wallet: {
      accountCoins(options?: { recvWindow: number }): Promise<WalletAccountCoin[]>
      dailyAccountSnapshot(options: WalletDailyAccountSnapshotOptions): Promise<WalletDailyAccountSnapshot>
      disableFastWithdrawSwitch(options?: { recvWindow: number }): Promise<{}>
      enableFastWithdrawSwitch(options?: { recvWindow: number }): Promise<{}>
      withdraw(options: WalletWithdrawOptions): Promise<string>
      depositHistory(options?: WalletDepositHistoryOptions): Promise<WalletDepositHistoryItem[]>
      withdrawHistory(options?: WalletWithdrawHistoryOptions): Promise<WalletWithdrawHistoryItem[]>
      depositAddress(options: WalletDepositAddressOptions): Promise<WalletDepositAddress>
      accountStatus(options?: { recvWindow: number }): Promise<string>
      accountAPITradingStatus(options?: { recvWindow: number }): Promise<WalletAccountAPITradingStatus>
      dustLog(options?: WalletDustLogOptions): Promise<WalletDustLog>
      dustTransfer(options: WalletDustTransferOptions): Promise<WalletDustTransfer>
      assetDividendRecord(options?: WalletAssetDividendRecordOptions): Promise<WalletAssetDividendRecord>
      assetDetail(options?: {
        asset?: string
        recvWindow?: number
      }): Promise<WalletAssetDetail>
      tradeFee(options?: {
        symbol?: string
        recvWindow?: number
      }): Promise<WalletTradeFee>
      universalTransfer(options: WalletUniversalTransferOptions): Promise<number>
      universalTransferHistory(options: WalletUniversalTransferHistoryOptions): Promise<WalletUniversalTransferHistory>
      fundingWallet(options?: WalletFundingWalletOptions): Promise<WalletFundingWallet[]>
      APIPermission(options?: { recvWindow?: number }): Promise<WalletAPIPermission>
      setAPIKeyIPRestriction(options: WalletSetAPIKeyIPRestrictionOptions): Promise<WalletAPIKeyIPDetails>
      addIPListForAPIKey(options: WalletAddIPListForAPIKeyOptions): Promise<WalletAddIPListForAPIKeyResult>
      getIPRestrictionForAPIKey(options: WalletGetIPRestrictionForAPIKeyOptions): Promise<WalletAPIKeyIPDetails>
      deleteIPListForAPIKey(options: WalletDeleteIPListForAPIKey): Promise<WalletAPIKeyIPDetails>
    }
    subAccount: {
      createSubAccount(options: {
        subAccountString: string
        recvWindow?: number
      }): Promise<string>
      list(options?: SubAccountListOptions): Promise<SubAccountListItem[]>
      spotAssetTransferHistory(options?: SubAccountSpotAssetTransferHistoryOptions): Promise<SubAccountSpotAssetTransferHistoryItem[]>
      futuresAssetTransferHistory(options: SubAccountFuturesAssetTransferHistoryOptions): Promise<SubAccountFuturesAssetTransferHistory>
      futuresAssetTransfer(options: SubAccountFuturesAssetTransferOptions): Promise<{
        success: boolean
        txnId: string
      }>
      getAssets(options: {
        email: string
        recvWindow?: number
      }): Promise<SubAccountAssets>
      summary(options?: SubAccountSummaryOptions): Promise<SubAccountSummary>
      getDepositAddress(options: SubAccountGetDepositAddressOptions): Promise<SubAccountDepositAddress>
      getDepositHistory(options: SubAccountGetDepositHistoryOptions): Promise<SubAccountDepositHistoryItem[]>
      status(options?: {
        email?: string
        recvWindow?: number
      }): Promise<SubAccountStatusItem[]>
      enableMargin(options: {
        email: string
        recvWindow?: number
      }): Promise<{
        email: string
        isMarginEnabled: boolean
      }>
      getMarginAccountDetail(options: {
        email: string
        recvWindow?: number
      }): Promise<SubAccountMarginAccountDetail>
      getMarginAccountSummary(options?: { recvWindow?: number }): Promise<SubAccountMarginAccountSummary>
      enableFutures(options: {
        email: string
        recvWindow?: number
      }): Promise<{
        email: string
        isFuturesEnabled: boolean
      }>
      getFuturesAccountDetail(options: {
        email: string
        recvWindow?: number
      }): Promise<SubAccountFuturesAccountDetail>
      getFuturesAccountSummary(options?: { recvWindow?: number }): Promise<SubAccountFuturesAccountSummary>
      getFuturesPositionRisk(options: {
        email: string
        recvWindow?: number
      }): Promise<SubAccountFuturesPositionRisk[]>
      futuresTransfer(options: SubAccountFuturesTransferOptions): Promise<string>
      marginTransfer(options: SubAccountMarginTransferOptions): Promise<string>
      transferToSiblingSubAccount(options: SubAccountTransferToSiblingSubAccountOptions): Promise<string>
      transferToMaster(options: {
        asset: string
        amount: string
        recvWindow?: number
      }): Promise<string>
      transferHistory(options?: SubAccountTransferHistoryOptions): Promise<SubAccountTransferHistory[]>
      universalTransfer(options: SubAccountUniversalTransferOptions): Promise<string>
      universalTransferHistory(options?: SubAccountUniversalTransferHistoryOptions): Promise<SubAccountUniversalTransferHistoryItem[]>
      getFuturesAccountDetailV2(options: SubAccountGetFuturesAccountDetailV2Options): Promise<SubAccountFuturesAccountDetailV2>
      getFuturesAccountSummaryV2(options: SubAccountGetFuturesAccountSummaryV2Options): Promise<SubAccountFuturesAccountSummaryV2>
      getFuturesPositionRiskV2(options: SubAccountGetFuturesPositionRiskV2Options): Promise<SubAccountFuturesPositionRiskV2>
      enableBLVT(options: SubAccountEnableBLVTOptions): Promise<SubAccountEnableBLVT>
      depositToManaged(options: SubAccountDepositToManagedOptions): Promise<string>
      getManagedAccountDetails(options: {
        email: string
        recvWindow?: number
      }): Promise<SubAccountManagedAccountDetail[]>
      withdrawFromManaged(options: SubAccountWithdrawFromManagedOptions): Promise<string>
    }
    marketData: {
      historicalTrades(options: SpotMarketDataHistoricalTradesOptions): Promise<SpotMarketDataHistoricalTrade[]>
    }
    trade: {
      orderTest(options: SpotTradeOrderTestOptions): Promise<{}>
      order(options: SpotTradeOrderOptions): Promise<SpotTradeOrderResult>
      cancelOrder(options: SpotTradeCancelOrderOptions): Promise<SpotTradeCancelOrderResult>
      cancelOpenOrders(options: {
        symbol: string
        recvWindow?: number
      }): Promise<SpotTradeCancelOrderResult[]>
      getOrder(options: SpotTradeGetOrderOptions): Promise<SpotTradeOrder>
      openOrders(options?: {
        symbol?: string
        recvWindow?: number
      }): Promise<SpotTradeOrder[]>
      allOrders(options: SpotTradeAllOrdersOptions): Promise<SpotTradeOrder[]>
      account(options?: { recvWindow: number }): Promise<SpotTradeAccount>
      myTrades(options: SpotTradeMyTradesOptions): Promise<SpotTradeMyTrade[]>
      OCO: {
        order(options: SpotTradeOCOOrderOptions): Promise<SpotTradeOCOOrderResult>
        cancelOrder(options: SpotTradeOCOCancelOrderOptions): Promise<SpotTradeOCOCancelOrderResult>
        getOrder(options: SpotTradeOCOGetOrderOptions): Promise<SpotTradeOCOOrder>
        allOrders(options?: SpotTradeOCOAllOrdersOptions): Promise<SpotTradeOCOOrder[]>
        openOrders(options?: { recvWindow: number }): Promise<SpotTradeOCOOrder[]>
      }
    }
    userDataStreams: {
      create(): Promise<{ listenKey: string }>
      ping(options: { listenKey: string }): Promise<{}>
      close(options: { listenKey: string }): Promise<{}>
    }
    savings: {
      flexibleProduct: {
        list(options?: SavingsFlexibleProductListOptions): Promise<SavingsFlexibleProductListItem[]>
        leftDailyPurchaseQuota(options: {
          productId: string
          recvWindow?: number
        }): Promise<{
          asset: string
          leftQuota: string
        }>
        purchase(options: {
          productId: string
          amount: string
          recvWindow?: number
        }): Promise<string>
        leftDailyRedemptionQuota(options: SavingsFlexibleProductLeftDailyRedemptionQuotaOptions): Promise<SavingsFlexibleProductLeftDailyRedemptionQuota>
        redeem(options: SavingsFlexibleProductRedeem): Promise<{}>
        position(options: {
          asset: string
          recvWindow?: number
        }): Promise<SavingsFlexibleProductPosition[]>
      }
      fixedActivityProject: {
        list(options: SavingsFixedActivityProjectListOptions): Promise<SavingsFixedActivityProjectListItem[]>
        purchase(options: SavingsFixedActivityProjectPurchaseOptions): Promise<string>
        position(options: SavingsFixedActivityProjectPositionOptions): Promise<SavingsFixedActivityProjectPositionListItem[]>
      }
      lendingAccount(options?: { recvWindow: number }): Promise<SavingsLendingAccount>
      purchaseRecord(options: SavingsPurchaseRecordOptions): Promise<SavingsPurchaseRecordFlexibleProductsItem[] | SavingsPurchaseRecordFixedActivityProjectsItem[]>
      redemptionRecord(options: SavingsRedemptionRecordOptions): Promise<SavingsRedemptionRecordFlexibleProductsItem[] | SavingsRedemptionRecordFixedActivityProjectsItem[]>
      interestHistory(options: SavingsInterestHistoryOptions): Promise<SavingsInterestHistoryListItem[]>
      changeToDailyPosition(options: SavingsChangeToDailyPositionOptions): Promise<SavingsChangeToDailyPositionResult>
    }
    mining: {
      acquiringAlgorithm(options?: { recvWindow: number }): Promise<MiningAcquiringAlgorithmResult>
      acquiringCoinName(options?: { recvWindow: number }): Promise<MiningAcquiringCoinNameResult>
      detailedMinerList(options: MiningDetailedMinerListOptions): Promise<MiningDetailedMinerListResult>
      minerList(options: MiningMinerListOptions): Promise<MiningMinerListResult>
      earningsList(options: MiningEarningsListOptions): Promise<MiningEarningsListResult>
      extraBonusList(options: MiningExtraBonusListOptions): Promise<MiningExtraBonusListResult>
      hashrateResale: {
        list(options?: MiningHashrateResaleListOptions): Promise<MiningHashrateResaleListResult>
        detail(options: MiningHashrateResaleDetailOptions): Promise<MiningHashrateResaleDetailResult>
        request(options: MiningHashrateResaleRequestOptions): Promise<{
          code: number
          msg: string
          data: number
        }>
        cancelConfiguration(options: MiningHashrateResaleCancelConfigurationOptions): Promise<{
          code: number
          msg: string
          data: boolean
        }>
      }
      staticList(options: MiningStaticListOptions): Promise<MiningStaticListResult>
      accountList(options: MiningAccountListOptions): Promise<MiningAccountListResult>
    }
    futures: {
      transfer(options: SpotFuturesTransfer): Promise<number>
      transactionHistoryList(options: SpotFuturesTransactionHistoryListOptions): Promise<SpotFuturesTransactionHistoryListResult>
      crossCollateralBorrow(options: SpotFuturesCrossCollateralBorrowOptions): Promise<SpotFuturesCrossCollateralBorrowResult>
      crossCollateralBorrowHistory(options?: SpotFuturesCrossCollateralBorrowHistoryOptions): Promise<SpotFuturesCrossCollateralBorrowHistoryResult>
      crossCollateralRepay(options: SpotFuturesCrossCollateralRepayOptions): Promise<SpotFuturesCrossCollateralRepayResult>
      crossCollateralRepayHistory(options?: SpotFuturesCrossCollateralRepayHistoryOptions): Promise<SpotFuturesCrossCollateralRepayHistoryResult>
      crossCollateralWallet(options?: { recvWindow: number }): Promise<SpotFuturesCrossCollateralWallet>
      crossCollateralWalletV2(options?: { recvWindow: number }): Promise<SpotFuturesCrossCollateralWalletV2>
      crossCollateralInformation(options?: {
        collateralCoin?: string
        recvWindow?: number
      }): Promise<SpotFuturesCrossCollateralInformationResultItem[]>
      crossCollateralInformationV2(options?: SpotFuturesCrossCollateralInformationV2Options): Promise<SpotFuturesCrossCollateralInformationV2ResultItem[]>
      crossCollateralCalculateRateAfterAdjust(options: SpotFuturesCrossCollateralCalculateRateAfterAdjustOptions): Promise<string>
      crossCollateralCalculateRateAfterAdjustV2(options: SpotFuturesCrossCollateralCalculateRateAfterAdjustV2Options): Promise<string>
      crossCollateralMaxAdjustAmount(options: {
        collateralCoin: string
        recvWindow?: number
      }): Promise<{
        maxInAmount: string
        maxOutAmount: string
      }>
      crossCollateralMaxAdjustAmountV2(options: {
        loanCoin: string
        collateralCoin: string
        recvWindow?: number
      }): Promise<{
        maxInAmount: string
        maxOutAmount: string
      }>
      adjustCrossCollateral(options: SpotFuturesAdjustCrossCollateralOptions): Promise<SpotFuturesAdjustCrossCollateral>
      adjustCrossCollateralV2(options: SpotFuturesAdjustCrossCollateralV2Options): Promise<SpotFuturesAdjustCrossCollateralV2>
      adjustCrossCollateralHistory(options?: SpotFuturesAdjustCrossCollateralHistoryOptions): Promise<SpotFuturesAdjustCrossCollateralHistoryResult>
      crossCollateralLiquidationHistory(options?: SpotFuturesCrossCollateralLiquidationHistoryOptions): Promise<SpotFuturesCrossCollateralLiquidationHistoryResult>
      collateralRepayLimit(options: SpotFuturesCollateralRepayLimitOptions): Promise<SpotFuturesCollateralRepayLimit>
      getCollateralRepayQuote(options: SpotFuturesGetCollateralRepayQuoteOptions): Promise<SpotFuturesGetCollateralRepayQuote>
      collateralRepay(options: {
        quoteId: string
        recvWindow?: number
      }): Promise<SpotFuturesCollateralRepay>
      collateralRepaymentResult(options: {
        quoteId: string
        recvWindow?: number
      }): Promise<{
        quoteId: string
        status: string
      }>
      crossCollateralInterestHistory(options?: SpotFuturesCrossCollateralInterestHistoryOptions): Promise<SpotFuturesCrossCollateralInterestHistoryResult>
    }
    BLVT: {
      info(options?: { tokenName: string }): Promise<BLVTInfoItem[]>
      subscribe(options: BLVTSubscribeOptions): Promise<BLVTSubscribeResult>
      getSubscriptionRecord(options?: BLVTGetSubscriptionRecordOptions): Promise<BLVTSubscriptionRecordItem[]>
      redeem(options: BLVTRedeemOptions): Promise<BLVTRedeemResult>
      getRedemptionRecord(options?: BLVTGetRedemptionRecordOptions): Promise<BLVTGetRedemptionRecordItem[]>
      userLimit(options?: {
        tokenName?: string
        recvWindow?: number
      }): Promise<BLVTUserLimitItem[]>
    }
    BSwap: {
      getPools(): Promise<BSwapGetPoolsResult>
      getLiquidity(options?: {
        poolId?: number
        recvWindow?: number
      }): Promise<BSwapLiquidityItem[]>
      addLiquidity(options: BSwapAddLiquidityOptions): Promise<number>
      removeLiquidity(options: BSwapRemoveLiquidityOptions): Promise<number>
      getLiquidityOperationRecords(options?: BSwapGetLiquidityOperationRecordsOptions): Promise<BSwapLiquidityOperationRecord[]>
      requestQuote(options: BSwapRequestQuoteOptions): Promise<BSwapRequestQuoteResult>
      swap(options: BSwapSwapOptions): Promise<number>
      swapHistory(options?: BSwapSwapHistoryOptions): Promise<BSwapSwapHistoryItem[]>
      getPoolConfigure(options?: {
        poolId?: number
        recvWindow?: number
      }): Promise<BSwapPoolConfigureItem[]>
      addLiquidityPreview(options: BSwapAddLiquidityPreviewOptions): Promise<BSwapAddLiquidityPreviewResult>
      removeLiquidityPreview(options: BSwapRemoveLiquidityPreviewOptions): Promise<BSwapRemoveLiquidityPreviewResult>
    }
    fiat: {
      getOrderHistory(options: FiatGetOrderHistoryOptions): Promise<FiatOrderHistoryResult>
      getPaymentHistory(options: FiatGetPaymentHistoryOptions): Promise<FiatPaymentHistoryResult>
    }
    C2C: {
      getTradeHistory(options: C2CGetTradeHistoryOptions): Promise<C2CGetTradeHistoryResult>
    }
    cryptoLoans: {
      getCryptoLoansIncomeHistory(options: CryptoLoansGetCryptoLoansIncomeHistoryOptions): Promise<CryptoLoansIncomeHistoryItem>
    }
    pay: {
      getPayTradeHistory(options?: PayGetPayTradeHistoryOptions): Promise<PayGetPayTradeHistoryResult>
    }
  }

  export interface AuthenticatedMargin {
    loan(options: MarginLoanOptions): Promise<number>
    repay(options: MarginRepayOptions): Promise<number>
    asset(options: {
      asset: string
    }): Promise<MarginAsset>
    allAssets(): Promise<MarginAsset[]>
    priceIndex(options: {
      symbol: string
    }): Promise<{
      calcTime: number
      price: string
      symbol: string
    }>
    order(options: MarginOrderOptions): Promise<MarginOrderResult>
    cancelOrder(options: MarginCancelOrderOptions): Promise<MarginCancelOrderResult>
    cancelAllOpenOrders(options: {
      symbol: string
      isIsolated?: UppercaseBooleanString
      recvWindow?: number
    }): Promise<MarginCancelAllOpenOrdersResult[]>
    loanRecord(options: MarginLoanRecordOptions): Promise<MarginLoanRecordResult>
    repayRecord(options: MarginRepayRecordOptions): Promise<MarginRepayRecordResult>
    interestHistory(options?: MarginInterestHistoryOptions): Promise<MarginInterestHistoryResult>
    forceLiquidationRecord(options?: MarginForceLiquidationRecordOptions): Promise<MarginForceLiquidationRecordResult>
    getOrder(options: MarginGetOrderOptions): Promise<MarginOrder>
    openOrders(options?: {
      symbol?: string
      isIsolated?: UppercaseBooleanString
      recvWindow?: number
    }): Promise<MarginOrder[]>
    allOrders(options: MarginAllOrdersOptions): Promise<MarginOrder[]>
    myTrades(options: MarginMyTradesOptions): Promise<MarginTrade[]>
    maxBorrow(options: {
      asset: string
      isolatedSymbol?: string
      recvWindow?: number
    }): Promise<{
      amount: string
      borrowLimit: string
    }>
    maxTransferOut(options: {
      asset: string
      isolatedSymbol?: string
      recvWindow?: number
    }): Promise<string>
    setBNBBurn(options: {
      spotBNBBurn?: LowercaseBooleanString
      interestBNBBurn?: LowercaseBooleanString
      recvWindow?: number
    }): Promise<{
      spotBNBBurn: boolean
      interestBNBBurn: boolean
    }>
    getBNBBurn(options?: { recvWindow: number }): Promise<{
      spotBNBBurn: boolean
      interestBNBBurn: boolean
    }>
    interestRateHistory(options: MarginInterestRateHistoryOptions): Promise<MarginInterestRateHistoryItem[]>
    userDataStreams: {
      create(): Promise<{ listenKey: string }>
      ping(options: { listenKey: string }): Promise<{}>
      close(options: { listenKey: string }): Promise<{}>
    }
    cross: {
      transfer(options: MarginCrossTransferOptions): Promise<number>
      pair(options: {
        symbol: string
      }): Promise<MarginCrossPair>
      allPairs(): Promise<{
        [ symbol: string ]: MarginCrossPair
      }>
      transferHistory(options?: MarginCrossTransferHistoryOptions): Promise<MarginCrossTransferHistoryResult>
      account(options?: { recvWindow: number }): Promise<MarginCrossAccount>
    }
    isolated: {
      transfer(options: MarginIsolatedTransferOptions): Promise<number>
      transferHistory(options: MarginIsolatedTransferHistoryOptions): Promise<MarginIsolatedTransferHistoryResult>
      account(options?: {
        symbols?: string
        recvWindow?: number
      }): Promise<MarginIsolatedAccount>
      disableAccount(options: {
        symbol: string
        recvWindow?: number
      }): Promise<{
        success: boolean
        symbol: string
      }>
      enableAccount(options: {
        symbol: string
        recvWindow?: number
      }): Promise<{
        success: boolean
        symbol: string
      }>
      enabledAccountLimit(options?: { recvWindow: number }): Promise<{
        enabledAccount: number
        maxAccount: number
      }>
      symbol(options: {
        symbol: string
        recvWindow?: number
      }): Promise<MarginIsolatedSymbol>
      allSymbols(options?: { recvWindow: number }): Promise<{
        [ symbol: string ]: MarginIsolatedSymbol
      }>
      userDataStreams: {
        create(): Promise<{ listenKey: string }>
        ping(options: { listenKey: string }): Promise<{}>
        close(options: { listenKey: string }): Promise<{}>
      }
    }
    OCO: {
      order(options: MarginOCOOrderOptions): Promise<MarginOCOOrderResult>
      cancelOrder(options: MarginOCOCancelOrderOptions): Promise<MarginOCOCancelOrderResult>
      getOrder(options?: MarginOCOGetOrderOptions): Promise<MarginOCOOrder>
      allOrders(options?: MarginOCOAllOrdersOptions): Promise<MarginOCOOrder[]>
      openOrders(options?: {
        isIsolated?: UppercaseBooleanString
        symbol?: string
        recvWindow?: number
      }): Promise<MarginOCOOrder[]>
    }
  }

  export interface AuthenticatedFutures {
    marketData: {
      historicalTrades(options: {
        symbol: string
        limit?: number
        fromId?: number
      }): Promise<FuturesHistoricalTrade[]>
      topLongShortAccountRatio(options: FuturesTopLongShortAccountRatioOptions): Promise<FuturesTopLongShortAccountRatioResult[]>
    }
    trade: {
      changePositionMode(options: {
        dualSidePosition: LowercaseBooleanString
        recvWindow?: number
      }): Promise<{
        code: number
        msg: string
      }>
      positionMode(options?: { recvWindow: number }): Promise<boolean>
      changeMultiAssetsMode(options: {
        multiAssetsMargin: LowercaseBooleanString
        recvWindow?: number
      }): Promise<{
        code: number
        msg: string
      }>
      multiAssetsMode(options: { recvWindow: number }): Promise<boolean>
      order(options: FuturesOrderOptions): Promise<FuturesOrderResult>
      batchOrder(options: FuturesBatchOrderOptions): Promise<FuturesBatchOrderResult>
      getOrder(options: {
        symbol: string
        orderId?: number
        origClientOrderId?: string
        recvWindow?: number
      }): Promise<FuturesOrder>
      cancelOrder(options: {
        symbol: string
        orderId?: number
        origClientOrderId?: string
        recvWindow?: number
      }): Promise<FuturesCancelOrderResult>
      cancelOpenOrders(options: {
        symbol: string
        recvWindow?: number
      }): Promise<{
        code:  string
        msg: string
      }>
      cancelMultipleOrders(options: FuturesCancelMultipleOrdersOptions): Promise<FuturesCancelMultipleOrdersResult>
      autoCancelOpenOrders(options: {
        symbol: string
        countdownTime: number
        recvWindow?: number
      }): Promise<{
        symbol:  string
        countdownTime: string
      }>
      getOpenOrder(options: FuturesGetOpenOrderOptions): Promise<FuturesOrder>
      openOrders(options?: {
        symbol?: string
        recvWindow?: number
      }): Promise<FuturesOrder[]>
      allOrders(options: {
        symbol: string
        orderId?: number
        startTime?: number
        endTime?: number
        limit?: number
        recvWindow?: number
      }): Promise<FuturesOrder[]>
      accountBalance(options?: { recvWindow: number }): Promise<FuturesAccountBalance[]>
      account(options?: { recvWindow: number }): Promise<FuturesAccount>
      changeLeverage(options: {
        symbol: string
        leverage: number
        recvWindow?: number
      }): Promise<{
        leverage: number
        maxNotionalValue: string
        symbol: string
      }>
      changeMarginType(options: {
        symbol: string
        marginType: FuturesMarginType_LT
        recvWindow?: number
      }): Promise<{
        code: number
        msg:  string
      }>
      modifyPositionMargin(options: FuturesModifyPositionMarginOptions): Promise<{
        code: number
        msg:  string
      }>
      positionMarginChangeHistory(options: FuturesPositionMarginChangeHistoryOptions): Promise<{
        amount: string
        asset: string
        symbol: string
        time: number
        type: FuturesPositionMarginType_LT
        positionSide: FuturesOrderPositionSide_LT
      }[]>
      position(options?: {
        symbol?: string
        recvWindow?: number
      }): Promise<FuturesPosition[]>
      trades(options: FuturesTradesOptions): Promise<FuturesUserTrade[]>
      incomeHistory(options?: FuturesIncomeHistoryOptions): Promise<FuturesIncomeHistoryItem[]>
      leverageBracket(options?: {
        symbol?: string
        recvWindow?: number
      }): Promise<FuturesLeverageBracketResult>
      positionADLQuantileEstimation(options?: {
        symbol?: string
        recvWindow?: number
      }): Promise<FuturesPositionADLQuantileEstimationResult>
      getForceOrders(options?: FuturesGetForceOrdersOptions): Promise<FuturesForceOrder[]>
      APITradingQuantitativeRulesIndicators(options?: {
        symbol?: string
        recvWindow?: number
      }): Promise<FuturesAPITradingQuantitativeRulesIndicatorsResult>
      commissionRate(options: {
        symbol: string
        recvWindow?: number
      }): Promise<{
        symbol: string
        makerCommissionRate: string
        takerCommissionRate: string
      }>
    }
    userDataStreams: {
      create(): Promise<{ listenKey: string }>
      ping(): Promise<{}>
      close(): Promise<{}>
    }
  }

  export interface GetInfo {
    spot: GetInfoDetails
    futures: GetInfoDetails
  }

  export type GetInfoDetails = {
    usedWeight1m?: string
    orderCount10s?: string
    orderCount1m?: string
    orderCount1h?: string
    orderCount1d?: string
    responseTime?: string
  }

  export interface WebSocket {
    spot: {
      aggTrades: (
        symbol: string | string[],
        callback: (trade: SpotAggTrade) => void
      ) => ReconnectingWebSocketHandler
      trades: (
        symbol: string | string[],
        callback: (trade: WSSpotTrade) => void
      ) => ReconnectingWebSocketHandler
      candles: (
        symbol: string | string[],
        interval: CandleChartInterval_LT,
        callback: (ticker: Candle) => void
      ) => ReconnectingWebSocketHandler
      miniTicker: (
        symbol: string | string[],
        callback: (ticker: MiniTicker) => void
      ) => ReconnectingWebSocketHandler
      allMiniTickers: (
        callback: (ticker: MiniTicker[]) => void
      ) => ReconnectingWebSocketHandler
      ticker: (
        symbol: string | string[],
        callback: (ticker: Ticker) => void
      ) => ReconnectingWebSocketHandler
      allTickers: (
        callback: (tickers: Ticker[]) => void
      ) => ReconnectingWebSocketHandler
      bookTicker: (
        callback: (bookTicker: WSBookTicker) => void
      ) => ReconnectingWebSocketHandler
      allBookTickers: (
        callback: (bookTickers: WSBookTicker[]) => void
      ) => ReconnectingWebSocketHandler
      partialDepth: (
        options: {
          symbol: string
          level: 5 | 10 | 20
          updateSpeed?: '1000ms' | '100ms'
        } | {
          symbol: string
          level: 5 | 10 | 20
          updateSpeed?: '1000ms' | '100ms'
        }[],
        callback: (depth: SpotPartialDepth) => void
      ) => ReconnectingWebSocketHandler
      depth: (
        options: {
          symbol: string
          updateSpeed?: '1000ms' | '100ms'
        } | {
          symbol: string
          updateSpeed?: '1000ms' | '100ms'
        }[],
        callback: (depth: SpotDepth) => void
      ) => ReconnectingWebSocketHandler
      user: (
        callback: (msg: UserDataStreamEvent) => void
      ) => Promise<ReconnectingWebSocketHandler>
    }
    margin: {
      user: (
        callback: (msg: OutboundAccountInfo | ExecutionReport) => void,
      ) => Promise<ReconnectingWebSocketHandler>
    }
    futures: {
      aggTrades: (
        symbol: string | string[],
        callback: (trade: FuturesAggTrade) => void,
      ) => ReconnectingWebSocketHandler
      markPrice: (
        options: {
          symbol: string
          updateSpeed?: '3000ms' | '1000ms' | '1s'
        } | {
          symbol: string
          updateSpeed?: '3000ms' | '1000ms' | '1s'
        }[],
        callback: (markPrice: WSMarkPrice) => void
      ) => ReconnectingWebSocketHandler
      allMarkPrices: (
        options: {
          updateSpeed?: '3000ms' | '1000ms' | '1s'
        },
        callback: (markPrices: WSMarkPrice[]) => void
      ) => ReconnectingWebSocketHandler
      candles: (
        symbol: string | string[],
        interval: CandleChartInterval_LT,
        callback: (ticker: Candle) => void
      ) => ReconnectingWebSocketHandler
      continuousKlines: (
        options: {
          pair: string
          contractType: 'perpetual' | 'current_quarter' | 'next_quarter'
        } | {
          pair: string
          contractType: 'perpetual' | 'current_quarter' | 'next_quarter'
        }[],
        interval: CandleChartInterval_LT,
        callback: (ticker: WSContinuousKline) => void
      ) => ReconnectingWebSocketHandler
      miniTicker: (
        symbol: string | string[],
        callback: (ticker: MiniTicker) => void
      ) => ReconnectingWebSocketHandler
      allMiniTickers: (
        callback: (ticker: MiniTicker[]) => void
      ) => ReconnectingWebSocketHandler
      ticker: (
        symbol: string | string[],
        callback: (ticker: FuturesTicker) => void
      ) => ReconnectingWebSocketHandler
      allTickers: (
        callback: (tickers: FuturesTicker[]) => void
      ) => ReconnectingWebSocketHandler
      bookTicker: (
        callback: (bookTicker: WSFuturesBookTicker) => void
      ) => ReconnectingWebSocketHandler
      allBookTickers: (
        callback: (bookTickers: WSFuturesBookTicker[]) => void
      ) => ReconnectingWebSocketHandler
      liquidation: (
        symbol: string | string[],
        callback: (trade: WSLiquidation) => void
      ) => ReconnectingWebSocketHandler
      allLiquidations: (
        callback: (trade: WSLiquidation) => void
      ) => ReconnectingWebSocketHandler
      partialDepth: (
        options: {
          symbol: string
          level: 5 | 10 | 20
          updateSpeed?: '1000ms' | '100ms'
        } | {
          symbol: string
          level: 5 | 10 | 20
          updateSpeed?: '1000ms' | '100ms'
        }[],
        callback: (depth: FuturesPartialDepth) => void
      ) => ReconnectingWebSocketHandler
      depth: (
        options: {
          symbol: string
          updateSpeed?: '1000ms' | '100ms'
        } | {
          symbol: string
          updateSpeed?: '1000ms' | '100ms'
        }[],
        callback: (depth: FuturesDepth) => void
      ) => ReconnectingWebSocketHandler
      BLVT: {
        info: (
          tokenName: string | string[],
          callback: (depth: FuturesBLVTInfo) => void
        ) => ReconnectingWebSocketHandler
        candles: (
          symbol: string | string[],
          interval: CandleChartInterval_LT,
          callback: (ticker: Candle) => void
        ) => ReconnectingWebSocketHandler
      }
      compositeIndex: (
        symbol: string | string[],
        callback: (depth: FuturesCompositeIndex) => void
      ) => ReconnectingWebSocketHandler
      user: (
        callback: (msg: OutboundAccountInfo | ExecutionReport | AccountUpdate | OrderUpdate) => void,
      ) => Promise<ReconnectingWebSocketHandler>
    }
    advanced: {
      spot: {
        customSubStream: (
          pair: string | string[],
          callback: (data: any) => void
        ) => ReconnectingWebSocketHandler
      },
      futures: {
        customSubStream: (payload: any, cb: any) =>  (options: any) => void
      }
    }
  }

  export interface Binance {
    public: {
      spot: PublicSpot
      futures: PublicFutures
    }
    authenticated: {
      spot: AuthenticatedSpot
      margin: AuthenticatedMargin
      futures: AuthenticatedFutures
    }
    common: {
      getInfo(): GetInfo
    }
    advanced: {
      publicRequest(method: MethodType_LT, url: string, payload: any): Promise<any>
      partialPrivateRequest(method: MethodType_LT, url: string, payload: any): Promise<any>
      privateRequest(method: MethodType_LT, url: string, payload: any): Promise<any>
    }
    ws: WebSocket
  }

  export interface HttpError extends Error {
    code: number
    url: string
  }

  export type EventType_LT = 'account' | 'balanceUpdate' | 'outboundAccountPosition'
    | 'executionReport' | 'ACCOUNT_UPDATE'

  export const enum EventType {
    ACCOUNT = 'account',
    BALANCE_UPDATE = 'balanceUpdate',
    OUTBOUND_ACCOUNT_POSITION = 'outboundAccountPosition',
    EXECUTION_REPORT = 'executionReport',
    ACCOUNT_UPDATE = 'ACCOUNT_UPDATE',
    ORDER_TRADE_UPDATE = 'ORDER_TRADE_UPDATE',
  }

  export interface Balances {
    [ key: string ]: {
      available: string
      locked: string
    }
  }

  export interface OutboundAccountInfo {
    balances: Balances
    makerCommissionRate: number
    takerCommissionRate: number
    buyerCommissionRate: number
    sellerCommissionRate: number
    canTrade: boolean
    canWithdraw: boolean
    canDeposit: boolean
    lastAccountUpdate: number
    eventType: EventType.ACCOUNT
    eventTime: number
  }

  export type ExecutionType_LT = 'NEW' | 'CANCELED' | 'REPLACED'
    | 'REJECTED' | 'TRADE' | 'EXPIRED'

  export const enum ExecutionType {
    NEW = 'NEW',
    CANCELED = 'CANCELED',
    REPLACED = 'REPLACED',
    REJECTED = 'REJECTED',
    TRADE = 'TRADE',
    EXPIRED = 'EXPIRED'
  }

  export type OrderRejectReason_LT = 'ACCOUNT_CANNOT_SETTLE' | 'ACCOUNT_INACTIVE' | 'DUPLICATE_ORDER'
    | 'INSUFFICIENT_BALANCE' | 'MARKET_CLOSED' | 'NONE'
    | 'ORDER_WOULD_TRIGGER_IMMEDIATELY' | 'PRICE_QTY_EXCEED_HARD_LIMITS' | 'UNKNOWN_ACCOUNT'
    | 'UNKNOWN_INSTRUMENT' | 'UNKNOWN_ORDER'

  export const enum OrderRejectReason {
    ACCOUNT_CANNOT_SETTLE = 'ACCOUNT_CANNOT_SETTLE',
    ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
    DUPLICATE_ORDER = 'DUPLICATE_ORDER',
    INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
    MARKET_CLOSED = 'MARKET_CLOSED',
    NONE = 'NONE',
    ORDER_WOULD_TRIGGER_IMMEDIATELY = 'ORDER_WOULD_TRIGGER_IMMEDIATELY',
    PRICE_QTY_EXCEED_HARD_LIMITS = 'PRICE_QTY_EXCEED_HARD_LIMITS',
    UNKNOWN_ACCOUNT = 'UNKNOWN_ACCOUNT',
    UNKNOWN_INSTRUMENT = 'UNKNOWN_INSTRUMENT',
    UNKNOWN_ORDER = 'UNKNOWN_ORDER',
  }

  export interface ExecutionReport {
    commission: string                      // Commission amount
    commissionAsset: string | null          // Commission asset
    creationTime: number                    // Order creation time
    eventTime: number                       
    eventType: EventType.EXECUTION_REPORT   
    executionType: ExecutionType_LT         // Current execution type
    icebergQuantity: string                 // Iceberg quantity
    isBuyerMaker: boolean                   // Is this trade the maker side?
    isOrderWorking: boolean                 // Is the order on the book?
    lastQuoteTransacted: string             // Last quote asset transacted quantity (i.e. lastPrice * lastQty);
    lastTradeQuantity: string               // Last executed quantity
    newClientOrderId: string                // Client order ID
    orderId: number                         // Order ID
    orderListId: number                     // OrderListId
    orderRejectReason: OrderRejectReason    // Order reject reason; will be an error code.
    orderStatus: OrderStatus_LT             // Current order status
    orderTime: number                       // Transaction time
    orderType: OrderType_LT                 // Order type
    originalClientOrderId: string | null    // Original client order ID; This is the ID of the order being canceled
    price: string                           // Order price
    priceLastTrade: string                  // Last executed price
    quantity: string                        // Order quantity
    quoteOrderQuantity: string              // Quote Order Qty
    side: OrderSide_LT                      // Side
    stopPrice: string                       // Stop price
    symbol: string                          // Symbol
    timeInForce: TimeInForce_LT             // Time in force
    totalQuoteTradeQuantity: string         // Cumulative quote asset transacted quantity
    totalTradeQuantity: string              // Cumulative filled quantity
    tradeId: number                         // Trade ID
  }

  export interface BalanceUpdate {
    asset: string
    balanceDelta: string
    clearTime: number
    eventTime: number
    eventType: EventType.BALANCE_UPDATE
  }

  export interface Balance {
    asset: string
    walletBalance: string
    crossWalletBalance: string
  }

  export interface Position {
    symbol: string
    positionAmount: string
    entryPrice: string
    accumulatedRealized: string
    unrealizedPnL: string
    marginType: string
    isolatedWallet: string
    positionSide: string
  }

  export interface AccountUpdate {
    eventTime: string
    eventType: EventType.ACCOUNT_UPDATE
    transactionTime: number
    eventReasonType: string
    balances: Balance[]
    positions: Position[]
  }

  export type WorkingType_LT = 'MARK_PRICE' | 'CONTRACT_PRICE'

  export const enum WorkingType {
    MARK_PRICE = 'MARK_PRICE',
    CONTRACT_PRICE = 'CONTRACT_PRICE',
  }

  export interface OrderUpdate {
    eventType: EventType.ORDER_TRADE_UPDATE
    eventTime: number
    transactionTime: number
    symbol: string
    clientOrderId: string
    side: OrderSide
    orderType: OrderType
    timeInForce: TimeInForce
    quantity: string
    price: string
    averagePrice: string
    stopPrice: string
    executionType: ExecutionType
    orderStatus: OrderStatus
    orderId: number
    lastTradeQuantity: string
    totalTradeQuantity: string
    priceLastTrade: string
    commissionAsset: string | null
    commission: string
    orderTime: number
    tradeId: number
    bidsNotional: string
    asksNotional: string
    isMaker: boolean
    isReduceOnly: boolean
    workingType: WorkingType
    originalOrderType: OrderType
    positionSide: PositionSide
    closePosition: boolean
    activationPrice: string
    callbackRate: string
    realizedProfit: string
  }

  export interface OutboundAccountPosition {
    balances: AssetBalance[]
    eventTime: number
    eventType: EventType.OUTBOUND_ACCOUNT_POSITION
    lastAccountUpdate: number
  }

  export type UserDataStreamEvent = OutboundAccountInfo | ExecutionReport | BalanceUpdate
    | OutboundAccountPosition
}
