// ===========================
// STATE
// ===========================
let rates = {};
let currentCategory = 'length';

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
    status.textContent = 'Rates updated: ' + new Date().toLocaleTimeString();
  } catch (e) {
    status.textContent = 'Offline — using fallback rates.';
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

  ['c-from', 'c-to'].forEach((id, i) => {
    const sel = document.getElementById(id);
    sel.innerHTML = sorted.map(c => `<option value="${c}">${c}</option>`).join('');
    sel.value = i === 0 ? 'USD' : 'EUR';
    createSearchableSelect(sel, sorted, () => convertCurrency());
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
      ${k.charAt(0).toUpperCase() + k.slice(1)}
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

  ['u-from', 'u-to'].forEach((id, i) => {
    const sel = document.getElementById(id);
    sel.innerHTML = keys.map(k => `<option value="${k}">${units[k].label}</option>`).join('');
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
  document.getElementById('u-result-label').textContent =
    `${amount} ${UNITS[currentCategory][from].label} → ${UNITS[currentCategory][to].label}`;
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
function createSearchableSelect(selectEl, options, onChange) {
  selectEl.style.display = 'none';

  const wrap = document.createElement('div');
  wrap.className = 'searchable-select';

  const control = document.createElement('div');
  control.className = 'ss-control';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'ss-input';
  input.placeholder = 'Search currency\u2026';
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
      : options.filter(o => o.toLowerCase().includes(filter.toLowerCase()));

    if (currentOptions.length === 0) {
      dropdown.innerHTML = '<div class="ss-no-results">No results</div>';
      return;
    }

    currentOptions.forEach((opt, i) => {
      const div = document.createElement('div');
      div.className = 'ss-option';
      if (opt === selectEl.value) div.classList.add('selected');
      div.dataset.value = opt;
      div.textContent = opt;
      div.addEventListener('click', () => selectOption(opt));
      dropdown.appendChild(div);
    });
  }

  function selectOption(value) {
    selectEl.value = value;
    input.value = value;
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
    items.forEach((el, i) => el.classList.toggle('highlighted', i === highlightedIndex));
  }

  function highlightPrev() {
    const items = dropdown.querySelectorAll('.ss-option');
    if (!items.length) return;
    if (highlightedIndex > 0) highlightedIndex--;
    items.forEach((el, i) => el.classList.toggle('highlighted', i === highlightedIndex));
  }

  control.addEventListener('click', (e) => {
    if (e.target === arrow || e.target === control) {
      input.focus();
      dropdown.classList.contains('open') ? closeDropdown() : openDropdown();
    }
  });

  input.addEventListener('focus', openDropdown);

  input.addEventListener('input', () => {
    openDropdown();
    highlightedIndex = -1;
  });

  input.addEventListener('keydown', (e) => {
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

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) closeDropdown();
  });

  selectEl._updateSearchable = function () {
    input.value = selectEl.value;
    dropdown.querySelectorAll('.ss-option').forEach(el => {
      el.classList.toggle('selected', el.dataset.value === selectEl.value);
    });
  };

  control.appendChild(input);
  control.appendChild(arrow);
  wrap.appendChild(control);
  wrap.appendChild(dropdown);
  selectEl.parentNode.insertBefore(wrap, selectEl.nextSibling);

  input.value = selectEl.value;

  return wrap;
}

// ===========================
// INIT
// ===========================
buildCatButtons();
populateUnitSelects();
fetchRates();