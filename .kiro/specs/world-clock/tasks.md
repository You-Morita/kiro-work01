# Implementation Plan: World Clock

## Overview

静的Webページとして3ファイル（`index.html` / `style.css` / `clock.js`）を `docs/works/world-clock/` に実装する。JavaScriptの `Date` オブジェクトと `Intl.DateTimeFormat` APIのみを使用し、外部依存なしで世界10都市の現在時刻をリアルタイム表示する。fast-checkによるプロパティベーステストをVitest上で実装する。

---

## Tasks

- [x] 1. プロジェクト構造とテスト環境のセットアップ
  - `docs/works/world-clock/` ディレクトリを作成する
  - `index.html`・`style.css`・`clock.js` の空ファイルを配置する
  - `package.json`（`type: "module"`）、`vitest.config.js`、`jsdom` 環境設定を追加する
  - fast-check と vitest と jsdom を devDependencies としてインストールする
  - `tests/` ディレクトリを作成し、テストファイルの雛形（`clock.test.js`）を配置する
  - _Requirements: 4.1, 4.2_

- [x] 2. `clock.js` — 都市データ定義とコアロジックの実装
  - [x] 2.1 CITIES 定数と CityConfig 型定義を実装する
    - 10都市分の `{ id, city, country, timezone }` オブジェクト配列を定義する
    - IANA タイムゾーン識別子を設計書のタイムゾーン対応表に従って設定する
    - _Requirements: 1.1, 4.3_

  - [x] 2.2 `isIntlSupported()` 関数を実装する
    - `typeof Intl` と `typeof Intl.DateTimeFormat` をチェックして boolean を返す
    - _Requirements: 1.4_

  - [x] 2.3 `formatDateTime(date, timezone)` 関数を実装する
    - `Intl.DateTimeFormat` を使用して `HH:MM:SS` 形式の `time` と `YYYY-MM-DD` 形式の `date` を算出して返す
    - タイムゾーン識別子が無効な場合は try/catch でエラーをキャッチし、UTC フォールバックを返す
    - _Requirements: 1.2, 1.3, 4.3_

  - [ ]* 2.4 Property 1 のプロパティベーステストを実装する
    - **Property 1: 時刻フォーマットの正確性**
    - `fc.date()` と `fc.constantFrom(...CITIES.map(c => c.timezone))` を使用して任意の日付・タイムゾーンに対し `time` が `^\d{2}:\d{2}:\d{2}$`、`date` が `^\d{4}-\d{2}-\d{2}$` に一致することを検証する（numRuns: 100）
    - **Validates: Requirements 1.2, 1.3**

- [x] 3. `index.html` — HTMLマークアップと ARIA 属性の実装
  - [x] 3.1 ページ基本構造を実装する
    - `<html lang="ja">` を設定し、`<header>`・`<main id="clock-grid">`・`<footer>` を作成する
    - `style.css` と `clock.js`（`defer` 属性付き）を参照するリンク・スクリプトタグを追加する
    - `id="tz-warning"` の警告 div（`role="alert"`, `hidden`）を追加する
    - _Requirements: 4.1, 4.2, 5.2_

  - [x] 3.2 10都市分の Clock_Card マークアップを実装する
    - 各 `<article class="clock-card">` に `id`・`aria-label`（初期値：都市名）を付与する
    - `<span class="city-name">`・`<span class="country-name">` を card-header 内に配置する
    - `<div class="time-display" role="timer" aria-live="polite" aria-atomic="true">` と `<span class="time-value">` を配置する
    - `<div class="date-display"><span class="date-value">` を配置する
    - _Requirements: 1.1, 1.3, 5.1, 5.2, 5.3_

- [x] 4. `clock.js` — DOM 更新・タイマー・フォールバック処理の実装
  - [x] 4.1 `updateClock(city, now)` 関数を実装する
    - `formatDateTime` を呼び出して時刻・日付を取得する
    - `document.getElementById(city.id)` で対象カードを取得し、`.time-value` と `.date-value` の `textContent` を更新する
    - `aria-label` 属性を「{都市名} 現在時刻 {time}」の形式で更新する
    - try/catch で個別のカード更新エラーを分離して他のカードに影響しないようにする
    - _Requirements: 1.2, 1.3, 2.2, 5.1_

  - [ ]* 4.2 Property 2 のプロパティベーステストを実装する
    - **Property 2: aria-label には都市名と時刻が含まれる**
    - `fc.constantFrom(...CITIES)` と `fc.string().filter(s => /^\d{2}:\d{2}:\d{2}$/.test(s))` を使用して任意の都市・時刻文字列に対し `aria-label` に都市名と時刻が含まれることを検証する（numRuns: 100）
    - **Validates: Requirements 5.1**

  - [x] 4.3 `updateAllClocks()` 関数を実装する
    - `new Date()` で現在時刻を取得し、`CITIES.forEach` で全都市の `updateClock` を呼び出す
    - _Requirements: 2.2_

  - [x] 4.4 `showFallback()` 関数を実装する
    - `id="tz-warning"` 要素の `hidden` 属性を除去して警告を表示する
    - UTC 時刻を使用して全 Clock_Card の時刻表示を更新する
    - _Requirements: 1.4_

  - [x] 4.5 `initClock()` 関数と `DOMContentLoaded` ハンドラを実装する
    - `isIntlSupported()` を呼び出し、非対応なら `showFallback()` を呼び出す
    - 対応している場合は `updateAllClocks()` を即時呼び出した後、`setInterval(updateAllClocks, 1000)` を開始する
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 5. Checkpoint — コアロジックの動作確認
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. `style.css` — ダークテーマ・レスポンシブレイアウトの実装
  - [x] 6.1 CSS カスタムプロパティとベーススタイルを実装する
    - 設計書の `:root` 変数（`--color-bg`・`--color-surface`・`--color-text-primary`・`--color-accent` 等）を定義する
    - `body` の背景色・テキスト色・フォントを設定する
    - `header`・`footer` のスタイルを実装する
    - _Requirements: 3.2_

  - [x] 6.2 Clock_Card のスタイルを実装する
    - `#clock-grid` を `display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` で実装する
    - `.clock-card` にカード背景色・ボーダー・角丸・パディングを設定する
    - `.time-value` に `font-family: var(--font-mono)` と `font-size: var(--font-time)` を設定する（最小 2rem 保証）
    - `.city-name`・`.country-name`・`.date-value` のフォントサイズとカラーを設定する
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 6.3 レスポンシブレイアウトを実装する
    - `@media` クエリを使用して 320px・640px・960px・1280px のブレークポイントでカラム数を調整する
    - フォントサイズは `clamp()` を使用してビューポートに応じて伸縮させる
    - _Requirements: 3.3_

  - [ ]* 6.4 Property 3 のコントラスト比テストを実装する
    - **Property 3: WCAG AA コントラスト比の保証**
    - WCAG 2.1 相対輝度計算関数 `calcRelativeLuminance(hex)` と `calcContrastRatio(l1, l2)` を実装し、設計書の全色ペア（`--color-text-primary / --color-bg`・`--color-accent / --color-surface`・`--color-text-secondary / --color-surface`）がそれぞれ 4.5:1 以上であることを検証する
    - **Validates: Requirements 5.4**

- [x] 7. ユニットテストと SMOKE テストの実装
  - [x] 7.1 `isIntlSupported()` のユニットテストを実装する
    - Intl 利用可能・不可の各ケースで正しく boolean を返すことを確認する
    - _Requirements: 1.4_

  - [ ]* 7.2 `showFallback()` のユニットテストを実装する
    - 警告メッセージが表示されること（`hidden` 属性除去）と UTC 時刻が表示されることを確認する
    - _Requirements: 1.4_

  - [ ]* 7.3 `initClock()` の SMOKE テストを実装する
    - `setInterval` が 1000ms のインターバルで呼び出されることを確認する（`vi.useFakeTimers()` 使用）
    - _Requirements: 2.1_

  - [ ]* 7.4 DOM 構造の SMOKE テストを実装する
    - ページ読み込み後に `#clock-grid` 内に 10 個の `.clock-card` 要素が存在することを確認する
    - 各カードに `role="timer"`・`aria-live="polite"` 属性が存在することを確認する
    - `lang="ja"` 属性がルート要素に設定されていることを確認する
    - _Requirements: 1.1, 5.2, 5.3_

- [x] 8. GitHub Pages 対応の確認と最終調整
  - [x] 8.1 `file://` プロトコルでの動作を確認するテストを実装する
    - 外部ネットワーク通信が発生しないこと（外部 URL へのフェッチ・スクリプトロードがないこと）を確認する
    - _Requirements: 4.1, 4.4_

  - [x] 8.2 `docs/index.html` に World Clock へのリンクを追加する
    - ポートフォリオトップページから `docs/works/world-clock/index.html` へのリンクを追加・確認する
    - _Requirements: 4.2_

- [x] 9. Final Checkpoint — 全テスト通過確認
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- `*` が付いたサブタスクはオプションです。MVP 優先の場合はスキップ可能ですが、コントラスト比テスト（6.4）はアクセシビリティ品質保証のため実施を推奨します。
- 各タスクは要件トレーサビリティのため具体的な要件番号を参照しています。
- Checkpoint（タスク5・9）で段階的な動作検証を行います。
- プロパティテストは `vitest --run` で単一実行できます（ウォッチモードは使用しないこと）。
- コントラスト比テスト（Property 3）は色が固定値のため fast-check の `arbitrary` は不要で、計算関数の単体テストとして実装します。

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "3.1"] },
    { "id": 2, "tasks": ["2.4", "3.2", "4.1", "6.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4", "6.2", "7.1"] },
    { "id": 4, "tasks": ["4.5", "6.3", "7.2", "7.3"] },
    { "id": 5, "tasks": ["6.4", "7.4", "8.1"] },
    { "id": 6, "tasks": ["8.2"] }
  ]
}
```
