// ===========================
// STATE
// ===========================
let rates = {};
let currentCategory = 'length';
let currentLang = localStorage.getItem('lang') || 'en';

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
    categories: {
      length: 'Length',
      mass: 'Mass',
      temperature: 'Temperature',
      speed: 'Speed'
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
      knot: 'Knot'
    }
  },
  zh: {
    headerText: '\u8F6C\u6362',
    headerAccent: '\u5668',
    tagline: '\u8D27\u5E01\u4E0E\u5355\u4F4D',
    tabCurrency: '\uD83D\uDCB1 \u8D27\u5E01',
    tabUnits: '\uD83D\uDCD0 \u5355\u4F4D',
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
    categories: {
      length: '\u957F\u5EA6',
      mass: '\u8D28\u91CF',
      temperature: '\u6E29\u5EA6',
      speed: '\u901F\u5EA6'
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
      knot: '\u8282'
    }
  },
  ar: {
    headerText: '\u0645\u062D',
    headerAccent: '\u0648\u0651\u0644',
    tagline: '\u0639\u0645\u0644\u0627\u062A \u0648\u0648\u062D\u062F\u0627\u062A',
    tabCurrency: '\uD83D\uDCB1 \u0639\u0645\u0644\u0627\u062A',
    tabUnits: '\uD83D\uDCD0 \u0648\u062D\u062F\u0627\u062A',
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
    categories: {
      length: '\u0637\u0648\u0644',
      mass: '\u0643\u062A\u0644\u0629',
      temperature: '\u062D\u0631\u0627\u0631\u0629',
      speed: '\u0633\u0631\u0639\u0629'
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
      knot: '\u0639\u0642\u062F\u0629'
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

async function fetchRates() {
  const status = document.getElementById('c-status');
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    rates = data.rates;
    status.textContent = TRANSLATIONS[currentLang].statusUpdated + new Date().toLocaleTimeString();
  } catch (e) {
    status.textContent = TRANSLATIONS[currentLang].statusOffline;
    rates = { ...FALLBACK_RATES };
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
    document.getElementById('c-result').textContent = '—';
    return;
  }

  const result = (amount / rates[from]) * rates[to];
  document.getElementById('c-result').textContent =
    result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function swapCurrency() {
  const f = document.getElementById('c-from');
  const t = document.getElementById('c-to');
  [f.value, t.value] = [t.value, f.value];
  if (f._updateSearchable) f._updateSearchable();
  if (t._updateSearchable) t._updateSearchable();
  convertCurrency();
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
    document.getElementById('u-result').textContent = '—';
    return;
  }

  let result;
  if (currentCategory === 'temperature') {
    result = convertTemp(amount, from, to);
  } else {
    const units = UNITS[currentCategory];
    result = (amount * units[from].f) / units[to].f;
  }

  // Smart formatting
  const fmt = (Math.abs(result) < 0.001 || Math.abs(result) > 999999)
    ? result.toExponential(4)
    : parseFloat(result.toFixed(6)).toString();

  document.getElementById('u-result').textContent = fmt;
}

function swapUnit() {
  const f = document.getElementById('u-from');
  const t = document.getElementById('u-to');
  [f.value, t.value] = [t.value, f.value];
  convertUnit();
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

  // Update language select to match
  var langSelect = document.getElementById('lang-select');
  if (langSelect) langSelect.value = lang;

  // Close settings popup after language change
  document.getElementById('settings-popup').classList.remove('open');
}

// ===========================
// INIT
// ===========================
document.addEventListener('click', function (e) {
  var popup = document.getElementById('settings-popup');
  var btn = document.querySelector('.settings-btn');
  if (popup && !popup.contains(e.target) && btn && !btn.contains(e.target)) {
    popup.classList.remove('open');
  }
});

applyLanguage(currentLang);
fetchRates();