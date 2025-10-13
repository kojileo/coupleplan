# CouplePlan ドキュメント

## 📖 ドキュメント一覧

### 🚀 セットアップ・設定

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - 環境構築とGemini API設定の完全ガイド
- **[PRODUCTION_SETUP_GUIDE.md](./PRODUCTION_SETUP_GUIDE.md)** - 本番環境セットアップガイド
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - よくある問題と解決方法

### 📐 設計書

基本的な設計書は `design/` フォルダにあります：

- **[ビジネス要件定義書](./design/ビジネス要件定義書.md)** - サービスの全体像と要件
- **[データモデル図](./design/データモデル図.md)** - データベース設計
- **[画面一覧・遷移図](./design/画面一覧・遷移図.md)** - UI/UX設計
- **[認証システム設計書](./design/認証システム設計書.md)** - 認証・認可の詳細

### 🧪 テスト・品質保証

- **[tests/README.md](./tests/README.md)** - E2Eテストガイド
- **[E2E_AUTH_STRATEGY.md](./E2E_AUTH_STRATEGY.md)** - 認証テスト戦略
- **[AUTH_DIRECTORY_HANDLING.md](./AUTH_DIRECTORY_HANDLING.md)** - 認証状態管理
- **[GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)** - GitHub Actions設定

### 📋 プロジェクト管理

- **[作業計画.md](./作業計画.md)** - 開発進捗とタスク管理

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

### 2. データベース・API設定

詳細は [SETUP_GUIDE.md](./SETUP_GUIDE.md) を参照してください。

**必要な設定**:

- Supabase プロジェクト
- Gemini API キー
- データベーススキーマ

### 3. 開発サーバー起動

```bash
npm run dev
```

### 4. E2Eテスト実行（オプション）

```bash
# ローカルでE2Eテストを実行
npx playwright test

# 詳細は tests/README.md を参照
```

---

## 🔧 よくある問題

問題が発生した場合は [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) を確認してください。

### 主な問題

1. **AIレスポンスエラー** → トークン設定を確認
2. **データベースエラー** → `database_setup_complete.sql`を再実行
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
├── tests/                 # テストファイル
│   └── e2e/              # E2Eテスト（Playwright）
├── Docs/                  # ドキュメント（このフォルダ）
│   ├── design/           # 設計書
│   ├── tests/            # テスト関連ドキュメント
│   ├── usecase/          # ユースケース定義
│   └── screens/          # 画面設計書
├── .github/workflows/    # CI/CDワークフロー
├── supabase/             # データベースセットアップ
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

## 🎉 プロジェクト状況

### ✅ 実装完了機能

- **認証システム**: ログイン・サインアップ・セッション管理
- **プロフィール管理**: ユーザー情報編集・管理
- **パートナー連携**: 招待コード・カップル確立
- **AIプラン生成**: Gemini 2.5による自動プラン作成
- **ダッシュボード**: 統合管理画面

### 🧪 品質保証

- **E2Eテスト**: 91%成功率（Playwright）
- **CI/CD**: GitHub Actions完全統合
- **セキュリティ**: 週次スキャン・認証テスト

### 📈 開発状況

- **コア機能**: 100%完了
- **テスト環境**: 完全構築済み
- **本番環境**: デプロイ済み・運用中

---

**最終更新**: 2025年10月13日  
**バージョン**: v3.0.0（E2Eテスト統合版）
