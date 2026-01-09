# Minecraft MOD 日本語化パック配布所

Minecraft Forge MODの日本語化リソースパックを配布しています。

## 配布サイト

**https://ykpiece.github.io/minecraft-ja-packs/**

検索・フィルター機能付きで、お探しのMODを簡単に見つけられます。

## 収録パック

- **Minecraft 1.20.1**: 141個
- **Minecraft 1.18.2**: 34個
- **合計**: 175個

## 主な機能

- **リアルタイム検索** - MOD名で即座に絞り込み
- **Mod Loaderフィルター** - Forge/Fabric対応
- **バージョンフィルター** - 1.20.1/1.18.2で絞り込み
- **ページング** - 20個ずつ表示で快適
- **直接ダウンロード** - クリックでzipファイル取得
- **コメント機能** - バグ報告・要望受付

## 対応MOD（一部）

- Applied Energistics 2
- Biome O' Plenty
- Aquamirae
- Alex's Delight
- その他多数...

## ダウンロード方法

1. [配布サイト](https://ykpiece.github.io/minecraft-ja-packs/)にアクセス
2. 検索・フィルターでMODを探す
3. 「⬇️ DL」ボタンをクリック
4. zipファイルをダウンロード

## リソースパックの導入方法

1. ダウンロードしたzipファイルを `.minecraft/resourcepacks` フォルダに配置
2. Minecraftを起動
3. 「設定」→「リソースパック」を開く
4. パックを「使用中」に移動して適用

## 開発・ビルド

このプロジェクトは自動化システムで管理されています。

### 必要なもの

- Node.js 20.x以上
- Git

### セットアップ
```bash
# リポジトリをクローン
git clone https://github.com/ykpiece/minecraft-ja-packs.git
cd minecraft-ja-packs

# 依存関係をインストール
npm install
```

### ビルドコマンド
```bash
# 変更されたファイルのみビルド
npm run build

# すべて強制再ビルド
npm run build -- --force

# 特定バージョンのみ
npm run build:1.20.1
npm run build:1.18.2

# インデックス生成
npm run generate-index
```

## コントリビューション

バグ報告やMOD追加リクエストは、以下の方法で受け付けています：

- [配布サイトのコメント欄](https://ykpiece.github.io/minecraft-ja-packs/#comment)
- [GitHub Issues](https://github.com/ykpiece/minecraft-ja-packs/issues)

## ライセンス

このプロジェクトで配布している日本語化パックは、個人利用・配信・動画投稿すべてOKです。

再配布する場合は、配布元へのリンクをお願いします。

## 作成者

[ykpiece](https://github.com/ykpiece)

## リンク

- 配布サイト: https://ykpiece.github.io/minecraft-ja-packs/
- GitHub: https://github.com/ykpiece/minecraft-ja-packs