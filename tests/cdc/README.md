# CDC (Consumer Driven Contract) テスト

このディレクトリには、CoupleplanアプリケーションのAPI契約を検証するConsumer Driven Contract Testing（契約駆動テスト）が含まれています。

## 概要

CDCテストは、APIの契約（期待される入力と出力）を明確に定義し、その契約に基づいてコンシューマー（フロントエンド）とプロバイダー（API）の間の互換性を検証するテスト手法です。

## ディレクトリ構造

```
tests/cdc/
├── README.md                  # このファイル
├── setup.ts                   # CDCテストの共通設定
├── runner.ts                  # テスト実行とレポート生成
├── contracts/                 # API契約定義
│   ├── auth.contracts.ts      # 認証API契約
│   ├── plans.contracts.ts     # プランAPI契約
│   └── profile.contracts.ts   # プロファイルAPI契約
├── msw/                       # MSWベースのテスト
│   ├── auth.msw.test.ts       # 認証APIのMSWテスト
│   ├── plans.msw.test.ts      # プランAPIのMSWテスト
│   └── profile.msw.test.ts    # プロファイルAPIのMSWテスト
├── pact/                      # Pactベースのテスト
│   ├── auth.pact.test.ts      # 認証APIのPactテスト
│   └── pacts/                 # 生成されたPactファイル
└── reports/                   # テストレポート出力先
```

## 使用方法

### 全CDCテスト実行

```bash
npm run test:cdc
```

### MSWテストのみ実行

```bash
npm run test:cdc:msw
```

### Pactテストのみ実行

```bash
npm run test:cdc:pact
```

### 個別テストファイル実行

```bash
# 認証APIのMSWテスト
npx jest tests/cdc/msw/auth.msw.test.ts

# プランAPIのMSWテスト
npx jest tests/cdc/msw/plans.msw.test.ts
```

## テストの種類

### 1. MSW（Mock Service Worker）ベースのテスト

- **目的**: API契約の形式と一貫性を検証
- **特徴**:
  - 軽量で高速
  - レスポンス形式の検証に重点
  - CI/CDパイプラインでの継続的な実行に適している

### 2. Pactベースのテスト

- **目的**: Consumer-Provider間の契約を厳密に検証
- **特徴**:
  - より厳密な契約検証
  - Pactファイルの生成と共有
  - プロバイダー側での契約検証が可能

## API契約の構造

各API契約は以下の要素を含みます：

```typescript
interface APIContract {
  endpoint: string; // APIエンドポイント
  method: string; // HTTPメソッド
  request?: {
    // リクエスト仕様
    headers?: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
  };
  response: {
    // レスポンス仕様
    status: number;
    headers?: Record<string, string>;
    body?: any;
  };
  description: string; // 契約の説明
}
```

## 定義済み契約

### 認証API (`auth.contracts.ts`)

- ログイン成功・失敗
- サインアップ
- パスワードリセット
- 各種エラーハンドリング

### プランAPI (`plans.contracts.ts`)

- プラン一覧取得
- プラン作成（成功・失敗）
- 特定プラン取得
- 認証エラー処理

### プロファイルAPI (`profile.contracts.ts`)

- プロファイル取得・更新
- 他ユーザープロファイル取得
- 認証エラー処理

## レポート

テスト実行後、以下のレポートが生成されます：

- **JSONレポート**: `tests/cdc/reports/cdc-report-[timestamp].json`
- **HTMLレポート**: `tests/cdc/reports/cdc-report-[timestamp].html`

レポートには以下の情報が含まれます：

- 総契約数と検証済み契約数
- テスト成功・失敗数
- カバレッジ率
- 詳細なテスト結果

## 契約の追加・更新

### 新しい契約の追加

1. 対応する`contracts/`ファイルに契約を定義
2. `msw/`ディレクトリにMSWテストを追加
3. 必要に応じて`pact/`ディレクトリにPactテストを追加

### 契約の更新

1. 契約定義を更新
2. 対応するテストを更新
3. テストを実行して検証

## ベストプラクティス

### 契約定義

- **明確な説明**: 各契約には分かりやすい説明を付ける
- **実際のデータ**: テストデータは実際の使用例に近いものを使用
- **エラーケース**: 正常系だけでなく異常系も網羅

### テスト作成

- **独立性**: 各テストは他のテストに依存しない
- **一貫性**: レスポンス形式の一貫性を検証
- **包括性**: すべてのAPIエンドポイントをカバー

### メンテナンス

- **定期実行**: CI/CDパイプラインでの定期実行
- **契約更新**: API変更時は契約定義も併せて更新
- **レポート確認**: 定期的にレポートを確認してカバレッジを維持

## トラブルシューティング

### よくある問題

1. **テスト失敗**: 契約定義とAPIの実装が一致しているか確認
2. **型エラー**: TypeScript型定義が最新か確認
3. **MSWエラー**: MSWハンドラーが正しく設定されているか確認

### デバッグ

```bash
# 詳細なログでテスト実行
npx jest tests/cdc/msw --verbose

# 特定のテストのみ実行
npx jest tests/cdc/msw/auth.msw.test.ts --verbose
```

## 今後の拡張

- より多くのAPIエンドポイントの契約追加
- Pactテストの完全実装
- 契約バージョニングシステム
- 自動契約生成ツール
