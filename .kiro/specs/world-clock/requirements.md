# Requirements Document

## Introduction

「世界時計（World Clock）」は、世界の主要10か国の現在時刻をデジタル時計形式でリアルタイム表示する静的Webページです。バックエンドや外部APIを一切使用せず、JavaScriptの `Date` オブジェクトとタイムゾーン機能のみで動作します。GitHub Pages で公開されるポートフォリオサイト（`docs/works/world-clock/`）の成果物として配置され、単独の HTML/CSS/JS ファイル群として実装されます。

---

## Glossary

- **World_Clock**: 本フィーチャーで作成するWebページ全体を指す
- **Clock_Card**: 1か国分の時刻情報（都市名・国名・時刻・日付）を表示するUI単位
- **Display_Engine**: JavaScriptの `Date` オブジェクトとタイムゾーンAPIを用いて各都市の現在時刻を算出・更新するモジュール
- **Target_Cities**: 表示対象の主要10都市（東京、ニューヨーク、ロンドン、パリ、ドバイ、シンガポール、シドニー、ロサンゼルス、サンパウロ、ムンバイ）
- **IANA_Timezone**: IANA タイムゾーンデータベースで定義されたタイムゾーン識別子（例：`Asia/Tokyo`）
- **User_Agent**: 本ページを閲覧するエンドユーザーのWebブラウザ

---

## Requirements

### Requirement 1: 世界主要10都市の時刻表示

**User Story:** ポートフォリオ閲覧者として、世界の主要10都市の現在時刻を一覧で確認したい。それにより、異なるタイムゾーンの時間感覚を視覚的に把握できる。

#### Acceptance Criteria

1. THE World_Clock SHALL 東京・ニューヨーク・ロンドン・パリ・ドバイ・シンガポール・シドニー・ロサンゼルス・サンパウロ・ムンバイの10都市に対応する Clock_Card をページ上に表示する
2. WHEN ページが読み込まれたとき、THE Display_Engine SHALL 各 Clock_Card に対応する IANA_Timezone を使用して現在時刻を算出し表示する
3. THE Clock_Card SHALL 都市名・国名・時刻（HH:MM:SS 形式）・日付（YYYY-MM-DD 形式）を表示する
4. IF ブラウザが `Intl.DateTimeFormat` API をサポートしていない場合、THEN THE World_Clock SHALL UTC 時刻を表示し、「タイムゾーン非対応のブラウザです」というメッセージを表示する

---

### Requirement 2: リアルタイム時刻更新

**User Story:** ポートフォリオ閲覧者として、ページをリロードせずに時刻が自動更新されることを期待する。それにより、現在進行中の時刻変化をリアルタイムで確認できる。

#### Acceptance Criteria

1. WHEN ページが読み込まれたとき、THE Display_Engine SHALL 1秒間隔で全 Clock_Card の時刻表示を更新するタイマーを開始する
2. THE Display_Engine SHALL `setInterval` を用いて 1000ms ごとに各 Clock_Card の秒・分・時・日付を再計算して表示を更新する
3. WHILE ページがブラウザのタブ上で非アクティブである間、THE Display_Engine SHALL タイマーを継続して実行し、タブがアクティブに戻った際に正確な時刻を表示できる状態を維持する

---

### Requirement 3: デジタル時計デザインの表示

**User Story:** ポートフォリオ閲覧者として、視覚的に魅力的なデジタル時計UIを確認したい。それにより、デザインスキルをアピールできる成果物として機能する。

#### Acceptance Criteria

1. THE World_Clock SHALL モノスペースフォント（例：`monospace` 系）を用いてデジタル時計らしい外観で時刻を表示する
2. THE World_Clock SHALL ダークテーマ（暗い背景色・明るい文字色）を基調とした配色で Clock_Card を表示する
3. THE World_Clock SHALL レスポンシブレイアウトを採用し、スマートフォン（幅320px以上）からデスクトップ（幅1280px以上）まで視認性を損なわずに表示する
4. THE Clock_Card SHALL 時刻表示部分のフォントサイズを 2rem 以上で表示する

---

### Requirement 4: 静的ファイル構成・GitHub Pages 対応

**User Story:** ポートフォリオオーナーとして、外部サーバやAPIなしで GitHub Pages から配信できる形式で実装したい。それにより、追加インフラコストなしで公開・維持できる。

#### Acceptance Criteria

1. THE World_Clock SHALL `index.html`・`style.css`・`clock.js` の3ファイルのみで構成され、外部CDNや外部APIへの通信を行わない
2. THE World_Clock SHALL `docs/works/world-clock/index.html` をエントリーポイントとして GitHub Pages から正常に表示される
3. THE Display_Engine SHALL `Date` オブジェクトと `Intl.DateTimeFormat` API のみを使用して時刻を算出し、バックエンド通信を必要としない
4. WHEN `index.html` が単独でブラウザから直接開かれた場合（`file://` プロトコル）、THE World_Clock SHALL 正常に時刻を表示する

---

### Requirement 5: アクセシビリティ対応

**User Story:** ポートフォリオ閲覧者として、支援技術（スクリーンリーダー等）を使用していても情報を取得できることを期待する。それにより、アクセシビリティへの配慮をアピールできる。

#### Acceptance Criteria

1. THE World_Clock SHALL 各 Clock_Card に対して `aria-label` 属性を用いて都市名と現在時刻を含む説明文を提供する
2. THE World_Clock SHALL ページ全体に適切な `<html lang="ja">` 属性を設定する
3. THE Clock_Card SHALL 時刻表示部分に `role="timer"` および `aria-live="polite"` 属性を付与し、スクリーンリーダーが時刻更新を通知できるようにする
4. THE World_Clock SHALL テキストと背景のコントラスト比が WCAG 2.1 AA 基準（4.5:1 以上）を満たす配色を使用する
