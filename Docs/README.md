# CouplePlan ドキュメント

## 📖 ドキュメント一覧

### 🚀 セットアップ・設定

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - 環境構築とGemini API設定の完全ガイド
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - よくある問題と解決方法

### 📐 設計書

基本的な設計書は `design/` フォルダにあります：

- **[ビジネス要件定義書](./design/ビジネス要件定義書.md)** - サービスの全体像と要件
- **[データモデル図](./design/データモデル図.md)** - データベース設計
- **[画面一覧・遷移図](./design/画面一覧・遷移図.md)** - UI/UX設計
- **[認証システム設計書](./design/認証システム設計書.md)** - 認証・認可の詳細
- **[画面-API-データマッピング](./design/画面-API-データマッピング.md)** - 画面とAPIの対応表

### 📚 開発ガイド

- **[開発計画](./design/開発計画.md)** - 開発ロードマップとタスク管理

---

## 🎯 クイックスタート

### 1. 環境構築

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.local.example .env.local
# .env.localを編集してAPIキーを設定
```

### 2. Gemini API設定

詳細は [SETUP_GUIDE.md](./SETUP_GUIDE.md) を参照してください。

**推奨設定**:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_api_key_here
AI_MODEL=gemini-2.5-flash-lite
AI_MAX_TOKENS=2000
```

### 3. データベース設定

```bash
# Supabaseマイグレーション実行
# 詳細は SETUP_GUIDE.md を参照
```

### 4. 開発サーバー起動

```bash
npm run dev
```

---

## 🔧 よくある問題

問題が発生した場合は [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) を確認してください。

### 主な問題

1. **AIレスポンスエラー** → トークン設定を確認
2. **データベースエラー** → マイグレーションを再実行
3. **認証エラー** → Supabase設定を確認

---

## 📊 プロジェクト構成

```
coupleplan/
├── src/                    # ソースコード
│   ├── app/               # Next.js App Router
│   ├── components/        # Reactコンポーネント
│   ├── lib/               # ユーティリティ・サービス
│   └── types/             # TypeScript型定義
├── Docs/                  # ドキュメント（このフォルダ）
│   ├── design/           # 設計書
│   └── archives/         # 古いドキュメント
├── supabase/             # データベースマイグレーション
└── public/               # 静的ファイル
```

---

## 📝 ドキュメントの更新について

ドキュメントを更新する場合は：

1. **SETUP_GUIDE.md** - 設定・セットアップに関する情報
2. **TROUBLESHOOTING.md** - エラー・問題解決に関する情報
3. **design/** - 基本設計の変更

に追記してください。

---

**最終更新**: 2025年10月10日  
**バージョン**: v1.0.0
