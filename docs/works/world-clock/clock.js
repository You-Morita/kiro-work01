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
 * IANA タイムゾーン識別子は設計書のタイムゾーン対応表に従って設定
 *
 * Requirements: 1.1, 4.3
 *
 * @type {CityConfig[]}
 */
export const CITIES = [
  { id: 'tokyo',       city: '東京',        country: '日本',          timezone: 'Asia/Tokyo' },
  { id: 'new-york',    city: 'ニューヨーク', country: 'アメリカ',      timezone: 'America/New_York' },
  { id: 'london',      city: 'ロンドン',     country: 'イギリス',      timezone: 'Europe/London' },
  { id: 'paris',       city: 'パリ',         country: 'フランス',      timezone: 'Europe/Paris' },
  { id: 'dubai',       city: 'ドバイ',       country: 'UAE',           timezone: 'Asia/Dubai' },
  { id: 'singapore',   city: 'シンガポール', country: 'シンガポール',  timezone: 'Asia/Singapore' },
  { id: 'sydney',      city: 'シドニー',     country: 'オーストラリア', timezone: 'Australia/Sydney' },
  { id: 'los-angeles', city: 'ロサンゼルス', country: 'アメリカ',      timezone: 'America/Los_Angeles' },
  { id: 'sao-paulo',   city: 'サンパウロ',   country: 'ブラジル',      timezone: 'America/Sao_Paulo' },
  { id: 'mumbai',      city: 'ムンバイ',     country: 'インド',        timezone: 'Asia/Kolkata' },
];

/**
 * 指定タイムゾーンで日時をフォーマットして返す
 *
 * Intl.DateTimeFormat を使用して HH:MM:SS 形式の time と
 * YYYY-MM-DD 形式の date を算出して返す。
 * タイムゾーン識別子が無効な場合は try/catch でエラーをキャッチし、
 * UTC フォールバックを返す。
 *
 * Requirements: 1.2, 1.3, 4.3
 *
 * @param {Date} date         - 対象の Date オブジェクト
 * @param {string} timezone   - IANA タイムゾーン識別子（例: "Asia/Tokyo"）
 * @returns {{ time: string, date: string }} HH:MM:SS と YYYY-MM-DD の文字列
 */
export function formatDateTime(date, timezone) {
  try {
    // 時刻パーツ（HH:MM:SS）を取得するフォーマッター
    const timeParts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour:     '2-digit',
      minute:   '2-digit',
      second:   '2-digit',
      hour12:   false,
    }).formatToParts(date);

    // 日付パーツ（YYYY-MM-DD）を取得するフォーマッター
    const dateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year:     'numeric',
      month:    '2-digit',
      day:      '2-digit',
    }).formatToParts(date);

    // パーツ配列を { type: value } マップに変換
    const timeMap = Object.fromEntries(timeParts.map(p => [p.type, p.value]));
    const dateMap = Object.fromEntries(dateParts.map(p => [p.type, p.value]));

    // en-CA ロケールは YYYY-MM-DD 形式で返すが、念のため明示的に組み立て
    const timeStr = `${timeMap.hour}:${timeMap.minute}:${timeMap.second}`;
    const dateStr = `${dateMap.year}-${dateMap.month}-${dateMap.day}`;

    return { time: timeStr, date: dateStr };
  } catch (err) {
    // 無効なタイムゾーン識別子の場合は UTC フォールバック
    console.warn(`formatDateTime: invalid timezone "${timezone}", falling back to UTC.`, err);
    return formatDateTime(date, 'UTC');
  }
}

/**
 * Intl.DateTimeFormat API のサポートチェック
 * typeof Intl と typeof Intl.DateTimeFormat を確認して boolean を返す
 *
 * Requirements: 1.4
 *
 * @returns {boolean} Intl.DateTimeFormat がサポートされている場合 true
 */
export function isIntlSupported() {
  return typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat !== 'undefined';
}

/**
 * 全 Clock_Card の時刻を現在時刻で一括更新する
 *
 * `new Date()` で現在時刻を取得し、`CITIES.forEach` で各都市の
 * `updateClock` を呼び出して全カードを更新する。
 * `setInterval` から 1000ms ごとに呼び出される。
 *
 * Requirements: 2.2
 */
export function updateAllClocks() {
  const now = new Date();
  CITIES.forEach(city => updateClock(city, now));
}

/**
 * 単一都市の Clock_Card を更新する
 *
 * `formatDateTime` で時刻・日付を算出し、対象の Clock_Card の
 * `.time-value`・`.date-value` の textContent と
 * `aria-label` 属性（「{都市名} 現在時刻 {time}」形式）を更新する。
 * `document.getElementById` が null を返す場合やその他の DOM エラーは
 * try/catch でキャッチして他のカードへの影響を防ぐ。
 *
 * Requirements: 1.2, 1.3, 2.2, 5.1
 *
 * @param {CityConfig} city - 都市設定オブジェクト
 * @param {Date} now        - 現在の Date オブジェクト
 */
export function updateClock(city, now) {
  try {
    const { time, date } = formatDateTime(now, city.timezone);

    const card = document.getElementById(city.id);
    if (!card) {
      console.warn(`updateClock: element with id "${city.id}" not found.`);
      return;
    }

    const timeEl = card.querySelector('.time-value');
    if (timeEl) {
      timeEl.textContent = time;
    }

    const dateEl = card.querySelector('.date-value');
    if (dateEl) {
      dateEl.textContent = date;
    }

    card.setAttribute('aria-label', `${city.city} 現在時刻 ${time}`);
  } catch (err) {
    console.error(`updateClock: failed to update card for "${city.id}".`, err);
  }
}

/**
 * Intl 非対応ブラウザ向けフォールバック処理
 *
 * id="tz-warning" の警告要素を表示し、
 * UTC 時刻で全 Clock_Card を更新する。
 *
 * Requirements: 1.4
 */
export function showFallback() {
  const warning = document.getElementById('tz-warning');
  if (warning) {
    warning.removeAttribute('hidden');
  }
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
 *
 * DOMContentLoaded 後に一度だけ呼ばれる。
 * Intl サポートを確認し、対応していれば updateAllClocks を即時実行後
 * setInterval で 1000ms ごとに更新を続ける。
 * 非対応の場合は showFallback を呼び出す。
 *
 * Requirements: 2.1, 2.2, 2.3
 */
export function initClock() {
  if (!isIntlSupported()) {
    showFallback();
    return;
  }
  updateAllClocks();
  setInterval(updateAllClocks, 1000);
}

document.addEventListener('DOMContentLoaded', initClock);
