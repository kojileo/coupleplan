# Couple Plan

カップル向けのデートプラン共有アプリケーション

[![CI](https://github.com/kojileo/coupleplan/actions/workflows/ci.yml/badge.svg)](https://github.com/kojileo/coupleplan/actions/workflows/ci.yml)

## セットアップ

1. リポジトリのクローン
```bash
git clone https://github.com/yourusername/couple-plan.git
cd couple-plan
```

2. 依存パッケージのインストール
```bash
npm install
```

3. 環境変数の設定
`.env`ファイルを作成:
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-key"
```

4. データベースのセットアップ
```bash
npx prisma generate
npx prisma db push
```

5. 開発サーバーの起動
```bash
npm run dev
```