/**
 * World Clock — Display Engine
 * 世界10都市の現在時刻をリアルタイムで表示する
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 4.3, 5.1
 */

/**
 * @typedef {Object} CityConfig
 * @property {string} id       - DOM ID 生成用スラッグ（例: "tokyo"）
 * @property {string} city     - 都市名（日本語）
 * @property {string} country  - 国名（日本語）
 * @property {string} timezone - IANA タイムゾーン識別子（例: "Asia/Tokyo"）
 */

/**
 * 表示対象の主要10都市定義
 * Requirements: 1.1, 4.3
 * @type {CityConfig[]}
 */
const CITIES = [
  { id: 'tokyo',       city: '東京',        country: '日本',           timezone: 'Asia/Tokyo' },
  { id: 'new-york',    city: 'ニューヨーク', country: 'アメリカ',       timezone: 'America/New_York' },
  { id: 'london',      city: 'ロンドン',     country: 'イギリス',       timezone: 'Europe/London' },
  { id: 'paris',       city: 'パリ',         country: 'フランス',       timezone: 'Europe/Paris' },
  { id: 'dubai',       city: 'ドバイ',       country: 'UAE',            timezone: 'Asia/Dubai' },
  { id: 'singapore',   city: 'シンガポール', country: 'シンガポール',   timezone: 'Asia/Singapore' },
  { id: 'sydney',      city: 'シドニー',     country: 'オーストラリア', timezone: 'Australia/Sydney' },
  { id: 'los-angeles', city: 'ロサンゼルス', country: 'アメリカ',       timezone: 'America/Los_Angeles' },
  { id: 'sao-paulo',   city: 'サンパウロ',   country: 'ブラジル',       timezone: 'America/Sao_Paulo' },
  { id: 'mumbai',      city: 'ムンバイ',     country: 'インド',         timezone: 'Asia/Kolkata' },
];

/**
 * Intl.DateTimeFormat API のサポートチェック
 * Requirements: 1.4
 * @returns {boolean}
 */
function isIntlSupported() {
  return typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat !== 'undefined';
}

/**
 * 指定タイムゾーンで日時をフォーマットして返す
 * Requirements: 1.2, 1.3, 4.3
 * @param {Date} date
 * @param {string} timezone
 * @returns {{ time: string, date: string }}
 */
function formatDateTime(date, timezone) {
  try {
    const timeParts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour:     '2-digit',
      minute:   '2-digit',
      second:   '2-digit',
      hour12:   false,
    }).formatToParts(date);

    const dateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year:     'numeric',
      month:    '2-digit',
      day:      '2-digit',
    }).formatToParts(date);

    const timeMap = Object.fromEntries(timeParts.map(p => [p.type, p.value]));
    const dateMap = Object.fromEntries(dateParts.map(p => [p.type, p.value]));

    return {
      time: `${timeMap.hour}:${timeMap.minute}:${timeMap.second}`,
      date: `${dateMap.year}-${dateMap.month}-${dateMap.day}`,
    };
  } catch (err) {
    console.warn(`formatDateTime: invalid timezone "${timezone}", falling back to UTC.`, err);
    return formatDateTime(date, 'UTC');
  }
}

/**
 * 単一都市の Clock_Card を更新する
 * Requirements: 1.2, 1.3, 2.2, 5.1
 * @param {CityConfig} city
 * @param {Date} now
 */
function updateClock(city, now) {
  try {
    const { time, date } = formatDateTime(now, city.timezone);
    const card = document.getElementById(city.id);
    if (!card) {
      console.warn(`updateClock: element with id "${city.id}" not found.`);
      return;
    }
    const timeEl = card.querySelector('.time-value');
    if (timeEl) timeEl.textContent = time;
    const dateEl = card.querySelector('.date-value');
    if (dateEl) dateEl.textContent = date;
    card.setAttribute('aria-label', `${city.city} 現在時刻 ${time}`);
  } catch (err) {
    console.error(`updateClock: failed to update card for "${city.id}".`, err);
  }
}

/**
 * 全 Clock_Card を一括更新する
 * Requirements: 2.2
 */
function updateAllClocks() {
  const now = new Date();
  CITIES.forEach(city => updateClock(city, now));
}

/**
 * Intl 非対応ブラウザ向けフォールバック
 * Requirements: 1.4
 */
function showFallback() {
  const warning = document.getElementById('tz-warning');
  if (warning) warning.removeAttribute('hidden');
  const now = new Date();
  CITIES.forEach(city => {
    try {
      const { time, date } = formatDateTime(now, 'UTC');
      const card = document.getElementById(city.id);
      if (!card) return;
      const timeEl = card.querySelector('.time-value');
      if (timeEl) timeEl.textContent = time;
      const dateEl = card.querySelector('.date-value');
      if (dateEl) dateEl.textContent = date;
      card.setAttribute('aria-label', `${city.city} 現在時刻 ${time} (UTC)`);
    } catch (err) {
      console.error(`showFallback: failed to update card for "${city.id}".`, err);
    }
  });
}

/**
 * アプリ初期化
 * Requirements: 2.1, 2.2, 2.3
 */
function initClock() {
  if (!isIntlSupported()) {
    showFallback();
    return;
  }
  updateAllClocks();
  setInterval(updateAllClocks, 1000);
}

document.addEventListener('DOMContentLoaded', initClock);

// テスト環境からのアクセス用（Node.js / vitest 環境のみ）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CITIES, isIntlSupported, formatDateTime, updateClock, updateAllClocks, showFallback, initClock };
}
