import { ignoreAutoI18n } from '@kapo/webpack-plugin-i18n-transformer/dist/utils'

export const totalMap = {
  price: 'price',
  clicks: 'totalClicks',
  inventory: 'totalInventory',
  orders: 'totalOrders',
  returnQuantity: 'totalReturn',
  sales: 'totalSales',
  session: 'totalSession',
  quantity: 'totalSold',
  storage: 'totalStorage',
  supply: 'totalSupply',
  unit: 'totalUnit',
}

export const commonLintChartConfig = [
  { type: 'Sold', params: 1, name: 'Sold' },
  { type: 'Price', params: 2, name: 'Price' },
]

export const urlMap = {
  1: 'https://www.amazon.com/dp/',
  2: 'https://www.amazon.ca/dp/',
  3: 'https://www.amazon.co.uk/dp/',
  4: 'https://www.amazon.de/dp/',
  5: 'https://www.amazon.fr/dp/',
  6: 'https://www.amazon.it/dp/',
  7: 'https://www.amazon.es/dp/',
  9: 'https://www.amazon.com.mx/dp/',
  118: 'https://www.amazon.pl/dp/',
  127: 'https://www.amazon.se/dp/',
  128: 'https://www.amazon.nl/dp/',
  141: 'https://www.amazon.tr/dp/',
  145: 'https://www.amazon.be/dp/',
}

export const chartSelected = {
  [ignoreAutoI18n('广告订单')]: false,
  [ignoreAutoI18n('广告订单-去年')]: false,
  [ignoreAutoI18n('广告订单-前年')]: false,
  [ignoreAutoI18n('Session')]: false,
  [ignoreAutoI18n('Session-去年')]: false,
  [ignoreAutoI18n('Session-前年')]: false,
  [ignoreAutoI18n('Sold')]: true,
  [ignoreAutoI18n('Sold-去年')]: false,
  [ignoreAutoI18n('Sold-前年')]: false,
  [ignoreAutoI18n('Price')]: true,
  [ignoreAutoI18n('Price-去年')]: false,
  [ignoreAutoI18n('Price-前年')]: false,
  [ignoreAutoI18n('FBA可售')]: false,
  [ignoreAutoI18n('FBA可售-去年')]: false,
  [ignoreAutoI18n('FBA可售-前年')]: false,
  [ignoreAutoI18n('ACoS')]: false,
  [ignoreAutoI18n('ACoS-去年')]: false,
  [ignoreAutoI18n('ACoS-前年')]: false,
  [ignoreAutoI18n('转化率')]: false,
  [ignoreAutoI18n('转化率-去年')]: false,
  [ignoreAutoI18n('转化率-前年')]: false,
  [ignoreAutoI18n('星级')]: false,
  [ignoreAutoI18n('星级-去年')]: false,
  [ignoreAutoI18n('星级-前年')]: false,
  [ignoreAutoI18n('大类排名')]: false,
  [ignoreAutoI18n('大类排名-去年')]: false,
  [ignoreAutoI18n('大类排名-前年')]: false,
  [ignoreAutoI18n('小类排名1')]: false,
  [ignoreAutoI18n('小类排名1-去年')]: false,
  [ignoreAutoI18n('小类排名1-前年')]: false,
  [ignoreAutoI18n('小类排名2')]: false,
  [ignoreAutoI18n('小类排名2-去年')]: false,
  [ignoreAutoI18n('小类排名2-前年')]: false,
}

export const lineChartOption = [
  { name: '广告订单', yAxisfieldFirst: 'orderData', yAxisfieldSecond: 'nowYearData' },
  { name: '广告订单-去年', yAxisfieldFirst: 'orderData', yAxisfieldSecond: 'lastYearData' },
  { name: '广告订单-前年', yAxisfieldFirst: 'orderData', yAxisfieldSecond: 'beforeLastYearData' },
  { name: 'Session', yAxisfieldFirst: 'sessionsData', yAxisfieldSecond: 'nowYearData' },
  { name: 'Session-去年', yAxisfieldFirst: 'sessionsData', yAxisfieldSecond: 'lastYearData' },
  { name: 'Session-前年', yAxisfieldFirst: 'sessionsData', yAxisfieldSecond: 'beforeLastYearData' },
  { name: 'Sold', yAxisfieldFirst: 'soldData', yAxisfieldSecond: 'nowYearData', showMarkPoint: true },
  { name: 'Sold-去年', yAxisfieldFirst: 'soldData', yAxisfieldSecond: 'lastYearData', showMarkPoint: true },
  { name: 'Sold-前年', yAxisfieldFirst: 'soldData', yAxisfieldSecond: 'beforeLastYearData', showMarkPoint: true },
  { name: 'Price', yAxisfieldFirst: 'priceData', yAxisfieldSecond: 'nowYearData', showMarkPoint: true },
  { name: 'Price-去年', yAxisfieldFirst: 'priceData', yAxisfieldSecond: 'lastYearData', showMarkPoint: true },
  { name: 'Price-前年', yAxisfieldFirst: 'priceData', yAxisfieldSecond: 'beforeLastYearData', showMarkPoint: true },
  { name: 'FBA可售', yAxisfieldFirst: 'inventoryData', yAxisfieldSecond: 'nowYearData' },
  { name: 'FBA可售-去年', yAxisfieldFirst: 'inventoryData', yAxisfieldSecond: 'lastYearData' },
  { name: 'FBA可售-前年', yAxisfieldFirst: 'inventoryData', yAxisfieldSecond: 'beforeLastYearData' },
  { name: 'ACoS', yAxisfieldFirst: 'aocsData', yAxisfieldSecond: 'nowYearData' },
  { name: 'ACoS-去年', yAxisfieldFirst: 'aocsData', yAxisfieldSecond: 'lastYearData' },
  { name: 'ACoS-前年', yAxisfieldFirst: 'aocsData', yAxisfieldSecond: 'beforeLastYearData' },
  { name: '转化率', yAxisfieldFirst: 'unitData', yAxisfieldSecond: 'nowYearData' },
  { name: '转化率-去年', yAxisfieldFirst: 'unitData', yAxisfieldSecond: 'lastYearData' },
  { name: '转化率-前年', yAxisfieldFirst: 'unitData', yAxisfieldSecond: 'beforeLastYearData' },
  { name: '星级', yAxisfieldFirst: 'averageGradeData', yAxisfieldSecond: 'nowYearData' },
  { name: '星级-去年', yAxisfieldFirst: 'averageGradeData', yAxisfieldSecond: 'lastYearData' },
  { name: '星级-前年', yAxisfieldFirst: 'averageGradeData', yAxisfieldSecond: 'beforeLastYearData' },
  { name: '大类排名', yAxisfieldFirst: 'rankData', yAxisfieldSecond: 'nowYearData' },
  { name: '大类排名-去年', yAxisfieldFirst: 'rankData', yAxisfieldSecond: 'lastYearData' },
  { name: '大类排名-前年', yAxisfieldFirst: 'rankData', yAxisfieldSecond: 'beforeLastYearData' },
  { name: '小类排名1', yAxisfieldFirst: 'rank1Data', yAxisfieldSecond: 'nowYearData' },
  { name: '小类排名1-去年', yAxisfieldFirst: 'rank1Data', yAxisfieldSecond: 'lastYearData' },
  { name: '小类排名1-前年', yAxisfieldFirst: 'rank1Data', yAxisfieldSecond: 'beforeLastYearData' },
  { name: '小类排名2', yAxisfieldFirst: 'rank2Data', yAxisfieldSecond: 'nowYearData' },
  { name: '小类排名2-去年', yAxisfieldFirst: 'rank2Data', yAxisfieldSecond: 'lastYearData' },
  { name: '小类排名2-前年', yAxisfieldFirst: 'rank2Data', yAxisfieldSecond: 'beforeLastYearData' },
]

export const tempTableData = new Map()
