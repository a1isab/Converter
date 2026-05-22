// ===========================
// CONFIG
// ===========================
const CONFIG = {
  HISTORY_MAX: 10,
  REFRESH_COOLDOWN: 60000,
  CRYPTO_CACHE_TTL: 300000,
  PRECISION_DEFAULT: 4,
  FAUCET_FALLBACK_RATE: 60,
  SUPPORTED_LANGS: ['en', 'zh', 'ar', 'ru'],
  STORAGE_KEYS: {
    HISTORY: 'conversionHistory',
    PREV_RATES: 'previousRates',
    CRYPTO_CACHE: 'cryptoCache',
    FAVORITES: 'conversionFavorites',
    LANG: 'lang',
    PRECISION: 'precision',
    THEME: 'theme'
  }
};

// Backward-compatible aliases
const SUPPORTED_LANGS = CONFIG.SUPPORTED_LANGS;
const HISTORY_KEY = CONFIG.STORAGE_KEYS.HISTORY;
const HISTORY_MAX = CONFIG.HISTORY_MAX;
const PREV_RATES_KEY = CONFIG.STORAGE_KEYS.PREV_RATES;
const REFRESH_COOLDOWN = CONFIG.REFRESH_COOLDOWN;
const CRYPTO_CACHE_KEY = CONFIG.STORAGE_KEYS.CRYPTO_CACHE;
const CRYPTO_CACHE_TTL = CONFIG.CRYPTO_CACHE_TTL;
const FAV_KEY = CONFIG.STORAGE_KEYS.FAVORITES;

// ===========================
// STATE
// ===========================
let rates = {};
let currentCategory = 'length';
let currentLang = localStorage.getItem(CONFIG.STORAGE_KEYS.LANG) || 'en';
let precision = parseInt(localStorage.getItem(CONFIG.STORAGE_KEYS.PRECISION) || CONFIG.PRECISION_DEFAULT);
let previousRates = null;
let lastRefreshTime = 0;
let lastCurrencyRecord = null;
let lastUnitRecord = null;
let lastCryptoRecord = null;

// ===========================
// DOM CACHE
// ===========================
const $ = function (id) { return document.getElementById(id); };
const DOM = {
  toast: $('toast'),
  cAmount: $('c-amount'),
  cFrom: $('c-from'),
  cTo: $('c-to'),
  cResult: $('c-result'),
  cStatus: $('c-status'),
  cRateLine: $('rate-line'),
  cRateChange: $('rate-change'),
  cRefreshBtn: $('refresh-btn'),
  uAmount: $('u-amount'),
  uFrom: $('u-from'),
  uTo: $('u-to'),
  uResult: $('u-result'),
  crAmount: $('cr-amount'),
  crFrom: $('cr-from'),
  crTo: $('cr-to'),
  crResult: $('cr-result'),
  crStatus: $('cr-status'),
  settingsPopup: $('settings-popup'),
  historyList: $('history-list'),
  historyView: $('history-view'),
  catRow: $('cat-row'),
  currencyView: $('currency-view'),
  unitView: $('unit-view'),
  historyViewEl: $('history-view'),
  cryptoView: $('crypto-view')
};

// ===========================
// DEBOUNCE
// ===========================
function debounce(fn, delay) {
  var timer;
  return function () {
    var ctx = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
  };
}

var debouncedConvertCurrency = debounce(function () { convertCurrency(); }, 300);
var debouncedConvertUnit = debounce(function () { convertUnit(); }, 300);
var debouncedConvertCrypto = debounce(function () { convertCrypto(); }, 300);

// ===========================
// RESULT FEEDBACK HELPER
// ===========================
function showResult(el, text) {
  el.textContent = text;
  el.classList.remove('updated');
  // Force reflow to restart animation
  void el.offsetWidth;
  el.classList.add('updated');
}

// ===========================
// LANGUAGES & TRANSLATIONS
// ===========================
const LANGUAGES = {
  en: { nativeName: 'English' },
  zh: { nativeName: '中文' },
  ar: { nativeName: 'العربية' }
};

const TRANSLATIONS = {
  en: {
    headerText: 'CONV',
    headerAccent: 'ERT',
    tagline: 'Currency & Units',
    tabCurrency: '\uD83D\uDCB1 Currency',
    tabUnits: '\uD83D\uDCD0 Units',
    tabHistory: '\uD83D\uDCCB History',
    tabCrypto: '\uD83D\uDE09 Crypto',
    swapCrypto: 'Swap',
    cryptoLoading: 'Loading crypto prices\u2026',
    cryptoUpdated: 'Prices updated',
    cryptoOffline: 'Crypto prices offline',
    favEmpty: '\u2606 Favorites',
    historyEmpty: 'No history yet',
    clearHistory: 'Clear History',
    labelAmount: 'Amount',
    labelTo: 'To',
    swapCurrencies: 'Swap currencies',
    swapUnits: 'Swap units',
    statusDefault: 'Fetching live rates\u2026',
    resultCurrency: 'Select currencies',
    resultUnits: 'Select units',
    searchPlaceholder: 'Search currency\u2026',
    noResults: 'No results',
    statusOffline: 'Offline \u2014 using fallback rates.',
    statusUpdated: 'Rates updated: ',
    settingsLanguage: 'Language',
    settingsPrecision: 'Precision',
    settingsTheme: 'Theme',
    copiedText: 'Copied to clipboard!',
    refreshRates: '\u21BB Refresh',
    refreshing: 'Refreshing...',
    categories: {
      length: 'Length',
      mass: 'Mass',
      temperature: 'Temperature',
      speed: 'Speed',
      volume: 'Volume',
      area: 'Area',
      time: 'Time',
      energy: 'Energy',
      pressure: 'Pressure',
      data: 'Data Storage',
      cooking: 'Cooking',
      binary_data: 'Binary Data'
    },
    currencyNames: {
      USD: 'US Dollar',
      AED: 'UAE Dirham',
      AFN: 'Afghan Afghani',
      ALL: 'Albanian Lek',
      AMD: 'Armenian Dram',
      ANG: 'Netherlands Antillean Guilder',
      AOA: 'Angolan Kwanza',
      ARS: 'Argentine Peso',
      AUD: 'Australian Dollar',
      AWG: 'Aruban Florin',
      AZN: 'Azerbaijani Manat',
      BAM: 'Bosnia-Herzegovina Convertible Mark',
      BBD: 'Barbadian Dollar',
      BDT: 'Bangladeshi Taka',
      BGN: 'Bulgarian Lev',
      BHD: 'Bahraini Dinar',
      BIF: 'Burundian Franc',
      BMD: 'Bermudian Dollar',
      BND: 'Brunei Dollar',
      BOB: 'Bolivian Boliviano',
      BRL: 'Brazilian Real',
      BSD: 'Bahamian Dollar',
      BTN: 'Bhutanese Ngultrum',
      BWP: 'Botswana Pula',
      BYN: 'Belarusian Ruble',
      BZD: 'Belize Dollar',
      CAD: 'Canadian Dollar',
      CDF: 'Congolese Franc',
      CHF: 'Swiss Franc',
      CLF: 'Chilean Unit of Account',
      CLP: 'Chilean Peso',
      CNH: 'Chinese Yuan (Offshore)',
      CNY: 'Chinese Yuan',
      COP: 'Colombian Peso',
      CRC: 'Costa Rican Colón',
      CUP: 'Cuban Peso',
      CVE: 'Cape Verdean Escudo',
      CZK: 'Czech Koruna',
      DJF: 'Djiboutian Franc',
      DKK: 'Danish Krone',
      DOP: 'Dominican Peso',
      DZD: 'Algerian Dinar',
      EGP: 'Egyptian Pound',
      ERN: 'Eritrean Nakfa',
      ETB: 'Ethiopian Birr',
      EUR: 'Euro',
      FJD: 'Fijian Dollar',
      FKP: 'Falkland Islands Pound',
      FOK: 'Faroese Króna',
      GBP: 'British Pound',
      GEL: 'Georgian Lari',
      GGP: 'Guernsey Pound',
      GHS: 'Ghanaian Cedi',
      GIP: 'Gibraltar Pound',
      GMD: 'Gambian Dalasi',
      GNF: 'Guinean Franc',
      GTQ: 'Guatemalan Quetzal',
      GYD: 'Guyanese Dollar',
      HKD: 'Hong Kong Dollar',
      HNL: 'Honduran Lempira',
      HRK: 'Croatian Kuna',
      HTG: 'Haitian Gourde',
      HUF: 'Hungarian Forint',
      IDR: 'Indonesian Rupiah',
      ILS: 'Israeli Shekel',
      IMP: 'Isle of Man Pound',
      INR: 'Indian Rupee',
      IQD: 'Iraqi Dinar',
      IRR: 'Iranian Rial',
      ISK: 'Icelandic Króna',
      JEP: 'Jersey Pound',
      JMD: 'Jamaican Dollar',
      JOD: 'Jordanian Dinar',
      JPY: 'Japanese Yen',
      KES: 'Kenyan Shilling',
      KGS: 'Kyrgyzstani Som',
      KHR: 'Cambodian Riel',
      KID: 'Kiribati Dollar',
      KMF: 'Comorian Franc',
      KRW: 'South Korean Won',
      KWD: 'Kuwaiti Dinar',
      KYD: 'Cayman Islands Dollar',
      KZT: 'Kazakhstani Tenge',
      LAK: 'Lao Kip',
      LBP: 'Lebanese Pound',
      LKR: 'Sri Lankan Rupee',
      LRD: 'Liberian Dollar',
      LSL: 'Lesotho Loti',
      LYD: 'Libyan Dinar',
      MAD: 'Moroccan Dirham',
      MDL: 'Moldovan Leu',
      MGA: 'Malagasy Ariary',
      MKD: 'Macedonian Denar',
      MMK: 'Myanmar Kyat',
      MNT: 'Mongolian Tögrög',
      MOP: 'Macanese Pataca',
      MRU: 'Mauritanian Ouguiya',
      MUR: 'Mauritian Rupee',
      MVR: 'Maldivian Rufiyaa',
      MWK: 'Malawian Kwacha',
      MXN: 'Mexican Peso',
      MYR: 'Malaysian Ringgit',
      MZN: 'Mozambican Metical',
      NAD: 'Namibian Dollar',
      NGN: 'Nigerian Naira',
      NIO: 'Nicaraguan Córdoba',
      NOK: 'Norwegian Krone',
      NPR: 'Nepalese Rupee',
      NZD: 'New Zealand Dollar',
      OMR: 'Omani Rial',
      PAB: 'Panamanian Balboa',
      PEN: 'Peruvian Sol',
      PGK: 'Papua New Guinean Kina',
      PHP: 'Philippine Peso',
      PKR: 'Pakistani Rupee',
      PLN: 'Polish Zloty',
      PYG: 'Paraguayan Guaraní',
      QAR: 'Qatari Riyal',
      RON: 'Romanian Leu',
      RSD: 'Serbian Dinar',
      RUB: 'Russian Ruble',
      RWF: 'Rwandan Franc',
      SAR: 'Saudi Riyal',
      SBD: 'Solomon Islands Dollar',
      SCR: 'Seychellois Rupee',
      SDG: 'Sudanese Pound',
      SEK: 'Swedish Krona',
      SGD: 'Singapore Dollar',
      SHP: 'Saint Helena Pound',
      SLE: 'Sierra Leonean Leone',
      SLL: 'Sierra Leonean Leone',
      SOS: 'Somali Shilling',
      SRD: 'Surinamese Dollar',
      SSP: 'South Sudanese Pound',
      STN: 'São Tomé and Príncipe Dobra',
      SYP: 'Syrian Pound',
      SZL: 'Swazi Lilangeni',
      THB: 'Thai Baht',
      TJS: 'Tajikistani Somoni',
      TMT: 'Turkmenistani Manat',
      TND: 'Tunisian Dinar',
      TOP: 'Tongan Paʻanga',
      TRY: 'Turkish Lira',
      TTD: 'Trinidad and Tobago Dollar',
      TVD: 'Tuvaluan Dollar',
      TWD: 'New Taiwan Dollar',
      TZS: 'Tanzanian Shilling',
      UAH: 'Ukrainian Hryvnia',
      UGX: 'Ugandan Shilling',
      UYU: 'Uruguayan Peso',
      UZS: 'Uzbekistani Som',
      VES: 'Venezuelan Bolívar',
      VND: 'Vietnamese Dong',
      VUV: 'Vanuatu Vatu',
      WST: 'Samoan Tālā',
      XAF: 'Central African CFA Franc',
      XCD: 'East Caribbean Dollar',
      XCG: 'Caribbean Guilder',
      XDR: 'Special Drawing Rights',
      XOF: 'West African CFA Franc',
      XPF: 'CFP Franc',
      YER: 'Yemeni Rial',
      ZAR: 'South African Rand',
      ZMW: 'Zambian Kwacha',
      ZWG: 'Zimbabwean Gold',
      ZWL: 'Zimbabwean Dollar'
    },
    units: {
      meter: 'Meter (m)',
      kilometer: 'Kilometer (km)',
      centimeter: 'Centimeter (cm)',
      mile: 'Mile (mi)',
      yard: 'Yard (yd)',
      foot: 'Foot (ft)',
      inch: 'Inch (in)',
      kilogram: 'Kilogram (kg)',
      gram: 'Gram (g)',
      pound: 'Pound (lb)',
      ounce: 'Ounce (oz)',
      celsius: 'Celsius (\u00B0C)',
      fahrenheit: 'Fahrenheit (\u00B0F)',
      kelvin: 'Kelvin (K)',
      mps: 'm/s',
      kph: 'km/h',
      mph: 'mph',
      knot: 'Knot',
      liter: 'Liter (L)',
      milliliter: 'Milliliter (mL)',
      gallon_us: 'Gallon (US)',
      gallon_uk: 'Gallon (UK)',
      cubic_meter: 'Cubic meter (m³)',
      cubic_foot: 'Cubic foot (ft³)',
      cup: 'Cup',
      tablespoon: 'Tablespoon (tbsp)',
      teaspoon: 'Teaspoon (tsp)',
      square_meter: 'Square meter (m²)',
      square_kilometer: 'Square kilometer (km²)',
      square_mile: 'Square mile (mi²)',
      acre: 'Acre',
      square_foot: 'Square foot (ft²)',
      square_inch: 'Square inch (in²)',
      hectare: 'Hectare (ha)',
      second: 'Second (s)',
      minute: 'Minute (min)',
      hour: 'Hour (h)',
      day: 'Day (d)',
      week: 'Week (wk)',
      month: 'Month (mo)',
      year: 'Year (yr)',
      joule: 'Joule (J)',
      kilojoule: 'Kilojoule (kJ)',
      calorie: 'Calorie (cal)',
      kilocalorie: 'Kilocalorie (kcal)',
      watt_hour: 'Watt-hour (Wh)',
      kilowatt_hour: 'Kilowatt-hour (kWh)',
      btu: 'BTU',
      foot_pound: 'Foot-pound (ft·lb)',
      pascal: 'Pascal (Pa)',
      kilopascal: 'Kilopascal (kPa)',
      bar: 'Bar',
      millibar: 'Millibar (mbar)',
      psi: 'PSI',
      atmosphere: 'Atmosphere (atm)',
      byte: 'Byte (B)',
      kilobyte: 'Kilobyte (KB)',
      megabyte: 'Megabyte (MB)',
      gigabyte: 'Gigabyte (GB)',
      terabyte: 'Terabyte (TB)',
      petabyte: 'Petabyte (PB)',
      fluid_ounce: 'Fluid ounce (fl oz)',
      stick_butter: 'Stick of butter',
      pinch: 'Pinch',
      dash: 'Dash',
      kibibyte: 'Kibibyte (KiB)',
      mebibyte: 'Mebibyte (MiB)',
      gibibyte: 'Gibibyte (GiB)',
      tebibyte: 'Tebibyte (TiB)',
      pebibyte: 'Pebibyte (PiB)'
    }
  },
  zh: {
    headerText: '\u8F6C\u6362',
    headerAccent: '\u5668',
    tagline: '\u8D27\u5E01\u4E0E\u5355\u4F4D',
    tabCurrency: '\uD83D\uDCB1 \u8D27\u5E01',
    tabUnits: '\uD83D\uDCD0 \u5355\u4F4D',
    tabHistory: '\uD83D\uDCCB \u5386\u53F2\u8BB0\u5F55',
    tabCrypto: '\uD83D\uDE09 \u52A0\u5BC6\u8D27\u5E01',
    swapCrypto: '\u4EA4\u6362',
    cryptoLoading: '\u6B63\u5728\u52A0\u8F7D\u52A0\u5BC6\u8D27\u5E01\u4EF7\u683C\u2026',
    cryptoUpdated: '\u4EF7\u683C\u5DF2\u66F4\u65B0',
    cryptoOffline: '\u52A0\u5BC6\u8D27\u5E01\u4EF7\u683C\u79BB\u7EBF',
    favEmpty: '\u2606 \u6536\u85CF',
    historyEmpty: '\u6682\u65E0\u8BB0\u5F55',
    clearHistory: '\u6E05\u7A7A\u8BB0\u5F55',
    labelAmount: '\u91D1\u989D',
    labelTo: '\u5230',
    swapCurrencies: '\u4EA4\u6362\u8D27\u5E01',
    swapUnits: '\u4EA4\u6362\u5355\u4F4D',
    statusDefault: '\u6B63\u5728\u83B7\u53D6\u6C47\u7387\u2026',
    resultCurrency: '\u9009\u62E9\u8D27\u5E01',
    resultUnits: '\u9009\u62E9\u5355\u4F4D',
    searchPlaceholder: '\u641C\u7D22\u8D27\u5E01\u2026',
    noResults: '\u65E0\u7ED3\u679C',
    statusOffline: '\u79BB\u7EBF \u2014 \u4F7F\u7528\u5907\u7528\u6C47\u7387',
    statusUpdated: '\u6C47\u7387\u5DF2\u66F4\u65B0: ',
    settingsLanguage: '\u8BED\u8A00',
    settingsPrecision: '\u7CBE\u5EA6',
    settingsTheme: '\u4E3B\u9898',
    copiedText: '\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F\uFF01',
    refreshRates: '\u21BB \u5237\u65B0',
    refreshing: '\u5237\u65B0\u4E2D...',
    categories: {
      length: '\u957F\u5EA6',
      mass: '\u8D28\u91CF',
      temperature: '\u6E29\u5EA6',
      speed: '\u901F\u5EA6',
      volume: '\u4F53\u79EF',
      area: '\u9762\u79EF',
      time: '\u65F6\u95F4',
      energy: '\u80FD\u91CF',
      pressure: '\u538B\u529B',
      data: '\u6570\u636E\u5B58\u50A8',
      cooking: '\u70F9\u996A',
      binary_data: '\u4E8C\u8FDB\u5236\u6570\u636E'
    },
    currencyNames: {
      USD: '美元',
      AED: '阿联酋迪拉姆',
      AFN: '阿富汗尼',
      ALL: '阿尔巴尼亚列克',
      AMD: '亚美尼亚德拉姆',
      ANG: '荷属安的列斯盾',
      AOA: '安哥拉宽扎',
      ARS: '阿根廷比索',
      AUD: '澳大利亚元',
      AWG: '阿鲁巴弗罗林',
      AZN: '阿塞拜疆马纳特',
      BAM: '波斯尼亚马克',
      BBD: '巴巴多斯元',
      BDT: '孟加拉塔卡',
      BGN: '保加利亚列弗',
      BHD: '巴林第纳尔',
      BIF: '布隆迪法郎',
      BMD: '百慕大元',
      BND: '文莱元',
      BOB: '玻利维亚诺',
      BRL: '巴西雷亚尔',
      BSD: '巴哈马元',
      BTN: '不丹努尔特鲁姆',
      BWP: '博茨瓦纳普拉',
      BYN: '白俄罗斯卢布',
      BZD: '伯利兹元',
      CAD: '加拿大元',
      CDF: '刚果法郎',
      CHF: '瑞士法郎',
      CLF: '智利比索(UF)',
      CLP: '智利比索',
      CNH: '离岸人民币',
      CNY: '人民币',
      COP: '哥伦比亚比索',
      CRC: '哥斯达黎加科朗',
      CUP: '古巴比索',
      CVE: '佛得角埃斯库多',
      CZK: '捷克克朗',
      DJF: '吉布提法郎',
      DKK: '丹麦克朗',
      DOP: '多米尼加比索',
      DZD: '阿尔及利亚第纳尔',
      EGP: '埃及磅',
      ERN: '厄立特里亚纳克法',
      ETB: '埃塞俄比亚比尔',
      EUR: '欧元',
      FJD: '斐济元',
      FKP: '福克兰磅',
      FOK: '法罗克朗',
      GBP: '英磅',
      GEL: '格鲁吉亚拉里',
      GGP: '根西磅',
      GHS: '加纳塞地',
      GIP: '直布罗陀磅',
      GMD: '冈比亚达拉西',
      GNF: '几内亚法郎',
      GTQ: '危地马拉格查尔',
      GYD: '圭亚那元',
      HKD: '港元',
      HNL: '洪都拉斯伦皮拉',
      HRK: '克罗地亚库纳',
      HTG: '海地古德',
      HUF: '匈牙利福林',
      IDR: '印尼盾',
      ILS: '以色列谢克尔',
      IMP: '马恩岛磅',
      INR: '印度卢比',
      IQD: '伊拉克第纳尔',
      IRR: '伊朗里亚尔',
      ISK: '冰岛克朗',
      JEP: '泽西磅',
      JMD: '牙买加元',
      JOD: '约旦第纳尔',
      JPY: '日元',
      KES: '肯尼亚先令',
      KGS: '吉尔吉斯斯坦索姆',
      KHR: '柬埔寨瑞尔',
      KID: '基里巴斯元',
      KMF: '科摩罗法郎',
      KRW: '韩元',
      KWD: '科威特第纳尔',
      KYD: '开曼群岛元',
      KZT: '哈萨克斯坦坚戈',
      LAK: '老挝基普',
      LBP: '黎巴嫩磅',
      LKR: '斯里兰卡卢比',
      LRD: '利比里亚元',
      LSL: '莱索托洛蒂',
      LYD: '利比亚第纳尔',
      MAD: '摩洛哥迪拉姆',
      MDL: '摩尔多瓦列伊',
      MGA: '马达加斯加阿里亚里',
      MKD: '马其顿第纳尔',
      MMK: '缅甸元',
      MNT: '蒙古图格里克',
      MOP: '澳门元',
      MRU: '毛里塔尼亚乌吉亚',
      MUR: '毛里求斯卢比',
      MVR: '马尔代夫拉菲亚',
      MWK: '马拉维克瓦查',
      MXN: '墨西哥比索',
      MYR: '马来西亚林吉特',
      MZN: '莫桑比克梅蒂卡尔',
      NAD: '纳米比亚元',
      NGN: '尼日利亚奈拉',
      NIO: '尼加拉瓜科多巴',
      NOK: '挪威克朗',
      NPR: '尼泊尔卢比',
      NZD: '新西兰元',
      OMR: '阿曼里亚尔',
      PAB: '巴拿马巴波亚',
      PEN: '秘鲁索尔',
      PGK: '巴布亚新几内亚基纳',
      PHP: '菲律宾比索',
      PKR: '巴基斯坦卢比',
      PLN: '波兰兹罗提',
      PYG: '巴拉圭瓜拉尼',
      QAR: '卡塔尔里亚尔',
      RON: '罗马尼亚列伊',
      RSD: '塞尔维亚第纳尔',
      RUB: '俄罗斯卢布',
      RWF: '卢旺达法郎',
      SAR: '沙特里亚尔',
      SBD: '所罗门群岛元',
      SCR: '塞舌尔卢比',
      SDG: '苏丹磅',
      SEK: '瑞典克朗',
      SGD: '新加坡元',
      SHP: '圣赫勒拿磅',
      SLE: '塞拉利昂利昂',
      SLL: '塞拉利昂利昂',
      SOS: '索马里先令',
      SRD: '苏里南元',
      SSP: '南苏丹磅',
      STN: '圣多美多布拉',
      SYP: '叙利亚磅',
      SZL: '斯威士兰里兰吉尼',
      THB: '泰铢',
      TJS: '塔吉克斯坦索莫尼',
      TMT: '土库曼斯坦马纳特',
      TND: '突尼斯第纳尔',
      TOP: '汤加潘加',
      TRY: '土耳其里拉',
      TTD: '特立尼达和多巴哥元',
      TVD: '图瓦卢元',
      TWD: '新台币',
      TZS: '坦桑尼亚先令',
      UAH: '乌克兰格里夫纳',
      UGX: '乌干达先令',
      UYU: '乌拉圭比索',
      UZS: '乌兹别克斯坦索姆',
      VES: '委内瑞拉玻利瓦尔',
      VND: '越南盾',
      VUV: '瓦努阿图瓦图',
      WST: '萨摩亚塔拉',
      XAF: '中非法郎',
      XCD: '东加勒比元',
      XCG: '加勒比盾',
      XDR: '特别提款权',
      XOF: '西非法郎',
      XPF: '太平洋法郎',
      YER: '也门里亚尔',
      ZAR: '南非兰特',
      ZMW: '赞比亚克瓦查',
      ZWG: '津巴布韦金',
      ZWL: '津巴布韦元'
    },
    units: {
      meter: '\u7C73 (m)',
      kilometer: '\u5343\u7C73 (km)',
      centimeter: '\u5398\u7C73 (cm)',
      mile: '\u82F1\u91CC (mi)',
      yard: '\u7801 (yd)',
      foot: '\u82F1\u5C3A (ft)',
      inch: '\u82F1\u5BF8 (in)',
      kilogram: '\u5343\u514B (kg)',
      gram: '\u514B (g)',
      pound: '\u78C5 (lb)',
      ounce: '\u76CE\u53F8 (oz)',
      celsius: '\u6444\u6C0F (\u00B0C)',
      fahrenheit: '\u534E\u6C0F (\u00B0F)',
      kelvin: '\u5F00\u5C14\u6587 (K)',
      mps: '\u7C73/\u79D2',
      kph: '\u516C\u91CC/\u5C0F\u65F6',
      mph: '\u82F1\u91CC/\u5C0F\u65F6',
      knot: '\u8282',
      liter: '\u5347 (L)',
      milliliter: '\u6BEB\u5347 (mL)',
      gallon_us: '\u7F8E\u5236\u52A0\u4ED1',
      gallon_uk: '\u82F1\u5236\u52A0\u4ED1',
      cubic_meter: '\u7ACB\u65B9\u7C73 (m\u00B3)',
      cubic_foot: '\u7ACB\u65B9\u82F1\u5C3A (ft\u00B3)',
      cup: '\u676F',
      tablespoon: '\u6C64\u5319 (tbsp)',
      teaspoon: '\u8336\u5319 (tsp)',
      square_meter: '\u5E73\u65B9\u7C73 (m\u00B2)',
      square_kilometer: '\u5E73\u65B9\u516C\u91CC (km\u00B2)',
      square_mile: '\u5E73\u65B9\u82F1\u91CC (mi\u00B2)',
      acre: '\u82F1\u4EA9',
      square_foot: '\u5E73\u65B9\u82F1\u5C3A (ft\u00B2)',
      square_inch: '\u5E73\u65B9\u82F1\u5BF8 (in\u00B2)',
      hectare: '\u516C\u9877 (ha)',
      second: '\u79D2 (s)',
      minute: '\u5206 (min)',
      hour: '\u65F6 (h)',
      day: '\u5929 (d)',
      week: '\u5468 (wk)',
      month: '\u6708 (mo)',
      year: '\u5E74 (yr)',
      joule: '\u7126\u8033 (J)',
      kilojoule: '\u5343\u7126 (kJ)',
      calorie: '\u5361\u8DEF\u91CC (cal)',
      kilocalorie: '\u5343\u5361 (kcal)',
      watt_hour: '\u74E6\u65F6 (Wh)',
      kilowatt_hour: '\u5343\u74E6\u65F6 (kWh)',
      btu: 'BTU',
      foot_pound: '\u82F1\u5C3A\u78C5 (ft\u00B7lb)',
      pascal: '\u5E15\u65AF\u5361 (Pa)',
      kilopascal: '\u5343\u5E15 (kPa)',
      bar: '\u5DF4',
      millibar: '\u6BEB\u5DF4 (mbar)',
      psi: 'PSI',
      atmosphere: '\u6807\u51C6\u5927\u6C14\u538B (atm)',
      byte: '\u5B57\u8282 (B)',
      kilobyte: '\u5343\u5B57\u8282 (KB)',
      megabyte: '\u5146\u5B57\u8282 (MB)',
      gigabyte: '\u5409\u5B57\u8282 (GB)',
      terabyte: '\u592A\u5B57\u8282 (TB)',
      petabyte: '\u62CD\u5B57\u8282 (PB)',
      fluid_ounce: '\u6DB2\u91CF\u76CE\u53F8 (fl oz)',
      stick_butter: '\u9EC4\u6CB9\u68D2',
      pinch: '\u4E00\u5C0F\u64AE',
      dash: '\u4E00\u64AE',
      kibibyte: '\u5343\u5B57\u8282\uFF08\u4E8C\u8FDB\u5236\uFF09(KiB)',
      mebibyte: '\u5146\u5B57\u8282\uFF08\u4E8C\u8FDB\u5236\uFF09(MiB)',
      gibibyte: '\u5409\u5B57\u8282\uFF08\u4E8C\u8FDB\u5236\uFF09(GiB)',
      tebibyte: '\u592A\u5B57\u8282\uFF08\u4E8C\u8FDB\u5236\uFF09(TiB)',
      pebibyte: '\u62CD\u5B57\u8282\uFF08\u4E8C\u8FDB\u5236\uFF09(PiB)'
    }
  },
  ar: {
    headerText: '\u0645\u062D',
    headerAccent: '\u0648\u0651\u0644',
    tagline: '\u0639\u0645\u0644\u0627\u062A \u0648\u0648\u062D\u062F\u0627\u062A',
    tabCurrency: '\uD83D\uDCB1 \u0639\u0645\u0644\u0627\u062A',
    tabUnits: '\uD83D\uDCD0 \u0648\u062D\u062F\u0627\u062A',
    tabHistory: '\uD83D\uDCCB \u0627\u0644\u0633\u062C\u0644',
    tabCrypto: '\uD83D\uDE09 \u0639\u0645\u0644\u0627\u062A \u0631\u0642\u0645\u064A\u0629',
    swapCrypto: '\u062A\u0628\u062F\u064A\u0644',
    cryptoLoading: '\u062C\u0627\u0631\u064D \u062A\u062D\u0645\u064A\u0644 \u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u062A \u0627\u0644\u0631\u0642\u0645\u064A\u0629\u2026',
    cryptoUpdated: '\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0623\u0633\u0639\u0627\u0631',
    cryptoOffline: '\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u062A \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u063A\u064A\u0631 \u0645\u062A\u0635\u0644\u0629',
    favEmpty: '\u2606 \u0627\u0644\u0645\u0641\u0636\u0644\u0629',
    historyEmpty: '\u0644\u0627 \u064A\u0648\u062C\u062F \u0633\u062C\u0644 \u0628\u0639\u062F',
    clearHistory: '\u0645\u0633\u062D \u0627\u0644\u0633\u062C\u0644',
    labelAmount: '\u0627\u0644\u0645\u0628\u0644\u063A',
    labelTo: '\u0625\u0644\u0649',
    swapCurrencies: '\u062A\u0628\u062F\u064A\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u062A',
    swapUnits: '\u062A\u0628\u062F\u064A\u0644 \u0627\u0644\u0648\u062D\u062F\u0627\u062A',
    statusDefault: '\u062C\u0627\u0631\u064D \u062C\u0644\u0628 \u0627\u0644\u0623\u0633\u0639\u0627\u0631\u2026',
    resultCurrency: '\u0627\u062E\u062A\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u062A',
    resultUnits: '\u0627\u062E\u062A\u0631 \u0627\u0644\u0648\u062D\u062F\u0627\u062A',
    searchPlaceholder: '\u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0639\u0645\u0644\u0629\u2026',
    noResults: '\u0644\u0627 \u0646\u062A\u0627\u0626\u062C',
    statusOffline: '\u063A\u064A\u0631 \u0645\u062A\u0635\u0644 \u2014 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0623\u0633\u0639\u0627\u0631 \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629',
    statusUpdated: '\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0623\u0633\u0639\u0627\u0631: ',
    settingsLanguage: '\u0627\u0644\u0644\u063A\u0629',
    settingsPrecision: '\u0627\u0644\u062F\u0642\u0629',
    settingsTheme: '\u0627\u0644\u0645\u0638\u0647\u0631',
    copiedText: '\u062A\u0645 \u0627\u0644\u0646\u0633\u062E \u0625\u0644\u0649 \u0627\u0644\u062D\u0627\u0641\u0638\u0629!',
    refreshRates: '\u21BB \u062A\u062D\u062F\u064A\u062B',
    refreshing: '\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u062F\u064A\u062B...',
    categories: {
      length: '\u0637\u0648\u0644',
      mass: '\u0643\u062A\u0644\u0629',
      temperature: '\u062D\u0631\u0627\u0631\u0629',
      speed: '\u0633\u0631\u0639\u0629',
      volume: '\u062D\u062C\u0645',
      area: '\u0645\u0633\u0627\u062D\u0629',
      time: '\u0648\u0642\u062A',
      energy: '\u0637\u0627\u0642\u0629',
      pressure: '\u0636\u063A\u0637',
      data: '\u062A\u062E\u0632\u064A\u0646 \u0628\u064A\u0627\u0646\u0627\u062A',
      cooking: '\u0637\u0628\u062E',
      binary_data: '\u0628\u064A\u0627\u0646\u0627\u062A \u062B\u0646\u0627\u0626\u064A\u0629'
    },
    currencyNames: {
      USD: 'دولار أمريكي',
      AED: 'درهم إماراتي',
      AFN: 'أفغاني أفغاني',
      ALL: 'ليك ألباني',
      AMD: 'درام أرميني',
      ANG: 'غيلدر أنتيلي',
      AOA: 'كوانزا أنغولي',
      ARS: 'بيزو أرجنتيني',
      AUD: 'دولار أسترالي',
      AWG: 'فلورين أروبي',
      AZN: 'مانات أذربيجاني',
      BAM: 'مارك بوسني',
      BBD: 'دولار باربادوسي',
      BDT: 'تاكا بنغلاديشي',
      BGN: 'ليف بلغاري',
      BHD: 'دينار بحريني',
      BIF: 'فرنك بوروندي',
      BMD: 'دولار برمودي',
      BND: 'دولار بروني',
      BOB: 'بوليفيانو بوليفي',
      BRL: 'ريال برازيلي',
      BSD: 'دولار بهامي',
      BTN: 'نغولترم بوتاني',
      BWP: 'بولا بوتسواني',
      BYN: 'روبل بيلاروسي',
      BZD: 'دولار بليزي',
      CAD: 'دولار كندي',
      CDF: 'فرنك كونغولي',
      CHF: 'فرنك سويسري',
      CLF: 'وحدة حساب تشيلية',
      CLP: 'بيزو تشيلي',
      CNH: 'يوان صيني (خارجي)',
      CNY: 'يوان صيني',
      COP: 'بيزو كولومبي',
      CRC: 'كولون كوستاريكي',
      CUP: 'بيزو كوبي',
      CVE: 'إسكودو رأس الأخضر',
      CZK: 'كرونة تشيكية',
      DJF: 'فرنك جيبوتي',
      DKK: 'كرونة دنماركية',
      DOP: 'بيزو دومينيكاني',
      DZD: 'دينار جزائري',
      EGP: 'جنيه مصري',
      ERN: 'ناكفا إريتري',
      ETB: 'بير إثيوبي',
      EUR: 'يورو',
      FJD: 'دولار فيجي',
      FKP: 'جنيه جزر فوكلاند',
      FOK: 'كرونة فاروية',
      GBP: 'جنيه إسترليني',
      GEL: 'لاري جورجي',
      GGP: 'جنيه غيرنزي',
      GHS: 'سيدي غاني',
      GIP: 'جنيه جبل طارق',
      GMD: 'دالاسي غامبي',
      GNF: 'فرنك غيني',
      GTQ: 'كتزال غواتيمالي',
      GYD: 'دولار غياني',
      HKD: 'دولار هونغ كونغ',
      HNL: 'ليمبيرا هندوراسي',
      HRK: 'كونا كرواتي',
      HTG: 'جورد هايتي',
      HUF: 'فورنت هنغاري',
      IDR: 'روبية إندونيسية',
      ILS: 'شيكل إسرائيلي',
      IMP: 'جنيه جزيرة مان',
      INR: 'روبية هندية',
      IQD: 'دينار عراقي',
      IRR: 'ريال إيراني',
      ISK: 'كرونة آيسلندية',
      JEP: 'جنيه جيرزي',
      JMD: 'دولار جامايكي',
      JOD: 'دينار أردني',
      JPY: 'ين ياباني',
      KES: 'شيلينغ كيني',
      KGS: 'سوم قيرغيزستاني',
      KHR: 'رييل كمبودي',
      KID: 'دولار كيريباتي',
      KMF: 'فرنك قمري',
      KRW: 'وون كوري',
      KWD: 'دينار كويتي',
      KYD: 'دولار جزر كايمان',
      KZT: 'تينغ كازاخستاني',
      LAK: 'كيب لاوسي',
      LBP: 'ليرة لبنانية',
      LKR: 'روبية سريلانكية',
      LRD: 'دولار ليبيري',
      LSL: 'لوتي ليسوتو',
      LYD: 'دينار ليبي',
      MAD: 'درهم مغربي',
      MDL: 'ليو مولدوفي',
      MGA: 'أرياري مدغشقري',
      MKD: 'دينار مقدوني',
      MMK: 'كيات ميانماري',
      MNT: 'توغروغ منغولي',
      MOP: 'باتاكا ماكاوية',
      MRU: 'أوقية موريتانية',
      MUR: 'روبية موريشيوسية',
      MVR: 'روفيه مالديفي',
      MWK: 'كواشا ملاوية',
      MXN: 'بيزو مكسيكي',
      MYR: 'رينغيت ماليزي',
      MZN: 'متكال موزمبيقي',
      NAD: 'دولار ناميبي',
      NGN: 'نيرة نيجيرية',
      NIO: 'كوردوبا نيكاراغوي',
      NOK: 'كرونة نرويجية',
      NPR: 'روبية نيبالية',
      NZD: 'دولار نيوزيلندي',
      OMR: 'ريال عماني',
      PAB: 'بالبوا بنمي',
      PEN: 'سول بيروفي',
      PGK: 'كينا بابوا غينيا الجديدة',
      PHP: 'بيزو فلبيني',
      PKR: 'روبية باكستانية',
      PLN: 'زلوتي بولندي',
      PYG: 'غواراني باراغواي',
      QAR: 'ريال قطري',
      RON: 'ليو روماني',
      RSD: 'دينار صربي',
      RUB: 'روبل روسي',
      RWF: 'فرنك رواندي',
      SAR: 'ريال سعودي',
      SBD: 'دولار جزر سليمان',
      SCR: 'روبية سيشلية',
      SDG: 'جنيه سوداني',
      SEK: 'كرونة سويدية',
      SGD: 'دولار سنغافوري',
      SHP: 'جنيه سانت هيلينا',
      SLE: 'ليون سيراليوني',
      SLL: 'ليون سيراليوني',
      SOS: 'شيلينغ صومالي',
      SRD: 'دولار سورينامي',
      SSP: 'جنيه جنوب السودان',
      STN: 'دوبرا ساو تومي',
      SYP: 'ليرة سورية',
      SZL: 'ليلانجيني سوازيلندي',
      THB: 'بات تايلندي',
      TJS: 'سوموني طاجيكستاني',
      TMT: 'مانات تركمانستاني',
      TND: 'دينار تونسي',
      TOP: 'بانغا تونغي',
      TRY: 'ليرة تركية',
      TTD: 'دولار ترينيداد وتوباغو',
      TVD: 'دولار توفالو',
      TWD: 'دولار تايواني',
      TZS: 'شيلينغ تنزاني',
      UAH: 'هريفنا أوكراني',
      UGX: 'شيلينغ أوغندي',
      UYU: 'بيزو أوروغواياني',
      UZS: 'سوم أوزباكستاني',
      VES: 'بوليفار فنزويلي',
      VND: 'دونغ فيتنامي',
      VUV: 'فاتو فانواتو',
      WST: 'تالا ساموي',
      XAF: 'فرنك وسط أفريقي',
      XCD: 'دولار شرق الكاريبي',
      XCG: 'خيلدر كاريبي',
      XDR: 'حقوق السحب الخاصة',
      XOF: 'فرنك غرب أفريقي',
      XPF: 'فرنك سي إف بي',
      YER: 'ريال يمني',
      ZAR: 'راند جنوب أفريقي',
      ZMW: 'كواشا زامبي',
      ZWG: 'ذهب زيمبابوي',
      ZWL: 'دولار زيمبابوي'
    },
    units: {
      meter: '\u0645\u062A\u0631 (m)',
      kilometer: '\u0643\u064A\u0644\u0648\u0645\u062A\u0631 (km)',
      centimeter: '\u0633\u0646\u062A\u064A\u0645\u062A\u0631 (cm)',
      mile: '\u0645\u064A\u0644 (mi)',
      yard: '\u064A\u0627\u0631\u062F (yd)',
      foot: '\u0642\u062F\u0645 (ft)',
      inch: '\u0628\u0648\u0635\u0629 (in)',
      kilogram: '\u0643\u064A\u0644\u0648\u063A\u0631\u0627\u0645 (kg)',
      gram: '\u063A\u0631\u0627\u0645 (g)',
      pound: '\u0631\u0637\u0644 (lb)',
      ounce: '\u0623\u0648\u0646\u0635\u0629 (oz)',
      celsius: '\u0633\u064A\u0644\u0633\u064A\u0648\u0633 (\u00B0C)',
      fahrenheit: '\u0641\u0647\u0631\u0646\u0647\u0627\u064A\u062A (\u00B0F)',
      kelvin: '\u0643\u0644\u0641\u0646 (K)',
      mps: '\u0645/\u062B',
      kph: '\u0643\u0645/\u0633',
      mph: '\u0645\u064A\u0644/\u0633',
      knot: '\u0639\u0642\u062F\u0629',
      liter: '\u0644\u062A\u0631 (L)',
      milliliter: '\u0645\u0644\u0644\u064A\u062A\u0631 (mL)',
      gallon_us: '\u062C\u0627\u0644\u0648\u0646 (US)',
      gallon_uk: '\u062C\u0627\u0644\u0648\u0646 (UK)',
      cubic_meter: '\u0645\u062A\u0631 \u0645\u0643\u0639\u0628 (m\u00B3)',
      cubic_foot: '\u0642\u062F\u0645 \u0645\u0643\u0639\u0628 (ft\u00B3)',
      cup: '\u0643\u064E\u0648\u0628',
      tablespoon: '\u0645\u0644\u0639\u0642\u0629 \u0637\u0639\u0627\u0645 (tbsp)',
      teaspoon: '\u0645\u0644\u0639\u0642\u0629 \u0634\u0627\u064A (tsp)',
      square_meter: '\u0645\u062A\u0631 \u0645\u0631\u0628\u0639 (m\u00B2)',
      square_kilometer: '\u0643\u064A\u0644\u0648\u0645\u062A\u0631 \u0645\u0631\u0628\u0639 (km\u00B2)',
      square_mile: '\u0645\u064A\u0644 \u0645\u0631\u0628\u0639 (mi\u00B2)',
      acre: '\u0641\u062F\u0627\u0646',
      square_foot: '\u0642\u062F\u0645 \u0645\u0631\u0628\u0639 (ft\u00B2)',
      square_inch: '\u0628\u0648\u0635\u0629 \u0645\u0631\u0628\u0639\u0629 (in\u00B2)',
      hectare: '\u0647\u0643\u062A\u0627\u0631 (ha)',
      second: '\u062B\u0627\u0646\u064A\u0629 (s)',
      minute: '\u062F\u0642\u064A\u0642\u0629 (min)',
      hour: '\u0633\u0627\u0639\u0629 (h)',
      day: '\u064A\u0648\u0645 (d)',
      week: '\u0623\u0633\u0628\u0648\u0639 (wk)',
      month: '\u0634\u0647\u0631 (mo)',
      year: '\u0633\u0646\u0629 (yr)',
      joule: '\u062C\u0648\u0644 (J)',
      kilojoule: '\u0643\u064A\u0644\u0648\u062C\u0648\u0644 (kJ)',
      calorie: '\u0633\u0639\u0631\u0629 \u062D\u0631\u0627\u0631\u064A\u0629 (cal)',
      kilocalorie: '\u0643\u064A\u0644\u0648\u0633\u0639\u0631\u0629 (kcal)',
      watt_hour: '\u0648\u0627\u062A/\u0633\u0627\u0639\u0629 (Wh)',
      kilowatt_hour: '\u0643\u064A\u0644\u0648\u0648\u0627\u062A/\u0633\u0627\u0639\u0629 (kWh)',
      btu: 'BTU',
      foot_pound: '\u0642\u062F\u0645/\u0631\u0637\u0644 (ft\u00B7lb)',
      pascal: '\u0628\u0627\u0633\u0643\u0627\u0644 (Pa)',
      kilopascal: '\u0643\u064A\u0644\u0648\u0628\u0627\u0633\u0643\u0627\u0644 (kPa)',
      bar: '\u0628\u0627\u0631',
      millibar: '\u0645\u0644\u064A\u0628\u0627\u0631 (mbar)',
      psi: 'PSI',
      atmosphere: '\u0636\u063A\u0637 \u062C\u0648\u064A (atm)',
      byte: '\u0628\u0627\u064A\u062A (B)',
      kilobyte: '\u0643\u064A\u0644\u0648\u0628\u0627\u064A\u062A (KB)',
      megabyte: '\u0645\u064A\u062C\u0627\u0628\u0627\u064A\u062A (MB)',
      gigabyte: '\u062C\u064A\u062C\u0627\u0628\u0627\u064A\u062A (GB)',
      terabyte: '\u062A\u064A\u0631\u0627\u0628\u0627\u064A\u062A (TB)',
      petabyte: '\u0628\u064A\u062A\u0627\u0628\u0627\u064A\u062A (PB)',
      fluid_ounce: '\u0623\u0648\u0646\u0635\u0629 \u0633\u0627\u0626\u0644\u0629 (fl oz)',
      stick_butter: '\u0639\u0648\u062F \u0632\u0628\u062F\u0629',
      pinch: '\u0631\u0634\u0629',
      dash: '\u0646\u0642\u0631\u0629',
      kibibyte: '\u0643\u064A\u0628\u064A\u0628\u0627\u064A\u062A (KiB)',
      mebibyte: '\u0645\u064A\u0628\u064A\u0628\u0627\u064A\u062A (MiB)',
      gibibyte: '\u062C\u064A\u0628\u064A\u0628\u0627\u064A\u062A (GiB)',
      tebibyte: '\u062A\u064A\u0628\u064A\u0628\u0627\u064A\u062A (TiB)',
      pebibyte: '\u0628\u064A\u0628\u064A\u0628\u0627\u064A\u062A (PiB)'
    }
  },
  ru: {
    headerText: 'КОНВ',
    headerAccent: 'ЕРТ',
    tagline: 'Валюта и единицы',
    tabCurrency: '\uD83D\uDCB1 Валюта',
    tabUnits: '\uD83D\uDCD0 Единицы',
    tabHistory: '\uD83D\uDCCB История',
    tabCrypto: '\uD83D\uDE09 Крипто',
    swapCrypto: 'Поменять',
    cryptoLoading: 'Загрузка курсов криптовалют\u2026',
    cryptoUpdated: 'Курсы обновлены',
    cryptoOffline: 'Курсы криптовалют недоступны',
    favEmpty: '\u2606 Избранное',
    historyEmpty: 'История пуста',
    clearHistory: 'Очистить историю',
    labelAmount: 'Сумма',
    labelTo: 'В',
    swapCurrencies: 'Поменять валюты',
    swapUnits: 'Поменять единицы',
    statusDefault: 'Получение курсов\u2026',
    resultCurrency: 'Выберите валюты',
    resultUnits: 'Выберите единицы',
    searchPlaceholder: 'Поиск валюты\u2026',
    noResults: 'Нет результатов',
    statusOffline: 'Офлайн \u2014 используются резервные курсы.',
    statusUpdated: 'Курсы обновлены: ',
    settingsLanguage: 'Язык',
    settingsPrecision: 'Точность',
    settingsTheme: 'Тема',
    copiedText: 'Скопировано в буфер обмена!',
    refreshRates: '\u21BB Обновить',
    refreshing: 'Обновление...',
    categories: {
      length: 'Длина',
      mass: 'Масса',
      temperature: 'Температура',
      speed: 'Скорость',
      volume: 'Объём',
      area: 'Площадь',
      time: 'Время',
      energy: 'Энергия',
      pressure: 'Давление',
      data: 'Хранение данных',
      cooking: 'Кулинария',
      binary_data: 'Двоичные данные'
    },
    currencyNames: {
      USD: 'Доллар США',
      AED: 'Дирхам ОАЭ',
      AFN: 'Афганский афгани',
      ALL: 'Албанский лек',
      AMD: 'Армянский драм',
      ANG: 'Нидерландский антильский гульден',
      AOA: 'Ангольская кванза',
      ARS: 'Аргентинское песо',
      AUD: 'Австралийский доллар',
      AWG: 'Арубанский флорин',
      AZN: 'Азербайджанский манат',
      BAM: 'Конвертируемая марка Боснии и Герцеговины',
      BBD: 'Барбадосский доллар',
      BDT: 'Бангладешская така',
      BGN: 'Болгарский лев',
      BHD: 'Бахрейнский динар',
      BIF: 'Бурундийский франк',
      BMD: 'Бермудский доллар',
      BND: 'Брунейский доллар',
      BOB: 'Боливийский боливиано',
      BRL: 'Бразильский реал',
      BSD: 'Багамский доллар',
      BTN: 'Бутанский нгултрум',
      BWP: 'Ботсванская пула',
      BYN: 'Белорусский рубль',
      BZD: 'Белизский доллар',
      CAD: 'Канадский доллар',
      CDF: 'Конголезский франк',
      CHF: 'Швейцарский франк',
      CLF: 'Чилийская расчетная единица',
      CLP: 'Чилийское песо',
      CNH: 'Китайский юань (офшор)',
      CNY: 'Китайский юань',
      COP: 'Колумбийское песо',
      CRC: 'Коста-риканский колон',
      CUP: 'Кубинское песо',
      CVE: 'Эскудо Кабо-Верде',
      CZK: 'Чешская крона',
      DJF: 'Джибутийский франк',
      DKK: 'Датская крона',
      DOP: 'Доминиканское песо',
      DZD: 'Алжирский динар',
      EGP: 'Египетский фунт',
      ERN: 'Эритрейская накфа',
      ETB: 'Эфиопский быр',
      EUR: 'Евро',
      FJD: 'Фиджийский доллар',
      FKP: 'Фунт Фолклендских островов',
      FOK: 'Фарерская крона',
      GBP: 'Британский фунт',
      GEL: 'Грузинский лари',
      GGP: 'Фунт Гернси',
      GHS: 'Ганский седи',
      GIP: 'Гибралтарский фунт',
      GMD: 'Гамбийский даласи',
      GNF: 'Гвинейский франк',
      GTQ: 'Гватемальский кетсаль',
      GYD: 'Гайанский доллар',
      HKD: 'Гонконгский доллар',
      HNL: 'Гондурасская лемпира',
      HRK: 'Хорватская куна',
      HTG: 'Гаитянский гурд',
      HUF: 'Венгерский форинт',
      IDR: 'Индонезийская рупия',
      ILS: 'Израильский шекель',
      IMP: 'Фунт острова Мэн',
      INR: 'Индийская рупия',
      IQD: 'Иракский динар',
      IRR: 'Иранский риал',
      ISK: 'Исландская крона',
      JEP: 'Фунт Джерси',
      JMD: 'Ямайский доллар',
      JOD: 'Иорданский динар',
      JPY: 'Японская иена',
      KES: 'Кенийский шиллинг',
      KGS: 'Киргизский сом',
      KHR: 'Камбоджийский риель',
      KID: 'Доллар Кирибати',
      KMF: 'Коморский франк',
      KRW: 'Южнокорейская вона',
      KWD: 'Кувейтский динар',
      KYD: 'Доллар Каймановых островов',
      KZT: 'Казахстанский тенге',
      LAK: 'Лаосский кип',
      LBP: 'Ливанский фунт',
      LKR: 'Шри-ланкийская рупия',
      LRD: 'Либерийский доллар',
      LSL: 'Лоти Лесото',
      LYD: 'Ливийский динар',
      MAD: 'Марокканский дирхам',
      MDL: 'Молдавский лей',
      MGA: 'Малагасийский ариари',
      MKD: 'Македонский денар',
      MMK: 'Мьянманский кьят',
      MNT: 'Монгольский тугрик',
      MOP: 'Патака Макао',
      MRU: 'Мавританская угия',
      MUR: 'Маврикийская рупия',
      MVR: 'Мальдивская руфия',
      MWK: 'Малавийская квача',
      MXN: 'Мексиканское песо',
      MYR: 'Малайзийский ринггит',
      MZN: 'Мозамбикский метикал',
      NAD: 'Намибийский доллар',
      NGN: 'Нигерийская найра',
      NIO: 'Никарагуанская кордоба',
      NOK: 'Норвежская крона',
      NPR: 'Непальская рупия',
      NZD: 'Новозеландский доллар',
      OMR: 'Оманский риал',
      PAB: 'Панамский бальбоа',
      PEN: 'Перуанский соль',
      PGK: 'Кина Папуа-Новой Гвинеи',
      PHP: 'Филиппинское песо',
      PKR: 'Пакистанская рупия',
      PLN: 'Польский злотый',
      PYG: 'Парагвайский гуарани',
      QAR: 'Катарский риал',
      RON: 'Румынский лей',
      RSD: 'Сербский динар',
      RUB: 'Российский рубль',
      RWF: 'Руандийский франк',
      SAR: 'Саудовский риал',
      SBD: 'Доллар Соломоновых Островов',
      SCR: 'Сейшельская рупия',
      SDG: 'Суданский фунт',
      SEK: 'Шведская крона',
      SGD: 'Сингапурский доллар',
      SHP: 'Фунт Святой Елены',
      SLE: 'Леоне Сьерра-Леоне',
      SLL: 'Леоне Сьерра-Леоне',
      SOS: 'Сомалийский шиллинг',
      SRD: 'Суринамский доллар',
      SSP: 'Южносуданский фунт',
      STN: 'Добра Сан-Томе и Принсипи',
      SYP: 'Сирийский фунт',
      SZL: 'Свазилендский лилангени',
      THB: 'Тайский бат',
      TJS: 'Таджикский сомони',
      TMT: 'Туркменский манат',
      TND: 'Тунисский динар',
      TOP: 'Тонганская паанга',
      TRY: 'Турецкая лира',
      TTD: 'Доллар Тринидада и Тобаго',
      TVD: 'Доллар Тувалу',
      TWD: 'Новый тайваньский доллар',
      TZS: 'Танзанийский шиллинг',
      UAH: 'Украинская гривна',
      UGX: 'Угандийский шиллинг',
      UYU: 'Уругвайское песо',
      UZS: 'Узбекский сум',
      VES: 'Венесуэльский боливар',
      VND: 'Вьетнамский донг',
      VUV: 'Вануатский вату',
      WST: 'Самоанская тала',
      XAF: 'Центральноафриканский франк КФА',
      XCD: 'Восточно-карибский доллар',
      XCG: 'Карибский гульден',
      XDR: 'Специальные права заимствования',
      XOF: 'Западноафриканский франк КФА',
      XPF: 'Французский тихоокеанский франк',
      YER: 'Йеменский риал',
      ZAR: 'Южноафриканский рэнд',
      ZMW: 'Замбийская квача',
      ZWG: 'Зимбабвийское золото',
      ZWL: 'Зимбабвийский доллар'
    },
    units: {
      meter: 'Метр (m)',
      kilometer: 'Километр (km)',
      centimeter: 'Сантиметр (cm)',
      mile: 'Миля (mi)',
      yard: 'Ярд (yd)',
      foot: 'Фут (ft)',
      inch: 'Дюйм (in)',
      kilogram: 'Килограмм (kg)',
      gram: 'Грамм (g)',
      pound: 'Фунт (lb)',
      ounce: 'Унция (oz)',
      celsius: 'Цельсий (°C)',
      fahrenheit: 'Фаренгейт (°F)',
      kelvin: 'Кельвин (K)',
      mps: 'м/с',
      kph: 'км/ч',
      mph: 'миль/ч',
      knot: 'Узел',
      liter: 'Литр (L)',
      milliliter: 'Миллилитр (mL)',
      gallon_us: 'Галлон (US)',
      gallon_uk: 'Галлон (UK)',
      cubic_meter: 'Кубический метр (m³)',
      cubic_foot: 'Кубический фут (ft³)',
      cup: 'Чашка',
      tablespoon: 'Столовая ложка (tbsp)',
      teaspoon: 'Чайная ложка (tsp)',
      square_meter: 'Квадратный метр (m²)',
      square_kilometer: 'Квадратный километр (km²)',
      square_mile: 'Квадратная миля (mi²)',
      acre: 'Акр',
      square_foot: 'Квадратный фут (ft²)',
      square_inch: 'Квадратный дюйм (in²)',
      hectare: 'Гектар (ha)',
      second: 'Секунда (s)',
      minute: 'Минута (min)',
      hour: 'Час (h)',
      day: 'День (d)',
      week: 'Неделя (wk)',
      month: 'Месяц (mo)',
      year: 'Год (yr)',
      joule: 'Джоуль (J)',
      kilojoule: 'Килоджоуль (kJ)',
      calorie: 'Калория (cal)',
      kilocalorie: 'Килокалория (kcal)',
      watt_hour: 'Ватт-час (Wh)',
      kilowatt_hour: 'Киловатт-час (kWh)',
      btu: 'BTU',
      foot_pound: 'Фут-фунт (ft·lb)',
      pascal: 'Паскаль (Pa)',
      kilopascal: 'Килопаскаль (kPa)',
      bar: 'Бар',
      millibar: 'Миллибар (mbar)',
      psi: 'PSI',
      atmosphere: 'Атмосфера (atm)',
      byte: 'Байт (B)',
      kilobyte: 'Килобайт (KB)',
      megabyte: 'Мегабайт (MB)',
      gigabyte: 'Гигабайт (GB)',
      terabyte: 'Терабайт (TB)',
      petabyte: 'Петабайт (PB)',
      fluid_ounce: 'Жидкая унция (fl oz)',
      stick_butter: 'Пачка масла',
      pinch: 'Щепотка',
      dash: 'Капля',
      kibibyte: 'Кибибайт (KiB)',
      mebibyte: 'Мебибайт (MiB)',
      gibibyte: 'Гибибайт (GiB)',
      tebibyte: 'Тебибайт (TiB)',
      pebibyte: 'Пебибайт (PiB)'
    }
  }
};

// ===========================
// UNIT DEFINITIONS
// ===========================
const UNITS = {
  length: {
    meter:      { label: 'Meter (m)',       f: 1 },
    kilometer:  { label: 'Kilometer (km)',  f: 1000 },
    centimeter: { label: 'Centimeter (cm)', f: 0.01 },
    mile:       { label: 'Mile (mi)',        f: 1609.34 },
    yard:       { label: 'Yard (yd)',        f: 0.9144 },
    foot:       { label: 'Foot (ft)',        f: 0.3048 },
    inch:       { label: 'Inch (in)',        f: 0.0254 }
  },
  mass: {
    kilogram: { label: 'Kilogram (kg)', f: 1 },
    gram:     { label: 'Gram (g)',      f: 0.001 },
    pound:    { label: 'Pound (lb)',    f: 0.453592 },
    ounce:    { label: 'Ounce (oz)',    f: 0.028349 }
  },
  temperature: {
    celsius:    { label: 'Celsius (°C)' },
    fahrenheit: { label: 'Fahrenheit (°F)' },
    kelvin:     { label: 'Kelvin (K)' }
  },
  speed: {
    mps:  { label: 'm/s',   f: 1 },
    kph:  { label: 'km/h',  f: 0.27778 },
    mph:  { label: 'mph',   f: 0.44704 },
    knot: { label: 'Knot',  f: 0.51444 }
  },
  volume: {
    liter:         { label: 'Liter (L)',         f: 1 },
    milliliter:    { label: 'Milliliter (mL)',   f: 0.001 },
    gallon_us:     { label: 'Gallon (US)',       f: 3.78541 },
    gallon_uk:     { label: 'Gallon (UK)',       f: 4.54609 },
    cubic_meter:   { label: 'Cubic meter (m³)',  f: 1000 },
    cubic_foot:    { label: 'Cubic foot (ft³)',  f: 28.3168 },
    cup:           { label: 'Cup',               f: 0.236588 },
    tablespoon:    { label: 'Tablespoon (tbsp)',  f: 0.0147868 },
    teaspoon:      { label: 'Teaspoon (tsp)',    f: 0.00492892 }
  },
  area: {
    square_meter:    { label: 'Square meter (m²)',       f: 1 },
    square_kilometer:{ label: 'Square kilometer (km²)',  f: 1e6 },
    square_mile:     { label: 'Square mile (mi²)',       f: 2589988 },
    acre:            { label: 'Acre',                     f: 4046.856 },
    square_foot:     { label: 'Square foot (ft²)',       f: 0.092903 },
    square_inch:     { label: 'Square inch (in²)',       f: 0.00064516 },
    hectare:         { label: 'Hectare (ha)',             f: 10000 }
  },
  time: {
    second: { label: 'Second (s)', f: 1 },
    minute: { label: 'Minute (min)', f: 60 },
    hour:   { label: 'Hour (h)',   f: 3600 },
    day:    { label: 'Day (d)',    f: 86400 },
    week:   { label: 'Week (wk)',  f: 604800 },
    month:  { label: 'Month (mo)', f: 2628000 },
    year:   { label: 'Year (yr)',  f: 31536000 }
  },
  energy: {
    joule:         { label: 'Joule (J)',             f: 1 },
    kilojoule:     { label: 'Kilojoule (kJ)',       f: 1000 },
    calorie:       { label: 'Calorie (cal)',         f: 4.184 },
    kilocalorie:   { label: 'Kilocalorie (kcal)',   f: 4184 },
    watt_hour:     { label: 'Watt-hour (Wh)',        f: 3600 },
    kilowatt_hour: { label: 'Kilowatt-hour (kWh)',   f: 3.6e6 },
    btu:           { label: 'BTU',                    f: 1055.06 },
    foot_pound:    { label: 'Foot-pound (ft·lb)',    f: 1.35582 }
  },
  pressure: {
    pascal:     { label: 'Pascal (Pa)',       f: 1 },
    kilopascal: { label: 'Kilopascal (kPa)',  f: 1000 },
    bar:        { label: 'Bar',               f: 100000 },
    millibar:   { label: 'Millibar (mbar)',   f: 100 },
    psi:        { label: 'PSI',               f: 6894.76 },
    atmosphere: { label: 'Atmosphere (atm)',  f: 101325 }
  },
  data: {
    byte:       { label: 'Byte (B)',       f: 1 },
    kilobyte:   { label: 'Kilobyte (KB)',  f: 1000 },
    megabyte:   { label: 'Megabyte (MB)',  f: 1e6 },
    gigabyte:   { label: 'Gigabyte (GB)',  f: 1e9 },
    terabyte:   { label: 'Terabyte (TB)',  f: 1e12 },
    petabyte:   { label: 'Petabyte (PB)',  f: 1e15 }
  },
  cooking: {
    gram:         { label: 'Gram (g)',               f: 1 },
    kilogram:     { label: 'Kilogram (kg)',          f: 1000 },
    ounce:        { label: 'Ounce (oz)',             f: 28.3495 },
    pound:        { label: 'Pound (lb)',             f: 453.592 },
    milliliter:   { label: 'Milliliter (mL)',        f: 1 },
    liter:        { label: 'Liter (L)',              f: 1000 },
    teaspoon:     { label: 'Teaspoon (tsp)',         f: 4.92892 },
    tablespoon:   { label: 'Tablespoon (tbsp)',      f: 14.7868 },
    cup:          { label: 'Cup',                     f: 236.588 },
    fluid_ounce:  { label: 'Fluid ounce (fl oz)',    f: 29.5735 },
    stick_butter: { label: 'Stick of butter',        f: 113 },
    pinch:        { label: 'Pinch',                   f: 0.308 },
    dash:         { label: 'Dash',                    f: 0.616 }
  },
  binary_data: {
    byte:       { label: 'Byte (B)',         f: 1 },
    kibibyte:   { label: 'Kibibyte (KiB)',   f: 1024 },
    mebibyte:   { label: 'Mebibyte (MiB)',   f: 1048576 },
    gibibyte:   { label: 'Gibibyte (GiB)',   f: 1073741824 },
    tebibyte:   { label: 'Tebibyte (TiB)',   f: 1099511627776 },
    pebibyte:   { label: 'Pebibyte (PiB)',   f: 1125899906842624 }
  }
};

// ===========================
// TEMPERATURE HELPER
// ===========================
function convertTemp(v, from, to) {
  // Convert to Celsius first
  let c;
  if (from === 'celsius')    c = v;
  else if (from === 'fahrenheit') c = (v - 32) * 5 / 9;
  else                       c = v - 273.15; // kelvin

  // Convert from Celsius to target
  if (to === 'celsius')    return c;
  if (to === 'fahrenheit') return c * 9 / 5 + 32;
  return c + 273.15; // kelvin
}

// ===========================
// CURRENCY
// ===========================
const FALLBACK_RATES = {
  USD: 1, EUR: 0.8612, GBP: 0.7451, JPY: 158.92, CAD: 1.375,
  AUD: 1.4001, CHF: 0.7882, CNY: 6.812, HKD: 7.8323, SGD: 1.2789,
  SEK: 9.3566, NOK: 9.2699, NZD: 1.7059, KRW: 1501.66, INR: 96.82,
  BRL: 5.0318, ZAR: 16.49, MXN: 17.33, TWD: 31.61, DKK: 6.4278,
  PLN: 3.6593, THB: 32.63, IDR: 17645.43, HUF: 310.31, PHP: 61.57,
  CZK: 23.23, ILS: 2.9085, MYR: 3.9705, RUB: 71.37, SAR: 3.75,
  AED: 3.6725, TRY: 45.63, NGN: 1371.48, QAR: 3.64, RON: 4.5106
};

// ===========================
// CRYPTO
// ===========================
const CRYPTO_LIST = [
  { id: 'bitcoin',      symbol: 'BTC',  label: 'Bitcoin (BTC)' },
  { id: 'ethereum',     symbol: 'ETH',  label: 'Ethereum (ETH)' },
  { id: 'cardano',      symbol: 'ADA',  label: 'Cardano (ADA)' },
  { id: 'solana',       symbol: 'SOL',  label: 'Solana (SOL)' },
  { id: 'ripple',       symbol: 'XRP',  label: 'XRP (XRP)' },
  { id: 'tether',       symbol: 'USDT', label: 'Tether (USDT)' },
  { id: 'usd-coin',     symbol: 'USDC', label: 'USD Coin (USDC)' },
  { id: 'dai',          symbol: 'DAI',  label: 'Dai (DAI)' }
];
const CRYPTO_FIAT = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'];
let cryptoPrices = {};

async function fetchRates() {
  var status = $('c-status');
  try {
    // Save current rates as previous before overwriting
    if (Object.keys(rates).length > 0) {
      localStorage.setItem(PREV_RATES_KEY, JSON.stringify({ rates: rates, timestamp: Date.now() }));
      previousRates = { rates: rates, timestamp: Date.now() };
    }
    var res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var data = await res.json();
    if (!data || !data.rates) throw new Error('Invalid API response');
    rates = data.rates;
    if (status) status.textContent = TRANSLATIONS[currentLang].statusUpdated + new Date().toLocaleTimeString();
  } catch (e) {
    if (status) {
      status.textContent = TRANSLATIONS[currentLang].statusOffline + ' (' + e.message + ')';
      if (Object.keys(rates).length > 0) updateOfflineAge();
    }
    if (Object.keys(rates).length === 0) rates = { ...FALLBACK_RATES };
  }
  populateCurrencySelects(Object.keys(rates).sort());
  convertCurrency();
}

function populateCurrencySelects(currencies) {
  const pref = ['USD','EUR','GBP','JPY','CAD','AUD','CHF','CNY'];
  const sorted = [
    ...pref.filter(c => currencies.includes(c)),
    ...currencies.filter(c => !pref.includes(c))
  ];

  const cn = TRANSLATIONS[currentLang].currencyNames;
  const getLabel = function (code) {
    return cn && cn[code] ? code + ' \u2013 ' + cn[code] : code;
  };

  ['c-from', 'c-to'].forEach((id, i) => {
    const sel = document.getElementById(id);
    sel.innerHTML = sorted.map(function (c) {
      return '<option value="' + c + '">' + getLabel(c) + '</option>';
    }).join('');
    sel.value = i === 0 ? 'USD' : 'EUR';
    createSearchableSelect(sel, sorted, function () { convertCurrency(); }, getLabel,
      TRANSLATIONS[currentLang].searchPlaceholder,
      TRANSLATIONS[currentLang].noResults);
  });
}

function convertCurrency() {
  const amount = parseFloat(document.getElementById('c-amount').value);
  const from   = document.getElementById('c-from').value;
  const to     = document.getElementById('c-to').value;

  if (!rates[from] || !rates[to] || isNaN(amount)) {
    showResult($('c-result'), '\u2014');
    return;
  }

  const result = (amount / rates[from]) * rates[to];
  showResult($('c-result'), formatResult(result));
  if (!lastCurrencyRecord || lastCurrencyRecord.from !== from || lastCurrencyRecord.to !== to || lastCurrencyRecord.amount !== amount) {
    addToHistory({ type: 'currency', from: from, to: to, amount: amount, result: result });
    lastCurrencyRecord = { from: from, to: to, amount: amount };
  }
  renderFavs();
  updateFavStars();

  // Update rate display
  var rate = rates[to] / rates[from];
  var rateLine = document.getElementById('rate-line');
  var rateChange = document.getElementById('rate-change');
  rateLine.textContent = '1 ' + from + ' = ' + formatResult(rate) + ' ' + to;

  if (previousRates && previousRates.rates[from] && previousRates.rates[to]) {
    var prevRate = previousRates.rates[to] / previousRates.rates[from];
    var pct = ((rate - prevRate) / prevRate) * 100;
    if (pct >= 0) {
      rateChange.textContent = '\u2191 +' + pct.toFixed(2) + '%';
      rateChange.className = 'rate-change up';
    } else {
      rateChange.textContent = '\u2193 ' + Math.abs(pct).toFixed(2) + '%';
      rateChange.className = 'rate-change down';
    }
  } else {
    rateChange.textContent = '';
    rateChange.className = 'rate-change';
  }
}

function swapCurrency() {
  const f = document.getElementById('c-from');
  const t = document.getElementById('c-to');
  [f.value, t.value] = [t.value, f.value];
  if (f._updateSearchable) f._updateSearchable();
  if (t._updateSearchable) t._updateSearchable();
  convertCurrency();
}

function manualRefreshRates() {
  var now = Date.now();
  if (now - lastRefreshTime < REFRESH_COOLDOWN) return;
  lastRefreshTime = now;
  var btn = document.getElementById('refresh-btn');
  btn.disabled = true;
  btn.textContent = TRANSLATIONS[currentLang].refreshing || 'Refreshing...';
  fetchRates().then(function () {
    startRefreshCountdown(60);
  }).catch(function () {
    btn.disabled = false;
    btn.textContent = TRANSLATIONS[currentLang].refreshRates || '\u21BB Refresh';
  });
}

function startRefreshCountdown(sec) {
  var btn = document.getElementById('refresh-btn');
  btn.textContent = sec + 's';
  if (sec > 0) {
    setTimeout(function () { startRefreshCountdown(sec - 1); }, 1000);
  } else {
    btn.disabled = false;
    btn.textContent = TRANSLATIONS[currentLang].refreshRates || '\u21BB Refresh';
  }
}

function fetchCryptoPrices() {
  var status = $('cr-status');
  if (status) status.textContent = TRANSLATIONS[currentLang].cryptoLoading || 'Loading crypto prices\u2026';

  // Check cache
  try {
    var cached = JSON.parse(localStorage.getItem(CRYPTO_CACHE_KEY));
    if (cached && cached.prices && cached.timestamp && Date.now() - cached.timestamp < CRYPTO_CACHE_TTL) {
      cryptoPrices = cached.prices;
      populateCryptoSelects();
      convertCrypto();
      if (status) status.textContent = TRANSLATIONS[currentLang].cryptoUpdated || 'Prices updated';
      return;
    }
  } catch (e) { /* ignore */ }

  var ids = CRYPTO_LIST.map(function (c) { return c.id; }).join(',');
  var url = 'https://api.coingecko.com/api/v3/simple/price?ids=' + ids + '&vs_currencies=usd';

  fetch(url)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      if (!data || typeof data !== 'object') throw new Error('Invalid API response');
      cryptoPrices = {};
      CRYPTO_LIST.forEach(function (c) {
        cryptoPrices[c.symbol] = data[c.id] ? data[c.id].usd : 0;
      });
      localStorage.setItem(CRYPTO_CACHE_KEY, JSON.stringify({ prices: cryptoPrices, timestamp: Date.now() }));
      populateCryptoSelects();
      convertCrypto();
      if (status) status.textContent = TRANSLATIONS[currentLang].statusUpdated + new Date().toLocaleTimeString();
    })
    .catch(function () {
      if (status) status.textContent = TRANSLATIONS[currentLang].cryptoOffline || 'Crypto prices offline';
      // Fallback prices if cache exists, otherwise hardcoded
      try {
        var cached = JSON.parse(localStorage.getItem(CRYPTO_CACHE_KEY));
        if (cached && cached.prices) {
          cryptoPrices = cached.prices;
          populateCryptoSelects();
          convertCrypto();
          return;
        }
      } catch (e2) { /* ignore */ }
      cryptoPrices = { BTC: 45000, ETH: 3200, ADA: 0.45, SOL: 140, XRP: 0.62, USDT: 1, USDC: 1, DAI: 1 };
      populateCryptoSelects();
      convertCrypto();
    });
}

function populateCryptoSelects() {
  var allOptions = CRYPTO_LIST.map(function (c) { return c.symbol; });
  ['cr-from', 'cr-to'].forEach(function (id, i) {
    var sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = allOptions.map(function (code) {
      var crypto = CRYPTO_LIST.find(function (c) { return c.symbol === code; });
      return '<option value="' + code + '">' + (crypto ? crypto.label : code) + '</option>';
    }).join('');
    sel.value = i === 0 ? 'BTC' : 'ETH';
  });
}

function convertCrypto() {
  var amount = parseFloat($('cr-amount').value);
  var from = $('cr-from').value;
  var to = $('cr-to').value;

  if (isNaN(amount)) {
    showResult($('cr-result'), '\u2014');
    return;
  }

  var fromInUsd, toInUsd;

  if (cryptoPrices[from] !== undefined) {
    fromInUsd = cryptoPrices[from];
  } else if (from === 'USD') {
    fromInUsd = 1;
  } else if (rates[from]) {
    fromInUsd = 1 / rates[from];
  } else {
    showResult($('cr-result'), '\u2014');
    return;
  }

  if (cryptoPrices[to] !== undefined) {
    toInUsd = cryptoPrices[to];
  } else if (to === 'USD') {
    toInUsd = 1;
  } else if (rates[to]) {
    toInUsd = 1 / rates[to];
  } else {
    showResult($('cr-result'), '\u2014');
    return;
  }

  var result = (amount * fromInUsd) / toInUsd;
  showResult($('cr-result'), formatResult(result));
  if (!lastCryptoRecord || lastCryptoRecord.from !== from || lastCryptoRecord.to !== to || lastCryptoRecord.amount !== amount) {
    addToHistory({ type: 'crypto', from: from, to: to, amount: amount, result: result });
    lastCryptoRecord = { from: from, to: to, amount: amount };
  }
}

function swapCrypto() {
  var f = document.getElementById('cr-from');
  var t = document.getElementById('cr-to');
  [f.value, t.value] = [t.value, f.value];
  convertCrypto();
}

// ===========================
// UNITS
// ===========================
function buildCatButtons() {
  const row = document.getElementById('cat-row');
  row.innerHTML = Object.keys(UNITS).map(k => `
    <button class="cat-btn${k === currentCategory ? ' active' : ''}"
            onclick="setCategory('${k}')">
      ${(TRANSLATIONS[currentLang].categories && TRANSLATIONS[currentLang].categories[k]) || (k.charAt(0).toUpperCase() + k.slice(1))}
    </button>
  `).join('');
}

function setCategory(cat) {
  currentCategory = cat;
  buildCatButtons();
  populateUnitSelects();
  convertUnit();
  updateFavStars();
}

function populateUnitSelects() {
  const units = UNITS[currentCategory];
  const keys  = Object.keys(units);
  const t = TRANSLATIONS[currentLang].units;

  ['u-from', 'u-to'].forEach((id, i) => {
    const sel = document.getElementById(id);
    sel.innerHTML = keys.map(k => `<option value="${k}">${(t && t[k]) || units[k].label}</option>`).join('');
    sel.value = keys[i === 0 ? 0 : 1];
  });
}

function convertUnit() {
  const amount = parseFloat(document.getElementById('u-amount').value);
  const from   = document.getElementById('u-from').value;
  const to     = document.getElementById('u-to').value;

  if (isNaN(amount)) {
    showResult($('u-result'), '\u2014');
    return;
  }

  let result;
  if (currentCategory === 'temperature') {
    result = convertTemp(amount, from, to);
  } else {
    const units = UNITS[currentCategory];
    result = (amount * units[from].f) / units[to].f;
  }

  showResult($('u-result'), formatResult(result));
  if (!lastUnitRecord || lastUnitRecord.category !== currentCategory || lastUnitRecord.from !== from || lastUnitRecord.to !== to || lastUnitRecord.amount !== amount) {
    addToHistory({ type: 'unit', category: currentCategory, from: from, to: to, amount: amount, result: result });
    lastUnitRecord = { category: currentCategory, from: from, to: to, amount: amount };
  }
  renderFavs();
  updateFavStars();
}

function swapUnit() {
  const f = document.getElementById('u-from');
  const t = document.getElementById('u-to');
  [f.value, t.value] = [t.value, f.value];
  convertUnit();
}

// ===========================
// HISTORY
// ===========================
function addToHistory(entry) {
  entry.timestamp = Date.now();
  var history = getHistory();
  history.unshift(entry);
  if (history.length > HISTORY_MAX) history.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  trimStorage();
  var hv = $('history-view');
  if (hv && hv.classList.contains('active')) renderHistory();
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch (e) { return []; }
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

function formatTimestamp(ms) {
  var diff = Date.now() - ms;
  var sec = Math.floor(diff / 1000);
  if (sec < 60) return 'Just now';
  var min = Math.floor(sec / 60);
  if (min < 60) return min + 'm ago';
  var hr = Math.floor(min / 60);
  if (hr < 24) return hr + 'h ago';
  var d = Math.floor(hr / 24);
  if (d < 7) return d + 'd ago';
  return new Date(ms).toLocaleDateString();
}

// ===========================
// FAVORITES
// ===========================

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch (e) { return []; }
}

function isFavorited(type, from, to, category) {
  return getFavorites().some(function (f) {
    return f.type === type && f.from === from && f.to === to &&
      (!category || f.category === category);
  });
}

function toggleFav(btn) {
  var type = btn.dataset.fav === 'c' ? 'currency' : 'unit';
  var from, to, category;
  if (type === 'currency') {
    from = document.getElementById('c-from').value;
    to = document.getElementById('c-to').value;
  } else {
    from = document.getElementById('u-from').value;
    to = document.getElementById('u-to').value;
    category = currentCategory;
  }
  var favs = getFavorites();
  var idx = -1;
  for (var i = 0; i < favs.length; i++) {
    var f = favs[i];
    if (f.type === type && f.from === from && f.to === to &&
        (!category || f.category === category)) { idx = i; break; }
  }
  if (idx > -1) {
    favs.splice(idx, 1);
    btn.classList.remove('favorited');
    btn.textContent = '\u2606';
  } else {
    favs.push({ type: type, from: from, to: to, category: category });
    btn.classList.add('favorited');
    btn.textContent = '\u2605';
  }
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  renderFavs();
}

function applyFav(entry) {
  if (entry.type === 'currency') {
    switchTab('currency');
    document.getElementById('c-from').value = entry.from;
    document.getElementById('c-to').value = entry.to;
    if (document.getElementById('c-from')._updateSearchable) document.getElementById('c-from')._updateSearchable();
    if (document.getElementById('c-to')._updateSearchable) document.getElementById('c-to')._updateSearchable();
    convertCurrency();
  } else {
    switchTab('unit');
    setCategory(entry.category);
    document.getElementById('u-from').value = entry.from;
    document.getElementById('u-to').value = entry.to;
    convertUnit();
  }
}

function renderFavs() {
  var favs = getFavorites();
  var t = TRANSLATIONS[currentLang];
  ['c', 'u'].forEach(function (prefix) {
    var panel = document.getElementById('fav-panel-' + prefix);
    if (!panel) return;
    var type = prefix === 'c' ? 'currency' : 'unit';
    var filtered = favs.filter(function (f) { return f.type === type; });
    if (!filtered.length) {
      panel.innerHTML = '<span class="fav-chip-empty">' + (t.favEmpty || '\u2606 Favorites') + '</span>';
      return;
    }
    panel.innerHTML = filtered.map(function (f) {
      var label = f.type === 'currency'
        ? f.from + ' \u2192 ' + f.to
        : (t.units && t.units[f.from] || f.from) + ' \u2192 ' + (t.units && t.units[f.to] || f.to);
      return '<button class="fav-chip" onclick="applyFav(' + JSON.stringify(f).replace(/"/g, '&quot;') + ')">' + label + '</button>';
    }).join('');
  });
  // Update star states
  updateFavStars();
}

function updateFavStars() {
  ['c-result', 'u-result'].forEach(function (id) {
    var box = document.getElementById(id);
    if (!box) return;
    var btn = box.parentElement.querySelector('.fav-btn');
    if (!btn) return;
    var type = btn.dataset.fav === 'c' ? 'currency' : 'unit';
    var isFav;
    if (type === 'currency') {
      isFav = isFavorited(type,
        document.getElementById('c-from').value,
        document.getElementById('c-to').value);
    } else {
      isFav = isFavorited(type,
        document.getElementById('u-from').value,
        document.getElementById('u-to').value, currentCategory);
    }
    btn.classList.toggle('favorited', isFav);
    btn.textContent = isFav ? '\u2605' : '\u2606';
  });
}

function renderHistory() {
  var list = document.getElementById('history-list');
  var history = getHistory();
  var t = TRANSLATIONS[currentLang];

  if (!history.length) {
    list.innerHTML = '<div class="history-empty">' + (t.historyEmpty || 'No history yet') + '</div>';
    return;
  }

  list.innerHTML = history.map(function (entry) {
    var icon = entry.type === 'currency' ? '\uD83D\uDCB1' : entry.type === 'crypto' ? '\uD83D\uDE09' : '\uD83D\uDCD0';
    var fromLabel = entry.type === 'currency' || entry.type === 'crypto'
      ? entry.from
      : (t.units && t.units[entry.from]) || entry.from;
    var toLabel = entry.type === 'currency' || entry.type === 'crypto'
      ? entry.to
      : (t.units && t.units[entry.to]) || entry.to;
    var route = fromLabel + ' \u2192 ' + toLabel;
    var amt = entry.amount + ' ' + entry.from;

    return '<div class="history-item">'
      + '<span class="history-item-type">' + icon + '</span>'
      + '<div class="history-item-detail">'
        + '<div class="history-item-route" title="' + route + '">' + route + '</div>'
        + '<div class="history-item-amt">' + amt + ' = ' + formatResult(entry.result) + ' ' + entry.to + '</div>'
      + '</div>'
      + '<span class="history-item-time">' + formatTimestamp(entry.timestamp) + '</span>'
      + '<button class="history-quick-btn" onclick="quickConvert(' + JSON.stringify(entry).replace(/"/g, '&quot;') + ')">\u21BB</button>'
    + '</div>';
  }).join('');
}

function quickConvert(entry) {
  if (entry.type === 'currency') {
    switchTab('currency');
    document.getElementById('c-from').value = entry.from;
    document.getElementById('c-to').value = entry.to;
    document.getElementById('c-amount').value = entry.amount;
    if (document.getElementById('c-from')._updateSearchable) document.getElementById('c-from')._updateSearchable();
    if (document.getElementById('c-to')._updateSearchable) document.getElementById('c-to')._updateSearchable();
    convertCurrency();
  } else {
    switchTab('unit');
    if (entry.category) {
      setCategory(entry.category);
    }
    document.getElementById('u-from').value = entry.from;
    document.getElementById('u-to').value = entry.to;
    document.getElementById('u-amount').value = entry.amount;
    convertUnit();
  }
}

// ===========================
// PRECISION & COPY
// ===========================
function formatResult(value, prec) {
  if (typeof value !== 'number' || !isFinite(value)) return '\u2014';
  prec = prec || precision;
  if (Math.abs(value) > 1e10 || (Math.abs(value) < 1e-10 && value !== 0)) {
    return value.toExponential(prec);
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: prec
  });
}

function setPrecision(val) {
  precision = parseInt(val);
  localStorage.setItem('precision', val);
  convertCurrency();
  convertUnit();
}

function applyTheme() {
  var theme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'dark';
  var isLight = theme === 'light';
  document.documentElement.classList.toggle('light', isLight);
  var btn = $('theme-btn');
  if (btn) btn.textContent = isLight ? TRANSLATIONS[currentLang].settingsTheme + ': Light' : TRANSLATIONS[currentLang].settingsTheme + ': Dark';
}

function toggleTheme() {
  var theme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'dark';
  theme = theme === 'light' ? 'dark' : 'light';
  localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
  applyTheme();
}

function copyResult(type) {
  const el = document.getElementById(type + '-result');
  const text = el.textContent;
  if (text === '\u2014') return;
  navigator.clipboard.writeText(text).then(function () {
    const toast = document.getElementById('toast');
    toast.textContent = TRANSLATIONS[currentLang].copiedText || 'Copied!';
    toast.className = 'toast show';
    setTimeout(function () { toast.className = 'toast'; }, 2000);
  }).catch(function () {});
}

// ===========================
// TAB SWITCHING
// ===========================
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.getElementById('currency-view').classList.toggle('active', tab === 'currency');
  document.getElementById('unit-view').classList.toggle('active', tab === 'unit');
  document.getElementById('history-view').classList.toggle('active', tab === 'history');
  document.getElementById('crypto-view').classList.toggle('active', tab === 'crypto');
  if (tab === 'history') renderHistory();
  if (tab === 'currency' || tab === 'unit') updateFavStars();
  if (tab === 'crypto') {
    populateCryptoSelects();
    convertCrypto();
    // Lazy load crypto prices (only on first click)
    if (!DOM._cryptoFetched) {
      DOM._cryptoFetched = true;
      fetchCryptoPrices();
    }
  }
}

// ===========================
// SEARCHABLE SELECT
// ===========================
function createSearchableSelect(selectEl, options, onChange, getLabel, placeholderText, noResultsText) {
  selectEl.style.display = 'none';

  // Remove existing wrapper to prevent duplicates
  if (selectEl.nextElementSibling && selectEl.nextElementSibling.classList.contains('searchable-select')) {
    selectEl.nextElementSibling.remove();
  }

  var labelFn = typeof getLabel === 'function' ? getLabel : function (v) { return v; };

  const wrap = document.createElement('div');
  wrap.className = 'searchable-select';

  const control = document.createElement('div');
  control.className = 'ss-control';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'ss-input';
  input.placeholder = placeholderText || TRANSLATIONS[currentLang].searchPlaceholder;
  input.spellcheck = false;
  input.autocomplete = 'off';

  const arrow = document.createElement('span');
  arrow.className = 'ss-arrow';
  arrow.textContent = '\u25BE';

  const dropdown = document.createElement('div');
  dropdown.className = 'ss-dropdown';

  let highlightedIndex = -1;
  let currentOptions = [];

  function renderOptions(filter) {
    dropdown.innerHTML = '';
    currentOptions = !filter
      ? options.slice()
      : options.filter(function (o) {
          return o.toLowerCase().includes(filter.toLowerCase()) ||
                 labelFn(o).toLowerCase().includes(filter.toLowerCase());
        });

    if (currentOptions.length === 0) {
      dropdown.innerHTML = '<div class="ss-no-results">' + (noResultsText || TRANSLATIONS[currentLang].noResults) + '</div>';
      return;
    }

    currentOptions.forEach(function (opt, i) {
      const div = document.createElement('div');
      div.className = 'ss-option';
      if (opt === selectEl.value) div.classList.add('selected');
      div.dataset.value = opt;
      div.textContent = labelFn(opt);
      div.addEventListener('click', function () { selectOption(opt); });
      dropdown.appendChild(div);
    });
  }

  function selectOption(value) {
    selectEl.value = value;
    input.value = labelFn(value);
    closeDropdown();
    onChange(value);
  }

  function openDropdown() {
    renderOptions(input.value);
    dropdown.classList.add('open');
    highlightedIndex = -1;
  }

  function closeDropdown() {
    dropdown.classList.remove('open');
    highlightedIndex = -1;
  }

  function highlightNext() {
    const items = dropdown.querySelectorAll('.ss-option');
    if (!items.length) return;
    if (highlightedIndex < items.length - 1) highlightedIndex++;
    items.forEach(function (el, i) { el.classList.toggle('highlighted', i === highlightedIndex); });
  }

  function highlightPrev() {
    const items = dropdown.querySelectorAll('.ss-option');
    if (!items.length) return;
    if (highlightedIndex > 0) highlightedIndex--;
    items.forEach(function (el, i) { el.classList.toggle('highlighted', i === highlightedIndex); });
  }

  control.addEventListener('click', function (e) {
    if (e.target === arrow || e.target === control) {
      input.focus();
      dropdown.classList.contains('open') ? closeDropdown() : openDropdown();
    }
  });

  input.addEventListener('focus', openDropdown);

  input.addEventListener('input', function () {
    openDropdown();
    highlightedIndex = -1;
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!dropdown.classList.contains('open')) openDropdown();
      highlightNext();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!dropdown.classList.contains('open')) openDropdown();
      highlightPrev();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const highlighted = dropdown.querySelector('.ss-option.highlighted');
      if (highlighted) {
        selectOption(highlighted.dataset.value);
      } else if (dropdown.classList.contains('open')) {
        const first = dropdown.querySelector('.ss-option');
        if (first) selectOption(first.dataset.value);
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
      input.blur();
    }
  });

  document.addEventListener('click', function (e) {
    if (!wrap.contains(e.target)) closeDropdown();
  });

  selectEl._updateSearchable = function () {
    input.value = labelFn(selectEl.value);
    dropdown.querySelectorAll('.ss-option').forEach(function (el) {
      el.classList.toggle('selected', el.dataset.value === selectEl.value);
    });
  };

  control.appendChild(input);
  control.appendChild(arrow);
  wrap.appendChild(control);
  wrap.appendChild(dropdown);
  selectEl.parentNode.insertBefore(wrap, selectEl.nextSibling);

  input.value = labelFn(selectEl.value);

  return wrap;
}

// ===========================
// SETTINGS & LANGUAGE
// ===========================
function toggleSettings() {
  document.getElementById('settings-popup').classList.toggle('open');
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);

  // Sync URL hash (use replaceState to avoid extra history entries)
  var expected = '#/' + lang;
  if (window.location.hash !== expected) {
    history.replaceState(null, '', expected);
  }

  // Update static text via data-i18n
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    el.textContent = TRANSLATIONS[lang][el.dataset.i18n];
  });

  // Update title attributes via data-i18n-title
  document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
    el.title = TRANSLATIONS[lang][el.dataset.i18nTitle];
  });

  // RTL support for Arabic
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;

  // Rebuild unit content
  buildCatButtons();
  populateUnitSelects();

  // Rebuild currency selects with translated names (if rates loaded)
  var cKeys = Object.keys(rates);
  if (cKeys.length) {
    var fromVal = document.getElementById('c-from').value;
    var toVal = document.getElementById('c-to').value;
    populateCurrencySelects(cKeys.sort());
    document.getElementById('c-from').value = fromVal;
    document.getElementById('c-to').value = toVal;
    if (document.getElementById('c-from')._updateSearchable) document.getElementById('c-from')._updateSearchable();
    if (document.getElementById('c-to')._updateSearchable) document.getElementById('c-to')._updateSearchable();
  }

  convertCurrency();
  convertUnit();

  // Re-theme button text in new language
  applyTheme();

  // Highlight active language link
  document.querySelectorAll('.lang-link').forEach(function (el) {
    el.classList.toggle('active', el.dataset.lang === lang);
  });

  // Close settings popup after language change
  document.getElementById('settings-popup').classList.remove('open');
  renderFavs();
}

// ===========================
// ROUTING (hash-based)
// ===========================
function getLangFromHash() {
  var hash = window.location.hash;
  var m = hash.match(/^#?\/(en|zh|ar|ru)(\/|$)/);
  return m ? m[1] : null;
}

function initLang() {
  var hashLang = getLangFromHash();
  if (hashLang) {
    applyLanguage(hashLang);
    return;
  }
  // No hash — detect and redirect (replace current history entry)
  var detected = localStorage.getItem('lang') || (navigator.language || '').slice(0, 2);
  if (!SUPPORTED_LANGS.includes(detected)) detected = 'en';
  history.replaceState(null, '', '#/' + detected);
  applyLanguage(detected);
}

// Handle hash changes (link clicks, back/forward)
window.addEventListener('hashchange', function () {
  var hl = getLangFromHash();
  if (hl && hl !== currentLang) applyLanguage(hl);
});

// Global click handler — language links + popup close
document.addEventListener('click', function (e) {
  var link = e.target.closest('.lang-link');
  if (link) {
    e.preventDefault();
    location.hash = link.getAttribute('href');
    return;
  }
  // Close settings popup when clicking outside
  var popup = document.getElementById('settings-popup');
  var btn = document.querySelector('.settings-btn');
  if (popup && !popup.contains(e.target) && btn && !btn.contains(e.target)) {
    popup.classList.remove('open');
  }
});

// ===========================
// KEYBOARD SHORTCUTS
// ===========================
document.addEventListener('keydown', function (e) {
  // Alt+S — swap active converter
  if (e.altKey && e.key === 's') {
    e.preventDefault();
    if ($('currency-view').classList.contains('active')) swapCurrency();
    else if ($('unit-view').classList.contains('active')) swapUnit();
    else if ($('crypto-view').classList.contains('active')) swapCrypto();
    return;
  }
  // Ctrl+C / Cmd+C — copy active result
  if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
    if (e.target.closest('.result-num')) {
      e.preventDefault();
      var activeResult = $('currency-view').classList.contains('active') ? 'c'
        : $('unit-view').classList.contains('active') ? 'u'
        : $('crypto-view').classList.contains('active') ? 'cr' : null;
      if (activeResult) copyResult(activeResult);
    }
    return;
  }
  // Escape — close settings popup
  if (e.key === 'Escape') {
    var popup = $('settings-popup');
    if (popup && popup.classList.contains('open')) {
      popup.classList.remove('open');
    }
  }
});

// ===========================
// TAB SWIPE ON MOBILE
// ===========================
(function () {
  var tabsEl = document.querySelector('.tabs');
  if (!tabsEl) return;
  var startX = 0;
  tabsEl.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  tabsEl.addEventListener('touchend', function (e) {
    var diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) < 50) return;
    var tabs = ['currency', 'unit', 'history', 'crypto'];
    var active = tabs.indexOf(document.querySelector('.tab.active').dataset.tab);
    var next = diff < 0 ? Math.min(active + 1, tabs.length - 1) : Math.max(active - 1, 0);
    if (next !== active) switchTab(tabs[next]);
  }, { passive: true });
})();

// ===========================
// LOCALSTORAGE CLEANUP
// ===========================
function trimStorage() {
  var totalSize = 0;
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    totalSize += ((localStorage.getItem(key) || '').length * 2); // rough UTF-16 estimate
  }
  if (totalSize > 500000) { // ~500KB threshold
    localStorage.removeItem(PREV_RATES_KEY);
    var history = getHistory();
    while (history.length > 5) history.pop();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
}

// ===========================
// OFFLINE AGE INDICATOR
// ===========================
function updateOfflineAge() {
  if (previousRates && previousRates.timestamp) {
    var elapsed = Date.now() - previousRates.timestamp;
    var min = Math.floor(elapsed / 60000);
    var status = $('c-status');
    if (min < 60) {
      status.textContent = 'Last updated ' + min + 'm ago';
    } else {
      status.textContent = 'Last updated ' + Math.floor(min / 60) + 'h ago';
    }
  }
}

initLang();
applyTheme();
trimStorage();
fetchRates();
renderFavs();
// Load previous rates from localStorage for rate change display
try {
  var prev = JSON.parse(localStorage.getItem(PREV_RATES_KEY));
  if (prev && prev.rates && prev.timestamp) previousRates = prev;
} catch (e) { /* ignore */ }
// Sync precision select with current value
var ps = $('precision-select');
if (ps) ps.value = String(precision);