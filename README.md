# kiro-work01

Kiroで作った成果物を公開するポートフォリオリポジトリです。

🌐 **公開URL**: https://you-morita.github.io/kiro-work01/

---

## ディレクトリ構成

```
kiro-work01/
├── docs/                    # GitHub Pages 公開フォルダ（ここだけ公開される）
│   ├── index.html           # ポートフォリオトップページ（成果物一覧）
│   └── works/
│       └── world-clock/     # 成果物①: 世界時計アプリ
│           ├── index.html
│           ├── style.css
│           └── clock.js
├── tests/                   # テストファイル
│   └── clock.test.js
├── .kiro/specs/             # Kiro spec ドキュメント（要件・設計・タスク）
│   └── world-clock/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
├── .gitignore               # node_modules, .env などを除外
├── package.json             # vitest + fast-check（テスト環境）
└── vitest.config.js
```

---

## ブランチ運用

| ブランチ | 役割 |
|---|---|
| `main` | 常に動く安定版。GitHub Pages はここから公開 |
| `develop` | 日常の開発作業はここで行う |

**作業フロー:**
1. `develop` ブランチで開発・commit・push
2. まとまったら `main` にマージ → GitHub Pages が自動更新

---

## 成果物一覧

### 🌍 World Clock
- **URL**: https://you-morita.github.io/kiro-work01/works/world-clock/
- **概要**: 世界10都市（東京・NY・ロンドン・パリ・ドバイ・シンガポール・シドニー・LA・サンパウロ・ムンバイ）の現在時刻をリアルタイム表示
- **技術**: HTML / CSS / JavaScript（外部API不使用、`Intl.DateTimeFormat` で時刻算出）
- **spec**: `.kiro/specs/world-clock/`

---

## テスト実行

```bash
npm install
npm test
```

---

## 次回 Kiro を開くときのために

このリポジトリを開いて「前回の続きをやりたい」と伝えれば、ファイルを見て状況を把握できます。
新しい成果物を作るときは `docs/works/` 配下に追加し、`docs/index.html` にリンクを追記してください。
