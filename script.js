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
      USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
      CAD: 'Canadian Dollar', AUD: 'Australian Dollar', CHF: 'Swiss Franc',
      CNY: 'Chinese Yuan', HKD: 'Hong Kong Dollar', SGD: 'Singapore Dollar',
      SEK: 'Swedish Krona', NOK: 'Norwegian Krone', NZD: 'New Zealand Dollar',
      KRW: 'South Korean Won', INR: 'Indian Rupee', BRL: 'Brazilian Real',
      ZAR: 'South African Rand', MXN: 'Mexican Peso', TWD: 'New Taiwan Dollar',
      DKK: 'Danish Krone', PLN: 'Polish Zloty', THB: 'Thai Baht',
      IDR: 'Indonesian Rupiah', HUF: 'Hungarian Forint', PHP: 'Philippine Peso',
      CZK: 'Czech Koruna', ILS: 'Israeli Shekel', MYR: 'Malaysian Ringgit',
      RUB: 'Russian Ruble', SAR: 'Saudi Riyal', AED: 'UAE Dirham',
      TRY: 'Turkish Lira', NGN: 'Nigerian Naira', QAR: 'Qatari Riyal',
      RON: 'Romanian Leu'
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
      USD: '\u7F8E\u5143', EUR: '\u6B27\u5143', GBP: '\u82F1\u9551', JPY: '\u65E5\u5143',
      CAD: '\u52A0\u62FF\u5927\u5143', AUD: '\u6FB3\u5927\u5229\u4E9A\u5143', CHF: '\u745E\u58EB\u6CD5\u90CE',
      CNY: '\u4EBA\u6C11\u5E01', HKD: '\u6E2F\u5143', SGD: '\u65B0\u52A0\u5761\u5143',
      SEK: '\u745E\u5178\u514B\u6717', NOK: '\u632A\u5A01\u514B\u6717', NZD: '\u7EBD\u897F\u5170\u5143',
      KRW: '\u97E9\u5143', INR: '\u5370\u5EA6\u5362\u6BD4', BRL: '\u5DF4\u897F\u96F7\u4E9A\u5C14',
      ZAR: '\u5357\u975E\u5170\u7279', MXN: '\u58A8\u897F\u54E5\u6BD4\u7D22', TWD: '\u65B0\u53F0\u5E01',
      DKK: '\u4E39\u9EA6\u514B\u6717', PLN: '\u6CE2\u5170\u5179\u7F57\u63D0', THB: '\u6CF0\u94E2',
      IDR: '\u5370\u5C3C\u76FE', HUF: '\u5308\u7259\u5229\u798F\u6797', PHP: '\u83F2\u5F8B\u5BBE\u6BD4\u7D22',
      CZK: '\u6377\u514B\u514B\u6717', ILS: '\u4EE5\u8272\u5217\u65B0\u8C22\u514B\u5C14', MYR: '\u9A6C\u6765\u897F\u4E9A\u6797\u5409\u7279',
      RUB: '\u4FC4\u7F57\u65AF\u5362\u5E03', SAR: '\u6C99\u7279\u91CC\u4E9A\u5C14', AED: '\u963F\u8054\u914B\u8FEA\u62C9\u59C6',
      TRY: '\u571F\u8033\u5176\u91CC\u62C9', NGN: '\u5C3C\u65E5\u5229\u4E9A\u5948\u62C9', QAR: '\u5361\u5854\u5C14\u91CC\u4E9A\u5C14',
      RON: '\u7F57\u9A6C\u5C3C\u4E9A\u5217\u4F0A'
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
      USD: '\u062F\u0648\u0644\u0627\u0631 \u0623\u0645\u0631\u064A\u0643\u064A', EUR: '\u064A\u0648\u0631\u0648', GBP: '\u062C\u0646\u064A\u0647 \u0625\u0633\u062A\u0631\u0644\u064A\u0646\u064A',
      JPY: '\u064A\u0646 \u064A\u0627\u0628\u0627\u0646\u064A', CAD: '\u062F\u0648\u0644\u0627\u0631 \u0643\u0646\u062F\u064A', AUD: '\u062F\u0648\u0644\u0627\u0631 \u0623\u0633\u062A\u0631\u0627\u0644\u064A',
      CHF: '\u0641\u0631\u0646\u0643 \u0633\u0648\u064A\u0633\u0631\u064A', CNY: '\u064A\u0648\u0627\u0646 \u0635\u064A\u0646\u064A', HKD: '\u062F\u0648\u0644\u0627\u0631 \u0647\u0648\u0646\u063A \u0643\u0648\u0646\u063A',
      SGD: '\u062F\u0648\u0644\u0627\u0631 \u0633\u0646\u063A\u0627\u0641\u0648\u0631\u064A', SEK: '\u0643\u0631\u0648\u0646\u0627 \u0633\u0648\u064A\u062F\u064A\u0629', NOK: '\u0643\u0631\u0648\u0646\u0629 \u0646\u0631\u0648\u064A\u062C\u064A\u0629',
      NZD: '\u062F\u0648\u0644\u0627\u0631 \u0646\u064A\u0648\u0632\u064A\u0644\u0646\u062F\u064A', KRW: '\u0648\u0648\u0646 \u0643\u0648\u0631\u064A', INR: '\u0631\u0648\u0628\u064A\u0629 \u0647\u0646\u062F\u064A\u0629',
      BRL: '\u0631\u064A\u0627\u0644 \u0628\u0631\u0627\u0632\u064A\u0644\u064A', ZAR: '\u0631\u0627\u0646\u062F \u062C\u0646\u0648\u0628 \u0623\u0641\u0631\u064A\u0642\u064A', MXN: '\u0628\u064A\u0632\u0648 \u0645\u0643\u0633\u064A\u0643\u064A',
      TWD: '\u062F\u0648\u0644\u0627\u0631 \u062A\u0627\u064A\u0648\u0627\u0646\u064A', DKK: '\u0643\u0631\u0648\u0646\u0629 \u062F\u0646\u0645\u0627\u0631\u0643\u064A\u0629', PLN: '\u0632\u0644\u0648\u062A\u064A \u0628\u0648\u0644\u0646\u062F\u064A',
      THB: '\u0628\u0627\u062A \u062A\u0627\u064A\u0644\u0627\u0646\u062F\u064A', IDR: '\u0631\u0648\u0628\u064A\u0629 \u0625\u0646\u062F\u0648\u0646\u064A\u0633\u064A\u0629', HUF: '\u0641\u0648\u0631\u0646\u062A \u0647\u0646\u063A\u0627\u0631\u064A',
      PHP: '\u0628\u064A\u0632\u0648 \u0641\u0644\u0628\u064A\u0646\u064A', CZK: '\u0643\u0631\u0648\u0646\u0629 \u062A\u0634\u064A\u0643\u064A\u0629', ILS: '\u0634\u064A\u0643\u0644 \u0625\u0633\u0631\u0627\u0626\u064A\u0644\u064A',
      MYR: '\u0631\u064A\u0646\u063A\u064A\u062A \u0645\u0627\u0644\u064A\u0632\u064A', RUB: '\u0631\u0648\u0628\u0644 \u0631\u0648\u0633\u064A', SAR: '\u0631\u064A\u0627\u0644 \u0633\u0639\u0648\u062F\u064A',
      AED: '\u062F\u0631\u0647\u0645 \u0625\u0645\u0627\u0631\u0627\u062A\u064A', TRY: '\u0644\u064A\u0631\u0629 \u062A\u0631\u0643\u064A\u0629', NGN: '\u0646\u064A\u0631\u0629 \u0646\u064A\u062C\u064A\u0631\u064A\u0629',
      QAR: '\u0631\u064A\u0627\u0644 \u0642\u0637\u0631\u064A', RON: '\u0644\u064A\u0648 \u0631\u0648\u0645\u0627\u0646\u064A'
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
  document.getElementById('c-result-label').textContent = `${amount} ${from} → ${to}`;
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

  const t = TRANSLATIONS[currentLang].units;
  const fromLabel = (t && t[from]) || UNITS[currentCategory][from].label;
  const toLabel = (t && t[to]) || UNITS[currentCategory][to].label;

  document.getElementById('u-result').textContent = fmt;
  document.getElementById('u-result-label').textContent =
    `${amount} ${fromLabel} → ${toLabel}`;
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