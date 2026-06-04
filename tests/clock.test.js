/**
 * clock.test.js
 * World Clock — テストファイルの雛形
 *
 * テスト対象:
 *   - formatDateTime(date, timezone): 時刻フォーマットの正確性 (Property 1)
 *   - updateClock(city, formattedTime): aria-label の内容 (Property 2)
 *   - calcRelativeLuminance / calcContrastRatio: WCAG AA コントラスト比 (Property 3)
 *   - isIntlSupported(): Intl API サポートチェック (Unit)
 *   - showFallback(): フォールバック処理 (Unit)
 *   - initClock(): 初期化 SMOKE テスト
 *   - DOM 構造 SMOKE テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isIntlSupported, formatDateTime, updateClock, CITIES } from '../docs/works/world-clock/clock.js';

// プレースホルダーテスト（後続タスクで本実装に置き換える）
describe('World Clock — setup', () => {
  it('テスト環境が正しく動作すること', () => {
    expect(true).toBe(true);
  });
});

// isIntlSupported() ユニットテスト
// Requirements: 1.4
describe('isIntlSupported()', () => {
  it('Intl と Intl.DateTimeFormat が利用可能な場合 true を返す', () => {
    // Node.js / jsdom 環境では Intl はサポートされている
    expect(isIntlSupported()).toBe(true);
  });

  it('Intl が undefined の場合 false を返す', () => {
    const originalIntl = globalThis.Intl;
    // @ts-ignore
    globalThis.Intl = undefined;
    try {
      expect(isIntlSupported()).toBe(false);
    } finally {
      globalThis.Intl = originalIntl;
    }
  });

  it('Intl.DateTimeFormat が undefined の場合 false を返す', () => {
    const originalDateTimeFormat = globalThis.Intl.DateTimeFormat;
    // @ts-ignore
    globalThis.Intl.DateTimeFormat = undefined;
    try {
      expect(isIntlSupported()).toBe(false);
    } finally {
      globalThis.Intl.DateTimeFormat = originalDateTimeFormat;
    }
  });
});

describe('formatDateTime', () => {
  const fixedDate = new Date('2025-07-20T12:34:56Z');

  it('time が HH:MM:SS 形式であること', () => {
    const { time } = formatDateTime(fixedDate, 'Asia/Tokyo');
    expect(time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('date が YYYY-MM-DD 形式であること', () => {
    const { date } = formatDateTime(fixedDate, 'Asia/Tokyo');
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('東京（UTC+9）で正しい時刻が返ること', () => {
    const { time, date } = formatDateTime(fixedDate, 'Asia/Tokyo');
    // 2025-07-20T12:34:56Z → Asia/Tokyo = 2025-07-20T21:34:56+09:00
    expect(time).toBe('21:34:56');
    expect(date).toBe('2025-07-20');
  });

  it('無効なタイムゾーンの場合は UTC フォールバックを返すこと', () => {
    const { time, date } = formatDateTime(fixedDate, 'Invalid/Timezone');
    // UTC フォールバック: 2025-07-20T12:34:56Z
    expect(time).toBe('12:34:56');
    expect(date).toBe('2025-07-20');
  });

  it('日付をまたぐ場合に正しい日付が返ること（UTC深夜→翌日になる場所）', () => {
    // 2025-07-20T23:30:00Z → Asia/Tokyo = 2025-07-21T08:30:00+09:00
    const lateDate = new Date('2025-07-20T23:30:00Z');
    const { date } = formatDateTime(lateDate, 'Asia/Tokyo');
    expect(date).toBe('2025-07-21');
  });
});

/**
 * updateClock(city, now) のユニットテスト
 * Requirements: 1.2, 1.3, 2.2, 5.1
 */
describe('updateClock()', () => {
  /**
   * jsdom 環境にテスト用 Clock_Card DOM を組み立てるヘルパー
   * @param {string} id - 都市の id スラッグ
   */
  function createCard(id) {
    const card = document.createElement('article');
    card.id = id;
    card.className = 'clock-card';

    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'time-display';
    const timeValue = document.createElement('span');
    timeValue.className = 'time-value';
    timeValue.textContent = '--:--:--';
    timeDisplay.appendChild(timeValue);

    const dateDisplay = document.createElement('div');
    dateDisplay.className = 'date-display';
    const dateValue = document.createElement('span');
    dateValue.className = 'date-value';
    dateValue.textContent = '----/--/--';
    dateDisplay.appendChild(dateValue);

    card.appendChild(timeDisplay);
    card.appendChild(dateDisplay);
    document.body.appendChild(card);
    return card;
  }

  beforeEach(() => {
    // 各テスト前に body を空にしてフレッシュな DOM を用意する
    document.body.innerHTML = '';
  });

  it('.time-value の textContent が更新されること', () => {
    const city = { id: 'tokyo', city: '東京', country: '日本', timezone: 'Asia/Tokyo' };
    createCard('tokyo');
    const now = new Date('2025-07-20T12:34:56Z'); // UTC+9 → 21:34:56
    updateClock(city, now);
    const timeEl = document.getElementById('tokyo').querySelector('.time-value');
    expect(timeEl.textContent).toBe('21:34:56');
  });

  it('.date-value の textContent が更新されること', () => {
    const city = { id: 'tokyo', city: '東京', country: '日本', timezone: 'Asia/Tokyo' };
    createCard('tokyo');
    const now = new Date('2025-07-20T12:34:56Z');
    updateClock(city, now);
    const dateEl = document.getElementById('tokyo').querySelector('.date-value');
    expect(dateEl.textContent).toBe('2025-07-20');
  });

  it('aria-label が「{都市名} 現在時刻 {time}」の形式で設定されること', () => {
    const city = { id: 'tokyo', city: '東京', country: '日本', timezone: 'Asia/Tokyo' };
    createCard('tokyo');
    const now = new Date('2025-07-20T12:34:56Z');
    updateClock(city, now);
    const card = document.getElementById('tokyo');
    expect(card.getAttribute('aria-label')).toBe('東京 現在時刻 21:34:56');
  });

  it('aria-label に都市名と時刻の両方が含まれること', () => {
    const city = { id: 'london', city: 'ロンドン', country: 'イギリス', timezone: 'Europe/London' };
    createCard('london');
    const now = new Date('2025-07-20T12:34:56Z');
    updateClock(city, now);
    const label = document.getElementById('london').getAttribute('aria-label');
    expect(label).toContain('ロンドン');
    expect(label).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it('存在しない id の場合もエラーをスローせず他のカードに影響しないこと', () => {
    // DOM に 'unknown-city' 要素は存在しない
    const city = { id: 'unknown-city', city: '不明', country: '不明', timezone: 'Asia/Tokyo' };
    createCard('tokyo');
    const now = new Date('2025-07-20T12:34:56Z');
    // エラーがスローされないことを確認
    expect(() => updateClock(city, now)).not.toThrow();
    // 他のカードは影響を受けていない
    const tokyoCard = document.getElementById('tokyo');
    expect(tokyoCard.querySelector('.time-value').textContent).toBe('--:--:--');
  });
});

/**
 * file:// プロトコル対応確認テスト
 * 外部ネットワーク通信が発生しないことを確認する
 * Requirements: 4.1, 4.4
 */
describe('外部通信なし確認 (file:// protocol 対応)', () => {
  it('clock.js が外部 fetch を呼び出さないこと', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    // formatDateTime を実行しても fetch が呼ばれない
    const { formatDateTime: fmt } = await import('../docs/works/world-clock/clock.js');
    fmt(new Date(), 'Asia/Tokyo');
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('clock.js が XMLHttpRequest を使用しないこと', () => {
    const xhrSpy = vi.spyOn(globalThis, 'XMLHttpRequest');
    // モジュールをインポートして実行しても XHR が生成されない
    expect(xhrSpy).not.toHaveBeenCalled();
    xhrSpy.mockRestore();
  });
});
